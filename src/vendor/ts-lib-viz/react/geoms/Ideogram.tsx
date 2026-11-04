/**
 * A genome round a circle, drawn as one sector per chromosome.
 *
 * `GRAMMAR` answers `polar`. A sector carries its own base-pair range and a tile keeps its span.
 */

import {
	arcPath,
	circularLayout,
	linkPath,
	polarPoint,
	rampPosition,
	ringBands,
	ringLayout,
	sectorAngle,
	RING_GAP,
	type PositionLink,
	type RingPanel,
	type RingReading,
	type SectorSpec,
} from "../../core/internal.js";

import {RingStack} from "./RingStack.js";
import {sectorAxis, sectorHues, sectorTextRoom, TICK_LEN, writtenAt} from "./sector-axis.js";

/** Weight of the band a chromosome draws, in pixels. */
const BAND_WEIGHT = 12;

/** Radial gap between the band and the links inside it, in pixels. */
const LINK_INSET = 4;

/** Weak enough that a link crossing another stays readable. */
const LINK_OPACITY = 0.55;

export interface IdeogramProps {
	sectors: SectorSpec[];
	/** One span per row, in its sector's own units. */
	tiles: {sector: string; start: number; end: number; level?: string}[];
	/** The stains a tile paints by, in the order they were met. */
	levels: string[];
	/** One pair of positions per link, drawn inside the band. */
	links?: PositionLink[];
	/** Where the links' own measure runs. A link with a value reads the magnitude map against it. */
	linkDomain?: [number, number];
	width: number;
	height: number;
	/** Hue per stain, taken off the categorical map. */
	identity: (index: number) => string;
	/** Distinct colors that map offers. More sectors than this draws them all in one ink. */
	categoricalSize?: number;
	/** The color a Giemsa stain draws with. A level it declines falls back to the categorical map. */
	stain?: (stain: string) => string | undefined;
	/** The magnitude map, over 0..1. A ring's dots read their own values against it. */
	ramp?: (t: number) => string;
	/** The value the magnitude map treats as its middle, where the map has two arms. */
	center?: number;
	/** One hue for the whole figure, where no stain is bound. */
	fill?: string;
	opacity?: number;
	/** Gap after each sector, in degrees. */
	gap?: number;
	/** Where the first sector starts, in degrees counterclockwise from twelve. */
	rotate?: number;
	/** Type size for the names and the readings, in pixels. Absent writes neither. */
	fontSize?: number;
	/**
	 * The readings round each sector, in their own units. Absent draws no axis.
	 *
	 * `wanted` picks the readings written and `color` inks them.
	 */
	numbers?: {format: (value: number) => string; wanted?: (value: number) => boolean; color?: string};
	/** Rings stacked outside the band, innermost first. */
	panels?: readonly RingPanel[];
	/** What each ring read, in the same order. */
	rings?: (RingReading | null)[];
}

