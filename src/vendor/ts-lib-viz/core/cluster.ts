/**
 * Hierarchical clustering over a grid.
 *
 * Checked against `hclust` and `cutree` on fixed matrices, one check per linkage. The cost floor
 * is quadratic and `kmeans` covers the case above it.
 */

import type {HeatCell} from "./geom-types.js";

/**
 * A grid read as a dense matrix, with the labels each side carries.
 *
 * The distance build reads each pair of rows across their columns. Row-major, and one row is
 * contiguous.
 */
export interface HeatMatrix {
	rows: string[];
	columns: string[];
	/** Row-major, `rows.length` by `columns.length`. */
	values: Float64Array;
}

export type ClusterDistance = "euclidean" | "correlation";

/**
 * The five linkages the merge covers.
 *
 * The reducible ones, which the nearest-neighbor chain needs. `weighted` is R's `mcquitty` and
 * `ward` is R's `ward.D2`.
 */
export type Linkage = "single" | "complete" | "average" | "weighted" | "ward";

/**
 * The merge sequence, lowest join first.
 *
 * A node under `rows.length` is a row and `rows.length + k` is the k-th merge. Each pair puts
 * the lower id first.
 */
export interface Dendrogram {
	merges: [number, number][];
	heights: number[];
}

/**
 * Where a pair falls in the condensed triangle.
 *
 * The upper half without its diagonal, walked by row. R's `dist` uses this order.
 */
export const condensedIndex = (n: number, a: number, b: number): number => {
	const i = a < b ? a : b;
	const j = a < b ? b : a;
	return i * n - (i * (i + 1)) / 2 + j - i - 1;
};

/**
 * The cells read into a matrix. An absent cell takes its row mean.
 *
 * The label orders are arguments. Absent, first-seen stands in. The drawn grid keeps its gap.
 */
export function heatMatrix(cells: HeatCell[], rowOrder?: string[], columnOrder?: string[]): HeatMatrix {
	const rows = rowOrder ? [...rowOrder] : firstSeen(cells, (cell) => cell.y);
	const columns = columnOrder ? [...columnOrder] : firstSeen(cells, (cell) => cell.x);
	const rowAt = new Map(rows.map((label, at) => [label, at]));
	const columnAt = new Map(columns.map((label, at) => [label, at]));

	const width = columns.length;
	const values = new Float64Array(rows.length * width);
	const seen = new Uint8Array(values.length);
	for (const cell of cells) {
		const row = rowAt.get(cell.y);
		const column = columnAt.get(cell.x);
		if (row == null || column == null) continue;
		const at = row * width + column;
		values[at] = cell.value;
		seen[at] = 1;
	}

	for (let row = 0; row < rows.length; row += 1) {
		const base = row * width;
		let sum = 0;
		let count = 0;
		for (let column = 0; column < width; column += 1) {
			if (seen[base + column] === 0) continue;
			sum += values[base + column]!;
			count += 1;
		}
		if (count === width) continue;
		const mean = count > 0 ? sum / count : 0;
		for (let column = 0; column < width; column += 1) {
			if (seen[base + column] === 0) values[base + column] = mean;
		}
	}

	return {rows, columns, values};
}

const firstSeen = (cells: HeatCell[], of: (cell: HeatCell) => string): string[] => {
	const out: string[] = [];
	const seen = new Set<string>();
	for (const cell of cells) {
		const label = of(cell);
		if (seen.has(label)) continue;
		seen.add(label);
		out.push(label);
	}
	return out;
};

/** The matrix on its side, for clustering the columns through the same arithmetic as the rows. */
export function transposed(matrix: HeatMatrix): HeatMatrix {
	const height = matrix.rows.length;
	const width = matrix.columns.length;
	const values = new Float64Array(height * width);
	for (let row = 0; row < height; row += 1) {
		for (let column = 0; column < width; column += 1) {
			values[column * height + row] = matrix.values[row * width + column]!;
		}
	}
	return {rows: matrix.columns, columns: matrix.rows, values};
}

