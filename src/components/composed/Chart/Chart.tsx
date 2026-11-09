import { AreaPlotChart } from "./kinds/AreaPlot";
import { BarChartChart } from "./kinds/BarChart";
import { BoxPlotChart } from "./kinds/BoxPlot";
import { ChromatogramChart } from "./kinds/Chromatogram";
import { DoseResponseChart } from "./kinds/DoseResponse";
import { ElectropherogramChart } from "./kinds/Electropherogram";
import { HistogramChart } from "./kinds/Histogram";
import { LinePlotChart } from "./kinds/LinePlot";
import { PieChartChart } from "./kinds/PieChart";
import { PlateMapChart } from "./kinds/PlateMap";
import { ScatterPlotChart } from "./kinds/ScatterPlot";
import { ScatterPlotInteractiveChart } from "./kinds/ScatterPlotInteractive";
import { StackedChromatogramChart } from "./kinds/StackedChromatogram";

import type { AreaPlotProps } from "./kinds/AreaPlot";
import type { BarChartProps } from "./kinds/BarChart";
import type { BoxPlotProps } from "./kinds/BoxPlot";
import type { ChromatogramProps } from "./kinds/Chromatogram";
import type { DoseResponseProps } from "./kinds/DoseResponse";
import type { ElectropherogramProps } from "./kinds/Electropherogram";
import type { HistogramProps } from "./kinds/Histogram";
import type { LinePlotProps } from "./kinds/LinePlot";
import type { PieChartProps } from "./kinds/PieChart";
import type { PlateMapProps } from "./kinds/PlateMap";
import type { ScatterPlotProps } from "./kinds/ScatterPlot";
import type { ScatterPlotInteractiveProps } from "./kinds/ScatterPlotInteractive";
import type { StackedChromatogramProps } from "./kinds/StackedChromatogram";

/**
 * The chart to draw, and the props that chart takes. `type` picks the chart; every
 * other prop is the one that chart documents, so an editor completes them per type.
 */
export type ChartProps =
  | ({ type: "line" } & LinePlotProps)
  | ({ type: "area" } & AreaPlotProps)
  | ({ type: "bar" } & BarChartProps)
  | ({ type: "histogram" } & HistogramProps)
  | ({ type: "boxplot" } & BoxPlotProps)
  | ({ type: "scatter" } & ScatterPlotProps)
  | ({ type: "scatterInteractive" } & ScatterPlotInteractiveProps)
  | ({ type: "doseResponse" } & DoseResponseProps)
  | ({ type: "pie" } & PieChartProps)
  | ({ type: "electropherogram" } & ElectropherogramProps)
  | ({ type: "chromatogram" } & ChromatogramProps)
  | ({ type: "stackedChromatogram" } & StackedChromatogramProps)
  | ({ type: "plateMap" } & PlateMapProps);

/** The `type` values `Chart` accepts. */
export type ChartType = ChartProps["type"];

/**
 * One component for every chart the kit draws.
 *
 * @example
 * <Chart type="histogram" dataSeries={[{ name: "Run 1", x: values }]} title="Peak heights" />
 * <Chart type="plateMap" data={wells} plateFormat="384" title="Screen" />
 */
export function Chart(props: ChartProps) {
  switch (props.type) {
    case "line":
      return <LinePlotChart {...props} />;
    case "area":
      return <AreaPlotChart {...props} />;
    case "bar":
      return <BarChartChart {...props} />;
    case "histogram":
      return <HistogramChart {...props} />;
    case "boxplot":
      return <BoxPlotChart {...props} />;
    case "scatter":
      return <ScatterPlotChart {...props} />;
    case "scatterInteractive":
      return <ScatterPlotInteractiveChart {...props} />;
    case "doseResponse":
      return <DoseResponseChart {...props} />;
    case "pie":
      return <PieChartChart {...props} />;
    case "electropherogram":
      return <ElectropherogramChart {...props} />;
    case "chromatogram":
      return <ChromatogramChart {...props} />;
    case "stackedChromatogram":
      return <StackedChromatogramChart {...props} />;
    case "plateMap":
      return <PlateMapChart {...props} />;
  }
}
