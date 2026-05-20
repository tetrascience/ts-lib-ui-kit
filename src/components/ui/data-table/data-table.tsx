"use client"

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  type ColumnDef,
  type ColumnOrderState,
  type Header,
  type PaginationState,
  type RowData,
  type SortingState,
  type Table as TanStackTable,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, ChevronDownIcon, ChevronRightIcon, GripVerticalIcon } from "lucide-react"
import * as React from "react"

import { DataTablePagination } from "./data-table-pagination"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Module augmentation — column meta
// ---------------------------------------------------------------------------

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    truncate?: boolean
  }
}

// ---------------------------------------------------------------------------
// Filter types
// ---------------------------------------------------------------------------

type FilterOperator =
  | "contains"
  | "equals"
  | "not_equals"
  | "starts_with"
  | "ends_with"
  | "is_empty"
  | "is_not_empty"

interface FilterCondition {
  /** Stable unique key for React reconciliation. */
  id: string
  columnId: string
  operator: FilterOperator
  value: string
}

interface FilterColumnConfig {
  columnId: string
  label?: string
  operators?: FilterOperator[]
}

// ---------------------------------------------------------------------------
// Grouping types
// ---------------------------------------------------------------------------

interface GroupColumnConfig {
  columnId: string
  label?: string
}

function applyFilterCondition(
  cellValue: string,
  operator: FilterOperator,
  filterValue: string,
): boolean {
  const cell = cellValue.toLowerCase().trim()
  const filter = filterValue.toLowerCase().trim()
  switch (operator) {
    case "contains":      return cell.includes(filter)
    case "equals":        return cell === filter
    case "not_equals":    return cell !== filter
    case "starts_with":   return cell.startsWith(filter)
    case "ends_with":     return cell.endsWith(filter)
    case "is_empty":      return cell === ""
    case "is_not_empty":  return cell !== ""
    default: {
      const _exhaustive: never = operator
      void _exhaustive
      return true
    }
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface TableContextValue<TData> {
  table: TanStackTable<TData>
  columnLabels: Record<string, string>
  setColumnLabel: (columnId: string, label: string) => void
  filters: FilterCondition[]
  setFilters: (filters: FilterCondition[]) => void
  filterConfig: FilterColumnConfig[]
  enableFiltering: boolean
  grouping: string | null
  setGrouping: (columnId: string | null) => void
  groupConfig: GroupColumnConfig[]
  enableGrouping: boolean
}

const TableContext = React.createContext<TableContextValue<unknown> | null>(null)

function useDataTable<TData = unknown>() {
  const ctx = React.useContext(TableContext) as TableContextValue<TData> | null
  if (!ctx) {
    throw new Error("useDataTable must be used within a <DataTable>")
  }
  return ctx
}

// ---------------------------------------------------------------------------
// DraggableHeader
// ---------------------------------------------------------------------------

function DraggableHeader<TData>({
  header,
  children,
  position,
  numeric,
  truncate,
}: {
  header: Header<TData, unknown>
  children: React.ReactNode
  position?: "first" | "last" | "middle"
  numeric?: boolean
  truncate?: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: header.column.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(
      transform ? { ...transform, scaleX: 1, scaleY: 1 } : null,
    ),
    transition,
    position: "relative",
  }

  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      variant={numeric ? "numeric" : undefined}
      truncate={truncate}
      className={cn(
        "group/header transition-shadow duration-150",
        !isDragging && position === "first" && "hover:shadow-[inset_-1px_0_0_0_var(--color-border)]",
        !isDragging && position === "last" && "hover:shadow-[inset_1px_0_0_0_var(--color-border)]",
        !isDragging && position === "middle" && "hover:shadow-[inset_1px_0_0_0_var(--color-border),inset_-1px_0_0_0_var(--color-border)]",
        isDragging && "opacity-40",
      )}
    >
      <div className={cn("flex items-center gap-1 min-w-0", numeric && "flex-row-reverse")}>
        <div className="flex-1 min-w-0">{children}</div>
        <button
          type="button"
          data-drag-handle=""
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing opacity-0 group-hover/header:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="size-3.5" />
        </button>
      </div>
    </TableHead>
  )
}

// ---------------------------------------------------------------------------
// Shared header / body renderers (extracted to reduce cognitive complexity)
// ---------------------------------------------------------------------------

interface SortableHeaderContentProps {
  header: Header<unknown, unknown>
  enableSorting: boolean
  numericColumns: Set<string>
  columnLabels: Record<string, string>
  truncate?: boolean
}

function SortableHeaderContent({
  header,
  enableSorting,
  numericColumns,
  columnLabels,
  truncate,
}: SortableHeaderContentProps) {
  if (header.isPlaceholder) return null
  const canSort = enableSorting && header.column.getCanSort()
  const sorted = header.column.getIsSorted()
  const isNumeric = numericColumns.has(header.column.id)

  return (
    <div
      className={cn(
        "flex items-center gap-1 min-w-0",
        canSort && "group/sort cursor-pointer select-none",
        isNumeric && "flex-row-reverse",
      )}
      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && canSort) {
          header.column.getToggleSortingHandler()
        }
      }}
    >
      <span className={cn("min-w-0", truncate && "truncate")}>
        {columnLabels[header.column.id] ??
          flexRender(header.column.columnDef.header, header.getContext())}
      </span>
      {canSort && (
        <span
          className={cn(
            !sorted && "opacity-0 group-hover/sort:opacity-100 transition-opacity",
          )}
        >
          {sorted === "asc" ? (
            <ArrowUpIcon className="size-3.5 text-foreground" />
          ) : sorted === "desc" ? (
            <ArrowDownIcon className="size-3.5 text-foreground" />
          ) : (
            <ArrowUpDownIcon className="size-3.5 text-muted-foreground" />
          )}
        </span>
      )}
    </div>
  )
}

