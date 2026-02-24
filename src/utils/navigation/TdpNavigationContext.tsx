import React, { createContext, useContext, useMemo } from "react";

import {
  getTdpBaseUrlFromReferrer,
  getTdpBaseUrlFromApiEndpoint,
  buildTdpUrl,
  navigateToTdpUrl,
} from "./tdpUrl";

import type { TdpNavigationOptions } from "./tdpUrl";

export interface TdpNavigationContextValue {
  /** The resolved TDP base URL (origin + org path prefix), or null if not resolved */
  tdpBaseUrl: string | null;
  /** Construct a full TDP URL from a path. Returns null if base URL is not resolved. */
  getTdpUrl: (path: string) => string | null;
  /** Navigate to a TDP page. */
  navigateToTdp: (path: string, options?: TdpNavigationOptions) => void;
}

const TdpNavigationContext = createContext<TdpNavigationContextValue | null>(
  null,
);

/** Props for the TdpNavigationProvider component */
export interface TdpNavigationProviderProps {
  /**
   * TDP API endpoint URL (e.g., from TDP_ENDPOINT env var).
   * Used as a fallback when document.referrer is not available (local dev).
   */
  tdpApiUrl?: string;
  /**
   * Explicit TDP base URL override. Skips all auto-detection when provided.
   */
  tdpBaseUrl?: string;
  children: React.ReactNode;
}

/**
 * Provider that resolves the TDP base URL and exposes navigation helpers.
 *
 * Resolution order:
 * 1. Explicit `tdpBaseUrl` prop (if provided)
 * 2. `document.referrer` parsing (production iframe)
 * 3. `tdpApiUrl` conversion (local development fallback)
 *
 * @example
 * ```tsx
 * <TdpNavigationProvider tdpApiUrl={config.tdpEndpoint}>
 *   <App />
 * </TdpNavigationProvider>
 * ```
 */
export const TdpNavigationProvider: React.FC<TdpNavigationProviderProps> = ({
  tdpApiUrl,
  tdpBaseUrl: explicitBaseUrl,
  children,
}) => {
  const tdpBaseUrl = useMemo(() => {
    if (explicitBaseUrl) {
      return explicitBaseUrl.replace(/\/$/u, "");
    }
    const fromReferrer = getTdpBaseUrlFromReferrer();
    if (fromReferrer) {
      return fromReferrer;
    }
    if (tdpApiUrl) {
      return getTdpBaseUrlFromApiEndpoint(tdpApiUrl);
    }
    return null;
  }, [explicitBaseUrl, tdpApiUrl]);

  const contextValue = useMemo<TdpNavigationContextValue>(
    () => ({
      tdpBaseUrl,
      getTdpUrl: (path: string) => {
        if (!tdpBaseUrl) return null;
        return buildTdpUrl(tdpBaseUrl, path);
      },
      navigateToTdp: (path: string, options?: TdpNavigationOptions) => {
        if (!tdpBaseUrl) {
          console.warn(
            "[TdpNavigation] Cannot navigate: TDP base URL not resolved",
          );
          return;
        }
        const url = buildTdpUrl(tdpBaseUrl, path);
        if (url) {
          navigateToTdpUrl(url, options);
        }
      },
    }),
    [tdpBaseUrl],
  );

  return (
    <TdpNavigationContext.Provider value={contextValue}>
      {children}
    </TdpNavigationContext.Provider>
  );
};

/**
 * Access TDP navigation helpers from the nearest TdpNavigationProvider.
 *
 * @throws Error if used outside a TdpNavigationProvider
 *
 * @example
 * ```tsx
 * const { getTdpUrl, navigateToTdp } = useTdpNavigationContext();
 * ```
 */
export function useTdpNavigationContext(): TdpNavigationContextValue {
  const context = useContext(TdpNavigationContext);
  if (!context) {
    throw new Error(
      "useTdpNavigationContext must be used within a TdpNavigationProvider. " +
        "Wrap your app with <TdpNavigationProvider> or use the standalone useTdpNavigation() hook instead.",
    );
  }
  return context;
}
