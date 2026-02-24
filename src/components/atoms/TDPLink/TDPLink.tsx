import { useTdpNavigationContext } from "@utils/navigation/TdpNavigationContext";
import React from "react";
import styled from "styled-components";

import type { TdpNavigationOptions } from "@utils/navigation/tdpUrl";

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
