import React from "react";
import "./Badge.scss";

type BadgeSize = "small" | "medium";
type BadgeVariant = "default" | "primary";

interface BadgeProps {
  children: React.ReactNode;
  size?: BadgeSize;
  variant?: BadgeVariant;
  disabled?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  size = "medium",
  variant = "default",
  disabled = false,
  iconLeft,
  iconRight,
  className,
}) => {
  const badgeClasses = [
    "badge",
    `badge--${variant}`,
    `badge--${size}`,
    disabled && "badge--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={badgeClasses}>
      {iconLeft && iconLeft}
      {children}
      {iconRight && iconRight}
    </span>
  );
};

export { Badge };
export type { BadgeProps, BadgeSize, BadgeVariant };
