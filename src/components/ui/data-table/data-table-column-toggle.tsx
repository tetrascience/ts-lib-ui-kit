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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { CheckIcon, GripVerticalIcon, SlidersHorizontalIcon } from "lucide-react"
import * as React from "react"

import { useDataTable } from "./data-table"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DataTableColumnToggleProps {
  className?: string
}

interface SortableColumnItemProps {
  id: string
  label: string
  visible: boolean
  onToggle: () => void
}

function SortableColumnItem({ id, label, visible, onToggle }: SortableColumnItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      role="checkbox"
      aria-checked={visible}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onToggle();
        }
      }}
      className={cn(
        "group/col-item flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm select-none hover:bg-accent hover:text-accent-foreground",
        isDragging && "z-50 bg-accent text-accent-foreground shadow-sm",
      )}
    >
      <button
        type="button"
        className={cn(
          "cursor-grab touch-none text-muted-foreground group-hover/col-item:text-accent-foreground active:cursor-grabbing",
          !isDragging && "opacity-0 group-hover/col-item:opacity-100 transition-opacity",
        )}
        onClick={(e) => e.stopPropagation()}
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-3.5" />
      </button>
      <span className="flex-1 truncate">{label}</span>
      <CheckIcon className={cn("size-4 shrink-0", visible ? "text-muted-foreground group-hover/col-item:text-accent-foreground" : "text-transparent")} />
    </div>
  )
}

function DataTableColumnToggle({ className }: DataTableColumnToggleProps) {
  const { table, columnLabels } = useDataTable()
  const [open, setOpen] = React.useState(false)
  const panelRef = React.useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const allColumns = table.getAllColumns().filter((col) => col.getCanHide())
  const stateOrder = table.getState().columnOrder
  const orderedIds =
    stateOrder && stateOrder.length > 0
      ? stateOrder.filter((id) => allColumns.some((c) => c.id === id))
      : allColumns.map((c) => c.id)

  // Close on outside click
  React.useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  if (allColumns.length === 0) return null

  function getLabel(colId: string) {
    const col = allColumns.find((c) => c.id === colId)
    if (!col) return colId
    return (
      columnLabels[col.id] ??
      (col.columnDef.meta as { label?: string } | undefined)?.label ??
      (typeof col.columnDef.header === "string" ? col.columnDef.header : col.id)
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = orderedIds.indexOf(String(active.id))
    const newIndex = orderedIds.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return

    const newOrder = arrayMove(orderedIds, oldIndex, newIndex)
    table.setColumnOrder(newOrder)
  }

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="ghost"
        size="sm"
        className={className}
        data-slot="data-table-column-toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <SlidersHorizontalIcon data-icon="inline-start" />
        Columns
      </Button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border bg-popover p-1 shadow-md"
          role="group"
          aria-label="Toggle and reorder columns"
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
              {(() => {
                const visibleCount = orderedIds.filter((colId) => allColumns.find((c) => c.id === colId)?.getIsVisible()).length
                return orderedIds.map((colId) => {
                  const col = allColumns.find((c) => c.id === colId)
                  if (!col) return null
                  const isVisible = col.getIsVisible()
                  const isLastVisible = isVisible && visibleCount <= 1
                  return (
                    <SortableColumnItem
                      key={colId}
                      id={colId}
                      label={getLabel(colId)}
                      visible={isVisible}
                      onToggle={isLastVisible ? () => { } : () => col.toggleVisibility()}
                    />
                  )
                })
              })()}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}

export { DataTableColumnToggle }
export type { DataTableColumnToggleProps }
