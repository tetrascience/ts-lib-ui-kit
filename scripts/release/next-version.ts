/**
 * Prints the version the next release will get, for naming beta builds.
 *
 * ts-ci-cd-lib's shared publish workflow names a beta
 * `${package.json version}-beta.<run>.<attempt>`. Between releases
 * package.json holds the version already released, so every merge after
 * v1.1.0 shipped as `1.1.0-beta.N`, and semver sorts those *before* 1.1.0.
 * The publish workflows run this first (`next-version.yml`) and write the
 * result into package.json (via the shared workflow's
 * `pre_install_command`), so the merges after v1.1.0 publish as
 * `1.2.0-beta.N` or `1.1.1-beta.N` instead.
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
 * Usage: yarn tsx scripts/release/next-version.ts   (prints e.g. "1.2.0")
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

const CHANGELOG_HEADING = /^#{1,2} \[(\d+\.\d+\.\d+)\]/gm;

/** Every `# [X.Y.Z]` entry heading in a CHANGELOG, newest (topmost) first. */
export function changelogEntries(changelog: string): Array<{ version: string; index: number }> {
  return [...changelog.matchAll(CHANGELOG_HEADING)].map((match) => ({ version: match[1], index: match.index }));
}

// CLI
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  computeNextVersion(process.cwd()).then(
    (version) => console.log(version),
    (error: unknown) => {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    },
  );
}
