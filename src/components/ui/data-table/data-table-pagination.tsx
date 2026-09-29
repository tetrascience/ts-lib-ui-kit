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
const MAX_VISIBLE_PAGE_ITEMS = 7

function getPageItems(pageCount: number, pageIndex: number): Array<number | "ellipsis"> {
  if (pageCount <= MAX_VISIBLE_PAGE_ITEMS) {
    return Array.from({ length: pageCount }, (_, index) => index)
  }

  const currentPage = pageIndex + 1
  if (currentPage <= 4) {
    return [0, 1, 2, 3, 4, "ellipsis", pageCount - 1]
  }

  if (currentPage >= pageCount - 3) {
    return [0, "ellipsis", pageCount - 5, pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1]
  }

  return [0, "ellipsis", pageIndex - 1, pageIndex, pageIndex + 1, "ellipsis", pageCount - 1]
}

function DataTablePagination({
  pageSizeOptions = [DEFAULT_PAGE_SIZE_SMALL, DEFAULT_PAGE_SIZE_MEDIUM, DEFAULT_PAGE_SIZE_LARGE],
  className,
}: DataTablePaginationProps) {
  const { table, grouping, enableGrouping } = useDataTable()

  const pageCount = table.getPageCount()
  const { pageIndex, pageSize } = table.getState().pagination
  const totalRows = table.getFilteredRowModel().rows.length
  const pageItems = getPageItems(pageCount, pageIndex)

  if (totalRows === 0) return null
  if (enableGrouping && grouping) return null

  const start = pageIndex * pageSize + 1
  const end = Math.min((pageIndex + 1) * pageSize, totalRows)

  return (
    <div
      data-slot="data-table-pagination"
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground",
        className,
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span className="whitespace-nowrap">Rows per page:</span>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger aria-label="Rows per page" className="h-7 w-16">
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
        <div className="flex flex-wrap items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeftIcon />
          </Button>

          {pageItems.map((item, index) =>
            item === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-1" aria-hidden="true">
                ...
              </span>
            ) : (
              <Button
                key={item}
                variant={item === pageIndex ? "default" : "link"}
                size="icon-xs"
                onClick={() => table.setPageIndex(item)}
                aria-label={`Page ${item + 1}`}
                aria-current={item === pageIndex ? "page" : undefined}
              >
                {item + 1}
              </Button>
            ),
          )}

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
