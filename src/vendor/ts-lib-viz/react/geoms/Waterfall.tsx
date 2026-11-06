/**
 * Waterfall: signed steps standing on the running total of the ones before them.
 *
 * The bars are the bar geom's. A step is a `BarDatum` carrying a floor, and `stepped` in `/core`
 * resolved those floors against the band's own order, so nothing here does arithmetic over the
 * sequence. What this adds is the two readings a plain bar has no room for.
 *
 * A rise and a fall take separate paints. The direction of the move is what the reader follows down
 * the band, and it is the one thing a floating block cannot say for itself: a bar sitting at 800 and
 * running to 500 looks like a bar sitting at 500 and running to 800. Chart-design rule 8 asks that
 * color encode something, and here it encodes the sign. Both come off the categorical map, since the
 * semantic tones are reserved for status and a fall is a fall and not a failure.
 *
 * A connector joins the end of one step to the start of the next, at the height they share. It draws
 * under the bars, so the gap between two bands is the part a reader sees, and the eye carries the
 * total across instead of re-finding it. Rule 9 craft: a hairline in the muted ink, costing little
 * and reading as care.
 */

import type {BarDatum, GeomHit, Scale} from "../../core/internal.js";

import {Bars} from "./Bars.js";

export interface WaterfallProps {
	/** One step per category. Each carries the floor that `stepped` resolved for it. */
	data: BarDatum[];
	x: Scale;
	y: Scale;
	band: number;
	/** Paint for a step that moved the total up. */
	rise: string;
	/** Paint for a step that moved it down. */
	fall: string;
	/** Widest a step is drawn. The band bounds it where the band is narrower. */
	maxWidth?: number;
	transposed?: boolean;
	opacity?: number;
	/** Outline paint on each step, and its width. Absent draws none. */
	stroke?: string;
	lineWidth?: number;
	/** Ink on the rule joining one step to the next. Absent takes the muted ink. */
	connector?: string;
	active?: string | null;
	onHover?: (hit: GeomHit<BarDatum> | null) => void;
	onSelect?: (hit: GeomHit<BarDatum>) => void;
}

export function Waterfall({
	data,
	x,
	y,
	band,
	rise,
	fall,
	maxWidth,
	transposed = false,
	opacity,
	stroke,
	lineWidth,
	connector = "var(--viz-ink-muted)",
	active,
	onHover,
	onSelect,
}: WaterfallProps) {
	if (data.length === 0) return null;

	/* A per-datum color is what `Bars` reads ahead of its own, so the sign lands on the datum. */
	const painted = data.map((step) => ({...step, color: step.color ?? (step.value < 0 ? fall : rise)}));

	const along = transposed ? y : x;
	const measure = transposed ? x : y;

	return (
		<g data-geom="waterfall">
			<g data-geom="waterfall-connectors" stroke={connector} strokeWidth={1} strokeOpacity={0.55}>
				{data.slice(0, -1).map((step, index) => {
					const next = data[index + 1]!;
					/* The height the two share, which is where one step finished and the next starts. */
					const at = measure((step.floor ?? 0) + step.value);
					const from = along(step.at ?? step.category);
					const to = along(next.at ?? next.category);
					return transposed ? (
						<line key={step.category} x1={at} x2={at} y1={from} y2={to} />
					) : (
						<line key={step.category} x1={from} x2={to} y1={at} y2={at} />
					);
				})}
			</g>
			{/* A step has a column of its own. The gap between stacked blocks has nothing to set apart here. */}
			<Bars
				data={painted}
				x={x}
				y={y}
				band={band}
				segmentGap={0}
				transposed={transposed}
				maxWidth={maxWidth}
				opacity={opacity}
				stroke={stroke}
				lineWidth={lineWidth}
				active={active}
				onHover={onHover}
				onSelect={onSelect}
			/>
		</g>
	);
}
