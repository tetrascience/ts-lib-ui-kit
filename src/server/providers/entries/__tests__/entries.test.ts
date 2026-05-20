import { describe, expect, it } from "vitest";

import * as athena from "../athena";
import * as databricks from "../databricks";
import * as snowflake from "../snowflake";

describe("provider entry points", () => {
  it("re-exports each provider with shared exceptions", () => {
    expect(athena.AthenaProvider).toBeTypeOf("function");
    expect(athena.getTdpAthenaProvider).toBeTypeOf("function");
    expect(athena.ProviderError).toBeTypeOf("function");
    expect(athena.MissingTableError).toBeTypeOf("function");
    expect(athena.QueryError).toBeTypeOf("function");
    expect(athena.ProviderConnectionError).toBeTypeOf("function");
    expect(athena.InvalidProviderConfigurationError).toBeTypeOf("function");

    expect(databricks.DatabricksProvider).toBeTypeOf("function");
    expect(databricks.buildDatabricksProvider).toBeTypeOf("function");
    expect(databricks.ProviderError).toBe(athena.ProviderError);
    expect(databricks.MissingTableError).toBe(athena.MissingTableError);
    expect(databricks.QueryError).toBe(athena.QueryError);
    expect(databricks.ProviderConnectionError).toBe(athena.ProviderConnectionError);
    expect(databricks.InvalidProviderConfigurationError).toBe(
      athena.InvalidProviderConfigurationError,
    );

    expect(snowflake.SnowflakeProvider).toBeTypeOf("function");
    expect(snowflake.buildSnowflakeProvider).toBeTypeOf("function");
    expect(snowflake.ProviderError).toBe(athena.ProviderError);
    expect(snowflake.MissingTableError).toBe(athena.MissingTableError);
    expect(snowflake.QueryError).toBe(athena.QueryError);
    expect(snowflake.ProviderConnectionError).toBe(athena.ProviderConnectionError);
    expect(snowflake.InvalidProviderConfigurationError).toBe(
      athena.InvalidProviderConfigurationError,
    );
  });
});
