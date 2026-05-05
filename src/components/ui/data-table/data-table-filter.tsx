"use client"

import { PlusIcon, XIcon } from "lucide-react"

import { useDataTable } from "./data-table"

import type { FilterColumnConfig, FilterCondition, FilterOperator } from "./data-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Operator metadata
// ---------------------------------------------------------------------------

const OPERATOR_LABELS: Record<FilterOperator, string> = {
  contains:     "contains",
  equals:       "equals",
  not_equals:   "not equals",
  starts_with:  "starts with",
  ends_with:    "ends with",
  is_empty:     "is empty",
  is_not_empty: "is not empty",
}

const VALUE_FREE_OPERATORS: FilterOperator[] = ["is_empty", "is_not_empty"]

const DEFAULT_OPERATORS: FilterOperator[] = [
  "contains",
  "equals",
  "not_equals",
  "starts_with",
  "ends_with",
  "is_empty",
  "is_not_empty",
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getColumnLabel(
  colId: string,
  columnLabels: Record<string, string>,
   
  col: any,
): string {
  return (
    columnLabels[colId] ??
    (col?.columnDef?.meta as { label?: string } | undefined)?.label ??
    (typeof col?.columnDef?.header === "string" ? col.columnDef.header : undefined) ??
    colId
  )
}

function makeCondition(columnId: string): FilterCondition {
  return { id: crypto.randomUUID(), columnId, operator: "contains", value: "" }
}

// ---------------------------------------------------------------------------
// DataTableFilter
// ---------------------------------------------------------------------------

interface DataTableFilterProps {
  className?: string
}

function DataTableFilter({ className }: DataTableFilterProps) {
  const { table, columnLabels, filters, setFilters, filterConfig, enableFiltering } =
    useDataTable()

  if (!enableFiltering) return null

  const allLeafColumns = table.getAllLeafColumns()

  const resolvedColumns: FilterColumnConfig[] =
    filterConfig.length > 0
      ? filterConfig
      : allLeafColumns
          .filter((col) => "accessorKey" in col.columnDef || "accessorFn" in col.columnDef)
          .map((col) => ({ columnId: col.id }))

  const firstColumnId = resolvedColumns[0]?.columnId ?? ""

  function addFilter() {
    setFilters([...filters, makeCondition(firstColumnId)])
  }

  function removeFilter(id: string) {
    setFilters(filters.filter((f) => f.id !== id))
  }

  function updateFilter(id: string, patch: Partial<FilterCondition>) {
    setFilters(filters.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }

  function clearAll() {
    setFilters([])
  }

  return (
    <div
      data-slot="data-table-filter"
      className={cn("flex flex-col gap-2", className)}
    >
      {filters.map((condition) => {
        const colConfig = resolvedColumns.find((c) => c.columnId === condition.columnId)
        const operators = colConfig?.operators ?? DEFAULT_OPERATORS
        const isValueFree = VALUE_FREE_OPERATORS.includes(condition.operator)

        return (
          <div key={condition.id} className="flex items-center gap-2">
            {/* Column selector */}
            <Select
              value={condition.columnId}
              onValueChange={(v) =>
                updateFilter(condition.id, { columnId: v, value: "" })
              }
            >
              <SelectTrigger size="sm" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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

            {/* Operator selector */}
            <Select
              value={condition.operator}
              onValueChange={(v) =>
                updateFilter(condition.id, {
                  operator: v as FilterOperator,
                  value: "",
                })
              }
            >
              <SelectTrigger size="sm" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {operators.map((op) => (
                  <SelectItem key={op} value={op}>
                    {OPERATOR_LABELS[op]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Value input — hidden for value-free operators */}
            {isValueFree ? (
              <div className="h-8 w-40" aria-hidden />
            ) : (
              <Input
                className="w-40"
                placeholder="Value…"
                value={condition.value}
                onChange={(e) => updateFilter(condition.id, { value: e.target.value })}
              />
            )}

            {/* Remove button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => removeFilter(condition.id)}
              aria-label="Remove filter"
            >
              <XIcon className="size-3.5" />
            </Button>
          </div>
        )
      })}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addFilter}
          disabled={resolvedColumns.length === 0}
        >
          <PlusIcon className="size-3.5" />
          Add filter
        </Button>
        {filters.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={clearAll}
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  )
}

DataTableFilter.displayName = "DataTableFilter"

export { DataTableFilter }
export type { DataTableFilterProps }
