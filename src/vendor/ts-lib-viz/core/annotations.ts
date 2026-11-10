/**
 * What a reader wrote on the chart, and what the chart offers to write.
 *
 * Annotations are saved with the spec. Accepting a suggestion appends it and stops the offer.
 */

import type {Anchor, Annotation} from "./spec.js";

/** Fields with enough to seed an annotation without anybody typing. */
export interface Annotatable {
	id: string;
	label: string;
	unit?: string;
	/** Which way counts as better. Absent where the source declined to guess. */
	direction?: "higher" | "lower";
}

/** Same annotation, ignoring the label somebody may have edited. */
export function sameAnnotation(a: Annotation, b: Annotation): boolean {
	if (a.kind !== b.kind) return false;
	if (a.kind === "axis-end" && b.kind === "axis-end") return a.axis === b.axis && a.end === b.end;
	if (a.kind === "note" && b.kind === "note") return a.text === b.text && a.at.x === b.at.x && a.at.y === b.at.y;
	return false;
}

/**
 * Annotations the plot could write for itself, minus the ones already on it.
 *
 * `axis-end` comes from a measure's direction. The author edits the text.
 */
export function suggest(
	bound: {axis: "x" | "y"; field: Annotatable | undefined}[],
	existing: readonly Annotation[],
): Annotation[] {
	const out: Annotation[] = [];

	for (const {axis, field} of bound) {
		if (!field) continue;

		if (field.direction) {
			const betterEnd = field.direction === "lower" ? "low" : "high";
			out.push({kind: "axis-end", axis, end: betterEnd, text: "better"});
			out.push({kind: "axis-end", axis, end: betterEnd === "low" ? "high" : "low", text: "worse"});
		}
	}

	/*
	  Deduplicated against the plot, and against itself where two candidates agree whole. Two series
	  may bind one measure. Two measures disagreeing about an end offer both captions.
	*/
	const kept: Annotation[] = [];
	for (const candidate of out) {
		if (existing.some((held) => sameAnnotation(held, candidate))) continue;
		if (kept.some((held) => JSON.stringify(held) === JSON.stringify(candidate))) continue;
		kept.push(candidate);
	}
	return kept;
}

/** A short description for a list row. An annotation has no name of its own. */
export function describeAnnotation(annotation: Annotation): string {
	switch (annotation.kind) {
		case "note":
			return annotation.text || "Note";
		case "axis-end":
			return `${annotation.axis.toUpperCase()} ${annotation.end}: ${annotation.text}`;
	}
}

/**
 * A note moved on the chart.
 *
 * The anchor is in data coordinates and a dragged note stays on its point through a zoom. A
 * leader that was there stays there.
 */
export function moveNote(annotations: Annotation[], index: number, at: Anchor, toward?: Anchor): Annotation[] {
	return annotations.map((annotation, position) => {
		if (position !== index || annotation.kind !== "note") return annotation;
		return {
			...annotation,
			at,
			leader: annotation.leader && toward ? {...annotation.leader, toward} : annotation.leader,
		};
	});
}
