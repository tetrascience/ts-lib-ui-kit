import { useState } from "react";

import type { SearchResult } from "../TdpSearch";
import type { SearchEqlRequest } from "@tetrascience-npm/ts-connectors-sdk";

export interface ServerSideSearchConfig {
  /** API endpoint to call for search. Defaults to '/api/search' */
  apiEndpoint?: string;
  /** Page size for pagination */
  pageSize: number;
  /** Optional: send as ts-auth-token / x-org-slug headers (e.g. to emulate creds in Storybook) */
  authToken?: string;
  orgSlug?: string;
}

export interface UseServerSideSearchResult {
  results: SearchResult[];
  total: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  executeSearch: (searchRequest: Omit<SearchEqlRequest, "from" | "size">, page?: number) => Promise<SearchResult[]>;
}

export function useServerSideSearch({
  apiEndpoint = "/api/search",
  pageSize,
  authToken,
  orgSlug,
}: ServerSideSearchConfig): UseServerSideSearchResult {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeSearch = async (
    searchRequest: Omit<SearchEqlRequest, "from" | "size">,
    page: number = 1,
  ): Promise<SearchResult[]> => {
    setIsLoading(true);
    setError(null);

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (authToken && orgSlug) {
      headers["ts-auth-token"] = authToken;
      headers["x-org-slug"] = orgSlug;
    }

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          ...searchRequest,
          size: pageSize,
          from: (page - 1) * pageSize,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform Elasticsearch results to flat objects
      const transformedResults: SearchResult[] = (data.hits?.hits || []).map((hit: any) => ({
        id: hit._id,
        ...hit._source,
        _score: hit._score,
      }));

      // Extract total (can be number or object with value)
      const total = typeof data.hits?.total === "number" ? data.hits.total : data.hits?.total?.value || 0;

      setResults(transformedResults);
      setTotal(total);
      setCurrentPage(page);
      return transformedResults;
    } catch (err: any) {
      setError(err.message || "An error occurred while searching");
      setResults([]);
      setTotal(0);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    results,
    total,
    currentPage,
    isLoading,
    error,
    executeSearch,
  };
}
