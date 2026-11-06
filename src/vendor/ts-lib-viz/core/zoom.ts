/**
 * A zoom read as a domain, over a transform on the geoms.
 *
 * The axis states what is on screen and the geoms keep their size. The build does not re-run.
 */

import type {ReadyFrame} from "./frame.js";
import {innerSize, type AxisSpec, type Edges, type LinearAxisSpec} from "./frame-geometry.js";
import {TRANSFORMS, transformOf, type AxisTransform} from "./transform.js";

/** What a gesture did to the box, in the shape the zoom library reports it. */
export interface ZoomTransform {
	scaleX: number;
	scaleY: number;
	translateX: number;
	translateY: number;
}

/** The transform a figure has before anybody touches it. */
export const AT_REST_ZOOM: ZoomTransform = {scaleX: 1, scaleY: 1, translateX: 0, translateY: 0};

/** Whether a gesture has moved anything. A figure at rest draws what it always drew. */
export const isZoomed = (transform: ZoomTransform): boolean =>
	transform.scaleX !== 1 || transform.scaleY !== 1 || transform.translateX !== 0 || transform.translateY !== 0;

/**
 * Where an axis puts its domain ends inside the gesture's box.
 *
 * The plot area is inset in the panel. Vertically `from` is the foot of the rule.
 */
export interface ZoomRule {
	from: number;
	to: number;
	log?: boolean;
	transform?: AxisTransform;
}

const between = (domain: [number, number], t: number, transform: AxisTransform): number => {
	const {forward, back} = TRANSFORMS[transform];
	const [lo, hi] = [forward(domain[0]), forward(domain[1])];
	if (transform !== "identity" && Number.isFinite(lo) && Number.isFinite(hi)) return back(lo + t * (hi - lo));
	return domain[0] + t * (domain[1] - domain[0]);
};

/**
 * The slice of a domain a transform leaves under the axis.
 *
 * The rule stays where it was drawn. The content slides beneath it in the axis's transformed space.
 */
export function zoomedDomain(
	domain: [number, number],
	rule: ZoomRule,
	scale: number,
	translate: number,
): [number, number] {
	const reach = rule.to - rule.from;
	if (!scale || !reach) return domain;

	const at = (px: number) => between(domain, ((px - translate) / scale - rule.from) / reach, transformOf(rule));

	return [at(rule.from), at(rule.to)];
}

/** Where the plot area falls inside the box a gesture is read against. */
export const plotArea = (width: number, height: number, margin: Edges) => {
	const inner = innerSize(width, height, margin);
	return {
		left: margin.left,
		top: margin.top,
		right: margin.left + inner.width,
		bottom: margin.top + inner.height,
	};
};

type Area = {left: number; top: number; right: number; bottom: number};

/**
 * Closest the view comes.
 *
 * Forty is where a linear axis starts labeling ticks that repeat at the precision the format
 * carries. Past it a reader gains no number they did not already have.
 */
export const MAX_SCALE = 40;

/**
 * One axis of a transform that puts the pixels lo..hi of the current view across start..end.
 *
 * The scale holds between one and `MAX_SCALE`, and the box's center lands on the span's center.
 */
function fitted(scale: number, translate: number, a: number, b: number, start: number, end: number) {
	const lo = (Math.min(a, b) - translate) / scale;
	const hi = (Math.max(a, b) - translate) / scale;
	const next = Math.min(MAX_SCALE, Math.max(1, (end - start) / Math.max(hi - lo, Number.EPSILON)));
	return {scale: next, translate: (start + end) / 2 - (next * (lo + hi)) / 2};
}

/** The transform that fills the plot area with a box dragged over the current view, in the gesture's pixels. */
export function zoomedTo(from: ZoomTransform, box: Area, area: Area): ZoomTransform {
	const x = fitted(from.scaleX, from.translateX, box.left, box.right, area.left, area.right);
	const y = fitted(from.scaleY, from.translateY, box.top, box.bottom, area.top, area.bottom);
	return {scaleX: x.scale, scaleY: y.scale, translateX: x.translate, translateY: y.translate};
}

/** The transform after one step in or out about the plot area's center. */
export function zoomedBy(from: ZoomTransform, factor: number, area: Area): ZoomTransform {
	const cx = (area.left + area.right) / 2;
	const cy = (area.top + area.bottom) / 2;
	return {
		scaleX: from.scaleX * factor,
		scaleY: from.scaleY * factor,
		translateX: cx - (cx - from.translateX) * factor,
		translateY: cy - (cy - from.translateY) * factor,
	};
}

/** The rule an axis runs along, from the pixel its domain starts at. A reversed axis starts at the far end. */
const ruleAlong = (spec: LinearAxisSpec, start: number, end: number): ZoomRule =>
	spec.reverse
		? {from: end, to: start, transform: transformOf(spec)}
		: {from: start, to: end, transform: transformOf(spec)};

/**
 * The domains a transform leaves under the two rules.
 *
 * Each rule takes the margin between the box and its own ends. The vertical one runs the other
 * way.
 */
export function zoomedAxes(
	frame: ReadyFrame,
	transform: ZoomTransform,
	area: {left: number; top: number; right: number; bottom: number},
): {x: AxisSpec; y: AxisSpec} {
	return {
		x:
			"domain" in frame.x
				? {
						...frame.x,
						clamp: false,
						domain: zoomedDomain(
							frame.x.domain,
							ruleAlong(frame.x, area.left, area.right),
							transform.scaleX,
							transform.translateX,
						),
					}
				: frame.x,
		y:
			"domain" in frame.y
				? {
						...frame.y,
						clamp: false,
						domain: zoomedDomain(
							frame.y.domain,
							ruleAlong(frame.y, area.bottom, area.top),
							transform.scaleY,
							transform.translateY,
						),
					}
				: frame.y,
	};
}
