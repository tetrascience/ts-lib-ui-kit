/**
 * Which geoms get a direct label.
 *
 * Chart-design rule 2 is selective and most geoms stay bare. The cap applies to all rules and
 * the footer reports it.
 */

import type {LabelWhen} from "./spec.js";

/** Positions are all a rule reads. A geom's other fields belong to the caller. */
export interface Labeled {
	x: number;
	y: number;
}

/** Maximum labels per frame. */
export const LABEL_CAP = 40;

export interface Chosen {
	/** Positions in the input, in the order the rule ranked them. */
	indices: number[];
	/** Geoms the rule matched beyond the cap. The footer reports this count. */
	dropped: number;
}

/** A placed label's footprint in pixels. */
export interface LabelBox {
	/** Horizontal center, matching the anchor a `Labeled` geom carries. */
	x: number;
	/** Vertical center, on the same convention. */
	y: number;
	width: number;
	height: number;
}

const overlaps = (a: LabelBox, b: LabelBox): boolean =>
	Math.abs(a.x - b.x) * 2 < a.width + b.width && Math.abs(a.y - b.y) * 2 < a.height + b.height;

/**
 * Drops labels that would land on one already placed.
 *
 * Greedy in input order. The first geom keeps its label and a later overlap yields. Callers
 * should pass the rule's ranking.
 */
export function withoutCollisions(boxes: LabelBox[]): number[] {
	const kept: LabelBox[] = [];
	const indices: number[] = [];

	for (let index = 0; index < boxes.length; index += 1) {
		const box = boxes[index]!;
		if (kept.some((placed) => overlaps(placed, box))) continue;
		kept.push(box);
		indices.push(index);
	}

	return indices;
}

export function chooseLabels(points: Labeled[], when: LabelWhen, cap = LABEL_CAP): Chosen {
	if (when.kind === "top") {
		const wanted = Math.max(0, Math.min(when.count, cap));
		const ranked = points
			.map((point, index) => ({index, value: when.on === "x" ? point.x : point.y}))
			.sort((a, b) => (when.end === "high" ? b.value - a.value : a.value - b.value));
		const taken = ranked.slice(0, wanted);
		return {
			indices: taken.map((entry) => entry.index),
			dropped: Math.max(0, Math.min(when.count, points.length) - taken.length),
		};
	}

	const matched: number[] = [];
	for (let index = 0; index < points.length; index += 1) {
		if (when.kind === "all") {
			matched.push(index);
			continue;
		}
		const value = when.on === "x" ? points[index]!.x : points[index]!.y;
		if (when.op === "above" ? value > when.value : value < when.value) matched.push(index);
	}

	return {
		indices: matched.slice(0, cap),
		dropped: Math.max(0, matched.length - cap),
	};
}
