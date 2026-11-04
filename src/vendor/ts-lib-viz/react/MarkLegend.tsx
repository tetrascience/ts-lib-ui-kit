/**
 * Draws one sample mark per level of a bound shape, dash or categorical opacity.
 *
 * One component serves the three. A guide for each asks the reader the same thing: here is a mark,
 * here is what it stands for. `ColorLegend` draws a bar because a measure is continuous, and
 * `SizeLegend` draws three circles because area is judged against a neighbor. A glyph and a pattern
 * are neither, so the guide is the marks themselves.
 *
 * The sample takes the trace's own ink, so a reader matches it against the chart by eye instead of
 * by name. A figure that bound the channel to separate its groups without hue carries one color
 * across the set, which is the case chart-design rule 8 is about.
 */

import {dashArray, type Linetype, type PointShape} from "../core/internal.js";

import {glyph} from "./geoms/Points.js";

/** How wide a sample sits, in pixels. Wide enough for two runs of the longest pattern to read. */
const SAMPLE = 26;

const HEIGHT = 12;

/** One level, with the mark that stands for it. */
export interface MarkLevel {
	label: string;
	/** Glyph the sample draws. Absent draws a run instead, which is what a dash guide wants. */
	shape?: PointShape;
	/** Pattern the run draws, where the sample is a run. */
	dash?: Linetype;
	/** Opacity the sample draws at. Absent draws it solid. */
	opacity?: number;
}

export interface MarkLegendProps {
	/** The channel's own field, or the name an author gave the guide. */
	label?: string;
	levels: readonly MarkLevel[];
	/** Ink the samples take, which is the color the marks carry on the chart. */
	color: string;
	orientation?: "row" | "column";
}

export function MarkLegend({label, levels, color, orientation = "row"}: MarkLegendProps) {
	if (levels.length === 0) return null;

	const lay = orientation === "column" ? "flex-col items-start" : "flex-wrap items-center";

	return (
		<div className="contents">
			<span className="text-xs text-muted-foreground">{label}</span>
			<span className={`flex min-w-0 ${lay} gap-x-3 gap-y-1`}>
				{levels.map((level) => (
					<span key={level.label} className="flex items-center gap-1.5">
						<svg width={SAMPLE} height={HEIGHT} aria-hidden>
							{level.shape ? (
								<path
									d={glyph(level.shape, SAMPLE / 2, HEIGHT / 2, 4)}
									fill={color}
									fillOpacity={level.opacity ?? 0.85}
								/>
							) : (
								<line
									x1={1}
									x2={SAMPLE - 1}
									y1={HEIGHT / 2}
									y2={HEIGHT / 2}
									stroke={color}
									strokeWidth={1.6}
									strokeOpacity={level.opacity ?? 0.85}
									strokeDasharray={dashArray(level.dash)}
									strokeLinecap="round"
								/>
							)}
						</svg>
						<span className="text-xs text-muted-foreground">{level.label}</span>
					</span>
				))}
			</span>
		</div>
	);
}
