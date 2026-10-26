// Local semantic-release plugin: refuse to release unless the release-prep
// PR for exactly this release has merged.
//
// The @semantic-release/git plugin is disabled (main is push-protected), so
// semantic-release never commits the bump — a prep PR has to. If the Release
// workflow is dispatched before that PR merges, the tag lands on a commit
// whose package.json says the old version, and ts-ci-cd-lib's publish job
// then fails the tag/version check at the PROD gate. That is what happened to
// the first v1.1.0 tag. `verifyRelease` runs before semantic-release creates
// the tag (and before @semantic-release/npm rewrites package.json in the
// runner), so throwing here stops the release with nothing to clean up.
//
// Three checks, each fixed by running Release prep again:
// - package.json says the version about to be tagged;
// - so does CHANGELOG.md's newest entry;
// - no feat/fix/perf/breaking commit merged after the last change to
//   CHANGELOG.md. Such a commit can leave the version unchanged (a fix after
//   a 1.2.0 prep is still 1.2.0) and would ship missing from the CHANGELOG.
import { readFile } from "node:fs/promises";
import path from "node:path";

// Node 24 (the Release workflow's) loads this TypeScript file natively.
import { analyze, changelogEntries, commitsIn, loadReleaseConfig } from "./next-version.ts";

const RERUN = "Run the Release prep workflow, merge its PR, then dispatch Release again. No tag was created.";

export async function verifyRelease(_pluginConfig, context) {
  const { cwd, lastRelease, nextRelease, logger } = context;
  const { version } = nextRelease;

  const pkg = JSON.parse(await readFile(path.join(cwd, "package.json"), "utf8"));
  if (pkg.version !== version) {
    throw new Error(`package.json says ${pkg.version}, but this release would be ${version}. ${RERUN}`);
  }

  const [newest] = changelogEntries(await readFile(path.join(cwd, "CHANGELOG.md"), "utf8"));
  if (newest?.version !== version) {
    throw new Error(
      `CHANGELOG.md's newest entry is ${newest?.version ?? "missing"}, but this release would be ${version}. ${RERUN}`,
    );
  }

  const { plugins } = await loadReleaseConfig(cwd);
  const since = lastRelease?.gitHead ? `${lastRelease.gitHead}..HEAD` : "HEAD";
  // The newest-entry check above means CHANGELOG.md changed since the last
  // release, so this finds the prep PR's commit (or a later edit to the file).
  const [changelogCommit] = commitsIn(cwd, "-1", since, "--", "CHANGELOG.md");
  const late = [];
  for (const commit of commitsIn(cwd, changelogCommit ? `${changelogCommit.hash}..HEAD` : since)) {
    if (await analyze(cwd, plugins, [commit])) late.push(commit);
  }
  if (late.length > 0) {
    const list = late.map((commit) => `  ${commit.hash.slice(0, 7)} ${commit.message.split("\n")[0]}`).join("\n");
    throw new Error(
      `These commits merged after the ${version} CHANGELOG entry was written, so they would ship missing ` +
        `from it:\n${list}\n${RERUN}`,
    );
  }

  logger.log("package.json and CHANGELOG.md match the next release: %s", version);
}
