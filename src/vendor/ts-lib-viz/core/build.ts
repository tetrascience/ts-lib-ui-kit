/**
 * Authoring, apart from the format it produces.
 *
 * `plot()` takes rows and an aes and `spec()` emits a `ChartSpec`. `StoredSpec` adds where a host
 * keeps it, and the host writes those fields.
 */

import type {VizData} from "./adapters.js";
import type {WaivableCode} from "./finding-codes.js";
import {
	isAesthetic,
	kindFacts,
	statKeysOf,
	STYLE_KEYS,
	type Aesthetic,
	type BoundTo,
	type LayerField,
	type LayerFieldOf,
	type OptionalAesthetic,
	type PaintOf,
	type PartOf,
	type Parts,
	type RequiredAesthetic,
	type StatArgs,
	type StatOf,
	type StyleOf,
} from "./geom-table.js";
import type {Stat} from "./grammar.js";
import {
	type Annotation,
	type ChartScales,
	type ChartSpec,
	type Aes,
	type FitSpec,
	type LayerStyle,
	type LegendOptions,
	type PlotKind,
	type LayerSpec,
	type SidePanel,
	type SmoothMethod,
	type SmoothSpec,
	type StatParams,
	SPEC_VERSION,
} from "./spec.js";

/** Confidence level a curve takes where the author states none. */
const DEFAULT_LEVEL = 0.95;

/** Fields any layer states, whatever its kind. */
const COMMON_FIELDS = [
	"name",
	"axis",
	"visible",
	"palette",
	"scales",
	"data",
	"showLegend",
] as const satisfies readonly (keyof LayerSpec)[];

type CommonField = (typeof COMMON_FIELDS)[number];

/**
 * Nothing, where each `LayerSpec` field has a way in: a flat option, the aes, or a method's own argument.
 *
 * A field missing here would ship with no authoring path.
 */
type Unrouted = Exclude<
	keyof LayerSpec,
	CommonField | LayerField | "id" | "kind" | "aes" | "style" | "smooth" | "statParams"
>;
const everyFieldRouted: [Unrouted] extends [never] ? true : false = true;
void everyFieldRouted;

/** A type's own keys as one object literal, the form a hover and an error print. */
type Simplify<T> = {[K in keyof T]: T[K]} & {};

/**
 * What a layer states for itself as constants, over the aes it inherits.
 *
 * Flat, and narrowed by the kind. `GEOMS` names the style fields and statistic parameters a kind
 * reads. A row listing `bin` takes the bin statistic's parameters. A flat option is a value, and a column
 * binds through `aes`. A kind with no parts takes no `parts` key.
 */
export type LayerOptions<K extends PlotKind, S extends Stat = StatOf<K> | Extract<LayerFieldOf<K>, Stat>> = Partial<
	Pick<LayerSpec, CommonField>
> &
	Partial<Pick<LayerSpec, Exclude<LayerFieldOf<K>, Stat>>> &
	Partial<Pick<LayerStyle, StyleOf<K> | PaintOf<K>>> &
	StatArgs<S> &
	([PartOf<K>] extends [never]
		? unknown
		: {
				/** Paint for a named part of this geometry. */
				parts?: Parts<K>;
			});

/** The columns a layer's own aes binds, keyed by the aesthetics its kind reads. */
export type LayerAes<K extends PlotKind> = {[C in RequiredAesthetic<K> | OptionalAesthetic<K>]?: BoundTo<C>};

/** Keys of an aes holding a defined value. An optional key, or one holding `undefined`, binds nothing. */
type BoundKeys<A> = Exclude<{[C in keyof A]: undefined extends A[C] ? never : C}[keyof A], undefined>;

/** Aesthetics a kind requires that the plot's aes left unbound. */
type Unbound<K extends PlotKind, A> = Exclude<RequiredAesthetic<K>, BoundKeys<A>>;

/**
 * What a layer method takes -- its constants, and an aes for the columns it binds itself.
 *
 * The aes is required, with each required aesthetic the plot's aes left unbound, and optional
 * where the plot's aes bound them all.
 */
