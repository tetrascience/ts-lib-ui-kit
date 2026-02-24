import React from "react";
import styled, { css } from "styled-components";

export type CardSize = "small" | "medium" | "large";
export type CardVariant = "default" | "outlined" | "elevated";

/** Props for the Card component */
export interface CardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  children: React.ReactNode;
  /** Optional title displayed in the card header */
  title?: React.ReactNode;
  /** Card padding size */
  size?: CardSize;
  /** Visual style variant */
  variant?: CardVariant;
  className?: string;
  /** Whether the card should stretch to fill its container width */
  fullWidth?: boolean;
  ref?: React.Ref<HTMLDivElement>;
}

const sizeStyles = {
  small: css`
    padding: 12px;
  `,
  medium: css`
    padding: 16px;
  `,
  large: css`
    padding: 20px;
  `,
};

const variantStyles = {
  default: css`
    background-color: var(--theme-cardBackground, var(--white-900));
    border: 1px solid var(--theme-cardBorder, var(--grey-200));
  `,
  outlined: css`
    background-color: var(--theme-cardBackground, var(--white-900));
    border: 1px solid var(--theme-cardBorder, var(--grey-200));
  `,
  elevated: css`
    background-color: var(--theme-cardBackground, var(--white-900));
    border: 1px solid var(--theme-cardBorder, var(--grey-200));
    box-shadow: 0px 2px 4px var(--black-100);
  `,
};

const CardContainer = styled.div<{
  $size: CardSize;
  $variant: CardVariant;
  $fullWidth?: boolean;
}>`
  border-radius: var(--theme-radius-large, 16px);
  width: ${(props) => (props.$fullWidth ? "100%" : "auto")};
  ${(props) => variantStyles[props.$variant]}
  transition: all 0.2s ease;
`;

const CardTitle = styled.div<{
  $size: CardSize;
}>`
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px;
  background-color: var(--grey-50);
  border-top-left-radius: var(--theme-radius-large, 16px);
  border-top-right-radius: var(--theme-radius-large, 16px);
  ${(props) => sizeStyles[props.$size]}
`;

const CardContent = styled.div<{
  $size: CardSize;
}>`
  ${(props) => sizeStyles[props.$size]}
`;

/** A container component for grouping related content with optional title and styling */
export const Card = ({
  children,
  title,
  size = "medium",
  variant = "default",
  className,
  fullWidth = false,
  ref,
  ...rest
}: CardProps) => {
  return (
    <CardContainer
      ref={ref}
      $size={size}
      $variant={variant}
      $fullWidth={fullWidth}
      className={className}
      {...rest}
    >
      {title && <CardTitle $size={size}>{title}</CardTitle>}
      <CardContent $size={size}>{children}</CardContent>
    </CardContainer>
  );
};

export default Card;
