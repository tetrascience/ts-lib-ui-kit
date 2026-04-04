import * as React from "react"
import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  forwardRef,
} from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

// ── Public types ─────────────────────────────────────────────────────────────

/** Supported column data types — drives which filter operators are offered. */
export type DataTableColumnType = "string" | "number" | "list" | "custom"

/** A column group renders a spanning header row above its member columns. */
export interface DataTableColumnGroup {
  /** Unique key for this group. */
  key: string
  /** Display label shown in the group header row. */
  label: string
}

/**
 * Declarative definition for a single table column.
 *
 * @typeParam T - The row data shape.
 */
export interface DataTableColumnDef<T> {
  /** Unique key identifying this column. */
  key: string
  /** Column header label. */
  label: string
  /** Tooltip description shown on hover in column header. */
  description?: string
  /** Data type — determines default cell formatting and available filter operators. */
  type: DataTableColumnType
  /** Whether this column supports sorting (default: true for string/number). */
  sortable?: boolean
  /** Optional group key — columns in the same group share a spanning header. */
  group?: string
  /** Custom accessor function to extract the cell value from a row. When omitted, `row[key]` is used. */
  accessor?: (row: T) => unknown
  /** Custom cell renderer. Receives the row and the resolved cell value. */
  renderCell?: (row: T, value: unknown) => React.ReactNode
}

export type DataTableSortDirection = "asc" | "desc"

export interface DataTableSortRule {
  /** Column key to sort by. */
  key: string
  /** Sort direction. */
  dir: DataTableSortDirection
}

export type DataTableFilterOp =
  | "="
  | "!="
  | "<"
  | ">"
  | "<="
  | ">="
  | "contains"
  | "does not contain"
  | "is"
  | "is not"
  | "is any of"
  | "is none of"
  | "is empty"
  | "is not empty"

export interface DataTableFilterRule {
  /** Internal unique id for this filter rule. */
  id: string
  /** Column key to filter on. */
  key: string
  /** Comparison operator. */
  op: DataTableFilterOp
  /** User-entered comparison value (always stored as string). */
  value: string
}

export type DataTableFilterGroupLogic = "and" | "or"

export interface DataTableFilterGroup {
  /** Internal unique id for this group. */
  id: string
  /** Logic connector between conditions in this group. */
  logic: DataTableFilterGroupLogic
  /** Conditions within this group. */
  rules: DataTableFilterRule[]
}

/** Row density controlling vertical cell padding. */
export type DataTableDensity = "compact" | "default" | "relaxed"

/** A batch action button shown when rows are selected. */
export interface DataTableBatchAction {
  /** Button label. */
  label: string
  /** Callback receiving the set of selected row ids. */
  onClick: (selectedIds: Set<string>) => void
}

export interface DataTableProps<T> {
  /** Array of row data objects. */
  data: T[]
  /** Column definitions — order determines display order. */
  columns: DataTableColumnDef<T>[]
  /** Column group definitions for spanning headers. */
  columnGroups?: DataTableColumnGroup[]
  /** Title shown in the toolbar header. */
  title?: string
  /** Subtitle / row count summary (auto-generated when omitted). */
  subtitle?: string
  /** Set of column keys that are hidden by default. */
  defaultHiddenColumns?: Set<string>
  /** Initial sort rules applied on mount. */
  defaultSortRules?: DataTableSortRule[]
  /** Function to extract a unique string id from each row. Required for row selection. */
  getRowId?: (row: T) => string
  /** Currently selected row id (controlled, single-click selection). */
  selectedRowId?: string | null
  /** Callback fired when the selected row changes (single-click). */
  onSelectionChange?: (rowId: string | null) => void
  /** Optional renderer for an actions column (last column). */
  renderActions?: (row: T) => React.ReactNode
  /** Additional CSS class name on the root container. */
  className?: string

  // ── Pagination ────────────────────────────────────────────────────────
  /** Enable pagination footer. */
  pagination?: boolean
  /** Default rows per page (default: 10). */
  defaultPerPage?: number
  /** Available "rows per page" options (default: [5, 10, 25]). */
  perPageOptions?: number[]

  // ── Search ────────────────────────────────────────────────────────────
  /** Show a search input in the toolbar. */
  searchable?: boolean
  /** Placeholder text for the search input. */
  searchPlaceholder?: string
  /** Column keys to search across. Defaults to all string columns. */
  searchKeys?: string[]

  // ── Batch selection ───────────────────────────────────────────────────
  /** Show checkboxes for multi-row selection. */
  selectable?: boolean
  /** Batch action buttons shown in the batch action bar. */
  batchActions?: DataTableBatchAction[]

  // ── Row expansion ─────────────────────────────────────────────────────
  /** Enable row expansion with a chevron column. */
  expandable?: boolean
  /** Render the expanded row content. */
  renderExpandedRow?: (row: T) => React.ReactNode
  /** Show an expand-all toggle in the header chevron column. */
  batchExpandable?: boolean

  // ── Density ───────────────────────────────────────────────────────────
  /** Row density affecting vertical padding (default: "default"). */
  density?: DataTableDensity

  // ── Column reordering ─────────────────────────────────────────────────
  /** Enable drag-to-reorder column headers. */
  reorderable?: boolean
  /** Callback fired when the user reorders columns via drag. */
  onColumnOrderChange?: (order: string[]) => void
}

// ── Filter operator sets ─────────────────────────────────────────────────────

const NUMBER_OPS: DataTableFilterOp[] = ["=", "!=", "<", ">", "<=", ">=", "is empty", "is not empty"]
const STRING_OPS: DataTableFilterOp[] = ["contains", "does not contain", "is", "is not", "is empty", "is not empty"]
const LIST_OPS: DataTableFilterOp[] = ["is", "is not", "is any of", "is none of", "is empty", "is not empty"]

const OP_LABELS: Record<DataTableFilterOp, string> = {
  "=": "=",
  "!=": "\u2260",
  "<": "<",
  ">": ">",
  "<=": "\u2264",
  ">=": "\u2265",
  "contains": "contains\u2026",
  "does not contain": "does not contain\u2026",
  "is": "is\u2026",
  "is not": "is not\u2026",
  "is any of": "is any of\u2026",
  "is none of": "is none of\u2026",
  "is empty": "is empty",
  "is not empty": "is not empty",
}

const EMPTY_OPS = new Set<DataTableFilterOp>(["is empty", "is not empty"])

function getOpsForType(type: DataTableColumnType): DataTableFilterOp[] {
  switch (type) {
    case "number": return NUMBER_OPS
    case "list": return LIST_OPS
    default: return STRING_OPS
  }
}

// ── Icons ────────────────────────────────────────────────────────────────────

function XIcon() {
  return (
    <svg
      className="size-3.5"
      fill="none"
      viewBox="0 0 16 16"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" d="M4 4l8 8M12 4l-8 8" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg
      className="size-3"
      fill="none"
      viewBox="0 0 12 12"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" d="M6 2v8M2 6h8" />
    </svg>
  )
}


function HideFieldsIcon() {
  return (
    <svg
      className="size-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg
      className="size-3.5"
      fill="none"
      viewBox="0 0 16 16"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.5 4h11l-4.5 5.5V14l-2-1V9.5L2.5 4z"
      />
    </svg>
  )
}

function SortIcon() {
  return (
    <svg
      className="size-3.5"
      fill="none"
      viewBox="0 0 16 16"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 4h10M5 8h6M7 12h2"
      />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-4", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg
      className="size-3.5 text-muted-foreground"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

// ── Internal UI primitives ───────────────────────────────────────────────────

function Pill({ count, className }: { count: number; className?: string }) {
  return (
    <span
      data-slot="data-table-pill"
      className={cn(
        "ml-1 rounded-full px-1.5 py-px text-[10px] leading-none font-semibold",
        className,
      )}
    >
      {count}
    </span>
  )
}

function ToolbarBtn({
  active,
  activeClass,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean
  activeClass: string
  onClick: () => void
  icon: React.ReactNode
  label: string
  badge?: React.ReactNode
}) {
  return (
    <button
      data-slot="data-table-toolbar-btn"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-[5px] rounded-md text-xs font-medium border transition-colors select-none",
        active
          ? activeClass
          : "text-muted-foreground border-transparent hover:bg-muted/50",
      )}
    >
      {icon}
      {label}
      {badge}
    </button>
  )
}

