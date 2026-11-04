/**
 * A flow between named stages. Ribbon thickness stands for what passed along it.
 *
 * `GRAMMAR` answers `flow`. The frame draws no axes and the geom takes the panel whole.
 */

import {sankeyLayout, type SankeyLinkInput, type SankeyNodeInput} from "../../core/internal.js";

/** Gap between a node and the label beside it, in pixels. */
const NODE_LABEL_GAP = 5;

/** Weak enough that the nodes stay countable under the ribbons crossing them. */
const RIBBON_OPACITY = 0.34;

/** Vertical room a label needs before the one under it overwrites it, in multiples of its type size. */
const LABEL_PITCH = 2.4;

/**
 * Which nodes write their name, walking each column from the top.
 *
 * A gate turning five million candidates into a few hundred draws its survivors a pixel apart.
 * Three names centered inside eight pixels is one smear. The node draws and the name gives way.
 */
function labeled(nodes: readonly {id: string; label: string; column: number; y0: number; y1: number}[], pitch: number) {
	const ids = new Set<string>();
	for (const column of new Set(nodes.map((node) => node.column))) {
		let lastY = -Infinity;
		const members = nodes.filter((node) => node.column === column && node.label !== "").sort((a, b) => a.y0 - b.y0);
		for (const node of members) {
			const at = (node.y0 + node.y1) / 2;
			if (at - lastY < pitch) continue;
			ids.add(node.id);
			lastY = at;
		}
	}
	return ids;
}

export interface SankeyProps {
	nodes: SankeyNodeInput[];
	links: SankeyLinkInput[];
	width: number;
	height: number;
	/** Hue per node, taken off the categorical map. Read where a node states no `color`. */
	identity: (index: number) => string;
	/** One hue for the whole figure, where the author picked one. */
	fill?: string;
	opacity?: number;
	/** Type size for the labels, in pixels. Absent writes none. */
	fontSize?: number;
	/** The node's value written under its name. Absent writes the name alone. */
	format?: (value: number) => string;
	/** How a value becomes a thickness. A funnel reads each column against its own population. */
	normalize?: "global" | "column";
}

export function Sankey({
	nodes,
	links,
	width,
	height,
	identity,
	fill,
	opacity = 1,
	fontSize,
	format,
	normalize = "global",
}: SankeyProps) {
	if (nodes.length === 0 || width <= 0 || height <= 0) return null;

	const layout = sankeyLayout(nodes, links, {width, height, normalize});
	const hue = new Map(layout.nodes.map((node, index) => [node.id, node.color ?? fill ?? identity(index)]));
	const lastColumn = layout.nodes.reduce((held, node) => Math.max(held, node.column), 0);
	const written = labeled(layout.nodes, (fontSize ?? 0) * LABEL_PITCH);

	return (
		<>
			{/* Under the nodes, which leaves a node reading as what the flow passes through. */}
			<g data-geom="sankey">
				{layout.links.map((link, index) => (
					<path
						key={`${link.source}-${link.target}-${index}`}
						d={link.path}
						fill={link.color ?? hue.get(link.source) ?? "var(--viz-ink-muted)"}
						fillOpacity={RIBBON_OPACITY * opacity}
					/>
				))}

				{layout.nodes.map((node) => (
					<rect
						key={node.id}
						x={node.x0}
						y={node.y0}
						width={node.x1 - node.x0}
						height={Math.max(1, node.y1 - node.y0)}
						rx={2}
						fill={hue.get(node.id)}
						fillOpacity={opacity}
					>
						<title>{`${node.label} ${node.value.toLocaleString()}`}</title>
					</rect>
				))}
			</g>

			{fontSize != null && (
				/* A label stands outside its node and turns inward at the last column to stay on the frame. */
				<g data-geom="sankey-labels" fontSize={fontSize} pointerEvents="none" fill="var(--viz-ink-muted)">
					{layout.nodes.map((node) => {
						if (!written.has(node.id)) return null;
						const inward = node.column === lastColumn && lastColumn > 0;
						const at = inward ? node.x0 - NODE_LABEL_GAP : node.x1 + NODE_LABEL_GAP;
						return (
							<text
								key={node.id}
								x={at}
								y={(node.y0 + node.y1) / 2}
								dominantBaseline="middle"
								textAnchor={inward ? "end" : "start"}
							>
								<tspan x={at} dy={format ? "-0.1em" : 0}>
									{node.label}
								</tspan>
								{format && (
									<tspan x={at} dy="1.2em" fillOpacity={0.75}>
										{format(node.value)}
									</tspan>
								)}
							</text>
						);
					})}
				</g>
			)}
		</>
	);
}
