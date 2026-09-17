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
/**
 * The `message` deliberately carries only method, path and status: it becomes
 * `ApplyResult.detail`, which is rendered into the GitHub job summary and the
 * uploaded artifact of a PUBLIC repository. The vendor response stays on `body`
 * for local inspection and is never interpolated into the message.
 */
export class ZephyrHttpError extends Error {
  constructor(
    readonly method: string,
    readonly path: string,
    readonly status: number,
    readonly body: string,
  ) {
    super(`${method} ${path} → ${status}`);
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
        // Prefer the server's own Retry-After over blind exponential backoff (429s).
        const retryAfter = Number(response.headers.get("retry-after"));
        const waitMs = retryAfter > 0 ? retryAfter * 1000 : 500 * 2 ** (attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
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

/**
 * The library throws plain Errors ("GET /x → 404: ..."); recover the status so
 * callers can branch on it.
 *
 * NOTE: this regex is coupled to `ts-lib-zephyr-nodejs`'s message shape, and is the
 * only way the library path recovers a status code. If that wording ever changes, a
 * 404 stops becoming `[]` / `null` and starts throwing instead. CI never installs the
 * JFrog package, so the fetch transport below is what is actually exercised there and
 * the divergence would first appear on a developer's machine. Keep them in step.
 */
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

/** Both transports turn an empty 200 body into `{}`. */
function isEmptyPayload(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  return typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0;
}

function isLinkedTestCase(value: unknown): value is LinkedTestCase {
  if (typeof value !== "object" || value === null) return false;
  const key = (value as { key?: unknown }).key;
  return typeof key === "string" && key.length > 0;
}

export interface LinkResult {
  linkId: number | null;
  alreadyExisted: boolean;
}

/**
 * Wraps a transport so a read-only client cannot issue a non-GET request, whatever
 * the caller does. Enforcing it here rather than in each write method means a write
 * method added later is covered without anyone remembering to guard it.
 */
function readOnlyTransport(transport: ZephyrTransport): ZephyrTransport {
  return {
    // `async` so a refusal is a rejected promise, never a synchronous throw: every
    // caller treats `request` as promise-returning.
    async request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
      if (method !== "GET") throw new ReadOnlyViolationError(method, path);
      return transport.request<T>(method, path, body);
    },
  };
}

export class ZephyrClient {
  private readonly transport: ZephyrTransport;

  constructor(
    transport: ZephyrTransport,
    private readonly options: { readOnly: boolean },
  ) {
    this.transport = options.readOnly ? readOnlyTransport(transport) : transport;
  }

  get readOnly(): boolean {
    return this.options.readOnly;
  }

  /**
   * Kept alongside the transport wrapper: it fails before a write method does any
   * argument work, so the error names the refused call rather than an invalid id.
   */
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
    let linked: unknown;
    try {
      linked = await this.transport.request<unknown>("GET", path);
    } catch (error) {
      if (error instanceof ZephyrHttpError && error.status === 404) return [];
      throw error;
    }
    // Anything that is not an array of `{ key }` items is a contract change and
    // must not be mistaken for "no links" — that would make every expected ID
    // look missing and, on apply, invite duplicate COVERAGE links.
    if (isEmptyPayload(linked)) return [];
    if (!Array.isArray(linked) || !linked.every(isLinkedTestCase)) {
      throw new Error(`GET ${path} returned an unexpected payload; expected an array of { key } test case links`);
    }
    return [...new Set(linked.map((item) => item.key))];
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
      // Matching vendor prose is a backstop only: `writer.ts` already filters out ids
      // present in the live link list, so a reworded message degrades to an `error`
      // outcome on a genuine duplicate, never to a wrong write.
      if (error instanceof ZephyrHttpError && error.status === 400 && /already has a .*link/i.test(error.body)) {
        return { linkId: null, alreadyExisted: true };
      }
      throw error;
    }
  }
}
