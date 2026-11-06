/**
 * Fitted curve shapes.
 *
 * Fitting runs in the service and the package reads results. The fetch and the hook that fills
 * these stay with the consumer.
 */

/**
 * One curve's outcome.
 *
 * `reason` carries the solver's taxonomy. `max_nfev` means the solver spent its whole budget.
 * `unidentifiable` means the data does not determine the solution it returned.
 */
export interface Fit {
	id: string;
	/**
	 * Facet value for this curve, echoed from the request.
	 *
	 * Absent on an unfaceted plot. Separate from `id` -- a category can hold characters that
	 * collide on a delimiter join.
	 */
	panel?: string;
	success: boolean;
	reason: string | null;
	params: Record<string, number>;
	r2: number | null;
	rmse: number | null;
	n: number;
	curveX: readonly number[];
	curveY: readonly number[];
	band: {lo: readonly number[]; hi: readonly number[]} | null;
}

export interface LayerFits {
	fits: Fit[];
	/** Groups a cap refused. A partial answer should not read as a whole one. */
	dropped: number;
}

export interface FitState {
	/** Keyed by series id. Absent where a series asked for no fit. */
	byLayer: Map<string, LayerFits>;
	pending: boolean;
	/** Set where the service could not be reached or refused the request. */
	problem: string | null;
}
