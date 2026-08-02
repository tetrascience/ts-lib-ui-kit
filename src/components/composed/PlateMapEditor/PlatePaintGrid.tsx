import * as React from "react";

import { parsePos, pos, rectPositions, resolveDimensions, rowLabel } from "./wellGrid";

import type { PlateDimensions, PlateFormat, WellId, WellRecord } from "./types";

import { cn } from "@/lib/utils";

const DEFAULT_CELL = 34;
const DEFAULT_MIN_AUTO_CELL = 24;
const DEFAULT_MAX_AUTO_CELL = 72;
const DEFAULT_MAX_DENSE_AUTO_CELL = 36;
/**
 * Left/top gutter for the row and column labels.
 *
 * Sized for a two-character row label, not one. Rows past Z are labelled AA, AB, ... AF, and a
 * 1536-well plate has 32 of them — at a 16px font those are about 20px wide, which with the 9px
 * text inset ran past the left edge of the SVG and clipped the first character: "AA" rendered as
 * a stray stroke plus "A". A single-character plate now gets a slightly wider gutter, which is
 * cheaper than threading a per-plate value through the twenty-odd places this is used.
 */
const LABEL_PAD = 36;
const FRAME_PADDING_PX = 12;
const FRAME_BORDER_PX = 1;
const LABEL_FONT_SIZE = 16;
const LABEL_TEXT_INSET = 9;
const LABEL_BASELINE_OFFSET = 5;
const WELL_INSET = 1;
const STROKE_DEFAULT = 4;
const STROKE_SELECTED = 4;
const STROKE_HIGHLIGHT = 3;
const STROKE_FLASH = 5;
const FLASH_DURATION_MS = 650;
export const PLATE_MAP_EMPTY_WELL_FILL = "var(--surface-container)";
export const PLATE_MAP_CELL_BORDER = "var(--border)";

