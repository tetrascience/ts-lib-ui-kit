/**
 * What a diameter stands for.
 *
 * A bound size channel draws geoms a reader can rank and cannot read back, so the ramp states the
 * two ends of the range and its middle. Three circles instead of a continuous bar, because area is
 * judged against a neighbor and not against a gradient.
 *
 * The middle sits at the value whose area is halfway, which is where the square-root scale puts it:
 * a ramp labeled at the arithmetic midpoint would say the middle geom stands for a number it does
 * not. See the ADR "Size is a channel and the critic has an opinion about it".
 */

import {sizeRadius} from "../core/internal.js";

/** Tabular figures, so a column of numbers lines up on the digit. */
const TABULAR: React.CSSProperties = {fontVariantNumeric: "tabular-nums"};

export interface SizeLegendProps {
	/** The field's name, with its unit where it carries one. */
	label: string;
	/** That field's range over the whole table. */
	domain: [number, number];
	/** Smallest and largest radius the channel resolved to, in pixels. */
	radii: readonly [number, number];
	/** Color the sample geoms draw in, so the ramp reads as the same chart. */
	color: string;
	/** Formats a value the way the axis and the readout do. */
	format?: (value: number) => string;
}

export function SizeLegend({label, domain, radii, color, format}: SizeLegendProps) {
	const [lo, hi] = domain;
	const say = format ?? ((value: number) => value.toLocaleString(undefined, {maximumSignificantDigits: 3}));
	const stops = [lo, lo + (hi - lo) / 2, hi];
	const widest = radii[1] * 2;

	return (
		<div className="contents">
			<span className="text-xs text-muted-foreground">{label}</span>
			<span className="flex min-w-0 flex-wrap items-end gap-x-3 gap-y-1">
				{stops.map((value) => {
					const r = sizeRadius(value, lo, hi, radii);
					return (
						<span key={value} className="flex flex-col items-center gap-1" style={{width: widest}}>
							<svg width={widest} height={widest} aria-hidden>
								<circle cx={widest / 2} cy={widest - r} r={r} fill={color} fillOpacity={0.85} />
							</svg>
							<span className="text-xs text-muted-foreground" style={TABULAR}>
								{say(value)}
							</span>
						</span>
					);
				})}
			</span>
		</div>
	);
}
