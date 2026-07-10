export { ScatterPlot } from "./ScatterPlot";
// MarkerSymbol is intentionally not re-exported here — the identical union is
// already exported at the package level via LinePlot.
export type {
  ScatterPlotDataSeries,
  ScatterPlotProps,
  ScatterPlotVariant,
} from "./ScatterPlot";
