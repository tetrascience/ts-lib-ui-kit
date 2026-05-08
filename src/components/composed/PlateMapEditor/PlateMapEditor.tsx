import * as React from "react";

import { PlateMapActionsMenu } from "./PlateMapActionsMenu";
import { PlatePaintGrid } from "./PlatePaintGrid";
import { resolveDimensions, allPositions } from "./wellGrid";
import { WellManifestTable } from "./WellManifestTable";
import { WellMetadataForm } from "./WellMetadataForm";

import type { PlateMapActionsMenuProps } from "./PlateMapActionsMenu";
import type { PlateFormat, PlateMapGroupOption, WellColumn, WellField, WellId, WellRecord } from "./types";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface PlateMapEditorProps<T extends WellRecord = WellRecord> extends Omit<
  PlateMapActionsMenuProps,
  "hasEntries" | "className"
> {
  format: PlateFormat;
  rows?: number;
  columns?: number;
  values: Map<WellId, T>;
  onChange: (next: Map<WellId, T>) => void;
  selection: Set<WellId>;
  onSelectionChange: (next: Set<WellId>) => void;

  fields: WellField<T>[];
  tableColumns: WellColumn<T>[];

  /** Resolves the SVG fill color for a well. */
  colorForWell: (well: T | undefined, wellId: WellId) => string;
  /** Builds an empty record when a well is freshly created. */
  emptyEntry: (wellId: WellId) => T;
  /**
   * Merges the staged form record onto an existing well record on Apply.
   * Defaults to a shallow merge (form keys overwrite existing keys when set).
   */
  mergeOnApply?: (existing: T | undefined, staged: Partial<T>, wellId: WellId) => T;
  /** Filter for the manifest's "hide empty" mode. */
  isPopulated?: (row: T) => boolean;

  /** Optional header title (e.g. plate set name). */
  title?: string;
  /** Optional badges shown in the header next to the title. */
  badges?: React.ReactNode;
  /** Optional banner (e.g. import/error alert) shown above the layout. */
  banner?: React.ReactNode;
  /** Legend block rendered under the form column. */
  legend?: React.ReactNode;
  /** Form helper slot rendered between fields and the action row. */
  formExtras?: React.ReactNode;
  /** Footer actions (e.g. Save, Back). */
  footer?: React.ReactNode;
  /** Title for the plate grid panel. */
  plateTitle?: React.ReactNode;
  /** Optional controls shown next to the built-in actions menu. */
  plateToolbar?: React.ReactNode;
  /** Optional grouped well shortcuts rendered under the grid. */
  groups?: PlateMapGroupOption[];
  activeGroupId?: string;
  onGroupClick?: (group: PlateMapGroupOption) => void;
  /** Custom hover summary for the strip above the grid. */
  renderHoverSummary?: (well: T | undefined, wellId: WellId) => React.ReactNode;
  /** Fixed well size. When unset, the grid grows with the available width. */
  cellSize?: number;
  autoScaleGrid?: boolean;
  minCellSize?: number;
  maxCellSize?: number;

  className?: string;
}

function defaultMerge<T extends WellRecord>(existing: T | undefined, staged: Partial<T>): T {
  return { ...(existing ?? ({} as T)), ...staged };
}

