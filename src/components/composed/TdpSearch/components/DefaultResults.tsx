import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useCallback, useMemo } from "react";

import type { TdpResultsRenderProps } from "../types";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const DefaultResults: React.FC<TdpResultsRenderProps> = ({
  results,
  total,
  currentPage,
  pageSize,
  columns,
  onPageChange,
  sortKey,
  sortDirection,
  onSort,
}) => {
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  }, [totalPages, currentPage]);

  const handleSort = useCallback(
    (key: string) => {
      const newDirection = sortKey === key ? (sortDirection === "asc" ? "desc" : "asc") : "asc";
      onSort(key, newDirection);
    },
    [sortKey, sortDirection, onSort],
  );

  const sortIcon = useCallback(
    (columnKey: string) => {
      if (sortKey !== columnKey) return <ArrowUpDown className="ml-1 inline size-3.5 text-muted-foreground" />;
      return sortDirection === "asc" ? (
        <ArrowUp className="ml-1 inline size-3.5" />
      ) : (
        <ArrowDown className="ml-1 inline size-3.5" />
      );
    },
    [sortKey, sortDirection],
  );

  return (
    <>
      <div className="tdp-search__results-header">
        <div className="tdp-search__results-count">
          Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, total)} of {total} results
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  style={{ width: col.width, textAlign: col.align }}
                  className={col.sortable ? "cursor-pointer select-none" : undefined}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  {col.header}
                  {col.sortable && sortIcon(col.key)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {results.map((row, rowIndex) => (
              <TableRow key={row.id || rowIndex}>
                {columns.map((col) => {
                  const value = row[col.key];
                  const content = col.render ? col.render(value, row, rowIndex) : value;
                  return (
                    <TableCell key={col.key} style={{ textAlign: col.align }}>
                      {content}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-2.5">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </Button>

          {pageNumbers.map((page, i) =>
            typeof page === "number" ? (
              <Button
                key={i}
                variant={page === currentPage ? "default" : "ghost"}
                size="icon-sm"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ) : (
              <span key={i} className="px-1 text-sm text-muted-foreground">
                {page}
              </span>
            ),
          )}

          <Button
            variant="outline"
            size="icon-sm"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Next page"
          >
            <ChevronRight />
          </Button>
        </div>
      )}
    </>
  );
};
