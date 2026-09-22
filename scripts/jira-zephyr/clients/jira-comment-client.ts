/**
 * Jira comment read/write — the one part of this toolchain that writes to Jira.
 *
 * It is a **separate client from `JiraClient` on purpose**. That client's
 * contract is "read-only by construction: there is no method that writes to
 * Jira", which several call sites rely on; adding a POST there would quietly
 * retire that guarantee for everyone. Keeping writes here means a reader can
 * still tell, from the import alone, whether a module can modify Jira.
 *
 *   GET  /rest/api/2/issue/{key}/comment   → read comments (v2: wiki markup)
 *   POST /rest/api/2/issue/{key}/comment   → post a comment
 *
 * REST **v2** is deliberate. v3 takes and returns ADF (a JSON document tree);
 * v2 takes wiki markup as a plain string, which is what the renderer produces
 * and what a human can eyeball in a test. The two APIs are otherwise equivalent
 * for comments.
 */
const DEFAULT_TIMEOUT_MS = 30_000;
const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);
const MAX_GET_ATTEMPTS = 4;
const PAGE_SIZE = 100;

export interface JiraComment {
  id: string;
  body: string;
  authorAccountId?: string;
  authorDisplayName?: string;
  created: string;
}

export interface JiraCommentClientOptions {
  baseUrl: string;
  email: string;
  apiToken: string;
  fetchImpl?: typeof globalThis.fetch;
  /** When true, posting throws instead of writing — the dry-run guarantee. */
  readOnly?: boolean;
}

export class JiraCommentHttpError extends Error {
  constructor(
    readonly method: string,
    readonly path: string,
    readonly status: number,
    body: string,
  ) {
    super(`${method} ${path} → ${status}: ${body.slice(0, 300)}`);
    this.name = "JiraCommentHttpError";
  }
}

export class ReadOnlyCommentError extends Error {
  constructor(issueKey: string) {
    super(`Refusing to comment on ${issueKey}: this comment client is read-only`);
    this.name = "ReadOnlyCommentError";
  }
}

interface RawComment {
  id?: string;
  body?: unknown;
  created?: string;
  author?: { accountId?: string; displayName?: string };
}

export class JiraCommentClient {
  private readonly fetchImpl: typeof globalThis.fetch;
  private readonly authorization: string;
  readonly baseUrl: string;
  readonly readOnly: boolean;

  constructor(options: JiraCommentClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch;
    this.readOnly = options.readOnly ?? false;
    const credentials = Buffer.from(`${options.email}:${options.apiToken}`).toString("base64");
    this.authorization = `Basic ${credentials}`;
  }

  private async request<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
    const maxAttempts = method === "GET" ? MAX_GET_ATTEMPTS : 1;
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
      if (response.ok) {
        const text = await response.text();
        return (text ? JSON.parse(text) : {}) as T;
      }
      const text = await response.text();
      if (!RETRYABLE_STATUSES.has(response.status) || attempt >= maxAttempts) {
        throw new JiraCommentHttpError(method, path, response.status, text);
      }
      const retryAfter = Number(response.headers.get("retry-after"));
      await new Promise((resolve) =>
        setTimeout(resolve, retryAfter > 0 ? retryAfter * 1000 : 500 * 2 ** (attempt - 1)),
      );
    }
  }

  /** Every comment on an issue, oldest first. */
  async getComments(issueKey: string): Promise<JiraComment[]> {
    const comments: JiraComment[] = [];
    for (let startAt = 0; ; startAt += PAGE_SIZE) {
      const query = new URLSearchParams({ startAt: String(startAt), maxResults: String(PAGE_SIZE) });
      const page = await this.request<{ comments?: RawComment[]; total?: number }>(
        "GET",
        `/rest/api/2/issue/${encodeURIComponent(issueKey)}/comment?${query}`,
      );
      const batch = page.comments ?? [];
      for (const raw of batch) {
        comments.push({
          id: raw.id ?? "",
          // v2 returns a string, but a v3-shaped ADF object must never be
          // stringified into "[object Object]" and pattern-matched as a command.
          body: typeof raw.body === "string" ? raw.body : "",
          authorAccountId: raw.author?.accountId,
          authorDisplayName: raw.author?.displayName,
          created: raw.created ?? "",
        });
      }
      if (batch.length < PAGE_SIZE) return comments;
    }
  }

  async addComment(issueKey: string, body: string): Promise<JiraComment> {
    if (this.readOnly) throw new ReadOnlyCommentError(issueKey);
    const created = await this.request<RawComment>(
      "POST",
      `/rest/api/2/issue/${encodeURIComponent(issueKey)}/comment`,
      {
        body,
      },
    );
    return {
      id: created.id ?? "",
      body: typeof created.body === "string" ? created.body : body,
      authorAccountId: created.author?.accountId,
      authorDisplayName: created.author?.displayName,
      created: created.created ?? new Date().toISOString(),
    };
  }
}