export function PlateMapEditor<T extends WellRecord = WellRecord>({
  format,
  rows,
  columns,
  values,
  onChange,
  selection,
  onSelectionChange,
  fields,
  tableColumns,
  colorForWell,
  emptyEntry,
  mergeOnApply,
  isPopulated,
  title,
  badges,
  banner,
  legend,
  formExtras,
  footer,
  plateTitle = "Plate",
  plateToolbar,
  groups,
  activeGroupId,
  onGroupClick,
  renderHoverSummary,
  cellSize,
  autoScaleGrid,
  minCellSize,
  maxCellSize,
  className,
  templates,
  templateId,
  onTemplateChange,
  onClearTemplate,
  onImportCsv,
  onExportCsv,
  onImportTemplate,
  onExportTemplate,
  csvAccept,
  templateAccept,
  label,
  align,
  side,
  importTemplateLabel,
  exportTemplateLabel,
  importCsvLabel,
  exportCsvLabel,
  clearLabel,
}: PlateMapEditorProps<T>) {
  const dims = resolveDimensions(format, rows, columns);
  const [staged, setStaged] = React.useState<Partial<T>>({});
  const [hoverPos, setHoverPos] = React.useState<WellId | null>(null);

  const merge = mergeOnApply ?? defaultMerge<T>;

  const applyStagedToSelection = () => {
    if (selection.size === 0) return;
    const next = new Map(values);
    selection.forEach((wellId) => {
      const existing = next.get(wellId);
      const merged = merge(existing, staged, wellId);
      next.set(wellId, merged);
    });
    onChange(next);
  };

  const clearWells = () => {
    if (selection.size === 0) return;
    const next = new Map(values);
    selection.forEach((wellId) => next.delete(wellId));
    onChange(next);
  };

  const selectAll = () => {
    onSelectionChange(new Set(allPositions(dims)));
  };
  const deselectAll = () => onSelectionChange(new Set());

  const hoverEntry = hoverPos ? values.get(hoverPos) : undefined;

  const hoverFields = hoverEntry
    ? (fields
        .map((f) => {
          const v = hoverEntry[f.key];
          if (v === undefined || v === null || v === "") return null;
          if (f.kind === "select") {
            const opt = (f.options ?? []).find((o) => o.value === v);
            return opt?.label ?? String(v);
          }
          return String(v);
        })
        .filter(Boolean) as string[])
    : [];

  const hoverSummary = hoverPos
    ? (renderHoverSummary?.(hoverEntry, hoverPos) ?? [hoverPos, ...hoverFields].join(" • "))
    : " ";

  return (
    <div data-slot="plate-map-editor" className={cn("flex flex-col gap-4", className)}>
      {(title || badges) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {title ? <h2 className="text-lg font-semibold">{title}</h2> : <span />}
          {badges ? <div className="flex flex-wrap gap-2">{badges}</div> : null}
        </div>
      )}

      {banner}

      <div className="flex flex-wrap gap-3 xl:flex-nowrap">
        {/* Form column */}
        <Card className="flex w-full max-w-[360px] min-w-[300px] basis-[360px] flex-col" size="sm">
          <CardContent className="flex h-full flex-1 flex-col gap-3">
            <WellMetadataForm
              fields={fields}
              value={staged}
              onChange={setStaged}
              selectionSize={selection.size}
              onApply={applyStagedToSelection}
              onClear={clearWells}
              extras={formExtras}
            />
            {legend ? (
              <>
                <Separator />
                {legend}
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Plate column */}
        <Card className="flex min-w-[360px] flex-1 flex-col" size="sm">
          <CardHeader className="border-b">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <PlateMapActionsMenu
                templates={templates}
                templateId={templateId}
                onTemplateChange={onTemplateChange}
                onClearTemplate={onClearTemplate}
                hasEntries={values.size > 0}
                onImportCsv={onImportCsv}
                onExportCsv={onExportCsv}
                onImportTemplate={onImportTemplate}
                onExportTemplate={onExportTemplate}
                csvAccept={csvAccept}
                templateAccept={templateAccept}
                label={label}
                align={align}
                side={side}
                importTemplateLabel={importTemplateLabel}
                exportTemplateLabel={exportTemplateLabel}
                importCsvLabel={importCsvLabel}
                exportCsvLabel={exportCsvLabel}
                clearLabel={clearLabel}
              />
              <CardTitle className="min-w-0">{plateTitle}</CardTitle>
            </div>
            <CardAction className="flex flex-wrap items-center gap-2">
              {plateToolbar}
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  className="font-medium text-blue-700 underline-offset-2 hover:text-blue-800 hover:underline"
                  onClick={selectAll}
                >
                  Select all
                </button>
                <span className="text-muted-foreground/60">·</span>
                <button
                  type="button"
                  className="font-medium text-blue-700 underline-offset-2 hover:text-blue-800 hover:underline"
                  onClick={deselectAll}
                >
                  Deselect all
                </button>
              </div>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5">
            <div className="h-5 text-xs text-muted-foreground">{hoverSummary}</div>
            <PlatePaintGrid
              format={format}
              rows={rows}
              columns={columns}
              values={values}
              selection={selection}
              onSelectionChange={onSelectionChange}
              colorForWell={colorForWell}
              onWellHover={setHoverPos}
              cellSize={cellSize}
              autoScale={autoScaleGrid}
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
          </CardContent>
        </Card>
      </div>

      <Card size="sm">
        <CardHeader className="border-b">
          <CardTitle>Sample manifest</CardTitle>
        </CardHeader>
        <CardContent>
          <WellManifestTable
            values={values}
            onChange={onChange}
            columns={tableColumns}
            fields={fields}
            selection={selection}
            onSelectionChange={onSelectionChange}
            emptyEntry={emptyEntry}
            isPopulated={isPopulated}
          />
        </CardContent>
      </Card>

      {footer ? <div className="flex justify-end gap-2 pt-2">{footer}</div> : null}
    </div>
  );
}

export { Badge as PlateBadge };
