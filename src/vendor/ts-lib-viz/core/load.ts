/**
 * Reading a saved spec, in this format or the one before it.
 *
 * A document holding `series` predates `SPEC_VERSION`, and each of its fields moves to today's name
 * and shape. A field this reader does not know rides through, which keeps a host's own.
 */

import {GEOMS, paintAesthetic, type GeomFacts, type Paint} from "./geom-table.js";
import {SPEC_VERSION, type ChartSpec, type LayerSpec, type PlotKind} from "./spec.js";

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
	typeof value === "object" && value !== null && !Array.isArray(value);

/** The fields of `from` that hold a value. A migrated spec states nothing its source left out. */
const defined = (from: Json): Json =>
	Object.fromEntries(Object.entries(from).filter(([, value]) => value !== undefined));

const rowOf = (kind: unknown): GeomFacts | undefined =>
	typeof kind === "string" ? (GEOMS as Partial<Record<string, GeomFacts>>)[kind] : undefined;

/** The kinds renamed to ggplot's names. `range` and `donut` take their own paths. */
const KIND_BEFORE: Record<string, PlotKind> = {
	scatter: "point",
	interval: "ribbon",
	histogram2d: "hex",
	box: "boxplot",
	scatter3d: "point3d",
};

/** The aesthetics renamed to ggplot's names. */
const AES_BEFORE: Record<string, string> = {
	lo: "ymin",
	hi: "ymax",
	mid: "y",
	xEnd: "xend",
	yEnd: "yend",
	opacity: "alpha",
	dash: "linetype",
};

/** The glyph a range kind drew unless its style named one. */
const RANGE_GLYPH = "pointrange";

/** The hole a donut drew unless its style named one, as a fraction of the outer radius. */
const DONUT_HOLE = 0.55;

/** The kinds that stack their groups where no position is stated. Before, they overlapped. */
const STACKED: readonly string[] = ["bar", "histogram", "area"];

/** Position scale fields under their earlier names, each beside its name now. */
const SCALE_NAMES: Readonly<Record<string, string>> = {color: "ink", tickStep: "breakWidth"};

/** Style fields under their earlier names: a violin's `side` and a gauge's `bands`. */
const STYLE_NAMES: Readonly<Record<string, string>> = {side: "half", bands: "sections"};

/** Ring content kinds under their earlier names. A per-ribbon and a per-row point ring are one kind now. */
const RING_KINDS: Readonly<Record<string, string>> = {bars: "bar", points: "point", scatter: "point"};

/** Ring content fields under their earlier names: `reduce` for the aggregate. */
const RING_NAMES: Readonly<Record<string, string>> = {reduce: "aggregate"};

/** Annotation kinds that drew nothing, `series-label` under its name before the layer rename. */
const UNDRAWN: readonly unknown[] = ["band", "callout", "layer-label", "series-label"];

/**
 * A spec as this version reads it.
 *
 * Takes a current spec as it stands, and migrates one holding `series`. Throws on a version this
 * package does not read, and on a document holding no layer list.
 *
 * A scale, style or ring field saved under an earlier name takes its name now, and an annotation of a
 * kind that drew nothing drops.
 */
export function loadSpec(input: unknown): ChartSpec {
	if (!isObject(input)) throw new Error("ts-lib-viz: a spec is an object");
	const spec = settled(Array.isArray(input.series) ? migrateChart(input) : input);
	if (spec.version !== undefined && spec.version !== SPEC_VERSION) {
		throw new Error(
			`ts-lib-viz: spec version ${String(spec.version)} is unknown, and this package reads ${SPEC_VERSION}`,
		);
	}
	if (typeof spec.id !== "string") throw new Error("ts-lib-viz: a spec states its id as a string");
	if (!Array.isArray(spec.layers)) throw new Error("ts-lib-viz: a spec holds a list of layers");
	spec.layers.forEach((layer, index) => {
		if (!isObject(layer) || typeof layer.kind !== "string" || !isObject(layer.aes)) {
			throw new Error(`ts-lib-viz: layers[${index}] states no kind and aes`);
		}
	});
	return spec as unknown as ChartSpec;
}

/**
 * A spec in this layout under the field names the format settled on.
 *
 * Renames the `SCALE_NAMES`, `STYLE_NAMES` and `RING_NAMES` fields, a stated new name winning, and the
 * `RING_KINDS`. Drops the `UNDRAWN` annotations. A spec holding none of these comes back as it stands.
 */
