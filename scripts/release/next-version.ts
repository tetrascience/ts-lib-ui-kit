/**
 * Prints the version the next release will get, for naming beta and alpha
 * builds.
 *
 * Between releases package.json holds the version already released, so
 * naming a prerelease from it (ts-ci-cd-lib's shared publish workflow's
 * default, `${package.json version}-beta.<run>.<attempt>`) gave every merge
 * after v1.1.0 a `1.1.0-beta.N`, which semver sorts *before* 1.1.0. The
 * publish workflows run this first (`next-version.yml`):
 * - betas pass `--prerelease beta` and publish the exact result
 *   (`1.2.0-beta.3`, numbered per version) through the shared workflow's
 *   `prerelease_version` input;
 * - PR alphas take the plain version, written into package.json through the
 *   shared workflow's `pre_install_command`, and keep its run-number suffix
 *   (open PRs share a next version, so a counter would collide).
 *
 * The bump comes from semantic-release's own commit analyzer, configured
 * from `release.config.js`, over the commits since the last release tag
 * (`tagFormat` from the same config) — the same calculation the Release
 * workflow will make. When nothing since the tag would trigger a release
 * (only `chore:`/`docs:`…), it falls back to a patch bump so the beta still
 * sorts after the last release.
 *
 * Node 24 loads this file directly (it uses only erasable TypeScript), which
 * is how the Release workflow's verify-package-version.js plugin imports it.
 *
 * Usage: yarn tsx scripts/release/next-version.ts                    (prints e.g. "1.2.0")
 *        yarn tsx scripts/release/next-version.ts --prerelease beta  (prints e.g. "1.2.0-beta.3")
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { analyzeCommits } from "@semantic-release/commit-analyzer";

export type ReleaseType = "major" | "minor" | "patch";
export type Commit = { hash: string; message: string };

const COMMIT_ANALYZER = "@semantic-release/commit-analyzer";
// semantic-release's default tagFormat.
const DEFAULT_TAG_FORMAT = "v${version}";
const VERSION_PLACEHOLDER = "${version}";
// Field and record separators that can't appear in a commit message.
const FIELD = "\u001F";
const RECORD = "\u001E";

/** Bumps a plain `X.Y.Z` version. Prerelease and build suffixes are not accepted. */
export function bumpVersion(version: string, type: ReleaseType): string {
  const [major, minor, patch] = parseVersion(version);
  if (type === "major") return `${major + 1}.0.0`;
  if (type === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function parseVersion(version: string): [number, number, number] {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) throw new Error(`Not a plain X.Y.Z version: "${version}"`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** Orders two plain `X.Y.Z` versions: negative when `a` is older, positive when newer. */
export function compareVersions(a: string, b: string): number {
  const left = parseVersion(a);
  const right = parseVersion(b);
  return left[0] - right[0] || left[1] - right[1] || left[2] - right[2];
}

/**
 * Picks a plugin's options out of a semantic-release config's `plugins`, in
 * any form semantic-release accepts: `"name"`, `["name", options]`, or
 * `{ path: "name", ...options }`.
 */
export function pluginConfig(plugins: ReadonlyArray<unknown>, name: string): Record<string, unknown> {
  for (const plugin of plugins) {
    if (plugin === name) return {};
    if (Array.isArray(plugin) && plugin[0] === name) {
      return (plugin[1] as Record<string, unknown> | undefined) ?? {};
    }
    if (plugin && typeof plugin === "object" && !Array.isArray(plugin)) {
      const { path: pluginPath, ...options } = plugin as Record<string, unknown>;
      if (pluginPath === name) return options;
    }
  }
  throw new Error(`release.config.js has no ${name} plugin`);
}

/** The commit-analyzer's options from a semantic-release config's `plugins`. */
export function commitAnalyzerConfig(plugins: ReadonlyArray<unknown>): Record<string, unknown> {
  return pluginConfig(plugins, COMMIT_ANALYZER);
}

export interface ReleaseConfig {
  plugins: unknown[];
  /** semantic-release's `tagFormat`, defaulted the way semantic-release defaults it. */
  tagFormat: string;
}

export async function loadReleaseConfig(cwd: string): Promise<ReleaseConfig> {
  const configModule = (await import(pathToFileURL(path.join(cwd, "release.config.js")).href)) as {
    default: { plugins: unknown[]; tagFormat?: string };
  };
  const { plugins, tagFormat = DEFAULT_TAG_FORMAT } = configModule.default;
  if (!tagFormat.includes(VERSION_PLACEHOLDER)) {
    throw new Error(`release.config.js's tagFormat "${tagFormat}" has no ${VERSION_PLACEHOLDER}`);
  }
  return { plugins, tagFormat };
}

/** The release tag for `version` under `tagFormat` (`v1.2.0` by default). */
export function formatTag(tagFormat: string, version: string): string {
  return tagFormat.replace(VERSION_PLACEHOLDER, version);
}

/** Matches a release tag (no prerelease suffix) under `tagFormat`, capturing its `X.Y.Z`. */
export function releaseTagPattern(tagFormat: string): RegExp {
  const [before, after] = tagFormat
    .split(VERSION_PLACEHOLDER)
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`^${before}(\\d+\\.\\d+\\.\\d+)${after}$`);
}

/** Parses `git log --format=%H<FIELD>%B<RECORD>` output into analyzer commits. */
export function parseGitLog(output: string): Commit[] {
  return output
    .split(RECORD)
    .map((record) => record.replace(/^\n/, ""))
    .filter((record) => record.includes(FIELD))
    .map((record) => {
      const [hash, message] = record.split(FIELD);
      return { hash, message: message.trim() };
    });
}

export const silentLogger = { log: () => {}, error: () => {}, warn: () => {}, success: () => {} };

function git(cwd: string, args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8" });
}

/** The commits `git log <args>` lists (e.g. `v1.1.0..HEAD`), newest first. */
export function commitsIn(cwd: string, ...args: string[]): Commit[] {
  return parseGitLog(git(cwd, ["log", `--format=%H${FIELD}%B${RECORD}`, ...args]));
}

/** Most recent release tag reachable from HEAD, or undefined when there is none. */
export function lastReleaseTag(cwd: string, tagFormat = DEFAULT_TAG_FORMAT): string | undefined {
  // --merged HEAD + version sort mirrors how semantic-release picks the last
  // release on a branch; `git describe` would also return prerelease tags.
  const pattern = releaseTagPattern(tagFormat);
  return git(cwd, ["tag", "--merged", "HEAD", "--list", formatTag(tagFormat, "*"), "--sort=-v:refname"])
    .split("\n")
    .map((tag) => tag.trim())
    .find((tag) => pattern.test(tag));
}

/** What semantic-release's commit analyzer makes of `commits`, or null when they don't release. */
export async function analyze(
  cwd: string,
  plugins: ReadonlyArray<unknown>,
  commits: Commit[],
): Promise<ReleaseType | null> {
  return (await analyzeCommits(commitAnalyzerConfig(plugins), {
    commits,
    cwd,
    env: process.env,
    logger: silentLogger,
  })) as ReleaseType | null;
}

export interface ReleaseAnalysis {
  /** The last release tag reachable from HEAD. */
  lastTag: string;
  lastVersion: string;
  commits: Commit[];
  /** What semantic-release would release, or null when nothing since the tag triggers one. */
  type: ReleaseType | null;
  config: ReleaseConfig;
}

/** Runs semantic-release's commit analyzer over the commits since the last release tag. */
export async function analyzeSinceLastRelease(cwd: string): Promise<ReleaseAnalysis> {
  const config = await loadReleaseConfig(cwd);
  const lastTag = lastReleaseTag(cwd, config.tagFormat);
  const lastVersion = lastTag && releaseTagPattern(config.tagFormat).exec(lastTag)?.[1];
  if (!lastTag || !lastVersion) {
    throw new Error(
      `No ${formatTag(config.tagFormat, "X.Y.Z")} tag reachable from HEAD; is the checkout shallow (fetch-depth: 0)?`,
    );
  }
  const commits = commitsIn(cwd, `${lastTag}..HEAD`);
  const type = await analyze(cwd, config.plugins, commits);
  return { lastTag, lastVersion, commits, type, config };
}

/** The next release's version, falling back to a patch bump when nothing would release. */
export async function computeNextVersion(cwd: string): Promise<string> {
  const { lastVersion, type } = await analyzeSinceLastRelease(cwd);
  return bumpVersion(lastVersion, type ?? "patch");
}

const TYPE_RANK: Record<ReleaseType, number> = { patch: 1, minor: 2, major: 3 };
const PRERELEASE_TAG = /^[0-9A-Za-z-]+$/;

/**
 * The next release's prerelease name, `X.Y.Z-<tag>.N`, where N counts the
 * commits since the next version last changed, so it restarts at 1 for each
 * version: after v1.1.0, a fix is 1.1.1-beta.1, a docs merge 1.1.1-beta.2,
 * then a feat 1.2.0-beta.1. Derived from git alone, so the same commit gets
 * the same name on every registry and on a re-run.
 */
export async function computePrereleaseVersion(cwd: string, tag: string): Promise<string> {
  if (!PRERELEASE_TAG.test(tag)) throw new Error(`Not a prerelease tag: "${tag}"`);
  const { lastVersion, commits, config } = await analyzeSinceLastRelease(cwd);

  // Walk oldest to newest, tracking the version each merge would release.
  let type: ReleaseType | null = null;
  let version = bumpVersion(lastVersion, "patch");
  let count = 0;
  for (const commit of [...commits].reverse()) {
    const commitType = await analyze(cwd, config.plugins, [commit]);
    if (commitType && (!type || TYPE_RANK[commitType] > TYPE_RANK[type])) type = commitType;
    const next = bumpVersion(lastVersion, type ?? "patch");
    count = next === version ? count + 1 : 1;
    version = next;
  }
  // At the release commit itself there is nothing to count; call it the first.
  return `${version}-${tag}.${Math.max(count, 1)}`;
}

const CHANGELOG_HEADING = /^#{1,2} \[(\d+\.\d+\.\d+)\]/gm;

/** Every `# [X.Y.Z]` entry heading in a CHANGELOG, newest (topmost) first. */
export function changelogEntries(changelog: string): Array<{ version: string; index: number }> {
  return [...changelog.matchAll(CHANGELOG_HEADING)].map((match) => ({ version: match[1], index: match.index }));
}

// CLI
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const tagIndex = process.argv.indexOf("--prerelease");
  const tag = tagIndex === -1 ? undefined : (process.argv[tagIndex + 1] ?? "");
  (tag === undefined ? computeNextVersion(process.cwd()) : computePrereleaseVersion(process.cwd(), tag)).then(
    (version) => console.log(version),
    (error: unknown) => {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    },
  );
}
