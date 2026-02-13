import React, { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TdpSearch } from "./TdpSearch";
import { TdpSearchColumn, TdpSearchFilter } from "./TdpSearch";
import { mockSearchResponse } from "./TdpSearch.mocks";

/**
 * Mock fetch decorator to intercept API calls in Storybook
 */
const withMockFetch = (Story: any) => {
  const MockWrapper = () => {
    useEffect(() => {
      const originalFetch = global.fetch;

      // Mock fetch for /api/search
      global.fetch = async (url: RequestInfo | URL, options?: RequestInit) => {
        const urlString = url.toString();

        if (urlString.includes("/api/search")) {
          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          return new Response(JSON.stringify(mockSearchResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        // For other URLs, use original fetch
        return originalFetch(url, options);
      };

      // Cleanup on unmount
      return () => {
        global.fetch = originalFetch;
      };
    }, []);

    return <Story />;
  };

  return <MockWrapper />;
};

const meta: Meta<typeof TdpSearch> = {
  title: "Organisms/TdpSearch",
  component: TdpSearch,
  decorators: [withMockFetch],
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TdpSearch>;

// Columns with custom rendering for file search results
const columns: TdpSearchColumn[] = [
  { key: "id", header: "File ID", width: "200px" },
  { key: "filePath", header: "File Path", sortable: true },
  {
    key: "sourceType",
    header: "Source Type",
    sortable: true,
    render: (value) => (
      <span
        style={{
          padding: "4px 8px",
          borderRadius: "4px",
          border: "1px solid var(--grey-200)",
          fontWeight: 500,
          fontSize: "12px",
          backgroundColor: "var(--grey-50)",
        }}
      >
        {value || "unknown"}
      </span>
    ),
  },
  {
    key: "fileSize",
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

// UI filters (for dropdown selection)
const filters: TdpSearchFilter[] = [
  {
    key: "sourceType",
    label: "Source Type",
    options: [
      { value: "", label: "All Types" },
      { value: "instrument-data", label: "Instrument Data" },
      { value: "manual-upload", label: "Manual Upload" },
      { value: "pipeline-output", label: "Pipeline Output" },
    ],
  },
  {
    key: "status",
    label: "Status",
    options: [
      { value: "", label: "All Statuses" },
      { value: "processed", label: "Processed" },
      { value: "pending", label: "Pending" },
      { value: "failed", label: "Failed" },
    ],
  },
];

/**
 * Basic usage with minimal configuration.
 */
export const BasicUsage: Story = {
  args: {
    columns: [
      { key: "id", header: "ID", width: "120px" },
      { key: "filePath", header: "File Path", sortable: true },
      { key: "sourceType", header: "Source Type", sortable: true },
      { key: "createdAt", header: "Created", sortable: true },
    ],
    defaultQuery: "sample-data",
    searchPlaceholder: "Search files...",
  },
};

/**
 * Search with filters.
 */
export const WithFilters: Story = {
  args: {
    columns: [
      { key: "id", header: "ID" },
      { key: "filePath", header: "File Path", sortable: true },
      { key: "sourceType", header: "Source Type", sortable: true },
      { key: "status", header: "Status", sortable: true },
    ],
    filters,
    pageSize: 10,
  },
};

/**
 * Custom cell rendering with badges and formatted sizes.
 */
export const CustomRendering: Story = {
  args: {
    columns,
    defaultQuery: "experiment",
    defaultSort: { field: "createdAt", order: "desc" },
    pageSize: 10,
  },
};

/**
 * Full-featured example with all options.
 */
export const FullFeatured: Story = {
  args: {
    columns,
    filters,
    defaultQuery: "sample",
    defaultSort: { field: "createdAt", order: "desc" },
    pageSize: 15,
    onSearch: (query, results) => {
      console.log("Search executed:", query);
      console.log("Results:", results);
    },
  },
};

/**
 * Custom API endpoint.
 */
export const CustomEndpoint: Story = {
  args: {
    apiEndpoint: "/api/v1/tdp/search",
    columns: [
      { key: "id", header: "ID" },
      { key: "filePath", header: "File Path", sortable: true },
    ],
    defaultQuery: "data",
  },
};

/**
 * With advanced search parameters.
 */
export const WithAdvancedParams: Story = {
  args: {
    columns,
    filters,
    advancedSearchParams: {
      selectedSourceTypes: ["instrument-data", "manual-upload"],
      expression: {
        g: "AND",
        e: [{ field: "status", operator: "eq", value: "processed" }],
      },
    },
  },
};
