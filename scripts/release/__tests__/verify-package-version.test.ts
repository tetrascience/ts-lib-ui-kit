// @vitest-environment node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { verifyRelease } from "../verify-package-version.js";

// Real git + the real analyzer; generous timeout for loaded CI runners under coverage.
describe("verifyRelease (real git repo)", { timeout: 20_000 }, () => {
  let cwd: string;
  let lastRelease: { gitHead: string; version: string };
  const logger = { log: vi.fn() };
  const git = (...args: string[]) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
  const commit = (message: string) => git("commit", "--allow-empty", "-q", "-m", message);
  const write = (name: string, contents: string) => fs.writeFileSync(path.join(cwd, name), contents);
  const prep = (version: string) => {
    write("package.json", JSON.stringify({ name: "x", version }));
    write("CHANGELOG.md", `# [${version}](c) (d)\n\nnew\n\n# [1.1.0](c) (d)\n\nold\n`);
    git("commit", "-qam", `chore: SW-9 Bump to ${version} (#9)`);
  };
  const verify = (version: string) => verifyRelease({}, { cwd, lastRelease, nextRelease: { version }, logger });

  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), "verify-version-"));
    git("init", "-q", "-b", "main");
    git("config", "user.email", "test@example.com");
    git("config", "user.name", "Test");
    git("config", "commit.gpgsign", "false");
    fs.copyFileSync(path.resolve(__dirname, "../../../release.config.js"), path.join(cwd, "release.config.js"));
    write("package.json", JSON.stringify({ name: "x", version: "1.1.0" }));
    write("CHANGELOG.md", "# [1.1.0](c) (d)\n\nold\n");
    git("add", ".");
    commit("chore: release 1.1.0");
    lastRelease = { gitHead: git("rev-parse", "HEAD"), version: "1.1.0" };
    commit("feat: SW-1 A feature (#1)");
  });

  afterEach(() => {
    fs.rmSync(cwd, { recursive: true, force: true });
  });

  it("passes when the prep PR for this release is the last releasable change", async () => {
    prep("1.2.0");
    commit("docs: SW-2 Not releasable (#2)");
    await expect(verify("1.2.0")).resolves.toBeUndefined();
    expect(logger.log).toHaveBeenCalled();
  });

  it("refuses to release when package.json still has the old version", async () => {
    await expect(verify("1.2.0")).rejects.toThrow(
      /package\.json says 1\.1\.0, but this release would be 1\.2\.0.*No tag was created/s,
    );
  });

  it("refuses when CHANGELOG.md's newest entry is for another version", async () => {
    write("package.json", JSON.stringify({ name: "x", version: "1.2.0" }));
    git("commit", "-qam", "chore: SW-9 Bump package.json only (#9)");
    await expect(verify("1.2.0")).rejects.toThrow(
      /CHANGELOG\.md's newest entry is 1\.1\.0, but this release would be 1\.2\.0/,
    );
  });

  it("refuses when a releasable commit merged after the prep PR, even with the version unchanged", async () => {
    prep("1.2.0");
    commit("fix: SW-3 A late fix (#3)");
    await expect(verify("1.2.0")).rejects.toThrow(
      /merged after the 1\.2\.0 CHANGELOG entry was written.*\n {2}[0-9a-f]{7} fix: SW-3 A late fix \(#3\)\n.*Release prep/s,
    );
  });

  it("checks the whole history on a first release", async () => {
    prep("1.2.0");
    await expect(verifyRelease({}, { cwd, nextRelease: { version: "1.2.0" }, logger })).resolves.toBeUndefined();
  });
});
