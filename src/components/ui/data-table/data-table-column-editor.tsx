"use client"

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"


import { useDataTable } from "./data-table"
import { DataTableColumnEditorRow } from "./data-table-column-editor-row"

import type { ManagedColumn } from "./types"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getColumnLabel(
  col: { id: string; columnDef: { header?: unknown; meta?: unknown } },
  columnLabels: Record<string, string>
): string {
  if (columnLabels[col.id]) return columnLabels[col.id]
  const meta = col.columnDef.meta as { label?: string } | undefined
  if (meta?.label) return meta.label
  if (typeof col.columnDef.header === "string") return col.columnDef.header
  return col.id
}

function getColumnMeta(col: { columnDef: { meta?: unknown } }) {
  const meta = col.columnDef.meta as
    | {
        canHide?: boolean
        canReorder?: boolean
        canRemove?: boolean
        canRename?: boolean
      }
    | undefined
  return {
    canHide: meta?.canHide !== false,
    canReorder: meta?.canReorder !== false,
    canRemove: meta?.canRemove ?? false,
    canRename: meta?.canRename ?? false,
  }
}

// ---------------------------------------------------------------------------
// DataTableColumnEditor
// ---------------------------------------------------------------------------

interface DataTableColumnEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Columns that were removed and can be re-added */
  availableColumns?: { id: string; label: string }[]
  onAddColumn?: (columnId: string) => void
  onRemoveColumn?: (columnId: string) => void
}

function DataTableColumnEditor({
  open,
  onOpenChange,
  availableColumns = [],
  onAddColumn,
  onRemoveColumn,
}: DataTableColumnEditorProps) {
  const { table, columnLabels, setColumnLabel } = useDataTable()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Build managed column list from the table's column order
  const allColumns = table.getAllColumns()
  const stateOrder = table.getState().columnOrder
  const orderedIds =
    stateOrder && stateOrder.length > 0
      ? stateOrder
      : allColumns.map((c) => c.id)

  const managedColumns: ManagedColumn[] = orderedIds
    .map((id) => {
      const col = allColumns.find((c) => c.id === id)
      if (!col) return null
      const meta = getColumnMeta(col)
      return {
        id: col.id,
        label: getColumnLabel(col, columnLabels),
        isVisible: col.getIsVisible(),
        ...meta,
      }
    })
    .filter(Boolean) as ManagedColumn[]

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = orderedIds.indexOf(String(active.id))
    const newIndex = orderedIds.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return

    const newOrder = arrayMove(orderedIds, oldIndex, newIndex)
    table.setColumnOrder(newOrder)
  }

  const handleToggleVisibility = (columnId: string) => {
    const col = table.getColumn(columnId)
    if (col) col.toggleVisibility()
  }

  const handleRename = (columnId: string, label: string) => {
    setColumnLabel(columnId, label)
  }

  const handleRemove = (columnId: string) => {
    const col = table.getColumn(columnId)
    if (col) col.toggleVisibility(false)
    onRemoveColumn?.(columnId)
  }

  const handleAddColumn = (columnId: string) => {
    const col = table.getColumn(columnId)
    if (col) col.toggleVisibility(true)
    onAddColumn?.(columnId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-slot="data-table-column-editor"
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle>Edit Columns</DialogTitle>
        </DialogHeader>

        <DialogDescription >
          Toggle column visibility, reorder columns via drag-and-drop, or add
          back removed columns.
        </DialogDescription>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={managedColumns.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-1.5">
              {managedColumns.map((col) => (
                <DataTableColumnEditorRow
                  key={col.id}
                  column={col}
                  onToggleVisibility={handleToggleVisibility}
                  onRename={handleRename}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {availableColumns.length > 0 && (
          <Select onValueChange={handleAddColumn}>
            <SelectTrigger>
              <SelectValue placeholder="Add column..." />
            </SelectTrigger>
            <SelectContent>
              {availableColumns.map((col) => (
                <SelectItem key={col.id} value={col.id}>
                  {col.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}

export { DataTableColumnEditor }
export type { DataTableColumnEditorProps }
