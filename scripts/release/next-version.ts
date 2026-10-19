/**
 * Prints the version the next release will get, for naming beta builds.
 *
 * ts-ci-cd-lib's shared publish workflow names a beta
 * `${package.json version}-beta.<run>.<attempt>`. Between releases
 * package.json holds the version already released, so every merge after
 * v1.1.0 shipped as `1.1.0-beta.N`, and semver sorts those *before* 1.1.0.
 * `publish-public.yml` runs this first and writes the result into
 * package.json (via the shared workflow's `pre_install_command`), so the
 * merges after v1.1.0 publish as `1.2.0-beta.N` or `1.1.1-beta.N` instead.
 *
 * The bump comes from semantic-release's own commit analyzer, configured
 * from `release.config.js`, over the commits since the last `vX.Y.Z` tag —
 * the same calculation the Release workflow will make. When nothing since
 * the tag would trigger a release (only `chore:`/`docs:`…), it falls back to
 * a patch bump so the beta still sorts after the last release.
 *
 * Usage: yarn tsx scripts/release/next-version.ts   (prints e.g. "1.2.0")
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { analyzeCommits } from "@semantic-release/commit-analyzer";

export type ReleaseType = "major" | "minor" | "patch";

const RELEASE_TAG = /^v(\d+)\.(\d+)\.(\d+)$/;
const COMMIT_ANALYZER = "@semantic-release/commit-analyzer";
// Field and record separators that can't appear in a commit message.
const FIELD = "\u001F";
const RECORD = "\u001E";

/** Bumps a plain `X.Y.Z` version. Prerelease and build suffixes are not accepted. */
export function bumpVersion(version: string, type: ReleaseType): string {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) throw new Error(`Not a plain X.Y.Z version: "${version}"`);
  const [major, minor, patch] = match.slice(1).map(Number);
  if (type === "major") return `${major + 1}.0.0`;
  if (type === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

/** Picks a plugin's options out of a semantic-release config's `plugins`. */
export function pluginConfig(plugins: ReadonlyArray<unknown>, name: string): Record<string, unknown> {
  for (const plugin of plugins) {
    if (plugin === name) return {};
    if (Array.isArray(plugin) && plugin[0] === name) {
      return (plugin[1] as Record<string, unknown> | undefined) ?? {};
    }
  }
  throw new Error(`release.config.js has no ${name} plugin`);
}

/** The commit-analyzer's options from a semantic-release config's `plugins`. */
export function commitAnalyzerConfig(plugins: ReadonlyArray<unknown>): Record<string, unknown> {
  return pluginConfig(plugins, COMMIT_ANALYZER);
}

/** Parses `git log --format=%H<FIELD>%B<RECORD>` output into analyzer commits. */
export function parseGitLog(output: string): Array<{ hash: string; message: string }> {
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

/** Most recent `vX.Y.Z` tag reachable from HEAD, or undefined when there is none. */
export function lastReleaseTag(cwd: string): string | undefined {
  // --merged HEAD + version sort mirrors how semantic-release picks the last
  // release on a branch; `git describe` would also return prerelease tags.
  return git(cwd, ["tag", "--merged", "HEAD", "--list", "v*", "--sort=-v:refname"])
    .split("\n")
    .map((tag) => tag.trim())
    .find((tag) => RELEASE_TAG.test(tag));
}

export interface ReleaseAnalysis {
  /** The last `vX.Y.Z` tag reachable from HEAD. */
  lastTag: string;
  lastVersion: string;
  commits: Array<{ hash: string; message: string }>;
  /** What semantic-release would release, or null when nothing since the tag triggers one. */
  type: ReleaseType | null;
  /** `release.config.js`'s `plugins`, for callers that need other plugins' options. */
  plugins: unknown[];
}

/** Runs semantic-release's commit analyzer over the commits since the last release tag. */
export async function analyzeSinceLastRelease(cwd: string): Promise<ReleaseAnalysis> {
  const lastTag = lastReleaseTag(cwd);
  if (!lastTag) throw new Error("No vX.Y.Z tag reachable from HEAD; is the checkout shallow (fetch-depth: 0)?");

  const configModule = (await import(pathToFileURL(path.join(cwd, "release.config.js")).href)) as {
    default: { plugins: unknown[] };
  };
  const { plugins } = configModule.default;

  const commits = parseGitLog(git(cwd, ["log", `--format=%H${FIELD}%B${RECORD}`, `${lastTag}..HEAD`]));
  const type = (await analyzeCommits(commitAnalyzerConfig(plugins), {
    commits,
    cwd,
    env: process.env,
    logger: silentLogger,
  })) as ReleaseType | null;

  return { lastTag, lastVersion: lastTag.slice(1), commits, type, plugins };
}

/** The next release's version, falling back to a patch bump when nothing would release. */
export async function computeNextVersion(cwd: string): Promise<string> {
  const { lastVersion, type } = await analyzeSinceLastRelease(cwd);
  return bumpVersion(lastVersion, type ?? "patch");
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
