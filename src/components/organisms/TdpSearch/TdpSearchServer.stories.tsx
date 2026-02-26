import React, { useEffect } from "react";

import { TdpSearch } from "./TdpSearch";
import { mockSearchResponse } from "./TdpSearch.mocks";

import type { TdpSearchBarRenderProps, TdpSearchColumn, TdpSearchFilter } from "./types";
import type { Meta, StoryObj } from "@storybook/react-vite";

const DemoSearchBar: React.FC<TdpSearchBarRenderProps> = ({
  query,
  setQuery,
  onSearch,
  isLoading,
  placeholder,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
    <div
      style={{
        display: "flex",
        flex: 1,
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        border: "1px solid var(--grey-300, #d1d5db)",
        borderRadius: 20,
        background: "var(--grey-50, #f9fafb)",
      }}
    >
      <span style={{ color: "var(--grey-400, #9ca3af)", fontSize: 14 }}>🔍</span>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        placeholder={placeholder}
        style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 14 }}
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          style={{
            border: "none",
            background: "none",
            cursor: "pointer",
            color: "var(--grey-400, #9ca3af)",
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          x
        </button>
      )}
    </div>
    <button
      onClick={onSearch}
      disabled={!query?.trim() || isLoading}
      style={{
        padding: "7px 18px",
        borderRadius: 20,
        border: "none",
        background: "var(--blue-600, #4f46e5)",
        color: "#fff",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        opacity: !query?.trim() || isLoading ? 0.5 : 1,
      }}
    >
      {isLoading ? "…" : "Search"}
    </button>
  </div>
);


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
  parameters: {
    zephyr: { testCaseId: "SW-T1120" },
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
  parameters: {
    zephyr: { testCaseId: "SW-T1121" },
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
  parameters: {
    zephyr: { testCaseId: "SW-T1122" },
  },
};

export const CustomRendering: Story = {
  args: {
    columns,
    defaultQuery: "experiment",
    defaultSort: { field: "createdAt", order: "desc" },
    pageSize: 10,
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1123" },
  },
};

/** Custom search bar via renderSearchBar — TdpSearch manages all state; only the input UI is swapped. */
export const CustomSearchBar: Story = {
  render: (args) => <TdpSearch {...args} renderSearchBar={(props) => <DemoSearchBar {...props} />} />,
  args: {
    columns,
    defaultQuery: "sample",
    pageSize: 10,
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1124" },
  },
};
