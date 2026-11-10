import { useMemo } from "react";

import type { ChartAnnotationProps } from "@/components/composed/Chart/annotations";
import type { ChartSpec, Fitter } from "@/vendor/ts-lib-viz/core";

import { categoricalPalettes, VizChart } from "@/components/charts/viz/VizChart";
import { seriesColor } from "@/utils/colors";
import { plot } from "@/vendor/ts-lib-viz/core";

/**
 * One concentration series: a response measured at each dose.
 *
 * `dose` and `response` pair up by index. A row with a dose at or below zero, or a
 * non-finite dose or response, is left out, because a log axis has no place for it.
 */
export interface DoseResponseSeries {
  /** Series name: the legend label, and the id a fitted curve comes back under. */
  name: string;
  /** Concentrations, in the units of `xTitle`. Each must be above zero. */
  dose: number[];
  /** The response measured at each dose. */
  response: number[];
  /**
   * Symmetric error on each response, drawn as a bar of response plus or minus this value.
   * Absent draws no error bars for the series.
   */
  error?: number[];
  /** Any CSS colour. Absent takes the series' palette colour. */
  color?: string;
}

/** Props for the `doseResponse` chart. */
export interface DoseResponseProps extends ChartAnnotationProps {
  /** One or more concentration series, drawn on one log10 dose axis. */
  dataSeries: DoseResponseSeries[];
  /**
   * Computes a four-parameter logistic (4PL) curve through each series. ts-lib-viz draws the
   * curve but does not fit it: the fit runs in the consumer's stats service.
   *
   * The fitter receives each series' points in dose units, so it should fit the 4PL in
   * log10(dose), and return `curveX` in dose units, the same units the points arrive in.
   *
   * Absent, the chart draws the points and any error bars, and no curve.
   */
  fitter?: Fitter;
  /** Fixed width in pixels. Absent fills the container. */
  width?: number;
  /** Fixed height in pixels. Absent fills the container. */
  height?: number;
  /** Dose range to show, in dose units. Absent fits the data. */
  xRange?: [number, number];
  /** Response range to show. Absent fits the data. */
  yRange?: [number, number];
  xTitle?: string;
  yTitle?: string;
  title?: string;
}

/** One row per measured response: its series, dose, response and the error bar's edges. */
interface DoseResponseRow {
  x: number;
  y: number;
  series: string;
  lo: number;
  hi: number;
}

/**
 * Flattens the series into rows, dropping any reading a log dose axis cannot place. The error
 * edges collapse to the response where a series has no error, so a bar of zero length is drawn
 * only when the chart asks for error bars at all.
 */
export function doseResponseRows(dataSeries: DoseResponseSeries[]): DoseResponseRow[] {
  return dataSeries.flatMap((series) =>
    series.dose.flatMap((dose, index) => {
      const response = series.response[index];
      if (!(dose > 0) || !Number.isFinite(dose) || response === undefined || !Number.isFinite(response)) {
        return [];
      }
      const error = series.error?.[index] ?? 0;
      return [{ x: dose, y: response, series: series.name, lo: response - error, hi: response + error }];
    }),
  );
}

const DoseResponseChart: React.FC<DoseResponseProps> = ({
  referenceLines,
  annotations,
  dataSeries,
  fitter,
  width,
  height,
  xRange,
  yRange,
  xTitle,
  yTitle,
  title,
}) => {
  const colors = useMemo(() => dataSeries.map((series, index) => seriesColor(index, series.color)), [dataSeries]);
  const palettes = useMemo(() => categoricalPalettes(colors), [colors]);
  const rows = useMemo(() => doseResponseRows(dataSeries), [dataSeries]);
  const hasErrorBars = useMemo(() => dataSeries.some((series) => series.error !== undefined), [dataSeries]);
  const spec = useMemo<ChartSpec>(() => {
    const aes = { x: "x", y: "y", color: "series" };
    // A fit is a property of the point layer, so it is stated only when a fitter can answer it.
    let builder = fitter ? plot(rows, aes).fit({ model: "4pl" }) : plot(rows, aes).point();
    if (hasErrorBars) builder = builder.errorbar({ aes: { ymin: "lo", ymax: "hi" } });
    return builder
      .labs({ headline: title })
      .scales({
        x: { title: xTitle, limits: xRange, transform: "log10" },
        y: { title: yTitle, limits: yRange },
      })
      .spec();
  }, [rows, fitter, hasErrorBars, title, xTitle, yTitle, xRange, yRange]);

  return (
    <VizChart
      spec={spec}
      data={rows}
      palettes={palettes}
      width={width}
      height={height}
      referenceLines={referenceLines}
      annotations={annotations}
      fitter={fitter}
    />
  );
};

export { DoseResponseChart };
