/**
 * A flow between names, closed into a circle.
 *
 * `GRAMMAR` answers `polar`. The geom takes the panel whole and places its own sectors.
 */

import {RingStack} from "./RingStack.js";
import {sectorAxis, sectorHues, sectorTextRoom, TICK_LEN, writtenAt} from "./sector-axis.js";
import {
	chordLayout,
	polarPoint,
	ringBands,
	ringLayout,
	RING_GAP,
	type ChordLink,
	type GeomHit,
	type RingPanel,
	type RingReading,
} from "../../core/internal.js";

/** Weight of the band a sector draws, in pixels. */
const SECTOR_WEIGHT = 10;

/** Weak enough that a ribbon crossing another stays readable. */
const RIBBON_OPACITY = 0.62;

export interface ChordProps {
	links: ChordLink[];
	width: number;
	height: number;
	/** Hue per sector, taken off the categorical map. Read where a link states no `color`. */
	identity: (index: number) => string;
	/** Distinct colors that map offers. More sectors than this draws them all in one ink. */
	categoricalSize?: number;
	/** The magnitude map, over 0..1. A ring's dots read their own values against it. */
	ramp?: (t: number) => string;
	/** The value the magnitude map treats as its middle, where the map has two arms. */
	center?: number;
	/** One hue for the whole figure, where the author picked one. */
	fill?: string;
	opacity?: number;
	/** Gap between one sector and the next, in degrees. */
	gap?: number;
	/** Where the first sector starts, in degrees counterclockwise from twelve. */
	rotate?: number;
	/** Radial gap between the sector band and the ribbons, in pixels. */
	inset?: number;
	/** Type size for the names and the readings, in pixels. Absent writes neither. */
	fontSize?: number;
	/**
	 * The readings round each sector, in their own units. Absent draws no axis.
	 *
	 * `wanted` picks the readings written and `color` inks them.
	 */
	numbers?: {format: (value: number) => string; wanted?: (value: number) => boolean; color?: string};
	/** Writes each sector's name outside its band. */
	names?: boolean;
	/** Rings stacked outside the sector band, innermost first. */
	panels?: readonly RingPanel[];
	/** What each ring read, in the same order. A ring with no reading draws nothing. */
	rings?: (RingReading | null)[];
	/**
	 * The ribbon or sector under the pointer, and null when it leaves.
	 *
	 * Given, the geom drops the browser's title boxes and the caller draws the card at `at`.
	 */
	onHover?: (
		hit: (GeomHit<ChordLink> & {kind: "flow"}) | (GeomHit<{id: string; value: number}> & {kind: "sector"}) | null,
	) => void;
}

