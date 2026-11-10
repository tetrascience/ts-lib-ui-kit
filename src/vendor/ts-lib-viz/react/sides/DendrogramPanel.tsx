/**
 * The tree behind a band's cluster order, drawn in the side panel beside it.
 *
 * Chrome and not a geom. It encodes nothing the geoms do not already carry: the permutation is on
 * the axis and this is the picture explaining it, which is why it takes the tree the build produced
 * instead of clustering anything itself. A second clustering here would pay the quadratic term twice
 * for an answer that could disagree with the rows it sits beside.
 *
 * Depth runs away from the geoms, so the leaves touch the categories they name and the root sits on
 * the far edge. That direction is what the four edges differ in, and it is the whole of what this
 * knows about where it was put: the shared span and the origin come off `sideLayout`, which hands the
 * panel the plot area's own extent.
 *
 * See the ADRs "A figure takes side panels that share one axis" and "A band carries an order and
 * clustering is one source of it".
 */

import {dendrogramBrackets, type ClusterTree, type DepthScale, type SidePanel} from "../../core/internal.js";

export interface DendrogramPanelProps {
	/** The tree and the labels its leaves point at, off `ReadyFrame.clusterTrees`. */
	tree: ClusterTree;
	/** Where a category sits along the shared axis. The band scale answers with its center. */
	at: (label: string) => number;
	position: SidePanel["position"];
	width: number;
	height: number;
	/** How a merge's height becomes the depth it draws at. R's own plot is `height`. */
	depth?: DepthScale;
	stroke?: string;
	/** Width of the tree's strokes, in pixels. */
	lineWidth?: number;
}

export function DendrogramPanel({
	tree,
	at,
	position,
	width,
	height,
	depth = "height",
	stroke = "var(--viz-ink-muted)",
	lineWidth = 1,
}: DendrogramPanelProps) {
	const brackets = dendrogramBrackets(
		tree.tree,
		tree.labels.map((label) => at(label)),
		depth,
	);
	if (brackets.length === 0) return null;

	const across = position === "top" || position === "bottom";
	const span = across ? height : width;
	/* Nought is the edge nearest the geoms, which is the far side of the box on a top or left panel. */
	const away = (depth: number) => (position === "top" || position === "left" ? span - depth * span : depth * span);
	const point = (along: number, depth: number) => (across ? `${along},${away(depth)}` : `${away(depth)},${along}`);

	/*
    One path over every merge, since a grid at the cluster cap is 255 of them.

    Each is the bracket the merge draws: up from the first child's own depth, across at the merge's,
    and back down to the second child. A leaf's depth is nought, so its segment reaches the category.
  */
	const drawn = brackets
		.map(
			(bracket) =>
				`M${point(bracket.from[0], bracket.base[0])}L${point(bracket.from[0], bracket.depth)}` +
				`L${point(bracket.from[1], bracket.depth)}L${point(bracket.from[1], bracket.base[1])}`,
		)
		.join("");

	return <path d={drawn} fill="none" stroke={stroke} strokeWidth={lineWidth} data-dendrogram={position} />;
}
