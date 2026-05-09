import * as React from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Item, ItemActions, ItemContent, ItemHeader, ItemMedia, ItemTitle } from "@/components/ui/item";
import { cn } from "@/lib/utils";

export interface RichListItemProps extends Omit<React.ComponentProps<typeof Item>, "asChild" | "children"> {
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
  variant = "default",
  size = "default",
  ...props
}: RichListItemProps) {
  return (
    <Item
      data-slot="rich-list-item"
      variant={variant}
      size={size}
      className={cn("gap-3 rounded-none border-transparent px-4 py-3 hover:bg-muted/50", className)}
      {...props}
    >
      {leading && <ItemMedia className="self-center">{leading}</ItemMedia>}
      <ItemContent className="min-w-0 gap-0.5">
        <ItemHeader className="min-w-0 flex-nowrap items-start gap-3">
          <ItemTitle className="min-w-0 flex-1 truncate">{primary}</ItemTitle>
          {(trailing || actions) && (
            <div className="flex shrink-0 items-start gap-3">
              {trailing && <div className="flex flex-col items-end gap-1 text-right">{trailing}</div>}
              {actions && <ItemActions className="shrink-0">{actions}</ItemActions>}
            </div>
          )}
        </ItemHeader>
        {secondary && (
          <div data-slot="rich-list-item-secondary" className="truncate text-xs text-muted-foreground">
            {secondary}
          </div>
        )}
      </ItemContent>
    </Item>
  );
}

export interface RichListItemAvatarProps extends Omit<React.ComponentProps<typeof Avatar>, "children"> {
  initials: string;
  fallbackClassName?: string;
}

function RichListItemAvatar({
  initials,
  className,
  fallbackClassName,
  size = "default",
  ...props
}: RichListItemAvatarProps) {
  return (
    <Avatar className={className} size={size} {...props}>
      <AvatarFallback className={cn("bg-primary/10 text-xs font-semibold text-primary", fallbackClassName)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export { RichListItem, RichListItemAvatar };
