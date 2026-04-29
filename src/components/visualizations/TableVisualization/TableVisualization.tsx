import React from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { withVisualization } from "@/lib/visualization";

type TableCellValue = string | number | boolean | null | undefined;

type TableVisualizationProps = {
  columns?: string[];
  rows?: TableCellValue[][];
  title?: string;
  maxHeight?: number;
  className?: string;
};

const TableVisualization: React.FC<TableVisualizationProps> = ({
  columns = [],
  rows = [],
  title,
  maxHeight = 320,
  className,
}) => {
  return (
    <div className={cn("w-full rounded-lg border bg-card", className)}>
      {title && <div className="border-b px-4 py-2.5 text-sm font-medium text-foreground">{title}</div>}
      <div className="overflow-auto" style={{ maxHeight }}>
        <Table containerClassName="rounded-b-lg" variant="card">
          <TableHeader variant="sticky">
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell className="h-24 text-center text-muted-foreground" colSpan={columns.length || 1}>
                  No rows
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column, columnIndex) => {
                    const cell = row[columnIndex];
                    return (
                      <TableCell
                        key={`${rowIndex}:${column}`}
                        variant={typeof cell === "number" ? "numeric" : undefined}
                      >
                        {formatCell(cell)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

function formatCell(value: TableCellValue): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

const TableVisualizationWithMeta = withVisualization(TableVisualization, {
  id: "table",
  inputKind: "table",
  description: "Tabular visualization for columnar calculation outputs.",
  tunableProps: [
    {
      name: "maxHeight",
      type: "number",
      description: "Maximum visible table height in pixels before scrolling.",
      default: 320,
      validation: { min: 120, max: 800 },
    },
  ],
});

export { TableVisualizationWithMeta as TableVisualization };
export type { TableCellValue, TableVisualizationProps };
