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
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, GripVerticalIcon } from "lucide-react"
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

function DataTableRows<TData>({
  table,
  columns,
  numericColumns,
  truncate,
}: {
  table: TanStackTable<TData>
  columns: ColumnDef<TData, unknown>[]
  numericColumns: Set<string>
  truncate?: boolean
}) {
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
    } else if (React.isValidElement(child) && child.type === DataTablePagination) {
      paginationSlots.push(child)
    } else {
      restSlots.push(child)
    }
  })
  return { toolbarSlots, filterSlots, paginationSlots, restSlots }
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

  const resolvedFilterConfig: FilterColumnConfig[] = React.useMemo(() => {
    if (filterConfig) return filterConfig
    return columns
      .filter((col) => "accessorKey" in col)
      .map((col) => ({ columnId: String((col as { accessorKey: unknown }).accessorKey) }))
  }, [filterConfig, columns])

  const filteredData = React.useMemo((): TData[] => {
    if (!enableFiltering || manualFiltering) return data
    const active = filters.filter(
      (f) =>
        f.columnId &&
        f.operator &&
        (f.value.trim() !== "" || f.operator === "is_empty" || f.operator === "is_not_empty"),
    )
    if (active.length === 0) return data
    return data.filter((row) =>
      active.every((condition) => {
        const cellValue = String(
          (row as Record<string, unknown>)[condition.columnId] ?? "",
        )
        return applyFilterCondition(cellValue, condition.operator, condition.value)
      }),
    )
  }, [data, filters, enableFiltering, manualFiltering])

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
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
  })

  const setColumnLabel = React.useCallback(
    (columnId: string, label: string) => {
      ;(onColumnLabelChange ?? ((id: string, l: string) => setInternalColumnLabels((prev) => ({ ...prev, [id]: l }))))(columnId, label)
    },
    [onColumnLabelChange],
  )

  const reorderSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const [draggingColumnId, setDraggingColumnId] = React.useState<string | null>(null)

  const handleColumnDragStart = React.useCallback(
    (event: DragStartEvent) => {
      setDraggingColumnId(String(event.active.id))
    },
    [],
  )

  const handleColumnDragEnd = React.useCallback(
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

  // Infer which columns are numeric from the first data row
  const numericColumns = React.useMemo(() => {
    if (data.length === 0) return new Set<string>()
    const first = data[0] as Record<string, unknown>
    const ids = new Set<string>()
    for (const col of columns) {
      const key = "accessorKey" in col ? String(col.accessorKey) : ""
      if (key && typeof first[key] === "number") ids.add(key)
    }
    return ids
  }, [data, columns])

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
  } as TableContextValue<unknown>

  const { toolbarSlots, filterSlots, paginationSlots, restSlots } = categorizeSlots(children)

  return (
    <TableContext.Provider value={ctx}>
      <div data-slot="data-table" className={cn("w-full space-y-2", className)}>
        {toolbar}
        {toolbarSlots}
        {filterSlots}
        {enableColumnReorder ? (
          <DndContext
            sensors={reorderSensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToHorizontalAxis]}
            onDragStart={handleColumnDragStart}
            onDragEnd={handleColumnDragEnd}
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
                {hasExplicitSize && (
                  <colgroup>
                    {table.getHeaderGroups()[0]?.headers.map((header) => (
                      <col
                        key={header.id}
                        style={{ width: header.column.getSize() }}
                      />
                    ))}
                  </colgroup>
                )}
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header, headerIdx) => (
                        <DraggableHeader
                          key={header.id}
                          header={header}
                          position={headerIdx === 0 ? "first" : headerIdx === headerGroup.headers.length - 1 ? "last" : "middle"}
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
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  <DataTableRows table={table} columns={columns} numericColumns={numericColumns} truncate={truncate} />
                </TableBody>
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
        ) : (
          <Table
            data-density={density}
            variant={variant}
            containerClassName={containerClassName}
            layout={hasExplicitSize ? "fixed" : undefined}
          >
            {hasExplicitSize && (
              <colgroup>
                {table.getHeaderGroups()[0]?.headers.map((header) => (
                  <col
                    key={header.id}
                    style={header.column.columnDef.size == null ? undefined : { width: header.column.columnDef.size }}
                  />
                ))}
              </colgroup>
            )}
            <TableHeader>
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
            </TableHeader>
            <TableBody>
              <DataTableRows table={table} columns={columns} numericColumns={numericColumns} truncate={truncate} />
            </TableBody>
          </Table>
        )}
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
export type { DataTableProps, FilterCondition, FilterOperator, FilterColumnConfig }
