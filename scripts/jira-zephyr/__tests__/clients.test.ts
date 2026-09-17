import { describe, expect, it, vi } from "vitest";

import { resolveProjectKey, jiraEnv, zephyrEnv } from "../clients/env";
import { JiraAuthError, JiraClient, JiraHttpError, jqlString } from "../clients/jira-client";
import {
  createZephyrTransport,
  ReadOnlyViolationError,
  ZephyrClient,
  ZephyrHttpError,
  type ZephyrTransport,
} from "../clients/zephyr-client";

type FetchCall = { url: string; init: RequestInit };

function fakeFetch(
  responder: (call: FetchCall, index: number) => { status: number; body?: unknown; headers?: Record<string, string> },
) {
  const calls: FetchCall[] = [];
  const fetchImpl = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const call = { url: String(input), init: init ?? {} };
    calls.push(call);
    const response = responder(call, calls.length - 1);
    const text =
      response.body === undefined
        ? ""
        : typeof response.body === "string"
          ? response.body
          : JSON.stringify(response.body);
    return new Response(text, { status: response.status, headers: response.headers });
  });
  return { fetchImpl: fetchImpl as unknown as typeof globalThis.fetch, calls };
}

describe("env", () => {
  it("reads credentials with fallbacks and never invents defaults for secrets", () => {
    expect(() => jiraEnv({})).toThrow(/JIRA_EMAIL or ATLASSIAN_EMAIL/);
    expect(jiraEnv({ JIRA_EMAIL: "a@b.c", JIRA_API_TOKEN: "t", JIRA_BASE_URL: "https://x.atlassian.net/" })).toEqual({
      baseUrl: "https://x.atlassian.net",
      email: "a@b.c",
      apiToken: "t",
    });
    expect(() => zephyrEnv({})).toThrow(/ZEPHYR_TOKEN or ZEPHYR_API_TOKEN/);
    expect(zephyrEnv({ ZEPHYR_API_TOKEN: "z" })).toMatchObject({
      apiToken: "z",
      projectKey: "SW",
      baseUrl: "https://api.zephyrscale.smartbear.com/v2",
    });
    expect(resolveProjectKey({ ZEPHYR_PROJECT_KEY: "QE" })).toBe("QE");
    expect(resolveProjectKey({ JIRA_PROJECT_KEY: "qe" })).toBe("QE");
    expect(zephyrEnv({ ZEPHYR_API_TOKEN: "z", JIRA_PROJECT_KEY: "qe" }).projectKey).toBe("QE");
    expect(() => resolveProjectKey({ JIRA_PROJECT_KEY: "QE", ZEPHYR_PROJECT_KEY: "SW" })).toThrow(/disagree/);
  });
});

