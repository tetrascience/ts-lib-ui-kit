import { useState } from "react";

import { AUTH_TOKEN_HEADER, ORG_SLUG_HEADER, STANDALONE_SEARCH_PATH } from "../constants";
import { buildEsBody } from "../utils";

import type { SearchResult, UseSearchConfig, UseSearchResult } from "../types";
import type { SearchEqlRequest } from "@tetrascience-npm/ts-connectors-sdk";

/**
 * TDP search hook
 *
 * Use `standalone: true` to call the TDP API directly from the browser
 * Omit `standalone` (or set it to `false`) to proxy the request through your own backend API endpoint
 */
export function useSearch(config: UseSearchConfig): UseSearchResult {
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

    const { pageSize } = config;
    const from = (page - 1) * pageSize;

    let url: string;
    let fetchInit: RequestInit;

    if (config.standalone) {
      url = `${config.baseUrl.replace(/\/$/, "")}${STANDALONE_SEARCH_PATH}`;
      fetchInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [AUTH_TOKEN_HEADER]: config.authToken,
          [ORG_SLUG_HEADER]: config.orgSlug,
        },
        body: JSON.stringify(buildEsBody(searchRequest, from, pageSize)),
      };
    } else {
      const { apiEndpoint = "/api/search", authToken, orgSlug } = config;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (authToken && orgSlug) {
        headers[AUTH_TOKEN_HEADER] = authToken;
        headers[ORG_SLUG_HEADER] = orgSlug;
      }
      url = apiEndpoint;
      fetchInit = {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ ...searchRequest, size: pageSize, from }),
      };
    }

    try {
      const response = await fetch(url, fetchInit);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        const message = config.standalone ? errorData.error?.message || errorData.error : errorData.error;
        throw new Error(message || `HTTP ${response.status}: ${response.statusText}`);
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

  return { results, total, currentPage, isLoading, error, executeSearch };
}