type RowOf<TData> = ReturnType<TanStackTable<TData>["getRowModel"]>["rows"][number]

const EMPTY_GROUP_KEY = "—"

function bucketRowsByGroup<TData>(rows: RowOf<TData>[], grouping: string) {
  const buckets = new Map<string, RowOf<TData>[]>()
  const rawByKey = new Map<string, unknown>()
  for (const row of rows) {
    const raw = row.getValue(grouping)
    const isEmpty = raw == null || raw === ""
    const key = isEmpty ? EMPTY_GROUP_KEY : String(raw)
    const bucket = buckets.get(key)
    if (bucket) {
      bucket.push(row)
    } else {
      buckets.set(key, [row])
      rawByKey.set(key, isEmpty ? null : raw)
    }
  }

  const keys = [...buckets.keys()]
  const allNumeric = keys.every((k) => k === EMPTY_GROUP_KEY || typeof rawByKey.get(k) === "number")
  keys.sort((a, b) => {
    if (a === EMPTY_GROUP_KEY) return 1
    if (b === EMPTY_GROUP_KEY) return -1
    if (allNumeric) return (rawByKey.get(a) as number) - (rawByKey.get(b) as number)
    return a.localeCompare(b, undefined, { sensitivity: "base", numeric: true })
  })

  return { order: keys, buckets }
}

function resolveGroupLabel<TData>(
  table: TanStackTable<TData>,
  grouping: string,
  groupConfig: GroupColumnConfig[],
  columnLabels: Record<string, string>,
): string {
  const groupColumn = table.getColumn(grouping)
  return (
    groupConfig.find((g) => g.columnId === grouping)?.label ??
    columnLabels[grouping] ??
    (typeof groupColumn?.columnDef.header === "string"
      ? groupColumn.columnDef.header
      : grouping)
  )
}

interface DataRowProps<TData> {
  row: RowOf<TData>
  numericColumns: Set<string>
  truncate?: boolean
}

