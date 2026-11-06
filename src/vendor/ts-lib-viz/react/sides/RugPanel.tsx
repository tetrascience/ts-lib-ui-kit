/**
 * A rug: one tick per reading along the axis it shares with the geoms.
 *
 * What it adds over the histogram is the tail. A bin holding one reading and a bin holding none draw
 * nearly alike at any panel height worth using, and the lone reading three deviations out is the one
 * a scientist is looking for. A rug draws it at full strength.
 *
 * Deduplicated by pixel, which is what keeps a quarter of a million readings drawable: two ticks at
 * one pixel are one geom of ink, so the path holds at most one segment per pixel of the shared axis
 * however many rows there are. No reading is lost by it, since a value far from the rest has a pixel
 * to itself, which is the opposite of what sampling would do.
 *
 * See the ADR "A figure takes side panels that share one axis", decision 8.
 */

import type {Marginal, Scale, SidePanel} from "../../core/internal.js";

export interface RugPanelProps {
	marginal: Marginal;
	/** The geoms' own scale for the shared axis, in the measure's units. */
	along: Scale;
	position: SidePanel["position"];
	width: number;
	height: number;
	stroke?: string;
	lineWidth?: number;
	/** How far across the panel a tick runs, as a fraction of it. */
	reach?: number;
}

export function RugPanel({
	marginal,
	along,
	position,
	width,
	height,
	stroke = "var(--viz-ink-muted)",
	lineWidth = 1,
	reach = 0.7,
}: RugPanelProps) {
	const across = position === "top" || position === "bottom";
	const span = across ? height : width;
	const depth = Math.max(1, span * Math.min(1, Math.max(0, reach)));

	const at = new Set<number>();
	for (const value of marginal.values) {
		const pixel = Math.round(along(value));
		if (Number.isFinite(pixel)) at.add(pixel);
	}
	if (at.size === 0) return null;

	/* Ticks start on the edge nearest the geoms and run away from them. */
	const near = position === "top" || position === "left" ? span : 0;
	const far = position === "top" || position === "left" ? span - depth : depth;

	const drawn = [...at]
		.map((pixel) => (across ? `M${pixel},${near}L${pixel},${far}` : `M${near},${pixel}L${far},${pixel}`))
		.join("");

	return (
		<path d={drawn} fill="none" stroke={stroke} strokeOpacity={0.6} strokeWidth={lineWidth} data-rug={marginal.axis} />
	);
}