function PanelContainer({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-slot="data-table-panel"
      className="bg-background border border-border rounded-lg shadow-xl p-3 min-w-[11rem]"
    >
      {children}
    </div>
  )
}

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-2">
      {children}
    </p>
  )
}


// ── Portal dropdown ──────────────────────────────────────────────────────────

const PortalDropdown = forwardRef<
  HTMLDivElement,
  {
    triggerRef: React.RefObject<HTMLDivElement | null>
    placement: "above" | "below"
    children: React.ReactNode
  }
>(function PortalDropdown({ triggerRef, placement, children }, ref) {
  if (!triggerRef.current) return null
  const rect = triggerRef.current.getBoundingClientRect()
  const right = window.innerWidth - rect.right
  const style: React.CSSProperties =
    placement === "above"
      ? {
          position: "fixed",
          bottom: window.innerHeight - rect.top + 6,
          right,
          zIndex: 9999,
        }
      : { position: "fixed", top: rect.bottom + 6, right, zIndex: 9999 }
  return createPortal(
    <div ref={ref} style={style}>
      {children}
    </div>,
    document.body,
  )
})

// ── Toggle switch ────────────────────────────────────────────────────────────

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: () => void
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors",
        checked ? "bg-[#2F45B5]" : "bg-[#d0d5dd]",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform mt-0.5",
          checked ? "translate-x-[18px]" : "translate-x-0.5",
        )}
      />
    </button>
  )
}

// ── Hide Fields panel ────────────────────────────────────────────────────────

function HidePanel<T>({
  columns,
  columnGroups,
  hiddenCols,
  onToggle,
}: {
  columns: DataTableColumnDef<T>[]
  columnGroups?: DataTableColumnGroup[]
  hiddenCols: Set<string>
  onToggle: (key: string) => void
}) {
  const groupMap = useMemo(() => {
    const map = new Map<string, DataTableColumnGroup>()
    columnGroups?.forEach((g) => map.set(g.key, g))
    return map
  }, [columnGroups])

  const groups = useMemo(() => {
    const grouped = new Map<string, DataTableColumnDef<T>[]>()
    const ungrouped: DataTableColumnDef<T>[] = []
    for (const col of columns) {
      if (col.group && groupMap.has(col.group)) {
        const arr = grouped.get(col.group) || []
        arr.push(col)
        grouped.set(col.group, arr)
      } else {
        ungrouped.push(col)
      }
    }
    return { grouped, ungrouped }
  }, [columns, groupMap])

  return (
    <PanelContainer>
      {groups.ungrouped.length > 0 && (
        <div className="mb-2">
          {groups.ungrouped.map((col) => (
            <label
              key={col.key}
              className="flex items-center justify-between gap-3 py-1.5 cursor-pointer group"
            >
              <span className="text-xs text-foreground/70 group-hover:text-foreground">
                {col.label}
              </span>
              <ToggleSwitch
                checked={!hiddenCols.has(col.key)}
                onChange={() => onToggle(col.key)}
              />
            </label>
          ))}
        </div>
      )}
      {columnGroups?.map((group) => {
        const cols = groups.grouped.get(group.key)
        if (!cols?.length) return null
        return (
          <div key={group.key} className="mb-2 last:mb-0">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">
              {group.label}
            </p>
            {cols.map((col) => (
              <label
                key={col.key}
                className="flex items-center justify-between gap-3 py-1.5 cursor-pointer group"
              >
                <span className="text-xs text-foreground/70 group-hover:text-foreground">
                  {col.label}
                </span>
                <ToggleSwitch
                  checked={!hiddenCols.has(col.key)}
                  onChange={() => onToggle(col.key)}
                />
              </label>
            ))}
          </div>
        )
      })}
    </PanelContainer>
  )
}

// ── Sort panel ───────────────────────────────────────────────────────────────