function settled(spec: Json): Json {
	let moved = false;
	const renamed = (from: unknown, names: Readonly<Record<string, string>>): unknown => {
		if (!isObject(from)) return from;
		const next: Json = {...from};
		for (const [old, now] of Object.entries(names)) {
			if (!(old in next)) continue;
			next[now] ??= next[old];
			delete next[old];
			moved = true;
		}
		return next;
	};

	const next: Json = {...spec};
	if (isObject(spec.scales)) {
		const scales: Json = {...spec.scales};
		for (const axis of ["x", "y", "y2"]) if (axis in scales) scales[axis] = renamed(scales[axis], SCALE_NAMES);
		next.scales = scales;
	}
	const ring = (content: Json): Json => {
		const kind = typeof content.kind === "string" ? RING_KINDS[content.kind] : undefined;
		if (kind) moved = true;
		return {...(renamed(content, RING_NAMES) as Json), ...(kind ? {kind} : {})};
	};
	if (Array.isArray(spec.layers)) {
		next.layers = spec.layers.map((layer) => {
			if (!isObject(layer)) return layer;
			const out: Json = {...layer};
			if ("style" in layer) out.style = renamed(layer.style, STYLE_NAMES);
			if (Array.isArray(layer.rings)) {
				out.rings = layer.rings.map((held) =>
					isObject(held) && isObject(held.content) ? {...held, content: ring(held.content)} : held,
				);
			}
			return out;
		});
	}
	if (Array.isArray(spec.annotations)) {
		const drawn = spec.annotations.filter((note) => !(isObject(note) && UNDRAWN.includes(note.kind)));
		if (drawn.length < spec.annotations.length) moved = true;
		next.annotations = drawn;
	}
	return moved ? next : spec;
}

/** A chart from before `SPEC_VERSION`, field by field. */
function migrateChart(old: Json): Json {
	const {
		series,
		version: _version,
		dek,
		facetBy,
		facetColumns,
		coord,
		axes,
		colorScale,
		legend,
		fit,
		aspect,
		annotations,
		sides,
		...rest
	} = old;
	const layers = (series as unknown[]).filter(isObject).map(migrateLayer);

	const notes: unknown[] = [];
	for (const note of Array.isArray(annotations) ? annotations : []) {
		if (isObject(note) && note.kind === "reference") layers.push(referenceLayer(note, layers.length));
		else notes.push(note);
	}

	const scales: Json = {};
	const oldAxes = isObject(axes) ? axes : {};
	for (const name of ["x", "y", "y2"]) {
		if (isObject(oldAxes[name])) scales[name] = migrateAxis(oldAxes[name]);
	}
	/* The old color scale and swatch title reached each layer, whichever paint it now maps. */
	const paints = new Set<Paint>(
		layers.flatMap((layer) => (rowOf(layer.kind) ? [paintAesthetic(layer as unknown as LayerSpec)] : [])),
	);
	if (paints.size === 0) paints.add("color");
	const {titles, ...legendRest} = isObject(legend) ? legend : {};
	const named = isObject(titles) ? titles : {};
	const paintTitle = (isObject(colorScale) ? colorScale.title : undefined) ?? named.color ?? named.series;
	for (const paint of paints) {
		const scale = {...(isObject(colorScale) ? migrateColorScale(colorScale) : {}), ...defined({title: paintTitle})};
		if (Object.keys(scale).length > 0) scales[paint] = scale;
	}
	for (const [was, aesthetic] of [
		["size", "size"],
		["shape", "shape"],
		["opacity", "alpha"],
		["dash", "linetype"],
	] as const) {
		if (named[was] !== undefined) scales[aesthetic] = {title: named[was]};
	}

	return {
		version: SPEC_VERSION,
		...rest,
		...defined({
			subtitle: dek,
			layers,
			facet: typeof facetBy === "string" ? defined({by: facetBy, columns: facetColumns}) : undefined,
			coord: coord === "transpose" ? "flip" : coord === "rect" ? "cartesian" : coord,
			scales: Object.keys(scales).length > 0 ? scales : undefined,
			annotations: Array.isArray(annotations) ? notes : undefined,
			legend: isObject(legend) && Object.keys(legendRest).length > 0 ? legendRest : undefined,
			sides: Array.isArray(sides) ? sides.map(migrateSide) : undefined,
			sizing: fit,
			/* Width over height before, height over width now, ggplot's aspect.ratio. */
			aspect: typeof aspect === "number" && aspect > 0 ? 1 / aspect : aspect,
		}),
	};
}

