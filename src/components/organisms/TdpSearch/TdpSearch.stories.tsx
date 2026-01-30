import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TdpSearch } from "./TdpSearch";
import { TdpSearchColumn, TdpSearchFilter } from "./TdpSearch";

const meta: Meta<typeof TdpSearch> = {
  title: "Organisms/TdpSearch",
  component: TdpSearch,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          `A search component for querying the TDP. <br/>
          Provides search input, filters, sortable results table, and pagination.`,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TdpSearch>;

// Mock config
const mockConfig = {
  baseUrl: "https://api.tetrascience-dev.com",
  authToken: "demo-token",
  orgSlug: "data-apps-demo",
};

// Columns with custom rendering
const columns: TdpSearchColumn[] = [
  { key: "id", header: "ID", width: "120px" },
  { key: "name", header: "Name", sortable: true },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (value) => (
      <span
        style={{
          padding: "4px 8px",
          borderRadius: "4px",
          border: "1px solid var(--grey-200)",
          fontWeight: 500,
          fontSize: "12px",
        }}
      >
        {value}
      </span>
    ),
  },
  { key: "type", header: "Type", sortable: true },
  {
    key: "size",
    header: "Size",
    align: "right" as const,
    sortable: true,
    render: (value) => {
      if (!value) return "-";
      const mb = (value / 1024 / 1024).toFixed(2);
      return `${mb} MB`;
    },
  },
  { key: "createdAt", header: "Created At", sortable: true },
];

// Filters
const filters: TdpSearchFilter[] = [
  {
    key: "type",
    label: "Type",
    options: [
      { value: "", label: "All Types" },
      { value: "sample", label: "Sample" },
      { value: "experiment", label: "Experiment" },
      { value: "protocol", label: "Protocol" },
    ],
  },
  {
    key: "status",
    label: "Status",
    options: [
      { value: "", label: "All Statuses" },
      { value: "active", label: "Active" },
      { value: "pending", label: "Pending" },
      { value: "archived", label: "Archived" },
    ],
  },
];

/**
 * Full-featured TDP search component.
 * Demonstrates filters, sorting, custom rendering, and pagination.
 */
export const FullFeatured: Story = {
  args: {
    ...mockConfig,
    columns,
    filters,
    defaultQuery: "SELECT * FROM samples ORDER BY createdAt DESC",
    pageSize: 15,
    searchPlaceholder: "Search across all fields...",
    onSearch: (query, results) => {
      console.log("Search executed:", query);
      console.log("Results:", results);
    },
  },
};
