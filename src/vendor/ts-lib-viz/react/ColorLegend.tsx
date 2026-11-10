/**
 * What a fill stands for.
 *
 * A bar and not a row of swatches, which is where this parts from `SizeLegend`. That one draws three
 * circles because area is judged against a neighbor and cannot be read off a gradient. Color is the
 * channel a reader does judge against a gradient, so the map draws continuously and the numbers sit
 * under it.
 *
 * Cuts are the exception: an author who binned the map into steps drew a scale with edges, and a
 * gradient would say the values between two cuts differ when the figure has drawn them alike.
 *
 * The ramp takes a value in its own units, the same contract `Trace.ramp` states, so this samples the
 * figure's own mapping instead of reproducing it. A legend that recomputed the scale is a second
 * answer to the question the geoms already answered.
 *
 * Which numbers get named is the author's where they say so. Absent that it is the two ends and the
 * middle, or every cut on a binned map, which is what a reader needs to place a color and no more.
 */

import {useId} from "react";
import type {ValueRamp} from "../core/internal.js";

/** Tabular figures, so a column of numbers lines up on the digit. */
const TABULAR: React.CSSProperties = {fontVariantNumeric: "tabular-nums"};

export interface ColorLegendProps {
	/** The measure's name, with its unit where it carries one. */
	label: string;
	/** The two ends the map runs between, in the measure's own units. */
	domain: [number, number];
	/** The figure's own mapping, taking a value in its own units. */
	ramp: ValueRamp;
	/** Where the map's neutral sits, drawn as a labeled tick. Absent on a one-armed map. */
	center?: number;
	/** Cuts that binned the map. Draws blocks and their edges in place of a gradient. */
	breaks?: readonly number[];
	/**
	 * Values named under the bar, each written as its own label or through `format`.
	 *
	 * Placed at the value's own position along the bar instead of spread evenly, which is what makes
	 * a named threshold sit where the color changes. Absent falls back to the ends and the middle, or
	 * to the cuts on a binned map.
	 */
	ticks?: {at: number; label?: string}[];
	/** Formats a value the way the axis and the readout do. */
	format?: (value: number) => string;
}

/** Samples across the bar. Enough that no band of the map is wider than a pixel or two at this size. */
const STOPS = 24;

const BAR_W = 132;
const BAR_H = 10;

export function ColorLegend({label, domain, ramp, center, breaks, ticks, format}: ColorLegendProps) {
	const gradientId = useId();
	const [lo, hi] = domain;
	const say = format ?? ((value: number) => value.toLocaleString(undefined, {maximumSignificantDigits: 3}));

	/* Where a value sits along the bar. A binned bar gives each block one width, and a value sits inside its own block. */
	const placeOf = (at: number): number => {
		if (!breaks || breaks.length < 2) return hi === lo ? 0.5 : (at - lo) / (hi - lo);
		const bins = breaks.length - 1;
		let bin = 0;
		while (bin < bins - 1 && at > breaks[bin + 1]!) bin += 1;
		const [from, to] = [breaks[bin]!, breaks[bin + 1]!];
		return (bin + (to === from ? 0 : (at - from) / (to - from))) / bins;
	};

	/* Named values sit where their color does, so a threshold label lands on the step it names. */
	const named =
		ticks && ticks.length > 0 ? (
			<span className="relative block" style={{width: BAR_W, height: "1em"}}>
				{ticks.map(({at, label: written}) => (
					<span
						key={at}
						className="absolute text-2xs text-muted-foreground"
						style={{
							fontVariantNumeric: "tabular-nums",
							left: `${Math.min(100, Math.max(0, placeOf(at) * 100))}%`,
							transform: "translateX(-50%)",
							whiteSpace: "nowrap",
						}}
					>
						{written ?? say(at)}
					</span>
				))}
			</span>
		) : null;

	if (breaks && breaks.length > 1) {
		const bins = breaks.length - 1;
		return (
			<div className="contents">
				<span className="text-xs text-muted-foreground">{label}</span>
				<span className="flex min-w-0 flex-col gap-1">
					<svg width={BAR_W} height={BAR_H} aria-hidden>
						{Array.from({length: bins}, (_, bin) => {
							const width = BAR_W / bins;
							/* Sampled inside the bin, so the block draws the color the cells in it drew. */
							const inside = (breaks[bin]! + breaks[bin + 1]!) / 2;
							return <rect key={bin} x={bin * width} y={0} width={width} height={BAR_H} fill={ramp(inside)} />;
						})}
					</svg>
					{named ?? (
						<span className="flex justify-between" style={{width: BAR_W}}>
							{breaks.map((cut) => (
								<span key={cut} className="text-2xs text-muted-foreground" style={TABULAR}>
									{say(cut)}
								</span>
							))}
						</span>
					)}
				</span>
			</div>
		);
	}

	/* A neutral is the third number worth naming, and it sits where the map's own middle is. */
	const geoms = center != null && center > lo && center < hi ? [lo, center, hi] : [lo, (lo + hi) / 2, hi];

	return (
		<div className="contents">
			<span className="text-xs text-muted-foreground">{label}</span>
			<span className="flex min-w-0 flex-col gap-1">
				<svg width={BAR_W} height={BAR_H} aria-hidden>
					<defs>
						<linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
							{Array.from({length: STOPS}, (_, step) => {
								const t = step / (STOPS - 1);
								return <stop key={step} offset={t} stopColor={ramp(lo + (hi - lo) * t)} />;
							})}
						</linearGradient>
					</defs>
					<rect x={0} y={0} width={BAR_W} height={BAR_H} fill={`url(#${gradientId})`} />
				</svg>
				{named ?? (
					<span className="flex justify-between" style={{width: BAR_W}}>
						{geoms.map((value, index) => (
							<span key={`${index}-${value}`} className="text-2xs text-muted-foreground" style={TABULAR}>
								{say(value)}
							</span>
						))}
					</span>
				)}
			</span>
		</div>
	);
}
