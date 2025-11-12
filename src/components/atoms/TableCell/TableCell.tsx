import React, { forwardRef } from "react";
import styled from "styled-components";

export interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
  className?: string;
}

const StyledTableCell = styled.td<TableCellProps>`
  background-color: var(--white-900);
  border-right: 1px solid var(--grey-200);
  border-bottom: 1px solid var(--grey-200);
  padding: 10px 12px;
  font-family: "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--grey-900);
  opacity: 0.8;
  text-align: ${(props) => props.align || "left"};
  width: ${(props) => props.width || "auto"};
  white-space: nowrap;
  box-sizing: border-box;

  &:last-child {
    border-right: 1px solid var(--grey-200);
  }
`;

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, align = "left", width, className, ...props }, ref) => {
    return (
      <StyledTableCell
        ref={ref}
        align={align}
        width={width}
        className={className}
        {...props}
      >
        {children}
      </StyledTableCell>
    );
  }
);

TableCell.displayName = "TableCell";

export default TableCell;
