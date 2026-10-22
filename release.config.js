// The `conventionalcommits` preset (not commit-analyzer's default `angular`)
// is required for `feat!:` / `fix!:` to register as breaking changes. The
// angular preset's headerPattern is /^(\w*)(?:\((.*)\))?: (.*)$/ — the `!`
// makes the header match nothing at all, so such a commit parses with no
// type and no notes and is silently dropped from both the version
// calculation and the changelog. Set on both plugins so they agree.
//
// The preset only releases a revert whose body says "This reverts commit
// <sha>.", which a squash merge (PR title, empty body) never has, so the
// `revert` rule makes a `revert:` PR title a patch release as documented.
export default {
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      { preset: "conventionalcommits", releaseRules: [{ type: "revert", release: "patch" }] },
    ],
    // Fails the release before tagging unless the prep PR for exactly this
    // release has merged (package.json, CHANGELOG.md, nothing releasable
    // merged after it). See the file's header.
    "./scripts/release/verify-package-version.js",
    ["@semantic-release/release-notes-generator", { preset: "conventionalcommits" }],
    ["@semantic-release/changelog", { changelogFile: "CHANGELOG.md" }],
    ["@semantic-release/npm", { npmPublish: false }],
    // Disabled, and not merely pending: an org ruleset forbids pushing to
    // main, and the bypass actor this would need was declined as a supply
    // chain risk. So semantic-release writes package.json + CHANGELOG in the
    // runner and discards them; both are committed by hand via PR before a
    // release is dispatched, and verify-package-version.js above refuses to
    // tag if that PR hasn't merged. (Release Please, which opens that PR
    // itself, was evaluated in #237 and not adopted.) Discussion:
    // https://tetrascience.slack.com/archives/C02L9BRTA7R/p1782936969323909?thread_ts=1782913564.432859&cid=C02L9BRTA7R
    // [
    //   "@semantic-release/git",
    //   {
    //     assets: ["CHANGELOG.md", "package.json"],
    //     message: "chore(release): ${nextRelease.version} [skip ci]",
    //   },
    // ],
    "@semantic-release/github",
  ],
};
