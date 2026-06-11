import * as React from "react";

import { PlatePaintGrid } from "./PlatePaintGrid";
import { allPositions, resolveDimensions } from "./wellGrid";

import type { WellShape } from "./PlatePaintGrid";
import type { PlateFormat, PlateMapGroupOption, WellField, WellId, WellRecord } from "./types";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function formatHoverFields<T extends WellRecord>(entry: T, fields: WellField<T>[]): string[] {
  return fields
    .map((f) => {
      const v = entry[f.key];
      if (v === undefined || v === null || v === "") return null;
      if (f.kind === "select") {
        const opt = (f.options ?? []).find((o) => o.value === v);
        return opt?.label ?? String(v);
      }
      if (f.kind === "multiselect") {
        const arr = Array.isArray(v) ? (v as string[]) : [];
        if (arr.length === 0) return null;
        return arr.map((item) => (f.options ?? []).find((o) => o.value === item)?.label ?? item).join(", ");
      }
      if (f.kind === "boolean") {
        return v ? f.label : null;
      }
      return String(v);
    })
    .filter(Boolean) as string[];
}

export interface PlateMapGridProps<T extends WellRecord = WellRecord> {
  format: PlateFormat;
  rows?: number;
  columns?: number;
  values: Map<WellId, T>;
  selection: Set<WellId>;
  onSelectionChange: (next: Set<WellId>) => void;
  /** Resolves the SVG fill color for a well. */
  colorForWell: (well: T | undefined, wellId: WellId) => string;
  /** Field schema used to build the default hover summary string. */
  fields?: WellField<T>[];
  /** Custom hover summary for the strip above the grid. */
  renderHoverSummary?: (well: T | undefined, wellId: WellId) => React.ReactNode;
  /** Fires whenever the currently hovered well changes (null on leave). */
  onHoveredWellChange?: (wellId: WellId | null) => void;
  /**
   * Controlled hovered well id. When provided, the panel reflects this value
   * instead of tracking hover internally — useful for syncing the hover
   * summary with external state (e.g. resetting it on a plate switch).
   */
  hoveredWellId?: WellId | null;
  /** Controls rendered to the left of the built-in select/deselect links. */
  toolbar?: React.ReactNode;
  /** Hide the built-in "Select all" / "Deselect all" links. */
  hideSelectionControls?: boolean;
  selectAllLabel?: string;
  deselectAllLabel?: string;
  /** Fill color for empty wells. Pass `null` to delegate empty wells to `colorForWell`. */
  emptyWellFillColor?: string | null;
  /** Well shape forwarded to `PlatePaintGrid`. Defaults to `"rect"`. */
  wellShape?: WellShape;
  /** When true, wraps the grid in a card-like plate frame (rounded + border + soft shadow). */
  framed?: boolean;
  /** Render-prop that places a node inside each absolute-positioned well cell. */
  wrapWell?: (wellId: WellId, cellSize: number) => React.ReactNode;
  /** Wells to highlight (e.g. when hovering a legend item externally). */
  highlightedWellIds?: ReadonlySet<WellId>;
  onWellDoubleClick?: (wellId: WellId) => void;
  selectionFillMode?: "selection" | "well";
  flashWellId?: WellId;
  flashWellKey?: number;
  /** Fixed well size. When unset, the grid grows with the available width. */
  cellSize?: number;
  autoScale?: boolean;
  minCellSize?: number;
  maxCellSize?: number;
  /** Optional grouped well shortcuts rendered under the grid. */
  groups?: PlateMapGroupOption[];
  activeGroupId?: string;
  onGroupClick?: (group: PlateMapGroupOption) => void;
  className?: string;
}

/**
 * Card-agnostic plate grid panel. Renders the selection toolbar, hover
 * summary, the interactive `PlatePaintGrid`, and optional group shortcuts —
 * and owns the ephemeral hover state internally. The plate title, plate
 * selector, and actions menu are intentionally NOT part of this panel; compose
 * `PlateMapPlateSelector` and `PlateMapActionsMenu` around it for full layout
 * freedom.
 */
