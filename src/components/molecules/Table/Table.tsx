import React, { useState, useMemo, useEffect } from "react";
import styled from "styled-components";
import { TableCell } from "@atoms/TableCell";
import { TableHeaderCell } from "@atoms/TableHeaderCell";
import { Checkbox } from "@atoms/Checkbox";
import { DropdownOption } from "@atoms/Dropdown";

export interface TableColumn<T = any> {
  key: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: DropdownOption[];
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  pageSize?: number;
  rowKey?: keyof T | ((row: T) => string | number);
  selectable?: boolean;
  onRowSelect?: (selectedRows: T[]) => void;
  // Controlled mode props (optional)
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string, direction: "asc" | "desc") => void;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  selectedRows?: T[];
  className?: string;
}

const TableContainer = styled.div`
  width: 100%;
  border: 1px solid var(--grey-200);
  border-radius: 8px;
  overflow: visible;
  background-color: var(--white-900);
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr<{ $selectable?: boolean }>`
  cursor: ${(props) => (props.$selectable ? "pointer" : "default")};

  &:hover {
    background-color: ${(props) =>
      props.$selectable ? "var(--grey-50)" : "transparent"};
  }
`;

const CheckboxCell = styled(TableCell)`
  width: 40px;
  padding: 10px 12px;
`;

const CheckboxHeaderCell = styled(TableHeaderCell)`
  width: 40px;
  padding: 8px 12px;
`;

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 10px 12px;
  height: 40px;
  background-color: var(--grey-50);
  border-top: 1px solid var(--grey-200);
`;

