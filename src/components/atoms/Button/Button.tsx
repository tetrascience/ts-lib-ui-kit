import React from "react";
import styled, { css } from "styled-components";

export type ButtonSize = "small" | "medium";
export type ButtonVariant = "primary" | "secondary" | "tertiary";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  noPadding?: boolean;
  fullWidth?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

const heightStyles = {
  small: css`
    height: 34px;
  `,
  medium: css`
    height: 38px;
  `,
};

const variantStyles = {
  primary: css`
    color: var(--white-900);
    background-color: var(--theme-primary, var(--blue-900));
    border: 1px solid var(--theme-primary, var(--blue-900));

    &:hover:not(:disabled) {
      background-color: var(--theme-primaryHover, var(--blue-800));
      border-color: var(--theme-primaryHover, var(--blue-800));
    }

    &:focus:not(:disabled) {
      background-color: var(--theme-primaryHover, var(--blue-800));
    }

    &:active:not(:disabled) {
      background-color: var(--theme-primaryActive, var(--blue-800));
      border-color: var(--theme-primaryActive, var(--blue-800));
    }
  `,
  secondary: css`
    color: var(--blue-600);
    background-color: var(--white-900);
    border: 1px solid var(--blue-600);

    &:hover:not(:disabled) {
      background-color: var(--blue-100);
      border-color: var(--blue-600);
    }

    &:focus:not(:disabled) {
      background-color: var(--blue-100);
    }

    &:active:not(:disabled) {
      border-color: var(--blue-600);
      background-color: var(--blue-100);
    }
  `,
  tertiary: css`
    color: var(--black-900);
    background-color: var(--white-900);
    border: 1px solid var(--grey-300);

    &:hover:not(:disabled) {
      background-color: var(--grey-100);
      border: 1px solid var(--grey-300);
    }

    &:focus:not(:disabled) {
      background-color: var(--grey-100);
    }

    &:active:not(:disabled) {
      background-color: var(--grey-100);
    }
  `,
};

const getPadding = (size: ButtonSize, noPadding?: boolean) => {
  if (noPadding) return "0";

  switch (size) {
    case "small":
      return "7px 10px";
    case "medium":
    default:
      return "9px 12px";
  }
};

interface StyledButtonProps {
  $noPadding?: boolean;
  $fullWidth?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: var(--theme-radius-medium, 8px);
  font-family: "Inter", sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  min-height: 20px;
  width: ${(props) => (props.$fullWidth ? "100%" : "auto")};
  padding: ${(props) => getPadding(props.size || "medium", props.$noPadding)};
  user-select: none;

  ${(props) => heightStyles[props.size || "medium"]}
  ${(props) => variantStyles[props.variant || "primary"]}

	&:disabled {
    cursor: not-allowed;
    user-select: none;
    pointer-events: none;
    background-color: var(--grey-300);
    border-color: var(--grey-300);
    color: var(--white-900);
  }

  &:focus {
    outline: none;
    box-shadow: 0px 0px 0px 1px var(--white-900),
      0px 0px 0px 3px var(--blue-600);
  }
`;

export const Button = ({
  children,
  variant = "primary",
  size = "medium",
  loading = false,
  leftIcon,
  rightIcon,
  noPadding = false,
  fullWidth = false,
  disabled,
  ref,
  ...rest
}: ButtonProps) => {
  return (
    <StyledButton
      ref={ref}
      variant={variant}
      size={size}
      $noPadding={noPadding}
      $fullWidth={fullWidth}
      disabled={disabled || loading}
      {...rest}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </StyledButton>
  );
};

export default Button;