/**
 * The matrix z-scored along one direction. pheatmap's `scale`.
 *
 * Rows come out on one scale in standard deviations. The divisor is n-1, matching R's `scale`.
 */
export function zScored(matrix: HeatMatrix, direction: "row" | "column" | "none"): HeatMatrix {
	if (direction === "none") return {...matrix, values: Float64Array.from(matrix.values)};

	const height = matrix.rows.length;
	const width = matrix.columns.length;
	const values = Float64Array.from(matrix.values);
	const along = direction === "row" ? width : height;
	const count = direction === "row" ? height : width;
	if (along < 2) return {...matrix, values: new Float64Array(values.length)};

	for (let line = 0; line < count; line += 1) {
		const at = (step: number) => (direction === "row" ? line * width + step : step * width + line);

		let sum = 0;
		for (let step = 0; step < along; step += 1) sum += values[at(step)]!;
		const mean = sum / along;

		let squares = 0;
		for (let step = 0; step < along; step += 1) {
			const gap = values[at(step)]! - mean;
			squares += gap * gap;
		}
		const spread = Math.sqrt(squares / (along - 1));

		for (let step = 0; step < along; step += 1) {
			values[at(step)] = spread > 0 ? (values[at(step)]! - mean) / spread : 0;
		}
	}

	return {...matrix, values};
}

/**
 * The condensed distance triangle over the rows.
 *
 * Float32. Both metrics come out of one pass over a norms vector and the dot product. A flat row
 * comes back at 1.
 */
export function condensedDistance(matrix: HeatMatrix, metric: ClusterDistance): Float32Array {
	const n = matrix.rows.length;
	const width = matrix.columns.length;
	const out = new Float32Array((n * (n - 1)) / 2);
	if (n < 2) return out;

	/* Correlation reads off centered rows of unit length, where the dot product is Pearson's r. */
	const values = metric === "correlation" ? unitRows(matrix) : matrix.values;
	const flat = metric === "correlation" ? flatRows(matrix) : null;

	const norms = new Float64Array(n);
	if (metric === "euclidean") {
		for (let row = 0; row < n; row += 1) {
			let squares = 0;
			for (let column = 0; column < width; column += 1) {
				const value = values[row * width + column]!;
				squares += value * value;
			}
			norms[row] = squares;
		}
	}

	for (let i = 0; i < n; i += 1) {
		for (let j = i + 1; j < n; j += 1) {
			let dot = 0;
			for (let column = 0; column < width; column += 1) {
				dot += values[i * width + column]! * values[j * width + column]!;
			}
			const at = condensedIndex(n, i, j);
			if (metric === "euclidean") {
				/* Clamped at zero. Two identical rows can differ by a rounding error here. */
				out[at] = Math.sqrt(Math.max(0, norms[i]! + norms[j]! - 2 * dot));
				continue;
			}
			out[at] = flat![i] === 1 || flat![j] === 1 ? 1 : 1 - dot;
		}
	}

	return out;
}

/** Each row centered and scaled to unit length. A dot product then answers Pearson's r. */
function unitRows(matrix: HeatMatrix): Float64Array {
	const n = matrix.rows.length;
	const width = matrix.columns.length;
	const values = Float64Array.from(matrix.values);
	for (let row = 0; row < n; row += 1) {
		const base = row * width;
		let sum = 0;
		for (let column = 0; column < width; column += 1) sum += values[base + column]!;
		const mean = sum / width;
		let squares = 0;
		for (let column = 0; column < width; column += 1) {
			values[base + column] = values[base + column]! - mean;
			squares += values[base + column]! * values[base + column]!;
		}
		const length = Math.sqrt(squares);
		if (length === 0) continue;
		for (let column = 0; column < width; column += 1) values[base + column] = values[base + column]! / length;
	}
	return values;
}