export type LayerArgs<K extends PlotKind, A> = Simplify<
	LayerOptions<K> &
		([Unbound<K, A>] extends [never] ? {aes?: LayerAes<K>} : {aes: LayerAes<K> & {[C in Unbound<K, A>]: BoundTo<C>}})
>;

/** What `layer` takes for a kind typed `PlotKind`: each kind's fields at once. */
export type AnyLayerOptions = LayerOptions<PlotKind> & {aes?: Aes};

/**
 * The argument list `layer(kind, ...)` and the kind's own method take.
 *
 * A tuple. The options go missing where the aes bound the required aesthetics, and a required
 * options object names the aesthetics its aes owes. A union of kinds takes the fields of each.
 */
export type LayerCall<K extends PlotKind, A> = PlotKind extends K
	? [options?: AnyLayerOptions]
	: [K] extends ["smooth"]
		? [options: SmoothOptions<A>]
		: [K] extends ["hline"]
			? [options: RuleArgs<"hline", "yintercept">]
			: [K] extends ["vline"]
				? [options: RuleArgs<"vline", "xintercept">]
				: [K] extends ["abline"]
					? [options?: RuleOptions<"abline"> & {slope?: RuleValue; intercept?: RuleValue}]
					: Record<never, never> extends LayerArgs<K, A>
						? [options?: LayerArgs<K, A>]
						: [options: LayerArgs<K, A>];

/**
 * What a smooth layer states -- the method, its own arguments, and the layer's.
 *
 * Flat, the way `geom_smooth()` reads. `level` and `band` default.
 */
export type SmoothOptions<A = Aes> = Simplify<
	SmoothMethod &
		LayerArgs<"smooth", A> & {
			level?: number;
			band?: boolean;
		}
>;

/** What a fit layer states, over the geom that draws the readings underneath it. */
export type FitOptions<A = Aes> = Simplify<
	Omit<FitSpec, "level" | "band"> &
		Omit<LayerArgs<"point", A>, "fit"> & {
			level?: number;
			band?: boolean;
		}
>;

/** What `labs` names: the headline, its subtitle, the caption, and a title per aesthetic scale. */
export type Labs = {headline?: string; subtitle?: string; caption?: string} & {[A in keyof ChartScales]?: string};

/** A position per reference line, one number or a list of them. A column binds through `aes`. */
export type RuleValue = number | readonly number[];

/** The three reference kinds. */
type RuleKind = "hline" | "vline" | "abline";

/**
 * What a reference layer states beside its own positions: `color`, `linewidth`, `linetype` and
 * `alpha` constants, and the columns its aes maps.
 *
 * `label` is rule 4's text: one per line or one for all. A column of labels binds through `aes.label`.
 */
export type RuleOptions<K extends RuleKind = RuleKind> = LayerOptions<K> & {
	aes?: LayerAes<K>;
	label?: string | readonly string[];
};

/**
 * A reference layer with its position `P`, numbers flat or a column the aes binds.
 *
 * The flat position goes optional where the aes binds it.
 */
type RuleArgs<K extends RuleKind, P extends RequiredAesthetic<K>> = RuleOptions<K> &
	({[Q in P]: RuleValue} | ({[Q in P]?: RuleValue} & {aes: {[Q in P]: string}}));

/** A value `annotate` writes into its rows: one for all of them, or one per row. */
export type AnnotateValue = string | number | readonly (string | number)[];

/**
 * What `annotate(kind, values)` takes, ggplot's `annotate()`.
 *
 * The kind's required aesthetics take a value or a list, and a list makes a row each. Each other key
 * is a constant. A reference kind takes numbers for its positions, and no aes or rows.
 */
export type AnnotateValues<K extends PlotKind> = K extends "hline" | "vline" | "abline"
	? Omit<RuleOptions, "aes" | "data"> & {[C in RequiredAesthetic<K>]: number | readonly number[]}
	: {[C in RequiredAesthetic<K>]: AnnotateValue} & Omit<LayerOptions<K>, "data">;

/** The arguments the method union takes, seen flat. */
type MethodArgs = {
	span?: number;
	degree?: number;
	family?: Extract<SmoothMethod, {method: "glm"}>["family"];
};

