// @vitest-environment node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { prependChangelog, prepareRelease, setPackageVersion, updateReadme } from "../prepare-release";

const README = `# kit

## Version

v1.1.0

## Compatibility

| Library version | React | Node.js |
| --------------- | ----- | ------- |
| v1.1.x          | 19+   | 18+     |
| v1.0.x          | 19+   | 18+     |
`;

describe("setPackageVersion", () => {
  it("changes only the version", () => {
    const pkg = '{\n  "name": "x",\n  "version": "1.1.0",\n  "dependencies": { "y": "1.0.0" }\n}\n';
    expect(setPackageVersion(pkg, "1.2.0")).toBe(pkg.replace('"version": "1.1.0"', '"version": "1.2.0"'));
  });

  it("throws without a version field", () => {
    expect(() => setPackageVersion('{ "name": "x" }', "1.2.0")).toThrow(/no top-level "version"/);
  });
});

describe("prependChangelog", () => {
  const notes = "## [1.2.0](compare) (2026-10-19)\n\n### Features\n\n* thing\n";

  it("puts the entry on top with the file's # heading", () => {
    const { changelog, replaced } = prependChangelog("# [1.1.0](c) (d)\n\nold\n", notes, "1.1.0");
    expect(changelog).toBe("# [1.2.0](compare) (2026-10-19)\n\n### Features\n\n* thing\n\n# [1.1.0](c) (d)\n\nold\n");
    expect(replaced).toBeUndefined();
  });

  it("replaces an entry for a version that was never released, and returns it", () => {
    const existing = "# [1.1.1](c) (d)\n\nHand-written note\n\n# [1.1.0](c) (d)\n\nold\n";
    const { changelog, replaced } = prependChangelog(existing, notes, "1.1.0");
    expect(changelog).toBe("# [1.2.0](compare) (2026-10-19)\n\n### Features\n\n* thing\n\n# [1.1.0](c) (d)\n\nold\n");
    expect(replaced).toBe("# [1.1.1](c) (d)\n\nHand-written note");
  });

  it("handles a file whose only entry is unreleased", () => {
    const { changelog, replaced } = prependChangelog("## [0.1.0](c)\n\nfirst\n", notes, "0.0.0");
    expect(changelog.trim()).toBe(notes.trim().replace("## [", "# ["));
    expect(replaced).toBe("## [0.1.0](c)\n\nfirst");
  });
});

describe("updateReadme", () => {
  it("updates the version line and adds a row for a new minor line", () => {
    const next = updateReadme(README, "1.2.0");
    expect(next).toContain("## Version\n\nv1.2.0\n");
    expect(next).toContain("| v1.2.x          | 19+   | 18+     |\n| v1.1.x          | 19+   | 18+     |");
  });

  it("adds no row for a patch", () => {
    const next = updateReadme(README, "1.1.1");
    expect(next).toContain("v1.1.1\n");
    expect(next.match(/\| v1\.1\.x/g)).toHaveLength(1);
    expect(next).not.toContain("v1.2.x");
  });

  it("does not duplicate an existing row", () => {
    const once = updateReadme(README, "1.2.0");
    expect(updateReadme(once, "1.2.0")).toBe(once);
  });

  it("throws without a Version line", () => {
    expect(() => updateReadme("# kit\n", "1.2.0")).toThrow(/"## Version"/);
  });
});

describe("prepareRelease (real git repo)", { timeout: 30_000 }, () => {
  let dir: string;
  const git = (...args: string[]) => execFileSync("git", args, { cwd: dir, encoding: "utf8" });
  const commit = (message: string) => git("commit", "--allow-empty", "-q", "-m", message);
  const read = (name: string) => fs.readFileSync(path.join(dir, name), "utf8");

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "prepare-release-"));
    git("init", "-q", "-b", "main");
    git("config", "user.email", "test@example.com");
    git("config", "user.name", "Test");
    git("config", "commit.gpgsign", "false");
    git("config", "tag.gpgsign", "false");
    fs.copyFileSync(path.resolve(__dirname, "../../../release.config.js"), path.join(dir, "release.config.js"));
    fs.writeFileSync(path.join(dir, "package.json"), '{\n  "name": "kit",\n  "version": "1.1.0"\n}\n');
    fs.writeFileSync(path.join(dir, "CHANGELOG.md"), "# [1.1.0](c) (d)\n\nold entry\n");
    fs.writeFileSync(path.join(dir, "README.md"), README);
    git("add", ".");
    commit("chore: initial");
    git("tag", "v1.1.0");
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("bumps package.json, README and CHANGELOG from the commits since the tag", async () => {
    commit("feat: SW-1 A feature (#1)");
    commit("fix: SW-2 A fix (#2)");
    commit("chore: SW-3 Not in the notes (#3)");

    const { version, notes, replaced } = await prepareRelease(dir);

    expect(version).toBe("1.2.0");
    expect(replaced).toBeUndefined();
    expect(JSON.parse(read("package.json")).version).toBe("1.2.0");
    expect(read("README.md")).toContain("v1.2.0\n");

    const changelog = read("CHANGELOG.md");
    expect(changelog).toMatch(
      /^# \[1\.2\.0\]\(https:\/\/github\.com\/tetrascience\/ts-lib-ui-kit\/compare\/v1\.1\.0\.\.\.v1\.2\.0\)/,
    );
    expect(changelog).toContain("### Features\n\n- SW-1 A feature");
    expect(changelog).toContain("### Bug Fixes\n\n- SW-2 A fix");
    expect(changelog).not.toContain("SW-3");
    expect(changelog).toContain("# [1.1.0](c) (d)\n\nold entry\n");
    expect(notes).toContain("SW-1 A feature");
  });

  it("replaces a merged-but-unreleased prep entry when the version moved on", async () => {
    commit("fix: SW-2 A fix (#2)");
    await prepareRelease(dir); // 1.1.1 prep
    git("commit", "-qam", "chore: SW-4 Bump to 1.1.1 (#4)");
    commit("feat: SW-1 A feature (#1)");

    const { version, replaced } = await prepareRelease(dir);

    expect(version).toBe("1.2.0");
    expect(replaced).toMatch(/^# \[1\.1\.1\]/);
    const changelog = read("CHANGELOG.md");
    expect(changelog).not.toContain("[1.1.1]");
    expect(changelog).toContain("SW-2 A fix");
    expect(changelog).toContain("SW-1 A feature");
  });

  it("refuses when nothing since the tag would release", async () => {
    commit("docs: SW-5 Readme (#5)");
    await expect(prepareRelease(dir)).rejects.toThrow(/Nothing to release: no commit since v1\.1\.0/);
    expect(JSON.parse(read("package.json")).version).toBe("1.1.0");
  });
});
