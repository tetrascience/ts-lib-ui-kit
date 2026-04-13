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


import "./types"

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface TableContextValue<TData> {
  table: TanStackTable<TData>
  columnLabels: Record<string, string>
  setColumnLabel: (columnId: string, label: string) => void
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
}: {
  header: Header<TData, unknown>
  children: React.ReactNode
  position?: "first" | "last" | "middle"
  numeric?: boolean
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
      className={cn(
        "group/header transition-shadow duration-150",
        !isDragging && position === "first" && "hover:shadow-[inset_-1px_0_0_0_var(--color-border)]",
        !isDragging && position === "last" && "hover:shadow-[inset_1px_0_0_0_var(--color-border)]",
        !isDragging && position === "middle" && "hover:shadow-[inset_1px_0_0_0_var(--color-border),inset_-1px_0_0_0_var(--color-border)]",
        isDragging && "opacity-40",
      )}
    >
      <div className={cn("flex items-center gap-1", numeric && "flex-row-reverse")}>
        <div className="flex-1">{children}</div>
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
  density?: "compact" | "default" | "relaxed"
  children?: React.ReactNode
  className?: string
  /** Variant passed to the base Table component */
  variant?: React.ComponentProps<typeof Table>["variant"]
  /** className passed to the base Table's container div */
  containerClassName?: React.ComponentProps<typeof Table>["containerClassName"]
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
  density = "default",
  className,
  variant = "card",
  containerClassName,
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

  const pagination = controlledPagination ?? internalPagination

  const columnVisibility =
    controlledColumnVisibility ?? internalColumnVisibility
  const columnOrder = controlledColumnOrder ?? internalColumnOrder
  const columnLabels = controlledColumnLabels ?? internalColumnLabels

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: enableSorting ? sorting : undefined,
      columnVisibility: enableColumnVisibility ? columnVisibility : undefined,
      columnOrder: columnOrder.length > 0 ? columnOrder : undefined,
      ...(enablePagination ? { pagination } : {}),
    },
    onSortingChange: enableSorting ? setSorting : undefined,
    onPaginationChange: enablePagination
      ? onPaginationChange
        ? (updater) => {
          const next =
            typeof updater === "function"
              ? updater(controlledPagination!)
              : updater
          onPaginationChange(next)
        }
        : setInternalPagination
      : undefined,
    onColumnVisibilityChange: enableColumnVisibility
      ? (updater) => {
        const next =
          typeof updater === "function" ? updater(columnVisibility) : updater
        if (onColumnVisibilityChange) {
          onColumnVisibilityChange(next)
        } else {
          setInternalColumnVisibility(next)
        }
      }
      : undefined,
    onColumnOrderChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(columnOrder) : updater
      if (onColumnOrderChange) {
        onColumnOrderChange(next)
      } else {
        setInternalColumnOrder(next)
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
  })

  const setColumnLabel = React.useCallback(
    (columnId: string, label: string) => {
      if (onColumnLabelChange) {
        onColumnLabelChange(columnId, label)
      } else {
        setInternalColumnLabels((prev) => ({ ...prev, [columnId]: label }))
      }
    },
    [onColumnLabelChange]
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
        columnOrder.length > 0 ? columnOrder : columns.map((c) => ("accessorKey" in c ? String(c.accessorKey) : ""))
      const oldIdx = currentOrder.indexOf(String(active.id))
      const newIdx = currentOrder.indexOf(String(over.id))
      if (oldIdx === -1 || newIdx === -1) return
      const newOrder = arrayMove(currentOrder, oldIdx, newIdx)
      table.setColumnOrder(newOrder)
    },
    [columnOrder, columns, table],
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

  // Not memoized: TanStack's table instance is a stable reference that mutates
  // internally, so children reading table.getState() need fresh context on each render.
  const ctx = {
    table,
    columnLabels,
    setColumnLabel,
  } as TableContextValue<unknown>

  // Slot children: TableToolbar above the table, DataTablePagination below, rest after
  const toolbarSlots: React.ReactNode[] = []
  const paginationSlots: React.ReactNode[] = []
  const restSlots: React.ReactNode[] = []
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === TableToolbar) {
      toolbarSlots.push(child)
    } else if (React.isValidElement(child) && child.type === DataTablePagination) {
      paginationSlots.push(child)
    } else {
      restSlots.push(child)
    }
  })

  return (
    <TableContext.Provider value={ctx}>
      <div data-slot="data-table" className={cn("w-full space-y-2", className)}>
        {toolbar}
        {toolbarSlots}
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
              <Table data-density={density} variant={variant} containerClassName={containerClassName}>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => {
                    const headerContent = headerGroup.headers.map((header, headerIdx) => {
                      const canSort = enableSorting && header.column.getCanSort()
                      const sorted = header.column.getIsSorted()

                      const isNumeric = numericColumns.has(header.column.id)
                      const inner = header.isPlaceholder ? null : (
                        <div
                          className={cn("flex items-center gap-1", canSort && "group/sort cursor-pointer select-none", isNumeric && "flex-row-reverse")}
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                          onKeyDown={(e) => {
                            if ((e.key === "Enter" || e.key === " ") && canSort) {
                              header.column.getToggleSortingHandler()
                            }
                          }}
                        >
                          {columnLabels[header.column.id] ??
                            flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            <span className={cn(!sorted && "opacity-0 group-hover/sort:opacity-100 transition-opacity")}>
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

                      return (
                        <DraggableHeader
                          key={header.id}
                          header={header}
                          position={headerIdx === 0 ? "first" : headerIdx === headerGroup.headers.length - 1 ? "last" : "middle"}
                          numeric={numericColumns.has(header.column.id)}
                        >
                          {inner}
                        </DraggableHeader>
                      )
                    })

                    return <TableRow key={headerGroup.id}>{headerContent}</TableRow>
                  })}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} variant={numericColumns.has(cell.column.id) ? "numeric" : undefined}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
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
          <div className="rounded-lg border bg-card">
            <Table data-density={density}>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const canSort = enableSorting && header.column.getCanSort()
                      const sorted = header.column.getIsSorted()

                      return (
                        <TableHead key={header.id} variant={numericColumns.has(header.column.id) ? "numeric" : undefined}>
                          {header.isPlaceholder ? null : (
                            <div
                              className={cn("flex items-center gap-1", canSort && "group/sort cursor-pointer select-none", numericColumns.has(header.column.id) && "flex-row-reverse")}
                              onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                              onKeyDown={(e) => {
                                if ((e.key === "Enter" || e.key === " ") && canSort) {
                                  header.column.getToggleSortingHandler()
                                }
                              }}
                            >
                              {columnLabels[header.column.id] ??
                                flexRender(header.column.columnDef.header, header.getContext())}
                              {canSort && (
                                <span className={cn(!sorted && "opacity-0 group-hover/sort:opacity-100 transition-opacity")}>
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
                          )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} variant={numericColumns.has(cell.column.id) ? "numeric" : undefined}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
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
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { DataTable, TableToolbar, useDataTable }
export type { DataTableProps }
