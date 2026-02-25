import React, { createContext, useContext, useMemo } from "react";
import styled from "styled-components";

import {
  buildTdpUrl,
  getTdpBaseUrlFromApiEndpoint,
  getTdpBaseUrlFromReferrer,
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

export const TdpNavigationContext =
  createContext<TdpNavigationContextValue | null>(null);

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

/** Props for the TDPLink component */
export interface TDPLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  /** TDP page path (e.g., "/file/abc-123" or use tdpPaths helpers) */
  path: string;
  /** Navigation behavior. Default: { newTab: true } */
  navigationOptions?: TdpNavigationOptions;
  children: React.ReactNode;
  ref?: React.Ref<HTMLAnchorElement>;
}

const StyledLink = styled.a`
  color: var(--theme-primary, var(--blue-600));
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid var(--blue-600);
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

/**
 * A link component that navigates to TDP pages.
 *
 * Renders a standard `<a>` tag with the correct href for right-click
 * "Open in new tab" support, accessibility, and SEO.
 *
 * Must be used inside a `<TdpNavigationProvider>`.
 *
 * @example
 * ```tsx
 * import { TDPLink, tdpPaths } from '@tetrascience-npm/tetrascience-react-ui';
 *
 * <TDPLink path={tdpPaths.fileDetails("abc-123")}>
 *   View File Details
 * </TDPLink>
 *
 * <TDPLink path="/search?q=test" navigationOptions={{ newTab: false }}>
 *   Search in TDP (same tab)
 * </TDPLink>
 * ```
 */
export const TDPLink: React.FC<TDPLinkProps> = ({
  path,
  navigationOptions = { newTab: true },
  children,
  onClick,
  ...rest
}) => {
  const { getTdpUrl, navigateToTdp } = useTdpNavigationContext();
  const href = getTdpUrl(path);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let modifier-key clicks through for native "open in new tab" behavior
    if (e.metaKey || e.ctrlKey || e.shiftKey) {
      return;
    }

    e.preventDefault();
    onClick?.(e);
    navigateToTdp(path, navigationOptions);
  };

  return (
    <StyledLink
      href={href ?? "#"}
      target={navigationOptions.newTab ? "_blank" : undefined}
      rel={navigationOptions.newTab ? "noopener noreferrer" : undefined}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </StyledLink>
  );
};
