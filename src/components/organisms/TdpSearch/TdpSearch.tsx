import Search from "@assets/icon/Search";
import { Button } from "@atoms/Button";
import { Dropdown } from "@atoms/Dropdown";
import { ErrorAlert } from "@atoms/ErrorAlert";
import { Input } from "@atoms/Input";
import { Table } from "@molecules/Table";
import React, { useState } from "react";

import { useServerSideSearch } from "./hooks/useServerSideSearch";
import { useStandaloneSearch } from "./hooks/useStandaloneSearch";

import type { DropdownOption } from "@atoms/Dropdown";
import type { SearchEqlRequest } from "@tetrascience-npm/ts-connectors-sdk";

import "./TdpSearch.scss";

/** Transformed search result (flattened from Elasticsearch hit format) */
export interface SearchResult {
  id: string;
  _score?: number | null;
  [key: string]: any;
}

/** Configuration for a search filter */
export interface TdpSearchFilter {
  key: string;
  label: string;
  options: DropdownOption[];
}

/** Search expression for complex queries (matches SDK SearchEqlExpression) */
export interface SearchEqlExpression {
  g: "AND" | "OR";
  e: Array<{
    field?: string;
    operator?: string;
    value?: any;
    g?: "AND" | "OR";
    e?: SearchEqlExpression["e"];
  }>;
}

/** Configuration for column display */
export interface TdpSearchColumn {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: SearchResult, index: number) => React.ReactNode;
}

/** Sort configuration */
export interface TdpSearchSort {
  field: string;
  order: "asc" | "desc";
}

/** Standalone search configuration (calls TDP API directly from the browser; no backend) */
interface StandaloneSearchConfig {
  /** Use standalone search mode (calls baseUrl + /v1/datalake/searchEql with auth headers) */
  standalone: true;
  /** TDP API base URL */
  baseUrl: string;
  /** Authentication token */
  authToken: string;
  /** Organization slug */
  orgSlug: string;
}

/** Server-side search configuration (API endpoint; backend uses TdpSearchManager or custom API) */
interface ServerSideSearchConfig {
  /** Use server-side search mode (default) */
  standalone?: false;
  /** API endpoint for search. Defaults to '/api/search' */
  apiEndpoint?: string;
  /** Optional: send as ts-auth-token / x-org-slug headers (e.g. emulate creds from Storybook) */
  authToken?: string;
  orgSlug?: string;
}

/** Common props shared by both search modes */
interface CommonTdpSearchProps {
  // Search configuration
  /** Default search term (default query) */
  defaultQuery?: string;
  /** Display fields/columns for the results table */
  columns: TdpSearchColumn[];
  /** UI filters displayed as dropdowns (for user selection) */
  filters?: TdpSearchFilter[];
  /** Default sort configuration (sort options) */
  defaultSort?: TdpSearchSort;

  // Advanced search configuration (optional SDK parameters)
  /**
   * Additional search parameters to pass to the SDK's searchEql method.
   * Allows customization of expression, selectedPipelineIds, selectedSourceTypes, etc.
   */
  advancedSearchParams?: Partial<Omit<SearchEqlRequest, "searchTerm" | "from" | "size" | "sort" | "order">>;

  // UI configuration
  /** Results per page. Defaults to 10 */
  pageSize?: number;
  /** Search input placeholder text */
  searchPlaceholder?: string;
  /** Custom CSS class */
  className?: string;

  /** Callback fired when search is executed with the query and results */
  onSearch?: (query: SearchEqlRequest, results: SearchResult[]) => void;
}

/**
 * TdpSearch component props with conditional types (standalone or server-side).
 */
export type TdpSearchProps = CommonTdpSearchProps & (StandaloneSearchConfig | ServerSideSearchConfig);

/**
 * TdpSearch Component
 *
 * A reusable search component for querying the TDP.
 *
 * @example
 * ```tsx
 * <TdpSearch
 *   columns={[
 *     { key: "id", header: "ID" },
 *     { key: "filePath", header: "File Path", sortable: true }
 *   ]}
 *   defaultQuery="sample-data"
 *   pageSize={20}
 * />
 * ```
 */

