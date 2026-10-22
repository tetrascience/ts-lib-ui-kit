import { useCallback } from "react";

import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { withRef } from "@/lib/react18-compat";
import { cn } from "@/lib/utils";

export type SuggestionsProps = ComponentProps<"div">;

const Suggestions = ({
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

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const SuggestionsWithRef = withRef("Suggestions", Suggestions);
export { SuggestionsWithRef as Suggestions };

export type SuggestionProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  suggestion: string;
  onClick?: (suggestion: string) => void;
};

const Suggestion = ({
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

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const SuggestionWithRef = withRef("Suggestion", Suggestion);
export { SuggestionWithRef as Suggestion };
