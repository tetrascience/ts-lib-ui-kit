import React from "react";

import type { TdpSearchBarRenderProps } from "../types";

export const DemoSearchBar: React.FC<TdpSearchBarRenderProps> = ({
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
          ×
        </button>
      )}
    </div>
    <button
      onClick={onSearch}
      disabled={!query.trim() || isLoading}
      style={{
        padding: "7px 18px",
        borderRadius: 20,
        border: "none",
        background: "var(--blue-600, #4f46e5)",
        color: "#fff",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        opacity: !query.trim() || isLoading ? 0.5 : 1,
      }}
    >
      {isLoading ? "…" : "Search"}
    </button>
  </div>
);
