/**
 * Position transforms, ggplot's `transform` argument to a continuous scale.
 *
 * Each maps a reading into the space the axis spaces evenly, and back.
 */

/** How a scale spaces its readings, on a value axis or along a color map. */
export type AxisTransform = "identity" | "log10" | "log2" | "sqrt" | "pseudo_log";

export interface TransformRule {
	forward: (value: number) => number;
	back: (value: number) => number;
	/** Whether a reading has a place on the axis. */
	admits: (value: number) => boolean;
}

const signed =
	(map: (value: number) => number) =>
	(value: number): number =>
		Math.sign(value) * map(Math.abs(value));

export const TRANSFORMS: Record<AxisTransform, TransformRule> = {
	identity: {forward: (value) => value, back: (value) => value, admits: () => true},
	log10: {forward: Math.log10, back: (value) => 10 ** value, admits: (value) => value > 0},
	log2: {forward: Math.log2, back: (value) => 2 ** value, admits: (value) => value > 0},
	/* Signed, as d3's square-root scale runs. A padded domain dips under zero and maps back. */
	sqrt: {forward: signed(Math.sqrt), back: signed((value) => value * value), admits: (value) => value >= 0},
	/* d3's symlog at a constant of one: linear inside one unit of zero, logarithmic past it. */
	pseudo_log: {forward: signed(Math.log1p), back: signed(Math.expm1), admits: () => true},
};

/** Whether a transform has no place for zero. */
export const isLog = (transform: AxisTransform | undefined): boolean => transform === "log10" || transform === "log2";

/** The transform an axis names. A stated `transform` wins, and `log` is shorthand for `log10`. */
export const transformOf = (axis: {log?: boolean; transform?: AxisTransform}): AxisTransform =>
	axis.transform ?? (axis.log ? "log10" : "identity");
