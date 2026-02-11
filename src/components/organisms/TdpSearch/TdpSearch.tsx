import React, { useState, useEffect } from "react";
import { Input } from "@atoms/Input";
import { Button } from "@atoms/Button";
import { Dropdown, DropdownOption } from "@atoms/Dropdown";
import { Table } from "@molecules/Table";
import { ErrorAlert } from "@atoms/ErrorAlert";
import Search from "@assets/icon/Search";
import { TdpSearchClient, EqlQuery, SearchResult } from "@utils/tdpClient";
import "./TdpSearch.scss";

/** Configuration for a search filter */
export interface TdpSearchFilter {
  key: string;
  label: string;
  options: DropdownOption[];
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
  defaultQuery?: string;
  columns: TdpSearchColumn[];
  filters?: TdpSearchFilter[];
  sortOptions?: TdpSearchSort[];
  pageSize?: number;
  searchPlaceholder?: string;
  className?: string;
  useMockData?: boolean;
  onSearch?: (query: EqlQuery, results: SearchResult[]) => void;
}

/**
 * TdpSearch Component
 *
 * A reusable search component for querying the TDP.
 *
 * @example
 * ```tsx
 * <TdpSearch
 *   baseUrl="https://api.tetrascience-dev.com"
 *   authToken={token}
 *   orgSlug="data-apps-demo"
 *   defaultQuery="SELECT * FROM samples"
 *   columns={[
 *     { key: "id", header: "ID" },
 *     { key: "name", header: "Name", sortable: true }
 *   ]}
 *   pageSize={20}
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
  sortOptions = [],
  pageSize = 10,
  searchPlaceholder = "Enter EQL query...",
  className,
  onSearch,
}: TdpSearchProps) {
  const [searchClient, setSearchClient] = useState<TdpSearchClient | null>(null);
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

  // Initialize search client
  useEffect(() => {
    if (!baseUrl || !authToken || !orgSlug) {
      return;
    }

    const client = new TdpSearchClient({
      baseUrl,
      authToken,
      orgSlug,
    });

    setSearchClient(client);
  }, [baseUrl, authToken, orgSlug]);

  // Update auth token when it changes
  useEffect(() => {
    if (searchClient && authToken) {
      searchClient.updateAuthToken(authToken);
    }
  }, [searchClient, authToken]);

  // Execute search
  const executeSearch = async (page: number = 1) => {
    if (!searchClient || !query.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const eqlQuery: EqlQuery = {
        query: query.trim(),
        filters: Object.keys(filterValues).length > 0 ? filterValues : undefined,
        size: pageSize,
        from: (page - 1) * pageSize,
        sort: sortKey ? [{ field: sortKey, order: sortDirection }] : sortOptions.length > 0 ? sortOptions : undefined,
      };

      const response = await searchClient.searchEql(eqlQuery);
      const results = response.results || [];
      const total = response.total || 0;

      setResults(results);
      setTotal(total);
      setCurrentPage(page);

      onSearch?.(eqlQuery, results);
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
