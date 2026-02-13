import { useState } from "react";
import { SearchEqlRequest } from "@tetrascience-npm/ts-connectors-sdk";
import { SearchResult } from "../TdpSearch";

export interface ServerSideSearchConfig {
  /** API endpoint to call for search. Defaults to '/api/search' */
  apiEndpoint?: string;
  /** Page size for pagination */
  pageSize: number;
}

export interface UseServerSideSearchResult {
  results: SearchResult[];
  total: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  executeSearch: (searchRequest: Omit<SearchEqlRequest, "from" | "size">, page?: number) => Promise<void>;
}

export function useServerSideSearch({
  apiEndpoint = "/api/search",
  pageSize,
}: ServerSideSearchConfig): UseServerSideSearchResult {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeSearch = async (searchRequest: Omit<SearchEqlRequest, "from" | "size">, page: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for auth
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
    } catch (err: any) {
      setError(err.message || "An error occurred while searching");
      setResults([]);
      setTotal(0);
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
