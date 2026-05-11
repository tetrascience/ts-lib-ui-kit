import * as React from "react";

import { parsePos, pos, rectPositions, resolveDimensions, rowLabel } from "./wellGrid";

import type { PlateDimensions, PlateFormat, WellId, WellRecord } from "./types";

import { cn } from "@/lib/utils";

const DEFAULT_CELL = 34;
const DEFAULT_MIN_AUTO_CELL = 24;
const DEFAULT_MAX_AUTO_CELL = 72;
const DEFAULT_MAX_DENSE_AUTO_CELL = 36;
const LABEL_PAD = 26;
const LABEL_FONT_SIZE = 16;
const LABEL_TEXT_INSET = 9;
const LABEL_BASELINE_OFFSET = 5;
const WELL_INSET = 1;
const STROKE_DEFAULT = 4;
const STROKE_SELECTED = 4;
const STROKE_FLASH = 5;
const FLASH_DURATION_MS = 650;
export const PLATE_MAP_EMPTY_WELL_FILL = "var(--surface-container)";
export const PLATE_MAP_CELL_BORDER = "var(--border)";

export interface PlatePaintGridProps<T extends WellRecord = WellRecord> {
  format: PlateFormat;
  rows?: number;
  columns?: number;
  values: Map<WellId, T>;
  selection: Set<WellId>;
  onSelectionChange: (next: Set<WellId>) => void;
  /** Returns the fill color for a given well record (or undefined if empty). */
  colorForWell: (well: T | undefined, wellId: WellId) => string;
  /** Fill color for empty wells. Pass `null` to delegate empty wells to `colorForWell`. */
  emptyWellFillColor?: string | null;
  /** Pixel size of each well cell. Defaults to 34 when fixed. */
  cellSize?: number;
  /** Resize wells to fill available width when `cellSize` is not fixed. */
  autoScale?: boolean;
  minCellSize?: number;
  /** Defaults to 72 for 96-well style plates and 36 for denser plates. */
  maxCellSize?: number;
  /** Stroke color for non-selected wells. Defaults to a light border. */
  borderColor?: string;
  /** Stroke color for selected wells. Defaults to the kit primary blue. */
  selectedBorderColor?: string;
  /** Fill color for selected wells. Defaults to the kit primary blue. */
  selectedFillColor?: string;
  /** Selected fill opacity. */
  selectedFillOpacity?: number;
  /** Whether selected wells use the selection fill or keep their assigned well color. */
  selectionFillMode?: "selection" | "well";
  /** Well id that should briefly flash, usually after a double-click assignment. */
  flashWellId?: WellId;
  /** Changing this value restarts the flash animation for the same well. */
  flashWellKey?: number;
  onWellHover?: (wellId: WellId | null) => void;
  onWellDoubleClick?: (wellId: WellId) => void;
  className?: string;
}

type DragMode = "replace" | "add" | "remove";

interface DragState {
  start: { r: number; c: number };
  cur: { r: number; c: number };
  mode: DragMode;
}

function buildColumnLabels(columns: number, cellSize: number): React.ReactNode[] {
  const labels: React.ReactNode[] = [];
  for (let c = 0; c < columns; c++) {
    labels.push(
      <text
        key={`c${c}`}
        x={LABEL_PAD + c * cellSize + cellSize / 2}
        y={LABEL_PAD / 2}
        textAnchor="middle"
        fontSize={LABEL_FONT_SIZE}
        className="fill-muted-foreground"
      >
        {c + 1}
      </text>,
    );
  }
  return labels;
}

function buildRowLabels(rows: number, cellSize: number): React.ReactNode[] {
  const labels: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    labels.push(
      <text
        key={`r${r}`}
        x={LABEL_PAD - LABEL_TEXT_INSET}
        y={LABEL_PAD + r * cellSize + cellSize / 2 + LABEL_BASELINE_OFFSET}
        textAnchor="end"
        fontSize={LABEL_FONT_SIZE}
        className="fill-muted-foreground"
      >
        {rowLabel(r)}
      </text>,
    );
  }
  return labels;
}

