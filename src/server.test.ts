import { describe, expect, it } from "vitest";

import * as server from "./server";

describe("server entry point", () => {
  it("re-exports server-only authentication and provider utilities", () => {
    expect(server.JwtTokenManager).toBeTypeOf("function");
    expect(server.jwtManager).toBeInstanceOf(server.JwtTokenManager);
    expect(server.getProviderConfigurations).toBeTypeOf("function");
    expect(server.InvalidProviderConfigurationError).toBeTypeOf("function");
    expect(server.ProviderError).toBeTypeOf("function");
    expect(server.MissingTableError).toBeTypeOf("function");
    expect(server.QueryError).toBeTypeOf("function");
    expect(server.ProviderConnectionError).toBeTypeOf("function");
    expect(server.SnowflakeProvider).toBeTypeOf("function");
    expect(server.buildSnowflakeProvider).toBeTypeOf("function");
    expect(server.DatabricksProvider).toBeTypeOf("function");
    expect(server.buildDatabricksProvider).toBeTypeOf("function");
    expect(server.AthenaProvider).toBeTypeOf("function");
    expect(server.getTdpAthenaProvider).toBeTypeOf("function");
    expect(server.buildProvider).toBeTypeOf("function");
  });
});
