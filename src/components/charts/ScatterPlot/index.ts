export { ScatterPlot } from "./ScatterPlot";
// MarkerSymbol is intentionally not re-exported here to avoid a duplicate export name at the package level.
// Use the package-level `MarkerSymbol` exported via LinePlot (it is a superset of Plotly marker symbols).
export type {
  ScatterPlotDataSeries,
  ScatterPlotProps,
  ScatterPlotVariant,
} from "./ScatterPlot";
