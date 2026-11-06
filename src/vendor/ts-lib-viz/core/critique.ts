/**
 * What is wrong with a chart, sorted by severity.
 *
 * `wrong` means the figure misstates the data and blocks a save. `bad` means a reader cannot
 * read it. `ugly` is aesthetics.
 */

import {boundsOf} from "./aggregate.js";
import {GRAMMAR, groundedKinds} from "./grammar.js";
import type {FindingCode, UnwaivableCode, WaivableCode} from "./finding-codes.js";
import type {FigureSet} from "./figure-set.js";
import {GL_ABOVE, pointCount, treatmentOf, type ReadyFrame, type Substitution} from "./frame.js";
import {
	ASCENT,
	bandReach,
	buildAxis,
	chromeOf,
	isBand,
	textRun,
	ringLayout,
	slicesLegible,
	Y_TITLE_ABOVE,
} from "./frame-geometry.js";
import {kindFacts, layerScale, paintAesthetic, paintColumn} from "./geom-table.js";
import {POINT_SHAPES} from "./geom-types.js";
import {SPLIT_CAP} from "./layers.js";
import {tickFormatter} from "./tick-format.js";
import type {ChartSpec, PlotKind, LayerSpec} from "./spec.js";
import {transformOf, type AxisTransform} from "./transform.js";

export type Severity = "wrong" | "bad" | "ugly";

export type {FindingCode, UnwaivableCode, WaivableCode};

export interface Finding {
	severity: Severity;
	code: FindingCode;
	/** Dotted path into the spec, in the same shape `validate` returns. */
	path: string;
	/** What is wrong, in a sentence an author can act on. */
	message: string;
}

/**
 * Blended fragments a frame can shade inside its budget, in CSS pixels of geom area.
 *
 * About 1.4 ms per million blended fragments. Half a 60fps frame is 8 ms.
 */
export const FILL_BUDGET_PX = 1_400_000;

/**
 * How many color categories can a reader distinguish?
 * The Okabe-Ito palette and Grammar of Graphics agree the maximum should be 8.
 */
export const COLORS_LEGIBLE = 8;

/** Words a headline can share with an axis title without having restated it. */
const STOP_WORDS = new Set(["the", "a", "an", "of", "and", "or", "by", "in", "on", "per", "vs", "against", "over"]);

const words = (text: string): string[] =>
	text
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter((word) => word.length > 0 && !STOP_WORDS.has(word));

/**
 * Whether a headline says anything the axes do not.
 *
 * Chart-design rule 10 asks for a claim. A headline with all its words in an axis title has
 * restated the chart.
 */
const restatesAxes = (headline: string, axisTitles: string[]): boolean => {
	const claim = words(headline);
	if (claim.length === 0) return false;
	const axes = new Set(axisTitles.flatMap(words));
	return claim.every((word) => axes.has(word));
};

const layerPath = (index: number, field?: string) => `layers[${index}]${field ? `.${field}` : ""}`;

/** A nonlinear transform as a reader names its scale. */
const SCALE_NAMES: Record<Exclude<AxisTransform, "identity">, string> = {
	log10: "log",
	log2: "log",
	sqrt: "square-root",
	pseudo_log: "pseudo-log",
};

/**
 * Findings a spec carries on its own, with no data behind it.
 *
 * These read the spec alone. The builder reports while an author types.
 */