describe("JiraClient", () => {
  const options = { baseUrl: "https://example.atlassian.net/", email: "me@example.com", apiToken: "secret" };

  it("pages through search/jql with nextPageToken and sends Basic auth", async () => {
    const { fetchImpl, calls } = fakeFetch((_call, index) => ({
      status: 200,
      body:
        index === 0
          ? { issues: [{ id: "1", key: "SW-1", fields: {} }], nextPageToken: "p2" } // no isLast: must keep paging
          : { issues: [{ id: "2", key: "SW-2", fields: {} }], isLast: true },
    }));
    const client = new JiraClient({ ...options, fetchImpl });

    const issues = await client.searchAll("project = SW", ["summary"]);

    expect(issues.map((issue) => issue.key)).toEqual(["SW-1", "SW-2"]);
    expect(calls[0].url).toBe("https://example.atlassian.net/rest/api/3/search/jql");
    expect(calls[0].init.method).toBe("POST");
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe(
      `Basic ${Buffer.from("me@example.com:secret").toString("base64")}`,
    );
    expect(JSON.parse(String(calls[0].init.body))).toEqual({
      jql: "project = SW",
      fields: ["summary"],
      maxResults: 100,
    });
    expect(JSON.parse(String(calls[1].init.body))).toMatchObject({ nextPageToken: "p2" });
  });

  it("stops paging on a repeated token so a misbehaving server cannot loop it forever", async () => {
    const { fetchImpl, calls } = fakeFetch(() => ({
      status: 200,
      body: { issues: [{ id: "1", key: "SW-1", fields: {} }], nextPageToken: "same", isLast: false },
    }));
    const client = new JiraClient({ ...options, fetchImpl });

    const issues = await client.searchAll("project = SW");

    expect(calls).toHaveLength(2);
    expect(issues).toHaveLength(2);
  });

  it("verifies credentials up front and unmasks Jira's anonymous downgrade", async () => {
    const accepted = new JiraClient({
      ...options,
      fetchImpl: fakeFetch(() => ({ status: 200, body: { accountType: "atlassian", active: true } })).fetchImpl,
    });
    await expect(accepted.verifyCredentials()).resolves.toEqual({ accountType: "atlassian" });

    const rejected = new JiraClient({ ...options, fetchImpl: fakeFetch(() => ({ status: 401, body: {} })).fetchImpl });
    await expect(rejected.verifyCredentials()).rejects.toThrow(JiraAuthError);

    const downgraded = new JiraClient({
      ...options,
      fetchImpl: fakeFetch(() => ({
        status: 404,
        body: {},
        headers: { "x-seraph-loginreason": "AUTHENTICATED_FAILED" },
      })).fetchImpl,
    });
    await expect(downgraded.getIssue("SW-2301")).rejects.toThrow(/rejected the credentials/);
  });

  it("returns null for a missing issue and throws a typed error otherwise", async () => {
    const { fetchImpl } = fakeFetch((call) => ({
      status: call.url.includes("SW-404") ? 404 : 500,
      body: { errorMessages: ["nope"] },
    }));
    const client = new JiraClient({ ...options, fetchImpl });
    expect(await client.getIssue("SW-404")).toBeNull();
    await expect(client.getIssue("SW-500")).rejects.toBeInstanceOf(JiraHttpError);
  });

  it("retries rate-limited requests using Retry-After", async () => {
    const sleeps: number[] = [];
    const { fetchImpl } = fakeFetch((_call, index) =>
      index === 0 ? { status: 429, headers: { "retry-after": "2" } } : { status: 200, body: [{ id: "1", name: "v1" }] },
    );
    const client = new JiraClient({ ...options, fetchImpl, sleep: async (ms) => void sleeps.push(ms) });
    expect(await client.getProjectVersions("SW")).toEqual([{ id: "1", name: "v1" }]);
    expect(sleeps).toEqual([2000]);
  });

  it("escapes JQL string literals", () => {
    expect(jqlString('a"b\\c')).toBe('"a\\"b\\\\c"');
  });
});

