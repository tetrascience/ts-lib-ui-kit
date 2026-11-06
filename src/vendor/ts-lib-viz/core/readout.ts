/**
 * What a hover says, whichever geom is under the pointer.
 *
 * One union and one reader. A hover on any geom ends in one card.
 */

import type {Trace} from "./layers.js";
import type {PlotData, PlotField} from "./plot-data.js";
import type {ChartSpec} from "./spec.js";
import type {TooltipRow} from "./geom-types.js";
import type {BarDatum} from "./geom-types.js";
import type {HeatCell} from "./geom-types.js";
import type {BoxDatum} from "./geom-types.js";
import type {ViolinDatum} from "./geom-types.js";
import type {ParallelLine} from "./geom-types.js";
import type {PointHit} from "./geom-types.js";
import type {SankeyLinkInput} from "./geom-types.js";
import type {HierarchyCell} from "./hierarchy.js";

export type LayerHit =
	| {kind: "point"; trace: Trace; hit: PointHit}
	/** The same record a point stands for, read on a third scale as well. */
	| {kind: "cube"; trace: Trace; hit: PointHit}
	| {kind: "cell"; trace: Trace; cell: HeatCell}
	| {kind: "bar"; trace: Trace; datum: BarDatum}
	/** A pie's slice, read as the bar it was built from. */
	| {kind: "slice"; trace: Trace; datum: BarDatum}
	| {kind: "box"; trace: Trace; datum: BoxDatum}
	| {kind: "violin"; trace: Trace; datum: ViolinDatum}
	/** A record read across several measures. One line of a parallel plot. */
	| {kind: "record"; trace: Trace; line: ParallelLine; at: {x: number; y: number}}
	/** A ribbon. The one number on a flow with nothing written beside it. */
	| {kind: "flow"; trace: Trace; link: SankeyLinkInput}
	/** A chord's sector, with the total passing through it. */
	| {kind: "sector"; trace: Trace; sector: {id: string; value: number}}
	/** One node of a hierarchy, and the total it stands for. */
	| {kind: "node"; trace: Trace; cell: HierarchyCell};

const digitsFor = (field: PlotField | undefined, value: number): number =>
	field?.digits ?? (Math.abs(value) >= 100 ? 0 : 2);

/** Currency symbols, written ahead of the number the way American English writes a price. */
const CURRENCY = new Set(["$", "€", "£", "¥"]);

/** A number at fixed digits with its thousands grouped. */
const grouped = (value: number, digits: number): string =>
	value.toLocaleString("en-US", {minimumFractionDigits: digits, maximumFractionDigits: digits});

/** Writes a unit beside a number. A currency symbol leads it. Any other unit follows after a space. */
const withUnit = (text: string, unit: string | undefined): string => {
	if (!unit) return text;
	if (!CURRENCY.has(unit)) return `${text} ${unit}`;
	return text.startsWith("-") ? `-${unit}${text.slice(1)}` : `${unit}${text}`;
};

export const numberOf = (field: PlotField | undefined, value: number): string =>
	withUnit(grouped(value, digitsFor(field, value)), field?.unit);

/**
 * A value beside the interval drawn around it, as one string.
 *
 * The half-width takes the value's digits and the unit is written once at the end.
 */
export const intervalOf = (field: PlotField | undefined, value: number, half: number): string => {
	const digits = digitsFor(field, value);
	const unit = field?.unit;
	if (unit && CURRENCY.has(unit))
		return `${withUnit(grouped(value, digits), unit)} ± ${withUnit(grouped(half, digits), unit)}`;
	return withUnit(`${grouped(value, digits)} ± ${grouped(half, digits)}`, unit);
};

/**
 * The readout shows what the plot says it shows.
 *
 * Bound channels are the default and the author can add the fields nobody plotted.
 */
