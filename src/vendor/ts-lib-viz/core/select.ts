/**
 * What a click on a geom selects, as data.
 *
 * A click returns the rows, the keys and a `Predicate`, the three a brush returns. The host
 * publishes the predicate into its own selection and the charts beside this one narrow.
 */

import type {LayerHit} from "./readout.js";
import type {Predicate} from "./predicate.js";
import type {Aesthetic} from "./geom-table.js";
import type {ChartSpec, Aes, PlotKind} from "./spec.js";
import type {Trace} from "./layers.js";
import type {PlotData} from "./plot-data.js";

/**
 * A geom the reader clicked, and the records it stands for.
 *
 * `rows`, `keys` and `predicate` carry the names and types a brush's `Brushed` carries.
 */
export interface Selected {
	/** The layer the geom belongs to. */
	layerId: string;
	/** That layer's kind. A pie's slice reads `pie`, and a histogram's bar reads `histogram`. */
	kind: PlotKind;
	/**
	 * The record the geom stands for, field by field, as the layer's table reads it.
	 *
	 * Null where the geom stands for several records or none, such as a bar over a group.
	 */
	datum: Readonly<Record<string, unknown>> | null;
	/** Rows of the table the layer read, ascending, each once. A point names its own row. */
	rows: number[];
	/** Keys of the same records, where the key column names each record once. Empty otherwise. */
	keys: string[];
	/** A filter for the same records. Null where the geom stands for nothing a query can name. */
	predicate: Predicate | null;
}

export interface SelectContext {
	spec: ChartSpec;
	/** The figure's table. A layer with rows of its own reads those, and its own key column. */
	data: PlotData;
}

/**
 * Whether a key column names each record once. A key naming two rows names a group, the brush's rule.
 *
 * Read on each click. A host's table can change under the figure.
 */
function keyedOnce(table: PlotData, field: string): boolean {
	const seen = new Set<string>();
	for (let row = 0; row < table.rowCount; row += 1) {
		const key = table.text(row, field);
		if (key == null) continue;
		if (seen.has(key)) return false;
		seen.add(key);
	}
	return true;
}

/** The key column of the table a trace read, where it names each record once. */
const keyOf = (trace: Trace, data: PlotData): string | undefined => {
	const table = trace.table ?? data;
	return table.keyField && keyedOnce(table, table.keyField) ? table.keyField : undefined;
};

/** One field id off a channel. A channel may bind several. */
const oneField = (channel: Aes[Aesthetic]): string | undefined =>
	typeof channel === "string" ? channel : channel?.[0];

/** The trace's own values of the split field and the facet field. They narrow each predicate below it. */
function narrowingOf(trace: Trace): Predicate[] {
	return [
		...(trace.splitField && trace.splitValue != null
			? [{kind: "eq" as const, field: trace.splitField.id, value: trace.splitValue}]
			: []),
		...(trace.facetField && trace.facetValue != null
			? [{kind: "eq" as const, field: trace.facetField.id, value: trace.facetValue}]
			: []),
	];
}

const allOf = (of: Predicate[]): Predicate | null =>
	of.length === 0 ? null : of.length === 1 ? of[0]! : {kind: "and", of};

/**
 * The filter a clicked geom means.
 *
 * The split and the facet fold in wherever a predicate came out. A geom in a split trace or a
 * panel stands for its own subset.
 */