function fromSpec(spec: ChartSpec): Finding[] {
	const found: Finding[] = [];
	const kinds = spec.layers.filter((series) => series.visible !== false).map((series) => series.kind);
	const grounded = groundedKinds(kinds);

	/* Proportional ink. A length is read from zero on a linear scale. */
	const yTransform = transformOf(spec.scales?.y ?? {});
	if (grounded && yTransform !== "identity") {
		found.push({
			severity: "wrong",
			code: "grounded-nonlinear-axis",
			path: "scales.y.transform",
			message: `A bar or an area is read as a length from zero, and a ${SCALE_NAMES[yTransform]} scale draws those lengths out of proportion to the values. Draw the measure as points, or keep the axis linear.`,
		});
	}

	const range = spec.scales?.y?.limits;
	if (grounded && range && (range[0] > 0 || range[1] < 0)) {
		const near = range[0] > 0 ? range[0] : range[1];
		found.push({
			severity: "wrong",
			code: "grounded-truncated-axis",
			path: "scales.y.limits",
			message: `A bar starting at ${near} instead of zero draws a difference several times larger than the one in the data. Extend the y limits to zero, or draw the measure as points.`,
		});
	}

	/*
    A running total of anything but a sum or a count.

    Adding means together answers no question a reader has: the third point is the mean of the
    first period plus the mean of the second, which is neither a mean nor a total. A count and a
    sum both accumulate into themselves, and nothing else does.
  */
	spec.layers.forEach((series, index) => {
		if (!series.cumulative) return;
		if (!kindFacts(series.kind).layer.includes("cumulative")) {
			found.push({
				severity: "wrong",
				code: "cumulative-unsupported",
				path: layerPath(index, "cumulative"),
				message: `${series.kind} draws no running total, and the flag is read by nothing. Draw the layer as a bar, a line or an area, or drop the running total.`,
			});
			return;
		}
		/* The build sums a running total that states no aggregate. */
		const reduction = series.aggregate;
		if (reduction && reduction !== "sum" && reduction !== "count") {
			found.push({
				severity: "wrong",
				code: "cumulative-of-a-statistic",
				path: layerPath(index, "cumulative"),
				message: `A running total of a ${reduction} adds one ${reduction} to the next, which stands for nothing. Accumulate a sum or a count, or drop the running total.`,
			});
		}
	});

	/*
    A nought filled into a pair with no rows.

    A count and a sum over no rows are nought. A mean or a median over none is undefined.
  */
	spec.layers.forEach((series, index) => {
		if (!series.style?.emptyAsZero) return;
		if (!(kindFacts(series.kind).style as readonly string[]).includes("emptyAsZero")) return;
		const reduction = series.aggregate ?? (typeof series.aes.z === "string" ? "mean" : "count");
		if (reduction === "count" || reduction === "sum") return;
		found.push({
			severity: "wrong",
			code: "empty-as-zero-of-a-statistic",
			path: layerPath(index, "style.emptyAsZero"),
			message: `A pair with no rows has no ${reduction}, and the nought draws it as the lowest reading in the grid. Leave the gap, or reduce the cells to a count or a sum.`,
		});
	});

	spec.layers.forEach((series, index) => {
		/* A hidden layer draws nothing to misstate. */
		if (series.visible === false) return;

		/*
      An aggregate on a kind that fixes its own statistic. A `mean` here describes a figure the
      chart will not draw. Only the kinds answering `false` outright.
    */
		if (series.aggregate && GRAMMAR[series.kind]?.aggregated === false) {
			found.push({
				severity: "wrong",
				code: "fixed-statistic",
				path: layerPath(index, "aggregate"),
				message: `${series.kind} runs its own statistic, so the ${series.aggregate} is read by nothing and the figure will not show it. Drop it, or pick a kind that reduces.`,
			});
		}

		/*
      Accessibility settings often require a second channel. Size can be used as a measure, but is
      harder to judge than length.
    */
		if (series.aes.size && (!series.aes.x || !series.aes.y)) {
			found.push({
				severity: "bad",
				code: "size-carries-the-measure",
				path: layerPath(index, "aes.size"),
				message: `${series.aes.size} is encoded by area while ${
					series.aes.y ? "the horizontal" : "the vertical"
				} scale is unbound, and a reader reads position better than area. Put the measure on the free axis, and size by something the chart states second.`,
			});
		}

		/*
      A treemap over a hierarchy with nothing nested in it. An icicle reads the same three
      channels and gives each level a row.
    */
		if (GRAMMAR[series.kind]?.geom === "treemap" && !series.aes.parent) {
			found.push({
				severity: "ugly",
				code: "area-with-no-nesting",
				path: layerPath(index, "kind"),
				message:
					"These cells are parts of one whole with nothing nested under them, and a reader takes a length off the page more accurately than an area. Draw it as an icicle, which reads the same three channels and gives each level a row, or bind `parent` so the packing has nesting to show.",
			});
		}

		/*
      A violin holding each group to one width while the groups differ in size. `scale: "count"`
      spends the width on the readings.
    */
		if (series.kind === "violin" && series.statParams?.scale === "width") {
			found.push({
				severity: "ugly",
				code: "width-hides-the-count",
				path: layerPath(index, "statParams.scale"),
				message:
					'Every violin is drawn to one width, so a group of ten looks as well supported as a group of four hundred. Take `scale: "count"` to spend the width on the readings behind each shape, or `"area"` to hold the area steady instead.',
			});
		}

		/* A bound shape channel draws one glyph per level. It is the second channel. */
		if (paintColumn(series) && !series.style?.shape && !series.aes.shape && GRAMMAR[series.kind]?.geom === "point") {
			found.push({
				severity: "bad",
				code: "color-alone",
				path: layerPath(index, "style.shape"),
				message:
					"Color is the only thing telling these groups apart, so the figure is unreadable in grayscale and to a reader with color-vision deficiency. Give the series a shape as well.",
			});
		}
	});

	/*
      Two smoothed layers on one frame at bandwidths the author stated differently.

      A wider bandwidth flattens a mode the narrower one keeps. Stated bandwidths only.
    */
	const stated = spec.layers
		.map((series, index) => ({index, bw: series.visible === false ? undefined : series.statParams?.bw}))
		.filter((entry): entry is {index: number; bw: number} => typeof entry.bw === "number");
	if (stated.length > 1 && new Set(stated.map((entry) => entry.bw)).size > 1) {
		found.push({
			severity: "bad",
			code: "bandwidths-disagree",
			path: layerPath(stated[1]!.index, "statParams.bw"),
			message: `These layers are smoothed at ${stated.map((entry) => entry.bw).join(" and ")}, so their shapes differ by how each was smoothed as well as by what the readings say. Smooth them alike, or draw them on separate panels.`,
		});
	}

	/* A reference layer naming nothing it marks, by a label or by a mapped key. Chart-design rule 4. */
	spec.layers.forEach((series, index) => {
		if (series.kind !== "hline" && series.kind !== "vline" && series.kind !== "abline") return;
		if (series.aes.label || paintColumn(series) || series.aes.linetype) return;
		found.push({
			severity: "bad",
			code: "unlabeled-reference",
			path: layerPath(index, "aes.label"),
			message: `A ${series.kind} layer with no label leaves the reader guessing what its lines mark. Name each one.`,
		});
	});

	found.push(...fromPolarSpec(spec));

	/*
	  A guide channel bound with the legends turned off.

	  A figure mapping a column to color and printing no key has spent an undecodable channel.
	  Direct labels answer it too.
	*/
	const guides = spec.layers
		.filter((series) => series.visible !== false)
		.flatMap((series) => [
			...(paintColumn(series) ? [paintAesthetic(series)] : []),
			...(series.aes.shape ? ["shape"] : []),
		]);
	if (spec.legend?.position === "none" && guides.length > 0) {
		found.push({
			severity: "bad",
			code: "legend-missing",
			path: "legend.position",
			message: `The ${[...new Set(guides)].join(" and ")} channel carries a column and the legends are off, so the reader has no key to the values. Take a position for them, or label the geoms directly.`,
		});
	}

	const axisTitles = [spec.scales?.x?.title, spec.scales?.y?.title, spec.scales?.y2?.title].filter(
		(title): title is string => Boolean(title),
	);
	if (spec.headline && axisTitles.length > 0 && restatesAxes(spec.headline, axisTitles)) {
		found.push({
			severity: "bad",
			code: "headline-restates-axes",
			path: "headline",
			message:
				"The headline names what is on the axes, which the axes already do. Write the claim the chart makes: what a reader should take away from it.",
		});
	}

	return found;
}