function SortPanel<T>({
  columns,
  sortRules,
  onAdd,
  onUpdate,
  onRemove,
  onReorder,
}: {
  columns: DataTableColumnDef<T>[]
  sortRules: DataTableSortRule[]
  onAdd: () => void
  onUpdate: (i: number, changes: Partial<DataTableSortRule>) => void
  onRemove: (i: number) => void
  onReorder: (fromIdx: number, toIdx: number) => void
}) {
  const sortableCols = columns.filter(
    (c) => c.sortable !== false && c.type !== "custom",
  )
  const dragRef = useRef<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  return (
    <PanelContainer>
      <PanelLabel>Sort by</PanelLabel>
      <div className="w-80">
        {sortRules.length === 0 && (
          <p className="text-xs text-muted-foreground mb-2">No sort applied</p>
        )}
        <div className="flex flex-col gap-1.5">
          {sortRules.map((rule, idx) => (
            <div
              key={idx}
              draggable
              onDragStart={() => { dragRef.current = idx }}
              onDragOver={(e) => {
                e.preventDefault()
                if (dragRef.current !== idx) setDragOverIdx(idx)
              }}
              onDragLeave={() => setDragOverIdx(null)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOverIdx(null)
                if (dragRef.current != null && dragRef.current !== idx) {
                  onReorder(dragRef.current, idx)
                }
                dragRef.current = null
              }}
              onDragEnd={() => { dragRef.current = null; setDragOverIdx(null) }}
              className={cn(
                "flex items-center gap-1.5",
                dragOverIdx === idx && "border-t-2 border-primary",
              )}
            >
              <select
                value={rule.key}
                onChange={(e) => onUpdate(idx, { key: e.target.value })}
                className="flex-1 text-xs border border-input rounded px-2 py-1.5 bg-background text-foreground focus:outline-none focus:border-primary"
              >
                {sortableCols.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
              <select
                value={rule.dir}
                onChange={(e) =>
                  onUpdate(idx, {
                    dir: e.target.value as DataTableSortDirection,
                  })
                }
                className="text-xs border border-input rounded px-2 py-1.5 bg-background text-foreground focus:outline-none focus:border-primary"
              >
                <option value="asc">A &rarr; Z</option>
                <option value="desc">Z &rarr; A</option>
              </select>
              <button
                onClick={() => onRemove(idx)}
                title="Remove sort"
                className="text-muted-foreground/40 hover:text-destructive transition-colors flex-shrink-0"
              >
                <XIcon />
              </button>
              <span
                className="text-muted-foreground/30 cursor-grab active:cursor-grabbing flex-shrink-0"
                title="Drag to reorder"
              >
                <svg className="size-3.5" fill="currentColor" viewBox="0 0 16 16">
                  <circle cx="5" cy="3" r="1.2" /><circle cx="11" cy="3" r="1.2" />
                  <circle cx="5" cy="8" r="1.2" /><circle cx="11" cy="8" r="1.2" />
                  <circle cx="5" cy="13" r="1.2" /><circle cx="11" cy="13" r="1.2" />
                </svg>
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={onAdd}
          className="mt-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <PlusIcon />
          Add another sort
        </button>
      </div>
    </PanelContainer>
  )
}

// ── Filter condition row ─────────────────────────────────────────────────────

function FilterConditionRow<T>({
  rule,
  filterableCols,
  uniqueValues,
  onUpdate,
  onRemove,
}: {
  rule: DataTableFilterRule
  filterableCols: DataTableColumnDef<T>[]
  uniqueValues: Map<string, string[]>
  onUpdate: (id: string, changes: Partial<DataTableFilterRule>) => void
  onRemove: (id: string) => void
}) {
  const colDef = filterableCols.find((c) => c.key === rule.key)
  const colType = colDef?.type ?? "string"
  const ops = getOpsForType(colType)
  const isEmptyOp = EMPTY_OPS.has(rule.op)
  const isList = colType === "list"
  const values = uniqueValues.get(rule.key) ?? []

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <select
        value={rule.key}
        onChange={(e) => {
          const newKey = e.target.value
          const newCol = filterableCols.find((c) => c.key === newKey)
          const newOps = getOpsForType(newCol?.type ?? "string")
          onUpdate(rule.id, { key: newKey, op: newOps[0], value: "" })
        }}
        className="w-24 shrink-0 text-xs border border-input rounded px-1.5 py-1.5 bg-background text-foreground focus:outline-none focus:border-ring"
      >
        {filterableCols.map((c) => (
          <option key={c.key} value={c.key}>{c.label}</option>
        ))}
      </select>
      <select
        value={rule.op}
        onChange={(e) => onUpdate(rule.id, { op: e.target.value as DataTableFilterOp })}
        className="w-24 shrink-0 text-xs border border-input rounded px-1.5 py-1.5 bg-background text-foreground focus:outline-none focus:border-ring"
      >
        {ops.map((op) => (
          <option key={op} value={op}>{OP_LABELS[op]}</option>
        ))}
      </select>
      {!isEmptyOp && (
        isList ? (
          <select
            value={rule.value}
            onChange={(e) => onUpdate(rule.id, { value: e.target.value })}
            className="w-28 shrink-0 text-xs border border-input rounded px-1.5 py-1.5 bg-background text-foreground focus:outline-none focus:border-ring"
          >
            <option value="">Select&hellip;</option>
            {values.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        ) : (
          <input
            type={colType === "number" ? "number" : "text"}
            value={rule.value}
            onChange={(e) => onUpdate(rule.id, { value: e.target.value })}
            placeholder={colType === "number" ? "Number" : "Value"}
            className="w-20 shrink-0 text-xs border border-input rounded px-1.5 py-1.5 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-ring"
          />
        )
      )}
      <button
        onClick={() => onRemove(rule.id)}
        title="Remove condition"
        className="text-muted-foreground/30 hover:text-destructive transition-colors flex-shrink-0"
      >
        <XIcon />
      </button>
    </div>
  )
}

// ── Filter panel ─────────────────────────────────────────────────────────────

function FilterPanel<T>({
  columns,
  data,
  filterRules,
  filterGroups,
  onAdd,
  onUpdate,
  onRemove,
  onAddGroup,
  onAddToGroup,
  onRemoveFromGroup,
  onUpdateInGroup,
  onUpdateGroupLogic,
  onRemoveGroup,
  onReorder,
}: {
  columns: DataTableColumnDef<T>[]
  data: T[]
  filterRules: DataTableFilterRule[]
  filterGroups: DataTableFilterGroup[]
  onAdd: () => void
  onUpdate: (id: string, changes: Partial<DataTableFilterRule>) => void
  onRemove: (id: string) => void
  onAddGroup: () => void
  onAddToGroup: (groupId: string) => void
  onRemoveFromGroup: (groupId: string, ruleId: string) => void
  onUpdateInGroup: (groupId: string, ruleId: string, changes: Partial<DataTableFilterRule>) => void
  onUpdateGroupLogic: (groupId: string, logic: DataTableFilterGroupLogic) => void
  onRemoveGroup: (groupId: string) => void
  onReorder: (fromIdx: number, toIdx: number) => void
}) {
  const filterableCols = columns.filter((c) => c.type !== "custom")
  const isEmpty = filterRules.length === 0 && filterGroups.length === 0

  const uniqueValues = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const col of filterableCols) {
      if (col.type !== "list") continue
      const vals = new Set<string>()
      for (const row of data) {
        const v = getCellValue(row, col)
        if (v != null) vals.add(String(v))
      }
      map.set(col.key, [...vals].sort())
    }
    return map
  }, [data, filterableCols])

  const dragRef = useRef<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  return (
    <PanelContainer>
      <p className="text-xs text-muted-foreground mb-2">In this view, show records</p>
      <div>
        {isEmpty && (
          <p className="text-xs text-muted-foreground mb-2">
            No filters applied
          </p>
        )}
        {/* Top-level conditions */}
        <div className="flex flex-col gap-1">
          {filterRules.map((rule, idx) => (
            <div
              key={rule.id}
              draggable
              onDragStart={() => { dragRef.current = idx }}
              onDragOver={(e) => {
                e.preventDefault()
                if (dragRef.current !== idx) setDragOverIdx(idx)
              }}
              onDragLeave={() => setDragOverIdx(null)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOverIdx(null)
                if (dragRef.current != null && dragRef.current !== idx) {
                  onReorder(dragRef.current, idx)
                }
                dragRef.current = null
              }}
              onDragEnd={() => { dragRef.current = null; setDragOverIdx(null) }}
              className={cn(
                "flex items-center gap-1.5",
                dragOverIdx === idx && "border-t-2 border-primary",
              )}
            >
              <span className="text-[10px] text-muted-foreground font-medium w-10 shrink-0 text-right mr-0.5">
                {idx === 0 ? "Where" : "and"}
              </span>
              <FilterConditionRow
                rule={rule}
                filterableCols={filterableCols}
                uniqueValues={uniqueValues}
                onUpdate={onUpdate}
                onRemove={onRemove}
              />
              <span
                className="text-muted-foreground/30 cursor-grab active:cursor-grabbing flex-shrink-0"
                title="Drag to reorder"
              >
                <svg className="size-3.5" fill="currentColor" viewBox="0 0 16 16">
                  <circle cx="5" cy="3" r="1.2" /><circle cx="11" cy="3" r="1.2" />
                  <circle cx="5" cy="8" r="1.2" /><circle cx="11" cy="8" r="1.2" />
                  <circle cx="5" cy="13" r="1.2" /><circle cx="11" cy="13" r="1.2" />
                </svg>
              </span>
            </div>
          ))}
        </div>
        {/* Condition groups */}
        {filterGroups.map((group) => (
          <div
            key={group.id}
            className="mt-2 border border-input rounded-md p-2 bg-muted/20"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground font-medium uppercase">Where</span>
                <select
                  value={group.logic}
                  onChange={(e) => onUpdateGroupLogic(group.id, e.target.value as DataTableFilterGroupLogic)}
                  className="text-[10px] border border-input rounded px-1 py-0.5 bg-background text-foreground focus:outline-none"
                >
                  <option value="and">AND</option>
                  <option value="or">OR</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onAddToGroup(group.id)}
                  className="text-muted-foreground/50 hover:text-foreground transition-colors"
                  title="Add condition to group"
                >
                  <PlusIcon />
                </button>
                <button
                  onClick={() => onRemoveGroup(group.id)}
                  className="text-muted-foreground/50 hover:text-destructive transition-colors"
                  title="Remove group"
                >
                  <XIcon />
                </button>
              </div>
            </div>
            {group.rules.length === 0 && (
              <p className="text-[10px] text-muted-foreground py-1">
                Drag conditions here to add them to this group
              </p>
            )}
            <div className="flex flex-col gap-1.5">
              {group.rules.map((rule) => (
                <FilterConditionRow
                  key={rule.id}
                  rule={rule}
                  filterableCols={filterableCols}
                  uniqueValues={uniqueValues}
                  onUpdate={(id, changes) => onUpdateInGroup(group.id, id, changes)}
                  onRemove={(id) => onRemoveFromGroup(group.id, id)}
                />
              ))}
            </div>
          </div>
        ))}
        <div className="mt-2 flex items-center gap-4">
          <button
            onClick={onAdd}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <PlusIcon />
            Add condition
          </button>
          <button
            onClick={onAddGroup}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <PlusIcon />
            Add condition group
          </button>
        </div>
      </div>
    </PanelContainer>
  )
}

// ── Sort header indicator ────────────────────────────────────────────────────