/** Which rows have no spread. Their correlation with anything is undefined. */
function flatRows(matrix: HeatMatrix): Uint8Array {
	const n = matrix.rows.length;
	const width = matrix.columns.length;
	const flat = new Uint8Array(n);
	for (let row = 0; row < n; row += 1) {
		const base = row * width;
		const first = matrix.values[base]!;
		let same = true;
		for (let column = 1; column < width; column += 1) {
			if (matrix.values[base + column] !== first) {
				same = false;
				break;
			}
		}
		flat[row] = same ? 1 : 0;
	}
	return flat;
}

/** The Lance-Williams update. One merge loop serves five linkages. */
const merged = (
	method: Linkage,
	toX: number,
	toY: number,
	between: number,
	nx: number,
	ny: number,
	ni: number,
): number => {
	switch (method) {
		case "single":
			return Math.min(toX, toY);
		case "complete":
			return Math.max(toX, toY);
		case "average":
			return (nx * toX + ny * toY) / (nx + ny);
		case "weighted":
			return (toX + toY) / 2;
		case "ward":
			return Math.sqrt(((ni + nx) * toX * toX + (ni + ny) * toY * toY - ni * between * between) / (ni + nx + ny));
	}
};

/**
 * The merge sequence, by nearest-neighbor chain.
 *
 * The chain walks nearest neighbors to a mutual pair, merges it, and keeps the rest. The
 * surviving cluster keeps the higher index.
 */
export function cluster(condensed: Float32Array, n: number, method: Linkage): Dendrogram {
	if (n < 2) return {merges: [], heights: []};

	const distances = Float32Array.from(condensed);
	const size = new Int32Array(n).fill(1);
	const chain = new Int32Array(n);
	let held = 0;

	const found: {low: number; high: number; height: number}[] = [];

	for (let round = 0; round < n - 1; round += 1) {
		if (held === 0) {
			held = 1;
			for (let i = 0; i < n; i += 1) {
				if (size[i]! > 0) {
					chain[0] = i;
					break;
				}
			}
		}

		let x = 0;
		let y = 0;
		let closest = Infinity;
		for (;;) {
			x = chain[held - 1]!;
			closest = Infinity;
			/* The previous link wins a tie. The walk stops cycling. */
			if (held > 1) {
				y = chain[held - 2]!;
				closest = distances[condensedIndex(n, x, y)]!;
			}
			for (let i = 0; i < n; i += 1) {
				if (size[i] === 0 || i === x) continue;
				const distance = distances[condensedIndex(n, x, i)]!;
				if (distance < closest) {
					closest = distance;
					y = i;
				}
			}
			if (held > 1 && y === chain[held - 2]) break;
			chain[held] = y;
			held += 1;
		}
		held -= 2;

		const low = Math.min(x, y);
		const high = Math.max(x, y);
		const nx = size[low]!;
		const ny = size[high]!;
		found.push({low, high, height: closest});
		/* The lower index retires and the higher carries the merged cluster. */
		size[low] = 0;
		size[high] = nx + ny;

		for (let i = 0; i < n; i += 1) {
			if (size[i] === 0 || i === high) continue;
			const toLow = distances[condensedIndex(n, i, low)]!;
			const toHigh = distances[condensedIndex(n, i, high)]!;
			distances[condensedIndex(n, i, high)] = merged(method, toLow, toHigh, closest, nx, ny, size[i]!);
		}
	}

	return relabel(found, n);
}

/**
 * The found merges sorted by height and renumbered onto node ids.
 *
 * Sorting by height puts the tree in reading order. Union-find rewrites each pair.
 */
