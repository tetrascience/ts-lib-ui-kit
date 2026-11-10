/**
 * A histogram's counts drawn as a run between the bin centers.
 *
 * Same statistic, same bins, different geometry. Columns tile the axis and stop being separable the
 * moment two distributions share a panel, where three runs stay three runs. So this is the geom for
 * comparing distributions and the histogram is the geom for reading one.
 *
 * The vertex sits at the bin's center and not at its edge, which is where the count belongs: a bin is
 * an interval and its count is a property of the whole interval, so the center is the only position
 * in it that does not favor one end.
 *
 * It reads the binned payload itself instead of taking points, so the reading of a bin center as a
 * position lives in one place. A stepped run is the outline-histogram form, and it claims the count
 * held flat across each bin where the straight run claims a gradual change nobody measured.
 */

import {useMemo} from "react";

import {dashArray, type BarDatum, type Linetype, type Scale} from "../../core/internal.js";

export interface FreqpolyProps {
	/** The bins, in axis order. `at` carries a bin center and its absence means a named category. */
	data: BarDatum[];
	x: Scale;
	y: Scale;
	color: string;
	/** Holds each bin's count flat across the bin instead of sloping to the next. */
	step?: "after" | "before";
	lineWidth?: number;
	/** Pattern the run draws. Absent draws it whole, which is what a solid linetype means. */
	dash?: Linetype;
	opacity?: number;
}

export function Freqpoly({data, x, y, color, step, lineWidth = 1.6, opacity = 1, dash}: FreqpolyProps) {
	const d = useMemo(() => {
		const at = (bin: BarDatum) => [x(bin.at ?? bin.category).toFixed(2), y(bin.value).toFixed(2)] as const;
		let path = "";
		let last: BarDatum | undefined;
		for (const bin of data) {
			const [px, py] = at(bin);
			if (!last) {
				path = `M${px},${py}`;
			} else if (step === "after") {
				path += `L${px},${at(last)[1]}L${px},${py}`;
			} else if (step === "before") {
				path += `L${at(last)[0]},${py}L${px},${py}`;
			} else {
				path += `L${px},${py}`;
			}
			last = bin;
		}
		return path;
	}, [data, x, y, step]);

	if (data.length < 2) return null;

	return (
		<path
			data-geom="freqpoly"
			d={d}
			fill="none"
			stroke={color}
			strokeWidth={lineWidth}
			strokeDasharray={dashArray(dash)}
			strokeOpacity={opacity}
			strokeLinejoin="round"
			strokeLinecap="round"
		/>
	);
}
