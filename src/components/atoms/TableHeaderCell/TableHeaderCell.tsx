import { Dropdown } from "@atoms/Dropdown";
import React from "react";
import styled from "styled-components";

import type { DropdownOption } from "@atoms/Dropdown";

export interface TableHeaderCellProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  sortable?: boolean;
  sortDirection?: "asc" | "desc" | null;
  onSort?: () => void;
  filterable?: boolean;
  filterOptions?: DropdownOption[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  width?: string;
  className?: string;
  ref?: React.Ref<HTMLTableCellElement>;
}

const StyledTableHeaderCell = styled.th<{ width?: string }>`
  background-color: var(--grey-50);
  border-right: 1px solid var(--grey-200);
  border-bottom: 1px solid var(--grey-200);
  padding: 8px 12px;
  height: 35px;
  box-sizing: border-box;
  width: ${(props) => props.width || "auto"};

  &:last-child {
    border-right: 1px solid var(--grey-200);
  }
`;

const HeaderContent = styled.div<{ $clickable?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: ${(props) => (props.$clickable ? "pointer" : "default")};
  user-select: none;
`;

const HeaderText = styled.span`
  font-family: "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
  color: var(--grey-900);
  white-space: nowrap;
  flex-shrink: 0;
`;

const SortIcon = styled.svg`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

const DropdownContainer = styled.div`
  padding: 10px 4px;
  height: 35px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  & > div {
    height: 32px;
  }

  li {
    text-align: left;
  }
`;

export const TableHeaderCell = ({
  children,
  sortable = false,
  sortDirection = null,
  onSort,
  filterable = false,
  filterOptions = [],
  filterValue,
  onFilterChange,
  width,
  className,
  ref,
  ...props
}: TableHeaderCellProps) => {
  const handleSort = () => {
    if (sortable && onSort) {
      onSort();
    }
  };

  // If filterable, render dropdown instead of text
  if (filterable) {
    return (
      <StyledTableHeaderCell
        ref={ref}
        width={width}
        className={className}
        {...props}
      >
        <DropdownContainer>
          <Dropdown
            options={filterOptions}
            value={filterValue}
            onChange={onFilterChange}
            placeholder="Placeholder"
            size="small"
            width="100%"
          />
        </DropdownContainer>
      </StyledTableHeaderCell>
    );
  }

  // Otherwise render normal header with optional sort
  return (
    <StyledTableHeaderCell
      ref={ref}
      width={width}
      className={className}
      {...props}
    >
      <HeaderContent $clickable={sortable} onClick={handleSort}>
        <HeaderText>{children}</HeaderText>
        {sortable && (
          <SortIcon
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 3.33337L10.6667 6.00004H5.33333L8 3.33337Z"
              fill={sortDirection === "asc" ? "var(--grey-900)" : "var(--grey-400)"}
            />
            <path
              d="M8 12.6667L5.33333 10H10.6667L8 12.6667Z"
              fill={sortDirection === "desc" ? "var(--grey-900)" : "var(--grey-400)"}
            />
          </SortIcon>
        )}
      </HeaderContent>
    </StyledTableHeaderCell>
  );
};

export default TableHeaderCell;