/** One series from before `SPEC_VERSION` as a layer. */
function migrateLayer(old: Json): Json {
	const {
		channels,
		kind: was,
		style,
		label,
		splitBy,
		bin,
		axis,
		colorScale,
		fit,
		smooth,
		statParams,
		position,
		...rest
	} = old;
	const oldStyle = isObject(style) ? style : {};

	let kind =
		was === "range" ? (oldStyle.range ?? RANGE_GLYPH) : was === "donut" ? "pie" : (KIND_BEFORE[String(was)] ?? was);
	/* A stated bin cut a continuous x. A bar now draws one per distinct x, and the histogram bins. */
	if (kind === "bar" && bin !== undefined) kind = "histogram";
	const row = rowOf(kind);

	const aes: Json = {};
	for (const [key, value] of Object.entries(isObject(channels) ? channels : {})) {
		if (value !== undefined) aes[AES_BEFORE[key] ?? key] ??= value;
	}
	/* The color channel painted an interior before `fill` existed. */
	if (row && row.accepts.includes("fill") && !row.accepts.includes("color") && aes.color !== undefined) {
		aes.fill ??= aes.color;
		delete aes.color;
	}
	/* A split handed each value its own color. It takes the paint where the layer binds none, and the group otherwise. */
	if (typeof splitBy === "string" && row) {
		const paint = paintAesthetic({kind: kind as PlotKind, aes: aes as LayerSpec["aes"]});
		const bound = [...row.requires, ...row.accepts] as string[];
		if (aes[paint] === undefined && bound.includes(paint)) aes[paint] = splitBy;
		else if (bound.includes("group")) aes.group ??= splitBy;
	}
	/* A fit or a smooth ran one curve per value of its groupBy, which the group aesthetic now does. */
	const oldFit = isObject(fit) ? fit : undefined;
	const oldSmooth = isObject(smooth) ? smooth : undefined;
	const groupBy = oldFit?.groupBy ?? oldSmooth?.groupBy;
	if (typeof groupBy === "string") aes.group ??= groupBy;
	/* Each series held the chart's channels whole. An aesthetic the kind reads nowhere drops, as the builder leaves it behind now. */
	if (row) {
		const reads = new Set<string>([...row.requires, ...row.accepts]);
		for (const key of Object.keys(aes)) if (!reads.has(key)) delete aes[key];
	}

	const params = isObject(statParams) ? {...statParams} : {};
	if (typeof bin === "number") params.binwidth ??= bin;

	const {range: _range, jitter, ...styleRest} = oldStyle;
	const nextStyle = migrateStyle(styleRest, row);
	if (was === "donut") nextStyle.innerRadius ??= DONUT_HOLE;

	/* A jitter was a style fraction and is a position now, at ggplot's default reach. */
	let nextPosition = position;
	if (nextPosition === undefined && typeof jitter === "number" && jitter > 0) nextPosition = {kind: "jitter"};
	/* A jitter's reach was a share of the axis's resolution and is data units now. A stated share drops to the default. Zero reads the same in both. */
	if (isObject(nextPosition) && (nextPosition.kind === "jitter" || nextPosition.kind === "jitterdodge")) {
		const {width, height, ...kept} = nextPosition;
		nextPosition = {...kept, ...(width === 0 ? {width} : {}), ...(height === 0 ? {height} : {})};
	}
	const grouped = ["fill", "color", "group"].some((aesthetic) => aes[aesthetic] !== undefined);
	if (nextPosition === undefined && grouped && STACKED.includes(String(kind))) nextPosition = "identity";

	const layer: Json = {...rest, kind, aes};
	const paint = row ? paintAesthetic(layer as unknown as LayerSpec) : "color";
	return {
		...layer,
		...defined({
			axis: axis === "right" ? "y2" : axis === "left" ? "y" : axis,
			style: Object.keys(nextStyle).length > 0 ? nextStyle : undefined,
			position: nextPosition,
			directLabels: isObject(label) ? migrateLabel(label) : undefined,
			fit: oldFit ? withoutGroupBy(oldFit) : undefined,
			smooth: oldSmooth ? withoutGroupBy(oldSmooth) : undefined,
			statParams: Object.keys(params).length > 0 ? params : undefined,
			scales: isObject(colorScale) ? {[paint]: migrateColorScale(colorScale)} : undefined,
		}),
	};
}