function relabel(found: {low: number; high: number; height: number}[], n: number): Dendrogram {
	const sorted = [...found].sort((a, b) => a.height - b.height);
	const parent = new Int32Array(2 * n - 1);
	for (let at = 0; at < parent.length; at += 1) parent[at] = at;

	const find = (start: number): number => {
		let at = start;
		while (parent[at] !== at) at = parent[at]!;
		let walk = start;
		while (parent[walk] !== at) {
			const next = parent[walk]!;
			parent[walk] = at;
			walk = next;
		}
		return at;
	};

	const merges: [number, number][] = [];
	const heights: number[] = [];
	for (let at = 0; at < sorted.length; at += 1) {
		const entry = sorted[at]!;
		const left = find(entry.low);
		const right = find(entry.high);
		const node = n + at;
		merges.push(left < right ? [left, right] : [right, left]);
		heights.push(entry.height);
		parent[left] = node;
		parent[right] = node;
	}

	return {merges, heights};
}

/** The leaves left to right, as row indices. A pre-order walk from the root, left subtree first. */
function walk(tree: Dendrogram, n: number): number[] {
	if (n === 0) return [];
	const out: number[] = [];
	const stack: number[] = [n + tree.merges.length - 1];
	while (stack.length > 0) {
		const node = stack.pop()!;
		if (node < n) {
			out.push(node);
			continue;
		}
		const [left, right] = tree.merges[node - n]!;
		stack.push(right);
		stack.push(left);
	}
	return out;
}

/**
 * The rows in the order the tree puts them.
 *
 * A pre-order walk taking the left subtree first. R's own leaf walk does the same.
 */
export function leafOrder(tree: Dendrogram, labels: string[]): string[] {
	return walk(tree, labels.length).map((row) => labels[row]!);
}

/**
 * One merge, in the bracket shape a dendrogram draws.
 *
 * The bracket runs from each child's depth to the merge's, then across. Depth is a fraction.
 */
export interface DendrogramBracket {
	/** Where each child sits along the shared axis, in whatever units the caller passed in. */
	from: [number, number];
	/** Each child's own depth. A leaf is at zero. */
	base: [number, number];
	/** The merge's depth. The last merge is at one. */
	depth: number;
	/** Where the merge sits along the shared axis, which is the midpoint of what it joins. */
	at: number;
}

/**
 * How a merge's height becomes the depth it draws at.
 *
 * `height` is the distance over the tallest merge. `sqrt` gives near-leaf merges room. `rank`
 * spaces them evenly.
 */
export type DepthScale = "height" | "sqrt" | "rank";

/**
 * Each merge's depth, in the order the merges are held.
 *
 * Taken over the whole tree at once. A leaf is at zero and the last merge is at one.
 */
function depthsOf(heights: number[], scale: DepthScale): number[] {
	if (scale === "rank") {
		/* Distinct steps. Two merges at one distance draw at one depth. */
		const steps = [...new Set(heights)].sort((a, b) => a - b);
		const place = new Map(steps.map((height, at) => [height, (at + 1) / steps.length]));
		return heights.map((height) => place.get(height)!);
	}

	const tallest = heights.reduce((high, height) => Math.max(high, height), 0);
	if (tallest <= 0) return heights.map(() => 0);
	return heights.map((height) => (scale === "sqrt" ? Math.sqrt(height / tallest) : height / tallest));
}

/**
 * The tree as brackets, against band positions.
 *
 * `along` holds one position per leaf, indexed by leaf id. A merge draws at the midpoint of what
 * it joins.
 */
export function dendrogramBrackets(
	tree: Dendrogram,
	along: number[],
	scale: DepthScale = "height",
): DendrogramBracket[] {
	const n = along.length;
	if (n < 2 || tree.merges.length !== n - 1) return [];

	const depths = depthsOf(tree.heights, scale);

	const center: number[] = [];
	const at = (node: number) => (node < n ? along[node]! : center[node - n]!);
	const base = (node: number) => (node < n ? 0 : depths[node - n]!);

	const out: DendrogramBracket[] = [];
	for (let merge = 0; merge < tree.merges.length; merge += 1) {
		const [left, right] = tree.merges[merge]!;
		const from: [number, number] = [at(left), at(right)];
		center.push((from[0] + from[1]) / 2);
		out.push({from, base: [base(left), base(right)], depth: depths[merge]!, at: center[merge]!});
	}
	return out;
}

