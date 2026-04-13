"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { useDataTable } from "./data-table"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface DataTablePaginationProps {
  pageSizeOptions?: number[]
  className?: string
}

const DEFAULT_PAGE_SIZE_SMALL = 5
const DEFAULT_PAGE_SIZE_MEDIUM = 10
const DEFAULT_PAGE_SIZE_LARGE = 25

function DataTablePagination({
  pageSizeOptions = [DEFAULT_PAGE_SIZE_SMALL, DEFAULT_PAGE_SIZE_MEDIUM, DEFAULT_PAGE_SIZE_LARGE],
  className,
}: DataTablePaginationProps) {
  const { table } = useDataTable()

  const pageCount = table.getPageCount()
  const { pageIndex, pageSize } = table.getState().pagination
  const totalRows = table.getFilteredRowModel().rows.length

  if (totalRows === 0) return null

  const start = pageIndex * pageSize + 1
  const end = Math.min((pageIndex + 1) * pageSize, totalRows)

  return (
    <div
      data-slot="data-table-pagination"
      className={cn(
        "flex items-center justify-between gap-4 text-sm text-muted-foreground",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="whitespace-nowrap">Rows per page:</span>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger className="h-7 w-16">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="whitespace-nowrap tabular-nums">
          {start}&ndash;{end} of {totalRows}
        </span>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeftIcon />
          </Button>

          {Array.from({ length: pageCount }, (_, i) => (
            <Button
              key={i}
              variant={i === pageIndex ? "default" : "link"}
              size="icon-xs"
              onClick={() => table.setPageIndex(i)}
              aria-label={`Page ${i + 1}`}
              aria-current={i === pageIndex ? "page" : undefined}
            >
              {i + 1}
            </Button>
          ))}

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRightIcon />
          </Button>
        </div>
      )}
    </div>
  )
}

export { DataTablePagination }
export type { DataTablePaginationProps }
