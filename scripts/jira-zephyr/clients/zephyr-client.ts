/**
 * Zephyr Scale Cloud client for Jira-issue ↔ test-case coverage links.
 *
 * Transport: like scripts/zephyr/*, this prefers the internal
 * `ts-lib-zephyr-nodejs` package (JFrog-only, lazy-loaded so the module can be
 * imported where it is not installed) and falls back to a small built-in fetch
 * transport with identical auth/timeout/error semantics. Either way the three
 * endpoints used here are called directly, because the library's own
 * `linkTestCaseToIssue` posts `issueKey` (the API requires numeric `issueId`)
 * and swallows failures — unacceptable for a script that must report outcomes.
 *
 *   GET  /issuelinks/{issueKey}/testcases         → test cases linked to a Jira issue
 *   GET  /testcases/{testCaseKey}                 → existence check + reverse links
 *   POST /testcases/{testCaseKey}/links/issues    → create a COVERAGE link ({ issueId })
 *
 * `readOnly: true` makes any non-GET call throw before it reaches the network;
 * the audit script and the apply script's dry-run mode use it as a hard guarantee.
 */
import type { ZephyrTestCase } from "../shared/types";

const DEFAULT_TIMEOUT_MS = 30_000;
const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);
const MAX_GET_ATTEMPTS = 4;

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface ZephyrTransport {
  request<T = unknown>(method: HttpMethod, path: string, body?: unknown): Promise<T>;
}

export interface ZephyrTransportOptions {
  baseUrl: string;
  apiToken: string;
  projectKey: string;
  fetchImpl?: typeof globalThis.fetch;
  /** Set to false to skip the ts-lib-zephyr-nodejs probe (tests, offline). */
  preferLibrary?: boolean;
}

/** Same message shape as ts-lib-zephyr-nodejs' ZephyrClient.request(). */
export class ZephyrHttpError extends Error {
  constructor(
    readonly method: string,
    readonly path: string,
    readonly status: number,
    readonly body: string,
  ) {
    super(`${method} ${path} → ${status}: ${body.slice(0, 300)}`);
    this.name = "ZephyrHttpError";
  }
}

export class ReadOnlyViolationError extends Error {
  constructor(method: string, path: string) {
    super(`Refusing ${method} ${path}: this Zephyr client is read-only`);
    this.name = "ReadOnlyViolationError";
  }
}

export function createFetchTransport(options: ZephyrTransportOptions): ZephyrTransport {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const baseUrl = options.baseUrl.replace(/\/+$/, "");
  return {
    async request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
      const maxAttempts = method === "GET" ? MAX_GET_ATTEMPTS : 1;
      for (let attempt = 1; ; attempt++) {
        const response = await fetchImpl(`${baseUrl}${path}`, {
          method,
          headers: { Authorization: `Bearer ${options.apiToken}`, "Content-Type": "application/json" },
          body: body === undefined ? undefined : JSON.stringify(body),
          signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
        });
        const text = await response.text();
        if (response.ok) return (text ? JSON.parse(text) : {}) as T;
        if (!RETRYABLE_STATUSES.has(response.status) || attempt >= maxAttempts) {
          throw new ZephyrHttpError(method, path, response.status, text);
        }
        await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** (attempt - 1)));
      }
    },
  };
}

interface ZephyrLibraryShape {
  ZephyrClient: new (config: { baseUrl: string; apiToken: string; projectKey: string; cycleKey: string }) => {
    request<T>(method: string, path: string, body?: unknown): Promise<T>;
  };
}

/**
 * Lazily loads the JFrog-only library; the specifier is a variable so bundlers
 * and Vitest cannot resolve it statically (same trick as scripts/zephyr/*).
 */
async function loadLibrary(): Promise<ZephyrLibraryShape | null> {
  const specifier = "ts-lib-zephyr-nodejs";
  try {
    return (await import(specifier)) as ZephyrLibraryShape;
  } catch {
    return null;
  }
}