export const TdpSearch: React.FC<TdpSearchProps> = ({
  defaultQuery = "",
  columns,
  filters = [],
  defaultSort,
  advancedSearchParams,
  pageSize = 10,
  searchPlaceholder = "Enter search term...",
  className,
  onSearch,
  ...props
}) => {
  const isStandalone = "standalone" in props && props.standalone === true;

  const standaloneConfig =
    isStandalone && "baseUrl" in props && "authToken" in props && "orgSlug" in props
      ? {
          baseUrl: props.baseUrl,
          authToken: props.authToken,
          orgSlug: props.orgSlug,
          pageSize,
        }
      : {
          baseUrl: "",
          authToken: "",
          orgSlug: "",
          pageSize,
        };

  const serverSideConfig = {
    apiEndpoint: !isStandalone && "apiEndpoint" in props ? (props.apiEndpoint ?? "/api/search") : "/api/search",
    pageSize,
    ...(!isStandalone && "authToken" in props && "orgSlug" in props
      ? { authToken: props.authToken, orgSlug: props.orgSlug }
      : {}),
  };

  const standaloneResults = useStandaloneSearch(standaloneConfig);
  const serverSideResults = useServerSideSearch(serverSideConfig);

  const { results, total, currentPage, isLoading, error, executeSearch } = isStandalone
    ? standaloneResults
    : serverSideResults;

  // UI state
  const [query, setQuery] = useState(defaultQuery);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [hasSearched, setHasSearched] = useState(false);

  // Execute search with current UI state. Optional sortOverride avoids stale state when called from handleSort.
  const handleExecuteSearch = async (
    page: number = 1,
    sortOverride?: { sortKey: string; sortDirection: "asc" | "desc" },
  ) => {
    if (!query.trim()) {
      return;
    }

    setHasSearched(true);

    const effectiveSortKey = sortOverride?.sortKey ?? sortKey ?? defaultSort?.field;
    const effectiveOrder =
      sortOverride == null
        ? sortKey
          ? sortDirection
          : (defaultSort?.order ?? sortDirection)
        : sortOverride.sortDirection;

    const searchRequest: Omit<SearchEqlRequest, "from" | "size"> = {
      searchTerm: query.trim(),
      sort: effectiveSortKey ?? undefined,
      order: effectiveOrder,
      ...advancedSearchParams, // Spread any additional SDK parameters
    };

    const newResults = await executeSearch(searchRequest, page);

    // Call onSearch with the freshly fetched results (not stale state)
    if (onSearch) {
      onSearch({ ...searchRequest, from: (page - 1) * pageSize, size: pageSize }, newResults);
    }
  };

  // Handle search button click
  const handleSearch = () => {
    handleExecuteSearch(1);
  };

  // Handle Enter key in search input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Handle filter change
  const handleFilterChange = (filterKey: string, value: string) => {
    setFilterValues((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    handleExecuteSearch(page);
  };

  // Handle sort
  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
    handleExecuteSearch(1, { sortKey: key, sortDirection: direction });
  };

  const SearchBarComponent = () => {
    return (
      <div className="tdp-search__search-bar">
        <div className="tdp-search__search-input-wrapper">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder}
            iconLeft={<Search />}
            size="small"
          />
        </div>
        <Button variant="primary" onClick={handleSearch} disabled={!query.trim() || isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>
    );
  };

  const FiltersComponent = () => {
    return (
      <div className="tdp-search__filters-row">
        {filters.map((filter) => (
          <div key={filter.key} className="tdp-search__filter-wrapper">
            <label className="tdp-search__filter-label">{filter.label}</label>
            <Dropdown
              options={filter.options}
              value={filterValues[filter.key] || ""}
              onChange={(value) => handleFilterChange(filter.key, value)}
            />
          </div>
        ))}
      </div>
    );
  };

  const NoResultsComponent = () => {
    return (
      <div className="tdp-search__empty-state">
        <div className="tdp-search__empty-state-icon">
          <Search />
        </div>
        <div className="tdp-search__empty-state-text">
          No results found. Try adjusting your search query or filters.
        </div>
      </div>
    );
  };

  const PlaceholderComponent = () => {
    return (
      <div className="tdp-search__empty-state">
        <div className="tdp-search__empty-state-icon">
          <Search />
        </div>
        <div className="tdp-search__empty-state-text">Enter a search query and click Search to get started.</div>
      </div>
    );
  };

  return (
    <div className={`tdp-search ${className || ""}`}>
      <SearchBarComponent />

      {filters.length > 0 && <FiltersComponent />}

      {error && (
        <>
          <ErrorAlert error={error} onClose={() => {}} />
          <NoResultsComponent />
        </>
      )}

      {isLoading && <div className="tdp-search__loading-overlay">Loading results...</div>}

      {!isLoading && !hasSearched && <PlaceholderComponent />}

      {!isLoading && !error && hasSearched && results.length > 0 && (
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
            onPageChange={handlePageChange}
            sortKey={sortKey || undefined}
            sortDirection={sortDirection}
            onSort={handleSort}
            rowKey={(row) => row.id || Math.random().toString()}
          />
        </>
      )}

      {!isLoading && !error && hasSearched && results.length === 0 && <NoResultsComponent />}
    </div>
  );
};

export default TdpSearch;