/**
 * Aggregates that add up to a measured total.
 *
 * A count of rows and a sum of a column each divide into parts. Five means add to nothing.
 */
const ADDITIVE = new Set(["count", "sum"]);

/** Whether a kind positions by angle, read off the grammar. */
const isPolar = (kind: PlotKind): boolean => GRAMMAR[kind]?.coord === "polar";

/**
 * Whether a kind divides a turn between slices a reader compares.
 *
 * The rings do. A gauge draws one arc against a range. A radar draws lengths along rotated rules.
 */
const drawsSlices = (kind: PlotKind): boolean => isPolar(kind) && kind !== "gauge" && kind !== "radar";

/**
 * Whether the slices carry text a reader takes the value off.
 *
 * `numbers` writes the reduction on the slice. A `label` covering all slices does the same.
 */
const slicesSpeak = (series: LayerSpec): boolean => Boolean(series.numbers) || series.directLabels?.when.kind === "all";

/**
 * The reduction a series draws, including its fallback.
 *
 * The bar path defaults to a mean with a measure bound and a count without. `pie-not-parts` reads
 * this.
 */
const effectiveAggregate = (series: LayerSpec): string =>
	series.aggregate ?? (typeof series.aes.y === "string" ? "mean" : "count");

/**
 * What the polar coordinate is permitted on, off the spec alone.
 *
 * Three of the four conditions. `slices-past-legible` needs the panel. `pie-not-parts` stops a
 * save.
 */
function fromPolarSpec(spec: ChartSpec): Finding[] {
	const found: Finding[] = [];

	spec.layers.forEach((series, index) => {
		if (series.visible === false || !isPolar(series.kind)) return;

		if (drawsSlices(series.kind) && !slicesSpeak(series)) {
			found.push({
				severity: "bad",
				code: "angle-encodes-comparison",
				path: layerPath(index, "kind"),
				message:
					"A reader judges an angle and an area worse than a length, and these slices carry no text to read instead. Write the values with `numbers`, name every slice with `label`, or draw the measure as bars.",
			});
		}

		if (series.kind === "gauge" && !series.numbers) {
			found.push({
				severity: "ugly",
				code: "single-value-as-arc",
				path: layerPath(index, "numbers"),
				message:
					"A dial with no number is a stat tile with decoration, so the reading is left to an angle the reader has nothing to compare. Set `numbers` to write it.",
			});
		}

		if (drawsSlices(series.kind)) {
			const aggregate = effectiveAggregate(series);
			if (!ADDITIVE.has(aggregate)) {
				found.push({
					severity: "wrong",
					code: "pie-not-parts",
					path: layerPath(index, "aggregate"),
					message: `A ring asserts that its slices are parts of one whole, and a ${aggregate} per slice adds to a total nothing in the table stands for. Reduce with \`sum\` or \`count\`, or draw the measure as bars.`,
				});
			}
		}
	});

	return found;
}

/**
 * Slices past the count this panel's ring can label.
 *
 * `ringLayout` picks the label radius and `slicesLegible` divides its circumference. Without a
 * measured area nothing is reported.
 */
