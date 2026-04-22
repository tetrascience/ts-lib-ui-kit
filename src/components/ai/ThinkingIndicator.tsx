import { cn } from "@/lib/utils";

export interface ThinkingIndicatorProps {
  className?: string;
  label?: string;
}

export function ThinkingIndicator({ className, label = "Thinking" }: ThinkingIndicatorProps) {
  return (
    <div
      data-slot="ai-thinking-indicator"
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-sp-xs rounded-shape-md bg-muted px-sp-sm py-sp-xs text-muted-foreground text-body-sm",
        className,
      )}
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden className="flex items-center gap-1">
        <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:0ms]" />
        <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:150ms]" />
        <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:300ms]" />
      </span>
      <span aria-hidden>{label}</span>
    </div>
  );
}
