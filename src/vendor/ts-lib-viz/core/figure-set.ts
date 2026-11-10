/**
 * A set of figures and the colors they agree on.
 *
 * `assignments` maps a field id to a value to a categorical index. `assign` grows it at the save
 * path.
 */

import {boundsOf} from "./aggregate.js";

export interface SetMember {
	plotId: string;
}

/** Field id, to value, to position in the categorical palette. */
export type Assignments = Record<string, Record<string, number>>;

/**
 * What the figures of a set agree on. A host keeps its own name and id for the set on its own type.
 *
 * `Viz` reads `assignments`, and `critiqueSet` reads `members`.
 */
export interface FigureSet {
	assignments: Assignments;
	/** The members in reading order. The arc checks read this order. Absent is a set with none. */
	members?: readonly SetMember[];
}

/** The first index above everything a field has assigned. */
const nextFree = (pinned: Record<string, number>): number => {
	const held = Object.values(pinned);
	return held.length === 0 ? 0 : boundsOf(held)[1] + 1;
};

/**
 * A field's codes under the set's assignments.
 *
 * A pinned value draws at its pinned index. An unpinned value takes the next index above the
 * pinned ones and gaps stay unfilled.
 */
export function pinnedOver(seen: Map<string, number>, pinned?: Record<string, number>): Map<string, number> {
	if (!pinned || Object.keys(pinned).length === 0) return seen;

	const codes = new Map<string, number>();
	let free = nextFree(pinned);
	for (const value of seen.keys()) {
		const held = pinned[value];
		codes.set(value, held ?? free);
		if (held == null) free += 1;
	}
	for (const [value, index] of Object.entries(pinned)) {
		if (!codes.has(value)) codes.set(value, index);
	}
	return codes;
}

/**
 * The set with any unassigned value of a field given an index.
 *
 * Called at the save path. Returns the set it was handed when there is nothing to add.
 */
export function assign(set: FigureSet, fieldId: string, values: Iterable<string>): FigureSet {
	const pinned = set.assignments[fieldId] ?? {};
	const fresh = [...values].filter((value) => pinned[value] == null);
	if (fresh.length === 0) return set;

	let free = nextFree(pinned);
	const grown = {...pinned};
	for (const value of fresh) {
		if (grown[value] != null) continue;
		grown[value] = free;
		free += 1;
	}
	return {...set, assignments: {...set.assignments, [fieldId]: grown}};
}
