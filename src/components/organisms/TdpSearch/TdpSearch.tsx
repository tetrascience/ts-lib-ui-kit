import Search from "@assets/icon/Search";
import { ErrorAlert } from "@atoms/ErrorAlert";
import React, { useState } from "react";

import { DefaultFilters } from "./components/DefaultFilters";
import { DefaultResults } from "./components/DefaultResults";
import { DefaultSearchBar } from "./components/DefaultSearchBar";
import { useServerSideSearch } from "./hooks/useServerSideSearch";
import { useStandaloneSearch } from "./hooks/useStandaloneSearch";
import { useTdpCredentials } from "./hooks/useTdpCredentials";

import type { TdpSearchProps, SearchEqlExpression } from "./types";
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
  renderSearchBar,
  renderFilters,
  renderResults,
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

    const filterExpressions = Object.entries(filterValues)
      .filter(([, value]) => value !== "")
      .map(([key, value]) => ({ field: key, operator: "eq", value }));

    let expression: SearchEqlExpression | undefined = advancedSearchParams?.expression as
      | SearchEqlExpression
      | undefined;

    if (filterExpressions.length > 0) {
      expression = {
        g: "AND",
        e: expression ? [...filterExpressions, expression] : filterExpressions,
      };
    }

    const searchRequest: Omit<SearchEqlRequest, "from" | "size"> = {
      searchTerm: query.trim(),
      sort: effectiveSortKey ?? undefined,
      order: effectiveOrder,
      ...advancedSearchParams,
      ...(expression !== undefined && { expression }),
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

  const emptyState = (
    <div className="tdp-search__empty-state">
      <div className="tdp-search__empty-state-icon">
        <Search />
      </div>
      <div className="tdp-search__empty-state-text">No results found. Try adjusting your search query or filters.</div>
    </div>
  );

  const searchBarProps = { query, setQuery, onSearch: handleSearch, isLoading, placeholder: searchPlaceholder };
  const filtersProps = { filters, filterValues, onFilterChange: handleFilterChange };
  const resultsProps = {
    results,
    total,
    currentPage,
    pageSize,
    columns,
    onPageChange: handlePageChange,
    sortKey,
    sortDirection,
    onSort: handleSort,
  };

  return (
    <div className={`tdp-search ${className || ""}`}>
      {renderSearchBar ? renderSearchBar(searchBarProps) : <DefaultSearchBar {...searchBarProps} />}

      {filters.length > 0 && (renderFilters ? renderFilters(filtersProps) : <DefaultFilters {...filtersProps} />)}

      {error && (
        <>
          <ErrorAlert error={error} onClose={() => {}} />
          {emptyState}
        </>
      )}

      {isLoading && <div className="tdp-search__loading-overlay">Loading results...</div>}

      {!isLoading && !hasSearched && (
        <div className="tdp-search__empty-state">
          <div className="tdp-search__empty-state-icon">
            <Search />
          </div>
          <div className="tdp-search__empty-state-text">Enter a search query and click Search to get started.</div>
        </div>
      )}

      {!isLoading &&
        !error &&
        hasSearched &&
        results.length > 0 &&
        (renderResults ? renderResults(resultsProps) : <DefaultResults {...resultsProps} />)}

      {!isLoading && !error && hasSearched && results.length === 0 && emptyState}
    </div>
  );
};

export default TdpSearch;
