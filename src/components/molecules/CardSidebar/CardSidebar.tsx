import { forwardRef } from "react";
import { Button } from "@atoms/Button";
import "./CardSidebar.scss";

type CardSidebarStatus = "default" | "active" | "hover" | "disabled";

interface CardSidebarProps {
  title: string;
  description?: string;
  buttonText?: string;
  linkText?: string;
  status?: CardSidebarStatus;
  onButtonClick?: () => void;
  onLinkClick?: () => void;
  className?: string;
}

const CardSidebar = forwardRef<HTMLDivElement, CardSidebarProps>(
  (
    {
      title,
      description,
      buttonText,
      linkText,
      status = "default",
      onButtonClick,
      onLinkClick,
      className,
    },
    ref
  ) => {
    const handleButtonClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (status !== "disabled" && onButtonClick) {
        onButtonClick();
      }
    };

    const handleLinkClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (status !== "disabled" && onLinkClick) {
        onLinkClick();
      }
    };

    const containerClasses = [
      "card-sidebar",
      `card-sidebar--${status}`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={containerClasses}>
        <h3 className="card-sidebar__title">{title}</h3>
        {description && (
          <p className="card-sidebar__description">{description}</p>
        )}
        <div className="card-sidebar__action-container">
          {buttonText && (
            <Button
              variant="secondary"
              size="small"
              disabled={status === "disabled"}
              onClick={handleButtonClick}
              className="card-sidebar__button"
              leftIcon={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="3"
                    y="3"
                    width="10"
                    height="10"
                    rx="2"
                    fill="currentColor"
                  />
                </svg>
              }
            >
              {buttonText}
            </Button>
          )}
          {linkText && (
            <a
              className="card-sidebar__link"
              onClick={handleLinkClick}
              href={status === "disabled" ? undefined : "#"}
            >
              {linkText}
            </a>
          )}
        </div>
      </div>
    );
  }
);

CardSidebar.displayName = "CardSidebar";

export { CardSidebar };
export type { CardSidebarProps };
