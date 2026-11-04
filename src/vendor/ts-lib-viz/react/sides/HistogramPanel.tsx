/**
 * A marginal histogram, drawn against the scale the geoms are drawn against.
 *
 * The point of the primitive: two frames over one domain at different extents. A bar sits between the
 * pixels its interval's ends map to, so a peak in the margin is above the part of the cloud that made
 * it and a reader lines the two up by eye instead of by reading numbers off both.
 *
 * The counts have no axis of their own. Marginals are read as shape, and an axis on one is a second
 * scale for a number the reader is not asked to take off the figure; the tallest bar filling the
 * panel is what says the counts were scaled. What the reader gets from it is where the mass is.
 *
 * An interval reaching past the axis is cut off where the axis ends, since the scale clamps and the
 * strip covers the plot area and nothing beyond it. The count is the height, so what a clipped bar
 * loses is width, and the reader still reads its count against the rest.
 *
 * See the ADR "A figure takes side panels that share one axis", decision 8.
 */

import type {Marginal, Scale, SidePanel} from "../../core/internal.js";

export interface HistogramPanelProps {
	marginal: Marginal;
	/** The geoms' own scale for the shared axis, in the measure's units. */
	along: Scale;
	position: SidePanel["position"];
	width: number;
	height: number;
	fill?: string;
	/** Pixels taken off a bar so a run of them reads as bars and not as a block. */
	gap?: number;
}

export function HistogramPanel({
	marginal,
	along,
	position,
	width,
	height,
	fill = "var(--viz-ink-muted)",
	gap = 1,
}: HistogramPanelProps) {
	const bins = marginal.bins ?? [];
	const most = marginal.most ?? 0;
	if (bins.length === 0 || most <= 0) return null;

	const across = position === "top" || position === "bottom";
	const span = across ? height : width;
	/* Nought is the edge nearest the geoms, so a bar grows away from the cloud it counts. */
	const from = position === "top" || position === "left" ? (reach: number) => span - reach : () => 0;

	return (
		<g data-histogram={marginal.axis}>
			{bins.map((bin) => {
				const ends = [along(bin.from), along(bin.to)].sort((a, b) => a - b);
				const thick = Math.max(1, ends[1]! - ends[0]! - gap);
				const reach = Math.max(1, (bin.count / most) * span);
				const start = from(reach);
				return (
					<rect
						key={bin.from}
						x={across ? ends[0]! + gap / 2 : start}
						y={across ? start : ends[0]! + gap / 2}
						width={across ? thick : reach}
						height={across ? reach : thick}
						fill={fill}
						fillOpacity={0.75}
					/>
				);
			})}
		</g>
	);
}
