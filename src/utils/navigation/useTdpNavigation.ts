import { useMemo } from "react";

import {
  getTdpBaseUrlFromReferrer,
  getTdpBaseUrlFromApiEndpoint,
  buildTdpUrl,
  navigateToTdpUrl,
} from "./tdpUrl";

import type { TdpNavigationOptions } from "./tdpUrl";

export interface UseTdpNavigationOptions {
  /** TDP API endpoint URL (fallback for local dev) */
  tdpApiUrl?: string;
  /** Explicit TDP base URL override */
  tdpBaseUrl?: string;
}

export interface UseTdpNavigationReturn {
  /** The resolved TDP base URL, or null */
  tdpBaseUrl: string | null;
  /** Construct a full TDP URL from a path */
  getTdpUrl: (path: string) => string | null;
  /** Navigate to a TDP page */
  navigateToTdp: (path: string, options?: TdpNavigationOptions) => void;
}

/**
 * Standalone hook for TDP navigation (no provider required).
 *
 * For simple use cases where you don't need a TdpNavigationProvider.
 * If multiple components need navigation, prefer the provider approach.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { getTdpUrl, navigateToTdp } = useTdpNavigation({
 *     tdpApiUrl: "https://api.tetrascience.com/v1",
 *   });
 *
 *   return (
 *     <a href={getTdpUrl("/file/abc") ?? "#"} target="_blank" rel="noopener noreferrer">
 *       View File
 *     </a>
 *   );
 * }
 * ```
 */
export function useTdpNavigation(
  options: UseTdpNavigationOptions = {},
): UseTdpNavigationReturn {
  const { tdpApiUrl, tdpBaseUrl: explicitBaseUrl } = options;

  const tdpBaseUrl = useMemo(() => {
    if (explicitBaseUrl) return explicitBaseUrl.replace(/\/$/u, "");
    const fromReferrer = getTdpBaseUrlFromReferrer();
    if (fromReferrer) return fromReferrer;
    if (tdpApiUrl) return getTdpBaseUrlFromApiEndpoint(tdpApiUrl);
    return null;
  }, [explicitBaseUrl, tdpApiUrl]);

  return useMemo(
    () => ({
      tdpBaseUrl,
      getTdpUrl: (path: string) =>
        tdpBaseUrl ? buildTdpUrl(tdpBaseUrl, path) : null,
      navigateToTdp: (path: string, opts?: TdpNavigationOptions) => {
        if (!tdpBaseUrl) {
          console.warn(
            "[useTdpNavigation] Cannot navigate: TDP base URL not resolved",
          );
          return;
        }
        const url = buildTdpUrl(tdpBaseUrl, path);
        if (url) navigateToTdpUrl(url, opts);
      },
    }),
    [tdpBaseUrl],
  );
}
