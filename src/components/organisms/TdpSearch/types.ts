import type { DropdownOption } from "@atoms/Dropdown";
import type { SearchEqlRequest } from "@tetrascience-npm/ts-connectors-sdk";
import type React from "react";

/** Transformed search result (flattened from Elasticsearch hit format) */
interface SearchResult {
  id: string;
  _score?: number | null;
  [key: string]: any;
}

/** Configuration for a search filter */
interface TdpSearchFilter {
  key: string;
  label: string;
  options: DropdownOption[];
}

/** Search expression for complex queries (matches SDK SearchEqlExpression) */
interface SearchEqlExpression {
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
interface TdpSearchColumn {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: SearchResult, index: number) => React.ReactNode;
}

/** Sort configuration */
interface TdpSearchSort {
  field: string;
  order: "asc" | "desc";
}

/** Props passed to the renderSearchBar render prop */
interface TdpSearchBarRenderProps {
  query: string;
  setQuery: (query: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  placeholder: string;
}

/** Props passed to the renderFilters render prop */
interface TdpFiltersRenderProps {
  filters: TdpSearchFilter[];
  filterValues: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
}

/** Props passed to the renderResults render prop */
interface TdpResultsRenderProps {
  results: SearchResult[];
  total: number;
  currentPage: number;
  pageSize: number;
  columns: TdpSearchColumn[];
  onPageChange: (page: number) => void;
  sortKey: string | null;
  sortDirection: "asc" | "desc";
  onSort: (key: string, direction: "asc" | "desc") => void;
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

  // Render props — override the primary UI slots; all are optional and fall back to built-in defaults
  /** Replace the entire search bar (input + button) */
  renderSearchBar?: (props: TdpSearchBarRenderProps) => React.ReactNode;
  /** Replace the filters row */
  renderFilters?: (props: TdpFiltersRenderProps) => React.ReactNode;
  /** Replace the results table (and pagination) */
  renderResults?: (props: TdpResultsRenderProps) => React.ReactNode;
}

/**
 * TdpSearch component props with conditional types (standalone or server-side).
 */
type TdpSearchProps = CommonTdpSearchProps & (StandaloneSearchConfig | ServerSideSearchConfig);

type UseSearchConfig = { pageSize: number } & (StandaloneSearchConfig | ServerSideSearchConfig);

interface UseSearchResult {
  results: SearchResult[];
  total: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  executeSearch: (searchRequest: Omit<SearchEqlRequest, "from" | "size">, page?: number) => Promise<SearchResult[]>;
}

export type {
  StandaloneSearchConfig,
  ServerSideSearchConfig,
  CommonTdpSearchProps,
  TdpSearchFilter,
  TdpSearchColumn,
  TdpSearchSort,
  SearchResult,
  SearchEqlExpression,
  TdpSearchProps,
  TdpSearchBarRenderProps,
  TdpFiltersRenderProps,
  TdpResultsRenderProps,
  UseSearchConfig,
  UseSearchResult,
}
