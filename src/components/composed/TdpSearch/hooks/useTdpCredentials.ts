/**
 * Resolves TDP auth credentials with the following priority:
 *   1. Explicitly passed props
 *   2. localStorage
 *   3. Browser cookies
 */

import { AUTH_TOKEN_HEADER, ORG_SLUG_HEADER } from "../constants";

function readLocalStorage(key: string): string | undefined {
  try {
    return localStorage.getItem(key) ?? undefined;
  } catch {
    return undefined;
  }
}

function readCookie(name: string): string | undefined {
  try {
    const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : undefined;
  } catch {
    return undefined;
  }
}

export interface TdpCredentials {
  authToken: string | undefined;
  orgSlug: string | undefined;
}

/**
 * Resolves TDP auth credentials from explicit props → localStorage → cookies
 */
export function useTdpCredentials(explicitToken?: string, explicitOrgSlug?: string): TdpCredentials {
  if (explicitToken && explicitOrgSlug) {
    return { authToken: explicitToken, orgSlug: explicitOrgSlug };
  }

  const lsToken = readLocalStorage(AUTH_TOKEN_HEADER);
  const lsOrgSlug = readLocalStorage(ORG_SLUG_HEADER);
  if (lsToken && lsOrgSlug) {
    return { authToken: lsToken, orgSlug: lsOrgSlug };
  }

  const cookieToken = readCookie(AUTH_TOKEN_HEADER);
  const cookieOrgSlug = readCookie(ORG_SLUG_HEADER);
  if (cookieToken && cookieOrgSlug) {
    return { authToken: cookieToken, orgSlug: cookieOrgSlug };
  }

  return { authToken: explicitToken, orgSlug: explicitOrgSlug };
}
