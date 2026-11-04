/**
 * An author's order resolved onto a band.
 *
 * The permutation makes a clustered heatmap's blocks visible. The matrix arrives as a thunk and
 * most bands resolve without the cells.
 */

import {
	cluster,
	condensedDistance,
	cutBoundaries,
	heatMatrix,
	kmeansRows,
	leafOrder,
	type Dendrogram,
	type HeatMatrix,
} from "./cluster.js";
import type {HeatCell} from "./geom-types.js";
import type {BandOrder} from "./spec.js";

/**
 * Rows a clustered band draws.
 *
 * At four pixels a row, 256 rows is a figure a thousand pixels tall. `kmeans` is the way past
 * that.
 */
export const CLUSTER_CAP = 256;

/**
 * A tree and the labels its leaf ids point at.
 *
 * A leaf id indexes the labels the clustering saw, which is the build order.
 */
export interface ClusterTree {
	tree: Dendrogram;
	labels: string[];
}

/** What the band draws, and what the cap refused on the way. */
export interface OrderedBand {
	values: string[];
	/** Break positions, each the index in `values` the break falls before. */
	gaps: number[];
	/**
	 * The tree the order came out of, where one was built.
	 *
	 * A dendrogram is a picture of these merges. Absent on a stated list or a refused cap.
	 */
	clustered?: ClusterTree;
	/** Set where a cluster order was asked for and the cap refused it. */
	refused?: {rows: number; cap: number};
	/**
	 * Set where `kmeans` replaced the rows with centroids.
	 *
	 * The caller rewrites the cells to match. The band names centroids the table has no rows for.
	 */
	reduced?: {of: string; to: string}[];
}

const held = (values: string[], within: Set<string>) => values.filter((value) => within.has(value));

/**
 * The order the band takes, with its breaks.
 *
 * `values` is the build order and the result permutes it. A stated list naming a category the
 * data lacks skips that name.
 */
export function orderBand(
	order: BandOrder | undefined,
	values: string[],
	matrixOf: () => HeatMatrix | null,
): OrderedBand {
	if (!order) return {values, gaps: []};

	if (order.kind === "list") {
		const asked = new Set(values);
		/* A name written twice takes one slot. A second slot would draw the band's row twice. */
		const taken = held([...new Set(order.values)], asked);
		const seen = new Set(taken);
		/* A category the list left out keeps its slot at the end. A partial list is still an order. */
		const out = [...taken, ...values.filter((value) => !seen.has(value))];
		return {
			values: out,
			/* A break past the last slot draws at no boundary. One at zero draws outside the band. */
			gaps: [...new Set(order.gaps ?? [])].filter((at) => at > 0 && at < out.length).sort((a, b) => a - b),
		};
	}

	if (values.length < 2) return {values, gaps: []};

	if (values.length > CLUSTER_CAP && !order.kmeans) {
		return {values, gaps: [], refused: {rows: values.length, cap: CLUSTER_CAP}};
	}

	const matrix = matrixOf();
	if (!matrix || matrix.rows.length < 2 || matrix.columns.length === 0) return {values, gaps: []};

	const reduced = order.kmeans ? kmeansRows(matrix, order.kmeans) : null;
	const clustered = reduced ? reduced.centroids : matrix;
	if (clustered.rows.length > CLUSTER_CAP) {
		return {values, gaps: [], refused: {rows: clustered.rows.length, cap: CLUSTER_CAP}};
	}

	const distances = condensedDistance(clustered, order.distance ?? "euclidean");
	const tree = cluster(distances, clustered.rows.length, order.method ?? "complete");

	return {
		values: leafOrder(tree, clustered.rows),
		gaps: order.cut ? cutBoundaries(tree, clustered.rows.length, order.cut) : [],
		clustered: {tree, labels: clustered.rows},
		reduced: reduced
			? matrix.rows.map((row, at) => ({of: row, to: reduced.centroids.rows[reduced.assignment[at]!]!}))
			: undefined,
	};
}

/**
 * Bands an order leaves the axis with.
 *
 * A kmeans order names its centroids. Eight centroids over four hundred rows is eight bands.
 */
export const bandsUnder = (order: BandOrder | undefined, count: number): number =>
	order?.kind === "cluster" && order.kmeans ? Math.min(order.kmeans, count) : count;

/**
 * Breaks an order asks for, answerable without building anything.
 *
 * The content-fit sum runs before the frame exists. k clusters make k-1 boundaries. A refused
 * band asks for no room.
 */
export function breakCount(order: BandOrder | undefined, bands: number): number {
	if (!order) return 0;
	if (order.kind === "list") {
		return [...new Set(order.gaps ?? [])].filter((at) => at > 0 && at < bands).length;
	}
	/* A kmeans order clusters its centroids and the cap applies to those. `orderBand` reads it
	   the same way. The count comes out of `bandsUnder` here too. */
	const under = bandsUnder(order, bands);
	if (under > CLUSTER_CAP) return 0;
	return order.cut ? Math.max(0, Math.min(order.cut, under) - 1) : 0;
}

/**
 * The cells rewritten onto a kmeans order's centroids.
 *
 * The band names clusters the table has no rows for and a cell is the cluster mean.
 */
export function reducedCells(cells: HeatCell[], reduced: {of: string; to: string}[], along: "y" | "x"): HeatCell[] {
	const to = new Map(reduced.map((entry) => [entry.of, entry.to]));

	/*
    Nested, the way `gateCells` does it. A category is free text and any separator is a character
    a cluster name can hold.
  */
	const running = new Map<string, Map<string, {sum: number; count: number; n: number}>>();

	for (const cell of cells) {
		const moved = to.get(cell[along]);
		if (moved == null) continue;
		const x = along === "y" ? cell.x : moved;
		const y = along === "y" ? moved : cell.y;
		let row = running.get(y);
		if (!row) {
			row = new Map();
			running.set(y, row);
		}
		const entry = row.get(x) ?? {sum: 0, count: 0, n: 0};
		entry.sum += cell.value;
		entry.count += 1;
		entry.n += cell.n;
		row.set(x, entry);
	}

	const out: HeatCell[] = [];
	for (const [y, row] of running) {
		for (const [x, entry] of row) out.push({x, y, value: entry.sum / entry.count, n: entry.n});
	}
	return out;
}

/**
 * The matrix a band clusters over, built from the traces' own cells.
 *
 * One matrix per axis. The caller states both label orders.
 */
export function matrixFor(cells: HeatCell[], rows: string[], columns: string[]): HeatMatrix | null {
	if (cells.length === 0 || rows.length === 0 || columns.length === 0) return null;
	return heatMatrix(cells, rows, columns);
}