const PaginationButton = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--grey-300);
  border-radius: 6px;
  background-color: var(--white-900);
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};

  &:hover:not(:disabled) {
    background-color: var(--grey-50);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const PageNumbers = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
`;

const PageNumber = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background-color: ${(props) =>
    props.$active ? "var(--grey-100)" : "transparent"};
  font-family: "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
  color: var(--grey-600);
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: var(--grey-100);
  }
`;

export function Table<T extends Record<string, any>>({
  columns,
  data,
  pageSize = 10,
  rowKey,
  selectable = false,
  onRowSelect,
  sortKey: controlledSortKey,
  sortDirection: controlledSortDirection,
  onSort: controlledOnSort,
  currentPage: controlledCurrentPage,
  onPageChange: controlledOnPageChange,
  selectedRows: controlledSelectedRows,
  className,
}: TableProps<T>) {
  // Internal state for uncontrolled mode
  const [internalSortKey, setInternalSortKey] = useState<string | null>(null);
  const [internalSortDirection, setInternalSortDirection] = useState<
    "asc" | "desc" | null
  >(null);
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [internalSelectedRows, setInternalSelectedRows] = useState<T[]>([]);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {}
  );

  // Determine if controlled or uncontrolled
  const isControlledSort = controlledSortKey !== undefined;
  const isControlledPage = controlledCurrentPage !== undefined;
  const isControlledSelection = controlledSelectedRows !== undefined;

  const sortKey = isControlledSort ? controlledSortKey : internalSortKey;
  const sortDirection = isControlledSort
    ? controlledSortDirection
    : internalSortDirection;
  const currentPage = isControlledPage
    ? controlledCurrentPage
    : internalCurrentPage;
  const selectedRows = isControlledSelection
    ? controlledSelectedRows
    : internalSelectedRows;

  // Filter data based on column filters
  const filteredData = useMemo(() => {
    let result = [...data];

    Object.entries(columnFilters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((row) => {
          const cellValue = row[key];
          return cellValue?.toString() === value;
        });
      }
    });

    return result;
  }, [data, columnFilters]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === bValue) return 0;

      let comparison = 0;
      if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Calculate pagination
  const totalPages =
    pageSize === -1 ? 1 : Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    if (pageSize === -1) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Reset to first page when filters or sort changes
  useEffect(() => {
    if (!isControlledPage) {
      setInternalCurrentPage(1);
    }
  }, [columnFilters, sortKey, sortDirection, isControlledPage]);

  const handleSort = (key: string) => {
    if (isControlledSort && controlledOnSort) {
      const newDirection =
        sortKey === key
          ? sortDirection === "asc"
            ? "desc"
            : "asc"
          : "asc";
      controlledOnSort(key, newDirection);
    } else {
      if (sortKey === key) {
        if (sortDirection === "asc") {
          setInternalSortDirection("desc");
        } else {
          setInternalSortKey(null);
          setInternalSortDirection(null);
        }
      } else {
        setInternalSortKey(key);
        setInternalSortDirection("asc");
      }
    }
  };

  const handlePageChange = (page: number) => {
    if (isControlledPage && controlledOnPageChange) {
      controlledOnPageChange(page);
    } else {
      setInternalCurrentPage(page);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? [...sortedData] : [];
    if (isControlledSelection && onRowSelect) {
      onRowSelect(newSelection);
    } else {
      setInternalSelectedRows(newSelection);
      onRowSelect?.(newSelection);
    }
  };

  const getRowKey = (row: T, index: number): string | number => {
    if (!rowKey) return index;
    if (typeof rowKey === "function") return rowKey(row);
    return row[rowKey] as string | number;
  };

  const handleRowSelect = (row: T, checked: boolean) => {
    let newSelection: T[];
    if (checked) {
      newSelection = [...selectedRows, row];
    } else {
      newSelection = selectedRows.filter((r) => r !== row);
    }

    if (isControlledSelection && onRowSelect) {
      onRowSelect(newSelection);
    } else {
      setInternalSelectedRows(newSelection);
      onRowSelect?.(newSelection);
    }
  };

  const isRowSelected = (row: T) => {
    return selectedRows.some((r) => getRowKey(r, 0) === getRowKey(row, 0));
  };

  const allCurrentPageSelected =
    sortedData.length > 0 &&
    sortedData.every((row) => isRowSelected(row));

  const handleFilterChange = (columnKey: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnKey]: value,
    }));
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <TableContainer className={className}>
      <StyledTable>
        <thead>
          <tr>
            {selectable && (
              <CheckboxHeaderCell>
                <Checkbox
                  checked={allCurrentPageSelected}
                  onChange={handleSelectAll}
                  noPadding
                />
              </CheckboxHeaderCell>
            )}
            {columns.map((column) => (
              <TableHeaderCell
                key={column.key}
                width={column.width}
                sortable={column.sortable}
                sortDirection={
                  sortKey === column.key ? sortDirection || null : null
                }
                onSort={column.sortable ? () => handleSort(column.key) : undefined}
                filterable={column.filterable}
                filterOptions={column.filterOptions}
                filterValue={columnFilters[column.key] || ""}
                onFilterChange={
                  column.filterable
                    ? (value) => handleFilterChange(column.key, value)
                    : undefined
                }
              >
                {column.header}
              </TableHeaderCell>
            ))}
          </tr>
        </thead>
        <TableBody>
          {paginatedData.map((row, rowIndex) => (
            <TableRow
              key={getRowKey(row, rowIndex)}
              $selectable={selectable}
              onClick={
                selectable
                  ? () => handleRowSelect(row, !isRowSelected(row))
                  : undefined
              }
            >
              {selectable && (
                <CheckboxCell>
                  <Checkbox
                    checked={isRowSelected(row)}
                    onChange={(checked) => handleRowSelect(row, checked)}
                    noPadding
                    onClick={(e) => e.stopPropagation()}
                  />
                </CheckboxCell>
              )}
              {columns.map((column) => {
                const value = row[column.key];
                const content = column.render
                  ? column.render(value, row, rowIndex)
                  : value;

                return (
                  <TableCell key={column.key} align={column.align}>
                    {content}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </StyledTable>

      {pageSize !== -1 && totalPages > 1 && (
        <PaginationContainer>
          <PaginationButton
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            aria-label="Previous page"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </PaginationButton>

          <PageNumbers>
            {getPageNumbers().map((page, index) => (
              <PageNumber
                key={index}
                $active={page === currentPage}
                onClick={typeof page === "number" ? () => handlePageChange(page) : undefined}
                disabled={typeof page !== "number"}
              >
                {page}
              </PageNumber>
            ))}
          </PageNumbers>

          <PaginationButton
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            aria-label="Next page"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.5 15L12.5 10L7.5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </PaginationButton>
        </PaginationContainer>
      )}
    </TableContainer>
  );
}

Table.displayName = "Table";

export default Table;