export type WellShape = "rect" | "circle";

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
  /** Geometric shape of each well. `"circle"` matches scientific plate visuals. Defaults to `"rect"`. */
  wellShape?: WellShape;
  /**
   * When true, wraps the grid in a card-like surface (rounded, bordered,
   * padded, soft shadow) so it reads as a physical plate. Pairs well with
   * `wellShape="circle"`.
   */
  framed?: boolean;
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
  /**
   * Well ids that should render with a highlight ring. Used for cross-component
   * hover sync (e.g. hovering a legend item to highlight matching wells).
   */
  highlightedWellIds?: ReadonlySet<WellId>;
  /** Stroke color for highlighted wells. Defaults to the kit primary blue. */
  highlightBorderColor?: string;
  onWellHover?: (wellId: WellId | null) => void;
  onWellDoubleClick?: (wellId: WellId) => void;
  /**
   * Optional render-prop invoked once per well. The returned node is placed
   * inside an absolutely-positioned cell on top of the SVG, sized to
   * `cellSize`. The wrapper layer is `pointer-events: none` so the SVG keeps
   * pointer interaction by default; consumers wiring drop targets are expected
   * to set `pointer-events: auto` on their own element while a drag is active.
   */
  wrapWell?: (wellId: WellId, cellSize: number) => React.ReactNode;
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
  selection: ReadonlySet<WellId>;
  dragPositions: ReadonlySet<WellId>;
  colorForWell: (well: T | undefined, wellId: WellId) => string;
  emptyWellFillColor: string | null;
  borderColor: string;
  selectedBorderColor: string;
  selectedFillColor: string;
  selectedFillOpacity: number;
  selectionFillMode: "selection" | "well";
  /** Filled during render with each well's unselected fill. See useSelectionPainter. */
  fillSink?: Map<WellId, string>;
  wellShape: WellShape;
  highlightedWellIds: ReadonlySet<WellId>;
  highlightBorderColor: string;
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
    colorForWell,
    emptyWellFillColor,
    wellShape,
    fillSink,
  } = args;
  const id = pos(row, column, dims.columns);
  const entry = values.get(id);
  // Selection is *not* read here. It is painted onto the committed DOM by
  // `useSelectionPainter` below, so that selecting a well does not rebuild every well. The fill
  // written here is the unselected one; the painter overrides it for selected wells and restores
  // it for deselected ones, using the identical values this would have produced.
  const fill = entry === undefined && emptyWellFillColor !== null ? emptyWellFillColor : colorForWell(entry, id);
  const fillOpacity = undefined;
  const isSelected = false;
  // What this well looks like unselected, so the painter can restore it on deselect without
  // recomputing `colorForWell` for all 1536.
  fillSink?.set(id, fill);

  if (wellShape === "circle") {
    const cx = LABEL_PAD + column * cellSize + cellSize / 2;
    const cy = LABEL_PAD + row * cellSize + cellSize / 2;
    const r = cellSize / 2 - WELL_INSET;
    return (
      <circle
        key={id}
        cx={cx}
        cy={cy}
        r={r}
        fill={fill}
        fillOpacity={fillOpacity}
        stroke="none"
        data-well={id}
        data-selected={isSelected ? "true" : undefined}
      />
    );
  }

  return (
    <rect
      key={id}
      x={LABEL_PAD + column * cellSize}
      y={LABEL_PAD + row * cellSize}
      width={cellSize}
      height={cellSize}
      fill={fill}
      fillOpacity={fillOpacity}
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
  const {
    dims,
    cellSize,
    selection,
    dragPositions,
    selectedBorderColor,
    flashWellId,
    flashWellKey,
    wellShape,
    highlightedWellIds,
    highlightBorderColor,
  } = args;
  const id = pos(row, column, dims.columns);
  const isSelected = selection.has(id) || dragPositions.has(id);
  const isFlashing = flashWellId === id;
  const isHighlighted = !isSelected && highlightedWellIds.has(id);

  if (!isSelected && !isFlashing && !isHighlighted) return null;

  const x = LABEL_PAD + column * cellSize + WELL_INSET;
  const y = LABEL_PAD + row * cellSize + WELL_INSET;
  const size = cellSize - WELL_INSET * 2;
  const cx = LABEL_PAD + column * cellSize + cellSize / 2;
  const cy = LABEL_PAD + row * cellSize + cellSize / 2;
  const r = cellSize / 2 - WELL_INSET;
  const isCircle = wellShape === "circle";

  type WellShapeProps = Record<string, string | number | undefined>;
  const shapeProps: WellShapeProps = isCircle
    ? { cx, cy, r }
    : { x, y, width: size, height: size };

  const renderShape = (
    extraProps: Record<string, string | number | undefined>,
    children?: React.ReactNode,
    elementKey?: string | number,
  ): React.ReactNode => {
    const props = { ...shapeProps, ...extraProps, pointerEvents: "none" as const };
    return isCircle ? (
      <circle key={elementKey} {...props}>
        {children}
      </circle>
    ) : (
      <rect key={elementKey} {...props}>
        {children}
      </rect>
    );
  };

  const flashAnimations = (
    <>
      <animate attributeName="fill-opacity" values="0.24;0.1;0" dur={`${FLASH_DURATION_MS}ms`} fill="freeze" />
      <animate attributeName="stroke-opacity" values="0.92;0.42;0" dur={`${FLASH_DURATION_MS}ms`} fill="freeze" />
      <animate
        attributeName="stroke-width"
        values={`${STROKE_FLASH};${STROKE_SELECTED}`}
        dur={`${FLASH_DURATION_MS}ms`}
        fill="freeze"
      />
    </>
  );

  return (
    <g key={`overlay-${id}`}>
      {isSelected
        ? renderShape({
            fill: "none",
            stroke: selectedBorderColor,
            strokeWidth: STROKE_SELECTED,
            "data-well-selection": id,
          })
        : null}
      {isHighlighted
        ? renderShape({
            fill: "none",
            stroke: highlightBorderColor,
            strokeWidth: STROKE_HIGHLIGHT,
            "data-well-highlight": id,
          })
        : null}
      {isFlashing
        ? renderShape(
            {
              fill: selectedBorderColor,
              fillOpacity: 0.24,
              stroke: selectedBorderColor,
              strokeOpacity: 0.92,
              strokeWidth: STROKE_FLASH,
              "data-well-flash": id,
            },
            flashAnimations,
            `${id}-${flashWellKey}`,
          )
        : null}
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
/**
 * Paint the selection onto the committed SVG instead of re-rendering it.
 *
 * Selecting a well *replaces* its fill, so the highlight cannot be a translucent layer drawn on
 * top — that would blend with the fill underneath and the grid would not look the same. Which
 * left only two options: rebuild all 1536 wells on every click, or set the same attributes React
 * would have set, on just the wells that changed. This is the second.
 *
 * A layout effect, so the paint lands in the same frame as the commit and no unselected flash is
 * ever visible. It re-applies after any data-driven re-render too — React rewrites `fill` from the
 * data on those, which would otherwise wipe the highlight — which is why `cellsKey` is a
 * dependency.
 *
 * `baseFills` carries what each well should look like unselected, captured during the render that
 * produced the DOM, so deselecting restores exactly the value React would have written.
 */
function useSelectionPainter({
  svgRef,
  selection,
  dragPositions,
  baseFills,
  values,
  selectedFillColor,
  selectedFillOpacity,
  selectionFillMode,
  cellsKey,
}: {
  svgRef: React.RefObject<SVGSVGElement | null>;
  selection: ReadonlySet<WellId>;
  dragPositions: ReadonlySet<WellId>;
  baseFills: Map<WellId, string>;
  values: Map<WellId, unknown>;
  selectedFillColor: string;
  selectedFillOpacity: number;
  selectionFillMode: "selection" | "well";
  cellsKey: unknown;
}) {
  const paintedRef = React.useRef<Set<WellId>>(new Set());

  React.useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const shouldPaint = (id: WellId) => selection.has(id) || dragPositions.has(id);
    const next = new Set<WellId>();
    for (const id of selection) next.add(id);
    for (const id of dragPositions) next.add(id);

    const apply = (id: WellId, selected: boolean) => {
      const node = svg.querySelector<SVGElement>(`[data-well="${id}"]`);
      if (!node) return;
      // Mirrors what buildWellCell used to compute, so the pixels are the same either way.
      const usesWellFill = selected && selectionFillMode === "well" && values.get(id) !== undefined;
      if (selected && !usesWellFill) {
        node.setAttribute("fill", selectedFillColor);
        node.setAttribute("fill-opacity", String(selectedFillOpacity));
      } else {
        const base = baseFills.get(id);
        if (base !== undefined) node.setAttribute("fill", base);
        node.removeAttribute("fill-opacity");
      }
      if (selected) node.setAttribute("data-selected", "true");
      else node.removeAttribute("data-selected");
    };

    // Only the difference: wells that gained or lost the highlight.
    for (const id of paintedRef.current) if (!shouldPaint(id)) apply(id, false);
    for (const id of next) if (!paintedRef.current.has(id)) apply(id, true);

    // After a data-driven re-render React has rewritten every fill, so the still-selected wells
    // need repainting even though the selection itself did not change.
    if (paintedRef.current !== next) for (const id of next) apply(id, true);

    paintedRef.current = next;
  }, [
    svgRef,
    selection,
    dragPositions,
    baseFills,
    values,
    selectedFillColor,
    selectedFillOpacity,
    selectionFillMode,
    cellsKey,
  ]);
}

