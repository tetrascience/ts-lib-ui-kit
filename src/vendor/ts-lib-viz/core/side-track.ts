/**
 * An annotation track resolved against its band.
 *
 * A track reads a column of the same table. A category takes its modal value per group and a
 * measure takes the mean.
 */

import {boundsOf} from "./aggregate.js";
import {groupRows, type PlotData, type PlotField} from "./plot-data.js";
import {pinnedOver} from "./figure-set.js";
import {rampPosition, type Palettes} from "./layers.js";
import {sequentialCss} from "./palette.js";

/**
 * The sequential map a numeric track draws on.
 *
 * Separate from `DEFAULT_SEQUENTIAL`. One ramp with two meanings is the failure chart-design
 * rule 8 names.
 */
export const TRACK_SEQUENTIAL = "mako";

/** One track, resolved onto the categories the band drew. */
export type SideTrack =
	| {
			kind: "identity";
			field: string;
			/** The column's own name. The legend is labeled with it. */
			label: string;
			axis: "x" | "y";
			/** The value for each category. A category with no reading is absent. */
			at: Map<string, string>;
			/** Position in the categorical palette per value, with a set's assignments in force. */
			codes: Map<string, number>;
			/**
			 * The values the legend names, in the order the strip drew them.
			 *
			 * Defaults to the drawn values. With `dropLevels` off, each value the set pinned on the
			 * field follows them.
			 */
			levels: string[];
			/** Categories with more than one value in the group. The modal one drew. */
			disagreed: string[];
	  }
	| {
			kind: "magnitude";
			field: string;
			label: string;
			axis: "x" | "y";
			at: Map<string, number>;
			/** The two ends of what the track measured, in its own units. */
			domain: [number, number];
			/** Name of the sequential map, separate from the cells' map. The figure's palettes resolve it. */
			palette: string;
	  };

/** The value a group has most often, and whether the group had more than one. */
function modal(counts: Map<string, number>): {value: string; alone: boolean} | null {
	let best: string | null = null;
	let most = 0;
	for (const [value, count] of counts) {
		if (count > most) {
			most = count;
			best = value;
		}
	}
	return best == null ? null : {value: best, alone: counts.size === 1};
}

/**
 * A track over a band's categories.
 *
 * `categories` is the band in drawn order and `keyField` is their column. A category with no
 * reading is left out.
 */
export function trackFor({
	field,
	axis,
	categories,
	keyField,
	data,
	fieldAt,
	palette = TRACK_SEQUENTIAL,
	pinned,
	dropLevels = true,
	alias,
}: {
	field: string;
	axis: "x" | "y";
	categories: string[];
	keyField: string;
	data: PlotData;
	fieldAt: Map<string, PlotField>;
	palette?: string;
	pinned?: Record<string, number>;
	dropLevels?: boolean;
	/** A row's own key to the category it draws under, where a kmeans order replaced the band. */
	alias?: Map<string, string>;
}): SideTrack | null {
	const held = fieldAt.get(field);
	if (!held || categories.length === 0) return null;
	const within = new Set(categories);
	/* A reduced band draws centroids and the rows behind one centroid answer together. */
	const drawnAs = (key: string): string => alias?.get(key) ?? key;

	if (held.numeric) {
		const totals = new Map<string, {sum: number; n: number}>();
		for (const group of groupRows(data, keyField, field, "mean")) {
			const category = drawnAs(group.key);
			if (!within.has(category)) continue;
			const running = totals.get(category) ?? {sum: 0, n: 0};
			running.sum += group.value * group.n;
			running.n += group.n;
			totals.set(category, running);
		}
		const at = new Map<string, number>();
		for (const [category, {sum, n}] of totals) if (n > 0) at.set(category, sum / n);
		if (at.size === 0) return null;
		return {
			kind: "magnitude",
			field,
			label: held.unit ? `${held.label} (${held.unit})` : held.label,
			axis,
			at,
			domain: boundsOf([...at.values()]),
			palette,
		};
	}

	const counted = new Map<string, Map<string, number>>();
	for (let row = 0; row < data.rowCount; row += 1) {
		const read = data.text(row, keyField);
		if (read == null) continue;
		const key = drawnAs(read);
		if (!within.has(key)) continue;
		const value = data.text(row, field);
		if (value == null) continue;
		let counts = counted.get(key);
		if (!counts) {
			counts = new Map();
			counted.set(key, counts);
		}
		counts.set(value, (counts.get(value) ?? 0) + 1);
	}

	const at = new Map<string, string>();
	const disagreed: string[] = [];
	/* Walked in the band's order. The first-seen order behind the codes is the drawn order. */
	for (const category of categories) {
		const counts = counted.get(category);
		if (!counts) continue;
		const picked = modal(counts);
		if (!picked) continue;
		at.set(category, picked.value);
		if (!picked.alone) disagreed.push(category);
	}
	if (at.size === 0) return null;

	const seen = new Map<string, number>();
	for (const value of at.values()) if (!seen.has(value)) seen.set(value, seen.size);

	const codes = pinnedOver(seen, pinned);
	/* Drawn first either way. A legend keeping unused levels still opens on what is here. */
	const levels = dropLevels ? [...seen.keys()] : [...seen.keys(), ...[...codes.keys()].filter((v) => !seen.has(v))];

	return {kind: "identity", field, label: held.label, axis, at, codes, levels, disagreed};
}

