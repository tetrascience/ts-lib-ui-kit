import { describe, expect, it, vi } from "vitest";

import {
  distTagUrl,
  isPrerelease,
  PUBLISH_WINDOW_MS,
  queriesRegistry,
  resolveDeployedVersion,
  type VersionSource,
} from "../../../.storybook/deployed-version";

const SHA = "2b4671d678e2edca63c2523ee0a823ed159d07e4";
const BUILT = 1_790_000_000_000;
const build = {
  packageName: "@tetrascience-npm/tetrascience-react-ui",
  packageVersion: "1.1.0",
  gitSha: SHA,
  deployEnv: "production",
  buildTime: BUILT,
};

/** A registry answering each dist-tag with the given document (or failing for a missing one). */
const registry = (docs: { latest?: unknown; beta?: unknown }) =>
  vi.fn(async (url: string) => {
    const doc = url.endsWith("/latest") ? docs.latest : docs.beta;
    return { ok: doc !== undefined, json: async () => doc };
  });
const olderRelease = { version: "1.1.0", gitHead: "the-release-commit" };

describe("distTagUrl", () => {
  it("escapes the scope separator the way the registry expects", () => {
    expect(distTagUrl(build.packageName, "beta")).toBe(
      "https://registry.npmjs.org/@tetrascience-npm%2ftetrascience-react-ui/beta",
    );
  });
});

describe("resolveDeployedVersion", () => {
  it("shows the beta published from this commit", async () => {
    const fetchImpl = registry({ latest: olderRelease, beta: { version: "1.2.0-beta.170.1", gitHead: SHA } });
    await expect(resolveDeployedVersion(build, fetchImpl, BUILT)).resolves.toEqual({
      version: "1.2.0-beta.170.1",
      source: "beta",
    });
    expect(fetchImpl).toHaveBeenCalledWith(distTagUrl(build.packageName, "beta"));
  });

  it("shows the release once this commit is tagged, not the beta it also published", async () => {
    const fetchImpl = registry({
      latest: { version: "1.2.0", gitHead: SHA },
      beta: { version: "1.2.0-beta.170.1", gitHead: SHA },
    });
    await expect(resolveDeployedVersion(build, fetchImpl, BUILT)).resolves.toEqual({
      version: "1.2.0",
      source: "release",
    });
  });

  it("calls an earlier commit's beta pending only while this build is recent", async () => {
    const fetchImpl = registry({ latest: olderRelease, beta: { version: "1.1.1-beta.169.1", gitHead: "earlier" } });
    await expect(resolveDeployedVersion(build, fetchImpl, BUILT + 5 * 60 * 1000)).resolves.toEqual({
      version: "1.1.1-beta.169.1",
      source: "pending",
    });
    await expect(resolveDeployedVersion(build, fetchImpl, BUILT + PUBLISH_WINDOW_MS)).resolves.toEqual({
      version: "1.1.1-beta.169.1",
      source: "earlier",
    });
    await expect(resolveDeployedVersion({ ...build, buildTime: undefined }, fetchImpl, BUILT)).resolves.toEqual({
      version: "1.1.1-beta.169.1",
      source: "earlier",
    });
  });

  it("uses package.json's version on preview and local builds, without asking the registry", async () => {
    const fetchImpl = registry({ beta: { version: "x", gitHead: SHA } });
    const expected = { version: "1.1.0", source: "package" };
    await expect(resolveDeployedVersion({ ...build, deployEnv: "preview" }, fetchImpl)).resolves.toEqual(expected);
    await expect(resolveDeployedVersion({ ...build, deployEnv: "", gitSha: "" }, fetchImpl)).resolves.toEqual(expected);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("falls back to package.json's version when the registry fails or answers oddly", async () => {
    const expected = { version: "1.1.0", source: "package" };
    await expect(resolveDeployedVersion(build, registry({}))).resolves.toEqual(expected);
    await expect(resolveDeployedVersion(build, registry({ beta: { gitHead: SHA } }))).resolves.toEqual(expected);
    await expect(
      resolveDeployedVersion(build, async () => {
        throw new TypeError("Failed to fetch");
      }),
    ).resolves.toEqual(expected);
  });

  it("still finds this commit's beta when only the latest lookup fails", async () => {
    const fetchImpl = registry({ beta: { version: "1.2.0-beta.170.1", gitHead: SHA } });
    await expect(resolveDeployedVersion(build, fetchImpl, BUILT)).resolves.toEqual({
      version: "1.2.0-beta.170.1",
      source: "beta",
    });
  });
});

describe("queriesRegistry and isPrerelease", () => {
  it("asks the registry only on the production deploy with a commit", () => {
    expect(queriesRegistry(build)).toBe(true);
    expect(queriesRegistry({ ...build, deployEnv: "preview" })).toBe(false);
    expect(queriesRegistry({ ...build, gitSha: "" })).toBe(false);
  });

  it("treats every beta state as a prerelease, and a release or package.json version as not", () => {
    const betas: VersionSource[] = ["beta", "pending", "earlier"];
    expect(betas.every((source) => isPrerelease({ version: "x", source }))).toBe(true);
    expect(isPrerelease({ version: "x", source: "release" })).toBe(false);
    expect(isPrerelease({ version: "x", source: "package" })).toBe(false);
  });
});
