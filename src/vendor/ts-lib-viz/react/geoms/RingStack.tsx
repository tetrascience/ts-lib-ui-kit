/**
 * The rings a circular figure stacks outside itself.
 *
 * A chord and an ideogram share it. The bands arrive placed and the readings arrive resolved.
 */

import {
	arcPath,
	polarPoint,
	rampPosition,
	sectorAngle,
	trackRadius,
	type PlacedSector,
	type RingBand,
	type RingReading,
	type RingLayout,
} from "../../core/internal.js";

/** Gap either side of a bar inside its own sector, in radians. */
const BAR_GAP = 0.012;

/** Radius of a point a ring draws, in pixels. */
const POINT_R = 2.2;

/** Weak enough that a crowded track stays countable. */
const DOT_OPACITY = 0.7;

export interface RingStackProps {
	panel: RingLayout;
	sectors: readonly PlacedSector[];
	bands: readonly RingBand[];
	readings: readonly (RingReading | null)[];
	/** Hue per sector id. A bar and a dot take the hue of the sector they stand in. */
	hue: Map<string, string | undefined>;
	/** The categorical map, for a stack's own levels. */
	identity: (index: number) => string;
	/**
	 * The magnitude map, over 0..1. A dot reads its own value against the ring's scale.
	 *
	 * Absent leaves a dot on the hue of the sector it stands in.
	 */
	ramp?: (t: number) => string;
	/** The value the magnitude map treats as its middle, where the map has two arms. */
	center?: number;
	opacity?: number;
	/** A reading in its own units, for the readout a pointer gets. */
	format: (value: number) => string;
	/**
	 * Where each pair sits, for a ring drawing one point per pair.
	 *
	 * A chord hands its ribbons over. An ideogram has none and draws by position instead.
	 */
	ribbons?: readonly {source: string; target: string; at: [number, number]; to: [number, number]}[];
}

export function RingStack({
	panel,
	sectors,
	bands,
	readings,
	hue,
	identity,
	ramp,
	center,
	opacity = 1,
	format,
	ribbons,
}: RingStackProps) {
	if (bands.length === 0) return null;

	/* A dot stands for one reading. Its own value is what the color has to answer. */
	const dotInk = (sector: string, value: number, domain: readonly [number, number]) =>
		ramp ? ramp(rampPosition(value, domain[0], domain[1], center)) : hue.get(sector);
	const at = (radius: number, angle: number) => polarPoint(panel, radius, angle);
	const held = new Map(sectors.map((sector) => [sector.id, sector]));

	return (
		<g data-geom="rings">
			{bands.map((band, index) => {
				const reading = readings[index];
				if (!reading) return null;

				/* A point per pair, standing where that pair's own ribbon met the sector. */
				if (reading.kind === "point" && reading.points.length > 0) {
					return (
						<g key={index} data-geom="ring-point">
							{(ribbons ?? [])
								.flatMap((one) => {
									const point = reading.points.find(
										(entry) => entry.source === one.source && entry.target === one.target,
									);
									if (!point) return [];
									const radius = trackRadius(band, reading.domain, point.value);
									return [
										{id: `${one.source}-${one.target}-a`, angle: (one.at[0] + one.at[1]) / 2, radius, point},
										{id: `${one.source}-${one.target}-b`, angle: (one.to[0] + one.to[1]) / 2, radius, point},
									];
								})
								.map((dot) => {
									const on = at(dot.radius, dot.angle);
									return (
										<circle
											key={dot.id}
											cx={on.x}
											cy={on.y}
											r={POINT_R}
											fill={dotInk(dot.point.source, dot.point.value, reading.domain)}
											fillOpacity={opacity}
										>
											<title>{`${dot.point.source} to ${dot.point.target}, ${format(dot.point.value)}`}</title>
										</circle>
									);
								})}
						</g>
					);
				}

				/* A point per row, standing at its own position along the sector. */
				if (reading.kind === "point") {
					return (
						<g key={index} data-geom="ring-point">
							{reading.dots.map((dot, place) => {
								const sector = held.get(dot.sector);
								if (!sector) return null;
								const on = at(trackRadius(band, reading.domain, dot.value), sectorAngle(sector, dot.at));
								return (
									<circle
										key={place}
										cx={on.x}
										cy={on.y}
										r={POINT_R}
										fill={dotInk(dot.sector, dot.value, reading.domain)}
										fillOpacity={DOT_OPACITY * opacity}
									/>
								);
							})}
						</g>
					);
				}

				const reach = band.outer - band.inner;
				const top = reading.domain[1] || 1;
				return (
					<g key={index} data-geom={`ring-${reading.kind}`}>
						{reading.bars.map((bar) => {
							const sector = held.get(bar.sector);
							if (!sector) return null;
							const inner = band.inner + (bar.floor / top) * reach;
							const outer = band.inner + ((bar.floor + bar.value) / top) * reach;
							const level = bar.level == null ? -1 : reading.levels.indexOf(bar.level);
							return (
								<path
									key={`${bar.sector}-${bar.level ?? ""}`}
									d={arcPath(
										{...panel, inner, outer},
										sector.from + BAR_GAP,
										Math.max(sector.from + BAR_GAP, sector.to - BAR_GAP),
									)}
									fill={level < 0 ? hue.get(bar.sector) : identity(sectors.length + level)}
									fillOpacity={opacity}
								>
									<title>{`${bar.sector}${bar.level ? ` ${bar.level}` : ""}, ${format(bar.value)}`}</title>
								</path>
							);
						})}
					</g>
				);
			})}
		</g>
	);
}