/** A layer as the builder assembles it, each kind's fields at once. */
type LayerInput = AnyLayerOptions & {smooth?: SmoothSpec};

/** The chart-level fields a builder holds between calls. */
type Draft = Partial<Omit<ChartSpec, "id" | "layers">>;

/**
 * A deep copy of plain objects and arrays. Stands in for `structuredClone`, which Jest's jsdom
 * environment does not provide. Anything else is shared, as the specs hold only plain values.
 */
const copyPlain = <T,>(value: T): T => {
  if (Array.isArray(value)) return value.map(copyPlain) as T;
  if (value !== null && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, copyPlain(inner)])) as T;
  }
  return value;
};

/** A spec's own copy of a layer. The rows stay shared, as `props()` shares the plot's. */
const fresh = ({data, ...layer}: LayerSpec): LayerSpec => ({...copyPlain(layer), ...(data ? {data} : {})});

/**
 * A chart under construction, ggplot's plot object.
 *
 * Persistent. Each method returns a new builder and leaves this one as it was, and a base plot
 * branches into as many charts as the author builds from it. `plot()` makes the first.
 */
class PlotBuilder<Data, A extends Aes = Aes> {
	constructor(
		private readonly data: Data,
		private readonly aes: A,
		private readonly id: string,
		private readonly layers: readonly LayerSpec[] = [],
		private readonly draft: Readonly<Draft> = {},
	) {}

	/** This chart with some chart-level fields stated. */
	private stating(change: Draft): PlotBuilder<Data, A> {
		return new PlotBuilder(this.data, this.aes, this.id, this.layers, {...this.draft, ...change});
	}

	/**
	 * This chart and one more layer, under the plot's aes or under `own` alone.
	 *
	 * The id is the kind and the layer's position, and two builds agree. A key the kind reads nowhere
	 * throws, naming the key.
	 */
	private push(kind: PlotKind, options: LayerInput = {}, own?: Aes): PlotBuilder<Data, A> {
		const {aes, parts, ...stated} = options;
		const stray = Object.keys({...(own ?? this.aes), ...aes}).find((key) => !isAesthetic(key));
		if (stray) throw new Error(`ts-lib-viz: ${stray} is not an aesthetic`);

		const facts = kindFacts(kind);
		/*
		  The plot's aesthetics the kind reads reach the layer, and the rest stay behind. An aesthetic
		  the layer states that its kind reads nowhere throws.
		*/
		const reads = new Set<string>([...facts.requires, ...facts.accepts]);
		const refused = Object.entries(own ?? aes ?? {}).find(([key, column]) => column !== undefined && !reads.has(key));
		if (refused) throw new Error(`ts-lib-viz: ${refused[0]} is no aesthetic of a ${kind} layer`);
		const merged: Aes = own ?? {
			...Object.fromEntries(Object.entries(this.aes).filter(([key]) => reads.has(key))),
			...aes,
		};

		const part = Object.keys(parts ?? {}).find((name) => !(facts.parts as readonly string[]).includes(name));
		if (part) throw new Error(`ts-lib-viz: a ${kind} layer has no ${part} part`);
		const styles = new Set<string>([...facts.paints, ...facts.style]);
		const statKeys = statKeysOf(kind);
		/* `bin` on a row marks the bin statistic's parameters and names no layer field. */
		const fields = new Set<string>([
			...COMMON_FIELDS,
			...facts.layer.filter((field) => field !== "bin"),
			...(kind === "smooth" ? ["smooth"] : []),
		]);

		/*
      The flat options sorted into three halves -- a style, statistic parameters and the layer.
      Each is a constant. A column binds through the aes.
    */
		const style: Record<string, unknown> = {};
		const layer: Record<string, unknown> = {};
		const statParams: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(stated)) {
			if (value === undefined) continue;
			if (styles.has(key)) style[key] = value;
			else if (statKeys.has(key)) statParams[key] = value;
			else if (fields.has(key)) layer[key] = value;
			else if (isAesthetic(key) && !STYLE_KEYS.has(key))
				throw new Error(`ts-lib-viz: ${kind} maps ${key} to a column through aes`);
			else throw new Error(`ts-lib-viz: ${key} is no option of a ${kind} layer`);
		}

