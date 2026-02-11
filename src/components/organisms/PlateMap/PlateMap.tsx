import React, { useEffect, useMemo, useRef, useState } from "react";
import Plotly from "plotly.js-dist";
import "./PlateMap.scss";

// Types
import type {
  PlateMapProps,
  LayerConfig,
  WellData,
} from "./types";
import {
  PLATE_FORMAT_96,
  PLATE_FORMAT_CUSTOM,
} from "./types";

// Re-export types and constants for external consumers
export * from "./types";
export { DEFAULT_CATEGORY_COLORS } from "./constants";

// Constants
import {
  PLATE_CONFIGS,
  DEFAULT_COLOR_SCALE,
  COLORS,
  DEFAULT_CATEGORY_COLORS,
} from "./constants";

// Utilities
import {
  generateRowLabels,
  generateColumnLabels,
  wellDataToGrid,
  calculateValueRange,
  hasMultiValueWells,
  extractLayers,
  parseRegionWells,
} from "./utils";

/**
 * PlateMap component for visualizing well plate data as a heatmap or categorical display.
 *
 * **Supported Plate Formats:**
 * - 96-well (8 rows × 12 columns, wells A1-H12)
 * - 384-well (16 rows × 24 columns, wells A1-P24)
 * - 1536-well (32 rows × 48 columns, wells A1-AF48)
 * - Custom dimensions with user-specified rows/columns
 *
 * **Visualization Modes:**
 * - `"heatmap"`: Continuous color gradient for quantitative values
 * - `"categorical"`: Discrete colors for well types (sample, control, empty)
 *
 * **Features:**
 * - Multiple data layers with independent visualization settings
 * - Control region highlighting with borders and fill colors
 * - Configurable color scales, tooltips, and click interactions
 * - Support for WellData arrays with multi-layer visualization
 *
 * **Data Format:**
 * - **WellData array**: `[{ wellId: "A1", values: { RFU: 100 }, tooltipData: {...} }, ...]`
 *
 */