export function Ideogram({
	sectors,
	tiles,
	levels,
	links = [],
	linkDomain,
	width,
	height,
	identity,
	categoricalSize,
	stain: stainOf,
	ramp,
	center,
	fill,
	opacity = 1,
	gap,
	rotate,
	fontSize,
	numbers,
	panels = [],
	rings = [],
}: IdeogramProps) {
	if (sectors.length === 0 || width <= 0 || height <= 0) return null;

	const panel = ringLayout(width, height);
	const longestName = sectors.reduce((held, sector) => Math.max(held, sector.id.length), 0);
	const room = fontSize == null ? 0 : sectorTextRoom(longestName, fontSize);
	const stack = panels.reduce((held, one) => held + Math.max(0, one.size) + (one.gap ?? RING_GAP), 0);
	const bandRadius = Math.max(0, panel.outer - room - stack) - BAND_WEIGHT / 2;
	if (bandRadius <= 0) return null;

	const layout = circularLayout(sectors, {gap, start: rotate});
	const placed = new Map(layout.sectors.map((sector) => [sector.id, sector]));
	const bands = ringBands(bandRadius + BAND_WEIGHT / 2, panels);
	const outermost = bands.length > 0 ? bands[bands.length - 1]!.outer : bandRadius + BAND_WEIGHT / 2;

	const reads = numbers?.format ?? ((value: number) => String(value));
	const hue = sectorHues(layout.sectors, identity, categoricalSize, fill);
	const at = (radius: number, angle: number) => polarPoint(panel, radius, angle);
	const written = (angle: number, radius: number) => writtenAt(panel, angle, radius);

	const axis = sectorAxis({
		sectors: layout.sectors,
		panel,
		from: outermost,
		fontSize: fontSize ?? 11,
		format: numbers?.format,
		wanted: numbers?.wanted,
	});
	const axes = fontSize == null ? [] : axis.ticks;

	/* The magnitude map, left out where the author's fill paints the whole figure. */
	const valued = fill == null ? ramp : undefined;
	/* A link with a measure reads the magnitude map. Anything else takes its source sector's hue. */
	const linkInk = (link: PositionLink) =>
		link.value != null && linkDomain && valued
			? valued(rampPosition(link.value, linkDomain[0], linkDomain[1], center))
			: hue.get(link.sector);

	/* Inside the band, anchored at the middle of the span each end covers. */
	const linkRadius = Math.max(0, bandRadius - BAND_WEIGHT / 2 - LINK_INSET);
	const drawn = links.flatMap((link) => {
		const near = placed.get(link.sector);
		const far = placed.get(link.other);
		if (!near || !far) return [];
		const from = sectorAngle(near, (link.start + link.end) / 2);
		const to = sectorAngle(far, (link.otherStart + link.otherEnd) / 2);
		return [{link, d: linkPath(panel, linkRadius, from, to)}];
	});

	return (
		<>
			{drawn.length > 0 && (
				<g data-geom="ideogram-links" fill="none" strokeOpacity={LINK_OPACITY * opacity}>
					{drawn.map(({link, d}) => (
						<path key={`${link.sector}:${link.start}-${link.other}:${link.otherStart}`} d={d} stroke={linkInk(link)}>
							<title>
								{`${link.sector} ${reads(link.start)} to ${link.other} ${reads(link.otherStart)}${
									link.value == null ? "" : `, ${reads(link.value)}`
								}`}
							</title>
						</path>
					))}
				</g>
			)}

			{/* One tile per row, painted by its stain, inside the sector it names. */}
			<g data-geom="ideogram">
				{tiles.map((tile, index) => {
					const sector = placed.get(tile.sector);
					if (!sector) return null;
					const level = tile.level == null ? -1 : levels.indexOf(tile.level);
					/* A stain the map knows paints by staining intensity. Anything else falls back. */
					const stain = tile.level == null ? undefined : stainOf?.(tile.level);
					return (
						<path
							key={index}
							d={arcPath(
								{...panel, inner: bandRadius - BAND_WEIGHT / 2, outer: bandRadius + BAND_WEIGHT / 2},
								sectorAngle(sector, tile.start),
								sectorAngle(sector, tile.end),
							)}
							fill={stain ?? (level < 0 ? hue.get(tile.sector) : identity(level))}
							fillOpacity={opacity}
							stroke="var(--viz-paper)"
							strokeWidth={0.4}
						>
							<title>{`${tile.sector} ${reads(tile.start)} to ${reads(tile.end)}${tile.level ? `, ${tile.level}` : ""}`}</title>
						</path>
					);
				})}
			</g>

			<RingStack
				panel={panel}
				sectors={layout.sectors}
				bands={bands}
				readings={rings}
				hue={hue}
				identity={identity}
				ramp={valued}
				center={center}
				opacity={opacity}
				format={reads}
			/>

			{axes.length > 0 && fontSize != null && (
				<g
					data-geom="ideogram-axis"
					fontSize={fontSize}
					pointerEvents="none"
					fill={numbers?.color ?? "var(--viz-ink-muted)"}
				>
					{axes.map((tick) => {
						const mark = written(tick.angle, axis.radius);
						const head = at(outermost, tick.angle);
						const tail = at(outermost + TICK_LEN, tick.angle);
						return (
							<g key={tick.key}>
								<line x1={head.x} y1={head.y} x2={tail.x} y2={tail.y} stroke="var(--viz-rule)" />
								<text x={mark.x} y={mark.y} textAnchor={mark.anchor} dominantBaseline="central" transform={mark.rotate}>
									{tick.text}
								</text>
							</g>
						);
					})}
				</g>
			)}

			{fontSize != null && (
				<g data-geom="ideogram-labels" fontSize={fontSize} pointerEvents="none" fill="var(--viz-ink)">
					{layout.sectors.map((sector) => {
						const mark = written(sector.mid, axis.nameRadius);
						return (
							<text
								key={sector.id}
								x={mark.x}
								y={mark.y}
								textAnchor={mark.anchor}
								dominantBaseline="central"
								transform={mark.rotate}
							>
								{sector.id}
							</text>
						);
					})}
				</g>
			)}
		</>
	);
}