function DataRow<TData>({ row, numericColumns, truncate }: DataRowProps<TData>) {
  return (
    <TableRow data-state={row.getIsSelected() ? "selected" : undefined}>
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          variant={numericColumns.has(cell.column.id) ? "numeric" : undefined}
          truncate={truncate && (cell.column.columnDef.meta?.truncate ?? true)}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

interface GroupHeaderRowProps {
  groupKey: string
  groupLabel: string
  isExpanded: boolean
  colSpan: number
  onToggle: () => void
}

function GroupHeaderRow({
  groupKey,
  groupLabel,
  isExpanded,
  colSpan,
  onToggle,
}: GroupHeaderRowProps) {
  return (
    <TableRow data-slot="data-table-group-header">
      <TableCell colSpan={colSpan} className="p-0 font-medium">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? "Collapse" : "Expand"} group ${groupKey}`}
          className="flex w-full items-center gap-2 text-left p-4 in-data-[density=compact]:py-2 in-data-[density=relaxed]:py-5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          {isExpanded ? (
            <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground" />
          )}
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {groupLabel}
          </span>
          <span className="truncate">{groupKey}</span>
        </button>
      </TableCell>
    </TableRow>
  )
}

interface GroupedRowsProps<TData> {
  table: TanStackTable<TData>
  numericColumns: Set<string>
  truncate?: boolean
  grouping: string
  groupConfig: GroupColumnConfig[]
  columnLabels: Record<string, string>
  collapsedGroups: Set<string>
  onToggleGroup: (key: string) => void
}

function GroupedRows<TData>({
  table,
  numericColumns,
  truncate,
  grouping,
  groupConfig,
  columnLabels,
  collapsedGroups,
  onToggleGroup,
}: GroupedRowsProps<TData>) {
  const visibleColumnCount = table.getVisibleLeafColumns().length
  const rows = table.getSortedRowModel().rows
  if (rows.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={visibleColumnCount} className="h-24 text-center text-muted-foreground">
          No results.
        </TableCell>
      </TableRow>
    )
  }

  const { order, buckets } = bucketRowsByGroup(rows, grouping)
  const groupLabel = resolveGroupLabel(table, grouping, groupConfig, columnLabels)

  return (
    <>
      {order.map((key) => {
        const groupRows = buckets.get(key) ?? []
        const isExpanded = !collapsedGroups.has(key)
        return (
          <React.Fragment key={`group-${key}`}>
            <GroupHeaderRow
              groupKey={key}
              groupLabel={groupLabel}
              isExpanded={isExpanded}
              colSpan={visibleColumnCount}
              onToggle={() => onToggleGroup(key)}
            />
            {isExpanded &&
              groupRows.map((row) => (
                <DataRow
                  key={row.id}
                  row={row}
                  numericColumns={numericColumns}
                  truncate={truncate}
                />
              ))}
          </React.Fragment>
        )
      })}
    </>
  )
}

function deriveNumericColumns<TData>(
  data: TData[],
  columns: ColumnDef<TData, unknown>[],
): Set<string> {
  if (data.length === 0) return new Set<string>()
  const first = data[0] as Record<string, unknown>
  const ids = new Set<string>()
  for (const col of columns) {
    const key = "accessorKey" in col ? String(col.accessorKey) : ""
    if (key && typeof first[key] === "number") ids.add(key)
  }
  return ids
}

function deriveAccessorConfig<TData>(
  columns: ColumnDef<TData, unknown>[],
): { columnId: string }[] {
  return columns
    .filter((col) => "accessorKey" in col)
    .map((col) => ({ columnId: String((col as { accessorKey: unknown }).accessorKey) }))
}

function applyClientFilters<TData>(data: TData[], filters: FilterCondition[]): TData[] {
  const active = filters.filter(
    (f) =>
      f.columnId &&
      f.operator &&
      (f.value.trim() !== "" || f.operator === "is_empty" || f.operator === "is_not_empty"),
  )
  if (active.length === 0) return data
  return data.filter((row) =>
    active.every((condition) => {
      const cellValue = String((row as Record<string, unknown>)[condition.columnId] ?? "")
      return applyFilterCondition(cellValue, condition.operator, condition.value)
    }),
  )
}

function useColumnReorder<TData>(
  table: TanStackTable<TData>,
  columnOrder: ColumnOrderState,
) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const [draggingColumnId, setDraggingColumnId] = React.useState<string | null>(null)

  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    setDraggingColumnId(String(event.active.id))
  }, [])

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      setDraggingColumnId(null)
      const { active, over } = event
      if (!over || active.id === over.id) return
      const currentOrder =
        columnOrder.length > 0 ? columnOrder : table.getAllLeafColumns().map((column) => column.id)
      const oldIdx = currentOrder.indexOf(String(active.id))
      const newIdx = currentOrder.indexOf(String(over.id))
      if (oldIdx === -1 || newIdx === -1) return
      const newOrder = arrayMove(currentOrder, oldIdx, newIdx)
      table.setColumnOrder(newOrder)
    },
    [columnOrder, table],
  )

  const draggingHeader = draggingColumnId
    ? table.getFlatHeaders().find((h) => h.column.id === draggingColumnId)
    : null

  return { sensors, draggingHeader, handleDragStart, handleDragEnd }
}

function useGroupingState(
  controlledGrouping: string | null | undefined,
  onGroupingChange: ((grouping: string | null) => void) | undefined,
) {
  const [internalGrouping, setInternalGrouping] = React.useState<string | null>(null)
  const [collapsedGroups, setCollapsedGroups] = React.useState<Set<string>>(() => new Set())

  const grouping = controlledGrouping === undefined ? internalGrouping : controlledGrouping

  const handleGroupingChange = React.useCallback(
    (next: string | null) => {
      setCollapsedGroups(new Set())
      ;(onGroupingChange ?? setInternalGrouping)(next)
    },
    [onGroupingChange],
  )

  const toggleGroup = React.useCallback((key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  return { grouping, collapsedGroups, handleGroupingChange, toggleGroup }
}

interface TableSurfaceProps<TData> {
  table: TanStackTable<TData>
  columns: ColumnDef<TData, unknown>[]
  variant: React.ComponentProps<typeof Table>["variant"]
  containerClassName?: React.ComponentProps<typeof Table>["containerClassName"]
  density: "compact" | "default" | "relaxed"
  hasExplicitSize: boolean
  enableSorting: boolean
  enableColumnReorder: boolean
  enableGrouping: boolean
  grouping: string | null
  groupConfig: GroupColumnConfig[]
  collapsedGroups: Set<string>
  onToggleGroup: (key: string) => void
  numericColumns: Set<string>
  columnLabels: Record<string, string>
  truncate: boolean
  reorderSensors: ReturnType<typeof useSensors>
  draggingHeader: ReturnType<TanStackTable<TData>["getFlatHeaders"]>[number] | null | undefined
  onDragStart: (event: DragStartEvent) => void
  onDragEnd: (event: DragEndEvent) => void
}

function HeaderCells<TData>({
  table,
  enableSorting,
  numericColumns,
  columnLabels,
  truncate,
}: {
  table: TanStackTable<TData>
  enableSorting: boolean
  numericColumns: Set<string>
  columnLabels: Record<string, string>
  truncate: boolean
}) {
  return (
    <>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <TableHead
              key={header.id}
              variant={numericColumns.has(header.column.id) ? "numeric" : undefined}
              truncate={truncate && (header.column.columnDef.meta?.truncate ?? true)}
            >
              <SortableHeaderContent
                header={header as Header<unknown, unknown>}
                enableSorting={enableSorting}
                numericColumns={numericColumns}
                columnLabels={columnLabels}
                truncate={truncate && (header.column.columnDef.meta?.truncate ?? true)}
              />
            </TableHead>
          ))}
        </TableRow>
      ))}
    </>
  )
}

function DraggableHeaderCells<TData>({
  table,
  enableSorting,
  numericColumns,
  columnLabels,
  truncate,
}: {
  table: TanStackTable<TData>
  enableSorting: boolean
  numericColumns: Set<string>
  columnLabels: Record<string, string>
  truncate: boolean
}) {
  return (
    <>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header, headerIdx) => {
            const position =
              headerIdx === 0
                ? "first"
                : headerIdx === headerGroup.headers.length - 1
                  ? "last"
                  : "middle"
            return (
              <DraggableHeader
                key={header.id}
                header={header}
                position={position}
                numeric={numericColumns.has(header.column.id)}
                truncate={truncate && (header.column.columnDef.meta?.truncate ?? true)}
              >
                <SortableHeaderContent
                  header={header as Header<unknown, unknown>}
                  enableSorting={enableSorting}
                  numericColumns={numericColumns}
                  columnLabels={columnLabels}
                  truncate={truncate && (header.column.columnDef.meta?.truncate ?? true)}
                />
              </DraggableHeader>
            )
          })}
        </TableRow>
      ))}
    </>
  )
}

function ColGroup<TData>({
  table,
  useFlexSize,
}: {
  table: TanStackTable<TData>
  useFlexSize: boolean
}) {
  return (
    <colgroup>
      {table.getHeaderGroups()[0]?.headers.map((header) =>
        useFlexSize ? (
          <col key={header.id} style={{ width: header.column.getSize() }} />
        ) : (
          <col
            key={header.id}
            style={
              header.column.columnDef.size == null
                ? undefined
                : { width: header.column.columnDef.size }
            }
          />
        ),
      )}
    </colgroup>
  )
}

function TableSurface<TData>(props: TableSurfaceProps<TData>) {
  const {
    table,
    columns,
    variant,
    containerClassName,
    density,
    hasExplicitSize,
    enableSorting,
    enableColumnReorder,
    enableGrouping,
    grouping,
    groupConfig,
    collapsedGroups,
    onToggleGroup,
    numericColumns,
    columnLabels,
    truncate,
    reorderSensors,
    draggingHeader,
    onDragStart,
    onDragEnd,
  } = props

  const body = (
    <DataTableRows
      table={table}
      columns={columns}
      numericColumns={numericColumns}
      truncate={truncate}
      grouping={enableGrouping ? grouping : null}
      groupConfig={groupConfig}
      columnLabels={columnLabels}
      collapsedGroups={collapsedGroups}
      onToggleGroup={onToggleGroup}
    />
  )

  if (enableColumnReorder) {
    return (
      <DndContext
        sensors={reorderSensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={table.getFlatHeaders().map((h) => h.column.id)}
          strategy={horizontalListSortingStrategy}
        >
          <Table
            data-density={density}
            variant={variant}
            containerClassName={containerClassName}
            layout={hasExplicitSize ? "fixed" : undefined}
          >
            {hasExplicitSize && <ColGroup table={table} useFlexSize />}
            <TableHeader>
              <DraggableHeaderCells
                table={table}
                enableSorting={enableSorting}
                numericColumns={numericColumns}
                columnLabels={columnLabels}
                truncate={truncate}
              />
            </TableHeader>
            <TableBody>{body}</TableBody>
          </Table>
        </SortableContext>
        <DragOverlay dropAnimation={null}>
          {draggingHeader && (
            <div className="rounded-md border bg-background px-4 py-3 text-sm font-medium shadow-lg">
              {columnLabels[draggingHeader.column.id] ??
                (typeof draggingHeader.column.columnDef.header === "string"
                  ? draggingHeader.column.columnDef.header
                  : draggingHeader.column.id)}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    )
  }

  return (
    <Table
      data-density={density}
      variant={variant}
      containerClassName={containerClassName}
      layout={hasExplicitSize ? "fixed" : undefined}
    >
      {hasExplicitSize && <ColGroup table={table} useFlexSize={false} />}
      <TableHeader>
        <HeaderCells
          table={table}
          enableSorting={enableSorting}
          numericColumns={numericColumns}
          columnLabels={columnLabels}
          truncate={truncate}
        />
      </TableHeader>
      <TableBody>{body}</TableBody>
    </Table>
  )
}

function DataTableRows<TData>({
  table,
  columns,
  numericColumns,
  truncate,
  grouping,
  groupConfig,
  columnLabels,
  collapsedGroups,
  onToggleGroup,
}: {
  table: TanStackTable<TData>
  columns: ColumnDef<TData, unknown>[]
  numericColumns: Set<string>
  truncate?: boolean
  grouping: string | null
  groupConfig: GroupColumnConfig[]
  columnLabels: Record<string, string>
  collapsedGroups: Set<string>
  onToggleGroup: (key: string) => void
}) {
  if (grouping) {
    return (
      <GroupedRows
        table={table}
        numericColumns={numericColumns}
        truncate={truncate}
        grouping={grouping}
        groupConfig={groupConfig}
        columnLabels={columnLabels}
        collapsedGroups={collapsedGroups}
        onToggleGroup={onToggleGroup}
      />
    )
  }

  if (table.getRowModel().rows.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
          No results.
        </TableCell>
      </TableRow>
    )
  }

  return table.getRowModel().rows.map((row) => (
    <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          variant={numericColumns.has(cell.column.id) ? "numeric" : undefined}
          truncate={truncate && (cell.column.columnDef.meta?.truncate ?? true)}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  ))
}

// ---------------------------------------------------------------------------
// Slot categorization
// ---------------------------------------------------------------------------

function categorizeSlots(children: React.ReactNode) {
  const toolbarSlots: React.ReactNode[] = []
  const filterSlots: React.ReactNode[] = []
  const groupSlots: React.ReactNode[] = []
  const paginationSlots: React.ReactNode[] = []
  const restSlots: React.ReactNode[] = []
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === TableToolbar) {
      toolbarSlots.push(child)
    } else if (
      React.isValidElement(child) &&
      (child.type as React.ComponentType).displayName === "DataTableFilter"
    ) {
      filterSlots.push(child)
    } else if (
      React.isValidElement(child) &&
      (child.type as React.ComponentType).displayName === "DataTableGroup"
    ) {
      groupSlots.push(child)
    } else if (React.isValidElement(child) && child.type === DataTablePagination) {
      paginationSlots.push(child)
    } else {
      restSlots.push(child)
    }
  })
  return { toolbarSlots, filterSlots, groupSlots, paginationSlots, restSlots }
}

// ---------------------------------------------------------------------------
// DataTable
// ---------------------------------------------------------------------------

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** @deprecated Use `<TableToolbar>` as a child instead */
  toolbar?: React.ReactNode
  enableSorting?: boolean
  enableColumnVisibility?: boolean
  columnOrder?: ColumnOrderState
  onColumnOrderChange?: (order: ColumnOrderState) => void
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: (vis: VisibilityState) => void
  columnLabels?: Record<string, string>
  onColumnLabelChange?: (columnId: string, label: string) => void
  enablePagination?: boolean
  defaultPageSize?: number
  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void
  enableColumnReorder?: boolean
  enableFiltering?: boolean
  filters?: FilterCondition[]
  onFiltersChange?: (filters: FilterCondition[]) => void
  filterConfig?: FilterColumnConfig[]
  /** When true, filtering is handled externally — onFiltersChange fires but rows are not filtered client-side. */
  manualFiltering?: boolean
  enableGrouping?: boolean
  /** ID of the column currently grouped by, or null for no grouping. */
  grouping?: string | null
  onGroupingChange?: (grouping: string | null) => void
  groupConfig?: GroupColumnConfig[]
  density?: "compact" | "default" | "relaxed"
  children?: React.ReactNode
  className?: string
  /** Variant passed to the base Table component */
  variant?: React.ComponentProps<typeof Table>["variant"]
  /** className passed to the base Table's container div */
  containerClassName?: React.ComponentProps<typeof Table>["containerClassName"]
  truncate?: boolean
}

function DataTable<TData, TValue>({
  columns,
  data,
  toolbar,
  enableSorting = false,
  enableColumnVisibility = false,
  children,
  columnOrder: controlledColumnOrder,
  onColumnOrderChange,
  columnVisibility: controlledColumnVisibility,
  onColumnVisibilityChange,
  columnLabels: controlledColumnLabels,
  onColumnLabelChange,
  enablePagination = false,
  defaultPageSize = 10,
  pagination: controlledPagination,
  onPaginationChange,
  enableColumnReorder = false,
  enableFiltering = false,
  filters: controlledFilters,
  onFiltersChange,
  filterConfig,
  manualFiltering = false,
  enableGrouping = false,
  grouping: controlledGrouping,
  onGroupingChange,
  groupConfig,
  density = "default",
  className,
  variant = "card",
  containerClassName,
  truncate = true,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [internalColumnVisibility, setInternalColumnVisibility] =
    React.useState<VisibilityState>({})
  const [internalColumnOrder, setInternalColumnOrder] =
    React.useState<ColumnOrderState>([])
  const [internalColumnLabels, setInternalColumnLabels] = React.useState<
    Record<string, string>
  >({})
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: defaultPageSize,
    })
  const [internalFilters, setInternalFilters] = React.useState<FilterCondition[]>([])
  const { grouping, collapsedGroups, handleGroupingChange, toggleGroup } =
    useGroupingState(controlledGrouping, onGroupingChange)

  const pagination = controlledPagination ?? internalPagination
  const filters = controlledFilters ?? internalFilters

  const columnVisibility =
    controlledColumnVisibility ?? internalColumnVisibility
  const columnOrder = controlledColumnOrder ?? internalColumnOrder
  const columnLabels = controlledColumnLabels ?? internalColumnLabels

  const handlePaginationChange = React.useMemo(() => {
    if (!enablePagination) return
    if (onPaginationChange) {
      return (updater: PaginationState | ((prev: PaginationState) => PaginationState)) => {
        const next = typeof updater === "function" ? updater(controlledPagination!) : updater
        onPaginationChange(next)
      }
    }
    return setInternalPagination
  }, [enablePagination, onPaginationChange, controlledPagination])

  const handleVisibilityChange = React.useMemo(() => {
    if (!enableColumnVisibility) return
    return (updater: VisibilityState | ((prev: VisibilityState) => VisibilityState)) => {
      const next = typeof updater === "function" ? updater(columnVisibility) : updater
      ;(onColumnVisibilityChange ?? setInternalColumnVisibility)(next)
    }
  }, [enableColumnVisibility, columnVisibility, onColumnVisibilityChange])

  const handleFiltersChange = React.useCallback(
    (newFilters: FilterCondition[]) => {
      ;(onFiltersChange ?? setInternalFilters)(newFilters)
    },
    [onFiltersChange],
  )

  const resolvedFilterConfig: FilterColumnConfig[] = React.useMemo(
    () => filterConfig ?? deriveAccessorConfig(columns),
    [filterConfig, columns],
  )

  const resolvedGroupConfig: GroupColumnConfig[] = React.useMemo(
    () => groupConfig ?? deriveAccessorConfig(columns),
    [groupConfig, columns],
  )

  const filteredData = React.useMemo(
    (): TData[] => (!enableFiltering || manualFiltering ? data : applyClientFilters(data, filters)),
    [data, filters, enableFiltering, manualFiltering],
  )

  const handleColumnOrderChange = React.useCallback(
    (updater: ColumnOrderState | ((prev: ColumnOrderState) => ColumnOrderState)) => {
      const next = typeof updater === "function" ? updater(columnOrder) : updater
      ;(onColumnOrderChange ?? setInternalColumnOrder)(next)
    },
    [columnOrder, onColumnOrderChange],
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting: enableSorting ? sorting : undefined,
      columnVisibility: enableColumnVisibility ? columnVisibility : undefined,
      columnOrder: columnOrder.length > 0 ? columnOrder : undefined,
      ...(enablePagination ? { pagination } : {}),
    },
    onSortingChange: enableSorting ? setSorting : undefined,
    onPaginationChange: handlePaginationChange,
    onColumnVisibilityChange: handleVisibilityChange,
    onColumnOrderChange: handleColumnOrderChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting || enableGrouping ? getSortedRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
  })

  const setColumnLabel = React.useCallback(
    (columnId: string, label: string) => {
      ;(onColumnLabelChange ?? ((id: string, l: string) => setInternalColumnLabels((prev) => ({ ...prev, [id]: l }))))(columnId, label)
    },
    [onColumnLabelChange],
  )

  const {
    sensors: reorderSensors,
    draggingHeader,
    handleDragStart: handleColumnDragStart,
    handleDragEnd: handleColumnDragEnd,
  } = useColumnReorder(table, columnOrder)

  const numericColumns = React.useMemo(
    () => deriveNumericColumns(data, columns),
    [data, columns],
  )

  const hasExplicitSize = columns.some((c) => c.size != null)

  // Not memoized: TanStack's table instance is a stable reference that mutates
  // internally, so children reading table.getState() need fresh context on each render.
  const ctx = {
    table,
    columnLabels,
    setColumnLabel,
    filters,
    setFilters: handleFiltersChange,
    filterConfig: resolvedFilterConfig,
    enableFiltering,
    grouping,
    setGrouping: handleGroupingChange,
    groupConfig: resolvedGroupConfig,
    enableGrouping,
  } as TableContextValue<unknown>

  const { toolbarSlots, filterSlots, groupSlots, paginationSlots, restSlots } = categorizeSlots(children)

  return (
    <TableContext.Provider value={ctx}>
      <div data-slot="data-table" className={cn("w-full space-y-2", className)}>
        {toolbar}
        {toolbarSlots}
        {filterSlots}
        {groupSlots}
        <TableSurface
          table={table}
          columns={columns}
          variant={variant}
          containerClassName={containerClassName}
          density={density}
          hasExplicitSize={hasExplicitSize}
          enableSorting={enableSorting}
          enableColumnReorder={enableColumnReorder}
          enableGrouping={enableGrouping}
          grouping={grouping}
          groupConfig={resolvedGroupConfig}
          collapsedGroups={collapsedGroups}
          onToggleGroup={toggleGroup}
          numericColumns={numericColumns}
          columnLabels={columnLabels}
          truncate={truncate}
          reorderSensors={reorderSensors}
          draggingHeader={draggingHeader}
          onDragStart={handleColumnDragStart}
          onDragEnd={handleColumnDragEnd}
        />
        {paginationSlots}
        {restSlots}
      </div>
    </TableContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// TableToolbar
// ---------------------------------------------------------------------------

function TableToolbar({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="table-toolbar"
      className={cn("flex items-center justify-end gap-2", className)}
      {...props}
    >
      {children}
    </div>
  )
}


export { DataTable, TableToolbar, useDataTable, applyFilterCondition }
export type { DataTableProps, FilterCondition, FilterOperator, FilterColumnConfig, GroupColumnConfig }