interface BuildWellCellsArgs<T extends WellRecord> {
  dims: PlateDimensions;
  cellSize: number;
  values: Map<WellId, T>;
  selection: Set<WellId>;
  dragPositions: Set<WellId>;
  colorForWell: (well: T | undefined, wellId: WellId) => string;
  emptyWellFillColor: string | null;
  borderColor: string;
  selectedBorderColor: string;
  selectedFillColor: string;
  selectedFillOpacity: number;
  selectionFillMode: "selection" | "well";
  flashWellId?: WellId;
  flashWellKey?: number;
}

function buildWellCell<T extends WellRecord>(
  args: BuildWellCellsArgs<T>,
  row: number,
  column: number,
): React.ReactNode {
  const {
    dims,
    cellSize,
    values,
    selection,
    dragPositions,
    colorForWell,
    emptyWellFillColor,
    selectedFillColor,
    selectedFillOpacity,
    selectionFillMode,
  } = args;
  const id = pos(row, column, dims.columns);
  const entry = values.get(id);
  const isSelected = selection.has(id) || dragPositions.has(id);
  const wellFill = entry === undefined && emptyWellFillColor !== null ? emptyWellFillColor : colorForWell(entry, id);
  const usesWellFill = isSelected && selectionFillMode === "well" && entry !== undefined;
  const usesSelectionFill = isSelected && !usesWellFill;
  const fill = usesSelectionFill ? selectedFillColor : wellFill;

  return (
    <rect
      key={id}
      x={LABEL_PAD + column * cellSize}
      y={LABEL_PAD + row * cellSize}
      width={cellSize}
      height={cellSize}
      fill={fill}
      fillOpacity={usesSelectionFill ? selectedFillOpacity : undefined}
      stroke="none"
      data-well={id}
      data-selected={isSelected ? "true" : undefined}
    />
  );
}

function buildWellCells<T extends WellRecord>({ dims, ...args }: BuildWellCellsArgs<T>): React.ReactNode[] {
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < dims.rows; r++) {
    for (let c = 0; c < dims.columns; c++) {
      cells.push(buildWellCell({ dims, ...args }, r, c));
    }
  }
  return cells;
}

function buildGridLines(dims: PlateDimensions, cellSize: number, borderColor: string): React.ReactNode[] {
  const lines: React.ReactNode[] = [];
  const left = LABEL_PAD;
  const top = LABEL_PAD;
  const right = LABEL_PAD + dims.columns * cellSize;
  const bottom = LABEL_PAD + dims.rows * cellSize;

  for (let c = 0; c <= dims.columns; c++) {
    const x = LABEL_PAD + c * cellSize;
    lines.push(
      <line
        key={`grid-col-${c}`}
        x1={x}
        y1={top}
        x2={x}
        y2={bottom}
        stroke={borderColor}
        strokeWidth={STROKE_DEFAULT}
        vectorEffect="non-scaling-stroke"
        shapeRendering="crispEdges"
        pointerEvents="none"
        data-plate-grid-line={`column-${c}`}
      />,
    );
  }

  for (let r = 0; r <= dims.rows; r++) {
    const y = LABEL_PAD + r * cellSize;
    lines.push(
      <line
        key={`grid-row-${r}`}
        x1={left}
        y1={y}
        x2={right}
        y2={y}
        stroke={borderColor}
        strokeWidth={STROKE_DEFAULT}
        vectorEffect="non-scaling-stroke"
        shapeRendering="crispEdges"
        pointerEvents="none"
        data-plate-grid-line={`row-${r}`}
      />,
    );
  }

  return lines;
}

