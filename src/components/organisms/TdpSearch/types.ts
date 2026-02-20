import type { DropdownOption } from "@atoms/Dropdown";
import type { SearchEqlRequest } from "@tetrascience-npm/ts-connectors-sdk";

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
type TdpSearchProps = CommonTdpSearchProps & (StandaloneSearchConfig | ServerSideSearchConfig);

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
}
