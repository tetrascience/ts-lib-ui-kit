import React, { useEffect } from "react";

import { TdpSearch } from "./TdpSearch";
import { mockSearchResponse } from "./TdpSearch.mocks";

import type { TdpSearchColumn, TdpSearchFilter } from "./types";
import type { Meta, StoryObj } from "@storybook/react-vite";

/** Mock /api/search so server-side stories work without a backend. */
const withMockFetch = (Story: React.ComponentType) => {
  const MockWrapper = () => {
    useEffect(() => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = async (url: RequestInfo | URL, options?: RequestInit) => {
        const urlString = url.toString();
        if (urlString.includes("/api/search")) {
          await new Promise((resolve) => setTimeout(resolve, 400));

          let hits = mockSearchResponse.hits.hits;

          try {
            const body = JSON.parse((options?.body as string) ?? "{}");
            const expressions: Array<{ field?: string; operator?: string; value?: any }> = body.expression?.e ?? [];
            const fieldFilters = expressions.filter((e) => e.field && e.operator === "eq");

            if (fieldFilters.length > 0) {
              hits = hits.filter((hit) => fieldFilters.every((f) => hit._source?.[f.field!] === f.value));
            }
          } catch {
            // malformed body — return all hits
          }

          const filtered = {
            ...mockSearchResponse,
            hits: {
              ...mockSearchResponse.hits,
              total: { value: hits.length, relation: "eq" as const },
              hits,
            },
          };

          return new Response(JSON.stringify(filtered), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
        return originalFetch(url, options);
      };
      return () => {
        globalThis.fetch = originalFetch;
      };
    }, []);
    return <Story />;
  };
  return <MockWrapper />;
};

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

const meta: Meta<typeof TdpSearch> = {
  title: "Organisms/TdpSearch/Server",
  component: TdpSearch,
  decorators: [withMockFetch],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Server-side TdpSearch: calls `apiEndpoint` with cookies (or optional `authToken` / `orgSlug` headers). " +
          "Backend uses `tdpSearchManager` from `@tetrascience-npm/tetrascience-react-ui/server`.\n\n" +
          "Mock returns sample data so stories work without a backend.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TdpSearch>;

export const BasicUsage: Story = {
  args: {
    apiEndpoint: "/api/search",
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

export const FullFeatured: Story = {
  args: {
    columns,
    filters,
    defaultQuery: "sample",
    defaultSort: { field: "createdAt", order: "desc" },
    pageSize: 15,
    onSearch: () => {},
  },
};

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

export const CustomRendering: Story = {
  args: {
    columns,
    defaultQuery: "experiment",
    defaultSort: { field: "createdAt", order: "desc" },
    pageSize: 10,
  },
};