/** Stable stand-in for an absent `highlightedWellIds`; a fresh `new Set()` would break memoisation. */
const EMPTY_WELL_ID_SET: ReadonlySet<WellId> = new Set<WellId>();

export function PlatePaintGrid<T extends WellRecord = WellRecord>({
  format,
  rows,
  columns,
  values,
  selection,
  onSelectionChange,
  colorForWell,
  emptyWellFillColor = PLATE_MAP_EMPTY_WELL_FILL,
  wellShape = "rect",
  framed = false,
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
  highlightedWellIds,
  highlightBorderColor = "var(--color-primary)",
  onWellHover,
  onWellDoubleClick,
  wrapWell,
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
    const frameAdjust = framed ? (FRAME_PADDING_PX + FRAME_BORDER_PX) * 2 : 0;
    const fitSize = Math.floor((containerWidth - LABEL_PAD - frameAdjust) / dims.columns);
    return Math.max(minCellSize, Math.min(autoMaxCellSize, fitSize));
  }, [autoScale, cellSize, containerWidth, dims.columns, framed, maxCellSize, minCellSize]);

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

  /**
   * The well `onWellHover` was last told about.
   *
   * A ref, not state: this exists to *suppress* renders, so storing it in state would defeat it.
   */
  const lastHoveredRef = React.useRef<WellId | null>(null);

  const handleMove = (e: React.MouseEvent) => {
    const cell = cellAt(e);
    if (cell && onWellHover) {
      const wellId = pos(cell.r, cell.c, dims.columns);
      // Only when the well actually changes. `mousemove` fires continuously — dozens of events
      // while the cursor sits inside one well — and every call pushed hover state up to a
      // consumer, so the whole grid re-rendered for a cursor that had not left the well it was
      // already in.
      if (lastHoveredRef.current !== wellId) {
        lastHoveredRef.current = wellId;
        onWellHover(wellId);
      }
    }
    if (!drag || !cell) return;
    // Same idea for the drag rectangle: only re-render when the far corner moves to a new cell.
    if (drag.cur.r === cell.r && drag.cur.c === cell.c) return;
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
    // Forget the last well, or re-entering the grid on the same one would report nothing.
    lastHoveredRef.current = null;
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

  /**
   * Everything drawn inside the SVG is memoised on what it actually depends on.
   *
   * A 1536-well plate is 1536 SVG elements, and none of them depends on hover: hover state lives
   * in the consumer, which re-renders this component with an identical `wellRenderArgs`. Without
   * memoisation every hover rebuilt all of them, so dragging the cursor across a 48-column plate
   * reconciled roughly 48 x 1536 elements and the tab stopped responding.
   *
   * Note for callers: `colorForWell` is in the dependency list, so an inline arrow passed as that
   * prop defeats this. Wrap it in `useCallback`.
   */
  const resolvedHighlightedWellIds: ReadonlySet<WellId> = highlightedWellIds ?? EMPTY_WELL_ID_SET;

  const colLabels = React.useMemo(
    () => buildColumnLabels(dims.columns, resolvedCellSize),
    [dims.columns, resolvedCellSize],
  );
  const rowLabels = React.useMemo(
    () => buildRowLabels(dims.rows, resolvedCellSize),
    [dims.rows, resolvedCellSize],
  );
  const gridLines = React.useMemo(
    () => (wellShape === "circle" ? [] : buildGridLines(dims, resolvedCellSize, borderColor)),
    [wellShape, dims, resolvedCellSize, borderColor],
  );

  /**
   * Each well's unselected fill, rebuilt alongside the cells. Read by the selection painter.
   */
  const baseFills = React.useMemo(() => new Map<WellId, string>(), [
    // Same inputs as the cells below: a new map whenever the cells are rebuilt.
    dims,
    resolvedCellSize,
    values,
    colorForWell,
    emptyWellFillColor,
    wellShape,
  ]);

  const wellRenderArgs = React.useMemo(
    () => ({
      dims,
      cellSize: resolvedCellSize,
      values,
      // Selection is intentionally absent. It is applied to the committed DOM by
      // useSelectionPainter, so a click repaints the wells that changed rather than rebuilding
      // all 1536 — which measured ~220ms a click at a 1536-well plate.
      selection: EMPTY_WELL_ID_SET,
      dragPositions: EMPTY_WELL_ID_SET,
      fillSink: baseFills,
      colorForWell,
      emptyWellFillColor,
      borderColor,
      selectedBorderColor,
      selectedFillColor,
      selectedFillOpacity,
      selectionFillMode,
      wellShape,
      highlightedWellIds: resolvedHighlightedWellIds,
      highlightBorderColor,
      flashWellId,
      flashWellKey,
    }),
    [
      dims,
      resolvedCellSize,
      values,
      baseFills,
      colorForWell,
      emptyWellFillColor,
      borderColor,
      selectedBorderColor,
      selectedFillColor,
      selectedFillOpacity,
      selectionFillMode,
      wellShape,
      resolvedHighlightedWellIds,
      highlightBorderColor,
      flashWellId,
      flashWellKey,
    ],
  );

  const wellCells = React.useMemo(() => buildWellCells(wellRenderArgs), [wellRenderArgs]);

  // Applies the highlight to the committed DOM. Keyed on `wellCells` so a data-driven rebuild,
  // which rewrites every fill from the data, gets the selection painted back on.
  useSelectionPainter({
    svgRef,
    selection,
    dragPositions,
    baseFills,
    values,
    selectedFillColor,
    selectedFillOpacity,
    selectionFillMode,
    cellsKey: wellCells,
  });
  const wellOverlays = React.useMemo(() => buildWellOverlays(wellRenderArgs), [wellRenderArgs]);

  const overlayCells = React.useMemo<React.ReactNode[]>(() => {
    if (!wrapWell) return [];
    const cells: React.ReactNode[] = [];
    for (let r = 0; r < dims.rows; r++) {
      for (let c = 0; c < dims.columns; c++) {
        const id = pos(r, c, dims.columns);
        cells.push(
          <div
            key={id}
            style={{
              position: "absolute",
              left: LABEL_PAD + c * resolvedCellSize,
              top: LABEL_PAD + r * resolvedCellSize,
              width: resolvedCellSize,
              height: resolvedCellSize,
            }}
            data-well-id={id}
          >
            {wrapWell(id, resolvedCellSize)}
          </div>,
        );
      }
    }
    return cells;
  }, [wrapWell, dims.rows, dims.columns, resolvedCellSize]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full select-none", className)}
      data-slot="plate-paint-grid"
    >
      <div
        className={cn(
          "relative inline-block",
          framed && "rounded-xl border bg-card p-3 shadow-sm",
        )}
        data-slot="plate-paint-grid-frame"
      >
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
        {wrapWell ? (
          <div
            className="pointer-events-none absolute"
            style={{
              top: framed ? FRAME_PADDING_PX : 0,
              left: framed ? FRAME_PADDING_PX : 0,
              width,
              height,
            }}
            aria-hidden
            data-slot="plate-well-overlay"
          >
            {overlayCells}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export { parsePos };
