/**
 * Type and spacing, as a function of panel room.
 *
 * Three classes. `regular` is the package default, `compact` is a facet and `roomy` is a chart
 * with its own page.
 */

export type Sizing = "compact" | "regular" | "roomy";

/**
 * What a sizing class sets.
 *
 * Seven values. Rule 10's other four type levels are set by classes in `Figure`.
 */
export interface Metrics {
	/** Tick labels and the one axis title, in pixels. */
	axis: number;
	/**
	 * Labeled ticks a value scale is asked for, as a hint.
	 *
	 * One number covers both axes. An axis stating `tickStep` or `tickCount` keeps what the author
	 * said.
	 */
	ticks: number;
	/** Annotation text written on the plot, in pixels. */
	annotation: number;
	/** Length of a tick dash, in pixels. */
	tickLength: number;
	/**
	 * Width of a break in a band, in pixels.
	 *
	 * Six pixels is a hairline on a full page and a third of a cell in a facet.
	 */
	gap: number;
	/** Radius of a point at full opacity, in pixels. */
	pointRadius: number;
	/** Radius under rule 7's faded treatment, in pixels. */
	fadedRadius: number;
}

/**
 * Nine pixels is the floor.
 *
 * Rule 10's smallest level is the source note at nine. A compact panel gives its room back by
 * shortening ticks and shrinking geoms.
 */
export const TYPE_FLOOR = 9;

/*
  Tick counts. Five suits an ordinary panel. A facet takes three -- five numbers across 300px
  collide. A full page takes eight.
*/
export const METRICS: Record<Sizing, Metrics> = {
	compact: {axis: 10, ticks: 3, annotation: 10, tickLength: 3, gap: 4, pointRadius: 3, fadedRadius: 1.4},
	regular: {axis: 11, ticks: 5, annotation: 11, tickLength: 4, gap: 6, pointRadius: 4, fadedRadius: 1.6},
	roomy: {axis: 13, ticks: 8, annotation: 12, tickLength: 6, gap: 8, pointRadius: 5, fadedRadius: 1.8},
};

/** The default class. What the package drew before the table existed. */
export const REGULAR = METRICS.regular;

/**
 * Which class a panel of this size falls into.
 *
 * Both dimensions decide it. Either one running short makes a panel compact. Roomy needs both.
 */
export function sizingFor(width: number, height: number): Sizing {
	if (width < 360 || height < 220) return "compact";
	if (width > 720 && height > 420) return "roomy";
	return "regular";
}

export const metricsFor = (width: number, height: number): Metrics => METRICS[sizingFor(width, height)];
