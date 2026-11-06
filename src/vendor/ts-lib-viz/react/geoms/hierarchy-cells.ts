/**
 * A hue per group, a fit test for a cell's name, and the scaling both packed layouts run.
 *
 * One hierarchy reaches two components and a reader meeting both in a figure is owed the same
 * grouping and the same treatment of a cell too small to label. Held here instead of in either
 * component, since neither is the other's parent, and out of `/react`'s barrel because a paint
 * decision between two geoms is no part of the published surface.
 */

import {groupsOf, inkOn, textRun, type HierarchyCell} from "../../core/internal.js";

/** Paper-colored stroke between two cells, per chart-design rule 9. */
export const EDGE = 1.5;

/** Room a label needs above and below the baseline before it is written inside a cell. */
const LINE_HEIGHT = 1.6;

/**
 * Picks a hue per cell off the group it draws in.
 *
 * The area or the width carries magnitude. Color names the group off the categorical map, per
 * chart-design rule 8. A stated `fill` paints one hue.
 */
export function hueFor(
	cells: readonly HierarchyCell[],
	identity: (index: number) => string,
	fill?: string,
	levels?: readonly {value: string; code: number}[],
): (cell: HierarchyCell) => string {
	const groups = groupsOf(cells);
	const heads = new Set(groups.values());
	/* Absent levels number the groups largest first, the name breaking a tie. Each layout emits its cells in its own order. */
	const named =
		levels ??
		[
			...new Set(
				cells
					.filter((cell) => heads.has(cell.label))
					.sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
					.map((cell) => cell.label),
			),
		].map((value, code) => ({value, code}));
	const codes = new Map(named.map((level) => [level.value, level.code]));
	return (cell) => {
		if (fill) return fill;
		const code = codes.get(groups.get(cell.label) ?? "");
		return code == null ? UNGROUPED : identity(code);
	};
}

/** Paint for a cell in no group. The root of a single tree is one. */
const UNGROUPED = "var(--viz-rule)";

/** Ink for a name written inside a cell. A cell in no group writes in the page's own ink. */
export const labelInk = (hue: string): string => (hue === UNGROUPED ? "var(--viz-ink)" : inkOn(hue));

/**
 * Answers whether a name and its lines fit inside a cell.
 *
 * A clipped name reads as a different name, so a cell with no room carries none. The estimate is the
 * same `textRun` the margin and the band size read, so a cell and an axis agree about how wide a
 * string runs.
 */
export const fits = (label: string, width: number, height: number, fontSize: number, lines: number): boolean =>
	width > textRun(label.length, fontSize) + EDGE * 2 && height > fontSize * LINE_HEIGHT * lines;

/** One cell in pixels, with the hue it draws in. */
export interface PlacedCell {
	cell: HierarchyCell;
	x: number;
	y: number;
	w: number;
	h: number;
	hue: string;
}

/** Scales the layout's fractions onto a panel, so a resize needs no new layout. */
export const placeCells = (
	cells: HierarchyCell[],
	width: number,
	height: number,
	hue: (cell: HierarchyCell) => string,
): PlacedCell[] =>
	cells.map((cell) => ({
		cell,
		x: cell.x0 * width,
		y: cell.y0 * height,
		w: (cell.x1 - cell.x0) * width,
		h: (cell.y1 - cell.y0) * height,
		hue: hue(cell),
	}));
