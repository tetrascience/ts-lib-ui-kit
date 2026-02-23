import { describe, it, expect } from "vitest";

import {
  getProviderInfoList,
  getProviderByName,
  getProvidersByType,
  getProviderNames,
  getProviderTypes,
} from "../providerDiscovery";

import type { ProviderConfiguration } from "../types";

const mockConfigs: ProviderConfiguration[] = [
  {
    name: "my-snowflake",
    type: "snowflake",
    iconUrl: "https://example.com/snowflake.png",
    fields: { user: "admin", password: "secret", account: "acct1" },
  },
  {
    name: "my-databricks",
    type: "databricks",
    iconUrl: "https://example.com/databricks.png",
    fields: { server_hostname: "host1", http_path: "/sql" },
  },
  {
    name: "second-snowflake",
    type: "snowflake",
    fields: { user: "user2", password: "pass2", account: "acct2" },
  },
];

describe("getProviderInfoList", () => {
  it("should extract display-friendly info without secrets", () => {
    const result = getProviderInfoList(mockConfigs);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      name: "my-snowflake",
      type: "snowflake",
      iconUrl: "https://example.com/snowflake.png",
      availableFields: ["user", "password", "account"],
    });
    expect(result[1]).toEqual({
      name: "my-databricks",
      type: "databricks",
      iconUrl: "https://example.com/databricks.png",
      availableFields: ["server_hostname", "http_path"],
    });
    // No iconUrl on the original config → should be null
    expect(result[2]).toEqual({
      name: "second-snowflake",
      type: "snowflake",
      iconUrl: null,
      availableFields: ["user", "password", "account"],
    });
  });

  it("should include field names but not secret values", () => {
    const result = getProviderInfoList(mockConfigs);

    for (const info of result) {
      expect(info).not.toHaveProperty("fields");
      expect(info.availableFields).toBeDefined();
      for (const field of info.availableFields) {
        expect(typeof field).toBe("string");
      }
    }

    // Verify actual secret values are not present anywhere in the result
    expect(JSON.stringify(result)).not.toContain("admin");
    expect(JSON.stringify(result)).not.toContain("secret");
    expect(JSON.stringify(result)).not.toContain("acct1");
    expect(JSON.stringify(result)).not.toContain("host1");
  });

  it("should return empty availableFields for provider with no fields", () => {
    const noFields: ProviderConfiguration[] = [
      { name: "empty", type: "custom", fields: {} },
    ];
    const result = getProviderInfoList(noFields);
    expect(result[0].availableFields).toEqual([]);
  });

  it("should return empty array for empty input", () => {
    expect(getProviderInfoList([])).toEqual([]);
  });
});

describe("getProviderByName", () => {
  it("should find a provider by name", () => {
    const result = getProviderByName(mockConfigs, "my-databricks");

    expect(result).toBeDefined();
    expect(result!.name).toBe("my-databricks");
    expect(result!.type).toBe("databricks");
    expect(result!.fields).toEqual({
      server_hostname: "host1",
      http_path: "/sql",
    });
  });

  it("should return undefined for non-existent name", () => {
    expect(getProviderByName(mockConfigs, "does-not-exist")).toBeUndefined();
  });

  it("should be case-sensitive", () => {
    expect(getProviderByName(mockConfigs, "My-Snowflake")).toBeUndefined();
  });

  it("should return the first match if names are duplicated", () => {
    const dupes: ProviderConfiguration[] = [
      { name: "dup", type: "snowflake", fields: { a: "1" } },
      { name: "dup", type: "databricks", fields: { b: "2" } },
    ];
    const result = getProviderByName(dupes, "dup");
    expect(result!.type).toBe("snowflake");
  });
});

describe("getProvidersByType", () => {
  it("should return all providers of a given type", () => {
    const result = getProvidersByType(mockConfigs, "snowflake");

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("my-snowflake");
    expect(result[1].name).toBe("second-snowflake");
  });

  it("should return empty array for non-existent type", () => {
    expect(getProvidersByType(mockConfigs, "athena")).toEqual([]);
  });

  it("should return single-element array when only one matches", () => {
    const result = getProvidersByType(mockConfigs, "databricks");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("my-databricks");
  });
});

describe("getProviderNames", () => {
  it("should return all provider names", () => {
    expect(getProviderNames(mockConfigs)).toEqual([
      "my-snowflake",
      "my-databricks",
      "second-snowflake",
    ]);
  });

  it("should return empty array for empty input", () => {
    expect(getProviderNames([])).toEqual([]);
  });
});

describe("getProviderTypes", () => {
  it("should return unique provider types", () => {
    const result = getProviderTypes(mockConfigs);

    expect(result).toHaveLength(2);
    expect(result).toContain("snowflake");
    expect(result).toContain("databricks");
  });

  it("should return empty array for empty input", () => {
    expect(getProviderTypes([])).toEqual([]);
  });

  it("should return single type when all providers are the same type", () => {
    const sameType: ProviderConfiguration[] = [
      { name: "a", type: "snowflake", fields: {} },
      { name: "b", type: "snowflake", fields: {} },
    ];
    expect(getProviderTypes(sameType)).toEqual(["snowflake"]);
  });
});

