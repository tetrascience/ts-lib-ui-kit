/**
 * A turn divided into sectors. Each sector carries its own reading range.
 *
 * The model is circlize's. A sector's width comes from the span it covers.
 */

import {scaleLinear} from "d3-scale";

/** A sector and the range it covers, in the column's own units. */
export interface SectorSpec {
	id: string;
	xlim: [number, number];
}

/** Columns holding the far end of a link. The near end is the figure's own position channels. */
export interface LinkFields {
	sector: string;
	start: string;
	/** Absent anchors the far end at its start. */
	end?: string;
	/** A measure each link reads, for the magnitude map. Absent leaves the links on one ink. */
	value?: string;
}

/** A link between two positions. Each end reads in its own sector's units. */
export interface PositionLink {
	sector: string;
	start: number;
	end: number;
	other: string;
	otherStart: number;
	otherEnd: number;
	/** What this link measures, where a column was bound. */
	value?: number;
}

/** A sector placed on the turn. Angles run clockwise from twelve, in radians. */
export interface PlacedSector extends SectorSpec {
	from: number;
	to: number;
	/** Halfway between the ends, which is where a name goes. */
	mid: number;
}

export interface CircularOptions {
	/**
	 * Gap after each sector, in degrees.
	 *
	 * circlize's `gap.degree`, at its own default of 1.
	 */
	gap?: number;
	/**
	 * Where the first sector starts, in degrees counterclockwise from twelve.
	 *
	 * The sectors then run clockwise from it, and the angles a layout returns read clockwise from twelve.
	 */
	start?: number;
}

export interface CircularLayout {
	sectors: PlacedSector[];
	/** What the sectors cover between them, in their own units. */
	span: number;
}

/**
 * Sectors placed round the turn, in the order they arrive.
 *
 * A sector's width is its share of the span the figure covers. The gaps come off the turn first.
 */
export function circularLayout(
	sectors: readonly SectorSpec[],
	{gap = 1, start = 0}: CircularOptions = {},
): CircularLayout {
	const widths = sectors.map((sector) => Math.max(0, sector.xlim[1] - sector.xlim[0]));
	const span = widths.reduce((held, width) => held + width, 0);
	if (sectors.length === 0 || span <= 0) return {sectors: [], span: 0};

	const gaps = (gap * Math.PI) / 180;
	const available = Math.max(0, Math.PI * 2 - gaps * sectors.length);

	const placed: PlacedSector[] = [];
	let at = (-start * Math.PI) / 180;
	sectors.forEach((sector, index) => {
		const to = at + (widths[index]! / span) * available;
		placed.push({...sector, from: at, to, mid: (at + to) / 2});
		at = to + gaps;
	});

	return {sectors: placed, span};
}

/**
 * Where one reading inside a sector falls, as an angle.
 *
 * A reading past either end is pinned there. A sector covering no range answers its own middle.
 */
export function sectorAngle(sector: PlacedSector, x: number): number {
	const [lo, hi] = sector.xlim;
	const width = hi - lo;
	if (!(width > 0)) return sector.mid;
	const at = Math.min(1, Math.max(0, (x - lo) / width));
	return sector.from + at * (sector.to - sector.from);
}

/**
 * Where a reading falls across a track's own scale, as a radius.
 *
 * One track holds one scale. A reader compares two sectors against it.
 */
export function trackRadius(band: {inner: number; outer: number}, domain: [number, number], y: number): number {
	const [lo, hi] = domain;
	const width = hi - lo;
	if (!(width > 0)) return band.inner;
	const at = Math.min(1, Math.max(0, (y - lo) / width));
	return band.inner + at * (band.outer - band.inner);
}

/**
 * Readings a sector's own axis writes, over the range it covers.
 *
 * The same step every other axis in the package takes.
 */
export function sectorTicks(sector: SectorSpec, room: number): number[] {
	if (room < 2) return [];
	return scaleLinear().domain(sector.xlim).ticks(room);
}
