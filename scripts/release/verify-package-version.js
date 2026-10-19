// Local semantic-release plugin: refuse to release when package.json's
// committed version is not the version about to be tagged.
//
// The @semantic-release/git plugin is disabled (main is push-protected), so
// semantic-release never commits the bump — a prep PR has to. If the Release
// workflow is dispatched before that PR merges, the tag lands on a commit
// whose package.json says the old version, and ts-ci-cd-lib's publish job
// then fails the tag/version check at the PROD gate. That is what happened to
// the first v1.1.0 tag. `verifyRelease` runs before semantic-release creates
// the tag (and before @semantic-release/npm rewrites package.json in the
// runner), so throwing here stops the release with nothing to clean up.
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function verifyRelease(_pluginConfig, context) {
  const { cwd, nextRelease, logger } = context;
  const pkg = JSON.parse(await readFile(path.join(cwd, "package.json"), "utf8"));

  if (pkg.version !== nextRelease.version) {
    throw new Error(
      `package.json says ${pkg.version}, but this release would be ${nextRelease.version}. ` +
        `Merge the release-prep PR that bumps package.json and CHANGELOG.md to ` +
        `${nextRelease.version} first, then dispatch the Release workflow again. ` +
        `No tag was created.`,
    );
  }
  logger.log("package.json version matches the next release: %s", nextRelease.version);
}
