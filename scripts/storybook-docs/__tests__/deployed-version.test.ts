import { describe, expect, it, vi } from "vitest";

import { betaUrl, resolveDeployedVersion } from "../../../.storybook/deployed-version";

const SHA = "2b4671d678e2edca63c2523ee0a823ed159d07e4";
const build = {
  packageName: "@tetrascience-npm/tetrascience-react-ui",
  packageVersion: "1.1.0",
  gitSha: SHA,
  deployEnv: "production",
};
const registry = (body: unknown, ok = true) => vi.fn(async () => ({ ok, json: async () => body }));

describe("betaUrl", () => {
  it("escapes the scope separator the way the registry expects", () => {
    expect(betaUrl(build.packageName)).toBe(
      "https://registry.npmjs.org/@tetrascience-npm%2ftetrascience-react-ui/beta",
    );
  });
});

describe("resolveDeployedVersion", () => {
  it("shows the beta published from this commit", async () => {
    const fetchImpl = registry({ version: "1.2.0-beta.170.1", gitHead: SHA });
    await expect(resolveDeployedVersion(build, fetchImpl)).resolves.toEqual({
      version: "1.2.0-beta.170.1",
      source: "beta",
    });
    expect(fetchImpl).toHaveBeenCalledWith(betaUrl(build.packageName));
  });

  it("shows the newest beta as pending while this commit's beta is still publishing", async () => {
    const fetchImpl = registry({ version: "1.1.0-beta.169.1", gitHead: "an-earlier-commit" });
    await expect(resolveDeployedVersion(build, fetchImpl)).resolves.toEqual({
      version: "1.1.0-beta.169.1",
      source: "beta",
      pending: true,
    });
  });

  it("uses package.json's version on preview and local builds, without asking the registry", async () => {
    const fetchImpl = registry({ version: "x", gitHead: SHA });
    const expected = { version: "1.1.0", source: "package" };
    await expect(resolveDeployedVersion({ ...build, deployEnv: "preview" }, fetchImpl)).resolves.toEqual(expected);
    await expect(resolveDeployedVersion({ ...build, deployEnv: "", gitSha: "" }, fetchImpl)).resolves.toEqual(expected);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("falls back to package.json's version when the registry fails or answers oddly", async () => {
    const expected = { version: "1.1.0", source: "package" };
    await expect(resolveDeployedVersion(build, registry({}, false))).resolves.toEqual(expected);
    await expect(resolveDeployedVersion(build, registry({ gitHead: SHA }))).resolves.toEqual(expected);
    await expect(
      resolveDeployedVersion(build, async () => {
        throw new TypeError("Failed to fetch");
      }),
    ).resolves.toEqual(expected);
  });
});