const withoutGroupBy = ({groupBy: _groupBy, ...kept}: Json): Json => kept;

/**
 * A style from before `SPEC_VERSION`, key by key.
 *
 * `stroke` splits into `color`, `linewidth` and `linetype`. Its own opacity has no field and drops.
 */
function migrateStyle(old: Json, row: GeomFacts | undefined): Json {
	const {opacity, stroke, edgeWidth, level, parts, ...rest} = old;
	const ink = typeof stroke === "string" ? {color: stroke} : isObject(stroke) ? stroke : {};
	const next: Json = {
		...rest,
		...defined({
			alpha: opacity,
			color: ink.color,
			linewidth: ink.width,
			linetype: ink.dash,
			halo: edgeWidth,
			isoLevel: level,
		}),
	};
	/* A kind with no interior drew its line in its fill, ahead of the stroke's color. */
	if (row && !row.paints.includes("fill") && next.fill !== undefined) {
		next.color = next.fill;
		delete next.fill;
	}
	if (isObject(parts)) {
		next.parts = Object.fromEntries(
			Object.entries(parts).map(([part, paint]) => [part, isObject(paint) ? migrateStyle(paint, undefined) : paint]),
		);
	}
	return next;
}

/** A top label rule ranked by an axis under `by`, which is `on` now, as the threshold rule reads. */
function migrateLabel(old: Json): Json {
	if (!isObject(old.when) || old.when.kind !== "top") return old;
	const {by, ...when} = old.when;
	return {...old, when: {...when, on: when.on ?? by}};
}

function migrateAxis(old: Json): Json {
	const {range, lineWidth, log, order, ...rest} = old;
	return {
		...rest,
		...defined({
			limits: range,
			linewidth: lineWidth,
			transform: rest.transform ?? (log === true ? "log10" : undefined),
			order: isObject(order) ? migrateOrder(order) : order,
		}),
	};
}

/** A band order tagged under `by`, which is `kind` now. A reorder callback cannot survive a save and drops. */
function migrateOrder(old: Json): Json {
	const {by, callback: _callback, ...rest} = old;
	return defined({kind: rest.kind ?? by, ...rest});
}

function migrateColorScale(old: Json): Json {
	const {range, scale, breaks, legendTicks, log, sqrt, ...rest} = old;
	const ticks = Array.isArray(legendTicks) ? legendTicks.filter(isObject) : undefined;
	const labels = ticks?.filter((tick) => tick.label != null).map((tick) => [String(tick.at), tick.label]);
	return {
		...rest,
		...defined({
			limits: range,
			standardize: scale,
			bins: breaks,
			breaks: ticks?.map((tick) => tick.at),
			labels: labels && labels.length > 0 ? Object.fromEntries(labels) : undefined,
			transform: rest.transform ?? (log === true ? "log10" : sqrt === true ? "sqrt" : undefined),
		}),
	};
}

/** A side panel named its edge before. Its histogram took `bin`, which is `binwidth` now, and `auto` is the default. */
function migrateSide(old: unknown): unknown {
	if (!isObject(old)) return old;
	const {edge, content, ...rest} = old;
	let next = content;
	if (isObject(content) && content.kind === "histogram") {
		const {bin, ...kept} = content;
		next = {...kept, ...defined({binwidth: typeof bin === "number" ? bin : undefined})};
	}
	return {...rest, ...defined({position: rest.position ?? edge, content: next})};
}

/** A reference annotation as the rule layer that replaced it, one line at its value. */
function referenceLayer(note: Json, index: number): Json {
	const kind = note.axis === "x" ? "vline" : "hline";
	const at = kind === "vline" ? "xintercept" : "yintercept";
	const labeled = typeof note.label === "string";
	return {
		id: `${kind}${index}`,
		kind,
		aes: labeled ? {[at]: at, label: "label"} : {[at]: at},
		data: [labeled ? {[at]: note.value, label: note.label} : {[at]: note.value}],
		showLegend: false,
	};
}
