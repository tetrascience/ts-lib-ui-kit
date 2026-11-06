/**
 * The reading surface -- the number in this row for this field.
 *
 * Accessors over materialized arrays. Copying 250k rows to plot a scatter is the cost this
 * avoids.
 */

import {NEEDS_VALUES, reduceBucket, spreadOf, type Aggregate, type Bucket, type Group} from "./aggregate.js";

/** How a field reads on a chart. A subset of the app's role vocabulary as an open string. */
export type PlotFieldRole = string;

/** A column a channel can bind, flattened from whichever table it came from. */
export interface PlotField {
	id: string;
	label: string;
	numeric: boolean;
	role?: PlotFieldRole;
	unit?: string;
	digits?: number;
	/** Values span orders of magnitude. The axis defaults to log. */
	logScale?: boolean;
	/** Values are epoch milliseconds. The axis defaults to a UTC calendar scale. */
	timeScale?: boolean;
	/**
	 * The cut a gate grid compares the measure against.
	 *
	 * A reading at or above it clears, or at or below where `direction` is `lower`.
	 */
	target?: number;
	/** Which way counts as better. Seeds the axis-end captions. */
	direction?: "higher" | "lower";
}

export interface PlotData {
	fields: PlotField[];
	rowCount: number;
	/** Numeric value, or null where absent or not a number. */
	number(row: number, field: string): number | null;
	/** Display value, or null. */
	text(row: number, field: string): string | null;
	/**
	 * Index of this row in the source that owns it.
	 *
	 * Row 12 of the plot is another row of the table and opening a record needs that second
	 * number.
	 */
	rowIndex(row: number): number;
	/** Field naming a record, for the readout title. */
	keyField?: string;
	/**
	 * A numeric field read whole, NaN where `number` answers null.
	 *
	 * Optional. A walker over each row reads it where a table offers it.
	 */
	numbers?(field: string): Float64Array | null;
	/** A field read whole as display text, null where `text` answers null. Optional, as `numbers` is. */
	texts?(field: string): readonly (string | null)[] | null;
}

/** Calls a whole-column read once per field. */
function once<T>(read: (field: string) => T | null): (field: string) => T | null {
	const columns = new Map<string, T | null>();
	return (field) => {
		if (!columns.has(field)) columns.set(field, read(field));
		return columns.get(field) ?? null;
	};
}

/**
 * The table with each whole-column read made once and reused.
 *
 * Scoped to one build. A later build wraps the table afresh and reads current values. Each
 * accessor delegates, which keeps a class instance's prototype methods.
 */
export function readOnce(data: PlotData): PlotData {
	const {numbers, texts} = data;
	if (!numbers && !texts) return data;
	return {
		fields: data.fields,
		rowCount: data.rowCount,
		keyField: data.keyField,
		number: (row, field) => data.number(row, field),
		text: (row, field) => data.text(row, field),
		rowIndex: (row) => data.rowIndex(row),
		numbers: numbers && once((field) => numbers.call(data, field)),
		texts: texts && once((field) => texts.call(data, field)),
	};
}

/**
 * One aggregate per category, over the plot's table.
 *
 * Walks the accessors and shares the reduction with the columnar path. Categories come back in
 * first-seen order and the caller sorts.
 */
export function groupRows(
	data: PlotData,
	keyField: string,
	valueField: string | null,
	aggregate: Aggregate = "mean",
	/** Returns the readings beside each reduction, for a geom that draws them. */
	keepValues = false,
): Group[] {
	const running = new Map<string, Bucket>();
	const collected = keepValues || NEEDS_VALUES.includes(aggregate) ? new Map<string, number[]>() : null;

	for (let row = 0; row < data.rowCount; row += 1) {
		const key = data.text(row, keyField);
		if (key == null) continue;

		// No measure bound counts rows. Each row is one.
		const value = valueField ? data.number(row, valueField) : 1;
		if (value == null) continue;

		let bucket = running.get(key);
		if (!bucket) {
			bucket = {n: 0, sum: 0, sumSq: 0, min: Infinity, max: -Infinity};
			running.set(key, bucket);
		}
		bucket.n += 1;
		bucket.sum += value;
		bucket.sumSq += value * value;
		bucket.min = Math.min(bucket.min, value);
		bucket.max = Math.max(bucket.max, value);

		if (collected) {
			const values = collected.get(key);
			if (values) values.push(value);
			else collected.set(key, [value]);
		}
	}

	return [...running].map(([key, bucket]) => ({
		key,
		n: bucket.n,
		value: reduceBucket(bucket, aggregate, collected?.get(key)),
		...spreadOf(bucket),
		...(keepValues ? {values: collected?.get(key) ?? []} : {}),
	}));
}
