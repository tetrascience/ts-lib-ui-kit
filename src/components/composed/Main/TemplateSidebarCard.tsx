import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type TemplateSidebarCardStatus = "default" | "active" | "disabled";

export interface TemplateSidebarCardProps {
  title: string;
  description?: string;
  buttonText?: string;
  linkText?: string;
  status?: TemplateSidebarCardStatus;
  onButtonClick?: () => void;
  onLinkClick?: () => void;
  className?: string;
}

export const TemplateSidebarCard: React.FC<TemplateSidebarCardProps> = ({
  title,
  description,
  buttonText,
  linkText,
  status = "default",
  onButtonClick,
  onLinkClick,
  className,
}) => {
  const disabled = status === "disabled";

  return (
    <Card
      className={cn(
        "hover:bg-secondary/50 transition-colors duration-200 ease-in-out",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className
      )}
      size="sm"
    >
      <CardContent>
        <h3
          className={cn(
            "m-0 mb-1 text-base font-semibold leading-6",
            disabled ? "text-disabled" : "text-default"
          )}
        >
          {title}
        </h3>
        {description && (
          <p className="m-0 mb-4 text-muted-foreground text-[13px] font-normal leading-5">
            {description}
          </p>
        )}
        {(buttonText || linkText) && (
          <div className="flex items-center gap-4">
            {buttonText && (
              <Button
                variant="secondary"
                size="sm"
                disabled={disabled}
                onClick={(event) => {
                  event.stopPropagation();
                  onButtonClick?.();
                }}
              >
                {buttonText}
              </Button>
            )}
            {linkText && (
              <button
                className={cn(
                  "no-underline text-[13px] font-medium leading-[18px]",
                  disabled
                    ? "text-[var(--muted)] cursor-not-allowed"
                    : "text-[var(--primary)] cursor-pointer hover:underline"
                )}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (!disabled) onLinkClick?.();
                }}
              >
                {linkText}
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
