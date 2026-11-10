/**
 * Density -- geoms binned into a grid. The drawn count follows the pixels.
 *
 * One cell per device pixel. A cell cannot be hovered for its record. The grid accumulates.
 */

export interface DensityGrid {
	width: number;
	height: number;
	/** One count per cell, row-major from the low corner of the domain. */
	counts: Uint32Array;
	/** Rows binned to date, in-domain only. */
	binned: number;
}

export function densityGrid(width: number, height: number): DensityGrid {
	return {width, height, counts: new Uint32Array(width * height), binned: 0};
}

/**
 * Bins a batch of points into the grid and returns how many landed inside the domain.
 *
 * A point on the domain's top edge belongs to the last cell.
 */
export function binPoints(
	grid: DensityGrid,
	xs: ArrayLike<number>,
	ys: ArrayLike<number>,
	xDomain: [number, number],
	yDomain: [number, number],
	count = Math.min(xs.length, ys.length),
): number {
	const {width, height, counts} = grid;
	const xSpan = xDomain[1] - xDomain[0] || 1;
	const ySpan = yDomain[1] - yDomain[0] || 1;
	const xScale = width / xSpan;
	const yScale = height / ySpan;

	let landed = 0;
	for (let i = 0; i < count; i += 1) {
		const x = xs[i]!;
		const y = ys[i]!;
		/* The domain test runs before the cell index. `|0` truncates toward zero and a reading
		   below the domain would land in cell zero. NaN slips the comparisons. */
		if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
		if (x < xDomain[0] || x > xDomain[1] || y < yDomain[0] || y > yDomain[1]) continue;
		let gx = ((x - xDomain[0]) * xScale) | 0;
		let gy = ((y - yDomain[0]) * yScale) | 0;
		if (gx === width) gx = width - 1;
		if (gy === height) gy = height - 1;
		counts[gy * width + gx]! += 1;
		landed += 1;
	}
	grid.binned += landed;
	return landed;
}

/** Sums a shard's counts into the whole, for grids binned in parallel over one domain. */
export function mergeGrids(into: DensityGrid, from: DensityGrid): void {
	if (into.width !== from.width || into.height !== from.height) {
		throw new Error("ts-lib-viz: grids of different shapes cannot merge");
	}
	for (let cell = 0; cell < into.counts.length; cell += 1) {
		into.counts[cell]! += from.counts[cell]!;
	}
	into.binned += from.binned;
}

export interface DensityCells {
	/** Cell centers in data space. The cells draw through an ordinary geom. */
	xs: Float64Array;
	ys: Float64Array;
	/**
	 * Log-scaled density from 0 to 1, 1 at the fullest cell.
	 *
	 * Counts skew by orders of magnitude wherever real data clusters. A linear ramp over that
	 * renders as two shades.
	 */
	weight: Float64Array;
	cells: number;
	peak: number;
}

/** The non-empty cells for a geom. Positions at cell centers and weights for a ramp. */
export function densityCells(grid: DensityGrid, xDomain: [number, number], yDomain: [number, number]): DensityCells {
	const {width, height, counts} = grid;
	let cells = 0;
	let peak = 0;
	for (let cell = 0; cell < counts.length; cell += 1) {
		const held = counts[cell]!;
		if (held === 0) continue;
		cells += 1;
		if (held > peak) peak = held;
	}

	const xs = new Float64Array(cells);
	const ys = new Float64Array(cells);
	const weight = new Float64Array(cells);
	const cellWidth = (xDomain[1] - xDomain[0]) / width;
	const cellHeight = (yDomain[1] - yDomain[0]) / height;
	const logPeak = Math.log(peak + 1);

	let at = 0;
	for (let cell = 0; cell < counts.length; cell += 1) {
		const held = counts[cell]!;
		if (held === 0) continue;
		xs[at] = xDomain[0] + ((cell % width) + 0.5) * cellWidth;
		ys[at] = yDomain[0] + (Math.floor(cell / width) + 0.5) * cellHeight;
		weight[at] = Math.log(held + 1) / logPeak;
		at += 1;
	}

	return {xs, ys, weight, cells, peak};
}
