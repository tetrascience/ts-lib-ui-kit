import Plotly from "plotly.js-dist";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { DEFAULT_COLOR_SCALE, PLOT_CONSTANTS } from "./constants";
import {
  applySelection,
  calculateAxisRange,
  calculateRange,
  downsampleData,
  generateTooltipContent,
  getSelectionMode,
  mapColors,
  mapShapes,
  mapSizes,
} from "./utils";

import type { InteractiveScatterProps, SelectionMode } from "./types";

/**
 * InteractiveScatter component for visualizing scatter plot data with advanced interactions.
 *
 * **Features:**
 * - Data-driven and static styling (color, shape, size)
 * - Interactive selection (click, box, lasso)
 * - Keyboard modifiers for selection modes (Shift/Ctrl)
 * - Customizable tooltips with rich content support
 * - Axis customization (ranges, log/linear scales)
 * - Performance optimizations for large datasets
 * - Selection propagation via callbacks
 *
 * **Selection Modes:**
 * - Default click/drag: Replace selection
 * - Shift + click/drag: Add to selection
 * - Ctrl/Cmd + click/drag: Remove from selection
 * - Shift + Ctrl + click/drag: Toggle selection
 */
const InteractiveScatter: React.FC<InteractiveScatterProps> = ({
  data,
  title,
  xAxis = {},
  yAxis = {},
  colorMapping,
  shapeMapping,
  sizeMapping,
  tooltip = { enabled: true },
  enableClickSelection = true,
  enableBoxSelection = true,
  enableLassoSelection = true,
  selectedIds: controlledSelectedIds,
  onSelectionChange,
  onPointClick,
  downsampling,
  width = 800,
  height = 600,
  showLegend = true,
  className,
}) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const onPointClickRef = useRef(onPointClick);

  // Keep refs updated
  onSelectionChangeRef.current = onSelectionChange;
  onPointClickRef.current = onPointClick;

  // Internal selection state (only used in uncontrolled mode)
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string | number>>(new Set());

  // Use controlled or uncontrolled selection
  const isControlled = controlledSelectedIds !== undefined;
  const selectedIds = isControlled ? controlledSelectedIds : internalSelectedIds;

  // Apply downsampling if configured
  const processedData = useMemo(() => {
    if (!downsampling) {
      return data;
    }
    return downsampleData(data, downsampling);
  }, [data, downsampling]);

  // Map colors, shapes, and sizes based on configuration
  const colors = useMemo(() => mapColors(processedData, colorMapping), [processedData, colorMapping]);

  const shapes = useMemo(() => mapShapes(processedData, shapeMapping), [processedData, shapeMapping]);

  const sizes = useMemo(() => mapSizes(processedData, sizeMapping), [processedData, sizeMapping]);

  // Calculate axis ranges
  const xRange = useMemo(() => {
    if (xAxis.range) return xAxis.range;
    if (xAxis.autoRange === false) return;
    return calculateAxisRange(processedData, "x", xAxis.autoRangePadding ?? PLOT_CONSTANTS.AUTO_RANGE_PADDING);
  }, [processedData, xAxis]);

  const yRange = useMemo(() => {
    if (yAxis.range) return yAxis.range;
    if (yAxis.autoRange === false) return;
    return calculateAxisRange(processedData, "y", yAxis.autoRangePadding ?? PLOT_CONSTANTS.AUTO_RANGE_PADDING);
  }, [processedData, yAxis]);

  // Build tooltip text
  const tooltipText = useMemo(() => {
    if (!tooltip.enabled) return [];

    return processedData.map((point) => {
      if (tooltip.content) {
        const content = tooltip.content(point);
        return typeof content === "string" ? content : "";
      }
      return generateTooltipContent(point, tooltip.fields);
    });
  }, [processedData, tooltip]);

  // Prepare Plotly-compatible color data
  const plotlyColors = useMemo(() => {
    if (colorMapping?.type === "continuous" && colorMapping.field && processedData.length > 0) {
      // For continuous mapping, extract the numeric values
      return processedData.map((point) => {
        const value = point.metadata?.[colorMapping.field!];
        return typeof value === "number" && Number.isFinite(value) ? value : 0;
      });
    }
    return colors;
  }, [processedData, colorMapping, colors]);

  // Build colorscale for continuous mapping
  const plotlyColorscale = useMemo(() => {
    if (colorMapping?.type === "continuous") {
      const scale = colorMapping.colorScale || DEFAULT_COLOR_SCALE;
      return typeof scale === "string" ? scale : scale;
    }
  }, [colorMapping]);

  // Build marker configuration for Plotly
  const markerConfig = useMemo((): Partial<Plotly.PlotMarker> => {
    const config: Partial<Plotly.PlotMarker> = {
      size: sizes,
      symbol: shapes,
      line: {
        color: "#ffffff",
        width: 1,
      },
    };

    // Configure color mapping
    if (colorMapping?.type === "continuous" && plotlyColorscale) {
      config.color = plotlyColors as number[];
      config.colorscale = plotlyColorscale;
      config.showscale = showLegend;

      if (colorMapping.field) {
        const range =
          colorMapping.min !== undefined && colorMapping.max !== undefined
            ? { min: colorMapping.min, max: colorMapping.max }
            : calculateRange(processedData, colorMapping.field);
        config.cmin = range.min;
        config.cmax = range.max;
        config.colorbar = {
          title: { text: colorMapping.field, side: "right" },
          thickness: 20,
          len: 0.7,
        };
      }
    } else {
      config.color = colors;
    }

    return config;
  }, [sizes, shapes, colorMapping, plotlyColorscale, plotlyColors, showLegend, processedData, colors]);

  // Create Plotly plot
  useEffect(() => {
    const currentRef = plotRef.current;
    if (!currentRef || processedData.length === 0) return;

    const xValues = processedData.map((p) => p.x);
    const yValues = processedData.map((p) => p.y);
    const ids = processedData.map((p) => String(p.id));

    // Create base trace
    const trace: Partial<Plotly.PlotData> & {
      unselected?: { marker?: { opacity?: number } };
      selected?: { marker?: { opacity?: number; line?: { color?: string; width?: number } } };
    } = {
      x: xValues,
      y: yValues,
      ids,
      mode: "markers",
      type: "scatter",
      marker: markerConfig,
      hoverinfo: tooltip.enabled ? "text" : "skip",
      text: tooltipText,
      hovertemplate: tooltip.enabled ? "%{text}<extra></extra>" : undefined,
      showlegend: false,
      unselected: {
        marker: {
          opacity: 0.3,
        },
      },
      selected: {
        marker: {
          opacity: 1,
          line: {
            color: "#d73027",
            width: 2,
          },
        },
      },
    };

    const plotData: Plotly.Data[] = [trace as Plotly.Data];

    // Configure layout
    const layout: Partial<Plotly.Layout> = {
      autosize: false,
      width,
      height,
      title: title
        ? {
            text: title,
            font: {
              family: PLOT_CONSTANTS.FONT_FAMILY,
              size: PLOT_CONSTANTS.TITLE_FONT_SIZE,
              color: "#333333",
            },
            x: 0.5,
            xanchor: "center",
          }
        : undefined,
      margin: {
        l: PLOT_CONSTANTS.MARGIN_LEFT,
        r: PLOT_CONSTANTS.MARGIN_RIGHT,
        t: title ? PLOT_CONSTANTS.MARGIN_TOP : PLOT_CONSTANTS.MARGIN_TOP - PLOT_CONSTANTS.TITLE_FONT_SIZE,
        b: PLOT_CONSTANTS.MARGIN_BOTTOM,
      },
      xaxis: {
        title: {
          text: xAxis.title || "",
          font: {
            family: PLOT_CONSTANTS.FONT_FAMILY,
            size: PLOT_CONSTANTS.AXIS_TITLE_FONT_SIZE,
            color: "#333333",
          },
        },
        type: xAxis.scale === "log" ? "log" : "linear",
        range: xRange,
        autorange: !xRange,
        gridcolor: "#e0e0e0",
        linecolor: "#333333",
        linewidth: PLOT_CONSTANTS.AXIS_LINE_WIDTH,
        tickfont: {
          family: PLOT_CONSTANTS.FONT_FAMILY,
          size: PLOT_CONSTANTS.AXIS_TICK_FONT_SIZE,
        },
        zeroline: false,
      },
      yaxis: {
        title: {
          text: yAxis.title || "",
          font: {
            family: PLOT_CONSTANTS.FONT_FAMILY,
            size: PLOT_CONSTANTS.AXIS_TITLE_FONT_SIZE,
            color: "#333333",
          },
        },
        type: yAxis.scale === "log" ? "log" : "linear",
        range: yRange,
        autorange: !yRange,
        gridcolor: "#e0e0e0",
        linecolor: "#333333",
        linewidth: PLOT_CONSTANTS.AXIS_LINE_WIDTH,
        tickfont: {
          family: PLOT_CONSTANTS.FONT_FAMILY,
          size: PLOT_CONSTANTS.AXIS_TICK_FONT_SIZE,
        },
        zeroline: false,
      },
      paper_bgcolor: "#ffffff",
      plot_bgcolor: "#ffffff",
      font: {
        family: PLOT_CONSTANTS.FONT_FAMILY,
        color: "#333333",
      },
      hovermode: "closest",
      dragmode: enableLassoSelection ? "lasso" : enableBoxSelection ? "select" : false,
    };

    const config: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToAdd: [],
      modeBarButtonsToRemove: ["toImage"],
    };

    // Add selection mode buttons if enabled
    if (enableBoxSelection) {
      config.modeBarButtonsToAdd?.push("select2d" as never);
    }
    if (enableLassoSelection) {
      config.modeBarButtonsToAdd?.push("lasso2d" as never);
    }

    Plotly.newPlot(currentRef, plotData, layout, config);

    // Attach event handlers
    const plotElement = currentRef as unknown as Plotly.PlotlyHTMLElement;

    // Handle point click
    if (enableClickSelection) {
      plotElement.on("plotly_click", (eventData: Plotly.PlotMouseEvent) => {
        const point = eventData.points[0];
        if (point && point.data.ids) {
          const clickedId = point.data.ids[point.pointIndex];
          const clickedPoint = processedData.find((p) => String(p.id) === clickedId);

          if (clickedPoint) {
            // Call point click handler if provided
            onPointClickRef.current?.(clickedPoint, eventData.event as MouseEvent);

            // Handle selection
            const mode = getSelectionMode(eventData.event as MouseEvent);
            const newSelection = applySelection(selectedIds, new Set([clickedId]), mode);

            if (!isControlled) {
              setInternalSelectedIds(newSelection);
            }
            onSelectionChangeRef.current?.(newSelection, mode);
          }
        }
      });
    }

    // Handle box/lasso selection
    if (enableBoxSelection || enableLassoSelection) {
      plotElement.on("plotly_selected", (eventData: Plotly.PlotSelectionEvent) => {
        if (eventData && eventData.points) {
          const selectedPointIds = eventData.points
            .map((p): string | number | null => {
              if (p.data.ids && p.pointIndex !== undefined) {
                return p.data.ids[p.pointIndex] as string | number;
              }
              return null;
            })
            .filter((id: string | number | null): id is string | number => id !== null);

          // Get selection mode from keyboard state
          // Note: Plotly doesn't pass the original event, so we can't detect modifiers
          // For now, box/lasso selection always replaces
          const mode: SelectionMode = "replace";
          const newSelection = new Set<string | number>(selectedPointIds);

          if (!isControlled) {
            setInternalSelectedIds(newSelection);
          }
          onSelectionChangeRef.current?.(newSelection, mode);
        }
      });

      // Handle deselect (clicking on background)
      plotElement.on("plotly_deselect", () => {
        const newSelection = new Set<string | number>();
        if (!isControlled) {
          setInternalSelectedIds(newSelection);
        }
        onSelectionChangeRef.current?.(newSelection, "replace");
      });
    }

    return () => {
      if (currentRef) {
        Plotly.purge(currentRef);
      }
    };
  }, [
    processedData,
    markerConfig,
    xAxis,
    yAxis,
    xRange,
    yRange,
    title,
    width,
    height,
    tooltip,
    tooltipText,
    enableClickSelection,
    enableBoxSelection,
    enableLassoSelection,
    selectedIds,
    isControlled,
  ]);

  // Apply selection state to Plotly
  useEffect(() => {
    const currentRef = plotRef.current;
    if (!currentRef) return;

    const plotElement = currentRef as unknown as Plotly.PlotlyHTMLElement;

    // Find indices of selected points
    const selectedIndices = processedData
      .map((point, index) => (selectedIds.has(point.id) ? index : null))
      .filter((index): index is number => index !== null);

    // Update Plotly selection
    if (selectedIndices.length > 0) {
      Plotly.restyle(
        plotElement,
        {
          selectedpoints: [selectedIndices],
        },
        [0],
      );
    } else {
      Plotly.restyle(
        plotElement,
        {
          selectedpoints: [null],
        },
        [0],
      );
    }
  }, [selectedIds, processedData]);

  const containerClassName = className ? `interactive-scatter ${className}` : "interactive-scatter";

  return (
    <div className={containerClassName}>
      <div ref={plotRef} className="interactive-scatter__plot" style={{ width, height }} />
    </div>
  );
};

export { InteractiveScatter };
