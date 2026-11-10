/**
 * A fitted curve, drawn from what the fitter returned.
 *
 * The overlay for `LayerSpec.fit`. It samples nothing and solves nothing: `curveX` and `curveY`
 * are the positions the service chose, so the drawn line is the fitted line and no interpolation of
 * this package's sits between a reader and the model. Rule 11 sends the arithmetic to the service
 * and this is the half that stays.
 *
 * A curve the fit did not settle on draws dashed, per the design language's line on fits. Which is
 * a narrower case than it sounds: a fit that failed outright comes back with no coordinates and
 * draws nothing, and the footer is what reports it. Dashed is for the answer that arrived and stops
 * short of convergence, where parameters exist and stopped on a bound or on a budget.
 */

import {useMemo} from "react";

import type {Fit, Scale} from "../../core/internal.js";

/** Enough of the interval to read as an interval. Below this the band is drawn as nothing. */
const BAND_MIN = 2;

/** Weak enough that the curve stays the geom and the interval stays context. */
const BAND_OPACITY = 0.13;

export interface FitCurveProps {
	fit: Fit;
	x: Scale;
	y: Scale;
	color: string;
	lineWidth?: number;
	/** Opacity of the curve, and a multiplier on the band's own. */
	opacity?: number;
	/** Off where the frame decided a band is unreadable, which is what `BAND_LIMIT` counts toward. */
	showBand?: boolean;
}

export function FitCurve({fit, x, y, color, lineWidth = 1.6, opacity = 1, showBand = true}: FitCurveProps) {
	const curve = useMemo(() => {
		let path = "";
		for (let i = 0; i < fit.curveX.length; i += 1) {
			const at = fit.curveX[i]!;
			const value = fit.curveY[i];
			if (value == null || !Number.isFinite(value)) continue;
			path += `${path ? "L" : "M"}${x(at).toFixed(2)},${y(value).toFixed(2)}`;
		}
		return path;
	}, [fit, x, y]);

	/* Out along the top and back along the bottom, which closes the interval into one fillable path. */
	const band = useMemo(() => {
		if (!showBand || !fit.band) return "";
		const {lo, hi} = fit.band;
		const count = Math.min(fit.curveX.length, lo.length, hi.length);
		if (count < BAND_MIN) return "";

		let top = "";
		let bottom = "";
		for (let i = 0; i < count; i += 1) {
			const at = x(fit.curveX[i]!).toFixed(2);
			top += `${top ? "L" : "M"}${at},${y(hi[i]!).toFixed(2)}`;
			bottom = `L${at},${y(lo[i]!).toFixed(2)}${bottom}`;
		}
		return `${top}${bottom}Z`;
	}, [fit, x, y, showBand]);

	if (!curve) return null;

	return (
		<g>
			{band && <path d={band} fill={color} fillOpacity={BAND_OPACITY * opacity} />}
			<path
				d={curve}
				fill="none"
				stroke={color}
				strokeWidth={lineWidth}
				strokeOpacity={opacity}
				strokeLinecap="round"
				strokeDasharray={fit.success ? undefined : "4 3"}
			/>
		</g>
	);
}
