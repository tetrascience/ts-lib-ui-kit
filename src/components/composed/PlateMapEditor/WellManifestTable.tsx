import { ArrowDownToLine } from "lucide-react";
import * as React from "react";

import type { WellColumn, WellField, WellId, WellRecord } from "./types";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const PAGE_SIZE_SMALL = 25;
const PAGE_SIZE_MEDIUM = 50;
const PAGE_SIZE_LARGE = 100;
const DEFAULT_PAGE_SIZE = PAGE_SIZE_SMALL;
const DEFAULT_PAGE_SIZE_OPTIONS: number[] = [PAGE_SIZE_SMALL, PAGE_SIZE_MEDIUM, PAGE_SIZE_LARGE];
const CELL_CONTROL_CLASS =
  "border-transparent bg-transparent px-0 shadow-none hover:border-transparent focus-visible:border-transparent focus-visible:ring-0";

function hasFillValue(value: unknown): boolean {
  return value !== undefined && value !== null && value !== "";
}

export interface WellManifestTableProps<T extends WellRecord = WellRecord> {
  values: Map<WellId, T>;
  columns: WellColumn<T>[];
  /**
   * Field schema. If a column has `field` matching a `select`-kind field, a
   * Select cell renders automatically with that field's options.
   */
  fields?: WellField<T>[];
  selection?: Set<WellId>;
  onSelectionChange?: (next: Set<WellId>) => void;
  onChange: (next: Map<WellId, T>) => void;
  /** Builds an empty record for a freshly-created row. */
  emptyEntry: (id: WellId) => T;
  /** Filter that controls which empty rows surface. Defaults to `false`. */
  isPopulated?: (row: T) => boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  /** Adds a column header action that copies the first non-empty value downward. */
  enableFillDown?: boolean;
  className?: string;
}