export function tooltipRows(
	hit: LayerHit,
	context: {
		plot: ChartSpec;
		data: PlotData;
		/** Absent where the geom reads no horizontal axis. No point can be hit there. */
		xField?: PlotField;
		fieldAt: Map<string, PlotField>;
	},
): TooltipRow[] {
	const {plot, data, xField, fieldAt} = context;

	/* A bar drawn with an interval reports it in the readout. A whisker is read to the pixel. */
	if (hit.kind === "bar" || hit.kind === "slice") {
		const aggregate = hit.trace.data.geom === "bar" ? hit.trace.data.aggregate : "mean";
		const half = hit.datum.error;
		/*
      A fill divided this geom by its band's total and the value is a share.

      The aggregate names another reduction and the unit was divided away. Both rows go.
    */
		const shares = hit.trace.data.at === "groups" && "bars" in hit.trace.data && hit.trace.data.shares === true;
		const measure = shares ? undefined : hit.trace.field;
		return [
			{
				label: hit.trace.field ? `${shares ? "share" : aggregate} of ${hit.trace.field.label}` : "records",
				value:
					half != null && half > 0 ? intervalOf(measure, hit.datum.value, half) : numberOf(measure, hit.datum.value),
				color: hit.trace.color,
			},
			...(hit.datum.n == null ? [] : [{label: "rows", value: hit.datum.n.toLocaleString()}]),
		];
	}

	if (hit.kind === "cell") {
		const aggregate = hit.trace.data.geom === "heatmap" ? hit.trace.data.aggregate : "mean";
		return [
			{
				label: hit.trace.field ? `${aggregate} of ${hit.trace.field.label}` : "records",
				value: numberOf(hit.trace.field, hit.cell.value),
				color: hit.trace.color,
			},
			{label: "rows", value: hit.cell.n.toLocaleString()},
		];
	}

	/*
    A ribbon's thickness is the only number on a flow and a reader takes no value off thickness.
    The width field names what was counted.
  */
	if (hit.kind === "flow" || hit.kind === "sector") {
		const width = plot.layers.find((series) => series.id === hit.trace.layerId)?.aes.value;
		const field = typeof width === "string" ? fieldAt.get(width) : undefined;
		const value = hit.kind === "flow" ? hit.link.value : hit.sector.value;
		return [
			{
				label: field?.label ?? "rows",
				value: field ? numberOf(field, value) : value.toLocaleString(),
				color: hit.trace.color,
			},
		];
	}

	/* A node reads as the total under it. The trace names what was summed. */
	if (hit.kind === "node") {
		return [{label: hit.trace.field?.label ?? "rows", value: numberOf(hit.trace.field, hit.cell.value)}];
	}

	/* A line is read across its axes. The readout is the record's value on each. */
	if (hit.kind === "record") {
		const axes = hit.trace.data.geom === "parcoords" ? hit.trace.data.axes : [];
		return axes.map((axis, index) => ({
			label: axis.label,
			value: numberOf(fieldAt.get(axis.id), hit.line.values[index] ?? 0),
			color: index === 0 ? hit.trace.color : undefined,
		}));
	}

	/* The swatch takes the fill the geom drew, which the ramp reads off the median. */
	if (hit.kind === "box" || hit.kind === "violin") {
		return [
			{
				label: "median",
				value: numberOf(hit.trace.field, hit.datum.median),
				color: hit.trace.ramp(hit.datum.median),
			},
			{label: "mean", value: numberOf(hit.trace.field, hit.datum.mean)},
			{label: "count", value: hit.datum.n.toLocaleString("en-US")},
		];
	}

	/*
    A cube's third measure has no axis a reader can take a value off. The card writes it beside
    the pair that do have axes.
  */
	const zField = hit.kind === "cube" && hit.trace.data.geom === "point3d" ? hit.trace.data.zField : undefined;
	const z = hit.hit.datum.z;
	/* The point's own row, in the table its layer read. Its place in the trace is no row. */
	const source = hit.trace.table ?? data;
	const held = hit.hit.datum as {plotRow?: number; row?: number};
	const row = held.plotRow ?? (typeof held.row === "number" ? held.row : hit.hit.index);

	return [
		{
			label: hit.trace.field?.label ?? "Value",
			value: numberOf(hit.trace.field, hit.hit.datum.y),
			color: hit.trace.color,
		},
		...(xField ? [{label: xField.label, value: hit.hit.datum.category ?? numberOf(xField, hit.hit.datum.x)}] : []),
		...(zField && z != null ? [{label: zField.label, value: numberOf(zField, z)}] : []),
		...(hit.trace.colorField
			? [
					{
						label: hit.trace.colorField.label,
						value: source.text(row, hit.trace.colorField.id) ?? "—",
					},
				]
			: []),
		...(plot.tooltip ?? []).flatMap((id) => {
			const field = fieldAt.get(id);
			const value = source.text(row, id);
			return field && value != null ? [{label: field.label, value}] : [];
		}),
	];
}

export const tooltipTitle = (hit: LayerHit): string => {
	if (hit.kind === "point" || hit.kind === "cube") return hit.hit.datum.key ?? hit.trace.name;
	if (hit.kind === "record") return hit.line.key ?? hit.trace.name;
	// A ribbon is named by the two ends it joins. Neither end names it alone.
	if (hit.kind === "flow") return `${hit.link.source} to ${hit.link.target}`;
	if (hit.kind === "sector") return hit.sector.id;
	if (hit.kind === "node") return hit.cell.label;
	// A cell is named by its pair. Neither axis names it alone.
	if (hit.kind === "cell") return `${hit.cell.x}, ${hit.cell.y}`;
	return hit.datum.category;
};
