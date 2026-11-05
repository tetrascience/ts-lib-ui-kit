import React, { useCallback, useMemo, useRef, useState } from "react";

import "./PlateMap.scss";
import { useChartDeprecationWarning } from "../viz/deprecation";
import { VizChart } from "../viz/VizChart";

import {
  PLATE_CONFIGS,
  DEFAULT_COLOR_SCALE,
  COLORS,
  DEFAULT_CATEGORY_COLORS,
  PLATEMAP_CONSTANTS,
  NAMED_COLORSCALES,
} from "./constants";
import { buildPlateSpec, colorRampFrom } from "./plate-spec";
import { PLATE_FORMAT_96, PLATE_FORMAT_CUSTOM } from "./types";
import {
  generateRowLabels,
  generateColumnLabels,
  wellDataToGrid,
  calculateValueRange,
  hasMultiValueWells,
  extractLayers,
  parseRegionWells,
  buildWellHoverText,
  calculateMarkerSize,
} from "./utils";

import type { PlateCell, PlateRegion } from "./plate-spec";
import type { PlateMapProps, LayerConfig, WellData } from "./types";
import type { Selected } from "@/vendor/ts-lib-viz/core";

// Re-export types and constants for external consumers
export * from "./types";
export { DEFAULT_CATEGORY_COLORS } from "./constants";

import { Button } from "@/components/ui/button";
import { palettesFor } from "@/vendor/ts-lib-viz/core";