export function PlateMapGrid<T extends WellRecord = WellRecord>({
  format,
  rows,
  columns,
  values,
  selection,
  onSelectionChange,
  colorForWell,
  fields,
  renderHoverSummary,
  onHoveredWellChange,
  hoveredWellId,
  toolbar,
  hideSelectionControls = false,
  selectAllLabel = "Select all",
  deselectAllLabel = "Deselect all",
  emptyWellFillColor,
  wellShape,
  framed,
  wrapWell,
  highlightedWellIds,
  onWellDoubleClick,
  selectionFillMode,
  flashWellId,
  flashWellKey,
  cellSize,
  autoScale,
  minCellSize,
  maxCellSize,
  groups,
  activeGroupId,
  onGroupClick,
  className,
}: PlateMapGridProps<T>) {
  const dims = resolveDimensions(format, rows, columns);
  const [internalHoverPos, setInternalHoverPos] = React.useState<WellId | null>(null);
  const isHoverControlled = hoveredWellId !== undefined;
  const hoverPos = isHoverControlled ? hoveredWellId : internalHoverPos;

  const selectAll = () => onSelectionChange(new Set(allPositions(dims)));
  const deselectAll = () => onSelectionChange(new Set());

  const hoverEntry = hoverPos ? values.get(hoverPos) : undefined;
  const hoverFields = hoverEntry && fields ? formatHoverFields(hoverEntry, fields) : [];
  const hoverSummary = hoverPos
    ? (renderHoverSummary?.(hoverEntry, hoverPos) ?? [hoverPos, ...hoverFields].join(" • "))
    : " ";

  const showSelectionControls = !hideSelectionControls;
  const showToolbarRow = !!toolbar || showSelectionControls;

  return (
    <div data-slot="plate-map-grid" className={cn("flex flex-col gap-1.5", className)}>
      {showToolbarRow ? (
        <div className="flex flex-wrap items-center justify-start gap-3">
          {toolbar}
          {showSelectionControls ? (
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                className="font-medium text-primary underline-offset-2 hover:text-primary/80 hover:underline"
                onClick={selectAll}
              >
                {selectAllLabel}
              </button>
              <span className="text-muted-foreground/60">·</span>
              <button
                type="button"
                className="font-medium text-primary underline-offset-2 hover:text-primary/80 hover:underline"
                onClick={deselectAll}
              >
                {deselectAllLabel}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="h-5 text-xs text-muted-foreground">{hoverSummary}</div>
      <PlatePaintGrid
        format={format}
        rows={rows}
        columns={columns}
        values={values}
        selection={selection}
        onSelectionChange={onSelectionChange}
        colorForWell={colorForWell}
        emptyWellFillColor={emptyWellFillColor}
        wellShape={wellShape}
        framed={framed}
        wrapWell={wrapWell}
        highlightedWellIds={highlightedWellIds}
        onWellHover={(wellId) => {
          if (!isHoverControlled) setInternalHoverPos(wellId);
          onHoveredWellChange?.(wellId);
        }}
        onWellDoubleClick={onWellDoubleClick}
        selectionFillMode={selectionFillMode}
        flashWellId={flashWellId}
        flashWellKey={flashWellKey}
        cellSize={cellSize}
        autoScale={autoScale}
        minCellSize={minCellSize}
        maxCellSize={maxCellSize}
      />
      {groups && groups.length > 0 ? (
        <>
          <Separator className="mt-2" />
          <div className="flex max-h-28 flex-wrap gap-3 overflow-y-auto pt-1">
            {groups.map((group) => {
              const isActive = group.id === activeGroupId;
              const count = group.count ?? group.wellIds?.length;
              return (
                <button
                  key={group.id}
                  type="button"
                  disabled={group.disabled}
                  onClick={() => onGroupClick?.(group)}
                  className={cn(
                    "flex w-16 flex-col items-center gap-1 rounded-md px-1 py-1 text-center text-xs transition-colors",
                    "text-muted-foreground hover:bg-muted/60",
                    isActive && "bg-muted text-foreground ring-1 ring-primary/40",
                    group.disabled && "pointer-events-none opacity-50",
                  )}
                  title={group.label}
                >
                  <span
                    className="size-7 rounded-full border"
                    style={{
                      backgroundColor: group.color,
                      borderColor: group.borderColor,
                    }}
                    aria-hidden
                  />
                  <span className="w-full truncate text-foreground">{group.label}</span>
                  {count === undefined ? null : (
                    <span className="text-[0.7rem] leading-none text-muted-foreground">{count} wells</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
