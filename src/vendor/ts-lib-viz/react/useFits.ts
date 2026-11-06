/**
 * The fitter, held against a chart's lifetime.
 *
 * A curve arrives long after the geoms do, so this is the one place that knows a chart can be
 * drawn and correct while its fits are still in flight. What it turns a `Fitter` into is the
 * `FitState` the frame derivation already reads, which is why nothing downstream has to learn that
 * the answer came over a wire.
 *
 * Refits on `fitSignature` and on nothing else. A chart re-renders on a hover, a theme flip, a
 * recolor and a resize, and a curve survives all of them; keying the effect on the signature is
 * what keeps a pointer moving across a scatter from putting a solver under load.
 *
 * The fitter is read through a ref, so one written inline asks nothing new. A host swapping services
 * under an unchanged signature changes the chart's `key`.
 */

import {useEffect, useRef, useState} from "react";

import {fitSignature, type FitRequest, type Fitter} from "../core/internal.js";
import type {FitState} from "../core/internal.js";

/** No fit asked for, none in flight, nothing wrong. */
const IDLE: FitState = {byLayer: new Map(), pending: false, problem: null};

/** What the footer says when the service refused, in the words the service used where it gave any. */
const problemOf = (error: unknown): string =>
	error instanceof Error && error.message ? error.message : "fit unavailable";

/**
 * Fits for the requests a frame produced.
 *
 * Idle where the consumer passed no fitter, which is the ordinary case: a chart with no `fit` on
 * any series asks for nothing, and a chart that asks stays drawn and uncurved until a fitter
 * reaches it. A response that lands after its question was replaced is dropped, so a slow answer to
 * an old signature cannot overwrite a fast answer to the current one.
 */
export function useFits(requests: FitRequest[], fitter?: Fitter): FitState {
	const signature = fitSignature(requests);
	const [state, setState] = useState<FitState>(IDLE);

	/*
    The requests themselves stay out of the effect's dependencies, since they are a new array on
    each render and the signature is the question of whether they mean anything different.
  */
	const latest = useRef(requests);
	latest.current = requests;
	const asked = useRef(fitter);
	asked.current = fitter;
	const fitting = fitter != null;

	useEffect(() => {
		const current = asked.current;
		if (!current || signature === "") {
			setState(IDLE);
			return;
		}

		let live = true;
		setState({byLayer: new Map(), pending: true, problem: null});

		void current(latest.current).then(
			(byLayer) => {
				if (live) setState({byLayer, pending: false, problem: null});
			},
			(error: unknown) => {
				if (live) setState({byLayer: new Map(), pending: false, problem: problemOf(error)});
			},
		);

		return () => {
			live = false;
		};
	}, [signature, fitting]);

	return state;
}
