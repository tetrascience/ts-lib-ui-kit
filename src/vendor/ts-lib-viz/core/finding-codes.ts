/**
 * Stable identifier for a check.
 *
 * An override names one of these. Overriding by severity would waive checks nobody looked at.
 */
export type FindingCode =
	| "grounded-nonlinear-axis"
	| "grounded-truncated-axis"
	| "cumulative-of-a-statistic"
	| "cumulative-unsupported"
	| "empty-as-zero-of-a-statistic"
	| "fixed-statistic"
	| "color-alone"
	| "colors-past-legible"
	| "band-below-legible"
	| "numbers-below-legible"
	| "cluster-past-cap"
	| "dendrogram-without-order"
	| "sides-under-facet"
	| "track-group-disagrees"
	| "track-without-categories"
	| "marginal-without-readings"
	| "ring-without-readings"
	| "magnitudes-past-legible"
	| "figure-past-container"
	| "unlabeled-reference"
	| "bare-numeric-axis"
	| "headline-restates-axes"
	| "overplotted-past-switch"
	| "legend-order"
	| "legend-missing"
	| "title-over-numbers"
	| "headline-missing"
	| "set-repeats-form"
	| "set-opens-derived"
	| "size-carries-the-measure"
	| "size-past-fill-budget"
	| "cube-copied-static"
	| "graph-links-dropped"
	| "angle-encodes-comparison"
	| "slices-past-legible"
	| "single-value-as-arc"
	| "pie-not-parts"
	| "area-with-no-nesting"
	| "bandwidths-disagree"
	| "width-hides-the-count"
	| "shapes-past-glyphs";

/** A code no override waives. A figure with no headline makes no claim to disagree with. */
export type UnwaivableCode = "headline-missing";

/** A code `ChartSpec.overrides` can name. */
export type WaivableCode = Exclude<FindingCode, UnwaivableCode>;