/** Separates the lines of a well's hover text once they are shown as one tooltip. */
const TOOLTIP_SEPARATOR = " · ";

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
 * - Control region outlines
 * - Configurable color scales, tooltips, and click interactions
 * - Support for WellData arrays with multi-layer visualization
 *
 * **Data Format:**
 * - **WellData array**: `[{ wellId: "A1", values: { RFU: 100 }, tooltipData: {...} }, ...]`
 *
 * **ts-lib-viz differences from the Plotly version:**
 * - The x axis title is drawn under the plate, not above it.
 * - Region fills are not drawn: `regions[].fillColor` is accepted and ignored. Outlines are drawn.
 * - `legendConfig.position` places the colour bar on that edge, and `showColorBar={false}` hides it.
 *   The category legend and layer tabs stay React-rendered and follow the same position.
 * - Wells draw as points, so `markerShape` picks `circle` or `square` only.
 *
 * @deprecated Plotly-backed. Removed in 2.0. Use `@tetrascience-npm/ts-lib-viz` instead; see MIGRATION.md.
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
  useChartDeprecationWarning("PlateMap");
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

  // Diameter (px) of each well marker, as the Plotly layout sized it
  const markerSize = useMemo(
    () => calculateMarkerSize(width, height, rows, columns, markerShape, !!title, !!yTitle),
    [width, height, rows, columns, markerShape, title, yTitle],
  );

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
    [customCategoryColors, activeLayer?.categoryColors],
  );

  // Convert data to grid format - memoize to prevent re-render issues
  // Use activeLayer.id to extract the appropriate value from multi-value wells
  const activeLayerId_ = activeLayer?.id;
  const { grid, categoriesGrid, allValuesMap, tooltipDataMap } = useMemo(() => {
    let resultGrid: (number | null)[][];
    let resultCategories: (string | null)[][] = Array.from({ length: rows }, () => Array(columns).fill(null));
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
        Array.from({ length: columns }, () => Math.random() * PLATEMAP_CONSTANTS.MAX_RANDOM_VALUE),
      );
    }

    return {
      grid: resultGrid,
      categoriesGrid: resultCategories,
      allValuesMap: resultAllValues,
      tooltipDataMap: resultTooltipData,
    };
  }, [data, rows, columns, activeLayerId_]);

  // Generate labels - use custom labels if provided, otherwise auto-generate.
  // Memoized so a re-render doesn't change their identity and needlessly rebuild the chart.
  const rowLabels = useMemo(() => customYLabels ?? generateRowLabels(rows), [customYLabels, rows]);
  const colLabels = useMemo(() => customXLabels ?? generateColumnLabels(columns), [customXLabels, columns]);

  // Calculate value range if not provided
  const range = calculateValueRange(grid);
  const zMin = valueMin ?? range.min;
  const zMax = valueMax ?? range.max;

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

  // Build custom hover text matrix - shows ALL values regardless of active layer.
  // Memoized so its identity is stable across re-renders.
  const hoverText = useMemo<string[][]>(
    () =>
      grid.map((row, rowIdx) =>
        row.map((val, colIdx) => {
          const wellId = `${rowLabels[rowIdx]}${colLabels[colIdx]}`;
          const wellIdUpper = String(wellId).toUpperCase();
          return buildWellHoverText({
            wellId,
            value: val,
            allValues: allValuesMap.get(wellIdUpper),
            tooltipExtra: tooltipDataMap.get(wellIdUpper),
            activeLayerId: activeLayer?.id,
            layerConfigMap,
            precision,
            valueUnit,
          });
        }),
      ),
    [grid, rowLabels, colLabels, allValuesMap, tooltipDataMap, activeLayer?.id, layerConfigMap, precision, valueUnit],
  );

  // Categories drawn in categorical mode, in legend order. A well with no category is "empty".
  const uniqueTypes = useMemo(() => {
    if (visualizationMode !== "categorical") return [];
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
    return [...typesSet].sort();
  }, [visualizationMode, categoriesGrid]);

  // One record per well, which is what the chart draws and a click reports.
  const cells = useMemo<PlateCell[]>(
    () =>
      grid.flatMap((row, rowIdx) =>
        row.map((value, colIdx) => ({
          wellId: `${rowLabels[rowIdx]}${colLabels[colIdx]}`,
          x: colIdx + 1,
          y: rowIdx,
          value,
          category: categoriesGrid[rowIdx]?.[colIdx] ?? "empty",
          // The first line of hover text names the well, which the tooltip title already does.
          details: hoverText[rowIdx][colIdx].split("<br>").slice(1).join(TOOLTIP_SEPARATOR),
        })),
      ),
    [grid, categoriesGrid, hoverText, rowLabels, colLabels],
  );

  // Region outlines, with their wells resolved to row and column bounds
  const plateRegions = useMemo<PlateRegion[]>(
    () =>
      (regions ?? []).flatMap((region) => {
        const bounds = parseRegionWells(region.wells, rowLabels, colLabels);
        if (!bounds) return [];
        return [{ bounds, color: region.borderColor || COLORS.textDark, width: region.borderWidth ?? 2 }];
      }),
    [regions, rowLabels, colLabels],
  );

  // The heatmap colours wells by a ramp over the stops of the colour scale
  const colorRamp = useMemo(() => {
    const stops = typeof colorScale === "string" ? (NAMED_COLORSCALES[colorScale] ?? DEFAULT_COLOR_SCALE) : colorScale;
    return colorRampFrom(stops);
  }, [colorScale]);
  const palettes = useMemo(() => ({ ...palettesFor(), sequential: colorRamp }), [colorRamp]);

  const legendTitle = legendConfig?.title ?? valueUnit.trim();

  const spec = useMemo(
    () =>
      buildPlateSpec({
        mode: visualizationMode === "categorical" ? "categorical" : "heatmap",
        cells,
        rows,
        columns,
        rowLabels,
        colLabels,
        title,
        xTitle,
        yTitle,
        markerShape,
        markerRadius: markerSize / 2,
        emptyWellColor,
        categoryColors,
        categories: uniqueTypes,
        colorRamp,
        zMin,
        zMax,
        legendTitle,
        legendPosition: showColorBar ? (legendConfig?.position ?? "right") : "none",
        regions: plateRegions,
      }),
    [
      showColorBar,
      legendConfig?.position,
      visualizationMode,
      cells,
      rows,
      columns,
      rowLabels,
      colLabels,
      title,
      xTitle,
      yTitle,
      markerShape,
      markerSize,
      emptyWellColor,
      categoryColors,
      uniqueTypes,
      colorRamp,
      zMin,
      zMax,
      legendTitle,
      plateRegions,
    ],
  );

  const handleSelect = useCallback(
    (selected: Selected | null) => {
      const callback = onWellClickRef.current;
      if (!callback || !selected?.datum) return;
      const wellId = String(selected.datum.wellId);
      const wellIdUpper = wellId.toUpperCase();
      callback({ wellId, values: allValuesMap.get(wellIdUpper), tooltipData: tooltipDataMap.get(wellIdUpper) });
    },
    [allValuesMap, tooltipDataMap],
  );

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
            <Button
              key={layer.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setActiveLayerId(layer.id);
                onLayerChange?.(layer.id);
              }}
            >
              {layer.name}
            </Button>
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
  const legendTitleText = legendConfig?.title;

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
        {legendTitleText && (
          <div
            className={`platemap-legend__title${isHorizontalLegend ? " platemap-legend__title--horizontal" : ""}`}
            style={{ fontSize: `${legendFontSize}px` }}
          >
            {legendTitleText}
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
              <span className="platemap-legend__label" style={{ fontSize: `${legendFontSize}px` }}>
                {region.name}
              </span>
            </div>
          ))}
      </div>
    );
  };

  // Build the plot content based on legend position
  const plotContent = (
    <div className="relative">
      <div className="platemap-plot" style={{ width, height }}>
        <VizChart
          spec={spec}
          data={cells}
          palettes={palettes}
          width={width}
          height={height}
          keyField="wellId"
          onSelect={handleSelect}
        />
      </div>
    </div>
  );
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
