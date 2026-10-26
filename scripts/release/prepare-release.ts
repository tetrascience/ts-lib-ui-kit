/**
 * Writes a release-prep change into the working tree: the next version in
 * package.json, its CHANGELOG.md entry, and the README's version lines.
 *
 * semantic-release can't commit these itself (main is push-protected), so a
 * prep PR carries them before `Release` is dispatched — and the Release run
 * refuses to tag unless package.json and the newest CHANGELOG entry already
 * say the version it computes, with no releasable commit merged after the
 * entry was written (verify-package-version.js). This script makes the same computation:
 * semantic-release's commit analyzer for the version and its release-notes
 * generator for the CHANGELOG entry, both with release.config.js's options,
 * so the prep PR says what the Release run will do. The Release prep
 * workflow (`.github/workflows/release-prep.yml`) runs it and opens the PR.
 *
 * Usage: yarn tsx scripts/release/prepare-release.ts [--notes-file <path>] [--replaced-file <path>]
 * Prints the new version. With --notes-file, also writes the generated notes
 * there; with --replaced-file, any unreleased entry it replaced (both for the
 * PR body).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { generateNotes } from "@semantic-release/release-notes-generator";
import * as prettier from "prettier";

import {
  analyzeSinceLastRelease,
  bumpVersion,
  changelogEntries,
  compareVersions,
  formatTag,
  pluginConfig,
  silentLogger,
} from "./next-version";

const NOTES_GENERATOR = "@semantic-release/release-notes-generator";

/** Sets the top-level `"version"` in package.json text. */
export function setPackageVersion(packageJson: string, version: string): string {
  const pkg = JSON.parse(packageJson) as Record<string, unknown>;
  if (typeof pkg.version !== "string") throw new Error('package.json has no top-level "version" field');
  pkg.version = version;
  // package.json is kept in npm's own format (2-space indent, trailing
  // newline), so this round-trips everything else byte-for-byte.
  return `${JSON.stringify(pkg, null, 2)}\n`;
}

/** The GitHub URL release notes link to, from package.json's `repository`. */
export function repositoryUrl(packageJson: string): string {
  const { repository } = JSON.parse(packageJson) as { repository?: string | { url?: string } };
  const url = typeof repository === "string" ? repository : repository?.url;
  if (!url) throw new Error('package.json has no "repository" URL for the release notes to link to');
  return url.replace(/^git\+/, "").replace(/\.git$/, "");
}

/**
 * Puts a generated entry on top of CHANGELOG.md. semantic-release's writer
 * heads every entry `## [x.y.z]`; this file's convention is `# [x.y.z]`.
 *
 * If the newest entry is for a version after the last release (an earlier
 * prep PR merged, then more commits changed the version before Release ran),
 * it was never released, so it is replaced rather than left behind, and
 * returned as `replaced` so any hand-written notes in it can be carried over.
 * An entry at or before the last release is history and is never touched.
 */
