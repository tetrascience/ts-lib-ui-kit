import React from "react";
import "./Button.scss";

type ButtonSize = "small" | "medium";
type ButtonVariant = "primary" | "secondary" | "tertiary";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  noPadding?: boolean;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "medium",
      loading = false,
      leftIcon,
      rightIcon,
      noPadding = false,
      fullWidth = false,
      disabled,
      className,
      ...rest
    },
    ref
  ) => {
    const buttonClasses = [
      "button",
      `button--${variant}`,
      `button--${size}`,
      noPadding && "button--no-padding",
      fullWidth && "button--full-width",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        {...rest}
      >
        {leftIcon && leftIcon}
        {children}
        {rightIcon && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps, ButtonSize, ButtonVariant };
