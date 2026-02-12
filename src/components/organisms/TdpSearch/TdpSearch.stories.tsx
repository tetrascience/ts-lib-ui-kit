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
        component: `A search component for querying the TetraScience Data Platform (TDP). 
          Provides a search input, filters, sortable results table, and pagination.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| \`baseUrl\` | \`string\` | Yes | TDP API base URL |
| \`authToken\` | \`string\` | Yes | Authentication token |
| \`orgSlug\` | \`string\` | Yes | Organization slug |
| \`columns\` | \`TdpSearchColumn[]\` | Yes | Column definitions |
| \`filters\` | \`TdpSearchFilter[]\` | No | Filter configurations |
| \`sortOptions\` | \`TdpSearchSort[]\` | No | Default sort options |
| \`pageSize\` | \`number\` | No | Results per page (default: 10) |
| \`defaultQuery\` | \`string\` | No | Initial EQL query |
| \`searchPlaceholder\` | \`string\` | No | Search input placeholder |
| \`className\` | \`string\` | No | Custom CSS class |
| \`onSearch\` | \`function\` | No | Callback when search executes |

## EQL Query Language

The component uses TetraScience's EQL (Event Query Language) for searching:

\`\`\`sql
-- Basic search
SELECT * FROM samples LIMIT 10

-- With filters
SELECT * FROM samples WHERE type = 'experiment'

-- With sorting
SELECT * FROM samples ORDER BY createdAt DESC

-- Complex query
SELECT id, name, type FROM samples 
WHERE type IN ('sample', 'experiment') 
AND createdAt > '2024-01-01'
ORDER BY name ASC
LIMIT 20
\`\`\`
          `,
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
 * Basic usage with minimal configuration.
 * Shows simple columns without filters or custom rendering.
 */
export const BasicUsage: Story = {
  args: {
    ...mockConfig,
    columns: [
      { key: "id", header: "ID", width: "120px" },
      { key: "name", header: "Name", sortable: true },
      { key: "type", header: "Type", sortable: true },
      { key: "createdAt", header: "Created", sortable: true },
    ],
    defaultQuery: "SELECT * FROM samples LIMIT 10",
    searchPlaceholder: "Search samples...",
  },
};

/**
 * Search with filters applied.
 * Users can filter results by type and status using dropdown filters.
 */
export const WithFilters: Story = {
  args: {
    ...mockConfig,
    columns: [
      { key: "id", header: "ID" },
      { key: "name", header: "Name", sortable: true },
      { key: "type", header: "Type", sortable: true },
      { key: "status", header: "Status", sortable: true },
    ],
    filters,
    defaultQuery: "SELECT * FROM samples",
    pageSize: 10,
  },
};

/**
 * Custom cell rendering and formatting.
 * Demonstrates custom rendering for status badges and formatted file sizes.
 */
export const CustomRendering: Story = {
  args: {
    ...mockConfig,
    columns,
    defaultQuery: "SELECT * FROM samples ORDER BY createdAt DESC",
    pageSize: 10,
    searchPlaceholder: "Search across all fields...",
  },
};

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