export async function createZephyrTransport(
  options: ZephyrTransportOptions,
): Promise<{ transport: ZephyrTransport; source: "ts-lib-zephyr-nodejs" | "built-in fetch" }> {
  if (options.preferLibrary !== false) {
    const library = await loadLibrary();
    if (library) {
      const client = new library.ZephyrClient({
        baseUrl: options.baseUrl,
        apiToken: options.apiToken,
        projectKey: options.projectKey,
        cycleKey: "",
      });
      return {
        transport: {
          request: <T>(method: HttpMethod, path: string, body?: unknown) =>
            client.request<T>(method, path, body).catch((error: unknown) => {
              throw normalizeLibraryError(error, method, path);
            }),
        },
        source: "ts-lib-zephyr-nodejs",
      };
    }
  }
  return { transport: createFetchTransport(options), source: "built-in fetch" };
}

/** The library throws plain Errors ("GET /x → 404: ..."); recover the status so callers can branch on it. */
function normalizeLibraryError(error: unknown, method: string, path: string): Error {
  if (error instanceof ZephyrHttpError) return error;
  const message = error instanceof Error ? error.message : String(error);
  const match = /→ (\d{3}): ?([\s\S]*)$/.exec(message);
  return match ? new ZephyrHttpError(method, path, Number(match[1]), match[2]) : (error as Error);
}

interface LinkedTestCase {
  key: string;
  version?: number;
  self?: string;
}

export interface LinkResult {
  linkId: number | null;
  alreadyExisted: boolean;
}

export class ZephyrClient {
  constructor(
    private readonly transport: ZephyrTransport,
    private readonly options: { readOnly: boolean },
  ) {}

  get readOnly(): boolean {
    return this.options.readOnly;
  }

  private guardWrite(method: HttpMethod, path: string): void {
    if (this.options.readOnly && method !== "GET") throw new ReadOnlyViolationError(method, path);
  }

  /**
   * Test case keys currently linked to a Jira issue. A 404 means Zephyr knows
   * of no links for the issue (or the issue is unknown to it) — callers verify
   * the issue exists in Jira separately, so it is reported as "no links".
   */
  async getLinkedTestCaseKeys(issueKey: string): Promise<string[]> {
    const path = `/issuelinks/${encodeURIComponent(issueKey)}/testcases`;
    try {
      const linked = await this.transport.request<LinkedTestCase[]>("GET", path);
      return [...new Set((Array.isArray(linked) ? linked : []).map((item) => item.key).filter(Boolean))];
    } catch (error) {
      if (error instanceof ZephyrHttpError && error.status === 404) return [];
      throw error;
    }
  }

  /** Fetches a test case, or null when it does not exist. */
  async getTestCase(testCaseKey: string): Promise<ZephyrTestCase | null> {
    const path = `/testcases/${encodeURIComponent(testCaseKey)}`;
    try {
      return await this.transport.request<ZephyrTestCase>("GET", path);
    } catch (error) {
      if (error instanceof ZephyrHttpError && error.status === 404) return null;
      throw error;
    }
  }

  /**
   * Creates a COVERAGE link from a test case to a Jira issue (by numeric issue id).
   * Zephyr answers 400 "already has a COVERAGE link" for duplicates; that is
   * reported as `alreadyExisted` rather than thrown, so a re-run is idempotent.
   */
  async linkTestCaseToIssue(testCaseKey: string, jiraIssueId: string): Promise<LinkResult> {
    const path = `/testcases/${encodeURIComponent(testCaseKey)}/links/issues`;
    this.guardWrite("POST", path);
    const issueId = Number(jiraIssueId);
    if (!Number.isInteger(issueId) || issueId < 1) throw new Error(`Invalid Jira issue id "${jiraIssueId}"`);
    try {
      const created = await this.transport.request<{ id?: number }>("POST", path, { issueId });
      return { linkId: created?.id ?? null, alreadyExisted: false };
    } catch (error) {
      if (error instanceof ZephyrHttpError && error.status === 400 && /already has a .*link/i.test(error.body)) {
        return { linkId: null, alreadyExisted: true };
      }
      throw error;
    }
  }
}
