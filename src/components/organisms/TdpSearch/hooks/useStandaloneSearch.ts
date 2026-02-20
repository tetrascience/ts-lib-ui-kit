import { useState } from "react";

import type { SearchResult } from "../types";
import type { SearchEqlRequest } from "@tetrascience-npm/ts-connectors-sdk";

export interface StandaloneSearchConfig {
  /** TDP API base URL (e.g. https://api.tetrascience.com) – called directly from the browser */
  baseUrl: string;
  /** Authentication token (sent in ts-auth-token header) */
  authToken: string;
  /** Organization slug (sent in x-org-slug header) */
  orgSlug: string;
  /** Page size for pagination */
  pageSize: number;
}

export interface UseStandaloneSearchResult {
  results: SearchResult[];
  total: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  executeSearch: (searchRequest: Omit<SearchEqlRequest, "from" | "size">, page?: number) => Promise<SearchResult[]>;
}

const SEARCH_PATH = "/v1/datalake/searchEql";

/** Build Elasticsearch-style body from SearchEqlRequest (TDP API does not accept searchTerm key). */
function buildEsBody(
  searchRequest: Omit<SearchEqlRequest, "from" | "size">,
  from: number,
  size: number,
): Record<string, unknown> {
  const { searchTerm, sort, order, ...rest } = searchRequest;
  const body: Record<string, unknown> = { from, size };
  if (searchTerm !== undefined && searchTerm !== "") {
    body.query = {
      simple_query_string: {
        query: searchTerm,
        default_operator: "and",
      },
    };
  }
  if (sort !== undefined && sort !== "") {
    body.sort = order ? [{ [sort]: order }] : [sort];
  }
  Object.entries(rest).forEach(([k, v]) => {
    if (v !== undefined) body[k] = v;
  });
  return body;
}

/**
 * Standalone TDP search: calls the TDP API directly from the browser (baseUrl + /v1/datalake/searchEql)
 * with auth in headers. No backend required.
 */
export function useStandaloneSearch({
  baseUrl,
  authToken,
  orgSlug,
  pageSize,
}: StandaloneSearchConfig): UseStandaloneSearchResult {
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

    const url = `${baseUrl.replace(/\/$/, "")}${SEARCH_PATH}`;
    const body = buildEsBody(searchRequest, (page - 1) * pageSize, pageSize);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ts-auth-token": authToken,
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(
          errorData.error?.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      const data = await response.json();

      const transformedResults: SearchResult[] = (data.hits?.hits || []).map((hit: any) => ({
        id: hit._id,
        ...hit._source,
        _score: hit._score,
      }));

      const totalHits = typeof data.hits?.total === "number" ? data.hits.total : data.hits?.total?.value || 0;

      setResults(transformedResults);
      setTotal(totalHits);
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
