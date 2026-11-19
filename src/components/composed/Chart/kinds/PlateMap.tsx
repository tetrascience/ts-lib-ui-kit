import React, { useCallback, useMemo, useRef, useState } from "react";
import "@/components/charts/PlateMap/PlateMap.scss";

import type { PlateCell, PlateRegion } from "@/components/charts/PlateMap/plate-spec";
import type { PlateMapProps, LayerConfig, WellData } from "@/components/charts/PlateMap/types";
import type { Selected } from "@/vendor/ts-lib-viz/core";

import {
  PLATE_CONFIGS,
  DEFAULT_COLOR_SCALE,
  COLORS,
  DEFAULT_CATEGORY_COLORS,
  PLATEMAP_CONSTANTS,
  NAMED_COLORSCALES,
} from "@/components/charts/PlateMap/constants";
import { buildPlateSpec, colorBreaks, colorLabel, colorRampFrom } from "@/components/charts/PlateMap/plate-spec";
import { PLATE_FORMAT_96, PLATE_FORMAT_CUSTOM } from "@/components/charts/PlateMap/types";
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
} from "@/components/charts/PlateMap/utils";
import { VizChart } from "@/components/charts/viz/VizChart";
import { Button } from "@/components/ui/button";
import { palettesFor } from "@/vendor/ts-lib-viz/core";

// Re-export types and constants for external consumers
export * from "@/components/charts/PlateMap/types";
export { DEFAULT_CATEGORY_COLORS } from "@/components/charts/PlateMap/constants";

/** Colour-bar sizing: the sample count of the gradient, its thickness, and its length against the plot. */
const COLOUR_BAR_SAMPLES = 16;
const COLOUR_BAR_THICKNESS = 16;
const COLOUR_BAR_PLOT_RATIO = 0.8;
const COLOUR_LABEL_WIDTH = 72;

interface PlateColourBarProps {
  ramp: (t: number) => string;
  min: number;
  max: number;
  breaks: readonly number[];
  labels: Record<string, string>;
  title: string;
  /** Length of the bar in pixels, along its own direction. */
  length: number;
  vertical: boolean;
}

/**
 * The colour bar a heatmap plate reads by. Drawn here rather than by ts-lib-viz, which only
 * lays its colour bar out horizontally. Vertical, it runs beside the plate with its labels.
 */