function fromPolarFrame(spec: ChartSpec, frame: ReadyFrame, area?: {width: number; height: number}): Finding[] {
	if (!area) return [];
	const found: Finding[] = [];

	spec.layers.forEach((series, index) => {
		if (series.visible === false || !drawsSlices(series.kind)) return;

		const data = frame.traces.find((held) => held.layerId === series.id)?.data;
		if (!data || data.at !== "groups" || !("bars" in data) || data.bars.length === 0) return;

		const reads = (kindFacts(series.kind).style as readonly string[]).includes("innerRadius");
		const layout = ringLayout(area.width, area.height, reads ? (series.style?.innerRadius ?? 0) : 0);
		const type = series.numbers?.fontSize ?? frame.metrics.axis;
		/* The drawn text. A renamed category is measured as the reader sees it. */
		const longest = data.bars.reduce((most, slice) => Math.max(most, slice.category.length), 0);
		const holds = slicesLegible(layout, type, longest);
		if (data.bars.length <= holds) return;

		found.push({
			severity: "bad",
			code: "slices-past-legible",
			path: layerPath(index, "kind"),
			message: `${data.bars.length} slices is past the ${holds} this panel's ring has room to label at ${type}px. Gather the tail into one slice, cut the categories, or draw the measure as bars.`,
		});
	});

	return found;
}

/**
 * Findings that need the built frame.
 *
 * A color count, a legend order and an overplotted scatter are facts about what the data
 * produced.
 */
function fromFrame(spec: ChartSpec, frame: ReadyFrame, substituted?: Substitution): Finding[] {
	const found: Finding[] = [];

	/*
      A clustered order the cap turned down.

      A refused order draws the same grid an unclustered spec draws. Nothing on the figure says
      the arithmetic declined.
    */
	for (const refused of frame.clusterRefused) {
		found.push({
			severity: "bad",
			code: "cluster-past-cap",
			path: `scales.${refused.axis}.order`,
			message: `${refused.rows} categories is past the ${refused.cap} an exact clustering is affordable at, so the band kept the order the build produced. Aggregate first with kmeans, or narrow the rows.`,
		});
	}

	if (frame.legend.length > COLORS_LEGIBLE) {
		found.push({
			severity: "bad",
			code: "colors-past-legible",
			path: "layers",
			message: `${frame.legend.length} colors is past the ${COLORS_LEGIBLE} a reader can match against a legend${
				frame.legend.length >= SPLIT_CAP ? ", and the split cap is holding back more" : ""
			}. Label the notable geoms directly, or facet on the field instead of coloring by it.`,
		});
	}

	/*
      A caller that drew raw points past rule 7's switch. The footer stays quiet and the finding
      goes to the caller.
    */
	const drawn = pointCount(frame);
	if (!substituted && treatmentOf(drawn) === "binned") {
		found.push({
			severity: "bad",
			code: "overplotted-past-switch",
			path: "layers",
			message: `${drawn.toLocaleString()} geoms drawn individually, past the ${GL_ABOVE.toLocaleString()} where they overplot into a block whose density the reader misjudges. Draw a hexbin or a contour off a binned aggregate, and pass the substitution to the footer.`,
		});
	}

	/*
      A legend ordered against the geoms. `legend.order: "geoms"` reads it the way the lines end.

      A line's last reading is where a direct label would draw. Reported, and a scatter has no
      such ordering.
    */
	const lines = frame.traces.filter(
		(trace) => trace.data.at === "records" && trace.data.geom === "line" && trace.data.points.length > 0,
	);
	if (lines.length > 1 && spec.legend?.order !== "geoms") {
		const lastOf = (trace: (typeof lines)[number]) =>
			trace.data.at === "records" && trace.data.geom === "line"
				? (trace.data.points[trace.data.points.length - 1]?.y ?? 0)
				: 0;
		const byHeight = [...lines].sort((a, b) => lastOf(b) - lastOf(a));
		if (byHeight.some((trace, index) => trace.id !== lines[index]!.id)) {
			found.push({
				severity: "ugly",
				code: "legend-order",
				path: "layers",
				message:
					"The legend runs in authoring order and the lines end in a different order, so the reader matches names to lines by hand. Order the series the way the geoms read, or label the lines directly.",
			});
		}
	}

	/*
      Geom area a filter can push past the frame budget, summed over every sized trace. A row with
      no size reading counts at the layer's own radius.
    */
	let fill = 0;
	let largest = 0;
	for (const trace of frame.traces) {
		if (trace.data.at !== "records" || trace.data.geom !== "point" || !trace.sizeRadii) continue;
		const own = spec.layers.find((one) => one.id === trace.layerId)?.style?.size ?? frame.metrics.pointRadius;
		for (const point of trace.data.points) {
			const radius = point.size ?? own;
			fill += Math.PI * radius ** 2;
			if (radius > largest) largest = radius;
		}
	}
	if (fill > FILL_BUDGET_PX) {
		const fits = largest * Math.sqrt(FILL_BUDGET_PX / fill) * 2;
		found.push({
			severity: "ugly",
			code: "size-past-fill-budget",
			path: "layers",
			message: `The size channel resolves to ${Math.round(fill / 1000).toLocaleString()}k pixels of geom area, past the ${Math.round(
				FILL_BUDGET_PX / 1000,
			).toLocaleString()}k a frame can shade inside its budget. Cap the largest geom at ${fits.toFixed(1)} pixels across.`,
		});
	}

	/*
	  A measure with no unit draws a bare axis. A stated axis title answers it.
	*/
	for (const [axis, field] of [
		["x", frame.xField],
		["y", frame.traces.find((trace) => trace.field)?.field],
	] as const) {
		/* A band axis draws categories. The measure beside it is read off the color. */
		if (isBand(frame[axis])) continue;
		if (field?.numeric && !field.unit && !spec.scales?.[axis]?.title?.trim()) {
			found.push({
				severity: "bad",
				code: "bare-numeric-axis",
				path: `scales.${axis}.title`,
				message: `${field.label} is a measure with no unit, so its axis reads as a bare number and the reader guesses the scale. Give the field a unit, or set the axis title.`,
			});
		}
	}

	return found;
}

