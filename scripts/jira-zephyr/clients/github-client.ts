/**
 * Pull-request lookup for Jira keys, via the `gh` CLI.
 *
 * ## Why this exists
 *
 * The repo scanner reads `git log` from HEAD, so a ticket is only visible to it
 * when a commit carrying its key is an ancestor of the current checkout. That
 * misses a real and common case: a PR merged into a **feature branch** that was
 * later deleted. `SW-2578` is the worked example — PR #204 squash-merged into
 * `SW-2410-app-shell-simple-prototype`, which no longer exists, so its commit is
 * unreachable from every local ref. The audit saw no git evidence, fell through
 * to name similarity, and matched "Align icons on the side nav" to
 * `icons.stories.tsx` — the wrong component entirely.
 *
 * Asking GitHub what a PR changed sidesteps branch reachability altogether.
 *
 * ## Why `gh` and not raw REST
 *
 * `gh` already holds the user's credentials and, in Actions, `GITHUB_TOKEN`.
 * Shelling out to it avoids adding a second auth mechanism to this toolchain.
 * Everything here is read-only: only `gh pr list` / `gh pr view` are called.
 *
 * Unavailable `gh`, a missing token or a network failure is **not** fatal — the
 * audit degrades to git-only evidence, exactly as it behaved before.
 */
import { execFileSync } from "node:child_process";

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_PRS_PER_KEY = 10;
/** `gh` search is not anchored, so "SW-25" would also return SW-2578; results are re-checked against this. */
const KEY_BOUNDARY = (key: string) => new RegExp(`\\b${key}\\b`, "i");

export interface PullRequestInfo {
  number: number;
  title: string;
  state: string;
  baseRefName: string;
  headRefName: string;
  /** Repo-relative POSIX paths the PR changed. */
  files: string[];
}

export interface GitHubReader {
  /** Every PR whose title or branch names `jiraKey`, with the files each changed. */
  pullRequestsFor(jiraKey: string): PullRequestInfo[];
  readonly available: boolean;
}

function runGh(cwd: string, args: string[]): string {
  return execFileSync("gh", args, {
    cwd,
    encoding: "utf8",
    timeout: DEFAULT_TIMEOUT_MS,
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

/** True when `gh` is installed and authenticated for this repository. */
export function isGhAvailable(cwd: string): boolean {
  try {
    runGh(cwd, ["auth", "status"]);
    return true;
  } catch {
    return false;
  }
}

interface RawPullRequest {
  number?: number;
  title?: string;
  state?: string;
  baseRefName?: string;
  headRefName?: string;
  files?: Array<{ path?: string }>;
}

/**
 * Looks PRs up by Jira key, caching per key.
 *
 * Both the PR **title** and the **branch name** are searched: this repo's
 * convention puts the key in both (`fix: SW-2578 …` on `SW-2578-align-nav-icons`),
 * but only the title is guaranteed by the `check` CI job, and a branch-only key
 * still identifies the work.
 */
export class GitHubClient implements GitHubReader {
  private readonly cache = new Map<string, PullRequestInfo[]>();
  readonly available: boolean;

  constructor(
    private readonly cwd: string,
    options: { available?: boolean } = {},
  ) {
    this.available = options.available ?? isGhAvailable(cwd);
  }

  pullRequestsFor(jiraKey: string): PullRequestInfo[] {
    if (!this.available) return [];
    const cached = this.cache.get(jiraKey);
    if (cached) return cached;

    let found: PullRequestInfo[] = [];
    try {
      const output = runGh(this.cwd, [
        "pr",
        "list",
        "--search",
        jiraKey,
        "--state",
        "all",
        "--limit",
        String(MAX_PRS_PER_KEY),
        "--json",
        "number,title,state,baseRefName,headRefName,files",
      ]);
      const parsed: unknown = JSON.parse(output || "[]");
      if (Array.isArray(parsed)) found = parsed.flatMap((raw) => toPullRequest(raw as RawPullRequest, jiraKey));
    } catch {
      // Network failure, rate limit or an unauthenticated shell: fall back to
      // git-only evidence rather than failing the audit.
      found = [];
    }
    this.cache.set(jiraKey, found);
    return found;
  }
}

/** Keeps only PRs that really name the key, since `gh --search` matches loosely. */
function toPullRequest(raw: RawPullRequest, jiraKey: string): PullRequestInfo[] {
  if (typeof raw.number !== "number") return [];
  const title = raw.title ?? "";
  const headRefName = raw.headRefName ?? "";
  const boundary = KEY_BOUNDARY(jiraKey);
  if (!boundary.test(title) && !boundary.test(headRefName)) return [];
  return [
    {
      number: raw.number,
      title,
      state: raw.state ?? "",
      baseRefName: raw.baseRefName ?? "",
      headRefName,
      files: (raw.files ?? []).flatMap((file) => (file.path ? [file.path] : [])),
    },
  ];
}

/** A reader that never returns anything, for runs with PR evidence disabled. */
export const NO_GITHUB: GitHubReader = {
  available: false,
  pullRequestsFor: () => [],
};