function PlateColourBar({ ramp, min, max, breaks, labels, title, length, vertical }: PlateColourBarProps) {
  const span = max - min || 1;
  const gradient = Array.from({ length: COLOUR_BAR_SAMPLES + 1 }, (_, index) => {
    const t = index / COLOUR_BAR_SAMPLES;
    return `${ramp(t)} ${t * 100}%`;
  }).join(", ");
  const place = (value: number) => `${((value - min) / span) * 100}%`;
  const barSize = vertical
    ? { width: COLOUR_BAR_THICKNESS, height: length, background: `linear-gradient(to top, ${gradient})` }
    : { width: length, height: COLOUR_BAR_THICKNESS, background: `linear-gradient(to right, ${gradient})` };
  const labelFrame = vertical
    ? { position: "relative" as const, width: COLOUR_LABEL_WIDTH, height: length }
    : { position: "relative" as const, width: length, height: COLOUR_BAR_THICKNESS };
  return (
    <div
      className="platemap-colour-bar"
      style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", fontSize: 12 }}
    >
      {title && <div style={{ marginBottom: 4 }}>{title}</div>}
      <div style={{ display: "flex", flexDirection: vertical ? "row" : "column", gap: 6 }}>
        <div style={{ ...barSize, borderRadius: 2, flexShrink: 0 }} />
        <div style={labelFrame}>
          {breaks.map((value) => (
            <span
              key={value}
              style={
                vertical
                  ? {
                      position: "absolute",
                      left: 0,
                      bottom: place(value),
                      transform: "translateY(50%)",
                      whiteSpace: "nowrap",
                    }
                  : {
                      position: "absolute",
                      top: 0,
                      left: place(value),
                      transform: "translateX(-50%)",
                      whiteSpace: "nowrap",
                    }
              }
            >
              {labels[String(value)] ?? String(value)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Separates the lines of a well's hover text once they are shown as one tooltip. */
const TOOLTIP_SEPARATOR = " · ";

/** The layers auto-generated from wells that carry several values, or null when there are none. */
function autoLayers(data: PlateMapProps["data"], layerConfigs: LayerConfig[] | undefined): LayerConfig[] | null {
  // Check if data contains multi-value wells
  if (Array.isArray(data) && data.length > 0 && "wellId" in (data[0] as WellData)) {
    const wellDataArray = data as WellData[];
    if (hasMultiValueWells(wellDataArray)) {
      return extractLayers(wellDataArray, layerConfigs);
    }
  }

  return null;
}

/** A single plate: one layer at a time, or one fixed layer when embedded in a side-by-side row. */
type SinglePlateProps = PlateMapProps & {
  /** Whether the layer tabs are drawn. A side-by-side plate has its own layer, so it has none. */
  showLayerTabs?: boolean;
};

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
 */
const SinglePlate: React.FC<SinglePlateProps> = ({
  data,
  layerConfigs,
  initialLayerId,
  onLayerChange,
  showLayerTabs = true,
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
  const effectiveLayers = useMemo(() => autoLayers(data, layerConfigs), [data, layerConfigs]);

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
        valueUnit,
        legendPosition: "none",
        regions: plateRegions,
      }),
    [
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
      valueUnit,
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
    if (!showLayerTabs || !effectiveLayers || effectiveLayers.length <= 1) {
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
      if (!isHorizontalLegend && !showBar) {
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
  const showBar = showColorBar && visualizationMode !== "categorical";
  const barVertical = legendPosition === "left" || legendPosition === "right";
  const colourBar = showBar ? (
    <PlateColourBar
      ramp={colorRamp}
      min={zMin}
      max={zMax}
      breaks={colorBreaks(zMin, zMax)}
      labels={Object.fromEntries(colorBreaks(zMin, zMax).map((value) => [String(value), colorLabel(value, valueUnit)]))}
      title={legendTitle}
      length={barVertical ? Math.round(height * COLOUR_BAR_PLOT_RATIO) : Math.round(width * COLOUR_BAR_PLOT_RATIO)}
      vertical={barVertical}
    />
  ) : null;
  const legendContent = renderLegend();

  const renderPlotWithLegend = () => {
    switch (legendPosition) {
      case "left":
        return (
          <div className="platemap-plot-wrapper platemap-plot-wrapper--vertical">
            {colourBar}
            {legendContent}
            {plotContent}
          </div>
        );
      case "top":
        return (
          <div className="platemap-plot-wrapper platemap-plot-wrapper--horizontal">
            {colourBar}
            {legendContent}
            {plotContent}
          </div>
        );
      case "bottom":
        return (
          <div className="platemap-plot-wrapper platemap-plot-wrapper--horizontal">
            {plotContent}
            {legendContent}
            {colourBar}
          </div>
        );
      case "right":
      default:
        return (
          <div className="platemap-plot-wrapper platemap-plot-wrapper--vertical">
            {plotContent}
            {legendContent}
            {colourBar}
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

/**
 * A plate map. With `layerDisplay="sideBySide"` and several layers, it draws one plate per layer in a
 * row, sharing the title. Each plate is a full plate with its own colour scale, colour bar and labels.
 */
const PlateMapChart: React.FC<PlateMapProps> = (props) => {
  const { data, layerConfigs, layerDisplay = "tabs", title } = props;
  const channels = useMemo(
    () => (layerDisplay === "sideBySide" ? autoLayers(data, layerConfigs) : null),
    [layerDisplay, data, layerConfigs],
  );

  if (!channels || channels.length <= 1) {
    return <SinglePlate {...props} />;
  }

  return (
    <div className="platemap-channels">
      {title && <div className="platemap-channels__title">{title}</div>}
      <div className="platemap-channels__row">
        {channels.map((channel) => (
          <div key={channel.id} className="platemap-channel">
            <SinglePlate
              {...props}
              title={channel.name ?? channel.id}
              initialLayerId={channel.id}
              showLayerTabs={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export { PlateMapChart };
export type { PlateMapProps };
