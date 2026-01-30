import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Input } from "@atoms/Input";
import { Button } from "@atoms/Button";
import { Dropdown, DropdownOption } from "@atoms/Dropdown";
import { Table } from "@molecules/Table";
import { ErrorAlert } from "@atoms/ErrorAlert";
import Search from "@assets/icon/Search";
import { TdpSearchClient, EqlQuery, SearchResult } from "@utils/tdpClient";

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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const SearchBar = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  flex-wrap: wrap;
`;

const SearchInputWrapper = styled.div`
  flex: 1;
  min-width: 300px;
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 200px;
`;

const FilterLabel = styled.label`
  font-family: "Inter", sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--grey-600);
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--grey-200);
`;

const ResultsCount = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--grey-700);
`;

const LoadingOverlay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: var(--grey-500);
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
  background-color: var(--grey-50);
  border-radius: 8px;
  border: 1px dashed var(--grey-300);
`;

const EmptyStateIcon = styled.div`
  width: 48px;
  height: 48px;
  color: var(--grey-400);
`;

const EmptyStateText = styled.div`
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: var(--grey-600);
  text-align: center;
`;


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
        sort: sortKey
          ? [{ field: sortKey, order: sortDirection }]
          : sortOptions.length > 0
            ? sortOptions
            : undefined,
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
      <SearchBar>
        <SearchInputWrapper>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder}
            iconLeft={<Search />}
            size="small"
          />
        </SearchInputWrapper>
        <Button
          variant="primary"
          onClick={handleSearch}
          disabled={!query.trim() || isLoading}
        >
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </SearchBar>
    )
  }

  const FiltersComponent = () => {
    return (
      <FiltersRow>
        {filters.map((filter) => (
          <FilterWrapper key={filter.key}>
            <FilterLabel>{filter.label}</FilterLabel>
            <Dropdown
              options={filter.options}
              value={filterValues[filter.key] || ""}
              onChange={(value) => handleFilterChange(filter.key, value)}
            />
          </FilterWrapper>
        ))}
      </FiltersRow>
    )
  }

  const NoResultsComponent = () => {
    return (
      <EmptyState>
        <EmptyStateIcon>
          <Search />
        </EmptyStateIcon>
        <EmptyStateText>
          No results found. Try adjusting your search query or filters.
        </EmptyStateText>
      </EmptyState>
    )
  }

  const PlaceholderComponent = () => {
    return (
      <EmptyState>
        <EmptyStateIcon>
          <Search />
        </EmptyStateIcon>
        <EmptyStateText>
          Enter a search query and click Search to get started.
        </EmptyStateText>
      </EmptyState>)
  }

  return (
    <Container className={className}>
      <SearchBarComponent />

      {filters.length > 0 && (
        <FiltersComponent />
      )}

      {error && (
        <>
          <ErrorAlert error={error} onClose={() => setError(null)} />
          <NoResultsComponent />
        </>
      )}

      {isLoading && (
        <LoadingOverlay>Loading results...</LoadingOverlay>
      )}

      {!isLoading && !hasSearched && (
        <PlaceholderComponent />
      )}

      {!isLoading && !error && hasSearched && results.length > 0 && (
        <>
          <ResultsHeader>
            <ResultsCount>
              Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, total)} of {total} results
            </ResultsCount>
          </ResultsHeader>
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

      {!isLoading && !error && hasSearched && results.length === 0 && (
        <NoResultsComponent />
      )}
    </Container>
  );
}

export default TdpSearch;
