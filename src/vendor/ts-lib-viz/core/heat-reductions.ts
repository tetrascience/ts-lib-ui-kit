/**
 * Two reductions that produce a grid.
 *
 * Both answer in `HeatCell[]`, which the heatmap geom draws. One axis here is a residue position
 * inside a string, or a list of measures.
 */

import type {PlotData, PlotField} from "./plot-data.js";
import type {HeatCell} from "./geom-types.js";

/**
 * Positions an occupancy grid draws.
 *
 * A heavy chain runs past a hundred residues and a grid that wide has columns narrower than their
 * own labels.
 */
export const POSITION_CAP = 40;

/**
 * Residue frequency per position, over a column with a sequence.
 *
 * The fraction is taken per position and the columns are comparable. A short row contributes to
 * the positions it has.
 */
export function occupancyCells(data: PlotData, sequenceId: string): HeatCell[] {
	/** Count per position per residue, and the rows each position was measured over. */
	const counts = new Map<number, Map<string, number>>();
	const measured = new Map<number, number>();

	for (let row = 0; row < data.rowCount; row += 1) {
		const tokens = data.text(row, sequenceId);
		if (tokens == null) continue;
		const width = Math.min(tokens.length, POSITION_CAP);
		for (let at = 0; at < width; at += 1) {
			const residue = tokens[at]!;
			let column = counts.get(at);
			if (!column) {
				column = new Map();
				counts.set(at, column);
			}
			column.set(residue, (column.get(residue) ?? 0) + 1);
			measured.set(at, (measured.get(at) ?? 0) + 1);
		}
	}

	const cells: HeatCell[] = [];
	for (const [at, column] of [...counts.entries()].sort((a, b) => a[0] - b[0])) {
		const total = measured.get(at) ?? 0;
		if (total === 0) continue;
		for (const [residue, count] of column) {
			cells.push({x: String(at + 1), y: residue, value: count / total, n: count});
		}
	}
	return cells;
}

/**
 * Fraction of a category's rows clearing each measure's cut.
 *
 * The cut is the field's target and a measure with none is dropped. A row with no value counts
 * neither way.
 */
export function gateCells(data: PlotData, categoryId: string, measures: PlotField[]): HeatCell[] {
	const gated = measures.filter((measure) => measure.target != null);
	if (gated.length === 0) return [];

	/*
    Per measure, then per category. Nested, and a category is free text -- any separator is a
    character a cluster name can hold.
  */
	const running = new Map<string, Map<string, {passed: number; measured: number}>>();
	for (const measure of gated) running.set(measure.id, new Map());

	for (let row = 0; row < data.rowCount; row += 1) {
		const category = data.text(row, categoryId);
		if (category == null) continue;

		for (const measure of gated) {
			const value = data.number(row, measure.id);
			if (value == null) continue;
			const byCategory = running.get(measure.id)!;
			let cell = byCategory.get(category);
			if (!cell) {
				cell = {passed: 0, measured: 0};
				byCategory.set(category, cell);
			}
			cell.measured += 1;
			const clears = measure.direction === "lower" ? value <= measure.target! : value >= measure.target!;
			if (clears) cell.passed += 1;
		}
	}

	const cells: HeatCell[] = [];
	for (const measure of gated) {
		for (const [category, cell] of running.get(measure.id)!) {
			cells.push({
				x: measure.label,
				y: category,
				value: cell.passed / cell.measured,
				n: cell.measured,
			});
		}
	}
	return cells;
}