function DataTableSortHeader<T>({
  col,
  sortRules,
}: {
  col: DataTableColumnDef<T>
  sortRules: DataTableSortRule[]
}) {
  const rule = sortRules.find((r) => r.key === col.key)
  return (
    <span className="select-none">
      {col.label}
      {rule && (
        <span className="text-primary ml-1">
          {rule.dir === "asc" ? "↑" : "↓"}
        </span>
      )}
    </span>
  )
}

// ── Default cell renderers ───────────────────────────────────────────────────

function DefaultStringCell({ value }: { value: unknown }) {
  return (
    <span className="text-[13px] text-foreground whitespace-nowrap">
      {String(value ?? "")}
    </span>
  )
}

function DefaultNumberCell({ value }: { value: unknown }) {
  const num = Number(value)
  const display = Number.isFinite(num)
    ? Number.isInteger(num)
      ? String(num)
      : num.toFixed(2)
    : String(value ?? "")
  return (
    <span className="font-mono text-[13px] text-foreground">{display}</span>
  )
}

// ── Pagination ───────────────────────────────────────────────────────────────

const PER_PAGE_5 = 5
const PER_PAGE_10 = 10
const PER_PAGE_25 = 25
const DEFAULT_PER_PAGE_OPTIONS = [PER_PAGE_5, PER_PAGE_10, PER_PAGE_25]