function buildWellOverlay<T extends WellRecord>(
  args: BuildWellCellsArgs<T>,
  row: number,
  column: number,
): React.ReactNode {
  const { dims, cellSize, selection, dragPositions, selectedBorderColor, flashWellId, flashWellKey } = args;
  const id = pos(row, column, dims.columns);
  const isSelected = selection.has(id) || dragPositions.has(id);
  const isFlashing = flashWellId === id;

  if (!isSelected && !isFlashing) return null;

  const x = LABEL_PAD + column * cellSize + WELL_INSET;
  const y = LABEL_PAD + row * cellSize + WELL_INSET;
  const size = cellSize - WELL_INSET * 2;

  return (
    <g key={`overlay-${id}`}>
      {isSelected ? (
        <rect
          x={x}
          y={y}
          width={size}
          height={size}
          fill="none"
          stroke={selectedBorderColor}
          strokeWidth={STROKE_SELECTED}
          pointerEvents="none"
          data-well-selection={id}
        />
      ) : null}
      {isFlashing ? (
        <rect
          key={`${id}-${flashWellKey}`}
          x={x}
          y={y}
          width={size}
          height={size}
          fill={selectedBorderColor}
          fillOpacity={0.24}
          stroke={selectedBorderColor}
          strokeOpacity={0.92}
          strokeWidth={STROKE_FLASH}
          pointerEvents="none"
          data-well-flash={id}
        >
          <animate attributeName="fill-opacity" values="0.24;0.1;0" dur={`${FLASH_DURATION_MS}ms`} fill="freeze" />
          <animate attributeName="stroke-opacity" values="0.92;0.42;0" dur={`${FLASH_DURATION_MS}ms`} fill="freeze" />
          <animate
            attributeName="stroke-width"
            values={`${STROKE_FLASH};${STROKE_SELECTED}`}
            dur={`${FLASH_DURATION_MS}ms`}
            fill="freeze"
          />
        </rect>
      ) : null}
    </g>
  );
}

function buildWellOverlays<T extends WellRecord>({ dims, ...args }: BuildWellCellsArgs<T>): React.ReactNode[] {
  const overlays: React.ReactNode[] = [];
  for (let r = 0; r < dims.rows; r++) {
    for (let c = 0; c < dims.columns; c++) {
      const overlay = buildWellOverlay({ dims, ...args }, r, c);
      if (overlay) overlays.push(overlay);
    }
  }
  return overlays;
}

/**
 * Interactive plate grid with drag-rectangle selection.
 * - Click & drag: replace selection
 * - Shift + drag: add to selection
 * - Alt + drag: remove from selection
 */
