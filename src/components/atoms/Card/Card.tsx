import React, { forwardRef } from "react";
import styled, { css } from "styled-components";

export type CardSize = "small" | "medium" | "large";
export type CardVariant = "default" | "outlined" | "elevated";

export interface CardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  children: React.ReactNode;
  title?: React.ReactNode;
  size?: CardSize;
  variant?: CardVariant;
  className?: string;
  fullWidth?: boolean;
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
    background-color: var(--white-900);
    border: 1px solid var(--grey-200);
  `,
  outlined: css`
    background-color: var(--white-900);
    border: 1px solid var(--grey-200);
  `,
  elevated: css`
    background-color: var(--white-900);
    border: 1px solid var(--grey-200);
    box-shadow: 0px 2px 4px var(--black-100);
  `,
};

const CardContainer = styled.div<{
  $size: CardSize;
  $variant: CardVariant;
  $fullWidth?: boolean;
}>`
  border-radius: 16px;
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
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  ${(props) => sizeStyles[props.$size]}
`;

const CardContent = styled.div<{
  $size: CardSize;
}>`
  ${(props) => sizeStyles[props.$size]}
`;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      title,
      size = "medium",
      variant = "default",
      className,
      fullWidth = false,
      ...rest
    },
    ref
  ) => {
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
  }
);

Card.displayName = "Card";

export default Card;
