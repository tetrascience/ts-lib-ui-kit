/**
 * Capability profiles -- what a given role may author.
 *
 * A profile is serializable and the same object gates three places. Kinds and aesthetics are
 * allowlists, and setting groups are withheld by name. Absent means unrestricted.
 */

import {GEOMS, type Aesthetic, type GeomFacts} from "./geom-table.js";
import {KINDS} from "./grammar.js";
import type {ChartScales, ChartSpec, ColorScale, GuideScale, LayerSpec, PlotKind, PositionScale} from "./spec.js";

/**
 * The settings a profile can withhold.
 *
 * Grouped by the question a reader asks of the chart. Each spec field sits in one group or is the
 * chart's content, which kinds and aesthetics gate.
 */
export type SettingGroup =
	/** A transform on a position scale: log, sqrt or pseudo-log. */
	| "log-scale"
	/** What the position scales span and mark: limits, breaks, ticks, formats, labels, band order and size, and the coord. */
	| "axis-range"
	/** Rule width, tick length and side, label angle, title placement, type size, ink and grid. */
	| "axis-chrome"
	/** Notes and axis-end captions. */
	| "annotations"
	/** Fitted curves and smooths, with their confidence bands. */
	| "fits"
	/** Small-multiple grids. */
	| "facets"
	/** Geom size, width, opacity, color and glyph, and where geoms sharing a band sit. */
	| "geom-style"
	/** Direct labels on geoms, and the numbers written in cells. */
	| "labels"
	/** A second vertical scale. */
	| "second-axis"
	/** The figure's width and height, the panel's aspect, the data's ratio, and the sizing. */
	| "figure-size"
	/** The color and fill maps past their titles, and the palette a layer names. */
	| "color-scale"
	/** Where the legends draw, and which layers reach them. */
	| "legend"
	/** Panels beside the plot area, and rings outside a circular figure. */
	| "side-panels"
	/** What a layer computes: its aggregate, running total, statistic parameters, error bars and replicates. */
	| "statistics"
	/** Findings the author waived. A `wrong` finding passes the gate only through one. */
	| "overrides";

/**
 * A drawing surface a profile can withhold whole.
 *
 * `PlotKind` is the unit for a chart. A graph has no row in the grammar table and its gate is the
 * surface.
 */
export type SurfaceKind = "chart" | "graph";

export interface CapabilityProfile {
	id: string;
	label?: string;
	/**
	 * Surfaces the role may author. Absent allows both.
	 *
	 * Separate from `kinds`. Withholding a chart kind still leaves the chart surface.
	 */
	surfaces?: readonly SurfaceKind[];
	/** Plot kinds the role may author. Absent allows each kind the package draws. */
	kinds?: readonly PlotKind[];
	/**
	 * Aesthetics the role may bind, per kind.
	 *
	 * Absent allows each one the kind's geom table row binds. A kind listed with a subset keeps its
	 * required aesthetics.
	 */
	aesthetics?: Partial<Record<PlotKind, readonly Aesthetic[]>>;
	/**
	 * Setting groups the role may not set. Absent withholds none.
	 *
	 * A group a later version adds is open under a profile saved before it.
	 */
	withhold?: readonly SettingGroup[];
	/** Caps on a spec's size. Absent means the package's own limits alone. */
	limits?: {
		layers?: number;
		annotations?: number;
	};
}

/** Where a spec fell outside the profile. A loader names the field. */
export interface Failure {
	/** Dotted path into the spec, as in `layers[1].fit`. */
	path: string;
	reason: string;
}

export interface Verdict {
	ok: boolean;
	failures: Failure[];
}

export const allowsKind = (profile: CapabilityProfile, kind: PlotKind): boolean =>
	(profile.kinds ?? KINDS).includes(kind);

/** Whether the role may author on this surface at all. */
export const allowsSurface = (profile: CapabilityProfile, surface: SurfaceKind): boolean =>
	profile.surfaces == null || profile.surfaces.includes(surface);