/**
 * Findings about a figure that states its own size.
 *
 * Both need the spec and the frame. The spec has the author's ask and the frame has the labels.
 */
function fromSizing(spec: ChartSpec, frame: ReadyFrame, container?: number): Finding[] {
	const found: Finding[] = [];
	if (spec.sizing !== "content") return found;

	/*
      A band with less room than its label.

      `bandReach` measures the label along its own axis. A column label reads across its band.
    */
	for (const side of ["x", "y"] as const) {
		const stated = spec.scales?.[side]?.bandSize;
		const axis = frame[side];
		if (!stated || !("values" in axis) || axis.values.length === 0) continue;
		/* The drawn text. A renamed category is measured as the reader sees it. */
		const longest = axis.values.reduce((most, value) => Math.max(most, (axis.names?.[value] ?? value).length), 0);
		const chrome = chromeOf(axis, "start");
		const needs = bandReach({...chrome, fontSize: axis.fontSize ?? frame.metrics.axis}, longest, side);
		if (stated >= needs) continue;
		found.push({
			severity: "ugly",
			code: "band-below-legible",
			path: `scales.${side}.bandSize`,
			message: `${stated} pixels a category is under the ${Math.ceil(
				needs,
			)} the longest label takes at this type size. Turn the labels with \`tickAngle\`, shorten them through \`labels\`, set a smaller \`fontSize\`, or widen \`bandSize\`.`,
		});
	}

	/* Content sizing can outgrow the column it sits in, and the reader finds out through a scrollbar. */
	const bands = spec.scales?.x?.bandSize;
	const across = "values" in frame.x ? frame.x.values.length : 0;
	/* Breaks are room the figure asked for. The width it wants counts them. */
	const breaks = "values" in frame.x ? (frame.x.gaps?.length ?? 0) * (frame.x.gapSize ?? 0) : 0;
	if (container && bands && across > 0) {
		const wants = bands * across + breaks + frame.margin.left + frame.margin.right;
		if (wants > container) {
			found.push({
				severity: "ugly",
				code: "figure-past-container",
				path: "sizing",
				message: `The figure asks for ${Math.ceil(wants)} pixels and the room it sits in is ${Math.floor(
					container,
				)}, so the reader gets a scrollbar. Narrow the band, size it to the container, or give it the room.`,
			});
		}
	}

	return found;
}

/**
 * Cells asked to write numbers in less room than a number takes.
 *
 * Both directions are checked. A stated band size is read first, the plot area otherwise.
 */
function fromNumbers(spec: ChartSpec, frame: ReadyFrame, area?: {width: number; height: number}): Finding[] {
	const found: Finding[] = [];

	/* Breaks are room the bands lose. The drawn band is what is left over the categories. */
	const drawn = (side: "x" | "y") => {
		const stated = spec.scales?.[side]?.bandSize;
		if (stated) return stated;
		const axis = frame[side];
		const span = side === "x" ? area?.width : area?.height;
		if (span == null || !("values" in axis) || axis.values.length === 0) return undefined;
		const breaks = (axis.gaps?.length ?? 0) * (axis.gapSize ?? 0);
		return Math.max(0, span - breaks) / axis.values.length;
	};

	for (let at = 0; at < spec.layers.length; at += 1) {
		const series = spec.layers[at]!;
		const numbers = series.numbers;
		if (!numbers || series.visible === false) continue;

		const trace = frame.traces.find((held) => held.layerId === series.id && held.colorDomain);
		if (!trace?.colorDomain) continue;

		const scale = layerScale(spec, series);
		const say = tickFormatter(numbers.format ?? scale?.format, numbers.decimals ?? scale?.decimals);
		const type = numbers.fontSize ?? frame.metrics.axis;
		const [, longest] = boundsOf(trace.colorDomain.map((end) => say(end).length));
		const needs = {x: textRun(longest, type), y: type};

		for (const side of ["x", "y"] as const) {
			const band = drawn(side);
			if (band == null || band >= needs[side]) continue;
			found.push({
				severity: "ugly",
				code: "numbers-below-legible",
				path: layerPath(at, "numbers"),
				message: `A cell ${Math.round(band)} pixels ${side === "x" ? "wide" : "tall"} cannot hold ${Math.ceil(
					needs[side],
				)} pixels of number at ${type}px. Drop the numbers, shorten them with \`decimals\`, set a smaller \`fontSize\`, or widen the band.`,
			});
		}
	}

	return found;
}

