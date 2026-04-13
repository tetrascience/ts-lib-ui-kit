"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVerticalIcon, XIcon } from "lucide-react"
import * as React from "react"

import type { ManagedColumn } from "./types"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"


interface DataTableColumnEditorRowProps {
  column: ManagedColumn
  onToggleVisibility: (id: string) => void
  onRename: (id: string, label: string) => void
  onRemove: (id: string) => void
}

function DataTableColumnEditorRow({
  column,
  onToggleVisibility,
  onRename,
  onRemove,
}: DataTableColumnEditorRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, disabled: !column.canReorder })

  const [localLabel, setLocalLabel] = React.useState(column.label)

  React.useEffect(() => {
    setLocalLabel(column.label)
  }, [column.label])

  const handleBlur = () => {
    if (localLabel !== column.label) {
      onRename(column.id, localLabel)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur()
    }
  }

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-slot="data-table-column-editor-row"
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-background px-2 py-1.5",
        isDragging && "z-50 shadow-lg ring-2 ring-primary/20"
      )}
    >
      {column.canReorder ? (
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="size-4" />
        </button>
      ) : (
        <span className="w-4" />
      )}

      <Checkbox
        checked={column.isVisible}
        disabled={!column.canHide}
        onCheckedChange={() => onToggleVisibility(column.id)}
      />

      <Input
        value={localLabel}
        onChange={(e) => setLocalLabel(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        readOnly={!column.canRename}
        className={cn(
          "flex-1",
          !column.canRename && "border-transparent bg-transparent shadow-none"
        )}
      />

      {column.canRemove && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onRemove(column.id)}
          className="text-destructive hover:text-destructive"
        >
          <XIcon />
          <span className="sr-only">Remove {column.label}</span>
        </Button>
      )}
    </div>
  )
}

export { DataTableColumnEditorRow }
export type { DataTableColumnEditorRowProps }
