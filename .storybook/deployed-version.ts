/**
 * The version the Introduction page shows: on the production Storybook
 * (ui-toolkit.tetrascience.com, built from `main`), the beta npm build
 * published from the same commit; anywhere else, package.json's version.
 *
 * package.json alone is wrong on `main`: it holds the last *released*
 * version, while what a merge to `main` actually ships is a beta named for
 * the next release (publish-public.yml → `1.2.0-beta.<run>.<attempt>`). The
 * run number only exists in GitHub Actions, and Vercel builds this Storybook
 * in parallel, so the name can't be known at build time. npm records the
 * commit each version was published from (`gitHead`), so the page asks the
 * registry for the current `beta` and checks it was built from this commit.
 */

export interface BuildInfo {
  packageName: string;
  /** package.json's version, shown when there is no matching beta. */
  packageVersion: string;
  /** Commit this Storybook was built from (Vercel's VERCEL_GIT_COMMIT_SHA). */
  gitSha?: string;
  /** Vercel's VERCEL_ENV: "production" for `main`, "preview" for PRs. */
  deployEnv?: string;
}

export interface DeployedVersion {
  version: string;
  source: "beta" | "package";
  /**
   * The newest beta was published from an earlier commit: this build's own
   * beta is still being published. Reloading in a few minutes shows it.
   */
  pending?: boolean;
}

type Fetch = (url: string) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;

/** The registry's document for the version under the `beta` dist-tag (CORS-enabled, ~10 KB). */
export function betaUrl(packageName: string): string {
  return `https://registry.npmjs.org/${packageName.replace("/", "%2f")}/beta`;
}

export async function resolveDeployedVersion(
  build: BuildInfo,
  fetchImpl: Fetch = (url) => fetch(url),
): Promise<DeployedVersion> {
  const fallback: DeployedVersion = { version: build.packageVersion, source: "package" };
  if (build.deployEnv !== "production" || !build.gitSha) return fallback;

  try {
    const response = await fetchImpl(betaUrl(build.packageName));
    if (!response.ok) return fallback;
    const { version, gitHead } = (await response.json()) as { version?: unknown; gitHead?: unknown };
    if (typeof version !== "string") return fallback;
    return gitHead === build.gitSha ? { version, source: "beta" } : { version, source: "beta", pending: true };
  } catch {
    return fallback;
  }
}
