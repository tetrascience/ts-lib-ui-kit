/**
 * One rectangle per node and one ribbon per link, in pixels.
 *
 * Node width and node padding are pixel quantities. A fractional answer stretches both with the
 * panel's aspect.
 */

import type {SankeyLinkInput, SankeyNodeInput} from "./geom-types.js";

/** A node's rectangle, in pixels from the top left of the drawing area. */
export interface SankeyNode extends SankeyNodeInput {
	x0: number;
	x1: number;
	y0: number;
	y1: number;
	value: number;
}

export interface SankeyLink extends SankeyLinkInput {
	path: string;
	/** Ribbon thickness at each end. The two differ under column normalization. */
	sourceThickness: number;
	targetThickness: number;
}

export interface SankeyLayout {
	nodes: SankeyNode[];
	links: SankeyLink[];
	/** Left edge of each column, for a header written over it. */
	columnX: Map<number, number>;
}

export interface SankeyOptions {
	width: number;
	height: number;
	/** Thin enough that the ribbons read as the subject and a node as what they pass through. */
	nodeWidth?: number;
	/** Gap between two nodes of one column, in pixels. */
	nodePadding?: number;
	/**
	 * How a value becomes a thickness.
	 *
	 * `column` scales each column to its own population. `global` scales the figure once, which puts
	 * a long cascade's last columns under a pixel.
	 */
	normalize?: "global" | "column";
}

/**
 * Nodes placed and links routed.
 *
 * A node's value is the larger of what reaches it and what leaves it. A link naming an absent node
 * is dropped.
 */
export function sankeyLayout(
	nodes: readonly SankeyNodeInput[],
	links: readonly SankeyLinkInput[],
	{width, height, nodeWidth = 12, nodePadding = 8, normalize = "global"}: SankeyOptions,
): SankeyLayout {
	const value = new Map<string, number>();
	for (const node of nodes) {
		let incoming = 0;
		let outgoing = 0;
		for (const link of links) {
			if (link.target === node.id) incoming += link.value;
			if (link.source === node.id) outgoing += link.value;
		}
		value.set(node.id, Math.max(incoming, outgoing));
	}

	const columns = [...new Set(nodes.map((node) => node.column))].sort((a, b) => a - b);
	const lastColumn = columns[columns.length - 1] ?? 0;
	const columnStep = columns.length > 1 ? (width - nodeWidth) / lastColumn : 0;

	/* The tightest column sets the global scale. Every column fits under it. */
	const columnScale = new Map<number, number>();
	let globalScale = Infinity;
	for (const column of columns) {
		const members = nodes.filter((node) => node.column === column);
		const total = members.reduce((sum, node) => sum + (value.get(node.id) ?? 0), 0);
		const available = height - nodePadding * Math.max(0, members.length - 1);
		const scale = total > 0 ? available / total : 0;
		columnScale.set(column, scale);
		if (scale > 0) globalScale = Math.min(globalScale, scale);
	}
	if (!Number.isFinite(globalScale)) globalScale = 0;

	const scaleFor = (column: number) => (normalize === "column" ? (columnScale.get(column) ?? 0) : globalScale);

	const placed = new Map<string, SankeyNode>();
	const columnX = new Map<number, number>();

	for (const column of columns) {
		const scale = scaleFor(column);
		/* Exits sort under the survivors of their column, and the largest node leads. */
		const members = nodes
			.filter((node) => node.column === column)
			.sort((a, b) => {
				const rank = (node: SankeyNodeInput) => (node.kind === "exit" ? 1 : 0);
				return rank(a) - rank(b) || (value.get(b.id) ?? 0) - (value.get(a.id) ?? 0);
			});

		const x0 = column * columnStep;
		columnX.set(column, x0);

		let y = 0;
		for (const node of members) {
			const reading = value.get(node.id) ?? 0;
			const tall = Math.max(1, reading * scale);
			placed.set(node.id, {...node, value: reading, x0, x1: x0 + nodeWidth, y0: y, y1: y + tall});
			y += tall + nodePadding;
		}
	}

	const outOffset = new Map<string, number>();
	const inOffset = new Map<string, number>();
	const routed: SankeyLink[] = [];

	/* Survivors first. The main path hugs the top of each node and the exits hang under it. */
	const ordered = [...links].sort((a, b) => {
		const rank = (link: SankeyLinkInput) => (link.kind === "survivor" || !link.kind ? 0 : 1);
		return rank(a) - rank(b);
	});

	for (const link of ordered) {
		const source = placed.get(link.source);
		const target = placed.get(link.target);
		if (!source || !target) continue;

		const sourceThickness = Math.max(1, link.value * scaleFor(source.column));
		const targetThickness = Math.max(1, link.value * scaleFor(target.column));
		const sy = source.y0 + (outOffset.get(link.source) ?? 0);
		const ty = target.y0 + (inOffset.get(link.target) ?? 0);
		outOffset.set(link.source, (outOffset.get(link.source) ?? 0) + sourceThickness);
		inOffset.set(link.target, (inOffset.get(link.target) ?? 0) + targetThickness);

		/* Out along the top edge and back along the bottom, which closes the ribbon into one fill. */
		const mid = (source.x1 + target.x0) / 2;
		const path = [
			`M${source.x1},${sy}`,
			`C${mid},${sy} ${mid},${ty} ${target.x0},${ty}`,
			`L${target.x0},${ty + targetThickness}`,
			`C${mid},${ty + targetThickness} ${mid},${sy + sourceThickness} ${source.x1},${sy + sourceThickness}`,
			"Z",
		].join("");

		routed.push({...link, path, sourceThickness, targetThickness});
	}

	return {nodes: [...placed.values()], links: routed, columnX};
}
