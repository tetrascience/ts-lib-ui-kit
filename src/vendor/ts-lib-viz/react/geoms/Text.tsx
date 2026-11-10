/**
 * The text geoms: a label per row at its reading. ggplot's `geom_text` and `geom_label`.
 *
 * Plain SVG text, which an export and a headless draw keep.
 */

import {textRun, type LayerPoint, type Scale} from "../../core/internal.js";
import {BAR_CAP, MARK_GAP} from "./Bars.js";

export interface TextProps {
	points: readonly LayerPoint[];
	x: Scale;
	y: Scale;
	/** Category width on the band axis, zero on a value scale. */
	band: number;
	/** Distance between two neighboring band centers, in pixels. A jitter's or a nudge's offset there reads in it. */
	step?: number;
	/** The dodged bar's slot, where the layer named one. `ofBand` overrides `of` per category. */
	slot?: {index: number; of: number; width?: number; cap?: number; ofBand?: Record<string, number>};
	transposed?: boolean;
	/** Ink per label off its weight, where a color channel is bound. */
	ramp?: (weight: number) => string;
	/** Ink for the whole layer. Absent writes in the foreground ink. */
	color?: string;
	fontSize?: number;
	hjust?: number;
	vjust?: number;
	opacity?: number;
	/** Draws the paper box behind each label, which is `geom_label`. */
	boxed?: boolean;
}

/** Height of a capital, as a share of the type size. `vjust` measures against it. */
const CAP = 0.72;
const PAD = 3;

/** The SVG anchor nearest to ggplot's `hjust`. */
const anchorOf = (hjust: number): "start" | "middle" | "end" =>
	hjust <= 0.25 ? "start" : hjust >= 0.75 ? "end" : "middle";

export function Text({
	points,
	x,
	y,
	band,
	step = 0,
	slot,
	transposed = false,
	ramp,
	color,
	fontSize = 11,
	hjust = 0.5,
	vjust = 0.5,
	opacity = 1,
	boxed = false,
}: TextProps) {
	/* The bar's own slot arithmetic. A label then stands over the middle of the bar it names. */
	const whole = Math.max(1, Math.min(band - MARK_GAP, slot?.cap ?? BAR_CAP));
	const spread = whole * (slot?.width ?? 1);
	const offsetOf = (point: LayerPoint) => {
		if (!slot || band <= 0) return 0;
		const of = (point.category != null ? slot.ofBand?.[point.category] : undefined) ?? slot.of;
		return (slot.index - (of - 1) / 2) * (spread / of);
	};
	const along = transposed ? y : x;
	const measure = transposed ? x : y;
	const anchor = anchorOf(hjust);

	return (
		<g pointerEvents="none" data-geom="text">
			{points.map((point, index) => {
				const reading = point.category ?? point.x + (point.dx ?? 0);
				const moved = offsetOf(point) + (point.category == null ? 0 : (point.dx ?? 0) * step);
				const value = point.y + (point.dy ?? 0);
				const [px, py] = transposed
					? [measure(value), along(reading) + moved]
					: [along(reading) + moved, measure(value)];
				const baseline = py + vjust * fontSize * CAP;
				const ink = point.weight != null && ramp ? ramp(point.weight) : (color ?? "var(--viz-ink)");
				const run = textRun(point.text?.length ?? 0, fontSize);
				const left = anchor === "start" ? px : anchor === "end" ? px - run : px - run / 2;

				return (
					<g key={`${point.row}:${index}`}>
						{boxed && (
							<rect
								x={left - PAD}
								y={baseline - fontSize * CAP - PAD}
								width={run + PAD * 2}
								height={fontSize * CAP + PAD * 2 + 2}
								rx={3}
								fill="var(--viz-paper)"
								stroke="var(--viz-rule)"
							/>
						)}
						<text x={px} y={baseline} textAnchor={anchor} fontSize={fontSize} fill={ink} fillOpacity={opacity}>
							{point.text}
						</text>
					</g>
				);
			})}
		</g>
	);
}
