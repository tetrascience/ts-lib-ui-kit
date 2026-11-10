/**
 * The readings written round a set of sectors.
 *
 * A chord and an ideogram share it. Both write their readings radially at one type size.
 */

import {
	polarPoint,
	sectorAngle,
	sectorTicks,
	textRun,
	withoutCollisions,
	LABEL_GAP,
	TITLE_PAD,
	type PlacedSector,
	type RingLayout,
} from "../../core/internal.js";

/** Room one radial reading claims along the ring, as a multiple of its type size. */
const PITCH = 1.35;

/** Length of one tick outside the ring, in pixels. */
export const TICK_LEN = 4;

/** What a sector draws with once the categorical map has run out of colors. */
export const SECTOR_INK = "var(--viz-ink-muted)";

/**
 * Hue per sector: its own color, the author's fill, then the categorical map.
 *
 * Past the map's length the sectors share one ink, and the names tell them apart.
 */
export function sectorHues(
	sectors: readonly {id: string; color?: string}[],
	identity: (index: number) => string,
	categoricalSize?: number,
	fill?: string,
): Map<string, string> {
	const flat = categoricalSize != null && sectors.length > categoricalSize;
	return new Map(
		sectors.map((sector, index) => [sector.id, sector.color ?? fill ?? (flat ? SECTOR_INK : identity(index))]),
	);
}

/**
 * Where a reading round the ring is written, kept upright down the left side.
 *
 * The angle folds into one turn first. A rotated ring runs past 360 degrees.
 */
export function writtenAt(panel: RingLayout, angle: number, radius: number) {
	const degrees = ((((angle * 180) / Math.PI) % 360) + 360) % 360;
	const turned = degrees > 180;
	const on = polarPoint(panel, radius, angle);
	return {
		x: on.x,
		y: on.y,
		anchor: turned ? ("end" as const) : ("start" as const),
		rotate: `rotate(${turned ? degrees + 90 : degrees - 90} ${on.x} ${on.y})`,
	};
}

/**
 * Characters a reading is reserved room for before one is drawn.
 *
 * The room comes first and the readings follow, so the count is a guess. `150M` is four.
 */
const TICK_CHARS = 5;

/**
 * Room the readings and the names claim outside a ring, in pixels.
 *
 * Built the way `axisRoom` builds a margin: the tick, the gap, the reading, then the name past a
 * title's own padding.
 */
export function sectorTextRoom(longestName: number, fontSize: number): number {
	return TICK_LEN + LABEL_GAP + textRun(TICK_CHARS, fontSize) + TITLE_PAD + textRun(longestName, fontSize);
}

export interface SectorTick {
	key: string;
	angle: number;
	text: string;
}

export interface SectorAxisArgs {
	sectors: readonly PlacedSector[];
	panel: RingLayout;
	/** Radius the ring reaches. The readings and the names stack outward from it. */
	from: number;
	fontSize: number;
	/** A reading in its own units. Absent writes no readings and leaves the names against the ring. */
	format?: (value: number) => string;
	/** Which readings are written. Absent writes each one with room. */
	wanted?: (value: number) => boolean;
}

export interface SectorAxis {
	ticks: SectorTick[];
	/** Radius the readings are written at. */
	radius: number;
	/** Radius the names clear the readings at. */
	nameRadius: number;
}

/**
 * Readings placed round the ring, minus the ones landing on a neighbor.
 *
 * The thinning runs across the whole turn. One sector's last reading meets the next one's first.
 */
export function sectorAxis({sectors, panel, from, fontSize, format, wanted}: SectorAxisArgs): SectorAxis {
	const radius = from + TICK_LEN + LABEL_GAP;
	if (!format) return {ticks: [], radius, nameRadius: from + LABEL_GAP};

	const opening: SectorTick[] = [];
	const rest: SectorTick[] = [];

	for (const sector of sectors) {
		/* Room off the arc's own length. A sector too short for one reading asks for none. */
		const arc = (sector.to - sector.from) * radius;
		const fits = Math.floor(arc / (fontSize * PITCH));
		if (fits < 1) continue;

		/* A step wider than the sector leaves `ticks` empty, and the sector's own start stands in. */
		const readings = sectorTicks(sector, fits);
		const held = (readings.length > 0 ? readings : [sector.xlim[0]]).filter((reading) => wanted?.(reading) ?? true);

		held.forEach((reading, index) => {
			const tick = {key: `${sector.id}-${reading}`, angle: sectorAngle(sector, reading), text: format(reading)};
			(index === 0 ? opening : rest).push(tick);
		});
	}

	/*
    Each sector's own first reading is offered before any interior one.

    `withoutCollisions` keeps what it meets first, so a sector holding one reading keeps it against
    a neighbor's second.
  */
	opening.sort((a, b) => a.angle - b.angle);
	rest.sort((a, b) => a.angle - b.angle);
	const offered = [...opening, ...rest];

	/* A radial reading runs outward. What one claims along the ring is its own height. */
	const side = fontSize * PITCH;
	const boxes = offered.map((tick) => {
		const on = polarPoint(panel, radius, tick.angle);
		return {x: on.x, y: on.y, width: side, height: side};
	});

	const ticks = withoutCollisions(boxes)
		.map((index) => offered[index]!)
		.sort((a, b) => a.angle - b.angle);

	/* The names clear the longest reading that survived, past a title's own padding. */
	const longest = ticks.reduce((held, tick) => Math.max(held, tick.text.length), 0);
	return {ticks, radius, nameRadius: radius + textRun(longest, fontSize) + TITLE_PAD};
}