export const allowsSetting = (profile: CapabilityProfile, group: SettingGroup): boolean =>
	!profile.withhold?.includes(group);

/**
 * Aesthetics a role may bind on a kind, required ones included.
 *
 * The kind's geom table row bounds the answer. A profile naming an aesthetic the kind lacks narrows
 * to nothing.
 */
export function allowedAesthetics(profile: CapabilityProfile, kind: PlotKind): Aesthetic[] {
	const row = (GEOMS as Partial<Record<string, GeomFacts>>)[kind];
	if (!row) return [];
	const bound = [...row.requires, ...row.accepts];
	const named = profile.aesthetics?.[kind];
	return named == null
		? bound
		: bound.filter((aesthetic) => named.includes(aesthetic) || row.requires.includes(aesthetic));
}

/** A group per field. `null` is the chart's content, which the kinds, the aesthetics and the limits gate. */
type Groups<T> = {readonly [F in keyof Required<T>]: SettingGroup | null};

/* In the order failures are reported. */
const CHART_GROUPS = {
	version: null,
	id: null,
	headline: null,
	subtitle: null,
	caption: null,
	layers: null,
	facet: "facets",
	coord: "axis-range",
	scales: null,
	tooltip: null,
	annotations: "annotations",
	overrides: "overrides",
	legend: "legend",
	sides: "side-panels",
	height: "figure-size",
	width: "figure-size",
	aspect: "figure-size",
	ratio: "figure-size",
	sizing: "figure-size",
} as const satisfies Groups<ChartSpec>;

const LAYER_GROUPS = {
	id: null,
	name: null,
	kind: null,
	aes: null,
	fit: "fits",
	smooth: "fits",
	directLabels: "labels",
	numbers: "labels",
	style: "geom-style",
	position: "geom-style",
	axis: "second-axis",
	aggregate: "statistics",
	cumulative: "statistics",
	statParams: "statistics",
	error: "statistics",
	replicates: "statistics",
	rings: "side-panels",
	palette: "color-scale",
	scales: null,
	showLegend: "legend",
	links: null,
	visible: null,
	data: null,
} as const satisfies Groups<LayerSpec>;

const POSITION_GROUPS = {
	title: null,
	transform: "log-scale",
	reverse: "axis-range",
	time: "axis-range",
	limits: "axis-range",
	oob: "axis-range",
	kind: "axis-range",
	bandSize: "axis-range",
	order: "axis-range",
	labels: "axis-range",
	breaks: "axis-range",
	minorBreaks: "axis-range",
	expand: "axis-range",
	include: "axis-range",
	breakWidth: "axis-range",
	format: "axis-range",
	decimals: "axis-range",
	grid: "axis-chrome",
	minorGrid: "axis-chrome",
	minorTicks: "axis-chrome",
	linewidth: "axis-chrome",
	tickLength: "axis-chrome",
	tickSide: "axis-chrome",
	tickAngle: "axis-chrome",
	titleAlign: "axis-chrome",
	fontSize: "axis-chrome",
	ink: "axis-chrome",
} as const satisfies Groups<PositionScale>;

const COLOR_GROUPS = {
	title: null,
	limits: "color-scale",
	center: "color-scale",
	transform: "color-scale",
	format: "color-scale",
	decimals: "color-scale",
	bins: "color-scale",
	breaks: "color-scale",
	labels: "color-scale",
	standardize: "color-scale",
} as const satisfies Groups<ColorScale>;

const GUIDE_GROUPS = {title: null} as const satisfies Groups<GuideScale>;

const SCALE_GROUPS: {readonly [A in keyof Required<ChartScales>]: Readonly<Record<string, SettingGroup | null>>} = {
	x: POSITION_GROUPS,
	y: POSITION_GROUPS,
	y2: POSITION_GROUPS,
	color: COLOR_GROUPS,
	fill: COLOR_GROUPS,
	size: GUIDE_GROUPS,
	shape: GUIDE_GROUPS,
	alpha: GUIDE_GROUPS,
	linetype: GUIDE_GROUPS,
};