const PlateMap: React.FC<PlateMapProps> = ({
  data,
  layerConfigs,
  initialLayerId,
  onLayerChange,
  plateFormat = PLATE_FORMAT_96,
  rows: customRows,
  columns: customColumns,
  visualizationMode: propVisualizationMode = "heatmap",
  categoryColors: customCategoryColors,
  regions,
  title,
  xTitle,
  yTitle,
  xLabels: customXLabels,
  yLabels: customYLabels,
  colorScale: propColorScale = DEFAULT_COLOR_SCALE,
  valueMin: propValueMin,
  valueMax: propValueMax,
  emptyWellColor = COLORS.emptyWell,
  showColorBar = true,
  showLegend = true,
  legendConfig,
  width = 800,
  height = 500,
  precision = 0,
  markerShape = "circle",
  onWellClick,
}) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const onWellClickRef = useRef(onWellClick);
  onWellClickRef.current = onWellClick;

  // Internal state for layer toggling, initialized with initialLayerId
  const [activeLayerId, setActiveLayerId] = useState<string | undefined>(initialLayerId);

  // Determine plate dimensions
  let rows: number;
  let columns: number;

  if (plateFormat === PLATE_FORMAT_CUSTOM) {
    rows = customRows ?? 8;
    columns = customColumns ?? 12;
  } else {
    const config = PLATE_CONFIGS[plateFormat];
    rows = config.rows;
    columns = config.columns;
  }

  // Auto-generate layers from multi-value WellData
  const effectiveLayers = useMemo((): LayerConfig[] | null => {
    // Check if data contains multi-value wells
    if (Array.isArray(data) && data.length > 0 && "wellId" in (data[0] as WellData)) {
      const wellDataArray = data as WellData[];
      if (hasMultiValueWells(wellDataArray)) {
        return extractLayers(wellDataArray, layerConfigs);
      }
    }

    return null;
  }, [data, layerConfigs]);

  // Handle layer toggling - determine active layer
  const activeLayer = useMemo((): LayerConfig | null => {
    if (!effectiveLayers || effectiveLayers.length === 0) return null;
    if (activeLayerId) {
      return effectiveLayers.find((l) => l.id === activeLayerId) ?? effectiveLayers[0];
    }
    return effectiveLayers[0];
  }, [effectiveLayers, activeLayerId]);

  // Get effective props from active layer or default props
  // Data is always the same - we just change which layer is being visualized
  const visualizationMode = activeLayer?.visualizationMode ?? propVisualizationMode;
  const colorScale = activeLayer?.colorScale ?? propColorScale;
  const valueMin = activeLayer?.valueMin ?? propValueMin;
  const valueMax = activeLayer?.valueMax ?? propValueMax;
  // Derive valueUnit from layer config
  const valueUnit = activeLayer?.valueUnit ? ` ${activeLayer.valueUnit}` : "";

  // Merge custom category colors with defaults, including layer-specific colors
  const categoryColors = useMemo(
    () => ({ ...DEFAULT_CATEGORY_COLORS, ...customCategoryColors, ...activeLayer?.categoryColors }),
    [customCategoryColors, activeLayer?.categoryColors]
  );

  // Convert data to grid format - memoize to prevent re-render issues
  // Use activeLayer.id to extract the appropriate value from multi-value wells
  const activeLayerId_ = activeLayer?.id;
  const { grid, categoriesGrid, allValuesMap, tooltipDataMap } = useMemo(() => {
    let resultGrid: (number | null)[][];
    let resultCategories: (string | null)[][] = Array.from({ length: rows }, () =>
      Array(columns).fill(null)
    );
    let resultAllValues = new Map<string, Record<string, string | number | null>>();
    let resultTooltipData = new Map<string, Record<string, unknown>>();

    if (Array.isArray(data) && data.length > 0) {
      // WellData array format - pass activeLayerId to extract the right layer
      const result = wellDataToGrid(data, rows, columns, activeLayerId_);
      resultGrid = result.grid;
      resultCategories = result.categories;
      resultAllValues = result.allValues;
      resultTooltipData = result.tooltipData;
    } else {
      // Generate random data for demonstration when no data provided
      resultGrid = Array.from({ length: rows }, () =>
        Array.from({ length: columns }, () => Math.random() * 50000)
      );
    }

    return { grid: resultGrid, categoriesGrid: resultCategories, allValuesMap: resultAllValues, tooltipDataMap: resultTooltipData };
  }, [data, rows, columns, activeLayerId_]);

  // Generate labels - use custom labels if provided, otherwise auto-generate
  const rowLabels = customYLabels ?? generateRowLabels(rows);
  const colLabels = customXLabels ?? generateColumnLabels(columns);

  // Calculate value range if not provided
  const range = calculateValueRange(grid);
  const zMin = valueMin ?? range.min;
  const zMax = valueMax ?? range.max;

  // Check if grid has any null values
  const hasNullValues = grid.some(row => row.some(val => val === null));

  // Create sentinel value for empty wells (below the data range)
  // This allows us to show emptyWellColor for null cells
  const sentinelValue = zMin - (zMax - zMin) * 0.01 - 1;

  // Replace null values with sentinel for Plotly rendering
  const displayGrid = hasNullValues
    ? grid.map(row => row.map(val => val === null ? sentinelValue : val))
    : grid;

  // Extend colorscale to include emptyWellColor at the bottom for null values
  const effectiveColorScale = useMemo(() => {
    if (!hasNullValues) return colorScale;

    // If colorScale is a string (named scale), we can't easily extend it
    // In this case, use the emptyWellColor as plot background
    if (typeof colorScale === "string") {
      return colorScale;
    }

    // For array colorscales, prepend emptyWellColor at position 0
    // and shift all other positions proportionally
    const totalRange = zMax - sentinelValue;
    const dataStartRatio = (zMin - sentinelValue) / totalRange;

    // Create new colorscale with emptyWellColor at the bottom
    const extendedScale: Array<[number, string]> = [
      [0, emptyWellColor],
      [dataStartRatio * 0.99, emptyWellColor], // Small band for empty wells
    ];

    // Remap original colorscale positions to the remaining range
    for (const [pos, color] of colorScale) {
      const newPos = dataStartRatio + pos * (1 - dataStartRatio);
      extendedScale.push([newPos, color]);
    }

    return extendedScale;
  }, [colorScale, hasNullValues, zMin, zMax, sentinelValue, emptyWellColor]);

  // Effective zMin includes sentinel value if we have nulls
  const effectiveZMin = hasNullValues ? sentinelValue : zMin;

  // Create a lookup map for layer configs to get valueUnit for each layer
  const layerConfigMap = useMemo(() => {
    const map = new Map<string, LayerConfig>();
    if (effectiveLayers) {
      for (const layer of effectiveLayers) {
        map.set(layer.id, layer);
      }
    }
    return map;
  }, [effectiveLayers]);

  // Build custom hover text matrix - shows ALL values regardless of active layer
  const hoverText: string[][] = grid.map((row, rowIdx) =>
    row.map((val, colIdx) => {
      const wellId = `${rowLabels[rowIdx]}${colLabels[colIdx]}`;
      const wellIdUpper = String(wellId).toUpperCase();
      const allValues = allValuesMap.get(wellIdUpper);
      const tooltipExtra = tooltipDataMap.get(wellIdUpper);

      let text = `Well ${wellId}`;

      // Show all values from the values object
      // Mark the active layer with ▶ indicator
      const activeLayerKey = activeLayer?.id;
      if (allValues) {
        for (const [key, value] of Object.entries(allValues)) {
          const isActiveLayer = key === activeLayerKey;
          const prefix = isActiveLayer ? "▶ " : "";
          const rawLayerUnit = layerConfigMap.get(key)?.valueUnit;
          const layerUnit = rawLayerUnit ? ` ${rawLayerUnit}` : "";
          if (value === null) {
            text += `<br>${prefix}${key}: -`;
          } else if (typeof value === "number") {
            text += `<br>${prefix}${key}: ${value.toFixed(precision)}${layerUnit}`;
          } else {
            // String value - capitalize first letter
            text += `<br>${prefix}${key}: ${value.charAt(0).toUpperCase() + value.slice(1)}`;
          }
        }
      } else if (val !== null) {
        // Fallback for data without tooltipData
        text += `<br>Value: ${val.toFixed(precision)}${valueUnit}`;
      } else if (activeLayer) {
        // Note: The `category` branch was removed as unreachable - categoriesGrid is only
        // populated via wellDataToGrid which also populates allValuesMap, so if category
        // is truthy, allValues will also be truthy and we'll enter the branch above.
        // Well not in data but we have layers - show active layer with "-"
        text += `<br>▶ ${activeLayer.id}: -`;
      } else {
        text += `<br>No data`;
      }

      // Add tooltipData
      if (tooltipExtra) {
        for (const [key, value] of Object.entries(tooltipExtra)) {
          text += `<br>${key}: ${value}`;
        }
      }

      return text;
    })
  );

  // Build categorical data for categorical mode
  const { categoricalGrid, categoricalColorScale, uniqueTypes, catMax } = useMemo(() => {
    if (visualizationMode !== "categorical") {
      return { categoricalGrid: null, categoricalColorScale: null, uniqueTypes: [], catMax: 0 };
    }

    // Collect unique categories from the categoriesGrid
    const typesSet = new Set<string>();
    let hasNullCategory = false;
    for (const row of categoriesGrid) {
      for (const category of row) {
        if (category) {
          typesSet.add(category);
        } else {
          hasNullCategory = true;
        }
      }
    }
    // Only include "empty" if there are actual null wells
    if (hasNullCategory) {
      typesSet.add("empty");
    }
    const types = Array.from(typesSet).sort();

    // Create numeric grid where each category maps to an index
    const typeToIndex = new Map<string, number>();
    types.forEach((type, idx) => typeToIndex.set(type, idx));

    const catGrid: number[][] = categoriesGrid.map((row) =>
      row.map((category) => {
        if (category === null) {
          return typeToIndex.get("empty") ?? 0;
        }
        return typeToIndex.get(category) ?? typeToIndex.get("empty") ?? 0;
      })
    );

    // Build discrete colorscale for categories
    // The grid contains integer indices 0, 1, 2, ... (numTypes - 1)
    // With cmin=0 and cmax=numTypes-1, Plotly maps:
    //   index 0 -> normalized 0.0
    //   index (numTypes-1) -> normalized 1.0
    // We need each index to map to a distinct color band
    const numTypes = types.length;
    const catColorScale: Array<[number, string]> = [];

    if (numTypes === 1) {
      // Single type: entire range is one color
      const color = categoryColors[types[0]] || emptyWellColor;
      catColorScale.push([0, color]);
      catColorScale.push([1, color]);
    } else {
      // Multiple types: create bands for each index
      // Index i maps to normalized value i / (numTypes - 1)
      types.forEach((type, idx) => {
        const color = categoryColors[type] || emptyWellColor;
        const normalizedPos = idx / (numTypes - 1);
        // Create a small band around each position
        const bandHalf = 0.5 / (numTypes - 1);
        const start = Math.max(0, normalizedPos - bandHalf);
        const end = Math.min(1, normalizedPos + bandHalf - 0.001);
        catColorScale.push([start, color]);
        catColorScale.push([end, color]);
      });
    }

    // cmax should be numTypes - 1 to match the index range
    return { categoricalGrid: catGrid, categoricalColorScale: catColorScale, uniqueTypes: types, catMax: numTypes - 1 };
  }, [visualizationMode, categoriesGrid, categoryColors, emptyWellColor]);

  // Build Plotly shapes for highlighted regions
  const regionShapes = useMemo(() => {
    if (!regions || regions.length === 0) {
      return [];
    }

    const shapes: Array<Partial<Plotly.Shape>> = [];

    for (const region of regions) {
      const bounds = parseRegionWells(region.wells, rowLabels, colLabels);
      if (!bounds) continue;

      // Plotly heatmap uses the actual label values for positioning.
      // colLabels are 1-indexed (1, 2, 3, ...), so we need to convert from 0-indexed bounds.
      // Each cell is centered on its label, so we offset by inset to cover the cell.
      // For columns: bounds.minCol=0 means column label 1, so x0 = 1 - inset
      // For rows: bounds.minRow=0 means row index 0, which is correct for y-axis
      //
      // Use 0.49 inset to place boundary just inside cell edge,
      // avoiding line doubling when adjacent regions share a border
      const inset = 0.49;
      const x0 = (bounds.minCol + 1) - inset;
      const x1 = (bounds.maxCol + 1) + inset;
      const y0 = bounds.minRow - inset;
      const y1 = bounds.maxRow + inset;

      shapes.push({
        type: "rect",
        xref: "x",
        yref: "y",
        x0,
        x1,
        y0,
        y1,
        line: {
          color: region.borderColor || COLORS.textDark,
          width: region.borderWidth ?? 2,
        },
        fillcolor: region.fillColor || "transparent",
        layer: "above",
      });
    }

    return shapes;
  }, [regions, rowLabels, colLabels]);

  useEffect(() => {
    const currentRef = plotRef.current;
    if (!currentRef) return;

    // Determine which grid and colorscale to use based on mode
    const isCategorical = visualizationMode === "categorical";
    const plotZ = isCategorical && categoricalGrid ? categoricalGrid : displayGrid;
    const plotColorScale = isCategorical && categoricalColorScale ? categoricalColorScale : effectiveColorScale;
    const plotZMin = isCategorical ? 0 : effectiveZMin;
    const plotZMax = isCategorical ? (catMax || 1) : zMax;
    const plotShowScale = isCategorical ? false : showColorBar;

    // Flatten 2D grid data into arrays for scatter plot (circles)
    const xData: number[] = [];
    const yData: string[] = [];
    const colorData: number[] = [];
    const textData: string[] = [];

    for (let rowIdx = 0; rowIdx < rows; rowIdx++) {
      for (let colIdx = 0; colIdx < columns; colIdx++) {
        xData.push(colIdx + 1); // 1-indexed columns
        yData.push(rowLabels[rowIdx] as string);
        const zValue = plotZ[rowIdx][colIdx];
        colorData.push(zValue ?? plotZMin); // Use min value for null wells (will be styled separately)
        textData.push(hoverText[rowIdx][colIdx]);
      }
    }

    // Calculate marker size based on actual plot area (accounting for margins)
    // Use consistent margins regardless of colorbar visibility to prevent layout shift when switching layers
    const leftMargin = yTitle ? 70 : 50;
    const rightMargin = 100; // Always reserve space for colorbar to prevent layout shift
    const topMargin = title ? 100 : 40;
    const bottomMargin = 50;
    const plotWidth = width - leftMargin - rightMargin;
    const plotHeight = height - topMargin - bottomMargin;

    // Calculate pixels per cell
    const cellWidth = plotWidth / columns;
    const cellHeight = plotHeight / rows;

    // For circles: use smaller dimension to keep them uniform and avoid overlap
    // For squares: use larger dimension so they fill the entire cell with no gaps
    const cellSize =
      markerShape === "square"
        ? Math.max(cellWidth, cellHeight)
        : Math.min(cellWidth, cellHeight);

    // Squares fill entire cell (100%) for seamless heatmap, circles leave gaps (80%)
    const sizeMultiplier = markerShape === "square" ? 1.0 : 0.8;
    const markerSize = Math.max(4, cellSize * sizeMultiplier);

    // Create scatter plot with markers
    const plotData: Plotly.Data[] = [
      {
        x: xData,
        y: yData,
        mode: "markers" as const,
        type: "scatter" as const,
        marker: {
          symbol: markerShape,
          size: markerSize,
          color: colorData,
          colorscale: plotColorScale,
          cmin: plotZMin,
          cmax: plotZMax,
          showscale: plotShowScale,
          colorbar: (() => {
            // Position colorbar based on legendConfig
            const pos = legendConfig?.position ?? "right";
            if (pos === "bottom") {
              return {
                orientation: "h" as const,
                thickness: 20,
                len: 0.75,
                outlinewidth: 0,
                ticksuffix: valueUnit,
                y: -0.15,
                yanchor: "top" as const,
                x: 0.5,
                xanchor: "center" as const,
                title: legendConfig?.title ? { text: legendConfig.title, side: "top" as const } : undefined,
              };
            } else if (pos === "top") {
              return {
                orientation: "h" as const,
                thickness: 20,
                len: 0.75,
                outlinewidth: 0,
                ticksuffix: valueUnit,
                y: 1.15,
                yanchor: "bottom" as const,
                x: 0.5,
                xanchor: "center" as const,
                title: legendConfig?.title ? { text: legendConfig.title, side: "bottom" as const } : undefined,
              };
            } else if (pos === "left") {
              return {
                thickness: 28,
                len: 1,
                outlinewidth: 0,
                ticksuffix: valueUnit,
                y: 0.5,
                yanchor: "middle" as const,
                x: -0.15,
                xanchor: "right" as const,
                title: legendConfig?.title ? { text: legendConfig.title, side: "right" as const } : undefined,
              };
            } else {
              // "right" (default)
              return {
                thickness: 20,
                len: 0.9,
                outlinewidth: 0,
                ticksuffix: valueUnit,
                x: 0.88, // Fixed position within the reserved space (domain ends at 0.85)
                xanchor: "left" as const,
                y: 0.5,
                yanchor: "middle" as const,
                title: legendConfig?.title ? { text: legendConfig.title, side: "right" as const } : undefined,
              };
            }
          })(),
          line: {
            color: "var(--grey-400)",
            width: 1,
          },
        },
        hoverinfo: "text" as const,
        text: textData,
      },
    ];

    const layout = {
      autosize: false, // Prevent auto-sizing to maintain consistent layout
      title: title
        ? {
            text: title,
            font: {
              family: "Inter, sans-serif",
              size: 20,
              color: "var(--black-300)",
            },
            // Center title over graph area based on legend position
            x: (() => {
              const pos = legendConfig?.position ?? "right";
              if (pos === "left") return 0.575; // midpoint of [0.15, 1]
              if (pos === "right") return 0.425; // midpoint of [0, 0.85]
              return 0.5; // top/bottom use full width
            })(),
            xanchor: "center" as const,
            y: 0.98,
            yanchor: "top" as const,
          }
        : undefined,
      width,
      height,
      margin: (() => {
        const pos = legendConfig?.position ?? "right";
        const baseLeft = yTitle ? 70 : 50;
        const baseRight = 50;
        // Reserve extra space for colorbar on the appropriate side
        return {
          l: pos === "left" ? baseLeft + 50 : baseLeft,
          r: pos === "right" ? baseRight + 50 : baseRight,
          b: pos === "bottom" ? 80 : 50,
          t: title ? (pos === "top" ? 130 : 100) : (pos === "top" ? 70 : 40),
          pad: 5
        };
      })(),
      xaxis: {
        title: {
          text: xTitle || "",
          font: {
            size: 16,
            color: "var(--black-300)",
            family: "Inter, sans-serif",
          },
          standoff: 15,
        },
        side: "top" as const,
        fixedrange: true,
        dtick: 1,
        range: [0.5, columns + 0.5], // Explicit range to prevent auto-padding
        automargin: false, // Prevent auto margin adjustment
        tickmode: "array" as const,
        tickvals: Array.from({ length: columns }, (_, i) => i + 1),
        ticktext: colLabels.map(String),
        tickangle: 0, // Keep labels horizontal
        tickfont: { size: columns > 24 ? 8 : 11 }, // Smaller font for high-density plates
        // Adjust domain based on legend position to prevent colorbar overlap
        domain: (() => {
          const pos = legendConfig?.position ?? "right";
          if (pos === "left") return [0.15, 1];
          if (pos === "right") return [0, 0.85];
          return [0, 1]; // top/bottom don't need horizontal adjustment
        })(),
      },
      yaxis: {
        title: {
          text: yTitle || "",
          font: {
            size: 16,
            color: "var(--black-300)",
            family: "Inter, sans-serif",
          },
          standoff: 15,
        },
        fixedrange: true,
        dtick: 1,
        range: [rows - 0.5, -0.5], // Reversed range: high to low puts row A at top
        automargin: false, // Prevent auto margin adjustment
        tickmode: "array" as const,
        tickvals: Array.from({ length: rows }, (_, i) => i),
        ticktext: rowLabels.map(String),
        tickfont: { size: rows > 16 ? 8 : 11 }, // Smaller font for high-density plates
      },
      paper_bgcolor: "var(--white-900)",
      plot_bgcolor: "var(--white-900)",
      font: {
        family: "Inter, sans-serif",
        color: "var(--grey-600)",
      },
      shapes: regionShapes,
    };

    const config = {
      responsive: true,
      displayModeBar: false,
      displaylogo: false,
    };

    Plotly.newPlot(currentRef, plotData, layout, config);

    // Always attach click handler - check onWellClickRef.current inside callback
    // This ensures handler is registered even if onWellClick is provided after initial render
    (currentRef as unknown as Plotly.PlotlyHTMLElement).on("plotly_click", (eventData: Plotly.PlotMouseEvent) => {
      if (!onWellClickRef.current) return;
      const point = eventData.points[0];
      if (point) {
        // Cast labels to handle union type
        const rowLabelsArr = rowLabels as (string | number)[];
        const colLabelsArr = colLabels as (string | number)[];
        const rowIdx = rowLabelsArr.indexOf(point.y as string | number);
        const colIdx = colLabelsArr.indexOf(point.x as string | number);
        if (rowIdx >= 0 && colIdx >= 0) {
          const wellId = `${rowLabelsArr[rowIdx]}${colLabelsArr[colIdx]}`;
          const wellIdUpper = String(wellId).toUpperCase();
          // Get all values and tooltipData for this well
          const allValues = allValuesMap.get(wellIdUpper);
          const tooltipData = tooltipDataMap.get(wellIdUpper);
          const wellData: WellData = {
            wellId,
            values: allValues,
            tooltipData,
          };
          onWellClickRef.current?.(wellData);
        }
      }
    });

    return () => {
      if (currentRef) {
        Plotly.purge(currentRef);
      }
    };
  }, [
    displayGrid,
    colLabels,
    rowLabels,
    effectiveColorScale,
    showColorBar,
    effectiveZMin,
    zMax,
    valueUnit,
    title,
    xTitle,
    yTitle,
    width,
    height,
    hoverText,
    precision,
    tooltipDataMap,
    allValuesMap,
    grid,
    visualizationMode,
    categoricalGrid,
    categoricalColorScale,
    uniqueTypes.length,
    catMax,
    regionShapes,
    rows,
    columns,
    legendConfig,
    markerShape,
  ]);

  // Render layer selector tabs
  const renderLayerSelector = () => {
    if (!effectiveLayers || effectiveLayers.length <= 1) {
      return null;
    }

    return (
      <div className="platemap-layer-selector">
        {effectiveLayers.map((layer) => {
          const isActive = activeLayer?.id === layer.id;
          return (
            <button
              key={layer.id}
              type="button"
              className={`platemap-layer-selector__button${isActive ? " platemap-layer-selector__button--active" : ""}`}
              onClick={() => {
                setActiveLayerId(layer.id);
                onLayerChange?.(layer.id);
              }}
            >
              {layer.name}
            </button>
          );
        })}
      </div>
    );
  };

  // Legend configuration with defaults
  const legendPosition = legendConfig?.position ?? "right";
  const legendFontSize = legendConfig?.fontSize ?? 12;
  const legendItemSpacing = legendConfig?.itemSpacing ?? 4;
  const legendSwatchSize = legendConfig?.swatchSize ?? 16;
  const legendTitle = legendConfig?.title;

  // Fixed width for categorical legend to prevent layout shift
  const legendWidth = 120;

  // Determine if legend is horizontal (top/bottom) or vertical (left/right)
  const isHorizontalLegend = legendPosition === "top" || legendPosition === "bottom";

  // Render legend (categorical types and/or regions)
  const renderLegend = () => {
    const hasCategoricalItems = visualizationMode === "categorical" && uniqueTypes.length > 0;
    const hasRegions = regions && regions.length > 0;

    if (!showLegend || (!hasCategoricalItems && !hasRegions)) {
      // Return empty placeholder to maintain consistent width (only for vertical legends)
      if (!isHorizontalLegend) {
        return <div className="platemap-legend-placeholder" style={{ width: legendWidth }} />;
      }
      return null;
    }

    // Build legend class names
    const legendClassNames = ["platemap-legend"];
    if (isHorizontalLegend) {
      legendClassNames.push("platemap-legend--horizontal");
    } else if (legendPosition === "left") {
      legendClassNames.push("platemap-legend--left");
    } else if (legendPosition === "right") {
      legendClassNames.push("platemap-legend--right");
    }

    // Dynamic styles that depend on props
    const legendStyle: React.CSSProperties = {
      gap: `${legendItemSpacing}px`,
      width: isHorizontalLegend ? undefined : legendWidth,
    };

    return (
      <div className={legendClassNames.join(" ")} style={legendStyle}>
        {legendTitle && (
          <div
            className={`platemap-legend__title${isHorizontalLegend ? " platemap-legend__title--horizontal" : ""}`}
            style={{ fontSize: `${legendFontSize}px` }}
          >
            {legendTitle}
          </div>
        )}
        {/* Categorical type items */}
        {hasCategoricalItems &&
          uniqueTypes.map((type) => (
            <div key={type} className="platemap-legend__item">
              <div
                className="platemap-legend__swatch"
                style={{
                  width: `${legendSwatchSize}px`,
                  height: `${legendSwatchSize}px`,
                  backgroundColor: categoryColors[type] || emptyWellColor,
                }}
              />
              <span
                className="platemap-legend__label platemap-legend__label--capitalize"
                style={{ fontSize: `${legendFontSize}px` }}
              >
                {type}
              </span>
            </div>
          ))}
        {/* Region items */}
        {hasRegions &&
          regions.map((region) => (
            <div key={region.id} className="platemap-legend__item">
              <div
                className="platemap-legend__swatch platemap-legend__swatch--region"
                style={{
                  width: `${legendSwatchSize}px`,
                  height: `${legendSwatchSize}px`,
                  backgroundColor: region.fillColor || "transparent",
                  border: `${region.borderWidth || 2}px solid ${region.borderColor || COLORS.regionBorder}`,
                }}
              />
              <span
                className="platemap-legend__label"
                style={{ fontSize: `${legendFontSize}px` }}
              >
                {region.name}
              </span>
            </div>
          ))}
      </div>
    );
  };

  // Build the plot content based on legend position
  const plotContent = <div ref={plotRef} className="platemap-plot" style={{ width, height }} />;
  const legendContent = renderLegend();

  const renderPlotWithLegend = () => {
    switch (legendPosition) {
      case "left":
        return (
          <div className="platemap-plot-wrapper platemap-plot-wrapper--vertical">
            {legendContent}
            {plotContent}
          </div>
        );
      case "top":
        return (
          <div className="platemap-plot-wrapper platemap-plot-wrapper--horizontal">
            {legendContent}
            {plotContent}
          </div>
        );
      case "bottom":
        return (
          <div className="platemap-plot-wrapper platemap-plot-wrapper--horizontal">
            {plotContent}
            {legendContent}
          </div>
        );
      case "right":
      default:
        return (
          <div className="platemap-plot-wrapper platemap-plot-wrapper--vertical">
            {plotContent}
            {legendContent}
          </div>
        );
    }
  };

  return (
    <div className="platemap-container" style={{ width: isHorizontalLegend ? undefined : width }}>
      {renderLayerSelector()}
      {renderPlotWithLegend()}
    </div>
  );
};

export { PlateMap };