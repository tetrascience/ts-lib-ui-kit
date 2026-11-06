/**
 * The version the Introduction page shows: on the production Storybook
 * (ui-toolkit.tetrascience.com, built from `main`), the npm build published
 * from the same commit; anywhere else, package.json's version.
 *
 * package.json alone is wrong on `main`: it holds the last *released*
 * version, while what a merge to `main` actually ships is a beta named for
 * the next release (publish-public.yml → `1.2.0-beta.3`). Its number comes
 * from the tags and history Vercel's shallow clone doesn't have, and Vercel
 * builds this Storybook in parallel with the publish, which can fail, so
 * the name isn't worked out at build time. npm records the
 * commit each version was published from (`gitHead`), so the page asks the
 * registry for the current `latest` and `beta` and checks which, if either,
 * was built from this commit.
 */

export interface BuildInfo {
  packageName: string;
  /** package.json's version, shown when there is nothing better. */
  packageVersion: string;
  /** Commit this Storybook was built from (Vercel's VERCEL_GIT_COMMIT_SHA). */
  gitSha?: string;
  /** Vercel's VERCEL_ENV: "production" for `main`, "preview" for PRs. */
  deployEnv?: string;
  /** When this Storybook was built, in ms since the epoch. */
  buildTime?: number;
}

/**
 * - `release`: the `latest` release was tagged on this commit.
 * - `beta`: the `beta` build was published from this commit.
 * - `pending`: the newest beta is from an earlier commit and this build is
 *   recent, so its own beta is most likely still publishing.
 * - `earlier`: the newest beta is from an earlier commit and this build is
 *   not recent: this commit's beta failed, or the deployment is behind.
 * - `package`: not the production deploy, or the registry didn't answer.
 */
export type VersionSource = "release" | "beta" | "pending" | "earlier" | "package";

export interface DeployedVersion {
  version: string;
  source: VersionSource;
}

/** How long a beta publish (install, build, test, publish) takes, generously. */
export const PUBLISH_WINDOW_MS = 3_600_000; // 1 hour

type Fetch = (url: string) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;

/** The registry's document for the version under a dist-tag (CORS-enabled, ~10 KB). */
export function distTagUrl(packageName: string, tag: "latest" | "beta"): string {
  return `https://registry.npmjs.org/${packageName.replace("/", "%2f")}/${tag}`;
}

/** Whether this build asks the registry; when it doesn't, the version is known synchronously. */
export function queriesRegistry(build: BuildInfo): boolean {
  return build.deployEnv === "production" && Boolean(build.gitSha);
}

/** Whether a version is a prerelease that `yarn add <pkg>` (the `latest` tag) would not install. */
export function isPrerelease({ source }: DeployedVersion): boolean {
  return source === "beta" || source === "pending" || source === "earlier";
}

async function published(fetchImpl: Fetch, url: string): Promise<{ version: string; gitHead?: unknown } | undefined> {
  try {
    const response = await fetchImpl(url);
    if (!response.ok) return undefined;
    const { version, gitHead } = (await response.json()) as { version?: unknown; gitHead?: unknown };
    return typeof version === "string" ? { version, gitHead } : undefined;
  } catch {
    return undefined;
  }
}

export async function resolveDeployedVersion(
  build: BuildInfo,
  fetchImpl: Fetch = (url) => fetch(url),
  now: number = Date.now(),
): Promise<DeployedVersion> {
  const fallback: DeployedVersion = { version: build.packageVersion, source: "package" };
  if (!queriesRegistry(build)) return fallback;

  const [latest, beta] = await Promise.all([
    published(fetchImpl, distTagUrl(build.packageName, "latest")),
    published(fetchImpl, distTagUrl(build.packageName, "beta")),
  ]);
  if (latest?.gitHead === build.gitSha) return { version: latest.version, source: "release" };
  if (!beta) return fallback;
  if (beta.gitHead === build.gitSha) return { version: beta.version, source: "beta" };
  const recent = build.buildTime !== undefined && now - build.buildTime < PUBLISH_WINDOW_MS;
  return { version: beta.version, source: recent ? "pending" : "earlier" };
}
