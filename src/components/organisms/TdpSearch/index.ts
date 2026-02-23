export { TdpSearch, default } from "./TdpSearch";
export { useServerSideSearch } from "./hooks/useServerSideSearch";
export { useStandaloneSearch } from "./hooks/useStandaloneSearch";

export type { TdpSearchProps, TdpSearchColumn, TdpSearchFilter, TdpSearchSort, SearchResult } from "./types";
export type {
  TdpSearchBarRenderProps,
  TdpFiltersRenderProps,
  TdpResultsRenderProps,
} from "./types";
export type {
  ServerSideSearchConfig,
  UseServerSideSearchResult,
} from "./hooks/useServerSideSearch";
export type {
  StandaloneSearchConfig,
  UseStandaloneSearchResult,
} from "./hooks/useStandaloneSearch";