/**
 * Which cluster each row falls in, cutting the tree to k. pheatmap's `cutree_rows`.
 *
 * Numbered by first appearance down the rows, matching R's `cutree`.
 */
export function cutClusters(tree: Dendrogram, n: number, k: number): number[] {
	const wanted = Math.max(1, Math.min(k, n));
	const applied = n - wanted;
	const parent = new Int32Array(Math.max(1, 2 * n - 1));
	for (let at = 0; at < parent.length; at += 1) parent[at] = at;

	const find = (start: number): number => {
		let at = start;
		while (parent[at] !== at) at = parent[at]!;
		return at;
	};

	for (let m = 0; m < applied; m += 1) {
		const [left, right] = tree.merges[m]!;
		const node = n + m;
		parent[find(left)] = node;
		parent[find(right)] = node;
	}

	const label = new Map<number, number>();
	const out: number[] = [];
	for (let row = 0; row < n; row += 1) {
		const root = find(row);
		if (!label.has(root)) label.set(root, label.size);
		out.push(label.get(root)!);
	}
	return out;
}

/**
 * Where the cut falls in the leaf order, as the positions a break comes before.
 *
 * A cut gives blocks contiguous in the leaf order. k clusters give k-1 breaks.
 */
export function cutBoundaries(tree: Dendrogram, n: number, k: number): number[] {
	const clusters = cutClusters(tree, n, k);
	const order = walk(tree, n);
	const breaks: number[] = [];
	for (let at = 1; at < order.length; at += 1) {
		if (clusters[order[at]!] !== clusters[order[at - 1]!]) breaks.push(at);
	}
	return breaks;
}

/**
 * The cells z-scored along one direction, under pheatmap's `scale`.
 *
 * Only the cells that were there come back. A gap stays a gap.
 */
export function scaledCells(cells: HeatCell[], direction: "row" | "column" | "none"): HeatCell[] {
	if (direction === "none" || cells.length === 0) return cells;
	const matrix = heatMatrix(cells);
	const z = zScored(matrix, direction);
	const rowAt = new Map(matrix.rows.map((label, at) => [label, at]));
	const columnAt = new Map(matrix.columns.map((label, at) => [label, at]));
	const width = matrix.columns.length;
	return cells.map((cell) => ({
		...cell,
		value: z.values[rowAt.get(cell.y)! * width + columnAt.get(cell.x)!]!,
	}));
}

/** Rows aggregated into k centroids, with which centroid each row went to. */
export interface Reduced {
	/** Centroid index per row of the matrix given. */
	assignment: number[];
	centroids: HeatMatrix;
}

/**
 * Rows aggregated into k centroids by k-means. pheatmap's `kmeans_k`.
 *
 * The escape past the cluster cap, linear in the row count. Seeding is farthest-first.
 */
export function kmeansRows(matrix: HeatMatrix, k: number): Reduced {
	const n = matrix.rows.length;
	const width = matrix.columns.length;
	const wanted = Math.max(1, Math.min(k, n));

	const centers = new Float64Array(wanted * width);
	const seeds = farthestFirst(matrix, wanted);
	for (let at = 0; at < wanted; at += 1) {
		for (let column = 0; column < width; column += 1) {
			centers[at * width + column] = matrix.values[seeds[at]! * width + column]!;
		}
	}

	const assignment = new Array<number>(n).fill(0);
	const ROUNDS = 50;
	for (let round = 0; round < ROUNDS; round += 1) {
		let moved = false;
		for (let row = 0; row < n; row += 1) {
			let best = 0;
			let closest = Infinity;
			for (let at = 0; at < wanted; at += 1) {
				let squares = 0;
				for (let column = 0; column < width; column += 1) {
					const gap = matrix.values[row * width + column]! - centers[at * width + column]!;
					squares += gap * gap;
				}
				if (squares < closest) {
					closest = squares;
					best = at;
				}
			}
			if (assignment[row] !== best) {
				assignment[row] = best;
				moved = true;
			}
		}

		/*
      An emptied centroid takes the row furthest from its own. k clusters stay k.
    */
		fillEmpty(matrix, assignment, wanted, centers);

		recenter(matrix, assignment, wanted, centers);
		if (!moved) break;
	}

	const held = new Array<number>(wanted).fill(0);
	for (const at of assignment) held[at] += 1;

	return {
		assignment,
		centroids: {
			rows: held.map((count, at) => `Cluster ${at + 1} (${count} ${count === 1 ? "row" : "rows"})`),
			columns: [...matrix.columns],
			values: centers,
		},
	};
}

