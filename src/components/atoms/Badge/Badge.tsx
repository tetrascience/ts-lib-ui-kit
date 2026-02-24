import React from "react";
import styled, { css } from "styled-components";

export type BadgeSize = "small" | "medium";
export type BadgeVariant = "default" | "primary";

/** Props for the Badge component */
export interface BadgeProps {
  children: React.ReactNode;
  /** Badge size */
  size?: BadgeSize;
  /** Visual style variant */
  variant?: BadgeVariant;
  /** Whether the badge is disabled */
  disabled?: boolean;
  /** Icon rendered to the left of the badge text */
  iconLeft?: React.ReactNode;
  /** Icon rendered to the right of the badge text */
  iconRight?: React.ReactNode;
  className?: string;
}

const sizeStyles = {
  small: css`
    height: 22px;
  `,
  medium: css`
    height: 26px;
  `,
};

const variantStyles = {
  default: css`
    color: var(--black);
    background-color: var(--white);
    border: 1px solid var(--grey-300);
  `,
  primary: css`
    color: var(--blue-600);
    background-color: var(--blue-50);
    border: 1px solid var(--blue-600);
  `,
};

const StyledBadge = styled.span<{
  $size: BadgeSize;
  $variant: BadgeVariant;
  $disabled: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: "Inter", sans-serif;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
  white-space: nowrap;
  padding: 2px 8px;
  border-radius: 6px;
  user-select: none;

  ${({ $size }) => sizeStyles[$size]}
  ${({ $variant }) => variantStyles[$variant]}
  
  ${({ $disabled }) =>
    $disabled &&
    css`
      cursor: not-allowed;
      background-color: var(--white);
      border-color: var(--grey-300);
      color: var(--grey-300);
    `}
		
	svg {
    width: 16px;
    height: 16px;
  }
`;

/** A small label component used to display status, category, or metadata */
export const Badge: React.FC<BadgeProps> = ({
  children,
  size = "medium",
  variant = "default",
  disabled = false,
  iconLeft,
  iconRight,
  className,
}) => {
  return (
    <StyledBadge
      $size={size}
      $variant={variant}
      $disabled={disabled}
      className={className}
    >
      {iconLeft && iconLeft}
      {children}
      {iconRight && iconRight}
    </StyledBadge>
  );
};

export default Badge;