describe("ZephyrClient", () => {
  const transportOptions = {
    baseUrl: "https://zephyr.example/v2",
    apiToken: "tok",
    projectKey: "SW",
    preferLibrary: false as const,
  };

  it("uses the built-in fetch transport when the internal library is not requested", async () => {
    const { transport, source } = await createZephyrTransport(transportOptions);
    expect(source).toBe("built-in fetch");
    expect(typeof transport.request).toBe("function");
  });

  it("lists linked test case keys, treating 404 as no links", async () => {
    const { fetchImpl, calls } = fakeFetch((call) =>
      call.url.endsWith("/issuelinks/SW-2540/testcases")
        ? {
            status: 200,
            body: [
              { key: "SW-T1", version: 1 },
              { key: "SW-T2", version: 3 },
              { key: "SW-T1", version: 2 },
            ],
          }
        : { status: 404, body: { message: "not found" } },
    );
    const { transport } = await createZephyrTransport({ ...transportOptions, fetchImpl });
    const client = new ZephyrClient(transport, { readOnly: true });

    expect(await client.getLinkedTestCaseKeys("SW-2540")).toEqual(["SW-T1", "SW-T2"]);
    expect(await client.getLinkedTestCaseKeys("SW-1")).toEqual([]);
    expect(await client.getTestCase("SW-T404")).toBeNull();
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe("Bearer tok");
  });

  it("treats an empty payload as no links but rejects unexpected shapes", async () => {
    const { fetchImpl } = fakeFetch((call) => {
      if (call.url.endsWith("/issuelinks/SW-1/testcases")) return { status: 200, body: {} };
      if (call.url.endsWith("/issuelinks/SW-2/testcases")) return { status: 200, body: { values: [{ key: "SW-T1" }] } };
      return { status: 200, body: [{ id: 7 }] };
    });
    const { transport } = await createZephyrTransport({ ...transportOptions, fetchImpl });
    const client = new ZephyrClient(transport, { readOnly: true });

    expect(await client.getLinkedTestCaseKeys("SW-1")).toEqual([]);
    await expect(client.getLinkedTestCaseKeys("SW-2")).rejects.toThrow(/unexpected payload/);
    await expect(client.getLinkedTestCaseKeys("SW-3")).rejects.toThrow(/unexpected payload/);
  });

  it("keeps the vendor response body out of the error message (public job summaries)", async () => {
    const secret = "internal detail that must not reach a public summary";
    const { fetchImpl } = fakeFetch(() => ({ status: 500, body: secret }));
    const { transport } = await createZephyrTransport({ ...transportOptions, fetchImpl });
    const client = new ZephyrClient(transport, { readOnly: true });

    const error = await client.getTestCase("SW-T1").catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ZephyrHttpError);
    expect((error as Error).message).toBe("GET /testcases/SW-T1 → 500");
    expect((error as Error).message).not.toContain(secret);
    expect((error as ZephyrHttpError).body).toContain(secret);
  });

  it("waits the server's Retry-After before retrying a 429", async () => {
    let calls = 0;
    const { fetchImpl } = fakeFetch(() => {
      calls += 1;
      return calls === 1
        ? { status: 429, body: "slow down", headers: { "retry-after": "0" } }
        : { status: 200, body: { key: "SW-T1", name: "n" } };
    });
    const { transport } = await createZephyrTransport({ ...transportOptions, fetchImpl });
    const client = new ZephyrClient(transport, { readOnly: true });

    await expect(client.getTestCase("SW-T1")).resolves.toMatchObject({ key: "SW-T1" });
    expect(calls).toBe(2);
  });

  it("refuses a non-GET at the transport, so a future write method is covered too", async () => {
    const spy = vi.fn(async () => ({}));
    const inner: ZephyrTransport = { request: <T>() => spy() as Promise<T> };
    const client = new ZephyrClient(inner, { readOnly: true });

    // Reaches the transport directly, bypassing every per-method guard.
    const transport = (client as unknown as { transport: { request: (m: string, p: string) => Promise<unknown> } })
      .transport;
    await expect(transport.request("POST", "/anything")).rejects.toThrow(ReadOnlyViolationError);
    await expect(transport.request("GET", "/testcases/SW-T1")).resolves.toEqual({});
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("creates COVERAGE links with a numeric issueId and recognises duplicates", async () => {
    const { fetchImpl, calls } = fakeFetch((call) =>
      String(call.init.body).includes('"issueId":1001')
        ? { status: 201, body: { id: 55 } }
        : { status: 400, body: { errorCode: 400, message: "Issue 1002 already has a COVERAGE link to the test case" } },
    );
    const { transport } = await createZephyrTransport({ ...transportOptions, fetchImpl });
    const client = new ZephyrClient(transport, { readOnly: false });

    expect(await client.linkTestCaseToIssue("SW-T1", "1001")).toEqual({ linkId: 55, alreadyExisted: false });
    expect(calls[0].url).toBe("https://zephyr.example/v2/testcases/SW-T1/links/issues");
    expect(JSON.parse(String(calls[0].init.body))).toEqual({ issueId: 1001 });
    expect(await client.linkTestCaseToIssue("SW-T1", "1002")).toEqual({ linkId: null, alreadyExisted: true });
    await expect(client.linkTestCaseToIssue("SW-T1", "abc")).rejects.toThrow(/Invalid Jira issue id/);
  });

  it("surfaces other failures as typed HTTP errors", async () => {
    const { fetchImpl } = fakeFetch(() => ({ status: 401, body: { message: "bad token" } }));
    const { transport } = await createZephyrTransport({ ...transportOptions, fetchImpl });
    const client = new ZephyrClient(transport, { readOnly: false });
    await expect(client.linkTestCaseToIssue("SW-T1", "1")).rejects.toBeInstanceOf(ZephyrHttpError);
  });

  it("blocks every write through a read-only client before any network call", async () => {
    const { fetchImpl, calls } = fakeFetch(() => ({ status: 201, body: {} }));
    const { transport } = await createZephyrTransport({ ...transportOptions, fetchImpl });
    const client = new ZephyrClient(transport, { readOnly: true });
    await expect(client.linkTestCaseToIssue("SW-T1", "1")).rejects.toBeInstanceOf(ReadOnlyViolationError);
    expect(calls).toEqual([]);
  });
});
