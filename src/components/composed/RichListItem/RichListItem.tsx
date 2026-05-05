import * as React from "react";

import { cn } from "@/lib/utils";

export interface RichListItemProps extends React.ComponentProps<"div"> {
  leading?: React.ReactNode;
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  trailing?: React.ReactNode;
  actions?: React.ReactNode;
}

function RichListItem({
  leading,
  primary,
  secondary,
  trailing,
  actions,
  className,
  ...props
}: RichListItemProps) {
  return (
    <div
      data-slot="rich-list-item"
      className={cn(
        "flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors",
        className
      )}
      {...props}
    >
      {leading && <div className="shrink-0">{leading}</div>}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {primary}
          </span>
        </div>
        {secondary && (
          <span className="truncate text-xs text-muted-foreground">
            {secondary}
          </span>
        )}
      </div>
      {trailing && (
        <div className="flex shrink-0 flex-col items-end gap-1">{trailing}</div>
      )}
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}

export interface RichListItemAvatarProps extends React.ComponentProps<"div"> {
  initials: string;
}

function RichListItemAvatar({
  initials,
  className,
  ...props
}: RichListItemAvatarProps) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary",
        className
      )}
      {...props}
    >
      {initials}
    </div>
  );
}

export { RichListItem, RichListItemAvatar };
