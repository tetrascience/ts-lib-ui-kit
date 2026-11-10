/**
 * One rectangle per node, in two arrangements.
 *
 * Rectangles come out in fractions of the drawing area. The tiling is the squarified algorithm of
 * Bruls, Huizing and van Wijk.
 */

import {boundsOf} from "./aggregate.js";

/** A row a hierarchy is built from. `parent` absent, or naming no row, makes it a root. */
export interface HierarchyRow {
	label: string;
	value: number;
	parent?: string;
}

/** One node's rectangle, in fractions of the drawing area from its top left corner. */
export interface HierarchyCell {
	label: string;
	/** The cell this one falls inside. Absent on a root. */
	parent?: string;
	/** Sum of the children drawn under it, or the row's own value where it has none. */
	value: number;
	/** Levels down from a root. A component inks one level or writes its labels alone. */
	depth: number;
	x0: number;
	y0: number;
	x1: number;
	y1: number;
}

/**
 * Children one parent draws.
 *
 * Past two dozen the smallest cells are slivers with labels that do not fit. A parent keeps its
 * largest children and the count reaches the footer.
 */
export const HIERARCHY_CAP = 24;

/** Cells to draw, and what the cap turned down. The footer owes a clause for each. */
export interface HierarchyLayout {
	/** A parent stands before its children. Drawing in order paints a child over its parent. */
	cells: HierarchyCell[];
	/** Nodes the cap refused, counting the descendants that went with them. */
	dropped: number;
}

interface Node {
	label: string;
	parent?: string;
	value: number;
	depth: number;
	children: Node[];
}

interface Rect {
	x0: number;
	y0: number;
	x1: number;
	y1: number;
}

const WHOLE: Rect = {x0: 0, y0: 0, x1: 1, y1: 1};

/** Totals a node set's values. */
const totalOf = (nodes: readonly Node[]): number => nodes.reduce((sum, node) => sum + node.value, 0);

/** Counts what falls under a node, at any depth. */
const descendants = (node: Node): number => node.children.reduce((sum, child) => sum + 1 + descendants(child), 0);

/**
 * Resolves the rows into a forest and sums each node off what it kept.
 *
 * A row naming a missing label becomes a root, as does one inside a cycle.
 */
function forestOf(rows: readonly HierarchyRow[], cap: number): {roots: Node[]; dropped: number} {
	const nodes = new Map<string, Node>();
	for (const row of rows) {
		if (nodes.has(row.label)) continue;
		nodes.set(row.label, {label: row.label, value: row.value, depth: 0, children: []});
	}

	const parentOf = new Map<string, string>();
	for (const row of rows) {
		if (parentOf.has(row.label)) continue;
		if (row.parent != null && row.parent !== row.label && nodes.has(row.parent)) parentOf.set(row.label, row.parent);
	}

	const byParent = new Map<string, Node[]>();
	for (const [label, parent] of parentOf) {
		const held = byParent.get(parent) ?? [];
		held.push(nodes.get(label)!);
		byParent.set(parent, held);
	}

	/* Descended from the rows naming no parent. The walk fails to reach a cycle. */
	const roots = [...nodes.values()].filter((node) => !parentOf.has(node.label));
	const reached = new Set(roots.map((node) => node.label));
	const queue = [...roots];
	while (queue.length > 0) {
		const node = queue.shift()!;
		for (const child of byParent.get(node.label) ?? []) {
			if (reached.has(child.label)) continue;
			reached.add(child.label);
			child.parent = node.label;
			child.depth = node.depth + 1;
			node.children.push(child);
			queue.push(child);
		}
	}
	for (const node of nodes.values()) {
		if (reached.has(node.label)) continue;
		reached.add(node.label);
		roots.push(node);
	}

	let dropped = 0;

	/** Takes the largest `cap` of a set, counting what went and all beneath it. */
	const keep = (set: Node[]): Node[] => {
		const drawn = set.filter((node) => node.value > 0 || node.children.length > 0);
		if (drawn.length <= cap) return drawn;
		const ranked = [...drawn].sort((one, other) => other.value - one.value);
		for (const node of ranked.slice(cap)) dropped += 1 + descendants(node);
		const held = new Set(ranked.slice(0, cap));
		return drawn.filter((node) => held.has(node));
	};

	/* Post-order. A parent's value is the sum of the children the cap left it. */
	const settle = (node: Node): void => {
		node.children = keep(node.children);
		for (const child of node.children) settle(child);
		if (node.children.length > 0) node.value = totalOf(node.children);
	};

	const top = keep(roots);
	for (const node of top) settle(node);
	return {roots: top.filter((node) => node.value > 0), dropped};
}

/**
 * Reports the worst aspect ratio in a strip laid along a side of the given length.
 *
 * The measure the squarified tiling minimizes, taken over the strip's largest and smallest cell.
 */
function worst(areas: readonly number[], side: number): number {
	let sum = 0;
	let most = 0;
	let least = Infinity;
	for (const area of areas) {
		sum += area;
		if (area > most) most = area;
		if (area < least) least = area;
	}
	if (!(sum > 0) || !(side > 0) || !(least > 0)) return Infinity;
	const strip = sum * sum;
	const along = side * side;
	return Math.max((along * most) / strip, strip / (along * least));
}

/**
 * Lays one strip of cells across a box and returns what is left.
 *
 * The strip runs along the shorter side. The last cell takes the box's own edge.
 */
