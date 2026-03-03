import type { SearchEqlRequest } from "@tetrascience-npm/ts-connectors-sdk";

/** Build Elasticsearch-style body from SearchEqlRequest (TDP API does not accept searchTerm key). */
export const buildEsBody = (
  searchRequest: Omit<SearchEqlRequest, "from" | "size">,
  from: number,
  size: number,
): Record<string, unknown> => {
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
};
