import { plot } from "@tetrascience-npm/ts-lib-viz/core";
import { Viz } from "@tetrascience-npm/ts-lib-viz/react";
import { useMemo, useRef } from "react";

import { categoricalPalettes } from "../viz/VizChart";

import { DEFAULT_MARKER_SIZE, DEFAULT_SIZE_RANGE } from "./constants";
import { applySelection, calculateRange, downsampleData, getSelectionMode, getUniqueCategories } from "./utils";

import type { AxisConfig, MarkerShape, ScatterPlotInteractiveProps, ScatterPoint, SelectionMode } from "./types";
import type { Brushed, ChartSpec, Palettes, PointShape, Selected } from "@tetrascience-npm/ts-lib-viz/core";

import { CHART_COLORS } from "@/utils/colors";

/**
 * Deprecated: Plotly-backed. Removed in 2.0. Use `@tetrascience-npm/ts-lib-viz` instead; see MIGRATION.md.
 *
 * Drawn through ts-lib-viz. Three props have no ts-lib-viz equivalent and are
 * not carried over: `tooltip.content` and `tooltip.enabled` (the tooltip always
 * shows `tooltip.fields`), `showColorBar` (a continuous color always shows its
 * legend), and `colorMapping.colorScale` (the default sequential ramp is used).
 * A box or lasso is one gesture, so when both are enabled the lasso wins.
 */

/** ts-lib-viz draws four glyphs. The other Plotly-era marker shapes fall back to a circle. */
const POINT_SHAPES: Partial<Record<MarkerShape, PointShape>> = {
  circle: "circle",
  square: "square",
  diamond: "diamond",
  "triangle-up": "triangle",
  "triangle-down": "triangle",
};

/** Columns the chart writes itself. A tooltip field with one of these names reads the chart column. */
const RESERVED_COLUMNS = new Set(["key", "x", "y", "label", "color", "shape", "size"]);

/** A metadata value as a table cell. Viz reads strings, numbers, booleans and null. */
const cell = (value: unknown): string | number | boolean | null => {
  if (value == null) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  return String(value);
};

/** The ink a selected point is outlined in. It draws behind the point, so the point reads larger. */
const SELECTED_GROWTH = 6;

const axisScale = (axis?: AxisConfig) => ({
  title: axis?.title,
  transform: axis?.scale === "log" ? ("log10" as const) : undefined,
  limits: axis?.range,
});