export function PlatePaintGrid<T extends WellRecord = WellRecord>({
  format,
  rows,
  columns,
  values,
  selection,
  onSelectionChange,
  colorForWell,
  emptyWellFillColor = PLATE_MAP_EMPTY_WELL_FILL,
  cellSize,
  autoScale = true,
  minCellSize = DEFAULT_MIN_AUTO_CELL,
  maxCellSize,
  borderColor = PLATE_MAP_CELL_BORDER,
  selectedBorderColor = "var(--color-primary)",
  selectedFillColor = "var(--color-primary)",
  selectedFillOpacity = 0.18,
  selectionFillMode = "selection",
  flashWellId,
  flashWellKey,
  onWellHover,
  onWellDoubleClick,
  className,
}: PlatePaintGridProps<T>) {
  const dims = resolveDimensions(format, rows, columns);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [drag, setDrag] = React.useState<DragState | null>(null);
  const [containerWidth, setContainerWidth] = React.useState<number>();

  React.useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node || !autoScale || cellSize !== undefined) return;

    const update = () => setContainerWidth(node.clientWidth);
    update();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [autoScale, cellSize]);

  const resolvedCellSize = React.useMemo(() => {
    if (!autoScale || cellSize !== undefined || !containerWidth) {
      return cellSize ?? DEFAULT_CELL;
    }
    const autoMaxCellSize = maxCellSize ?? (dims.columns > 12 ? DEFAULT_MAX_DENSE_AUTO_CELL : DEFAULT_MAX_AUTO_CELL);
    const fitSize = Math.floor((containerWidth - LABEL_PAD) / dims.columns);
    return Math.max(minCellSize, Math.min(autoMaxCellSize, fitSize));
  }, [autoScale, cellSize, containerWidth, dims.columns, maxCellSize, minCellSize]);

  const cellAt = React.useCallback(
    (evt: React.MouseEvent): { r: number; c: number } | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      const x = evt.clientX - rect.left - LABEL_PAD;
      const y = evt.clientY - rect.top - LABEL_PAD;
      const c = Math.floor(x / resolvedCellSize);
      const r = Math.floor(y / resolvedCellSize);
      if (r < 0 || r >= dims.rows || c < 0 || c >= dims.columns) return null;
      return { r, c };
    },
    [resolvedCellSize, dims.rows, dims.columns],
  );

  const handleDown = (e: React.MouseEvent) => {
    const cell = cellAt(e);
    if (!cell) return;
    const mode: DragMode = e.shiftKey ? "add" : e.altKey ? "remove" : "replace";
    setDrag({ start: cell, cur: cell, mode });
  };

  const handleMove = (e: React.MouseEvent) => {
    const cell = cellAt(e);
    if (cell && onWellHover) {
      onWellHover(pos(cell.r, cell.c, dims.columns));
    }
    if (!drag || !cell) return;
    setDrag({ ...drag, cur: cell });
  };

  const commitDrag = React.useCallback(() => {
    if (!drag) return;
    const positions = rectPositions(drag.start.r, drag.start.c, drag.cur.r, drag.cur.c, dims.columns);
    let next: Set<WellId>;
    if (drag.mode === "replace") {
      next = new Set(positions);
    } else if (drag.mode === "add") {
      next = new Set(selection);
      positions.forEach((p) => next.add(p));
    } else {
      next = new Set(selection);
      positions.forEach((p) => next.delete(p));
    }
    onSelectionChange(next);
    setDrag(null);
  }, [drag, dims.columns, onSelectionChange, selection]);

  const handleUp = () => commitDrag();
  const handleLeave = () => {
    commitDrag();
    onWellHover?.(null);
  };
  const handleDoubleClick = (e: React.MouseEvent) => {
    const cell = cellAt(e);
    if (!cell) return;
    onWellDoubleClick?.(pos(cell.r, cell.c, dims.columns));
  };

  const dragPositions = React.useMemo(() => {
    if (!drag) return new Set<WellId>();
    return new Set(rectPositions(drag.start.r, drag.start.c, drag.cur.r, drag.cur.c, dims.columns));
  }, [drag, dims.columns]);

  // Right and bottom edge strokes sit on the plate boundary; give the SVG room so they are not clipped.
  const edgeStrokePadding = STROKE_DEFAULT;
  const width = dims.columns * resolvedCellSize + LABEL_PAD + edgeStrokePadding;
  const height = dims.rows * resolvedCellSize + LABEL_PAD + edgeStrokePadding;

  const colLabels = buildColumnLabels(dims.columns, resolvedCellSize);
  const rowLabels = buildRowLabels(dims.rows, resolvedCellSize);
  const wellRenderArgs = {
    dims,
    cellSize: resolvedCellSize,
    values,
    selection,
    dragPositions,
    colorForWell,
    emptyWellFillColor,
    borderColor,
    selectedBorderColor,
    selectedFillColor,
    selectedFillOpacity,
    selectionFillMode,
    flashWellId,
    flashWellKey,
  };
  const wellCells = buildWellCells(wellRenderArgs);
  const gridLines = buildGridLines(dims, resolvedCellSize, borderColor);
  const wellOverlays = buildWellOverlays(wellRenderArgs);

  return (
    <div ref={containerRef} className={cn("overflow-auto select-none", className)} data-slot="plate-paint-grid">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="block cursor-crosshair"
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onMouseLeave={handleLeave}
        onDoubleClick={handleDoubleClick}
        role="group"
        aria-label={`${dims.rows} row by ${dims.columns} column plate map. Drag to select wells.`}
      >
        {colLabels}
        {rowLabels}
        {wellCells}
        {gridLines}
        {wellOverlays}
      </svg>
    </div>
  );
}

export { parsePos };
