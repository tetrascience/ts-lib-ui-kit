import React, { forwardRef } from "react";
import "./Card.scss";

type CardSize = "small" | "medium" | "large";
type CardVariant = "default" | "outlined" | "elevated";

interface CardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  children: React.ReactNode;
  title?: React.ReactNode;
  size?: CardSize;
  variant?: CardVariant;
  className?: string;
  fullWidth?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
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
    const cardClasses = [
      "card",
      `card--${variant}`,
      fullWidth && "card--full-width",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const titleClasses = ["card__title", `card__title--${size}`]
      .filter(Boolean)
      .join(" ");

    const contentClasses = ["card__content", `card__content--${size}`]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={cardClasses} {...rest}>
        {title && <div className={titleClasses}>{title}</div>}
        <div className={contentClasses}>{children}</div>
      </div>
    );
  }
);

Card.displayName = "Card";

export { Card };
export type { CardProps, CardSize, CardVariant };