		const next: LayerSpec = {
			...(layer as Partial<LayerSpec>),
			id: `${kind}${this.layers.length}`,
			kind,
			aes: merged,
			/*
			  Written where the author stated one. A spec gets no empty style or statistic object, and
			  each geom takes its own default at draw time.
			*/
			...(Object.keys(style).length > 0 || parts ? {style: {...style, ...(parts ? {parts} : {})} as LayerStyle} : {}),
			...(Object.keys(statParams).length > 0 ? {statParams: statParams as StatParams} : {}),
		};
		return new PlotBuilder(this.data, this.aes, this.id, [...this.layers, next], this.draft);
	}

	/**
	 * One layer of a named kind, under the plot's aes. `layer("point", options)` is `point(options)`.
	 *
	 * The kind decides the options, as it does on the kind's own method. A kind typed `PlotKind` takes
	 * each kind's fields at once.
	 */
	layer<K extends PlotKind>(kind: K, ...args: LayerCall<K, A>): PlotBuilder<Data, A> {
		const options = (args[0] ?? {}) as never;
		switch (kind) {
			case "smooth":
				return this.smooth(options);
			case "hline":
				return this.hline(options);
			case "vline":
				return this.vline(options);
			case "abline":
				return this.abline(options);
			default:
				return this.push(kind, options);
		}
	}

	/*
    One method per kind, taking what that kind's own geometry reads.

    The argument list comes off `GEOMS` through `LayerArgs`. `LayerCall` decides whether the
    argument is optional.
  */
	point(...args: LayerCall<"point", A>): PlotBuilder<Data, A> {
		return this.push("point", args[0]);
	}
	line(...args: LayerCall<"line", A>): PlotBuilder<Data, A> {
		return this.push("line", args[0]);
	}
	area(...args: LayerCall<"area", A>): PlotBuilder<Data, A> {
		return this.push("area", args[0]);
	}
	bar(...args: LayerCall<"bar", A>): PlotBuilder<Data, A> {
		return this.push("bar", args[0]);
	}
	/*
    Signed steps on a running total, taking a bar's aes and reading no fill.

    The hue is the step's direction. `parts.rise` and `parts.fall` paint it.
  */
	waterfall(...args: LayerCall<"waterfall", A>): PlotBuilder<Data, A> {
		return this.push("waterfall", args[0]);
	}
	histogram(...args: LayerCall<"histogram", A>): PlotBuilder<Data, A> {
		return this.push("histogram", args[0]);
	}
	/* The same count under the same bin, drawn as a run between the centers. */
	freqpoly(...args: LayerCall<"freqpoly", A>): PlotBuilder<Data, A> {
		return this.push("freqpoly", args[0]);
	}
	hex(...args: LayerCall<"hex", A>): PlotBuilder<Data, A> {
		return this.push("hex", args[0]);
	}
	boxplot(...args: LayerCall<"boxplot", A>): PlotBuilder<Data, A> {
		return this.push("boxplot", args[0]);
	}
	violin(...args: LayerCall<"violin", A>): PlotBuilder<Data, A> {
		return this.push("violin", args[0]);
	}
	/* A kernel density over one measure. `bw` states the smoothing the curve's shape rests on. */
	density(...args: LayerCall<"density", A>): PlotBuilder<Data, A> {
		return this.push("density", args[0]);
	}
	contour(...args: LayerCall<"contour", A>): PlotBuilder<Data, A> {
		return this.push("contour", args[0]);
	}
	heatmap(...args: LayerCall<"heatmap", A>): PlotBuilder<Data, A> {
		return this.push("heatmap", args[0]);
	}
	ribbon(...args: LayerCall<"ribbon", A>): PlotBuilder<Data, A> {
		return this.push("ribbon", args[0]);
	}
	/* The same two bounds a mark at a time, as ggplot's four interval geoms. */
	errorbar(...args: LayerCall<"errorbar", A>): PlotBuilder<Data, A> {
		return this.push("errorbar", args[0]);
	}
	linerange(...args: LayerCall<"linerange", A>): PlotBuilder<Data, A> {
		return this.push("linerange", args[0]);
	}
	pointrange(...args: LayerCall<"pointrange", A>): PlotBuilder<Data, A> {
		return this.push("pointrange", args[0]);
	}
	crossbar(...args: LayerCall<"crossbar", A>): PlotBuilder<Data, A> {
		return this.push("crossbar", args[0]);
	}
	segment(...args: LayerCall<"segment", A>): PlotBuilder<Data, A> {
		return this.push("segment", args[0]);
	}

	/*
    The three with a vocabulary of their own.

    A flow names a source and a target. `plot()` takes whatever channels a kind reads.
  */
	sankey(...args: LayerCall<"sankey", A>): PlotBuilder<Data, A> {
		return this.push("sankey", args[0]);
	}

	/** The same pairs round a center, with an axis per sector. */
	chord(...args: LayerCall<"chord", A>): PlotBuilder<Data, A> {
		return this.push("chord", args[0]);
	}

	/** A genome round a circle, one sector per chromosome. */
	ideogram(...args: LayerCall<"ideogram", A>): PlotBuilder<Data, A> {
		return this.push("ideogram", args[0]);
	}
	treemap(...args: LayerCall<"treemap", A>): PlotBuilder<Data, A> {
		return this.push("treemap", args[0]);
	}
	icicle(...args: LayerCall<"icicle", A>): PlotBuilder<Data, A> {
		return this.push("icicle", args[0]);
	}
	/* The same nesting round a center. It owes a number on each slice. */
	sunburst(...args: LayerCall<"sunburst", A>): PlotBuilder<Data, A> {
		return this.push("sunburst", args[0]);
	}
	parcoords(...args: LayerCall<"parcoords", A>): PlotBuilder<Data, A> {
		return this.push("parcoords", args[0]);
	}

	/*
    The polar three, with the coordinate on the kind.

    A pie takes a bar's aes. `innerRadius` above zero draws a donut.
  */
	pie(...args: LayerCall<"pie", A>): PlotBuilder<Data, A> {
		return this.push("pie", args[0]);
	}
	gauge(...args: LayerCall<"gauge", A>): PlotBuilder<Data, A> {
		return this.push("gauge", args[0]);
	}

	/*
    The parallel plot round a center, taking the same ordered list of measures.

    The order the list keeps is the order the spokes take.
  */
	radar(...args: LayerCall<"radar", A>): PlotBuilder<Data, A> {
		return this.push("radar", args[0]);
	}

	/** ggplot's `geom_text`: a label per row at its reading. `vjust` and `hjust` read ggplot's way. */
	text(...args: LayerCall<"text", A>): PlotBuilder<Data, A> {
		return this.push("text", args[0]);
	}

	/** ggplot's `geom_label`: the same label with a box behind it. */
	label(...args: LayerCall<"label", A>): PlotBuilder<Data, A> {
		return this.push("label", args[0]);
	}

	/**
	 * ggplot's `geom_hline`. A number or a list draws a line at each, and a column the aes binds reads
	 * them off rows.
	 *
	 * It inherits no aes and trains no scale.
	 */
	hline({yintercept, ...options}: RuleArgs<"hline", "yintercept">): PlotBuilder<Data, A> {
		return this.rule("hline", {yintercept}, options);
	}

	/** ggplot's `geom_vline`, taking its positions the way `hline` does. */
	vline({xintercept, ...options}: RuleArgs<"vline", "xintercept">): PlotBuilder<Data, A> {
		return this.rule("vline", {xintercept}, options);
	}

	/**
	 * ggplot's `geom_abline`, read in the scales' transformed space.
	 *
	 * Neither argument, flat or in the aes, draws the identity line. On log axes a 2-fold line is an
	 * intercept of `log10(2)`.
	 */
	abline({
		slope,
		intercept,
		...options
	}: RuleOptions<"abline"> & {slope?: RuleValue; intercept?: RuleValue} = {}): PlotBuilder<Data, A> {
		const bound = options.aes?.slope !== undefined || options.aes?.intercept !== undefined;
		return this.rule("abline", bound ? {slope, intercept} : {slope: slope ?? 1, intercept: intercept ?? 0}, options);
	}

	/**
	 * A reference layer off its positions.
	 *
	 * Constants alone become the layer's own rows, one per line. A column the aes binds reads the
	 * layer's rows, and a constant beside it lands on each row, a list of labels one per row. The aes
	 * wins a position or a label stated both ways.
	 */
	private rule(
		kind: RuleKind,
		positions: Record<string, RuleValue | undefined>,
		{label, aes = {}, data, ...options}: RuleOptions,
	): PlotBuilder<Data, A> {
		const flat = Object.entries(positions).find(([, value]) => typeof value === "string");
		if (flat) throw new Error(`ts-lib-viz: ${kind} maps ${flat[0]} to a column through aes`);
		const bound = Object.keys(positions).some((key) => aes[key as keyof typeof aes] !== undefined);
		const lists = Object.entries(positions).flatMap(([key, value]) =>
			value === undefined || aes[key as keyof typeof aes] !== undefined
				? []
				: [[key, typeof value === "number" ? [value] : value] as const],
		);
		if (!bound && lists.length === 0) throw new Error(`ts-lib-viz: ${kind} takes a position for each line it draws`);
		const labels = label == null || aes.label !== undefined ? null : typeof label === "string" ? [label] : label;
		const pick = <T>(values: readonly T[], at: number) => values[Math.min(at, values.length - 1)]!;
		const constants = (at: number) => ({
			...Object.fromEntries(lists.map(([key, values]) => [key, pick(values, at)])),
			...(labels ? {label: pick(labels, at)} : {}),
		});

		let rows = data;
		if (!bound) {
			const count = lists.reduce((most, [, values]) => Math.max(most, values.length), Math.max(1, labels?.length ?? 0));
			rows = Array.from({length: count}, (_, at) => constants(at));
		} else if (lists.length > 0 || labels) {
			if (!data || lists.some(([, values]) => values.length !== 1))
				throw new Error(`ts-lib-viz: ${kind} takes a constant beside a column as one value over rows of its own`);
			rows = data.map((row, at) => ({...row, ...constants(at)}));
		}
		const own = {...Object.fromEntries(lists.map(([key]) => [key, key])), ...(labels ? {label: "label"} : {}), ...aes};

		/* ggplot's `inherit.aes = FALSE`: the layer reads its own channels and none of the plot's. */
		return this.push(kind, {...options, ...(rows ? {data: rows} : {})}, own);
	}

	point3d(...args: LayerCall<"point3d", A>): PlotBuilder<Data, A> {
		return this.push("point3d", args[0]);
	}
	surface(...args: LayerCall<"surface", A>): PlotBuilder<Data, A> {
		return this.push("surface", args[0]);
	}
	mesh3d(...args: LayerCall<"mesh3d", A>): PlotBuilder<Data, A> {
		return this.push("mesh3d", args[0]);
	}
	isosurface(...args: LayerCall<"isosurface", A>): PlotBuilder<Data, A> {
		return this.push("isosurface", args[0]);
	}
	volume(...args: LayerCall<"volume", A>): PlotBuilder<Data, A> {
		return this.push("volume", args[0]);
	}

	/**
	 * A curve through the points, drawn without them.
	 *
	 * The `Fitter` the chart was given answers it. A chart with none draws the other layers and no
	 * curve.
	 */
	smooth(options: SmoothOptions<A>): PlotBuilder<Data, A> {
		const {
			method,
			span,
			degree,
			family,
			level = DEFAULT_LEVEL,
			band = true,
			...layer
		} = options as SmoothOptions<A> & MethodArgs;

		/*
      Reassembled. The method and its arguments arrive in one flat object, and the union says
      which of them belong together.
    */
		const smooth = {
			method,
			...(span !== undefined ? {span} : {}),
			...(degree !== undefined ? {degree} : {}),
			...(family !== undefined ? {family} : {}),
			level,
			band,
		} as SmoothSpec;

		return this.push("smooth", {...(layer as AnyLayerOptions), smooth});
	}

	/**
	 * A parametric model, over a geom that draws the readings it was fitted through.
	 *
	 * A property of the layer, and the curve takes those readings' color and split.
	 */
	fit(options: FitOptions<A>): PlotBuilder<Data, A> {
		const {model, level = DEFAULT_LEVEL, band = true, ...layer} = options;
		return this.push("point", {...(layer as AnyLayerOptions), fit: {model, level, band}});
	}

	/**
	 * The figure's words, ggplot's `labs()`: the claim, the line under it, the caption, and each
	 * aesthetic's title.
	 *
	 * The headline is a sentence the critic holds to the axis titles. A title writes
	 * `scales.<aesthetic>.title`, the field `scale()` writes.
	 */
	labs({headline, subtitle, caption, ...titles}: Labs): PlotBuilder<Data, A> {
		let next = this.stating({
			...(headline !== undefined ? {headline} : {}),
			...(subtitle !== undefined ? {subtitle} : {}),
			...(caption !== undefined ? {caption} : {}),
		});
		for (const [aesthetic, title] of Object.entries(titles)) {
			if (title !== undefined) next = next.scale(aesthetic as keyof ChartScales, {title});
		}
		return next;
	}

	/**
	 * One panel per value of `by`, `columns` of them to a row.
	 *
	 * ggplot's `facet_wrap(~by, ncol =)`. Absent, the width divides by the narrowest panel worth
	 * cutting a column for.
	 */
	facet(by: string, {columns}: {columns?: number} = {}): PlotBuilder<Data, A> {
		return this.stating({facet: columns === undefined ? {by} : {by, columns}});
	}

	/**
	 * Draws the shared pair of scales the other way round, which is ggplot's `coord_flip()`.
	 *
	 * The names stay with the data. `x` is still whatever the aes bound to it.
	 */
	flip(): PlotBuilder<Data, A> {
		return this.stating({coord: "flip"});
	}

	/** Units of y per unit of x on screen, in transformed space. ggplot's `coord_fixed()`. */
	fixed(ratio = 1): PlotBuilder<Data, A> {
		return this.stating({ratio});
	}

	/**
	 * What the author states on one aesthetic's scale, ggplot's `scale_*()`.
	 *
	 * Merged over what an earlier call stated, and this composes with `scales` and `labs` in any order.
	 */
	scale<K extends keyof ChartScales>(aesthetic: K, options: NonNullable<ChartScales[K]>): PlotBuilder<Data, A> {
		return this.stating({scales: {...this.draft.scales, [aesthetic]: {...this.draft.scales?.[aesthetic], ...options}}});
	}

	/** Each scale at once, for a caller that already has the object. Merged per aesthetic. */
	scales(options: ChartScales): PlotBuilder<Data, A> {
		return Object.entries(options).reduce<PlotBuilder<Data, A>>(
			(next, [aesthetic, settings]) => (settings ? next.scale(aesthetic as keyof ChartScales, settings) : next),
			this,
		);
	}

	/** A `log10` transform on one scale, the override asked for most. The vertical by default. */
	log(aesthetic: "x" | "y" | "y2" | "color" | "fill" = "y"): PlotBuilder<Data, A> {
		return this.scale(aesthetic, {transform: "log10"});
	}

	legend(options: LegendOptions): PlotBuilder<Data, A> {
		return this.stating({legend: {...this.draft.legend, ...options}});
	}

	/**
	 * Columns the tooltip adds after the bound aesthetics, in order.
	 *
	 * Copied, and a caller that goes on mutating its own array cannot edit a spec it handed over.
	 */
	tooltip(fields: readonly string[]): PlotBuilder<Data, A> {
		return this.stating({tooltip: [...fields]});
	}

	side(...panels: SidePanel[]): PlotBuilder<Data, A> {
		return this.stating({sides: [...(this.draft.sides ?? []), ...panels]});
	}

	/**
	 * Anything the figure states in its own words, or ggplot's `annotate()`.
	 *
	 * A kind and its values make a one-off layer. A list of values makes a row each.
	 */
	annotate<K extends PlotKind>(kind: K, values: AnnotateValues<K>): PlotBuilder<Data, A>;
	annotate(...found: Annotation[]): PlotBuilder<Data, A>;
	annotate(...args: [PlotKind, Record<string, unknown>] | Annotation[]): PlotBuilder<Data, A> {
		const [first, values] = args;
		if (typeof first !== "string") {
			return this.stating({annotations: [...(this.draft.annotations ?? []), ...(args as Annotation[])]});
		}
		const stated = values as Record<string, unknown>;
		if (first === "hline" || first === "vline" || first === "abline") {
			const {yintercept, xintercept, slope, intercept, ...rest} = stated;
			const positions = {yintercept, xintercept, slope, intercept} as Record<string, RuleValue | undefined>;
			return this.rule(first, positions, {...(rest as RuleOptions), showLegend: false});
		}
		/* One row per entry off the required aesthetics. A scalar repeats on each row, as in ggplot's `annotate`. */
		const required = new Set<string>(kindFacts(first).requires);
		const bound = Object.entries(stated).filter(([key]) => required.has(key));
		const constants = Object.fromEntries(Object.entries(stated).filter(([key]) => !required.has(key)));
		const count = bound.reduce((most, [, value]) => Math.max(most, Array.isArray(value) ? value.length : 1), 1);
		const rows = Array.from({length: count}, (_, at) =>
			Object.fromEntries(
				bound.map(([key, value]) => [key, Array.isArray(value) ? value[Math.min(at, value.length - 1)] : value]),
			),
		) as NonNullable<LayerSpec["data"]>;
		/* ggplot's `annotate` inherits no aes. The layer reads its own columns. */
		const own = Object.fromEntries(bound.map(([key]) => [key, key]));
		return this.push(first, {...constants, data: rows, showLegend: false} as LayerInput, own);
	}

	/** The figure's size and how it takes its room. `width` and `height` are the whole figure's. */
	canvas(options: Pick<ChartSpec, "width" | "height" | "aspect" | "sizing">): PlotBuilder<Data, A> {
		return this.stating(options);
	}

	/** A critic finding this figure is allowed to keep. */
	override(...codes: WaivableCode[]): PlotBuilder<Data, A> {
		return this.stating({overrides: [...(this.draft.overrides ?? []), ...codes]});
	}

	/**
	 * The document a store saves, in objects of its own. Editing one spec leaves the builder and each
	 * other spec as they were.
	 *
	 * A figure with no claim builds and draws, and `blocking` refuses it. A headline of whitespace
	 * is dropped.
	 */
	spec(): ChartSpec {
		const {headline: written, ...draft} = copyPlain(this.draft);
		const headline = written?.trim();
		return {
			version: SPEC_VERSION,
			...draft,
			id: this.id,
			...(headline ? {headline} : {}),
			layers: this.layers.map(fresh),
		};
	}

	/** The document and its rows, for spreading onto `Viz`. */
	props(): {spec: ChartSpec; data: Data} {
		return {spec: this.spec(), data: this.data};
	}
}

/**
 * A chart under construction. `plot()` makes one, and each method returns a new one.
 *
 * Exported as a type. The class has no public constructor and no subclass.
 */
export type {PlotBuilder};

/**
 * A chart, and the aes its layers inherit.
 *
 * `data` is any table `toPlotData` reads. `id` names the document. A key outside `Aesthetic` fails
 * to compile here, and a required aesthetic the aes leaves unbound is asked for at the layer method.
 */
export function plot<Data extends VizData, const A extends Aes>(
	data: Data,
	aes: A & Record<Exclude<keyof A, Aesthetic>, never>,
	id?: string,
): PlotBuilder<Data, A>;
export function plot<Data extends VizData>(data: Data): PlotBuilder<Data, Record<never, never>>;
export function plot<Data extends VizData>(data: Data, aes: Aes = {}, id = "chart"): PlotBuilder<Data, Aes> {
	return new PlotBuilder(data, aes, id);
}