/**
 * Whether a field holds something the author said.
 *
 * An empty list or object says nothing. The first vertical scale and the identity transform are
 * what an unstated field draws.
 */
function stated(field: string, value: unknown): boolean {
	if (value == null) return false;
	if (field === "axis") return value === "y2";
	if (field === "transform") return value !== "identity";
	if (Array.isArray(value)) return value.length > 0;
	if (typeof value === "object") return Object.values(value).some((held) => held !== undefined);
	return true;
}

/**
 * Whether a spec falls inside a profile.
 *
 * Each field is checked and each failure collected. The paths are what a loader prints.
 */
export function validate(spec: ChartSpec, profile: CapabilityProfile): Verdict {
	const failures: Failure[] = [];
	const refuse = (path: string, reason: string) => failures.push({path, reason});
	/* Each stated field of `record` whose group the profile withholds, at `at` plus the field. */
	const check = (record: object, groups: Readonly<Record<string, SettingGroup | null>>, at: string) => {
		for (const [field, group] of Object.entries(groups)) {
			const value = (record as Record<string, unknown>)[field];
			if (group && stated(field, value) && !allowsSetting(profile, group)) {
				refuse(`${at}${field}`, `${group} is outside this profile`);
			}
		}
	};

	if (!allowsSurface(profile, "chart")) refuse("layers", "the chart surface is outside this profile");

	const maxLayers = profile.limits?.layers;
	if (maxLayers != null && spec.layers.length > maxLayers) {
		refuse("layers", `${spec.layers.length} layers, ${maxLayers} allowed`);
	}

	for (const [field, group] of Object.entries(CHART_GROUPS)) {
		if (field === "layers") {
			spec.layers.forEach((layer, index) => {
				const at = `layers[${index}]`;
				if (!allowsKind(profile, layer.kind)) {
					refuse(`${at}.kind`, `${layer.kind} is outside this profile`);
					// The aesthetic check reads the kind's row, which says nothing once the kind is out.
					return;
				}
				const allowed = allowedAesthetics(profile, layer.kind);
				for (const aesthetic of Object.keys(layer.aes) as Aesthetic[]) {
					if (layer.aes[aesthetic] == null || allowed.includes(aesthetic)) continue;
					refuse(`${at}.aes.${aesthetic}`, `the ${aesthetic} aesthetic is outside this profile`);
				}
				/* A layer drawing its own rows keeps out of the legend, as ggplot's annotate does. That flag is unstated. */
				check(
					layer.data && layer.showLegend === false ? {...layer, showLegend: undefined} : layer,
					LAYER_GROUPS,
					`${at}.`,
				);
				for (const paint of ["color", "fill"] as const) {
					const scale = layer.scales?.[paint];
					if (scale) check(scale, COLOR_GROUPS, `${at}.scales.${paint}.`);
				}
			});
		} else if (field === "scales") {
			for (const [aesthetic, groups] of Object.entries(SCALE_GROUPS)) {
				const scale = spec.scales?.[aesthetic as keyof ChartScales];
				if (scale) check(scale, groups, `scales.${aesthetic}.`);
			}
			if (stated("y2", spec.scales?.y2) && !allowsSetting(profile, "second-axis")) {
				refuse("scales.y2", "second-axis is outside this profile");
			}
		} else if (field === "annotations") {
			const maxNotes = profile.limits?.annotations;
			const notes = spec.annotations?.length ?? 0;
			if (maxNotes != null && notes > maxNotes) refuse("annotations", `${notes} annotations, ${maxNotes} allowed`);
			check(spec, {annotations: group}, "");
		} else {
			check(spec, {[field]: group}, "");
		}
	}

	return {ok: failures.length === 0, failures};
}

/** Everything on. What a role with no restrictions gets, and the default a loader assumes. */
export const OPEN_PROFILE: Readonly<CapabilityProfile> = Object.freeze({id: "open", label: "Unrestricted"});
