/**
 * A flow closed into a circle.
 *
 * Angles come out in radians and no radius enters. The geom picks the radii it draws on.
 */

import {circularLayout, sectorAngle, type PlacedSector} from "./circular.js";

/** One link of a chord, which is the row shape a flow already reads. */
export interface ChordLink {
	source: string;
	target: string;
	value: number;
	color?: string;
}

/** A name's own arc. `value` is the total passing through it, both ways counted. */
export interface ChordSector extends PlacedSector {
	value: number;
	color?: string;
}

/** One pair's ribbon, as the two angular ranges it occupies. */
export interface ChordRibbon extends ChordLink {
	/** Range inside the source's sector. */
	at: [number, number];
	/** Range inside the target's sector. */
	to: [number, number];
}

export interface ChordLayout {
	sectors: ChordSector[];
	ribbons: ChordRibbon[];
	/** What one turn stands for, less the gaps. */
	total: number;
	/** Sectors the cap turned down. The footer owes a clause for it. */
	dropped: number;
}

export interface ChordOptions {
	/** Gap between one sector and the next, in degrees. Default 2. */
	gap?: number;
	/** Where the first sector starts, in degrees counterclockwise from twelve. Default 0. */
	start?: number;
	/** Sectors to keep, largest first. */
	cap?: number;
}

/** Sectors past this are slivers with names that collide. The footer states the count. */
export const CHORD_CAP = 26;

/**
 * Sectors placed and ribbons seated inside them.
 *
 * A name's sector is sized by everything touching it. The widest link of a sector seats first.
 */
export function chordLayout(
	links: readonly ChordLink[],
	{gap = 2, start = 0, cap = CHORD_CAP}: ChordOptions = {},
): ChordLayout {
	const total = new Map<string, number>();
	const carry = (name: string, value: number) => total.set(name, (total.get(name) ?? 0) + value);
	for (const link of links) {
		if (!(link.value > 0)) continue;
		carry(link.source, link.value);
		carry(link.target, link.value);
	}

	const ranked = [...total].sort((a, b) => b[1] - a[1]);
	const kept = new Set(ranked.slice(0, cap).map(([name]) => name));
	const dropped = ranked.length - kept.size;

	const seated = links.filter((link) => link.value > 0 && kept.has(link.source) && kept.has(link.target));
	if (seated.length === 0) return {sectors: [], ribbons: [], total: 0, dropped};

	/* Recounted over what stayed. A dropped sector leaves no gap in the turn. */
	const shown = new Map<string, number>();
	for (const link of seated) {
		shown.set(link.source, (shown.get(link.source) ?? 0) + link.value);
		shown.set(link.target, (shown.get(link.target) ?? 0) + link.value);
	}

	/* A sector covers its own total, which is the range its axis writes and its ribbons seat in. */
	const order = [...shown].sort((a, b) => b[1] - a[1]);
	const turn = circularLayout(
		order.map(([id, value]) => ({id, xlim: [0, value] as [number, number]})),
		{gap, start},
	);

	const sectors: ChordSector[] = turn.sectors.map((sector) => ({...sector, value: sector.xlim[1]}));
	const placed = new Map(sectors.map((sector) => [sector.id, sector]));

	/* The widest link seats first at both ends, which keeps the biggest ribbons off the gaps. */
	const offset = new Map<string, number>();
	const ribbons: ChordRibbon[] = [];

	/* An end is seated in the sector's own units, so the axis beside it reads the same numbers. */
	const seat = (sector: ChordSector, value: number): [number, number] => {
		const from = offset.get(sector.id) ?? 0;
		offset.set(sector.id, from + value);
		return [sectorAngle(sector, from), sectorAngle(sector, from + value)];
	};

	for (const link of [...seated].sort((a, b) => b.value - a.value)) {
		const source = placed.get(link.source);
		const target = placed.get(link.target);
		if (!source || !target) continue;
		ribbons.push({...link, at: seat(source, link.value), to: seat(target, link.value)});
	}

	return {sectors, ribbons, total: turn.span, dropped};
}
