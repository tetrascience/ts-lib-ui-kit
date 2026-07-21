import { cva, type VariantProps } from "class-variance-authority";
import { type LucideIcon } from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

export interface UserMenuItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional leading icon */
  icon?: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;
  /** Click handler */
  onClick?: () => void;
  /** Disables the item */
  disabled?: boolean;
  /** Visual variant — `destructive` for sign-out / delete actions */
  variant?: "default" | "destructive";
}

export interface UserMenuGroup {
  /** Items in this group; groups are separated by a divider */
  items: UserMenuItem[];
}

const userMenuTriggerVariants = cva(
  "flex items-center cursor-pointer bg-transparent border-none text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-md",
  {
    variants: {
      variant: {
        /** Icon-only avatar — for the TopBar right slot or the collapsed rail */
        avatar: "p-0 hover:opacity-85",
        /** Avatar + name/subtitle row — for the expanded sidebar footer */
        detailed:
          "gap-3 w-full px-1 py-1 text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
      },
    },
    defaultVariants: { variant: "avatar" },
  }
);

export interface UserMenuProps
  extends VariantProps<typeof userMenuTriggerVariants> {
  /** User's full name — used for the menu header and derived initials */
  name: string;
  /** Secondary line shown under the name (e.g. email or role) */
  subtitle?: string;
  /** Avatar image URL; falls back to initials when absent or on load error */
  avatarSrc?: string;
  /** Explicit initials override; otherwise derived from `name` */
  initials?: string;
  /** Menu item groups; each group is separated by a divider */
  groups?: UserMenuGroup[];
  /** Which side of the trigger the dropdown opens on */
  side?: "top" | "right" | "bottom" | "left";
  /** Alignment of the dropdown relative to the trigger */
  align?: "start" | "center" | "end";
  /** Additional className for the trigger button */
  className?: string;
}

// =============================================================================
// Helpers
// =============================================================================

/** Derives up to two uppercase initials from a full name. */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// =============================================================================
// UserMenu
// =============================================================================

/**
 * User account affordance — an avatar (initials or image) that opens a dropdown
 * menu. A composition over the `Avatar` + `DropdownMenu` primitives.
 *
 * Focus trap, keyboard navigation, and Esc-to-close are handled by the
 * underlying Radix `DropdownMenu`.
 */
function UserMenu({
  name,
  subtitle,
  avatarSrc,
  initials,
  groups = [],
  variant,
  side = "bottom",
  align = "end",
  className,
}: UserMenuProps) {
  const resolvedInitials = initials ?? getInitials(name);
  const isDetailed = variant === "detailed";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-slot="user-menu-trigger"
          aria-label={`${name} account menu`}
          className={cn(userMenuTriggerVariants({ variant }), className)}
        >
          <Avatar size="sm" className="bg-primary shrink-0">
            {avatarSrc && <AvatarImage src={avatarSrc} alt={name} />}
            <AvatarFallback className="bg-primary text-primary-foreground group-data-[size=sm]/avatar:text-[10px] font-semibold">
              {resolvedInitials}
            </AvatarFallback>
          </Avatar>
          {isDetailed && (
            <div className="flex flex-col items-start min-w-0">
              <span className="text-xs font-medium text-foreground truncate">
                {name}
              </span>
              {subtitle && (
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide truncate">
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        data-slot="user-menu-content"
        side={side}
        align={align}
        className="min-w-[200px]"
      >
        {/* Header: name + subtitle */}
        <div className="flex flex-col px-2 py-1.5">
          <span className="text-sm font-semibold text-foreground truncate">
            {name}
          </span>
          {subtitle && (
            <span className="text-xs text-muted-foreground truncate">
              {subtitle}
            </span>
          )}
        </div>

        {groups.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            <DropdownMenuSeparator />
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem
                  key={item.id}
                  variant={item.variant}
                  disabled={item.disabled}
                  onSelect={() => item.onClick?.()}
                  className="cursor-pointer"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.label}
                </DropdownMenuItem>
              );
            })}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { UserMenu, getInitials, userMenuTriggerVariants };
