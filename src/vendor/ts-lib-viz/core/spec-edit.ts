/**
 * Editing a spec, and which kinds a table can be asked for.
 *
 * Each edit returns a new spec of the caller's own type. The host stamps the time it saves, and
 * nothing here reaches a store.
 */

import {PLOTS} from "./capabilities.js";
import type {Aesthetic} from "./geom-table.js";
import type {ChartSpec, PositionScale, PlotKind, PlotSource, StoredSpec, LayerSpec} from "./spec.js";

/** A chart type as the builder offers it. An unavailable kind names its reason. */
export interface KindOption {
	kind: PlotKind;
	label: string;
	describe: string;
	available: boolean;
	/** Absent when available. */
	reason?: string;
}

/**
 * Which chart types this table can draw.
 *
 * Roles come from the field where it has one and from its type where it does not. An unavailable
 * kind names the column it lacks.
 */
export function plotKinds(fields: readonly {role?: string; numeric: boolean}[]): KindOption[] {
	/* Roles are tested for membership against what a channel accepts. An unknown role matches
	   nothing and offers the kind as unavailable. */
	const roles = new Set<string>(fields.map((field) => field.role ?? (field.numeric ? "measure" : "dimension")));

	return PLOTS.map((capability) => {
		const unmet = capability.aesthetics.filter(
			(channel) => channel.required && !channel.roles.some((role) => roles.has(role)),
		);

		return {
			kind: capability.kind,
			label: capability.label,
			describe: capability.describe,
			available: unmet.length === 0,
			reason:
				unmet.length === 0
					? undefined
					: `Needs a ${unmet[0]!.roles.join(" or ")} column for ${unmet[0]!.label.toLowerCase()}`,
		};
	});
}

/** A table a plot can be pointed at, offered by name. */
export interface PlotSourceOption {
	source: PlotSource;
	label: string;
	hint?: string;
	/**
	 * Columns this source offers, for a caller that has to name one.
	 *
	 * Read off the schema. Absent where the caller picks a column.
	 */
	columns?: string[];
}

/**
 * A layer of one kind with nothing bound or styled. The id is the kind and an index, as the builder
 * names one.
 */
export function newLayer(kind: PlotKind, index = 0): LayerSpec {
	return {id: `${kind}${index}`, kind, aes: {}};
}

/** A new layer of one kind, at the first index no layer's id holds. */
export function addLayer<S extends ChartSpec>(spec: S, kind: PlotKind): S {
	const taken = new Set(spec.layers.map((layer) => layer.id));
	let index = spec.layers.length;
	while (taken.has(`${kind}${index}`)) index += 1;
	return {...spec, layers: [...spec.layers, newLayer(kind, index)]};
}

export function updateLayer<S extends ChartSpec>(spec: S, id: string, change: Partial<LayerSpec>): S {
	return {...spec, layers: spec.layers.map((layer) => (layer.id === id ? {...layer, ...change} : layer))};
}

/**
 * Binds one aesthetic of one layer to a column, or clears it where the field is absent.
 *
 * `field` is a list where the geom reads several columns at once. An empty list clears it.
 */
export function bindAes<S extends ChartSpec>(
	spec: S,
	{layerId, aesthetic, field}: {layerId: string; aesthetic: Aesthetic; field?: string | readonly string[]},
): S {
	const cleared = field === undefined || (typeof field !== "string" && field.length === 0);
	return {
		...spec,
		layers: spec.layers.map((layer) => {
			if (layer.id !== layerId) return layer;
			const {[aesthetic]: _held, ...aes} = layer.aes;
			return {...layer, aes: cleared ? aes : {...aes, [aesthetic]: field}};
		}),
	};
}

/** A plot has at least one layer. Removing the last one is refused. */
export function removeLayer<S extends ChartSpec>(spec: S, id: string): S {
	if (spec.layers.length <= 1) return spec;
	return {...spec, layers: spec.layers.filter((layer) => layer.id !== id)};
}

/** The scales that position a reading, as `ChartScales` keys them. */
const POSITIONS = new Set(["x", "y", "y2"]);

/** An axis with the old table's category values taken off. A cluster order recomputes and stays. */
const withoutValues = ({labels: _labels, order, ...axis}: PositionScale): PositionScale =>
	order?.kind === "cluster" ? {...axis, order} : axis;

/**
 * Changing the source clears the bindings.
 *
 * Field ids and category values belong to the table they came from. Channels, tracks and band
 * orders drop them. A layer drawing its own rows keeps its own.
 */
export function setSource<S extends StoredSpec>(spec: S, source: PlotSource): S {
	if (source.kind === spec.source?.kind && source.id === spec.source.id) return spec;
	return {
		...spec,
		source,
		layers: spec.layers.map((layer) => {
			if (layer.data) return layer;
			const {directLabels: _label, ...rest} = layer;
			return {...rest, aes: {}};
		}),
		tooltip: [],
		facet: undefined,
		sides: spec.sides?.filter((side) => side.content.kind !== "track"),
		scales:
			spec.scales &&
			Object.fromEntries(
				Object.entries(spec.scales).map(([name, scale]) => [
					name,
					POSITIONS.has(name) && scale ? withoutValues(scale) : scale,
				]),
			),
	};
}

/** Whether a visible layer reads the second vertical scale. A second axis draws where one does. */
export const usesY2 = (spec: ChartSpec): boolean =>
	spec.layers.some((layer) => layer.visible !== false && layer.axis === "y2");