export function prependChangelog(
  changelog: string,
  notes: string,
  lastVersion: string,
): { changelog: string; replaced?: string } {
  const entry = notes.trim().replace(/^## \[/, "# [");
  let rest = changelog.trimStart();
  let replaced: string | undefined;

  const [newest, previous] = changelogEntries(rest);
  if (newest && newest.index === 0 && compareVersions(newest.version, lastVersion) > 0) {
    const end = previous?.index ?? rest.length;
    replaced = rest.slice(0, end).trim();
    rest = rest.slice(end);
  }
  return { changelog: `${entry}\n\n${rest}`, replaced };
}

const COMPATIBILITY_ROW = /^\| v(\d+)\.(\d+)\.x(\s*)\|(.*)$/;

/**
 * Updates the README's "Version" line and, when a new minor line starts,
 * adds a compatibility-table row for it, copied from the newest row.
 *
 * Rows for minor lines after the last release that this version isn't on
 * were added by a superseded prep PR (1.2.0 prepped, then a `feat!:` made it
 * 2.0.0) and never shipped, so they are dropped.
 */
export function updateReadme(readme: string, version: string, lastVersion: string): string {
  const versionLine = /(## Version\n\nv)\d+\.\d+\.\d+/;
  if (!versionLine.test(readme)) throw new Error('README.md has no "## Version" line to update');

  const [major, minor] = version.split(".").map(Number);
  const [lastMajor, lastMinor] = lastVersion.split(".").map(Number);
  const unreleased = (rowMajor: number, rowMinor: number) =>
    !(rowMajor === major && rowMinor === minor) &&
    (rowMajor > lastMajor || (rowMajor === lastMajor && rowMinor > lastMinor));
  let next = readme
    .replace(versionLine, `$1${version}`)
    .split("\n")
    .filter((row) => {
      const match = COMPATIBILITY_ROW.exec(row);
      return !match || !unreleased(Number(match[1]), Number(match[2]));
    })
    .join("\n");

  const cell = `v${major}.${minor}.x`;
  const newestRow = new RegExp(COMPATIBILITY_ROW.source, "m").exec(next);
  if (newestRow && !next.includes(`| ${cell} `)) {
    // Keep the column width: the row's first cell is padded to the header's.
    const width = `v${newestRow[1]}.${newestRow[2]}.x`.length + newestRow[3].length;
    const padding = " ".repeat(Math.max(1, width - cell.length));
    next = next.replace(newestRow[0], `| ${cell}${padding}|${newestRow[4]}\n${newestRow[0]}`);
  }
  return next;
}

export interface PreparedRelease {
  version: string;
  notes: string;
  /** An unreleased CHANGELOG entry this run replaced, if any. */
  replaced?: string;
}

export async function prepareRelease(cwd: string): Promise<PreparedRelease> {
  const { lastTag, lastVersion, commits, type, config } = await analyzeSinceLastRelease(cwd);
  if (!type) {
    throw new Error(`Nothing to release: no commit since ${lastTag} is a feat, fix, perf or breaking change.`);
  }
  const version = bumpVersion(lastVersion, type);

  const file = (name: string) => path.join(cwd, name);
  const packageJson = fs.readFileSync(file("package.json"), "utf8");

  const notes = (await generateNotes(pluginConfig(config.plugins, NOTES_GENERATOR), {
    commits,
    lastRelease: { gitTag: lastTag, version: lastVersion },
    nextRelease: { gitTag: formatTag(config.tagFormat, version), version },
    options: { repositoryUrl: repositoryUrl(packageJson) },
    cwd,
    env: process.env,
    logger: silentLogger,
  })) as string;

  // Build all three files before writing any, so a failure leaves the
  // working tree as it was rather than half-prepped.
  const { changelog, replaced } = prependChangelog(fs.readFileSync(file("CHANGELOG.md"), "utf8"), notes, lastVersion);
  const prettierOptions = (await prettier.resolveConfig(file("CHANGELOG.md"))) ?? {};
  const outputs = {
    "package.json": setPackageVersion(packageJson, version),
    "CHANGELOG.md": await prettier.format(changelog, { ...prettierOptions, parser: "markdown" }),
    "README.md": updateReadme(fs.readFileSync(file("README.md"), "utf8"), version, lastVersion),
  };
  for (const [name, contents] of Object.entries(outputs)) fs.writeFileSync(file(name), contents);

  return { version, notes, replaced };
}

// CLI
function flag(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  prepareRelease(process.cwd()).then(
    ({ version, notes, replaced }) => {
      const notesFile = flag("--notes-file");
      const replacedFile = flag("--replaced-file");
      if (notesFile) fs.writeFileSync(notesFile, notes);
      if (replacedFile && replaced) fs.writeFileSync(replacedFile, replaced);
      console.log(version);
    },
    (error: unknown) => {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    },
  );
}
