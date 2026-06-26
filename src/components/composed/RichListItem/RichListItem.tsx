import * as React from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { cn } from "@/lib/utils";

export interface RichListItemProps extends Omit<React.ComponentProps<typeof Item>, "asChild" | "children"> {
  /** Slot before the text content — typically an avatar or icon. */
  leading?: React.ReactNode;
  /** Primary line of text. Truncates to a single line. */
  primary: React.ReactNode;
  /** Secondary line of text shown beneath `primary`. Truncates to a single line. */
  secondary?: React.ReactNode;
  /** Right-aligned supplemental content (badges, timestamps) shown above `actions`. */
  trailing?: React.ReactNode;
  /** Right-aligned interactive controls (buttons, menus). */
  actions?: React.ReactNode;
}

const CONTENT_COLUMNS_BOTH = "grid-cols-[minmax(0,1fr)_auto_auto]";
const CONTENT_COLUMNS_ONE = "grid-cols-[minmax(0,1fr)_auto]";
const CONTENT_COLUMNS_NONE = "grid-cols-[minmax(0,1fr)]";

function getContentColumns(hasTrailing: boolean, hasActions: boolean) {
  if (hasTrailing && hasActions) return CONTENT_COLUMNS_BOTH;
  if (hasTrailing || hasActions) return CONTENT_COLUMNS_ONE;
  return CONTENT_COLUMNS_NONE;
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
  const hasSecondary = Boolean(secondary);
  const contentColumns = getContentColumns(Boolean(trailing), Boolean(actions));
  const supplementalSpanClass = hasSecondary ? "row-span-2" : "row-span-1";

  return (
    <Item
      data-slot="rich-list-item"
      variant={variant}
      size={size}
      className={cn(
        "flex-nowrap items-center gap-3 rounded-none border-transparent px-4 py-3 hover:bg-accent/50",
        className,
      )}
      {...props}
    >
      {leading && <ItemMedia className="self-center">{leading}</ItemMedia>}
      <ItemContent className="min-w-0">
        <div className={cn("grid min-w-0 items-center gap-x-3 gap-y-1", contentColumns)}>
          <ItemTitle className="min-w-0 max-w-full truncate">{primary}</ItemTitle>
          {trailing && (
            <div className={cn("flex flex-col items-end gap-1 whitespace-nowrap text-right", supplementalSpanClass)}>
              {trailing}
            </div>
          )}
          {actions && (
            <ItemActions className={cn("shrink-0 self-center", supplementalSpanClass)}>{actions}</ItemActions>
          )}
          {secondary && (
            <div
              data-slot="rich-list-item-secondary"
              className="min-w-0 truncate text-xs leading-tight text-muted-foreground"
            >
              {secondary}
            </div>
          )}
        </div>
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