const ScatterPlotInteractive: React.FC<ScatterPlotInteractiveProps> = ({
  data,
  title,
  xAxis,
  yAxis,
  colorMapping,
  shapeMapping,
  sizeMapping,
  tooltip,
  enableClickSelection = false,
  enableBoxSelection = false,
  enableLassoSelection = false,
  selectedIds,
  onSelectionChange,
  onPointClick,
  downsampling,
  width,
  height,
  className,
}) => {
  const modifiers = useRef({ shiftKey: false, ctrlKey: false, metaKey: false });
  const pointerEvent = useRef<MouseEvent | null>(null);

  const sampled = useMemo(
    () => (downsampling?.enabled ? downsampleData(data, downsampling) : data),
    [data, downsampling],
  );

  const categories = useMemo(
    () =>
      colorMapping?.type === "categorical" && colorMapping.field
        ? getUniqueCategories(sampled, colorMapping.field)
        : [],
    [sampled, colorMapping],
  );
  const categoryColors = useMemo(
    () =>
      categories.map(
        (category, index) => colorMapping?.categoryColors?.[category] ?? CHART_COLORS[index % CHART_COLORS.length],
      ),
    [categories, colorMapping],
  );
  const palettes: Palettes | undefined = useMemo(
    () => (categoryColors.length > 0 ? categoricalPalettes(categoryColors) : undefined),
    [categoryColors],
  );

  const colorField = colorMapping?.field;
  const colorIsContinuous = colorMapping?.type === "continuous";
  // Not reached for a static color: its one value is the layer's constant.
  const shapeField = shapeMapping?.type === "categorical" ? shapeMapping.field : undefined;
  const sizeField = sizeMapping?.type === "continuous" ? sizeMapping.field : undefined;

  const tooltipFields = useMemo(() => tooltip?.fields ?? ["label"], [tooltip?.fields]);
  const rows = useMemo(
    () =>
      sampled.map((point: ScatterPoint) => ({
        key: String(point.id),
        x: point.x,
        y: point.y,
        label: point.label ?? String(point.id),
        color: colorField
          ? colorIsContinuous
            ? Number(point.metadata?.[colorField])
            : String(point.metadata?.[colorField] ?? "")
          : null,
        shape: shapeField ? String(point.metadata?.[shapeField] ?? "") : null,
        size: sizeField ? Number(point.metadata?.[sizeField]) : null,
        ...Object.fromEntries(
          tooltipFields
            .filter((field) => !RESERVED_COLUMNS.has(field))
            .map((field) => [field, cell(point.metadata?.[field])]),
        ),
      })),
    [sampled, colorField, colorIsContinuous, shapeField, sizeField, tooltipFields],
  );

  const selectedRows = useMemo(() => {
    if (!selectedIds || selectedIds.size === 0) return [];
    const keys = new Set([...selectedIds].map(String));
    return rows.filter((row) => keys.has(row.key));
  }, [rows, selectedIds]);

  const spec = useMemo<ChartSpec>(() => {
    const base = colorMapping?.type === "static" ? (colorMapping.value ?? CHART_COLORS[0]) : undefined;
    const shape = shapeMapping?.type === "static" ? POINT_SHAPES[shapeMapping.value ?? "circle"] : undefined;
    const size = sizeMapping?.type === "static" ? (sizeMapping.value ?? DEFAULT_MARKER_SIZE) : undefined;
    const aes = {
      x: "x",
      y: "y",
      ...(colorField ? { color: "color" } : {}),
      ...(shapeField ? { shape: "shape" } : {}),
      ...(sizeField ? { size: "size" } : {}),
    };
    const sizeRange = sizeMapping?.sizeRange ?? DEFAULT_SIZE_RANGE;
    const selectedSize = (size ?? DEFAULT_MARKER_SIZE) + SELECTED_GROWTH;
    let builder = plot(rows, aes);
    if (selectedRows.length > 0) {
      builder = builder.point({
        data: selectedRows,
        size: selectedSize,
        color: base,
        shape,
        ...(sizeField ? { sizeRange: [sizeRange[0] + SELECTED_GROWTH, sizeRange[1] + SELECTED_GROWTH] } : {}),
      });
    }
    builder = builder.point({ color: base, shape, size, ...(sizeField ? { sizeRange } : {}) });
    return builder
      .tooltip(tooltip?.fields ?? ["label"])
      .labs({ headline: title })
      .scales({
        x: axisScale(xAxis),
        y: axisScale(yAxis),
        ...(colorIsContinuous && colorField
          ? {
              color: {
                title: colorField,
                limits: [
                  colorMapping?.min ?? calculateRange(sampled, colorField).min,
                  colorMapping?.max ?? calculateRange(sampled, colorField).max,
                ],
              },
            }
          : {}),
      })
      .spec();
  }, [
    rows,
    selectedRows,
    colorMapping,
    shapeMapping,
    sizeMapping,
    colorField,
    colorIsContinuous,
    shapeField,
    sizeField,
    tooltip,
    title,
    xAxis,
    yAxis,
    sampled,
  ]);

  const brush = enableLassoSelection ? "lasso" : enableBoxSelection ? "box" : undefined;

  // Viz reports records by their string key. Map them back to the caller's ids
  // so a numeric id stays a number in onSelectionChange.
  const idByKey = useMemo(() => new Map(sampled.map((point) => [String(point.id), point.id])), [sampled]);

  const emit = (keys: string[], mode: SelectionMode) => {
    if (!onSelectionChange) return;
    const ids = keys.map((key) => idByKey.get(key) ?? key);
    const next = applySelection(selectedIds ?? new Set(), new Set(ids), mode);
    onSelectionChange(next, mode);
  };

  const onSelect = (hit: Selected | null) => {
    if (!enableClickSelection) return;
    // A click on empty plot area clears the selection, as Viz reports it.
    if (!hit) {
      emit([], "replace");
      return;
    }
    const mode = getSelectionMode(modifiers.current);
    emit(hit.keys, mode);
    const point = sampled.find((candidate) => String(candidate.id) === hit.keys[0]);
    if (point && onPointClick && pointerEvent.current) onPointClick(point, pointerEvent.current);
  };

  const onBrush = (brushed: Brushed | null) => {
    if (!brushed) return;
    emit(brushed.keys, getSelectionMode(modifiers.current));
  };

  return (
    <div
      className={className}
      style={{ width: width ?? "100%", height: height ?? "100%" }}
      onPointerDownCapture={(event) => {
        modifiers.current = event;
        pointerEvent.current = event.nativeEvent;
      }}
    >
      <Viz
        spec={{ ...spec, ...(width === undefined ? {} : { width }), ...(height === undefined ? {} : { height }) }}
        data={rows}
        keyField="key"
        palettes={palettes}
        brush={brush}
        onBrush={onBrush}
        onSelect={onSelect}
      />
    </div>
  );
};

export { ScatterPlotInteractive };
