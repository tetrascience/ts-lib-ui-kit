/**
 * Edge adapters -- what arrives becomes a PlotData.
 *
 * Three entry points reach one accessor surface. Field metadata comes from the caller and
 * anything unstated is inferred from the column.
 */

import type {PlotData, PlotField} from "./plot-data.js";

/** A column as it arrives: a plain array, or a typed array from the wire. */
export type Arrayish =
	| unknown[]
	| Int8Array
	| Uint8Array
	| Uint8ClampedArray
	| Int16Array
	| Uint16Array
	| Int32Array
	| Uint32Array
	| Float32Array
	| Float64Array;

/** What a caller knows about a column and the table does not. */
export type FieldOverride = Partial<Omit<PlotField, "id">>;

export interface AdapterOptions {
	/** Per-column metadata, keyed by column name. */
	fieldOverrides?: Record<string, FieldOverride>;
	/**
	 * Column naming a record, for the readout title and a selection's key. Defaults to the first text column.
	 *
	 * A `PlotData` of the caller's keeps its own key unless this names another.
	 */
	keyField?: string;
}

const isTypedArray = (values: Arrayish): boolean => !Array.isArray(values);

/** First value that is not null, for deciding a plain array's type. */
function firstPresent(values: Arrayish): unknown {
	const length = values.length;
	for (let index = 0; index < length; index += 1) {
		const value = (values as ArrayLike<unknown>)[index];
		if (value != null) return value;
	}
	return null;
}

/**
 * Whether a column reads as numeric.
 *
 * A typed array is numeric by construction. A plain array is judged on its first present value.
 */
const numericColumn = (values: Arrayish): boolean => isTypedArray(values) || typeof firstPresent(values) === "number";

const asNumber = (value: unknown): number | null =>
	typeof value === "number" && Number.isFinite(value) ? value : null;

/** Epoch milliseconds a lab table plausibly holds. Outside this range a large number is a measure. */
const EPOCH_LOW = Date.UTC(1990, 0, 1);
const EPOCH_HIGH = Date.UTC(2100, 0, 1);

/** A column name that says it holds times. */
export const TIME_NAME = /(^|[_\s-])(time|date|datetime|ts|timestamp|created)([_\s-]|$)|_at$/i;

/** An ISO-8601 date, with an optional time and an optional offset. */
export const ISO = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)?(Z|[+-]\d{2}:?\d{2})?$/;

/** ISO-8601 text as epoch milliseconds. A time with no offset reads in UTC, the axis's own zone. */
function isoMillis(text: string): number {
	const stamp = text.replace(" ", "T");
	return Date.parse(ISO.exec(stamp)?.[1] ? stamp : `${stamp}Z`);
}

/**
 * A time-named column as epoch milliseconds, or null where it reads as something else.
 *
 * Each present value is ISO-8601 text, epoch seconds or epoch milliseconds, all of one kind.
 * Text parses and seconds scale up. Milliseconds pass through uncopied.
 */
function epochColumn(name: string, column: Arrayish): Arrayish | null {
	if (!TIME_NAME.test(name)) return null;
	const values = column as ArrayLike<unknown>;
	let present = 0;
	let text = 0;
	let seconds = 0;
	let millis = 0;
	for (let index = 0; index < values.length; index += 1) {
		const value = values[index];
		if (value == null || Number.isNaN(value)) continue;
		present += 1;
		if (typeof value === "string" && ISO.test(value)) text += 1;
		else if (typeof value !== "number") return null;
		else if (value >= EPOCH_LOW && value <= EPOCH_HIGH) millis += 1;
		else if (value >= EPOCH_LOW / 1000 && value <= EPOCH_HIGH / 1000) seconds += 1;
		else return null;
	}
	if (present === 0) return null;
	if (millis === present) return column;
	if (text === present) return Array.from(values, (value) => (typeof value === "string" ? isoMillis(value) : null));
	if (seconds === present) return Array.from(values, (value) => (typeof value === "number" ? value * 1000 : null));
	return null;
}

/**
 * Columns of values, however they arrived, as the surface a figure reads.
 *
 * The accessors index into the column arrays. A time-named column of ISO text or epoch seconds
 * is copied once into epoch milliseconds, on a calendar scale. A caller's own field metadata wins.
 */
export function fromColumns(given: Record<string, Arrayish>, numRows: number, options: AdapterOptions = {}): PlotData {
	const {fieldOverrides: overrides = {}, keyField} = options;
	const names = Object.keys(given);
	const columns: Record<string, Arrayish> = {...given};

	const fields: PlotField[] = names.map((name) => {
		const override = overrides[name] ?? {};
		/*
      Whatever the caller stated, with the keys they left alone dropped.
      `exactOptionalPropertyTypes` reads a present-and-undefined key as an absence.
    */
		const stated = Object.fromEntries(Object.entries(override).filter(([, value]) => value !== undefined));
		const epochs = override.timeScale === false || override.numeric === false ? null : epochColumn(name, given[name]!);
		if (epochs) columns[name] = epochs;
		return {
			id: name,
			label: override.label ?? name,
			numeric: override.numeric ?? numericColumn(columns[name]!),
			...(epochs ? {role: "timestamp", timeScale: true} : {}),
			...stated,
		};
	});

	const at = (field: string, row: number): unknown => {
		const column = columns[field];
		return column == null ? null : ((column as ArrayLike<unknown>)[row] ?? null);
	};

	const firstText = fields.find((field) => !field.numeric)?.id;

	return {
		fields,
		rowCount: numRows,
		number: (row, field) => asNumber(at(field, row)),
		text: (row, field) => {
			const value = at(field, row);
			return value == null ? null : String(value);
		},
		// These tables have their own rows and the position is the index.
		rowIndex: (row) => row,
		...((keyField ?? firstText) ? {keyField: keyField ?? firstText} : {}),
	};
}

