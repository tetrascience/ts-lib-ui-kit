import React, { useEffect } from "react";

import { TdpSearch } from "./TdpSearch";
import { mockSearchResponse } from "./TdpSearch.mocks";

import type { TdpSearchBarRenderProps, TdpSearchColumn, TdpSearchFilter } from "./types";
import type { Meta, StoryObj } from "@storybook/react-vite";

const DemoSearchBar: React.FC<TdpSearchBarRenderProps> = ({ query, setQuery, onSearch, isLoading, placeholder }) => (
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
  { key: "id", header: "ID", width: "120px" },
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
  { key: "status", header: "Status", sortable: true },
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
      { key: "status", header: "Status", sortable: true },
      { key: "fileSize", header: "Size", sortable: true },
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
      { key: "fileSize", header: "Size", sortable: true },
      { key: "createdAt", header: "Created", sortable: true },
    ],
    filters,
    defaultQuery: "sample",
    pageSize: 10,
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1122" },
  },
};

/** Demonstrates per-column custom renderers: colored status badges, source-type pills, monospace file paths, and human-readable sizes/dates. */
export const CustomRendering: Story = {
  args: {
    columns: [
      {
        key: "id",
        header: "ID",
        width: "100px",
        render: (value) => (
          <code style={{ fontSize: 12, color: "var(--grey-500, #6b7280)", letterSpacing: "0.02em" }}>{value}</code>
        ),
      },
      {
        key: "filePath",
        header: "File Path",
        sortable: true,
        render: (value) => (
          <span
            style={{
              fontFamily: "'Fira Code', 'Source Code Pro', monospace",
              fontSize: 13,
              color: "var(--blue-700, #1d4ed8)",
              textDecoration: "underline",
              textDecorationColor: "var(--blue-200, #bfdbfe)",
              textUnderlineOffset: 2,
              cursor: "pointer",
            }}
          >
            {value}
          </span>
        ),
      },
      {
        key: "sourceType",
        header: "Source Type",
        sortable: true,
        render: (value) => {
          const colorMap: Record<string, { bg: string; fg: string; border: string }> = {
            "instrument-data": { bg: "#eff6ff", fg: "#1e40af", border: "#bfdbfe" },
            "manual-upload": { bg: "#fefce8", fg: "#854d0e", border: "#fde68a" },
            "pipeline-output": { bg: "#f0fdf4", fg: "#166534", border: "#bbf7d0" },
          };
          const colors = colorMap[value] ?? { bg: "#f3f4f6", fg: "#374151", border: "#d1d5db" };
          return (
            <span
              style={{
                display: "inline-block",
                padding: "3px 10px",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600,
                backgroundColor: colors.bg,
                color: colors.fg,
                border: `1px solid ${colors.border}`,
                whiteSpace: "nowrap",
              }}
            >
              {(value ?? "unknown").replace(/-/g, " ")}
            </span>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        render: (value) => {
          const statusMap: Record<string, { bg: string; fg: string; dot: string }> = {
            processed: { bg: "#f0fdf4", fg: "#15803d", dot: "#22c55e" },
            pending: { bg: "#fffbeb", fg: "#b45309", dot: "#f59e0b" },
            failed: { bg: "#fef2f2", fg: "#b91c1c", dot: "#ef4444" },
          };
          const s = statusMap[value] ?? { bg: "#f3f4f6", fg: "#374151", dot: "#9ca3af" };
          return (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 10px",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600,
                backgroundColor: s.bg,
                color: s.fg,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: s.dot, flexShrink: 0 }} />
              {value}
            </span>
          );
        },
      },
      {
        key: "fileSize",
        header: "Size",
        align: "right" as const,
        sortable: true,
        render: (value) => {
          if (!value) return <span style={{ color: "var(--grey-400, #9ca3af)" }}>—</span>;
          const mb = value / 1024 / 1024;
          const maxMb = 6;
          const pct = Math.min((mb / maxMb) * 100, 100);
          return (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, minWidth: 120 }}>
              <span
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "var(--grey-100, #f3f4f6)",
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    display: "block",
                    height: "100%",
                    width: `${pct}%`,
                    borderRadius: 3,
                    backgroundColor: pct > 75 ? "#f59e0b" : "var(--blue-500, #3b82f6)",
                    transition: "width 0.3s ease",
                  }}
                />
              </span>
              <span style={{ fontSize: 12, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                {mb.toFixed(1)} MB
              </span>
            </span>
          );
        },
      },
      {
        key: "createdAt",
        header: "Created",
        sortable: true,
        render: (value) => {
          if (!value) return "—";
          const d = new Date(value);
          return (
            <span style={{ fontSize: 13, color: "var(--grey-600, #4b5563)" }}>
              {d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              <span style={{ color: "var(--grey-400, #9ca3af)", marginLeft: 6, fontSize: 12 }}>
                {d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </span>
          );
        },
      },
    ] as TdpSearchColumn[],
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