function DataTablePagination({
  total,
  page,
  perPage,
  onPage,
  onPerPage,
  perPageOptions = DEFAULT_PER_PAGE_OPTIONS,
}: {
  total: number
  page: number
  perPage: number
  onPage: (page: number) => void
  onPerPage: (perPage: number) => void
  perPageOptions?: number[]
}) {
  const pages = Math.ceil(total / perPage)
  if (total === 0) return null
  const start = (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)
  return (
    <div
      data-slot="data-table-pagination"
      className="flex items-center justify-between px-4 py-2.5 border-t border-[#F2F4F7] text-xs text-[#5F7087]"
    >
      <div className="flex items-center gap-2">
        <span>Rows per page:</span>
        <select
          value={perPage}
          onChange={(e) => {
            onPerPage(Number(e.target.value))
            onPage(1)
          }}
          className="text-xs border border-input rounded px-1.5 py-0.5 bg-background text-foreground focus:outline-none focus:border-primary cursor-pointer"
        >
          {perPageOptions.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span className="ml-2">
          {start}&ndash;{end} of {total}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-2 py-0.5 rounded border border-input bg-background text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
        >
          &lsaquo;
        </button>
        {Array.from({ length: pages }, (_, i) => (
          <button
            key={i}
            onClick={() => onPage(i + 1)}
            className={cn(
              "px-2.5 py-0.5 rounded border text-xs font-medium",
              page === i + 1
                ? "bg-[#2F45B5] border-[#2F45B5] text-white font-semibold"
                : "border-input bg-background text-muted-foreground hover:bg-muted",
            )}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => onPage(Math.min(pages, page + 1))}
          disabled={page === pages}
          className="px-2 py-0.5 rounded border border-input bg-background text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
        >
          &rsaquo;
        </button>
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getCellValue<T>(row: T, col: DataTableColumnDef<T>): unknown {
  if (col.accessor) return col.accessor(row)
  return (row as Record<string, unknown>)[col.key]
}

function matchesFilterRule<T>(
  row: T,
  rule: DataTableFilterRule,
  filterableCols: DataTableColumnDef<T>[],
): boolean {
  const colDef = filterableCols.find((c) => c.key === rule.key)
  if (!colDef) return true
  const raw = getCellValue(row, colDef)

  // Empty/not-empty operators don't need a value
  if (rule.op === "is empty") return raw == null || String(raw).trim() === ""
  if (rule.op === "is not empty") return raw != null && String(raw).trim() !== ""

  const val = rule.value.trim()
  if (!val) return true

  if (colDef.type === "number") {
    const n = typeof raw === "number" ? raw : parseFloat(String(raw))
    const rv = parseFloat(val)
    if (isNaN(rv)) return true
    return matchNumericOp(n, rv, rule.op)
  }

  const s = String(raw ?? "").toLowerCase()
  const rv = val.toLowerCase()
  return matchStringOp(s, rv, rule.op)
}

function matchNumericOp(n: number, rv: number, op: DataTableFilterOp): boolean {
  switch (op) {
    case "=": return n === rv
    case "!=": return n !== rv
    case "<": return n < rv
    case ">": return n > rv
    case "<=": return n <= rv
    case ">=": return n >= rv
    default: return true
  }
}

function matchStringOp(s: string, rv: string, op: DataTableFilterOp): boolean {
  switch (op) {
    case "contains": return s.includes(rv)
    case "does not contain": return !s.includes(rv)
    case "is": return s === rv
    case "is not": return s !== rv
    case "is any of": return rv.split(",").some((v) => s === v.trim())
    case "is none of": return !rv.split(",").some((v) => s === v.trim())
    case "=": return s === rv
    case "!=": return s !== rv
    default: return true
  }
}

function applySort<T>(
  data: T[],
  sortRules: DataTableSortRule[],
  columns: DataTableColumnDef<T>[],
): T[] {
  if (sortRules.length === 0) return data
  return [...data].sort((a, b) => {
    for (const rule of sortRules) {
      const colDef = columns.find((c) => c.key === rule.key)
      if (!colDef) continue
      const av = getCellValue(a, colDef)
      const bv = getCellValue(b, colDef)
      const cmp =
        typeof av === "string" || typeof bv === "string"
          ? String(av ?? "").localeCompare(String(bv ?? ""))
          : (Number(av) || 0) - (Number(bv) || 0)
      if (cmp !== 0) return rule.dir === "asc" ? cmp : -cmp
    }
    return 0
  })
}

const DENSITY_CLASSES: Record<DataTableDensity, string> = {
  compact: "py-2.5 px-6",
  default: "py-[10px] px-6",
  relaxed: "py-[20px] px-6",
}

const DENSITY_TH_CLASSES: Record<DataTableDensity, string> = {
  compact: "h-12 px-6",
  default: "h-14 px-6",
  relaxed: "h-16 px-6",
}

function buildSubtitle(visibleCount: number, totalCount: number): string {
  return visibleCount < totalCount
    ? `${visibleCount} of ${totalCount} rows`
    : `${totalCount} rows`
}

function toggleSetEntry<V>(set: Set<V>, entry: V): Set<V> {
  const next = new Set(set)
  if (next.has(entry)) {
    next.delete(entry)
  } else {
    next.add(entry)
  }
  return next
}

// ── Data pipeline hook ───────────────────────────────────────────────────────

function useDataPipeline<T>({
  data,
  columns,
  searchQuery,
  searchKeys,
  filterRules,
  filterGroups,
  sortRules,
  pagination,
  page,
  perPage,
}: {
  data: T[]
  columns: DataTableColumnDef<T>[]
  searchQuery: string
  searchKeys: string[] | undefined
  filterRules: DataTableFilterRule[]
  filterGroups: DataTableFilterGroup[]
  sortRules: DataTableSortRule[]
  pagination: boolean
  page: number
  perPage: number
}) {
  const resolvedSearchKeys = useMemo(() => {
    if (searchKeys) return searchKeys
    return columns.filter((c) => c.type === "string").map((c) => c.key)
  }, [searchKeys, columns])

  const searched = useMemo(() => {
    if (!searchQuery.trim()) return data
    const q = searchQuery.toLowerCase()
    return data.filter((row) =>
      resolvedSearchKeys.some((key) => {
        const col = columns.find((c) => c.key === key)
        if (!col) return false
        const val = getCellValue(row, col)
        return String(val ?? "").toLowerCase().includes(q)
      }),
    )
  }, [data, searchQuery, resolvedSearchKeys, columns])

  const filterableCols = useMemo(
    () => columns.filter((c) => c.type !== "custom"),
    [columns],
  )

  const filtered = useMemo(() => {
    return searched.filter((row) => {
      const topLevelPass = filterRules.every((rule) =>
        matchesFilterRule(row, rule, filterableCols),
      )
      if (!topLevelPass) return false
      return filterGroups.every((group) => {
        const method = group.logic === "or" ? "some" : "every"
        if (group.rules.length === 0) return true
        return group.rules[method]((rule) =>
          matchesFilterRule(row, rule, filterableCols),
        )
      })
    })
  }, [searched, filterRules, filterGroups, filterableCols])

  const sorted = useMemo(
    () => applySort(filtered, sortRules, columns),
    [filtered, sortRules, columns],
  )

  const paged = useMemo(() => {
    if (!pagination) return sorted
    return sorted.slice((page - 1) * perPage, page * perPage)
  }, [sorted, pagination, page, perPage])

  return { sorted, paged, filterableCols }
}

// ── Group spans hook ─────────────────────────────────────────────────────────

type GroupSpan<T> =
  | { type: "single"; col: DataTableColumnDef<T> }
  | { type: "group"; groupKey: string; label: string; span: number }

function useGroupSpans<T>(
  visibleCols: DataTableColumnDef<T>[],
  columnGroups?: DataTableColumnGroup[],
) {
  const groupMap = useMemo(() => {
    const map = new Map<string, DataTableColumnGroup>()
    columnGroups?.forEach((g) => map.set(g.key, g))
    return map
  }, [columnGroups])

  return useMemo(() => {
    const spans: GroupSpan<T>[] = []
    const gvCols = new Map<string, DataTableColumnDef<T>[]>()
    let hasAnyGroup = false

    for (const col of visibleCols) {
      if (col.group && groupMap.has(col.group)) {
        hasAnyGroup = true
        const last = spans[spans.length - 1]
        if (last?.type === "group" && last.groupKey === col.group) {
          last.span++
        } else {
          spans.push({
            type: "group",
            groupKey: col.group,
            label: groupMap.get(col.group)!.label,
            span: 1,
          })
        }
        const arr = gvCols.get(col.group) || []
        arr.push(col)
        gvCols.set(col.group, arr)
      } else {
        spans.push({ type: "single", col })
      }
    }
    return { groupSpans: spans, hasGroups: hasAnyGroup, groupedVisibleCols: gvCols }
  }, [visibleCols, groupMap])
}

// ── Drag helpers ─────────────────────────────────────────────────────────────

function useDragReorder(
  enabled: boolean,
  onDrop: (sourceKey: string, targetKey: string) => void,
) {
  const sourceRef = useRef<string | null>(null)
  const [overKey, setOverKey] = useState<string | null>(null)

  const makeDragProps = useCallback(
    (colKey: string) => {
      if (!enabled) return {}
      return {
        draggable: true as const,
        onDragStart: (e: React.DragEvent) => {
          sourceRef.current = colKey
          e.dataTransfer.effectAllowed = "move" as const
        },
        onDragOver: (e: React.DragEvent) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = "move" as const
          if (sourceRef.current !== colKey) setOverKey(colKey)
        },
        onDragLeave: () => setOverKey(null),
        onDrop: (e: React.DragEvent) => {
          e.preventDefault()
          setOverKey(null)
          if (sourceRef.current && sourceRef.current !== colKey) {
            onDrop(sourceRef.current, colKey)
          }
          sourceRef.current = null
        },
        onDragEnd: () => {
          sourceRef.current = null
          setOverKey(null)
        },
      }
    },
    [enabled, onDrop],
  )

  return { overKey, makeDragProps }
}

// ── Table header component ───────────────────────────────────────────────────

function DataTableHeader<T>({
  selectable,
  expandable,
  batchExpandable,
  hasGroups,
  groupSpans,
  columnGroups,
  groupedVisibleCols,
  sortRules,
  onSort,
  reorderable,
  onColumnDrag,
  renderActions,
  thClass,
  allChecked,
  someChecked,
  toggleAllChecked,
  allExpanded,
  toggleAllExpanded,
}: {
  selectable: boolean
  expandable: boolean
  batchExpandable: boolean
  hasGroups: boolean
  groupSpans: GroupSpan<T>[]
  columnGroups?: DataTableColumnGroup[]
  groupedVisibleCols: Map<string, DataTableColumnDef<T>[]>
  sortRules: DataTableSortRule[]
  onSort: (key: string) => void
  reorderable: boolean
  onColumnDrag: (sourceKey: string, targetKey: string) => void
  renderActions: boolean
  thClass: string
  allChecked: boolean
  someChecked: boolean
  toggleAllChecked: () => void
  allExpanded: boolean
  toggleAllExpanded: () => void
}) {
  const rowSpan = hasGroups ? 2 : 1
  const { overKey: dragOverKey, makeDragProps } = useDragReorder(reorderable, onColumnDrag)
  return (
    <thead
      data-slot="data-table-header"
      className="sticky top-0 z-10 bg-[#F2F4F7] [&_tr]:border-b-2 [&_tr]:border-[#2F45B5]"
    >
      <tr data-slot="data-table-row">
        {selectable && (
          <th
            data-slot="data-table-head"
            rowSpan={rowSpan}
            className={cn(
              thClass,
              "w-12 text-center align-middle font-medium text-xs border-b-2 border-[#2F45B5] bg-[#F2F4F7]",
            )}
          >
            <input
              type="checkbox"
              checked={allChecked}
              ref={(el) => {
                if (el) el.indeterminate = someChecked
              }}
              onChange={toggleAllChecked}
              title="Select all"
              className="size-4 accent-primary cursor-pointer"
            />
          </th>
        )}
        {expandable && (
          <th
            data-slot="data-table-head"
            rowSpan={rowSpan}
            className={cn(
              thClass,
              "w-12 text-center align-middle font-medium text-xs border-b-2 border-[#2F45B5] bg-[#F2F4F7]",
            )}
          >
            {batchExpandable && (
              <button
                onClick={toggleAllExpanded}
                title={allExpanded ? "Collapse all" : "Expand all"}
                className={cn(
                  "inline-flex items-center justify-center size-7 rounded-md transition-all",
                  allExpanded ? "rotate-90 bg-primary/10" : "hover:bg-muted",
                )}
              >
                <ChevronRightIcon className="text-primary" />
              </button>
            )}
          </th>
        )}
        {groupSpans.map((gs, i) => {
          const isSortable = gs.type === "single" && gs.col.sortable !== false && gs.col.type !== "custom"
          const colKey = gs.type === "single" ? gs.col.key : gs.groupKey
          const isDragOver = dragOverKey === colKey
          return gs.type === "single" ? (
            <th
              key={i}
              data-slot="data-table-head"
              rowSpan={rowSpan}
              onClick={isSortable ? () => onSort(gs.col.key) : undefined}
              {...makeDragProps(colKey)}
              className={cn(
                thClass,
                "align-middle font-medium text-xs whitespace-nowrap text-[#465364] border-b-2 border-[#2F45B5] bg-[#F2F4F7]",
                gs.col.type === "number" ? "text-right" : "text-left",
                isSortable && "cursor-pointer select-none",
                reorderable && "cursor-grab active:cursor-grabbing",
                isDragOver && "border-l-2 border-l-primary",
              )}
            >
              {isSortable ? (
                <DataTableSortHeader col={gs.col} sortRules={sortRules} />
              ) : (
                <span className="inline-flex items-center gap-0.5">
                  {gs.col.label}
                </span>
              )}
            </th>
          ) : (
            <th
              key={i}
              data-slot="data-table-group-head"
              colSpan={gs.span}
              className="px-2 pt-2 pb-0.5 text-center text-[11px] text-muted-foreground font-semibold tracking-wide whitespace-nowrap bg-[#F2F4F7] border-b-0"
            >
              <span className="border-b-2 border-primary/30 pb-0.5">
                {gs.label}
              </span>
            </th>
          )
        })}
        {renderActions && (
          <th
            data-slot="data-table-head"
            rowSpan={rowSpan}
            className={cn(
              thClass,
              "text-left align-middle font-medium text-xs whitespace-nowrap text-[#465364] border-b-2 border-[#2F45B5] bg-[#F2F4F7] w-20",
            )}
          >
            Action
          </th>
        )}
      </tr>
      {hasGroups && (
        <tr data-slot="data-table-row">
          {columnGroups?.map((group) => {
            const cols = groupedVisibleCols.get(group.key)
            if (!cols?.length) return null
            return cols.map((col) => {
              const colSortable = col.sortable !== false && col.type !== "custom"
              return (
                <th
                  key={col.key}
                  data-slot="data-table-head"
                  onClick={colSortable ? () => onSort(col.key) : undefined}
                  className={cn(
                    thClass,
                    "align-middle font-medium text-xs whitespace-nowrap text-[#465364] border-b-2 border-[#2F45B5] bg-[#F2F4F7]",
                    col.type === "number" ? "text-right" : "text-left",
                    colSortable && "cursor-pointer select-none",
                  )}
                >
                  {colSortable ? (
                    <DataTableSortHeader col={col} sortRules={sortRules} />
                  ) : (
                    <span className="inline-flex items-center gap-0.5">
                      {col.label}
                    </span>
                  )}
                </th>
              )
            })
          })}
        </tr>
      )}
    </thead>
  )
}

// ── Table row component ──────────────────────────────────────────────────────

function DataTableRow<T>({
  row,
  rowId,
  rowRef,
  visibleCols,
  cellClass,
  selectable,
  isChecked,
  onToggleChecked,
  expandable,
  isExpanded,
  onToggleExpanded,
  isSelected,
  onSelectionChange,
  renderActions,
  renderExpandedRow,
  extraColsAfter,
}: {
  row: T
  rowId: string
  rowRef: (el: HTMLTableRowElement | null) => void
  visibleCols: DataTableColumnDef<T>[]
  cellClass: string
  selectable: boolean
  isChecked: boolean
  onToggleChecked: (id: string) => void
  expandable: boolean
  isExpanded: boolean
  onToggleExpanded: (id: string) => void
  isSelected: boolean
  onSelectionChange?: ((id: string | null) => void) | undefined
  renderActions?: ((row: T) => React.ReactNode) | undefined
  renderExpandedRow?: ((row: T) => React.ReactNode) | undefined
  extraColsAfter: number
}) {
  return (
    <React.Fragment>
      <tr
        ref={rowRef}
        data-slot="data-table-row"
        data-state={isSelected || isChecked ? "selected" : undefined}
        onClick={() => {
          if (!selectable) {
            onSelectionChange?.(isSelected ? null : rowId)
          }
        }}
        className={cn(
          "border-b border-[#F2F4F7] transition-colors hover:bg-[#B2D3FF22] data-[state=selected]:bg-[#94C2FF33] group/row",
          !selectable && onSelectionChange && "cursor-pointer",
        )}
      >
        {selectable && (
          <td
            data-slot="data-table-cell"
            className={cn(cellClass, "w-12 text-center")}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => onToggleChecked(rowId)}
              title="Select row"
              className="size-4 accent-primary cursor-pointer"
            />
          </td>
        )}
        {expandable && (
          <td
            data-slot="data-table-cell"
            className={cn(cellClass, "w-12 text-center")}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onToggleExpanded(rowId)}
              title={isExpanded ? "Collapse row" : "Expand row"}
              className={cn(
                "inline-flex items-center justify-center size-7 rounded-md transition-all",
                isExpanded ? "rotate-90 bg-primary/10" : "hover:bg-muted",
              )}
            >
              <ChevronRightIcon className="text-primary" />
            </button>
          </td>
        )}
        {visibleCols.map((col) => {
          const value = getCellValue(row, col)
          return (
            <td
              key={col.key}
              data-slot="data-table-cell"
              className={cn(
                cellClass,
                "align-middle whitespace-nowrap text-[13px]",
                col.type === "number" ? "text-right" : "text-left",
              )}
            >
              {col.renderCell
                ? col.renderCell(row, value)
                : col.type === "number"
                  ? <DefaultNumberCell value={value} />
                  : <DefaultStringCell value={value} />}
            </td>
          )
        })}
        {renderActions && (
          <td
            data-slot="data-table-cell"
            className={cn(cellClass, "align-middle w-20")}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="opacity-0 group-hover/row:opacity-100 transition-opacity">
              {renderActions(row)}
            </div>
          </td>
        )}
      </tr>
      {isExpanded && renderExpandedRow && (
        <tr
          data-slot="data-table-expanded-row"
          className="bg-muted/50 border-b border-border"
        >
          {(selectable || expandable) && (
            <td className="border-b border-border" />
          )}
          <td
            colSpan={visibleCols.length + extraColsAfter}
            className="px-6 py-4 text-sm text-muted-foreground leading-relaxed border-b border-border"
          >
            {renderExpandedRow(row)}
          </td>
        </tr>
      )}
    </React.Fragment>
  )
}

// ── Row height menu ──────────────────────────────────────────────────────────

const ROW_HEIGHT_OPTIONS: { label: string; value: DataTableDensity; icon: React.ReactNode }[] = [
  {
    label: "Short",
    value: "compact",
    icon: <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><path d="M3 6h18M3 10h18M3 14h18M3 18h18" /></svg>,
  },
  {
    label: "Medium",
    value: "default",
    icon: <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><path d="M3 5h18M3 12h18M3 19h18" /></svg>,
  },
  {
    label: "Tall",
    value: "relaxed",
    icon: <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><path d="M3 4h18M3 20h18" /></svg>,
  },
]

function RowHeightMenu({
  value,
  onChange,
}: {
  value: DataTableDensity
  onChange: (v: DataTableDensity) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        title="Row height"
        className={cn(
          "flex items-center gap-1.5 px-3 py-[5px] rounded-md text-xs font-medium border transition-colors select-none",
          open
            ? "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]"
            : "text-muted-foreground border-transparent hover:bg-muted/50",
        )}
      >
        <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <path d="M3 5h18M3 12h18M3 19h18" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-[#F2F4F7] rounded-lg shadow-xl z-50 py-1">
          <p className="px-3 py-1.5 text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
            Select a row height
          </p>
          {ROW_HEIGHT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-1.5 text-xs transition-colors",
                opt.value === value
                  ? "text-[#1d4ed8] font-medium"
                  : "text-foreground hover:bg-muted/50",
              )}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

type ActivePanel = "hide" | "sort" | "filter" | null

function DataTable<T>({
  data,
  columns,
  columnGroups,
  title = "Data Table",
  subtitle,
  defaultHiddenColumns,
  defaultSortRules,
  getRowId,
  selectedRowId,
  onSelectionChange,
  renderActions,
  className,
  pagination = false,
  defaultPerPage = 10,
  perPageOptions = DEFAULT_PER_PAGE_OPTIONS,
  searchable = false,
  searchPlaceholder = "Search\u2026",
  searchKeys,
  selectable = false,
  batchActions,
  expandable = false,
  renderExpandedRow,
  batchExpandable = false,
  density = "default",
  reorderable = false,
  onColumnOrderChange,
}: DataTableProps<T>) {
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(
    () => new Set(defaultHiddenColumns ?? []),
  )
  const [sortRules, setSortRules] = useState<DataTableSortRule[]>(
    defaultSortRules ?? [],
  )
  const [filterRules, setFilterRules] = useState<DataTableFilterRule[]>([])
  const [filterGroups, setFilterGroups] = useState<DataTableFilterGroup[]>([])
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)
  const [columnOrder, setColumnOrder] = useState<string[]>(
    () => columns.map((c) => c.key),
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(defaultPerPage)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toolbarRef = useRef<HTMLDivElement>(null)
  const hideBtnRef = useRef<HTMLDivElement>(null)
  const filterBtnRef = useRef<HTMLDivElement>(null)
  const sortBtnRef = useRef<HTMLDivElement>(null)
  const openPanelRef = useRef<HTMLDivElement | null>(null)
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({})

  // Auto-scroll selected row into view
  useEffect(() => {
    if (selectedRowId && rowRefs.current[selectedRowId]) {
      rowRefs.current[selectedRowId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })
    }
  }, [selectedRowId])

  // Close panel on outside click
  useEffect(() => {
    if (!activePanel) return
    function handler(e: MouseEvent) {
      const t = e.target as Node
      if (toolbarRef.current?.contains(t)) return
      if (openPanelRef.current?.contains(t)) return
      setActivePanel(null)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [activePanel])

  // ── Data pipeline ────────────────────────────────────────────────────
  const { sorted, paged, filterableCols } = useDataPipeline({
    data,
    columns,
    searchQuery,
    searchKeys,
    filterRules,
    filterGroups,
    sortRules,
    pagination,
    page,
    perPage,
  })

  // Reset page when filters/search change
  useEffect(() => {
    setPage(1)
  }, [searchQuery, filterRules, filterGroups])

  // ── Visible columns ─────────────────────────────────────────────────
  const visibleCols = useMemo(() => {
    const visible = columns.filter((c) => !hiddenCols.has(c.key))
    if (!reorderable) return visible
    return [...visible].sort(
      (a, b) => columnOrder.indexOf(a.key) - columnOrder.indexOf(b.key),
    )
  }, [columns, hiddenCols, reorderable, columnOrder])

  // ── Group spans for header row ──────────────────────────────────────
  const { groupSpans, hasGroups, groupedVisibleCols } = useGroupSpans(
    visibleCols,
    columnGroups,
  )

  // ── Batch selection helpers ─────────────────────────────────────────
  const allRowIds = useMemo(() => {
    if (!getRowId) return new Set<string>()
    return new Set(sorted.map((r) => getRowId(r)))
  }, [sorted, getRowId])

  const allChecked = selectable && checkedIds.size > 0 && checkedIds.size === allRowIds.size
  const someChecked = selectable && checkedIds.size > 0 && checkedIds.size < allRowIds.size

  const toggleAllChecked = useCallback(() => {
    setCheckedIds(allChecked ? new Set() : new Set(allRowIds))
  }, [allChecked, allRowIds])

  const toggleChecked = useCallback(
    (id: string) => setCheckedIds((prev) => toggleSetEntry(prev, id)),
    [],
  )

  // ── Expansion helpers ───────────────────────────────────────────────
  const allExpanded =
    expandable && allRowIds.size > 0 && expandedIds.size === allRowIds.size

  const toggleAllExpanded = useCallback(() => {
    setExpandedIds(allExpanded ? new Set() : new Set(allRowIds))
  }, [allExpanded, allRowIds])

  const toggleExpanded = useCallback(
    (id: string) => setExpandedIds((prev) => toggleSetEntry(prev, id)),
    [],
  )

  // ── Callbacks ───────────────────────────────────────────────────────
  const togglePanel = useCallback(
    (p: ActivePanel) => setActivePanel((prev) => (prev === p ? null : p)),
    [],
  )
  const toggleCol = useCallback(
    (key: string) => setHiddenCols((prev) => toggleSetEntry(prev, key)),
    [],
  )

  const handleColumnDrag = useCallback(
    (sourceKey: string, targetKey: string) => {
      setColumnOrder((prev) => {
        const next = [...prev]
        const fromIdx = next.indexOf(sourceKey)
        const toIdx = next.indexOf(targetKey)
        if (fromIdx === -1 || toIdx === -1) return prev
        next.splice(fromIdx, 1)
        next.splice(toIdx, 0, sourceKey)
        onColumnOrderChange?.(next)
        return next
      })
    },
    [onColumnOrderChange],
  )

  const sortableCols = useMemo(
    () => columns.filter((c) => c.sortable !== false && c.type !== "custom"),
    [columns],
  )
  const addSort = useCallback(() => {
    const unused = sortableCols.find(
      (c) => !sortRules.some((r) => r.key === c.key),
    )
    if (!unused) return
    setSortRules((prev) => [...prev, { key: unused.key, dir: "desc" }])
  }, [sortableCols, sortRules])
  const updateSort = useCallback(
    (idx: number, changes: Partial<DataTableSortRule>) => {
      setSortRules((prev) =>
        prev.map((r, i) => (i === idx ? { ...r, ...changes } : r)),
      )
    },
    [],
  )
  const removeSort = useCallback(
    (idx: number) =>
      setSortRules((prev) => prev.filter((_, i) => i !== idx)),
    [],
  )
  const reorderSort = useCallback(
    (fromIdx: number, toIdx: number) => {
      setSortRules((prev) => {
        const next = [...prev]
        const [moved] = next.splice(fromIdx, 1)
        next.splice(toIdx, 0, moved)
        return next
      })
    },
    [],
  )
  const toggleSort = useCallback((key: string) => {
    setSortRules((prev) => {
      const others = prev.filter((r) => r.key !== key)
      const existing = prev.find((r) => r.key === key)
      if (!existing) return [{ key, dir: "asc" as DataTableSortDirection }, ...others]
      if (existing.dir === "asc") return [{ key, dir: "desc" as DataTableSortDirection }, ...others]
      return others
    })
  }, [])

  const addFilter = useCallback(() => {
    const firstFilterable = filterableCols[0]
    if (!firstFilterable) return
    setFilterRules((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        key: firstFilterable.key,
        op: firstFilterable.type === "number" ? ">" : "contains",
        value: "",
      },
    ])
  }, [filterableCols])
  const updateFilter = useCallback(
    (id: string, changes: Partial<DataTableFilterRule>) => {
      setFilterRules((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...changes } : r)),
      )
    },
    [],
  )
  const removeFilter = useCallback(
    (id: string) => setFilterRules((prev) => prev.filter((r) => r.id !== id)),
    [],
  )
  const reorderFilter = useCallback(
    (fromIdx: number, toIdx: number) => {
      setFilterRules((prev) => {
        const next = [...prev]
        const [moved] = next.splice(fromIdx, 1)
        next.splice(toIdx, 0, moved)
        return next
      })
    },
    [],
  )

  const addFilterGroup = useCallback(() => {
    setFilterGroups((prev) => [
      ...prev,
      { id: crypto.randomUUID(), logic: "and", rules: [] },
    ])
  }, [])
  const addToFilterGroup = useCallback(
    (groupId: string) => {
      const firstFilterable = filterableCols[0]
      if (!firstFilterable) return
      setFilterGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? {
                ...g,
                rules: [
                  ...g.rules,
                  {
                    id: crypto.randomUUID(),
                    key: firstFilterable.key,
                    op: firstFilterable.type === "number" ? ">" : ("contains" as DataTableFilterOp),
                    value: "",
                  },
                ],
              }
            : g,
        ),
      )
    },
    [filterableCols],
  )
  const removeFromFilterGroup = useCallback(
    (groupId: string, ruleId: string) => {
      setFilterGroups((prev) =>
        prev.map((g) =>
          g.id === groupId ? { ...g, rules: g.rules.filter((r) => r.id !== ruleId) } : g,
        ),
      )
    },
    [],
  )
  const updateInFilterGroup = useCallback(
    (groupId: string, ruleId: string, changes: Partial<DataTableFilterRule>) => {
      setFilterGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, rules: g.rules.map((r) => (r.id === ruleId ? { ...r, ...changes } : r)) }
            : g,
        ),
      )
    },
    [],
  )
  const updateFilterGroupLogic = useCallback(
    (groupId: string, logic: DataTableFilterGroupLogic) => {
      setFilterGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, logic } : g)),
      )
    },
    [],
  )
  const removeFilterGroup = useCallback(
    (groupId: string) => {
      setFilterGroups((prev) => prev.filter((g) => g.id !== groupId))
    },
    [],
  )

  const activeHide = hiddenCols.size > 0
  const activeSort = sortRules.length > 0
  const activeFilterCount =
    filterRules.filter((r) => r.value.trim()).length +
    filterGroups.reduce((sum, g) => sum + g.rules.filter((r) => r.value.trim()).length, 0)
  const activeFilter = activeFilterCount > 0

  const subtitleText = subtitle ?? buildSubtitle(sorted.length, data.length)

  const showBatchBar = selectable && checkedIds.size > 0

  const hideBadge = activeHide
    ? <Pill count={hiddenCols.size} className="bg-[#1d4ed8] text-white" />
    : undefined
  const filterBadge = activeFilter
    ? <Pill count={activeFilterCount} className="bg-[#1d4ed8] text-white" />
    : undefined
  const sortBadge = activeSort
    ? <Pill count={sortRules.length} className="bg-[#1d4ed8] text-white" />
    : undefined

  // Count extra columns (checkbox, expand chevron, actions)
  const extraColsBefore = (selectable ? 1 : 0) + (expandable ? 1 : 0)
  const extraColsAfter = renderActions ? 1 : 0
  const totalColSpan = visibleCols.length + extraColsBefore + extraColsAfter

  const [activeDensity, setActiveDensity] = useState<DataTableDensity>(density)
  const cellClass = DENSITY_CLASSES[activeDensity]
  const thClass = DENSITY_TH_CLASSES[activeDensity]

  return (
    <div
      data-slot="data-table"
      className={cn(
        "flex flex-col bg-white rounded-lg border border-[#F2F4F7] overflow-hidden",
        className,
      )}
    >
      {/* Batch action bar */}
      {showBatchBar ? (
        <div
          data-slot="data-table-batch-bar"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2F45B5] text-white flex-shrink-0"
        >
          <span className="mr-auto text-[13px] font-medium">
            {checkedIds.size} item{checkedIds.size > 1 ? "s" : ""} selected
          </span>
          {batchActions?.map((action) => (
            <button
              key={action.label}
              onClick={() => action.onClick(checkedIds)}
              className="px-3 py-1 rounded border border-white/40 text-white text-xs font-medium hover:bg-white/10 transition-colors"
            >
              {action.label}
            </button>
          ))}
          <button
            onClick={() => setCheckedIds(new Set())}
            title="Clear selection"
            className="px-2 py-1 text-white/80 hover:text-white text-base"
          >
            ✕
          </button>
        </div>
      ) : (
        /* Toolbar */
        <div
          ref={toolbarRef}
          data-slot="data-table-toolbar"
          className="relative flex items-center px-4 py-3 flex-shrink-0 sticky top-0 z-20 bg-white border-b border-[#F2F4F7]"
        >
          <span className="text-[15px] font-semibold text-foreground leading-tight">
            {title}
            <span className="text-xs text-[#5F7087] font-normal ml-2">{subtitleText}</span>
          </span>

          <div className="ml-auto flex items-center gap-1 flex-shrink-0">
            {/* Search */}
            {searchable && (
              <div className="relative mr-2">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="text-xs border border-input rounded pl-8 pr-2.5 py-1.5 bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary w-52"
                />
              </div>
            )}
            {/* Hide Fields */}
            <div ref={hideBtnRef}>
              <ToolbarBtn
                active={activeHide || activePanel === "hide"}
                activeClass="bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]"
                onClick={() => togglePanel("hide")}
                label="Hide fields"
                badge={hideBadge}
                icon={<HideFieldsIcon />}
              />
              {activePanel === "hide" && (
                <PortalDropdown
                  ref={openPanelRef}
                  triggerRef={hideBtnRef}
                  placement="below"
                >
                  <HidePanel
                    columns={columns}
                    columnGroups={columnGroups}
                    hiddenCols={hiddenCols}
                    onToggle={toggleCol}
                  />
                </PortalDropdown>
              )}
            </div>
            {/* Filter */}
            <div ref={filterBtnRef}>
              <ToolbarBtn
                active={activeFilter || activePanel === "filter"}
                activeClass="bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]"
                onClick={() => togglePanel("filter")}
                label="Filter"
                badge={filterBadge}
                icon={<FilterIcon />}
              />
              {activePanel === "filter" && (
                <PortalDropdown
                  ref={openPanelRef}
                  triggerRef={filterBtnRef}
                  placement="below"
                >
                  <FilterPanel
                    columns={columns}
                    data={data}
                    filterRules={filterRules}
                    filterGroups={filterGroups}
                    onAdd={addFilter}
                    onUpdate={updateFilter}
                    onRemove={removeFilter}
                    onAddGroup={addFilterGroup}
                    onAddToGroup={addToFilterGroup}
                    onRemoveFromGroup={removeFromFilterGroup}
                    onUpdateInGroup={updateInFilterGroup}
                    onUpdateGroupLogic={updateFilterGroupLogic}
                    onRemoveGroup={removeFilterGroup}
                    onReorder={reorderFilter}
                  />
                </PortalDropdown>
              )}
            </div>
            {/* Sort */}
            <div ref={sortBtnRef}>
              <ToolbarBtn
                active={activeSort || activePanel === "sort"}
                activeClass="bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]"
                onClick={() => togglePanel("sort")}
                label="Sort"
                badge={sortBadge}
                icon={<SortIcon />}
              />
              {activePanel === "sort" && (
                <PortalDropdown
                  ref={openPanelRef}
                  triggerRef={sortBtnRef}
                  placement="below"
                >
                  <SortPanel
                    columns={columns}
                    sortRules={sortRules}
                    onAdd={addSort}
                    onUpdate={updateSort}
                    onRemove={removeSort}
                    onReorder={reorderSort}
                  />
                </PortalDropdown>
              )}
            </div>
            {/* Row Height */}
            <RowHeightMenu value={activeDensity} onChange={setActiveDensity} />
          </div>
        </div>
      )}

      {/* Table */}
      <div
        data-slot="data-table-container"
        className="relative w-full overflow-auto"
      >
        <table
          data-slot="data-table-element"
          className="w-full caption-bottom text-sm border-collapse"
        >
          <DataTableHeader
            selectable={selectable}
            expandable={expandable}
            batchExpandable={batchExpandable}
            hasGroups={hasGroups}
            groupSpans={groupSpans}
            columnGroups={columnGroups}
            groupedVisibleCols={groupedVisibleCols}
            sortRules={sortRules}
            onSort={toggleSort}
            reorderable={reorderable}
            onColumnDrag={handleColumnDrag}
            renderActions={!!renderActions}
            thClass={thClass}
            allChecked={allChecked}
            someChecked={someChecked}
            toggleAllChecked={toggleAllChecked}
            allExpanded={allExpanded}
            toggleAllExpanded={toggleAllExpanded}
          />

          <tbody
            data-slot="data-table-body"
            className="[&_tr:last-child]:border-0"
          >
            {paged.map((row, rowIdx) => {
              const rowId = getRowId ? getRowId(row) : String(rowIdx)
              return (
                <DataTableRow
                  key={rowId}
                  row={row}
                  rowId={rowId}
                  rowRef={(el) => {
                    rowRefs.current[rowId] = el
                  }}
                  visibleCols={visibleCols}
                  cellClass={cellClass}
                  selectable={selectable}
                  isChecked={selectable && checkedIds.has(rowId)}
                  onToggleChecked={toggleChecked}
                  expandable={expandable}
                  isExpanded={expandable && expandedIds.has(rowId)}
                  onToggleExpanded={toggleExpanded}
                  isSelected={selectedRowId != null && rowId === selectedRowId}
                  onSelectionChange={onSelectionChange}
                  renderActions={renderActions}
                  renderExpandedRow={renderExpandedRow}
                  extraColsAfter={extraColsAfter}
                />
              )
            })}
            {paged.length === 0 && (
              <tr data-slot="data-table-row">
                <td
                  data-slot="data-table-cell"
                  colSpan={totalColSpan}
                  className="py-10 px-6 text-center text-muted-foreground text-sm"
                >
                  No data to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <DataTablePagination
          total={sorted.length}
          page={page}
          perPage={perPage}
          onPage={setPage}
          onPerPage={setPerPage}
          perPageOptions={perPageOptions}
        />
      )}
    </div>
  )
}

export { DataTable, DataTablePagination }
