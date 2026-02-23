import Search from "@assets/icon/Search";
import { Button } from "@atoms/Button";
import { Dropdown } from "@atoms/Dropdown";
import { ErrorAlert } from "@atoms/ErrorAlert";
import { Input } from "@atoms/Input";
import { Table } from "@molecules/Table";
import React, { useState } from "react";

import { useServerSideSearch } from "./hooks/useServerSideSearch";
import { useStandaloneSearch } from "./hooks/useStandaloneSearch";
import { useTdpCredentials } from "./hooks/useTdpCredentials";

import type { TdpSearchProps } from "./types";
import type { SearchEqlRequest } from "@tetrascience-npm/ts-connectors-sdk";

import "./TdpSearch.scss";

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
  const isStandalone = !!props.standalone;

  const { authToken, orgSlug } = useTdpCredentials(props.authToken, props.orgSlug);

  const searchConfig = {
    baseUrl: isStandalone ? props.baseUrl : "",
    apiEndpoint: isStandalone ? "/api/search" : (props.apiEndpoint ?? "/api/search"),
    authToken: authToken ?? "",
    orgSlug: orgSlug ?? "",
    pageSize,
  };

  const standaloneResults = useStandaloneSearch(searchConfig);
  const serverSideResults = useServerSideSearch(searchConfig);

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
