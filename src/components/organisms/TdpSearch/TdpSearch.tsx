import React, { useState, useEffect } from "react";
import { TDPClient, SearchEqlRequest, SearchEqlResponse } from "@tetrascience-npm/ts-connectors-sdk";
import { Input } from "@atoms/Input";
import { Button } from "@atoms/Button";
import { Dropdown, DropdownOption } from "@atoms/Dropdown";
import { Table } from "@molecules/Table";
import { ErrorAlert } from "@atoms/ErrorAlert";
import Search from "@assets/icon/Search";
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

/** Props for TdpSearch component */
export interface TdpSearchProps {
  baseUrl: string;
  authToken: string;
  orgSlug: string;

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
  pageSize?: number;
  searchPlaceholder?: string;
  className?: string;

  // Callbacks
  /** Callback fired when search is executed with the query and results */
  onSearch?: (query: SearchEqlRequest, results: SearchResult[]) => void;
}

/**
 * TdpSearch Component
 *
 * A reusable search component for querying the TDP.
 *
 * @example Basic search
 * ```tsx
 * <TdpSearch
 *   baseUrl="https://api.tetrascience-dev.com"
 *   authToken={token}
 *   orgSlug="data-apps-demo"
 *   defaultQuery="sample-data"
 *   columns={[
 *     { key: "id", header: "ID" },
 *     { key: "filePath", header: "File Path", sortable: true },
 *     { key: "sourceType", header: "Source Type" }
 *   ]}
 *   defaultSort={{ field: "createdAt", order: "desc" }}
 *   pageSize={20}
 * />
 * ```
 *
 * @example With advanced search parameters
 * ```tsx
 * <TdpSearch
 *   baseUrl="https://api.tetrascience-dev.com"
 *   authToken={token}
 *   orgSlug="data-apps-demo"
 *   columns={columns}
 *   filters={[
 *     {
 *       key: "status",
 *       label: "Status",
 *       options: [
 *         { value: "processed", label: "Processed" },
 *         { value: "pending", label: "Pending" }
 *       ]
 *     }
 *   ]}
 *   advancedSearchParams={{
 *     selectedSourceTypes: ["instrument-data"],
 *     expression: {
 *       g: "AND",
 *       e: [
 *         { field: "status", operator: "eq", value: "processed" }
 *       ]
 *     }
 *   }}
 * />
 * ```
 */

export function TdpSearch({
  baseUrl,
  authToken,
  orgSlug,
  defaultQuery = "",
  columns,
  filters = [],
  defaultSort,
  advancedSearchParams,
  pageSize = 10,
  searchPlaceholder = "Enter search term...",
  className,
  onSearch,
}: TdpSearchProps) {
  const [tdpClient, setTdpClient] = useState<TDPClient | null>(null);
  const [isClientReady, setIsClientReady] = useState(false);
  const [query, setQuery] = useState(defaultQuery);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [hasSearched, setHasSearched] = useState(false);

  // Initialize TDP client
  useEffect(() => {
    if (!baseUrl || !authToken || !orgSlug) {
      return;
    }

    const initClient = async () => {
      const client = new TDPClient({
        tdpEndpoint: baseUrl,
        orgSlug,
        authToken,
        connectorId: "", // Not needed for search-only operations
      });

      try {
        await client.init();
        setTdpClient(client);
        setIsClientReady(true);
      } catch (err: any) {
        setError(`Failed to initialize TDP client: ${err.message}`);
      }
    };

    initClient();
  }, [baseUrl, authToken, orgSlug]);

  // Execute search
  const executeSearch = async (page: number = 1) => {
    if (!tdpClient || !isClientReady || !query.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Use user sort if available, otherwise fall back to defaultSort
      const effectiveSort = sortKey || defaultSort?.field;
      const effectiveOrder = sortKey ? sortDirection : defaultSort?.order || sortDirection;

      const searchRequest: SearchEqlRequest = {
        searchTerm: query.trim(),
        size: pageSize,
        from: (page - 1) * pageSize,
        sort: effectiveSort,
        order: effectiveOrder,
        ...advancedSearchParams, // Spread any additional SDK parameters
      };

      const response: SearchEqlResponse = await tdpClient.searchEql(searchRequest);

      // Transform Elasticsearch results to flat objects
      // Each hit has _source containing the actual document data
      const transformedResults: SearchResult[] = (response.hits.hits || []).map((hit) => ({
        id: hit._id,
        ...hit._source,
        _score: hit._score,
      }));

      // Extract total (can be number or object with value)
      const total = typeof response.hits.total === "number" ? response.hits.total : response.hits.total.value;

      setResults(transformedResults);
      setTotal(total);
      setCurrentPage(page);

      onSearch?.(searchRequest, transformedResults);
    } catch (err: any) {
      setError(err.message || "An error occurred while searching");
      setResults([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search button click
  const handleSearch = () => {
    setCurrentPage(1);
    executeSearch(1);
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
    executeSearch(page);
  };

  // Handle sort
  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
    setCurrentPage(1);
    executeSearch(1);
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
          <ErrorAlert error={error} onClose={() => setError(null)} />
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
}

export default TdpSearch;