export function selectionOf(hit: LayerHit, context: SelectContext): Predicate | null {
	const series = context.spec.layers.find((one) => one.id === hit.trace.layerId);
	const xField = oneField(series?.aes.x);
	const yField = oneField(series?.aes.y);
	const narrowing = narrowingOf(hit.trace);
	const narrowed = (predicate: Predicate | null) => (predicate ? allOf([predicate, ...narrowing]) : null);
	const keyField = keyOf(hit.trace, context.data);

	if (hit.kind === "point" || hit.kind === "cube") {
		const {datum: point} = hit.hit;
		if (keyField && point.key != null) {
			return narrowed({kind: "eq", field: keyField, value: point.key});
		}
		/* A geom in a cube was placed by three channels. Three name it back. */
		const zField = hit.kind === "cube" ? oneField(series?.aes.z) : undefined;
		return narrowed(
			allOf([
				...(xField ? [{kind: "eq" as const, field: xField, value: point.category ?? point.x}] : []),
				...(yField ? [{kind: "eq" as const, field: yField, value: point.y}] : []),
				...(zField && point.z != null ? [{kind: "eq" as const, field: zField, value: point.z}] : []),
			]),
		);
	}

	if (hit.kind === "bar" || hit.kind === "slice") {
		if (!xField) return null;
		const {bin} = hit.datum;
		/* An end that holds no reading on it is left out by value. */
		if (bin) {
			return narrowed(
				allOf([
					{kind: "range", field: xField, lo: bin.from, hi: bin.to},
					...(bin.closed === "right" || bin.closed === "neither"
						? [{kind: "eq" as const, field: xField, value: bin.from, negate: true}]
						: []),
					...(bin.closed === "left" || bin.closed === "neither"
						? [{kind: "eq" as const, field: xField, value: bin.to, negate: true}]
						: []),
				]),
			);
		}
		const width = "binWidth" in hit.trace.data ? hit.trace.data.binWidth : undefined;
		const center = hit.datum.at;
		if (width != null && center != null) {
			if ((context.spec.scales?.x?.transform ?? "identity") !== "identity") return null;
			return narrowed({kind: "range", field: xField, lo: center - width / 2, hi: center + width / 2});
		}
		return narrowed({kind: "eq", field: xField, value: hit.datum.category});
	}

	if (hit.kind === "box" || hit.kind === "violin") {
		return xField ? narrowed({kind: "eq", field: xField, value: hit.datum.category}) : null;
	}

	if (hit.kind === "cell") {
		return narrowed(
			allOf([
				...(xField ? [{kind: "eq" as const, field: xField, value: hit.cell.x}] : []),
				...(yField ? [{kind: "eq" as const, field: yField, value: hit.cell.y}] : []),
			]),
		);
	}

	/*
    A parallel line is one record across several measures. It selects by the key column where the
    table names one and by its reading on each trace axis otherwise.
  */
	if (hit.kind === "record") {
		if (keyField && hit.line.key != null) {
			return narrowed({kind: "eq", field: keyField, value: hit.line.key});
		}
		const axes = hit.trace.data.geom === "parcoords" ? hit.trace.data.axes : [];
		return narrowed(
			allOf(
				axes.flatMap((axis, index) => {
					const value = hit.line.values[index];
					return value == null ? [] : [{kind: "eq" as const, field: axis.id, value}];
				}),
			),
		);
	}

	/* A node names its own row by label. A parent names the rows of its subtree too. */
	if (hit.kind === "node") {
		const label = oneField(series?.aes.label);
		if (!label) return null;
		const data = hit.trace.data;
		const cells =
			data.at === "groups" && (data.geom === "treemap" || data.geom === "icicle" || data.geom === "sunburst")
				? data.cells
				: [];
		/* One pass. A layout puts a parent before its children. */
		const under = new Set([hit.cell.label]);
		for (const cell of cells) if (cell.parent != null && under.has(cell.parent)) under.add(cell.label);
		return narrowed(
			under.size > 1
				? {kind: "in", field: label, values: [...under]}
				: {kind: "eq", field: label, value: hit.cell.label},
		);
	}

	/* A sankey ribbon is a geom the package does not draw yet. */
	return null;
}

/** Whether a row meets a predicate of the kinds a click emits. */
function holds(predicate: Predicate, table: PlotData, row: number): boolean {
	switch (predicate.kind) {
		case "and":
			return predicate.of.every((one) => holds(one, table, row));
		case "or":
			return predicate.of.some((one) => holds(one, table, row));
		case "eq": {
			const equal =
				typeof predicate.value === "number"
					? table.number(row, predicate.field) === predicate.value
					: table.text(row, predicate.field) === predicate.value;
			return predicate.negate ? !equal : equal;
		}
		case "range": {
			const value = table.number(row, predicate.field);
			return (
				value != null &&
				(predicate.lo == null || value >= predicate.lo) &&
				(predicate.hi == null || value <= predicate.hi)
			);
		}
		case "in": {
			const value = table.text(row, predicate.field);
			return value != null && predicate.values.includes(value);
		}
		default:
			return false;
	}
}

/** One row of a table as a record, each field read through the accessor its type takes. */
const recordAt = (table: PlotData, row: number): Readonly<Record<string, unknown>> =>
	Object.fromEntries(table.fields.map(({id, numeric}) => [id, numeric ? table.number(row, id) : table.text(row, id)]));

/**
 * What a click on a geom selected, as the host reads it.
 *
 * A point or a line names its own row. A summary names the rows its predicate holds, in the table
 * the layer read.
 */
export function selectedOf(hit: LayerHit, context: SelectContext): Selected {
	const table = hit.trace.table ?? context.data;
	const predicate = selectionOf(hit, context);
	const own =
		hit.kind === "point" || hit.kind === "cube"
			? ((hit.hit.datum as {plotRow?: number}).plotRow ?? (hit.hit.datum as {row?: number}).row)
			: hit.kind === "record"
				? (hit.line.plotRow ?? hit.line.row)
				: undefined;
	const rows: number[] = [];
	if (typeof own === "number") rows.push(own);
	else if (predicate)
		for (let row = 0; row < table.rowCount; row += 1) if (holds(predicate, table, row)) rows.push(row);

	const keyField = keyOf(hit.trace, context.data);
	const keys = keyField
		? rows.flatMap((row) => {
				const key = table.text(row, keyField);
				return key == null ? [] : [key];
			})
		: [];
	const {kind} = context.spec.layers.find((layer) => layer.id === hit.trace.layerId)!;
	const datum = rows.length === 1 ? recordAt(table, rows[0]!) : null;
	return {layerId: hit.trace.layerId, kind, datum, rows, keys, predicate};
}