function layStrip(
	strip: readonly Node[],
	areas: readonly number[],
	box: Rect,
	across: boolean,
	last: boolean,
	place: (node: Node, rect: Rect) => void,
): Rect {
	const total = areas.reduce((sum, area) => sum + area, 0);
	if (across) {
		const thick = last ? box.y1 - box.y0 : total / (box.x1 - box.x0);
		let from = box.x0;
		strip.forEach((node, index) => {
			const to = index === strip.length - 1 ? box.x1 : from + areas[index] / thick;
			place(node, {x0: from, y0: box.y0, x1: to, y1: box.y0 + thick});
			from = to;
		});
		return {x0: box.x0, y0: box.y0 + thick, x1: box.x1, y1: box.y1};
	}
	const thick = last ? box.x1 - box.x0 : total / (box.y1 - box.y0);
	let from = box.y0;
	strip.forEach((node, index) => {
		const to = index === strip.length - 1 ? box.y1 : from + areas[index] / thick;
		place(node, {x0: box.x0, y0: from, x1: box.x0 + thick, y1: to});
		from = to;
	});
	return {x0: box.x0 + thick, y0: box.y0, x1: box.x1, y1: box.y1};
}

/** Tiles one level of children into a box, largest first, one strip at a time. */
function squarify(children: readonly Node[], box: Rect, place: (node: Node, rect: Rect) => void): void {
	let waiting = [...children].sort((one, other) => other.value - one.value);
	let left = box;
	while (waiting.length > 0) {
		const width = left.x1 - left.x0;
		const height = left.y1 - left.y0;
		const total = totalOf(waiting);
		if (!(width > 0) || !(height > 0) || !(total > 0)) return;

		/* Rescaled per strip against what is left. The rounding of one strip stops there. */
		const scale = (width * height) / total;
		const areas = waiting.map((node) => node.value * scale);
		const side = Math.min(width, height);

		let count = 1;
		while (count < areas.length && worst(areas.slice(0, count + 1), side) <= worst(areas.slice(0, count), side)) {
			count += 1;
		}

		const strip = waiting.slice(0, count);
		waiting = waiting.slice(count);
		left = layStrip(strip, areas.slice(0, count), left, width <= height, waiting.length === 0, place);
	}
}

/**
 * Tiles the hierarchy in two dimensions. A cell's area stands for its value.
 *
 * A parent's cell contains its children. Chart-design rule 11 names the reading.
 */
export function treemapLayout(rows: readonly HierarchyRow[], cap: number = HIERARCHY_CAP): HierarchyLayout {
	const {roots, dropped} = forestOf(rows, cap);
	const cells: HierarchyCell[] = [];

	const tile = (nodes: readonly Node[], box: Rect): void => {
		squarify(nodes, box, (node, rect) => {
			cells.push({
				label: node.label,
				...(node.parent == null ? {} : {parent: node.parent}),
				value: node.value,
				depth: node.depth,
				...rect,
			});
			if (node.children.length > 0) tile(node.children, rect);
		});
	};

	tile(roots, WHOLE);
	return {cells, dropped};
}

/** Counts the levels a forest runs to. An icicle draws one row per level. */
const levelsOf = (nodes: readonly Node[]): number =>
	nodes.length === 0 ? 0 : 1 + boundsOf(nodes.map((node) => levelsOf(node.children)))[1];

/**
 * A row per level, with a cell's width standing for its value.
 *
 * Within one row the reading is a length on a shared baseline. The order is the row order.
 */
export function icicleLayout(rows: readonly HierarchyRow[], cap: number = HIERARCHY_CAP): HierarchyLayout {
	const {roots, dropped} = forestOf(rows, cap);
	const cells: HierarchyCell[] = [];
	const levels = levelsOf(roots);
	if (levels === 0) return {cells, dropped};
	const band = 1 / levels;

	const spread = (nodes: readonly Node[], x0: number, x1: number): void => {
		const total = totalOf(nodes);
		if (!(total > 0)) return;
		const span = x1 - x0;
		let from = x0;
		nodes.forEach((node, index) => {
			const to = index === nodes.length - 1 ? x1 : from + (node.value / total) * span;
			cells.push({
				label: node.label,
				...(node.parent == null ? {} : {parent: node.parent}),
				value: node.value,
				depth: node.depth,
				x0: from,
				y0: node.depth * band,
				x1: to,
				y1: (node.depth + 1) * band,
			});
			if (node.children.length > 0) spread(node.children, from, to);
			from = to;
		});
	};

	spread(roots, 0, 1);
	return {cells, dropped};
}

/**
 * The group each cell draws in, keyed by label.
 *
 * A forest groups by its roots. A single root groups by its children, and the root itself takes no
 * group.
 */
export function groupsOf(cells: readonly HierarchyCell[]): Map<string, string> {
	const parentOf = new Map(cells.map((cell) => [cell.label, cell.parent]));
	const depthOf = new Map(cells.map((cell) => [cell.label, cell.depth]));
	const level = cells.filter((cell) => cell.depth === 0).length === 1 ? 1 : 0;
	const groups = new Map<string, string>();
	for (const cell of cells) {
		let at: string | undefined = cell.label;
		/* Bounded by the cell count. A payload built elsewhere could carry a loop. */
		for (let step = 0; at != null && (depthOf.get(at) ?? 0) > level && step < cells.length; step += 1) {
			at = parentOf.get(at);
		}
		if (at != null && depthOf.get(at) === level) groups.set(cell.label, at);
	}
	return groups;
}
