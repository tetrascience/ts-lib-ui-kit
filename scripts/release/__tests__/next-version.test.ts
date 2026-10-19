// @vitest-environment node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { bumpVersion, commitAnalyzerConfig, computeNextVersion, lastReleaseTag, parseGitLog } from "../next-version";

describe("bumpVersion", () => {
  it("bumps each part and resets the lower ones", () => {
    expect(bumpVersion("1.1.0", "patch")).toBe("1.1.1");
    expect(bumpVersion("1.1.3", "minor")).toBe("1.2.0");
    expect(bumpVersion("1.2.3", "major")).toBe("2.0.0");
  });

  it("rejects anything but a plain X.Y.Z", () => {
    expect(() => bumpVersion("1.1.0-beta.1", "patch")).toThrow(/plain X\.Y\.Z/);
    expect(() => bumpVersion("v1.1.0", "patch")).toThrow(/plain X\.Y\.Z/);
  });
});

describe("commitAnalyzerConfig", () => {
  it("returns the analyzer's options from a [name, options] entry", () => {
    expect(
      commitAnalyzerConfig([
        "./local-plugin.js",
        ["@semantic-release/commit-analyzer", { preset: "conventionalcommits" }],
      ]),
    ).toEqual({ preset: "conventionalcommits" });
  });

  it("returns empty options for a bare name", () => {
    expect(commitAnalyzerConfig(["@semantic-release/commit-analyzer"])).toEqual({});
  });

  it("throws when the analyzer is missing", () => {
    expect(() => commitAnalyzerConfig(["@semantic-release/github"])).toThrow(/no @semantic-release\/commit-analyzer/);
  });

  it("reads the repo's real release.config.js", async () => {
    const config = (await import("../../../release.config.js")) as { default: { plugins: unknown[] } };
    expect(commitAnalyzerConfig(config.default.plugins)).toEqual({ preset: "conventionalcommits" });
  });
});

describe("parseGitLog", () => {
  it("splits records and keeps multi-line bodies", () => {
    const out = "aaa\u001Ffeat: one\u001E\nbbb\u001Ffix: two\n\nBREAKING CHANGE: x\n\u001E\n";
    expect(parseGitLog(out)).toEqual([
      { hash: "aaa", message: "feat: one" },
      { hash: "bbb", message: "fix: two\n\nBREAKING CHANGE: x" },
    ]);
  });

  it("returns nothing for empty output", () => {
    expect(parseGitLog("")).toEqual([]);
  });
});

// Real git + the real analyzer; generous timeout for loaded CI runners under coverage.
describe("computeNextVersion (real git repo)", { timeout: 20_000 }, () => {
  let dir: string;
  const git = (...args: string[]) => execFileSync("git", args, { cwd: dir, encoding: "utf8" });
  const commit = (message: string) => git("commit", "--allow-empty", "-q", "-m", message);

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "next-version-"));
    git("init", "-q", "-b", "main");
    git("config", "user.email", "test@example.com");
    git("config", "user.name", "Test");
    git("config", "commit.gpgsign", "false");
    git("config", "tag.gpgsign", "false");
    fs.copyFileSync(path.resolve(__dirname, "../../../release.config.js"), path.join(dir, "release.config.js"));
    commit("chore: initial");
    git("tag", "v1.0.0");
    commit("feat: SW-1 first feature (#1)");
    git("tag", "v1.1.0");
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("ignores prerelease tags when finding the last release", () => {
    git("tag", "v1.2.0-beta.1");
    expect(lastReleaseTag(dir)).toBe("v1.1.0");
  });

  it("is a minor bump after a feat: merge", async () => {
    commit("fix: SW-2 a fix (#2)");
    commit("feat: SW-3 a feature (#3)");
    await expect(computeNextVersion(dir)).resolves.toBe("1.2.0");
  });

  it("is a patch bump after only fix: merges", async () => {
    commit("fix: SW-2 a fix (#2)");
    await expect(computeNextVersion(dir)).resolves.toBe("1.1.1");
  });

  it("is a major bump for feat!: (the conventionalcommits preset is applied)", async () => {
    commit("feat!: SW-4 drop an API (#4)");
    await expect(computeNextVersion(dir)).resolves.toBe("2.0.0");
  });

  it("falls back to a patch bump when nothing since the tag would release", async () => {
    commit("chore: SW-5 bump deps (#5)");
    commit("docs: SW-6 readme (#6)");
    await expect(computeNextVersion(dir)).resolves.toBe("1.1.1");
  });

  it("is a patch bump at the tagged commit itself", async () => {
    await expect(computeNextVersion(dir)).resolves.toBe("1.1.1");
  });

  it("explains a missing tag", async () => {
    git("tag", "-d", "v1.0.0", "v1.1.0");
    await expect(computeNextVersion(dir)).rejects.toThrow(/No vX\.Y\.Z tag/);
  });
});