/**
 * Findings about a side panel, the one thing on the spec making a claim of its own.
 *
 * A dendrogram states that a clustering was run. Both findings here are `wrong`.
 */
function fromSides(spec: ChartSpec, frame: ReadyFrame): Finding[] {
	const sides = spec.sides ?? [];
	if (sides.length === 0) return [];

	/*
      A side under a facet, which the shared band makes unanswerable.

      A cluster order belongs to the cells that produced it. Panel zero's order leads.
    */
	if (spec.facet?.by) {
		return [
			{
				severity: "wrong",
				code: "sides-under-facet",
				path: "sides",
				message:
					"A facet shares one band across its panels and a cluster order belongs to the panel that computed it, so a side beside each panel would draw against rows that panel does not hold. Drop the facet, or drop the sides.",
			},
		];
	}

	const found: Finding[] = [];
	sides.forEach((side, at) => {
		const axis = side.position === "top" || side.position === "bottom" ? "x" : "y";

		if (side.content.kind === "dendrogram") {
			if (frame.clusterTrees[axis]) return;
			const capped = frame.clusterRefused.some((refused) => refused.axis === axis);
			found.push({
				severity: "wrong",
				code: "dendrogram-without-order",
				path: `sides[${at}]`,
				message: `The ${side.position} side shares the ${axis} axis and there is no tree behind it, so the dendrogram would draw merges nobody computed. ${
					capped
						? "The cap turned this clustering down, so aggregate with `kmeans` or narrow the categories."
						: `Give \`scales.${axis}.order\` a cluster order, or drop the side.`
				}`,
			});
			return;
		}

		if (side.content.kind === "histogram" || side.content.kind === "rug") {
			if (frame.marginals.some((held) => held.axis === axis && held.kind === side.content.kind)) return;
			/*
        A marginal with nothing to distribute.

        A band axis has no measure to spread along. A reduced figure has no records left to count.
      */
			found.push({
				severity: "bad",
				code: "marginal-without-readings",
				path: `sides[${at}]`,
				message: `The ${side.position} side asks for the distribution along the ${axis} axis and there are no readings behind it, so it draws an empty strip. A marginal counts the records a point geom drew, so the axis has to run a measure and the geoms have to be points.`,
			});
			return;
		}

		if (side.content.kind !== "track") return;
		const field = side.content.field;
		const track = frame.tracks.find((held) => held.field === field && held.axis === axis);

		/*
      A track the build could not resolve, which draws a strip of nothing.

      A missing column, an axis running values, or a column with no reading for the band.
    */
		if (!track) {
			found.push({
				severity: "bad",
				code: "track-without-categories",
				path: `sides[${at}].content.field`,
				message: `Nothing resolved for ${field} along the ${axis} axis, so the ${side.position} side draws an empty strip. A track reads one value per category, so the axis has to run categories and the column has to carry a reading for them.`,
			});
			return;
		}

		/*
      A category with two values in its group. A join error.

      The modal value draws, and this finding stops it standing for the whole group.
    */
		if (track.kind === "identity" && track.disagreed.length > 0) {
			const named = track.disagreed.slice(0, 3).join(", ");
			found.push({
				severity: "bad",
				code: "track-group-disagrees",
				path: `sides[${at}].content.field`,
				message: `${track.disagreed.length} ${
					track.disagreed.length === 1 ? "category carries" : "categories carry"
				} more than one ${field} (${named}${track.disagreed.length > 3 ? ", and more" : ""}), so the commonest drew. One value per category is what a track states, so split the band on ${field} as well, or annotate with a column that has one.`,
			});
		}
	});

	/*
      More magnitude scales than a reader can hold apart.

      Two is the ceiling. The cells take one and a numeric track takes the other.
    */
	const magnitudes =
		(frame.traces.some((trace) => trace.colorDomain) ? 1 : 0) +
		frame.tracks.filter((track) => track.kind === "magnitude").length;
	if (magnitudes > 2) {
		found.push({
			severity: "ugly",
			code: "magnitudes-past-legible",
			path: "sides",
			message: `${magnitudes} maps carrying magnitude on one figure is more ramps than a reader can hold apart. Annotate with a category instead, or move a measure to a second figure.`,
		});
	}

	return found;
}

/**
 * Rings outside a circular figure that read nothing.
 *
 * A ring reads a numeric column of the figure's own table against the sectors it drew.
 */
function fromRings(spec: ChartSpec, frame: ReadyFrame): Finding[] {
	const found: Finding[] = [];
	spec.layers.forEach((series, index) => {
		const data = frame.traces.find((held) => held.layerId === series.id)?.data;
		if (!data || data.at !== "groups" || (data.geom !== "chord" && data.geom !== "ideogram")) return;

		(series.rings ?? []).forEach((ring, at) => {
			if (data.rings[at]) return;
			const {field} = ring.content;
			found.push({
				severity: "bad",
				code: "ring-without-readings",
				path: layerPath(index, `rings[${at}]`),
				message: `Ring ${at + 1} draws an empty band. Nothing in ${field} reads as a number against the sectors drawn. A ring reads a numeric column of the same table.`,
			});
		});
	});
	return found;
}

/** What a consumer states beside the spec. */
export interface CritiqueOptions {
	/** Whether the figure leaves the page, which adds the checks on its copy. */
	exported?: boolean;
}

/** What a drawing surface reads beside the spec. Each field is absent by default, and the checks reading it skip. */
export interface CritiqueContext extends CritiqueOptions {
	/** The built frame. Absent runs the spec-only checks. */
	frame?: ReadyFrame;
	/** What a geom drew in place of the one the spec asked for. */
	substituted?: Substitution;
	/** Room the figure was given, where the caller measured it. Absent skips the fit check. */
	container?: number;
	/** The plot area the geoms were given, in pixels. Absent leaves a layout-picked band unchecked. */
	area?: {width: number; height: number};
}

/**
 * What is wrong with a chart, worst first.
 *
 * Hand the frame where there is one. Without it the spec-only checks run.
 */
export function critique(
	spec: ChartSpec,
	{frame, substituted, exported = false, container, area}: CritiqueContext = {},
): Finding[] {
	const order: Record<Severity, number> = {wrong: 0, bad: 1, ugly: 2};
	const found = [
		...fromSpec(spec),
		...(frame ? fromFrame(spec, frame, substituted) : []),
		...(frame ? fromSizing(spec, frame, container) : []),
		...(frame ? fromNumbers(spec, frame, area) : []),
		...(frame ? fromPolarFrame(spec, frame, area) : []),
		...(frame ? fromShapeChannel(frame) : []),
		...(frame ? fromAxisTitles(frame, area) : []),
		...(frame ? fromSides(spec, frame) : []),
		...(frame ? fromRings(spec, frame) : []),
		...(exported ? fromCopy(spec) : []),
	];
	return found.sort((a, b) => order[a.severity] - order[b.severity]);
}

/**
 * The critic as a consumer calls it: the spec's own checks, and the copy checks for an export.
 *
 * `Viz` runs the checks that read the drawn frame and hands their findings to `onCritique`.
 */
export const critiqueSpec: (spec: ChartSpec, options?: CritiqueOptions) => Finding[] = critique;

/**
 * Reports a vertical axis title drawn over the top tick label.
 *
 * The title draws `Y_TITLE_ABOVE` pixels over the plot area. A domain ending on a labeled tick
 * collides. A frame drawing no axes has no title to collide.
 */
function fromAxisTitles(frame: ReadyFrame, area?: {width: number; height: number}): Finding[] {
	if (!area || frame.axisFree) return [];

	const range: [number, number] = isBand(frame.y) ? [0, area.height] : [area.height, 0];
	const axis = buildAxis(frame.y, range, frame.metrics.ticks, "end");
	if (!axis.label || axis.chrome.titleAlign !== "end" || !axis.labelTicks) return [];

	const size = axis.chrome.fontSize;
	/* A baseline sits a quarter of the type below the ink's bottom and three quarters under its top. */
	const titleFloor = -Y_TITLE_ABOVE + size * (1 - ASCENT);
	const [highest] = boundsOf(axis.ticks.map((tick) => axis.scale(tick)));
	const labelCeiling = highest - size * ASCENT;
	if (!Number.isFinite(labelCeiling) || labelCeiling >= titleFloor) return [];

	return [
		{
			severity: "ugly",
			code: "title-over-numbers",
			path: "scales.y.limits",
			message: `The ${axis.label} title sits ${Y_TITLE_ABOVE} pixels over the plot area and the top tick label reaches into it, so the two overlap. Widen the y limits past the last tick, or run the title along the rule with titleAlign.`,
		},
	];
}

/**
 * Reports a shape channel with more levels than there are glyphs.
 *
 * Four glyphs is the set and a fifth level takes the circle back. The count comes off the frame.
 */
function fromShapeChannel(frame: ReadyFrame): Finding[] {
	const crowded = frame.traces.find((trace) => (trace.shapeChannel?.levels?.length ?? 0) > POINT_SHAPES.length);
	const channel = crowded?.shapeChannel;
	if (!channel?.levels) return [];

	return [
		{
			severity: "ugly",
			code: "shapes-past-glyphs",
			path: "layers",
			message: `${channel.field.label} holds ${channel.levels.length} values and the package draws ${POINT_SHAPES.length} glyphs, so two groups take the same mark. Facet on it, or bind the shape to a column with fewer values.`,
		},
	];
}

/**
 * Findings about a copy of the figure.
 *
 * A file is one view of a cube, the static projection the design language refuses.
 */
function fromCopy(spec: ChartSpec): Finding[] {
	const cube = spec.layers.findIndex((series) => series.visible !== false && GRAMMAR[series.kind]?.coord === "cube");
	if (cube < 0) return [];

	return [
		{
			severity: "bad",
			code: "cube-copied-static",
			path: layerPath(cube, "kind"),
			message:
				"A file cannot be turned, so the reader of this copy is guessing at depth, which is the case the third position scale is permitted around. The copy states it on itself; send the chart where the reader can still turn it.",
		},
	];
}

/**
 * Findings that stop a save.
 *
 * The `wrong` ones absent from `ChartSpec.overrides`, plus the missing claim.
 *
 * An empty result passes the gate. An override waives the other codes.
 */
export const blocking = (spec: ChartSpec, findings: Finding[]): Finding[] => {
	const held = findings.filter((finding) => finding.severity === "wrong" && !waived(spec, finding.code));
	return spec.headline?.trim() ? held : [...held, MISSING_CLAIM];
};

/** Whether the spec names this code among its overrides. */
const waived = (spec: ChartSpec, code: FindingCode): boolean =>
	(spec.overrides as readonly FindingCode[] | undefined)?.includes(code) ?? false;

/** The refusal a spec with no headline meets at the gate. */
const MISSING_CLAIM: Finding = {
	severity: "wrong",
	code: "headline-missing",
	path: "headline",
	message:
		"A figure that is about to be read carries the claim it makes. Write the headline as a sentence a reader can take away, and put what is plotted in the subtitle under it.",
};

/**
 * Overrides the reader is owed, as footer lines.
 *
 * An override is the author saying they know. The admission goes to the footer.
 */
export const overrideNotes = (spec: ChartSpec, findings: Finding[]): string[] =>
	findings
		.filter((finding) => finding.severity === "wrong" && waived(spec, finding.code))
		.map((finding) => NOTE[finding.code as WaivableCode] ?? finding.code);

/** What an accepted finding says in the footer, in the reader's terms. */
const NOTE: Partial<Record<WaivableCode, string>> = {
	"grounded-nonlinear-axis": "lengths drawn on a nonlinear scale, so they are not proportional",
	"grounded-truncated-axis": "the value axis does not start at zero, so differences read larger than they are",
	"fixed-statistic": "an aggregate was set that this chart does not use",
	"cumulative-unsupported": "a running total was set that this chart does not draw",
	"empty-as-zero-of-a-statistic": "a pair with no rows is drawn as nought",
	"pie-not-parts": "the slices are not parts of one whole, so the ring is a share of no total",
	"sides-under-facet": "the side panels follow the first panel's rows, so the other panels can disagree with them",
	"dendrogram-without-order": "the tree beside the axis draws merges no clustering of these rows produced",
	"graph-links-dropped": "some links name a node the table lacks, so the network drawn is smaller than its source",
};

/**
 * The geometry and the statistic a spec resolves to, as one string per visible series.
 *
 * Two members with the same string draw the same kind of picture.
 */
const formOf = (spec: ChartSpec): string =>
	spec.layers
		.filter((series) => series.visible !== false)
		.map((series) => {
			const row = GRAMMAR[series.kind];
			return row ? `${row.geom}:${row.stat.join("+")}` : series.kind;
		})
		.join("|");

/** Whether a spec draws a statistic in place of the records. */
const derived = (spec: ChartSpec): boolean => {
	const visible = spec.layers.filter((series) => series.visible !== false);
	return visible.length > 0 && visible.every((series) => (GRAMMAR[series.kind]?.stat.length ?? 0) > 0);
};

/**
 * What is wrong with a set of figures taken together.
 *
 * Both findings are `ugly`. `plots` holds the members by id and a missing member is skipped.
 */
export function critiqueSet(set: FigureSet, plots: Record<string, ChartSpec>): Finding[] {
	const found: Finding[] = [];
	const members = set.members ?? [];

	const opener = plots[members[0]?.plotId ?? ""];
	if (opener && derived(opener)) {
		found.push({
			severity: "ugly",
			code: "set-opens-derived",
			path: "members[0]",
			message:
				"The set opens on a statistic, so a reader meets the summary before the readings it came from. Open on the records and let the derived figures follow.",
		});
	}

	members.forEach((member, index) => {
		if (index === 0) return;
		const held = plots[member.plotId];
		const before = plots[members[index - 1]!.plotId];
		if (!held || !before) return;
		if (formOf(held) !== formOf(before)) return;

		found.push({
			severity: "ugly",
			code: "set-repeats-form",
			path: `members[${index}]`,
			message:
				"This figure draws the same geometry off the same statistic as the one before it, so the pair reads as one point made twice. Change what the second one shows, or merge them.",
		});
	});

	return found;
}

/**
 * What a graph has to admit, and what it has to claim.
 *
 * A published figure states its claim. A view holding less than its source reports the count.
 */
export function critiqueGraph(graph: {headline?: string; links: number; linksDropped: number}): Finding[] {
	const found: Finding[] = [];

	if (!graph.headline || graph.headline.trim().length === 0) {
		found.push({
			severity: "wrong",
			code: "headline-missing",
			path: "headline",
			message:
				"A graph published with no claim leaves the reader to find one in a cloud of nodes. Write what the layout shows: which groups separated, what holds them together.",
		});
	}

	if (graph.linksDropped > 0) {
		found.push({
			severity: "wrong",
			code: "graph-links-dropped",
			path: "links",
			message: `${graph.linksDropped.toLocaleString()} of ${(
				graph.links + graph.linksDropped
			).toLocaleString()} links name a node the table does not carry, so the drawn network is smaller than its source. State it in the footer, or supply the nodes the links reach for.`,
		});
	}

	return found;
}
