// @vitest-environment node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { verifyRelease } from "../verify-package-version.js";

describe("verifyRelease", () => {
  let cwd: string;
  const logger = { log: vi.fn() };
  const withVersion = (version: string) =>
    fs.writeFileSync(path.join(cwd, "package.json"), JSON.stringify({ name: "x", version }));

  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), "verify-version-"));
  });

  afterEach(() => {
    fs.rmSync(cwd, { recursive: true, force: true });
  });

  it("passes when the prep PR already bumped package.json", async () => {
    withVersion("1.2.0");
    await expect(verifyRelease({}, { cwd, nextRelease: { version: "1.2.0" }, logger })).resolves.toBeUndefined();
    expect(logger.log).toHaveBeenCalled();
  });

  it("refuses to release when package.json still has the old version", async () => {
    withVersion("1.1.0");
    await expect(verifyRelease({}, { cwd, nextRelease: { version: "1.2.0" }, logger })).rejects.toThrow(
      /package\.json says 1\.1\.0, but this release would be 1\.2\.0.*No tag was created/,
    );
  });
});
