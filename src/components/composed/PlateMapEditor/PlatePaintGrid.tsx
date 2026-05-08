import * as React from "react";

import { parsePos, pos, rectPositions, resolveDimensions, rowLabel } from "./wellGrid";

import type { PlateDimensions, PlateFormat, WellId, WellRecord } from "./types";

import { cn } from "@/lib/utils";

const DEFAULT_CELL = 34;
const DEFAULT_MIN_AUTO_CELL = 24;
const DEFAULT_MAX_AUTO_CELL = 72;
const DEFAULT_MAX_DENSE_AUTO_CELL = 36;
const LABEL_PAD = 26;
const LABEL_FONT_SIZE = 9;
const LABEL_TEXT_INSET = 4;
const LABEL_BASELINE_OFFSET = 3;
const WELL_INSET = 1;
const STROKE_DEFAULT = 1;
const STROKE_SELECTED = 3;

export interface PlatePaintGridProps<T extends WellRecord = WellRecord> {
  format: PlateFormat;
  rows?: number;
  columns?: number;
  values: Map<WellId, T>;
  selection: Set<WellId>;
  onSelectionChange: (next: Set<WellId>) => void;
  /** Returns the fill color for a given well record (or undefined if empty). */
  colorForWell: (well: T | undefined, wellId: WellId) => string;
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
  onWellHover?: (wellId: WellId | null) => void;
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
  borderColor: string;
  selectedBorderColor: string;
  selectedFillColor: string;
  selectedFillOpacity: number;
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
    borderColor,
    selectedBorderColor,
    selectedFillColor,
    selectedFillOpacity,
  } = args;
  const id = pos(row, column, dims.columns);
  const entry = values.get(id);
  const isSelected = selection.has(id) || dragPositions.has(id);
  const fill = isSelected ? selectedFillColor : colorForWell(entry, id);

  return (
    <rect
      key={id}
      x={LABEL_PAD + column * cellSize + WELL_INSET}
      y={LABEL_PAD + row * cellSize + WELL_INSET}
      width={cellSize - WELL_INSET * 2}
      height={cellSize - WELL_INSET * 2}
      fill={fill}
      fillOpacity={isSelected ? selectedFillOpacity : undefined}
      stroke={isSelected ? selectedBorderColor : borderColor}
      strokeWidth={isSelected ? STROKE_SELECTED : STROKE_DEFAULT}
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
  cellSize,
  autoScale = true,
  minCellSize = DEFAULT_MIN_AUTO_CELL,
  maxCellSize,
  borderColor = "var(--color-border, #e0e0e0)",
  selectedBorderColor = "var(--color-primary, #1976d2)",
  selectedFillColor = "var(--color-primary, #1976d2)",
  selectedFillOpacity = 0.18,
  onWellHover,
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

  const dragPositions = React.useMemo(() => {
    if (!drag) return new Set<WellId>();
    return new Set(rectPositions(drag.start.r, drag.start.c, drag.cur.r, drag.cur.c, dims.columns));
  }, [drag, dims.columns]);

  const width = dims.columns * resolvedCellSize + LABEL_PAD;
  const height = dims.rows * resolvedCellSize + LABEL_PAD;

  const colLabels = buildColumnLabels(dims.columns, resolvedCellSize);
  const rowLabels = buildRowLabels(dims.rows, resolvedCellSize);
  const wellCells = buildWellCells({
    dims,
    cellSize: resolvedCellSize,
    values,
    selection,
    dragPositions,
    colorForWell,
    borderColor,
    selectedBorderColor,
    selectedFillColor,
    selectedFillOpacity,
  });

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
        role="group"
        aria-label={`${dims.rows} row by ${dims.columns} column plate map. Drag to select wells.`}
      >
        {colLabels}
        {rowLabels}
        {wellCells}
      </svg>
    </div>
  );
}

export { parsePos };
