/**
 * Omissions a build records, and the footer sentence they produce.
 *
 * The build applies ten caps. A new cap is a member of `OmittedKind` and a row in `SAYS`.
 */

/**
 * What a figure can leave out.
 *
 * Named after what the reader lost. `rows-sampled` and `rows-incomplete` are both rows gone
 * missing, and the reader is owed which.
 */
export type OmittedKind =
	| "panels"
	| "categories"
	| "splits"
	| "dashes"
	| "rows-sampled"
	| "stack"
	| "replicates"
	| "rows-incomplete"
	| "off-log"
	| "off-root"
	| "off-range"
	| "floored"
	| "references"
	| "rules"
	| "measures"
	| "flows"
	| "links"
	| "colors"
	| "labels";

/** A count of one kind, from one of the places that turned them down. */
export interface Omission {
	of: OmittedKind;
	count: number;
}

/**
 * What the footer writes for each kind, in the order it writes them.
 *
 * Declaration order is reading order. `stack` ignores its count and its wording states the
 * refusal.
 */
const SAYS: Record<OmittedKind, (many: string, count: number) => string> = {
	panels: (many) => `${many} smaller panels past the facet cap`,
	categories: (many) => `${many} smaller categories hidden`,
	splits: (many) => `${many} smaller groups past the split cap`,
	dashes: (many, count) =>
		`${many} group${count === 1 ? "" : "s"} over several linetype values, each dashed as its first row`,
	"rows-sampled": (many) => `${many} rows past the line cap`,
	stack: () => "stack dropped over a negative reading",
	replicates: (many, count) => `${many} group${count === 1 ? "" : "s"} past the replicate cap`,
	"rows-incomplete": (many) => `${many} rows missing a measure`,
	"off-log": (many, count) => `${many} reading${count === 1 ? "" : "s"} at or below zero left off the log axis`,
	"off-root": (many, count) => `${many} reading${count === 1 ? "" : "s"} below zero left off the square-root axis`,
	"off-range": (many, count) => `${many} reading${count === 1 ? "" : "s"} outside the stated range`,
	floored: (many, count) => `${many} interval${count === 1 ? "" : "s"} cut at the axis floor`,
	references: (many, count) => `${many} reference line${count === 1 ? "" : "s"} outside the axis range`,
	rules: (many, count) => `${many} reference line${count === 1 ? "" : "s"} past the rule cap`,
	measures: (many) => `${many} measures past the axis cap`,
	flows: (many) => `${many} smaller flows hidden`,
	links: (many, count) => `${many} link${count === 1 ? "" : "s"} outside the drawn sectors`,
	colors: (many) => `${many} sectors drawn in one ink, past the color map`,
	labels: (many) => `${many} more match the label rule`,
};

/** The kinds in the order the footer states them. A caller walks these to render a ledger. */
export const OMITTED_KINDS = Object.keys(SAYS) as OmittedKind[];

/**
 * A count added to a ledger, where there is anything to add.
 *
 * Zero pushes nothing. A ledger records what a reader has to be told.
 */
export function omit(into: Omission[], of: OmittedKind, count: number): void {
	if (count > 0) into.push({of, count});
}

/**
 * A cap that either applied or did not, entered as one.
 *
 * A refusal has nothing to count. It takes the smallest count standing for "this happened".
 */
export function flag(into: Omission[], of: OmittedKind, on: boolean): void {
	if (on) into.push({of, count: 1});
}

/**
 * How many of one kind a ledger records, over the places that reported it.
 *
 * Summed. A grid caps its columns and its rows apart and both reach the ledger.
 */
export const omittedCount = (ledger: Omission[], of: OmittedKind): number =>
	ledger.reduce((total, one) => (one.of === of ? total + one.count : total), 0);

/** One clause, in the footer's own voice. */
export const omissionLine = (of: OmittedKind, count: number): string => SAYS[of](count.toLocaleString(), count);
