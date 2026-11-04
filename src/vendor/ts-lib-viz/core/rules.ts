/**
 * Reference lines drawn as layers, and where each one crosses the plot area.
 *
 * ggplot's `geom_hline`, `geom_vline` and `geom_abline`. A sloped line reads transformed space.
 */

import {TRANSFORMS, transformOf, type AxisTransform} from "./transform.js";

/** One reference line, in the units its geom reads. */
export type RuleLine =
	| {kind: "h"; y: number; label?: string}
	| {kind: "v"; x: number; label?: string}
	| {kind: "ab"; slope: number; intercept: number; label?: string};

/** A continuous axis as a reference line reads it. A band axis is null. */
export interface RuleAxis {
	domain: [number, number];
	log?: boolean;
	transform?: AxisTransform;
}

/** Where a line crosses the plot area. A horizontal line names its y and a vertical line its x. */
export type RuleSegment = {y: number} | {x: number} | {x0: number; y0: number; x1: number; y1: number};

const ruleOf = (axis: RuleAxis) => TRANSFORMS[transformOf(axis)];
const back = (axis: RuleAxis) => ruleOf(axis).back;

/** A domain in the axis's own transformed space, low end first. Null where a log axis has no positive span. */
function spanOf(axis: RuleAxis): [number, number] | null {
	const [a, b] = axis.domain;
	const {forward} = ruleOf(axis);
	const lo = forward(Math.min(a, b));
	const hi = forward(Math.max(a, b));
	return Number.isFinite(lo) && Number.isFinite(hi) ? [lo, hi] : null;
}

/** Whether a value lies on an axis, in data units. A band axis places each value at its category. */
function onAxis(value: number, axis: RuleAxis | null): boolean {
	if (!axis) return true;
	if (!ruleOf(axis).admits(value)) return false;
	const [a, b] = axis.domain;
	return value >= Math.min(a, b) && value <= Math.max(a, b);
}

/**
 * The part of a line inside the plot area, in data units, or null.
 *
 * A horizontal or vertical line on a band axis marks the category its value names. A sloped line
 * needs continuous axes.
 */
export function ruleSegment(rule: RuleLine, x: RuleAxis | null, y: RuleAxis | null): RuleSegment | null {
	if (rule.kind === "h") return onAxis(rule.y, y) ? {y: rule.y} : null;
	if (rule.kind === "v") return onAxis(rule.x, x) ? {x: rule.x} : null;
	if (!x || !y) return null;

	const across = spanOf(x);
	const down = spanOf(y);
	if (!across || !down) return null;
	const [xa, xb] = across;
	const [ya, yb] = down;
	const {slope, intercept} = rule;
	const at = (tx: number) => intercept + slope * tx;

	/* The stretch of the transformed x run where the line stays between the two vertical ends. */
	let lo = xa;
	let hi = xb;
	if (slope === 0) {
		if (intercept < ya || intercept > yb) return null;
	} else {
		const one = (ya - intercept) / slope;
		const two = (yb - intercept) / slope;
		lo = Math.max(xa, Math.min(one, two));
		hi = Math.min(xb, Math.max(one, two));
		if (lo > hi) return null;
	}

	/* An end on the frame takes the domain's own value. A round trip through the transform would drift it. */
	const [xLo, xHi] = [Math.min(x.domain[0], x.domain[1]), Math.max(x.domain[0], x.domain[1])];
	const [yLo, yHi] = [Math.min(y.domain[0], y.domain[1]), Math.max(y.domain[0], y.domain[1])];
	const near = (a: number, b: number) => Math.abs(a - b) <= 1e-12 * (1 + Math.abs(b));
	const toX = (t: number) => (near(t, xa) ? xLo : near(t, xb) ? xHi : back(x)(t));
	const toY = (t: number) => (near(t, ya) ? yLo : near(t, yb) ? yHi : back(y)(t));
	return {x0: toX(lo), y0: toY(at(lo)), x1: toX(hi), y1: toY(at(hi))};
}
