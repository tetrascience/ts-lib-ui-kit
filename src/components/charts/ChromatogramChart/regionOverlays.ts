import { CHART_COLORS } from "../../../utils/colors";

import type { PeakAnnotation, ChromatogramSeries } from "./types";
import type Plotly from "plotly.js-dist";

const DEFAULT_REGION_OVERLAY_WIDTH = 3.5;

/**
 * Build one scatter trace per peak that has regionOverlay:true, slicing the
 * underlying series data between the peak's startIndex and endIndex.
 * Traces are pushed BEFORE the invisible hit-area trace so peak click/hover
 * still resolves to the hit-area marker, not the overlay.
 */
export function createRegionOverlayTraces(
  peaks: PeakAnnotation[],
  seriesIndex: number,
  series: ChromatogramSeries
): Plotly.Data[] {
  const seriesColor = series.color ?? CHART_COLORS[seriesIndex % CHART_COLORS.length];
  const traces: Plotly.Data[] = [];

  for (const peak of peaks) {
    if (!peak.regionOverlay) continue;
    const startIdx = peak._computed?.startIndex;
    const endIdx = peak._computed?.endIndex;
    if (startIdx === undefined || endIdx === undefined) continue;

    const color = peak.color ?? seriesColor;
    const lineWidth = peak.regionOverlayWidth ?? DEFAULT_REGION_OVERLAY_WIDTH;
    const hoverProps = peak.hoverText
      ? { hovertemplate: `${peak.hoverText}<extra></extra>` }
      : { hoverinfo: "skip" as const };

    traces.push({
      x: series.x.slice(startIdx, endIdx + 1),
      y: series.y.slice(startIdx, endIdx + 1),
      type: "scatter" as const,
      mode: "lines" as const,
      line: { color, width: lineWidth },
      showlegend: false,
      name: "",
      ...hoverProps,
    });
  }

  return traces;
}
