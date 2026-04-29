import Plotly from "plotly.js-dist";
import React, { useEffect, useMemo, useRef } from "react";

import { usePlotlyTheme } from "@/hooks/use-plotly-theme";
import { cn } from "@/lib/utils";
import { withVisualization } from "@/lib/visualization";

type PlotlyVisualizationProps = {
  data?: Plotly.Data[];
  layout?: Partial<Plotly.Layout>;
  config?: Partial<Plotly.Config>;
  title?: string;
  height?: number;
  showLegend?: boolean;
  className?: string;
};

const PlotlyVisualization: React.FC<PlotlyVisualizationProps> = ({
  data = [],
  layout,
  config,
  title,
  height = 380,
  showLegend = true,
  className,
}) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const theme = usePlotlyTheme();

  const plotData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  useEffect(() => {
    const currentRef = plotRef.current;
    if (!currentRef) return;

    const mergedLayout: Partial<Plotly.Layout> = {
      ...(layout ?? {}),
      autosize: true,
      height,
      margin: layout?.margin ?? { t: 40, r: 20, b: 48, l: 56 },
      paper_bgcolor: layout?.paper_bgcolor ?? "transparent",
      plot_bgcolor: layout?.plot_bgcolor ?? theme.plotBg,
      showlegend: showLegend,
      font: layout?.font ?? {
        family: "Inter, sans-serif",
        color: theme.textSecondary,
      },
    };
    const mergedConfig: Partial<Plotly.Config> = {
      ...(config ?? {}),
      responsive: true,
      displaylogo: false,
    };

    Plotly.newPlot(currentRef, plotData, mergedLayout, mergedConfig);

    return () => {
      Plotly.purge(currentRef);
    };
  }, [config, height, layout, plotData, showLegend, theme.plotBg, theme.textSecondary]);

  return (
    <div className={cn("w-full rounded-lg border bg-card p-4", className)}>
      {title && <div className="mb-2 text-sm font-medium text-foreground">{title}</div>}
      <div ref={plotRef} style={{ height }} />
    </div>
  );
};

const PlotlyVisualizationWithMeta = withVisualization(PlotlyVisualization, {
  id: "viz-plotly",
  inputKind: "plot",
  description: "General-purpose Plotly visualization driven by Plotly data and layout payloads.",
  tunableProps: [
    {
      name: "height",
      type: "number",
      description: "Chart height in pixels.",
      default: 380,
      validation: { min: 200, max: 1200 },
    },
    {
      name: "showLegend",
      type: "boolean",
      description: "Show the chart legend.",
      default: true,
    },
  ],
});

export { PlotlyVisualizationWithMeta as PlotlyVisualization };
export type { PlotlyVisualizationProps };
