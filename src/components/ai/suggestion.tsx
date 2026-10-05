import { useCallback } from "react";

import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { withRef } from "@/lib/react18-compat";
import { cn } from "@/lib/utils";

export type SuggestionsProps = ComponentProps<"div">;

const Suggestions19 = ({
  className,
  children,
  ...props
}: SuggestionsProps) => (
  <div className="w-full overflow-x-auto py-1" {...props}>
    <div className={cn("flex w-max flex-nowrap items-center gap-2 px-4", className)}>
      {children}
    </div>
  </div>
);

export const Suggestions = withRef("Suggestions", Suggestions19);

export type SuggestionProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  suggestion: string;
  onClick?: (suggestion: string) => void;
};

const Suggestion19 = ({
  suggestion,
  onClick,
  className,
  variant = "outline",
  size = "sm",
  children,
  ...props
}: SuggestionProps) => {
  const handleClick = useCallback(() => {
    onClick?.(suggestion);
  }, [onClick, suggestion]);

  return (
    <Button
      className={cn("cursor-pointer rounded-full px-4", className)}
      onClick={handleClick}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {children || suggestion}
    </Button>
  );
};

export const Suggestion = withRef("Suggestion", Suggestion19);
