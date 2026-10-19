/**
 * Writes a release-prep change into the working tree: the next version in
 * package.json, its CHANGELOG.md entry, and the README's version lines.
 *
 * semantic-release can't commit these itself (main is push-protected), so a
 * prep PR carries them before `Release` is dispatched — and the Release run
 * refuses to tag unless package.json already says the version it computes
 * (verify-package-version.js). This script makes the same computation:
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

import { analyzeSinceLastRelease, bumpVersion, pluginConfig, silentLogger } from "./next-version";

const NOTES_GENERATOR = "@semantic-release/release-notes-generator";
const REPOSITORY_URL = "https://github.com/tetrascience/ts-lib-ui-kit";

/** Sets `"version"` in package.json text, leaving everything else byte-for-byte. */
export function setPackageVersion(packageJson: string, version: string): string {
  const pattern = /^(\s*"version":\s*")[^"]*(")/m;
  if (!pattern.test(packageJson)) throw new Error('package.json has no top-level "version" field');
  return packageJson.replace(pattern, `$1${version}$2`);
}

const VERSION_HEADING = /^#{1,2} \[(\d+\.\d+\.\d+)\]/gm;

/**
 * Puts a generated entry on top of CHANGELOG.md. semantic-release's writer
 * heads every entry `## [x.y.z]`; this file's convention is `# [x.y.z]`.
 *
 * If the newest entry is for a version that was never released (an earlier
 * prep PR merged, then more commits changed the version before Release ran),
 * it is replaced rather than left behind, and returned as `replaced` so any
 * hand-written notes in it can be carried over.
 */
export function prependChangelog(
  changelog: string,
  notes: string,
  lastVersion: string,
): { changelog: string; replaced?: string } {
  const entry = notes.trim().replace(/^## \[/, "# [");
  let rest = changelog.trimStart();
  let replaced: string | undefined;

  const headings = [...rest.matchAll(VERSION_HEADING)];
  const [newest, previous] = headings;
  if (newest && newest[1] !== lastVersion && newest.index === 0) {
    const end = previous?.index ?? rest.length;
    replaced = rest.slice(0, end).trim();
    rest = rest.slice(end);
  }
  return { changelog: `${entry}\n\n${rest}`, replaced };
}

/**
 * Updates the README's "Version" line and, when a new minor line starts,
 * adds a compatibility-table row for it, copied from the newest row.
 */
export function updateReadme(readme: string, version: string): string {
  const versionLine = /(## Version\n\nv)\d+\.\d+\.\d+/;
  if (!versionLine.test(readme)) throw new Error('README.md has no "## Version" line to update');
  let next = readme.replace(versionLine, `$1${version}`);

  const [major, minor] = version.split(".");
  const line = `v${major}.${minor}.x`;
  const newestRow = /^\| (v\d+\.\d+\.x)(\s*)\|(.*)$/m.exec(next);
  if (newestRow && newestRow[1] !== line && !next.includes(`| ${line} `)) {
    // Keep the column width: the row's first cell is padded to the header's.
    const padding = " ".repeat(Math.max(1, newestRow[1].length + newestRow[2].length - line.length));
    next = next.replace(newestRow[0], `| ${line}${padding}|${newestRow[3]}\n${newestRow[0]}`);
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
  const { lastTag, lastVersion, commits, type, plugins } = await analyzeSinceLastRelease(cwd);
  if (!type) {
    throw new Error(`Nothing to release: no commit since ${lastTag} is a feat, fix, perf or breaking change.`);
  }
  const version = bumpVersion(lastVersion, type);

  const notes = (await generateNotes(pluginConfig(plugins, NOTES_GENERATOR), {
    commits,
    lastRelease: { gitTag: lastTag, version: lastVersion },
    nextRelease: { gitTag: `v${version}`, version },
    options: { repositoryUrl: REPOSITORY_URL },
    cwd,
    env: process.env,
    logger: silentLogger,
  })) as string;

  const file = (name: string) => path.join(cwd, name);
  fs.writeFileSync(file("package.json"), setPackageVersion(fs.readFileSync(file("package.json"), "utf8"), version));

  const { changelog, replaced } = prependChangelog(fs.readFileSync(file("CHANGELOG.md"), "utf8"), notes, lastVersion);
  const prettierOptions = (await prettier.resolveConfig(file("CHANGELOG.md"))) ?? {};
  fs.writeFileSync(file("CHANGELOG.md"), await prettier.format(changelog, { ...prettierOptions, parser: "markdown" }));

  fs.writeFileSync(file("README.md"), updateReadme(fs.readFileSync(file("README.md"), "utf8"), version));

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