/** Seeds spread across the grid: the row furthest from the mean, then furthest from what is chosen. */
function farthestFirst(matrix: HeatMatrix, k: number): number[] {
	const n = matrix.rows.length;
	const width = matrix.columns.length;
	const mean = new Float64Array(width);
	for (let row = 0; row < n; row += 1) {
		for (let column = 0; column < width; column += 1) mean[column] += matrix.values[row * width + column]! / n;
	}

	const gapTo = (row: number, point: Float64Array, offset: number) => {
		let squares = 0;
		for (let column = 0; column < width; column += 1) {
			const gap = matrix.values[row * width + column]! - point[offset + column]!;
			squares += gap * gap;
		}
		return squares;
	};

	const nearest = new Float64Array(n).fill(Infinity);
	const seeds: number[] = [];
	let first = 0;
	let furthest = -1;
	for (let row = 0; row < n; row += 1) {
		const distance = gapTo(row, mean, 0);
		if (distance > furthest) {
			furthest = distance;
			first = row;
		}
	}
	seeds.push(first);

	while (seeds.length < k) {
		const last = seeds[seeds.length - 1]!;
		let pick = 0;
		let best = -1;
		for (let row = 0; row < n; row += 1) {
			nearest[row] = Math.min(nearest[row]!, gapTo(row, matrix.values as Float64Array, last * width));
			if (nearest[row]! > best) {
				best = nearest[row]!;
				pick = row;
			}
		}
		seeds.push(pick);
		nearest[pick] = -1;
	}
	return seeds;
}

/** Each centroid moved onto the mean of what it holds. */
function recenter(matrix: HeatMatrix, assignment: number[], k: number, centers: Float64Array): void {
	const width = matrix.columns.length;
	const held = new Int32Array(k);
	centers.fill(0);
	for (let row = 0; row < assignment.length; row += 1) {
		const at = assignment[row]!;
		held[at] += 1;
		for (let column = 0; column < width; column += 1) {
			centers[at * width + column] += matrix.values[row * width + column]!;
		}
	}
	for (let at = 0; at < k; at += 1) {
		if (held[at] === 0) continue;
		for (let column = 0; column < width; column += 1) centers[at * width + column] /= held[at]!;
	}
}

/** An empty centroid claims the row furthest from the one holding it. */
function fillEmpty(matrix: HeatMatrix, assignment: number[], k: number, centers: Float64Array): void {
	const width = matrix.columns.length;
	const held = new Int32Array(k);
	for (const at of assignment) held[at] += 1;

	for (let at = 0; at < k; at += 1) {
		if (held[at] > 0) continue;
		let pick = -1;
		let furthest = -1;
		for (let row = 0; row < assignment.length; row += 1) {
			const owner = assignment[row]!;
			if (held[owner] < 2) continue;
			let squares = 0;
			for (let column = 0; column < width; column += 1) {
				const gap = matrix.values[row * width + column]! - centers[owner * width + column]!;
				squares += gap * gap;
			}
			if (squares > furthest) {
				furthest = squares;
				pick = row;
			}
		}
		if (pick < 0) continue;
		held[assignment[pick]!] -= 1;
		assignment[pick] = at;
		held[at] += 1;
	}
}
