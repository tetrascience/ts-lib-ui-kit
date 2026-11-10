/**
 * A marginal density, drawn against the scale the geoms are drawn against.
 *
 * The curve form of `HistogramPanel`, and the reason both exist: three overlapping distributions
 * read as three curves and as one muddle of bars. A histogram states where the mass is at the
 * resolution of its bins; a density states the shape, which is what a reader compares between
 * groups.
 *
 * The density carries no axis, for the reason the histogram carries none: a marginal is read as
 * shape, and an axis on one is a second scale for a number nobody is asked to take off the figure.
 * Each curve is scaled so its own peak fills the panel, which is what makes two groups of
 * different size comparable in shape instead of in count.
 *
 * Filled and stroked. The fill is what lets a reader see the overlap and the stroke is what keeps
 * three of them separable inside it, which is the same argument `Area` makes about a wash with no
 * boundary.
 *
 * See the ADR "A figure takes side panels that share one axis", and decision 8 for the binning the
 * histogram inherited.
 */

import type {Marginal, Scale, SidePanel} from "../../core/internal.js";

/** How much of a curve's own peak the panel gives it, leaving the outline room to sit inside. */
const FILL = 0.92;

export function DensityPanel({
	marginal,
	along,
	position,
	width,
	height,
	fillOpacity = 0.45,
	lineWidth = 1,
}: {
	marginal: Marginal;
	/** The geoms' own scale for the shared axis, in the measure's units. */
	along: Scale;
	position: SidePanel["position"];
	width: number;
	height: number;
	fillOpacity?: number;
	lineWidth?: number;
}) {
	const curves = marginal.curves ?? [];
	if (curves.length === 0) return null;

	const across = position === "top" || position === "bottom";
	const span = across ? height : width;

	/*
	  Which way the curve grows.

	  A top panel and a left one grow away from the geoms, which is toward their own outer edge; a
	  bottom and a right grow toward it. So the baseline sits where the panel meets the plot area and
	  the peak reaches the far side, and a marginal always opens away from the cloud it describes.
	*/
	const grows = position === "top" || position === "left" ? -1 : 1;
	const base = position === "top" || position === "left" ? span : 0;

	return (
		<g>
			{curves.map((curve) => {
				let path = "";
				for (let i = 0; i < curve.grid.length; i += 1) {
					const at = along(curve.grid[i]!);
					const out = base + grows * curve.weight[i]! * span * FILL;
					const [x, y] = across ? [at, out] : [out, at];
					path += `${path ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
				}
				if (!path) return null;

				/* Closed along the baseline, so the fill is the area under the curve and not a smear. */
				const first = along(curve.grid[0]!);
				const last = along(curve.grid[curve.grid.length - 1]!);
				const [closeA, closeB] = across
					? [`L${last.toFixed(2)},${base}`, `L${first.toFixed(2)},${base}`]
					: [`L${base},${last.toFixed(2)}`, `L${base},${first.toFixed(2)}`];

				return (
					<g key={curve.label || "pooled"}>
						<path d={`${path}${closeA}${closeB}Z`} fill={curve.color} fillOpacity={fillOpacity} stroke="none" />
						<path d={path} fill="none" stroke={curve.color} strokeWidth={lineWidth} strokeLinejoin="round" />
					</g>
				);
			})}
		</g>
	);
}