/**
 * A track over a band of measures.
 *
 * A track here binds a property of the field -- its unit, role, direction or cut. Keyed by the
 * label the band drew.
 */
export function trackOverFields({
	field,
	axis,
	categories,
	measures,
	palette = TRACK_SEQUENTIAL,
	pinned,
	dropLevels = true,
}: {
	/** Name of the property read off each measure. The legend is labeled with it. */
	field: string;
	axis: "x" | "y";
	/** The band in its drawn order. For this grid the measure labels. */
	categories: string[];
	measures: PlotField[];
	palette?: string;
	pinned?: Record<string, number>;
	dropLevels?: boolean;
}): SideTrack | null {
	const within = new Set(categories);
	const held = measures.filter((measure) => within.has(measure.label));
	if (held.length === 0) return null;

	const read = (measure: PlotField) => (measure as unknown as Record<string, unknown>)[field];
	const numeric = held.some((measure) => typeof read(measure) === "number");

	if (numeric) {
		const at = new Map<string, number>();
		for (const measure of held) {
			const value = read(measure);
			if (typeof value === "number" && Number.isFinite(value)) at.set(measure.label, value);
		}
		if (at.size === 0) return null;
		const readings = [...at.values()];
		return {
			kind: "magnitude",
			field,
			label: field,
			axis,
			at,
			domain: boundsOf(readings),
			palette,
		};
	}

	const byLabel = new Map(held.map((one) => [one.label, one]));
	const at = new Map<string, string>();
	/* Walked in the band's order. The first-seen order behind the codes is the drawn order. */
	for (const category of categories) {
		const measure = byLabel.get(category);
		const value = measure ? read(measure) : undefined;
		if (typeof value === "string" && value.length > 0) at.set(category, value);
	}
	if (at.size === 0) return null;

	const seen = new Map<string, number>();
	for (const value of at.values()) if (!seen.has(value)) seen.set(value, seen.size);

	const codes = pinnedOver(seen, pinned);
	const levels = dropLevels ? [...seen.keys()] : [...seen.keys(), ...[...codes.keys()].filter((v) => !seen.has(v))];

	/* A declaration is one value per measure. No group disagrees with itself. */
	return {kind: "identity", field, label: field, axis, at, codes, levels, disagreed: []};
}

/**
 * The map a numeric track's legend samples, taking a value in the track's own units.
 *
 * The same contract `Trace.ramp` states and `ColorLegend` reads. The figure's palettes resolve the
 * track's map, as they resolve a layer's. Palettes holding no `sequentialFor` fall back to the registry.
 */
export function trackRamp(
	track: Extract<SideTrack, {kind: "magnitude"}>,
	palettes: Palettes,
	dark = false,
): (value: number) => string {
	const [lo, hi] = track.domain;
	const ramp = palettes.sequentialFor?.(track.palette) ?? ((t: number) => sequentialCss(t, track.palette, dark));
	return (value) => ramp(rampPosition(value, lo, hi));
}

/**
 * The fill each of a track's categories takes, or null with no reading.
 *
 * A category track reads the figure's categorical map. A measure track reads the sequential map
 * it named.
 */
export function trackFill(track: SideTrack, palettes: Palettes, dark = false): (category: string) => string | null {
	if (track.kind === "identity") {
		return (category) => {
			const value = track.at.get(category);
			const code = value == null ? undefined : track.codes.get(value);
			return code == null ? null : palettes.categorical(code);
		};
	}

	const ramp = trackRamp(track, palettes, dark);
	return (category) => {
		const value = track.at.get(category);
		return value == null ? null : ramp(value);
	};
}
