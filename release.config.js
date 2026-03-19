const isStable = process.env.RELEASE_TYPE === "stable";

export default {
  branches: [
    isStable
      ? "main"
      : { name: "main", prerelease: "beta", channel: "beta" },
  ],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/changelog", { changelogFile: "CHANGELOG.md" }],
    [
      "@semantic-release/npm",
      { npmPublish: false }, // versioning only — publishing handled by existing workflows
    ],
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json"],
        message: "chore(release): ${nextRelease.version} [skip ci]",
      },
    ],
    "@semantic-release/github",
  ],
};