export function Chord({
	links,
	width,
	height,
	identity,
	categoricalSize,
	ramp,
	center,
	fill,
	opacity = 1,
	gap,
	rotate,
	inset = 0,
	fontSize,
	numbers,
	names = true,
	panels = [],
	rings = [],
	onHover,
}: ChordProps) {
	if (links.length === 0 || width <= 0 || height <= 0) return null;

	const panel = ringLayout(width, height);
	const longestName = links.reduce((held, link) => Math.max(held, link.source.length, link.target.length), 0);
	const room = fontSize == null ? 0 : sectorTextRoom(longestName, fontSize);
	/* The stack takes its room off the figure, so the sectors give way to the rings outside them. */
	const stack = panels.reduce((held, one) => held + Math.max(0, one.size) + (one.gap ?? RING_GAP), 0);
	const sectorRadius = Math.max(0, panel.outer - room - stack) - SECTOR_WEIGHT / 2;
	if (sectorRadius <= 0) return null;

	const layout = chordLayout(links, {gap, start: rotate});
	const hue = sectorHues(layout.sectors, identity, categoricalSize, fill);
	const ribbonRadius = Math.max(0, sectorRadius - SECTOR_WEIGHT / 2 - inset);

	/* The readout a pointer gets. A chord has no axis to read a ribbon's own value off. */
	const reads = numbers?.format ?? ((value: number) => String(value));

	const at = (radius: number, angle: number) => polarPoint(panel, radius, angle);
	const point = (radius: number, angle: number) => {
		const on = at(radius, angle);
		return `${on.x} ${on.y}`;
	};
	const sweep = (radius: number, from: number, to: number) =>
		`A ${radius} ${radius} 0 ${to - from > Math.PI ? 1 : 0} 1 ${point(radius, to)}`;

	/* Out along one end, through the middle, out along the other, and back through the middle. */
	const ribbon = (from: [number, number], to: [number, number]) =>
		[
			`M ${point(ribbonRadius, from[0])}`,
			sweep(ribbonRadius, from[0], from[1]),
			`Q ${panel.cx} ${panel.cy} ${point(ribbonRadius, to[0])}`,
			sweep(ribbonRadius, to[0], to[1]),
			`Q ${panel.cx} ${panel.cy} ${point(ribbonRadius, from[0])}`,
			"Z",
		].join(" ");

	/** The middle of a ribbon's curve, where its card is placed. */
	const spine = (from: [number, number], to: [number, number]) => {
		const head = at(ribbonRadius, (from[0] + from[1]) / 2);
		const tail = at(ribbonRadius, (to[0] + to[1]) / 2);
		return {x: (head.x + 2 * panel.cx + tail.x) / 4, y: (head.y + 2 * panel.cy + tail.y) / 4};
	};

	const written = (angle: number, radius: number) => writtenAt(panel, angle, radius);

	const bands = ringBands(sectorRadius + SECTOR_WEIGHT / 2, panels);
	const outermost = bands.length > 0 ? bands[bands.length - 1]!.outer : sectorRadius + SECTOR_WEIGHT / 2;

	/* Past the readings the axis writes, which run outward from their own ticks. */
	const axis = sectorAxis({
		sectors: layout.sectors,
		panel,
		from: outermost,
		fontSize: fontSize ?? 11,
		format: numbers?.format,
		wanted: numbers?.wanted,
	});
	const axes = fontSize == null ? [] : axis.ticks;

	return (
		<>
			<g data-geom="chord-ribbons" fillOpacity={RIBBON_OPACITY * opacity}>
				{layout.ribbons.map((one, index) => (
					<path
						key={`${one.source}-${one.target}-${index}`}
						d={ribbon(one.at, one.to)}
						fill={one.color ?? hue.get(one.source) ?? "var(--viz-ink-muted)"}
						onMouseEnter={() => onHover?.({kind: "flow", datum: one, index, at: spine(one.at, one.to)})}
						onMouseLeave={() => onHover?.(null)}
					>
						{!onHover && <title>{`${one.source} to ${one.target}, ${reads(one.value)}`}</title>}
					</path>
				))}
			</g>

			<g data-geom="chord" fill="none" strokeWidth={SECTOR_WEIGHT}>
				{layout.sectors.map((sector, index) => (
					<path
						key={sector.id}
						d={`M ${point(sectorRadius, sector.from)} ${sweep(sectorRadius, sector.from, sector.to)}`}
						stroke={hue.get(sector.id)}
						strokeOpacity={opacity}
						onMouseEnter={() =>
							onHover?.({
								kind: "sector",
								datum: {id: sector.id, value: sector.value},
								index,
								at: at(sectorRadius, sector.mid),
							})
						}
						onMouseLeave={() => onHover?.(null)}
					>
						{!onHover && <title>{`${sector.id}, ${reads(sector.value)}`}</title>}
					</path>
				))}
			</g>

			<RingStack
				panel={panel}
				sectors={layout.sectors}
				bands={bands}
				readings={rings}
				hue={hue}
				identity={identity}
				ramp={fill == null ? ramp : undefined}
				center={center}
				opacity={opacity}
				format={reads}
				ribbons={layout.ribbons}
			/>

			{axes.length > 0 && fontSize != null && (
				<g
					data-geom="chord-axis"
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

			{names && fontSize != null && (
				<g data-geom="chord-labels" fontSize={fontSize} pointerEvents="none" fill="var(--viz-ink)">
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