export function WellManifestTable<T extends WellRecord = WellRecord>({
  values,
  columns,
  fields,
  selection,
  onSelectionChange,
  onChange,
  emptyEntry,
  isPopulated,
  pageSize: initialPageSize = DEFAULT_PAGE_SIZE,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  enableFillDown = true,
  className,
}: WellManifestTableProps<T>) {
  const [showAll, setShowAll] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  React.useEffect(() => {
    setPage(0);
  }, [showAll]);

  const fieldByKey = React.useMemo(() => {
    const m = new Map<string, WellField<T>>();
    (fields ?? []).forEach((f) => m.set(f.key, f));
    return m;
  }, [fields]);

  const rows = React.useMemo(() => {
    const arr = [...values.entries()].map(([id, row]) => ({
      id,
      row,
    }));
    let filtered = arr;
    if (!showAll && isPopulated) {
      filtered = arr.filter((r) => isPopulated(r.row));
    }
    if (selection && selection.size > 0) {
      const have = new Set(filtered.map((r) => r.id));
      selection.forEach((p) => {
        if (!have.has(p) && !values.has(p)) {
          filtered = [...filtered, { id: p, row: emptyEntry(p) }];
        }
      });
    }
    return filtered.sort((a, b) => a.id.localeCompare(b.id));
  }, [values, showAll, isPopulated, selection, emptyEntry]);

  const pagedRows = React.useMemo(
    () => rows.slice(page * pageSize, page * pageSize + pageSize),
    [rows, page, pageSize],
  );

  const updateRow = (wellId: WellId, patch: Partial<T>) => {
    const next = new Map(values);
    const cur = next.get(wellId) ?? emptyEntry(wellId);
    next.set(wellId, { ...cur, ...patch });
    onChange(next);
  };

  const toggleSelect = (wellId: WellId) => {
    if (!onSelectionChange) return;
    const s = new Set(selection ?? []);
    if (s.has(wellId)) {
      s.delete(wellId);
    } else {
      s.add(wellId);
    }
    onSelectionChange(s);
  };

  const getFillDownPlan = (col: WellColumn<T>) => {
    if (!col.field) return null;

    const selectionActive = !!selection && selection.size > 0;
    const sourceRows = selectionActive ? rows.filter(({ id }) => selection.has(id)) : pagedRows;
    const sourceIndex = sourceRows.findIndex(({ row }) => hasFillValue(row[col.field!]));
    if (sourceIndex < 0) return null;

    const source = sourceRows[sourceIndex];
    const targets = selectionActive
      ? sourceRows.filter(({ id }) => id !== source.id)
      : sourceRows.slice(sourceIndex + 1);

    return {
      field: col.field,
      source,
      targets,
      value: source.row[col.field],
    };
  };

  const fillColumnDown = (col: WellColumn<T>) => {
    const plan = getFillDownPlan(col);
    if (!plan || plan.targets.length === 0) return;

    const next = new Map(values);
    plan.targets.forEach(({ id }) => {
      const cur = next.get(id) ?? emptyEntry(id);
      next.set(id, { ...cur, [plan.field]: plan.value } as T);
    });
    onChange(next);
  };

  const renderCell = (col: WellColumn<T>, wellId: WellId, row: T) => {
    if (col.render) {
      return col.render({
        row,
        wellId,
        update: (patch) => updateRow(wellId, patch),
      });
    }
    if (!col.field) return null;

    const field = fieldByKey.get(col.field);
    const value = row[col.field];

    if (field?.kind === "select") {
      return (
        <Select
          value={(value as string | undefined) ?? ""}
          onValueChange={(v) => updateRow(wellId, { [col.field!]: v } as Partial<T>)}
        >
          <SelectTrigger size="sm" className={cn("w-full", CELL_CONTROL_CLASS)}>
            <SelectValue placeholder={field.placeholder ?? "—"} />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="inline-flex items-center gap-2">
                  {opt.swatch ? (
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-sm border border-foreground/20"
                      style={{ backgroundColor: opt.swatch }}
                      aria-hidden
                    />
                  ) : null}
                  {opt.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        type={field?.kind === "number" ? "number" : "text"}
        className={CELL_CONTROL_CLASS}
        placeholder="—"
        value={(value as string | number | undefined) ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          let next: unknown = raw === "" ? undefined : raw;
          if (field?.kind === "number") {
            const num = parseFloat(raw);
            next = raw === "" ? undefined : Number.isFinite(num) ? num : raw;
          }
          updateRow(wellId, { [col.field!]: next } as Partial<T>);
        }}
      />
    );
  };

  const renderColumnHeader = (col: WellColumn<T>) => {
    const matchingField = col.field ? fieldByKey.get(col.field) : undefined;
    const icon = col.icon ?? matchingField?.icon;
    const fillPlan = enableFillDown ? getFillDownPlan(col) : null;
    const canFillDown = !!fillPlan && fillPlan.targets.length > 0;
    const fillHint =
      selection && selection.size > 0
        ? `Fill selected ${col.header} cells from the first selected value`
        : `Fill visible ${col.header} cells downward from the first value`;
    return (
      <span className="flex min-w-0 items-center justify-between gap-2">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          {icon ? <span className="inline-flex text-muted-foreground [&_svg]:size-3.5">{icon}</span> : null}
          <span className="truncate">{col.header}</span>
        </span>
        {enableFillDown && col.field ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="-mr-1 text-muted-foreground hover:text-foreground"
                disabled={!canFillDown}
                aria-label={`Fill down ${col.header}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  fillColumnDown(col);
                }}
              >
                <ArrowDownToLine />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{fillHint}</TooltipContent>
          </Tooltip>
        ) : null}
      </span>
    );
  };

  const totalRows = rows.length;
  const lastPage = Math.max(0, Math.ceil(totalRows / pageSize) - 1);
  const selSize = selection?.size ?? 0;

  return (
    <div data-slot="well-manifest-table" className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowAll((v) => !v)}>
          {showAll ? "Hide empty wells" : "Show all wells"}
        </Button>
        <span className="text-xs text-muted-foreground">
          {totalRows} rows · {selSize} selected
        </span>
      </div>

      <TooltipProvider>
        <Table
          variant="card"
          containerClassName="max-h-[500px] border-slate-300 bg-white"
          className="[&_tbody]:bg-white [&_tbody_td]:bg-white [&_tbody_tr]:border-slate-300 [&_tbody_tr]:bg-white [&_tbody_tr:hover]:bg-slate-50 [&_tbody_tr[data-state=selected]]:bg-white"
          data-density="compact"
        >
          <TableHeader variant="sticky" className="bg-slate-100 [&_tr]:border-slate-300">
            <TableRow>
              {onSelectionChange ? <TableHead variant="action" className="w-10" /> : null}
              <TableHead style={{ minWidth: 60 }}>Well</TableHead>
              {columns.map((col) => (
                <TableHead
                  key={col.id ?? col.field ?? col.header}
                  style={col.minWidth ? { minWidth: col.minWidth } : undefined}
                >
                  {renderColumnHeader(col)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.map(({ id, row }) => {
              const isSelected = selection?.has(id);
              return (
                <TableRow key={id} data-state={isSelected ? "selected" : undefined}>
                  {onSelectionChange ? (
                    <TableCell variant="action">
                      <Checkbox
                        checked={!!isSelected}
                        onCheckedChange={() => toggleSelect(id)}
                        aria-label={`Select ${id}`}
                      />
                    </TableCell>
                  ) : null}
                  <TableCell className="bg-white font-semibold">{id}</TableCell>
                  {columns.map((col) => (
                    <TableCell
                      key={col.id ?? col.field ?? col.header}
                      className="border-l border-slate-300 bg-white focus-within:bg-primary/5 focus-within:ring-1 focus-within:ring-primary/30 focus-within:ring-inset"
                      style={col.minWidth ? { minWidth: col.minWidth } : undefined}
                    >
                      {renderCell(col, id, row)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
            {pagedRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1 + (onSelectionChange ? 1 : 0)}
                  className="text-xs text-muted-foreground"
                >
                  No rows. Paint wells on the plate.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TooltipProvider>

      <div className="flex items-center justify-end gap-3 text-xs text-muted-foreground">
        <span className="text-muted-foreground">Rows per page</span>
        <Select
          value={String(pageSize)}
          onValueChange={(v) => {
            setPageSize(parseInt(v, 10));
            setPage(0);
          }}
        >
          <SelectTrigger size="sm" className="h-7 w-[72px]" aria-label="Rows per page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((s) => (
              <SelectItem key={s} value={String(s)}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>
          {totalRows === 0
            ? "0 of 0"
            : `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, totalRows)} of ${totalRows}`}
        </span>
        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= lastPage}
          onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
