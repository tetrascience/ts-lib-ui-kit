/**
 * TDP Navigation Utilities
 *
 * Pure utility functions for constructing and navigating to TDP URLs.
 * These work independently of React and can be used in any context.
 *
 * Data apps run inside iframes within TDP. These utilities help resolve
 * the TDP base URL from the iframe context and construct navigation URLs.
 */

/**
 * Known TDP route prefixes. When found in a referrer URL's pathname,
 * everything from the prefix onward is stripped to derive the TDP base URL.
 */
const TDP_ROUTE_PREFIXES = [
  "/data-workspace",
  "/data-apps",
  "/pipelines",
  "/pipeline-edit/",
  "/pipeline-details/",
  "/pipeline-processing/",
  "/file/",
  "/file-details/",
  "/files",
  "/search",
  "/search-classic",
  "/artifacts/",
  "/admin",
  "/settings",
  "/agent-studio",
] as const;

/**
 * Extract the TDP base URL from `document.referrer`.
 *
 * In production, data apps run inside iframes within TDP. The browser
 * provides `document.referrer` containing the parent TDP page URL.
 * This function strips the known route path to get the base URL
 * (origin + org slug path prefix).
 *
 * @example
 * // referrer: "https://tetrascience-uat.com/my-org/data-workspace/abc"
 * getTdpBaseUrlFromReferrer() // "https://tetrascience-uat.com/my-org"
 *
 * @returns The TDP base URL, or null if detection fails
 */
export function getTdpBaseUrlFromReferrer(): string | null {
  if (typeof document === "undefined" || !document.referrer) {
    return null;
  }

  try {
    const referrerUrl = new URL(document.referrer);
    const pathname = referrerUrl.pathname;

    for (const prefix of TDP_ROUTE_PREFIXES) {
      const prefixIndex = pathname.indexOf(prefix);
      if (prefixIndex !== -1) {
        const basePath = pathname.slice(0, prefixIndex).replace(/\/$/u, "");
        return `${referrerUrl.origin}${basePath}`;
      }
    }

    // No known route matched — return origin (handles TDP root pages)
    return referrerUrl.origin;
  } catch {
    return null;
  }
}

/**
 * Convert a TDP API endpoint URL to the corresponding web platform URL.
 *
 * @example
 * getTdpBaseUrlFromApiEndpoint("https://api.tetrascience.com/v1")
 * // "https://tetrascience.com"
 *
 * @param apiUrl - The TDP API endpoint URL (e.g., TDP_ENDPOINT env var)
 * @returns The TDP web base URL, or null if conversion fails
 */
export function getTdpBaseUrlFromApiEndpoint(apiUrl: string): string | null {
  if (!apiUrl) {
    return null;
  }

  try {
    const url = new URL(apiUrl);
    const webHostname = url.hostname.startsWith("api.")
      ? url.hostname.slice(4)
      : url.hostname;
    return `${url.protocol}//${webHostname}`;
  } catch {
    return null;
  }
}

/**
 * Construct a full TDP URL by joining a base URL with a path.
 *
 * @example
 * buildTdpUrl("https://tetrascience.com/my-org", "/file/abc-123")
 * // "https://tetrascience.com/my-org/file/abc-123"
 *
 * @param baseUrl - The TDP base URL (origin + optional org prefix)
 * @param path - The TDP page path (e.g., "/file/abc-123")
 * @returns The full TDP URL, or null if construction fails
 */
export function buildTdpUrl(baseUrl: string, path: string): string | null {
  try {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(baseUrl);
    url.pathname = `${url.pathname.replace(/\/$/u, "")}${normalizedPath}`;
    return url.href;
  } catch {
    return null;
  }
}

export interface TdpNavigationOptions {
  /** Open in a new tab instead of navigating the parent TDP frame. Default: false */
  newTab?: boolean;
}

/**
 * Navigate to a TDP URL.
 *
 * - `{ newTab: true }` opens the URL in a new browser tab.
 * - Default: sends a `postMessage` to the parent TDP frame (same-tab navigation
 *   when inside an iframe), or navigates the current window (standalone).
 *
 * @param url - Full TDP URL to navigate to
 * @param options - Navigation options
 */
export function navigateToTdpUrl(
  url: string,
  options: TdpNavigationOptions = {},
): void {
  if (options.newTab) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  // In iframe context, use postMessage to navigate the parent TDP frame
  if (window.parent !== window) {
    try {
      const tdpUrl = new URL(url);
      const relativePath = `${tdpUrl.pathname}${tdpUrl.search}${tdpUrl.hash}`;
      window.parent.postMessage({ type: "navigate", path: relativePath }, "*");
      return;
    } catch {
      // Fall through to direct navigation
    }
  }

  // Fallback: direct navigation (local dev or non-iframe)
  window.location.href = url;
}

/**
 * Convenience helpers for constructing common TDP page paths.
 * Returns path strings for use with `getTdpUrl()` or `buildTdpUrl()`.
 *
 * @example
 * const { getTdpUrl } = useTdpNavigation({ tdpApiUrl });
 * const url = getTdpUrl(tdpPaths.fileDetails("abc-123"));
 */
export const tdpPaths = {
  fileDetails: (fileId: string) => `/file/${fileId}`,
  pipelineEdit: (pipelineId: string) => `/pipeline-edit/${pipelineId}`,
  pipelineDetails: (pipelineId: string) =>
    `/pipeline-details/${pipelineId}`,
  search: (query?: string) =>
    query ? `/search?q=${encodeURIComponent(query)}` : "/search",
  dataWorkspace: () => "/data-workspace",
  dataApps: () => "/data-apps",
  artifact: (type: string, namespace: string, slug: string) =>
    `/artifacts/${type}/${namespace}/${slug}`,
} as const;
