import { ArrowDownToLine, Check, ChevronDown, ChevronRight, Layers } from "lucide-react";
import * as React from "react";

import { ManifestFilterPopover } from "./ManifestFilterPopover";
import { EMPTY_FILTER_STATE, applyFilterState } from "./manifestFilter";

import type { FilterColumn, FilterState, FilterValueType } from "./manifestFilter";
import type { WellColumn, WellField, WellId, WellRecord, WellSelectOption } from "./types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function MultiSelectCell({
  ariaLabel,
  value,
  options,
  placeholder,
  onChange,
}: {
  ariaLabel: string;
  value: string[];
  options: WellSelectOption[];
  placeholder?: string;
  onChange: (next: string[]) => void;
}) {
  const anchorRef = useComboboxAnchor();
  const labelByValue = React.useMemo(() => {
    const m = new Map<string, string>();
    options.forEach((o) => m.set(o.value, o.label));
    return m;
  }, [options]);

  return (
    <Combobox multiple items={options.map((o) => o.value)} value={value} onValueChange={onChange}>
      <ComboboxChips ref={anchorRef} className="min-h-7 w-full py-0.5">
        <ComboboxValue>
          {(items: string[]) =>
            items.map((item) => <ComboboxChip key={item}>{labelByValue.get(item) ?? item}</ComboboxChip>)
          }
        </ComboboxValue>
        <ComboboxChipsInput aria-label={ariaLabel} placeholder={placeholder ?? "Select…"} />
      </ComboboxChips>
      <ComboboxContent anchor={anchorRef}>
        <ComboboxEmpty>No options.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {labelByValue.get(item) ?? item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

const PAGE_SIZE_SMALL = 25;
const PAGE_SIZE_MEDIUM = 50;
const PAGE_SIZE_LARGE = 100;
const DEFAULT_PAGE_SIZE = PAGE_SIZE_SMALL;
const DEFAULT_PAGE_SIZE_OPTIONS: number[] = [PAGE_SIZE_SMALL, PAGE_SIZE_MEDIUM, PAGE_SIZE_LARGE];

function hasFillValue(value: unknown): boolean {
  return value !== undefined && value !== null && value !== "";
}

const INPUT_TYPE_BY_KIND: Record<string, string> = {
  number: "number",
  integer: "number",
  date: "date",
  datetime: "datetime-local",
  time: "time",
};

function resolveInputType(kind: string): string {
  return INPUT_TYPE_BY_KIND[kind] ?? "text";
}

function parseInputValue(kind: string, raw: string): unknown {
  if (raw === "") return undefined;
  if (kind === "number") {
    const num = parseFloat(raw);
    return Number.isFinite(num) ? num : raw;
  }
  if (kind === "integer") {
    const num = parseInt(raw, 10);
    return Number.isFinite(num) ? num : raw;
  }
  return raw;
}

export interface WellManifestTableRowContext<T extends WellRecord = WellRecord> {
  wellId: WellId;
  row: T;
  isSelected: boolean;
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
  /**
   * Extra props spread onto each `<tr>` — typically used to attach a DnD
   * library's `setNodeRef`, listeners, and data attributes so rows can act as
   * drag sources. The kit stays DnD-library-agnostic.
   */
  rowProps?: (ctx: WellManifestTableRowContext<T>) => React.ComponentProps<"tr"> | undefined;
  /** Enables an inline filter popover above the table. Defaults to false. */
  filterable?: boolean;
  /**
   * Optional override of filterable columns. When omitted, columns are derived
   * from `columns` (with type inferred from matching field kinds).
   */
  filterColumns?: FilterColumn[];
  /** Enables an inline group-by selector. Defaults to false. */
  groupable?: boolean;
  className?: string;
}

interface GroupedRow<T> {
  key: string;
  rows: Array<{ id: WellId; row: T }>;
}

function groupRowsBy<T extends WellRecord>(
  rows: Array<{ id: WellId; row: T }>,
  field: string,
): GroupedRow<T>[] {
  const map = new Map<string, GroupedRow<T>>();
  for (const entry of rows) {
    const raw = (entry.row as Record<string, unknown>)[field];
    const key = raw === undefined || raw === null || raw === "" ? "(blank)" : String(raw);
    const existing = map.get(key);
    if (existing) existing.rows.push(entry);
    else map.set(key, { key, rows: [entry] });
  }
  return [...map.values()];
}

const NUMERIC_KINDS = new Set(["number", "integer"]);

function inferFilterColumns<T extends WellRecord>(
  columns: WellColumn<T>[],
  fieldByKey: Map<string, WellField<T>>,
): FilterColumn[] {
  const out: FilterColumn[] = [];
  for (const col of columns) {
    if (!col.field) continue;
    const field = fieldByKey.get(col.field);
    const type: FilterValueType = field && NUMERIC_KINDS.has(field.kind) ? "number" : "string";
    out.push({ field: col.field, headerName: col.header, type });
  }
  return out;
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
  rowProps,
  filterable = false,
  filterColumns,
  groupable = false,
  className,
}: WellManifestTableProps<T>) {
  const [showAll, setShowAll] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(initialPageSize);
  const [filterState, setFilterState] = React.useState<FilterState>(EMPTY_FILTER_STATE);
  const [groupByField, setGroupByField] = React.useState<string>("");
  const [collapsedGroups, setCollapsedGroups] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    setPage(0);
  }, [showAll]);

  const fieldByKey = React.useMemo(() => {
    const m = new Map<string, WellField<T>>();
    (fields ?? []).forEach((f) => m.set(f.key, f));
    return m;
  }, [fields]);

  const resolvedFilterColumns = React.useMemo<FilterColumn[]>(
    () => filterColumns ?? inferFilterColumns(columns, fieldByKey),
    [columns, fieldByKey, filterColumns],
  );

  const rows = React.useMemo(() => {
    const arr = [...values.entries()].map(([id, row]) => ({
      id,
      row,
    }));
    let filtered = arr;
    if (!showAll && isPopulated) {
      filtered = arr.filter((r) => isPopulated(r.row));
    }
    if (filterable && filterState.conditions.length > 0) {
      const survivors = new Set(
        applyFilterState(
          filtered.map(({ id, row }) => ({ ...(row as Record<string, unknown>), __id: id })),
          filterState,
          resolvedFilterColumns,
        ).map((r) => r.__id as WellId),
      );
      filtered = filtered.filter((r) => survivors.has(r.id));
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
  }, [values, showAll, isPopulated, selection, emptyEntry, filterable, filterState, resolvedFilterColumns]);

  React.useEffect(() => {
    setPage(0);
  }, [filterState]);

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

  const renderSelectCellEditable = (
    field: WellField<T>,
    fieldKey: keyof T & string,
    value: unknown,
    wellId: WellId,
    ariaLabel: string,
  ) => (
    <Select
      value={(value as string | undefined) ?? ""}
      onValueChange={(v) => updateRow(wellId, { [fieldKey]: v } as Partial<T>)}
    >
      <SelectTrigger size="sm" className="h-7 w-full" aria-label={ariaLabel}>
        <SelectValue placeholder={field.placeholder ?? "Select…"} />
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

  const renderBooleanCellEditable = (
    field: WellField<T>,
    fieldKey: keyof T & string,
    value: unknown,
    wellId: WellId,
    ariaLabel: string,
  ) => {
    const checked = !!value;
    if (field.boolStyle === "switch") {
      return (
        <Switch
          aria-label={ariaLabel}
          checked={checked}
          onCheckedChange={(c) => updateRow(wellId, { [fieldKey]: c } as Partial<T>)}
        />
      );
    }
    return (
      <Checkbox
        aria-label={ariaLabel}
        checked={checked}
        onCheckedChange={(c) => updateRow(wellId, { [fieldKey]: c === true } as Partial<T>)}
      />
    );
  };

  const renderInputCellEditable = (
    field: WellField<T>,
    fieldKey: keyof T & string,
    value: unknown,
    wellId: WellId,
    ariaLabel: string,
  ) => (
    <Input
      type={resolveInputType(field.kind)}
      step={field.kind === "integer" ? 1 : undefined}
      placeholder={field.placeholder}
      aria-label={ariaLabel}
      className="h-7"
      value={(value as string | number | undefined) ?? ""}
      onChange={(e) =>
        updateRow(wellId, { [fieldKey]: parseInputValue(field.kind, e.target.value) } as Partial<T>)
      }
    />
  );

  const renderEditableCell = (field: WellField<T>, col: WellColumn<T>, wellId: WellId, row: T) => {
    const fieldKey = col.field!;
    const value = row[fieldKey];
    const ariaLabel = `${field.label} for ${wellId}`;

    if (field.kind === "select") return renderSelectCellEditable(field, fieldKey, value, wellId, ariaLabel);
    if (field.kind === "multiselect") {
      const current = Array.isArray(value) ? (value as string[]) : [];
      return (
        <MultiSelectCell
          ariaLabel={ariaLabel}
          value={current}
          options={field.options ?? []}
          placeholder={field.placeholder}
          onChange={(next) =>
            updateRow(wellId, { [fieldKey]: next.length === 0 ? undefined : next } as Partial<T>)
          }
        />
      );
    }
    if (field.kind === "boolean") return renderBooleanCellEditable(field, fieldKey, value, wellId, ariaLabel);
    return renderInputCellEditable(field, fieldKey, value, wellId, ariaLabel);
  };

  const renderReadonlyCell = (field: WellField<T> | undefined, value: unknown) => {
    if (field?.kind === "select") {
      const option = (field.options ?? []).find((opt) => opt.value === value);
      if (!option) {
        return <span className="text-muted-foreground">—</span>;
      }

      return (
        <Badge variant="secondary">
          {option.swatch ? (
            <span
              className="size-2 rounded-sm border border-foreground/20"
              style={{ backgroundColor: option.swatch }}
              aria-hidden
            />
          ) : null}
          {option.label}
        </Badge>
      );
    }

    if (field?.kind === "multiselect") {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      if (arr.length === 0) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {arr.map((v) => {
            const opt = (field.options ?? []).find((o) => o.value === v);
            return (
              <Badge key={v} variant="secondary">
                {opt?.swatch ? (
                  <span
                    className="size-2 rounded-sm border border-foreground/20"
                    style={{ backgroundColor: opt.swatch }}
                    aria-hidden
                  />
                ) : null}
                {opt?.label ?? v}
              </Badge>
            );
          })}
        </div>
      );
    }

    if (field?.kind === "boolean") {
      return value ? (
        <Check aria-label="Yes" className="size-4 text-foreground" />
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    }

    if (!hasFillValue(value)) {
      return <span className="text-muted-foreground">—</span>;
    }

    return String(value);
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

    if (field?.editableInTable && field.kind !== "custom") {
      return renderEditableCell(field, col, wellId, row);
    }

    return renderReadonlyCell(field, value);
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

  const groupableColumns = React.useMemo(
    () => columns.filter((col) => !!col.field),
    [columns],
  );
  const activeGroupField = groupable && groupByField ? groupByField : "";
  const grouped = React.useMemo(
    () => (activeGroupField ? groupRowsBy(rows, activeGroupField) : null),
    [activeGroupField, rows],
  );

  const totalRows = rows.length;
  const lastPage = Math.max(0, Math.ceil(totalRows / pageSize) - 1);
  const selSize = selection?.size ?? 0;
  const totalColSpan = columns.length + 1 + (onSelectionChange ? 1 : 0);

  const renderDataRow = (id: WellId, row: T) => {
    const isSelected = selection?.has(id);
    const extra = rowProps?.({ wellId: id, row, isSelected: !!isSelected });
    return (
      <TableRow key={id} {...extra}>
        {onSelectionChange ? (
          <TableCell className="w-10">
            <Checkbox
              checked={!!isSelected}
              onCheckedChange={() => toggleSelect(id)}
              aria-label={`Select ${id}`}
            />
          </TableCell>
        ) : null}
        <TableCell className="font-semibold">{id}</TableCell>
        {columns.map((col) => (
          <TableCell
            key={col.id ?? col.field ?? col.header}
            style={col.minWidth ? { minWidth: col.minWidth } : undefined}
          >
            {renderCell(col, id, row)}
          </TableCell>
        ))}
      </TableRow>
    );
  };

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const groupHeaderLabel = (() => {
    if (!activeGroupField) return "";
    const col = columns.find((c) => c.field === activeGroupField);
    return col?.header ?? activeGroupField;
  })();

  return (
    <div data-slot="well-manifest-table" className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowAll((v) => !v)}>
          {showAll ? "Hide empty wells" : "Show all wells"}
        </Button>
        {filterable ? (
          <ManifestFilterPopover
            columns={resolvedFilterColumns}
            state={filterState}
            onStateChange={setFilterState}
          />
        ) : null}
        {groupable ? (
          <div className="inline-flex items-center gap-1.5">
            <Layers aria-hidden className="size-3.5 text-muted-foreground" />
            <Select value={groupByField || "__none"} onValueChange={(v) => setGroupByField(v === "__none" ? "" : v)}>
              <SelectTrigger size="sm" className="h-7 min-w-[160px]" aria-label="Group by">
                <SelectValue placeholder="Group by…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">No grouping</SelectItem>
                {groupableColumns.map((col) => (
                  <SelectItem key={col.id ?? col.field} value={col.field ?? ""}>
                    {col.header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
        <span className="text-xs text-muted-foreground">
          {totalRows} rows · {selSize} selected
        </span>
      </div>

      <TooltipProvider>
        <Table data-density="default">
          <TableHeader>
            <TableRow>
              {onSelectionChange ? (
                <TableHead className="w-10 text-center">
                  <span className="inline-flex items-center justify-center text-muted-foreground [&_svg]:size-3.5">
                    <Check aria-hidden />
                    <span className="sr-only">Selected</span>
                  </span>
                </TableHead>
              ) : null}
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
            {grouped
              ? grouped.map((group) => {
                  const isCollapsed = collapsedGroups.has(group.key);
                  return (
                    <React.Fragment key={group.key}>
                      <TableRow
                        className="cursor-pointer bg-muted/40"
                        onClick={() => toggleGroup(group.key)}
                      >
                        <TableCell colSpan={totalColSpan} className="py-1.5">
                          <div className="flex items-center gap-2 text-xs font-medium">
                            {isCollapsed ? (
                              <ChevronRight aria-hidden className="size-3.5 text-muted-foreground" />
                            ) : (
                              <ChevronDown aria-hidden className="size-3.5 text-muted-foreground" />
                            )}
                            <span>
                              {groupHeaderLabel}: {group.key}
                            </span>
                            <span className="text-muted-foreground">
                              ({group.rows.length} {group.rows.length === 1 ? "row" : "rows"})
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                      {isCollapsed ? null : group.rows.map(({ id, row }) => renderDataRow(id, row))}
                    </React.Fragment>
                  );
                })
              : pagedRows.map(({ id, row }) => renderDataRow(id, row))}
            {(grouped ? grouped.length === 0 : pagedRows.length === 0) ? (
              <TableRow>
                <TableCell colSpan={totalColSpan} className="text-xs text-muted-foreground">
                  No rows. Paint wells on the plate.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TooltipProvider>

      {grouped ? null : (
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
      )}
    </div>
  );
}
