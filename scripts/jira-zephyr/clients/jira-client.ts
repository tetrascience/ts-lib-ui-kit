/**
 * Minimal Jira Cloud REST v3 client — the repo had none, so this is the smallest
 * surface the audit and apply scripts need:
 *
 *   - POST /rest/api/3/search/jql          (paginated JQL; the old /search is deprecated)
 *   - GET  /rest/api/3/issue/{key}
 *   - GET  /rest/api/3/project/{key}/versions
 *
 * Read-only by construction: there is no method that writes to Jira. Auth is
 * Basic (email + API token), the documented mechanism for Jira Cloud scripts.
 */
import { JIRA_ISSUE_FIELDS, type JiraIssue, type JiraVersion } from "../shared/types";

const DEFAULT_TIMEOUT_MS = 30_000;
const PAGE_SIZE = 100;
const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);
const MAX_ATTEMPTS = 4;

export interface JiraClientOptions {
  baseUrl: string;
  email: string;
  apiToken: string;
  fetchImpl?: typeof globalThis.fetch;
  /** Injected for tests; defaults to setTimeout-based backoff. */
  sleep?: (ms: number) => Promise<void>;
}

interface SearchPage {
  issues?: JiraIssue[];
  nextPageToken?: string;
  isLast?: boolean;
}

export class JiraHttpError extends Error {
  constructor(
    readonly method: string,
    readonly path: string,
    readonly status: number,
    body: string,
  ) {
    super(`${method} ${path} → ${status}: ${body.slice(0, 300)}`);
    this.name = "JiraHttpError";
  }
}

/**
 * Jira rejected the credentials — or, Jira Cloud's quirk, silently downgraded the
 * call to an anonymous request, which makes every issue look like a 404.
 */
export class JiraAuthError extends Error {
  constructor(detail: string) {
    super(
      `Jira rejected the credentials (${detail}). Check JIRA_EMAIL and JIRA_API_TOKEN: the token must be a classic ` +
        "(unscoped) Atlassian API token belonging to that exact account. API tokens *with scopes* only work against " +
        "the api.atlassian.com gateway — create an unscoped token, or set JIRA_BASE_URL to " +
        "https://api.atlassian.com/ex/jira/<cloudId>.",
    );
    this.name = "JiraAuthError";
  }
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export class JiraClient {
  private readonly fetchImpl: typeof globalThis.fetch;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly authorization: string;
  readonly baseUrl: string;

  constructor(options: JiraClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch;
    this.sleep = options.sleep ?? defaultSleep;
    const credentials = Buffer.from(`${options.email}:${options.apiToken}`).toString("base64");
    this.authorization = `Basic ${credentials}`;
  }

  private async request<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
    for (let attempt = 1; ; attempt++) {
      const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        method,
        headers: {
          Authorization: this.authorization,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      });
      // Jira Cloud answers rejected Basic auth by treating the request as anonymous
      // instead of returning 401; this header is the only trace (issues then 404).
      const loginReason = response.headers.get("x-seraph-loginreason");
      if (loginReason && /FAILED|DENIED/i.test(loginReason)) {
        throw new JiraAuthError(`X-Seraph-LoginReason: ${loginReason} on ${method} ${path}`);
      }
      if (response.ok) {
        const text = await response.text();
        return (text ? JSON.parse(text) : {}) as T;
      }
      const text = await response.text();
      if (!RETRYABLE_STATUSES.has(response.status) || attempt >= MAX_ATTEMPTS) {
        throw new JiraHttpError(method, path, response.status, text);
      }
      const retryAfter = Number(response.headers.get("retry-after"));
      await this.sleep(retryAfter > 0 ? retryAfter * 1000 : 500 * 2 ** (attempt - 1));
    }
  }

  /**
   * Fails fast on bad credentials. `/myself` is the one endpoint Jira Cloud never
   * serves anonymously, so it answers 401 where an issue lookup would answer 404.
   */
  async verifyCredentials(): Promise<{ accountType?: string }> {
    try {
      const me = await this.request<{ accountType?: string }>("GET", "/rest/api/3/myself");
      return { accountType: me.accountType };
    } catch (error) {
      if (error instanceof JiraHttpError && (error.status === 401 || error.status === 403)) {
        throw new JiraAuthError(`${error.status} from GET /rest/api/3/myself`);
      }
      throw error;
    }
  }

  /** Runs a JQL query to completion, following `nextPageToken` until `isLast`. */
  async searchAll(jql: string, fields: readonly string[] = JIRA_ISSUE_FIELDS): Promise<JiraIssue[]> {
    const issues: JiraIssue[] = [];
    let nextPageToken: string | undefined;
    for (;;) {
      const page = await this.request<SearchPage>("POST", "/rest/api/3/search/jql", {
        jql,
        fields: [...fields],
        maxResults: PAGE_SIZE,
        ...(nextPageToken ? { nextPageToken } : {}),
      });
      issues.push(...(page.issues ?? []));
      // Stop only on an explicit last page, a missing token or a repeated token —
      // never on a merely absent `isLast`, which would silently truncate the scope.
      if (page.isLast === true || !page.nextPageToken || page.nextPageToken === nextPageToken) break;
      nextPageToken = page.nextPageToken;
    }
    return issues;
  }

  /** Fetches one issue, or null when Jira reports it does not exist / is not visible. */
  async getIssue(key: string, fields: readonly string[] = JIRA_ISSUE_FIELDS): Promise<JiraIssue | null> {
    const query = new URLSearchParams({ fields: fields.join(",") });
    try {
      return await this.request<JiraIssue>("GET", `/rest/api/3/issue/${encodeURIComponent(key)}?${query}`);
    } catch (error) {
      if (error instanceof JiraHttpError && error.status === 404) return null;
      throw error;
    }
  }

  async getProjectVersions(projectKey: string): Promise<JiraVersion[]> {
    return this.request<JiraVersion[]>("GET", `/rest/api/3/project/${encodeURIComponent(projectKey)}/versions`);
  }

  /** Human-readable issue URL for reports. */
  browseUrl(key: string): string {
    return `${this.baseUrl}/browse/${key}`;
  }
}

/** Escapes a value for use inside a double-quoted JQL string literal. */
export function jqlString(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
