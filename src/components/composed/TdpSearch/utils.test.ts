import { describe, it, expect } from "vitest";

import { buildEsBody } from "../utils";

describe("buildEsBody", () => {
  it("builds basic body with from/size", () => {
    const body = buildEsBody({ searchTerm: "test" }, 0, 10);
    expect(body.from).toBe(0);
    expect(body.size).toBe(10);
  });

  it("builds query from searchTerm", () => {
    const body = buildEsBody({ searchTerm: "experiment" }, 0, 10);
    expect(body.query).toEqual({
      simple_query_string: {
        query: "experiment",
        default_operator: "and",
      },
    });
  });

  it("omits query when searchTerm is empty", () => {
    const body = buildEsBody({ searchTerm: "" }, 0, 10);
    expect(body.query).toBeUndefined();
  });

  it("omits query when searchTerm is undefined", () => {
    const body = buildEsBody({} as any, 0, 10);
    expect(body.query).toBeUndefined();
  });

  it("builds sort with order", () => {
    const body = buildEsBody({ searchTerm: "test", sort: "createdAt", order: "desc" }, 0, 10);
    expect(body.sort).toEqual([{ createdAt: "desc" }]);
  });

  it("builds sort without order", () => {
    const body = buildEsBody({ searchTerm: "test", sort: "createdAt" }, 0, 10);
    expect(body.sort).toEqual(["createdAt"]);
  });

  it("omits sort when sort is empty string", () => {
    const body = buildEsBody({ searchTerm: "test", sort: "" }, 0, 10);
    expect(body.sort).toBeUndefined();
  });

  it("passes through additional properties", () => {
    const body = buildEsBody(
      { searchTerm: "test", expression: { g: "AND", e: [] } } as any,
      0,
      10,
    );
    expect(body.expression).toEqual({ g: "AND", e: [] });
  });

  it("handles pagination correctly", () => {
    const body = buildEsBody({ searchTerm: "test" }, 20, 10);
    expect(body.from).toBe(20);
    expect(body.size).toBe(10);
  });

  it("does not include sort or order keys in the body directly", () => {
    const body = buildEsBody({ searchTerm: "test", sort: "name", order: "asc" }, 0, 5);
    // sort and order from the request should not appear as top-level keys
    // (sort is remapped to body.sort array, order is consumed by sort)
    expect(body.order).toBeUndefined();
    expect(body.sort).toEqual([{ name: "asc" }]);
  });
});