/** One column of an Arrow table, as both Arrow implementations answer it. */
interface ArrowColumn extends Iterable<unknown> {
	nullCount: number;
	toArray(): ArrayLike<unknown>;
}

/**
 * The members of an Arrow table this module reads.
 *
 * A row count and a schema, with `toColumns`, `getChild` or both. flechette answers the first and
 * apache-arrow the second. A table stating neither fails to compile.
 */
export type ArrowLike = {numRows: number; schema: {fields: readonly {name: string}[]}} & (
	| {toColumns(): Record<string, ArrayLike<unknown>>; getChild?(name: string): ArrowColumn | null}
	| {toColumns?(): Record<string, ArrayLike<unknown>>; getChild(name: string): ArrowColumn | null}
);

/**
 * One column read whole off its Arrow vector.
 *
 * A vector holding nulls reads through its iterator, which answers null at each null slot.
 * `toArray` answers the raw buffer value there.
 */
const arrayOf = (column: ArrowColumn): Arrayish =>
	(column.nullCount > 0 ? Array.from(column) : column.toArray()) as Arrayish;

/**
 * An Arrow table, as the service answers with.
 *
 * Read structurally through the row count and the columns. A numeric column with no nulls comes
 * through uncopied. A text or dictionary column decodes into an array of strings.
 */
export function fromArrow(table: ArrowLike, options: AdapterOptions = {}): PlotData {
	const arrow = table as Partial<ArrowLike> | null;
	const numRows = arrow?.numRows;
	if (typeof numRows === "number" && typeof arrow?.toColumns === "function") {
		return fromColumns(arrow.toColumns() as Record<string, Arrayish>, numRows, options);
	}
	if (typeof numRows === "number" && typeof arrow?.getChild === "function" && arrow.schema) {
		const columns: Record<string, Arrayish> = {};
		for (const {name} of arrow.schema.fields) {
			const column = arrow.getChild(name);
			if (column) columns[name] = arrayOf(column);
		}
		return fromColumns(columns, numRows, options);
	}
	throw new Error("fromArrow: the value carries no row count and no column accessor");
}

/**
 * Tabular data as a consumer has it, accepted by `toPlotData`.
 *
 * Row objects, columns of arrays or typed arrays, an Arrow table, or a `PlotData` of the
 * caller's own.
 */
export type VizData = readonly object[] | Record<string, Arrayish> | ArrowLike | PlotData;

/** Whether a value quacks like an Arrow table, meaning a schema and a row count. */
const looksArrow = (data: object): data is ArrowLike =>
	"schema" in data && typeof (data as {numRows?: unknown}).numRows === "number";

/** Whether a value is already the surface a figure reads. */
const isPlotData = (data: object): data is PlotData =>
	typeof (data as Partial<PlotData>).number === "function" && Array.isArray((data as Partial<PlotData>).fields);

/**
 * A caller's table under another key column.
 *
 * Each accessor delegates, which keeps a class instance's prototype methods and its private state.
 */
function keyedBy(data: PlotData, keyField: string): PlotData {
	const {numbers, texts} = data;
	return {
		fields: data.fields,
		rowCount: data.rowCount,
		keyField,
		number: (row, field) => data.number(row, field),
		text: (row, field) => data.text(row, field),
		rowIndex: (row) => data.rowIndex(row),
		...(numbers ? {numbers: (field: string) => numbers.call(data, field)} : {}),
		...(texts ? {texts: (field: string) => texts.call(data, field)} : {}),
	};
}

/**
 * One entry point over the three adapters.
 *
 * An array is rows. An Arrow table is detected by its schema accessor. A `PlotData` passes
 * through with its own fields, and with its own key unless `keyField` names another. Anything else
 * is columns, counted off the longest one.
 */
export function toPlotData(data: VizData, options: AdapterOptions = {}): PlotData {
	if (data == null) {
		throw new Error(
			`toPlotData: takes rows, columns or an Arrow table, and got ${data}. Pass [] while the data loads.`,
		);
	}
	if (Array.isArray(data)) return fromRows(data as readonly Record<string, unknown>[], options);
	if (isPlotData(data)) {
		const {keyField} = options;
		return keyField && keyField !== data.keyField ? keyedBy(data, keyField) : data;
	}
	if (looksArrow(data)) return fromArrow(data, options);

	const columns = data as Record<string, Arrayish>;
	const numRows = Object.values(columns).reduce((most, column) => Math.max(most, column.length), 0);
	return fromColumns(columns, numRows, options);
}

/**
 * Row objects, as a lookup or a REST payload arrives in.
 *
 * Pivoted to columns once at the edge. The column set is the union of the keys present.
 */
export function fromRows(rows: readonly Record<string, unknown>[], options: AdapterOptions = {}): PlotData {
	const names: string[] = [];
	const seen = new Set<string>();
	for (const row of rows) {
		for (const key of Object.keys(row)) {
			if (seen.has(key)) continue;
			seen.add(key);
			names.push(key);
		}
	}

	const columns: Record<string, Arrayish> = {};
	for (const name of names) {
		columns[name] = rows.map((row) => row[name] ?? null);
	}

	return fromColumns(columns, rows.length, options);
}
