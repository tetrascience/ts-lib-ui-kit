import { Table } from "@molecules/Table";
import React from "react";

import type { TdpResultsRenderProps } from "../types";

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
}) => (
  <>
    <div className="tdp-search__results-header">
      <div className="tdp-search__results-count">
        Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, total)} of {total} results
      </div>
    </div>
    <Table
      columns={columns}
      data={results}
      pageSize={pageSize}
      currentPage={currentPage}
      totalItems={total}
      onPageChange={onPageChange}
      sortKey={sortKey || undefined}
      sortDirection={sortDirection}
      onSort={onSort}
      rowKey={(row) => row.id || Math.random().toString()}
    />
  </>
);
