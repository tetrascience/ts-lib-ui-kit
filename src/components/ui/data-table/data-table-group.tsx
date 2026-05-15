"use client"

import { GroupIcon, XIcon } from "lucide-react"
import { Popover } from "radix-ui"
import { useId } from "react"

import { useDataTable } from "./data-table"

import type { Column } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getColumnLabel(
  colId: string,
  columnLabels: Record<string, string>,
  col: Column<unknown, unknown> | undefined,
): string {
  const meta = col?.columnDef.meta as { label?: string } | undefined
  return (
    columnLabels[colId] ??
    meta?.label ??
    (typeof col?.columnDef.header === "string" ? col.columnDef.header : undefined) ??
    colId
  )
}

// ---------------------------------------------------------------------------
// DataTableGroup
// ---------------------------------------------------------------------------

const NO_GROUPING = "__none__"

interface DataTableGroupProps {
  className?: string
}

function DataTableGroup({ className }: DataTableGroupProps) {
  const selectId = useId()
  const {
    table,
    columnLabels,
    grouping,
    setGrouping,
    groupConfig,
    enableGrouping,
  } = useDataTable()

  if (!enableGrouping) return null

  const allLeafColumns = table.getAllLeafColumns()

  const resolvedColumns =
    groupConfig.length > 0
      ? groupConfig
      : allLeafColumns
          .filter((col) => "accessorKey" in col.columnDef || "accessorFn" in col.columnDef)
          .map((col) => ({ columnId: col.id, label: undefined as string | undefined }))

  const activeColumn = grouping
    ? resolvedColumns.find((c) => c.columnId === grouping) ?? { columnId: grouping }
    : null

  const activeColumnLabel = activeColumn
    ? activeColumn.label ??
      getColumnLabel(
        activeColumn.columnId,
        columnLabels,
        allLeafColumns.find((lc) => lc.id === activeColumn.columnId),
      )
    : null

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-slot="data-table-group"
          className={cn(className)}
          aria-label={
            activeColumnLabel ? `Grouped by ${activeColumnLabel}` : "Group by"
          }
        >
          <GroupIcon className="size-3.5" />
          {activeColumnLabel ? (
            <>
              Grouped by
              <span className="rounded-sm bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">
                {activeColumnLabel}
              </span>
            </>
          ) : (
            "Group"
          )}
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          data-slot="data-table-group-panel"
          align="end"
          sideOffset={4}
          className={cn(
            "z-50 min-w-64 rounded-lg border bg-popover p-3 text-popover-foreground shadow-md outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
          )}
        >
          <div className="flex flex-col gap-2">
            <label
              className="text-xs font-medium text-muted-foreground"
              htmlFor={selectId}
            >
              Group rows by
            </label>
            <div className="flex items-center gap-2">
              <Select
                value={grouping ?? NO_GROUPING}
                onValueChange={(v) => setGrouping(v === NO_GROUPING ? null : v)}
              >
                <SelectTrigger
                  id={selectId}
                  size="sm"
                  className="w-44"
                >
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_GROUPING}>None</SelectItem>
                  {resolvedColumns.map((c) => {
                    const col = allLeafColumns.find((lc) => lc.id === c.columnId)
                    return (
                      <SelectItem key={c.columnId} value={c.columnId}>
                        {c.label ?? getColumnLabel(c.columnId, columnLabels, col)}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {grouping && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setGrouping(null)}
                  aria-label="Clear grouping"
                >
                  <XIcon className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

DataTableGroup.displayName = "DataTableGroup"

export { DataTableGroup }
export type { DataTableGroupProps }
