import { cva, type VariantProps } from "class-variance-authority";
import { type LucideIcon } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

export interface NavPage {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Lucide icon or custom React SVG component */
  icon?: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;
  /** Optional count/status badge — overlaid on the icon in `rail`, inline in `sidebar`/`top` */
  badge?: React.ReactNode;
  /** Whether this page is currently active (ignored when `activeKey` is set on the nav) */
  isActive?: boolean;
  /** Click handler */
  onClick?: () => void;
}

export interface NavGroup {
  /** Optional group label shown as a section header in the `sidebar` variant */
  label?: string;
  /** Page entries in this group */
  pages: NavPage[];
}

export type DataAppShellPrimaryNavVariant = "rail" | "sidebar" | "top";

// =============================================================================
// CVA variants — one placement per `variant`
// =============================================================================

const dataAppShellPrimaryNavVariants = cva("flex min-w-0", {
  variants: {
    variant: {
      /** Vertical icon-only rail — tooltips on hover, user slot at the bottom */
      rail: "flex-col",
      /** Vertical icon + label panel — group labels, user slot at the bottom */
      sidebar: "flex-col",
      /** Horizontal bar — labels inline, user/actions slot on the right */
      top: "flex-row items-center w-full gap-2",
    },
  },
  defaultVariants: { variant: "rail" },
});

const headerAreaVariants = cva("shrink-0 flex", {
  variants: {
    variant: {
      rail: "justify-center pt-1 pb-2",
      sidebar: "px-3 py-2.5 border-b border-sidebar-border",
      top: "items-center",
    },
  },
  defaultVariants: { variant: "rail" },
});

const itemsAreaVariants = cva("flex min-h-0", {
  variants: {
    variant: {
      rail: "flex-1 flex-col items-center gap-1 px-2 pt-3 overflow-y-auto",
      sidebar: "flex-1 flex-col py-2 overflow-y-auto",
      top: "flex-1 flex-row items-center gap-1 min-w-0 overflow-x-auto",
    },
  },
  defaultVariants: { variant: "rail" },
});

const groupItemsVariants = cva("flex", {
  variants: {
    variant: {
      rail: "flex-col items-center gap-3 w-full",
      sidebar: "flex-col gap-0.5",
      top: "flex-row items-center gap-1",
    },
  },
  defaultVariants: { variant: "rail" },
});

const groupSeparatorVariants = cva("border-sidebar-border", {
  variants: {
    variant: {
      rail: "border-t w-8 my-2",
      sidebar: "border-t mx-3 my-1",
      top: "border-l h-5 mx-1 self-center",
    },
  },
  defaultVariants: { variant: "rail" },
});

const userAreaVariants = cva("shrink-0", {
  variants: {
    variant: {
      rail: "flex flex-col items-center py-2",
      sidebar: "p-2 border-t border-sidebar-border",
      top: "flex items-center gap-2",
    },
  },
  defaultVariants: { variant: "rail" },
});

const dataAppShellPrimaryNavItemVariants = cva(
  "cursor-pointer bg-transparent border-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        rail: "flex flex-col items-center p-0 w-full",
        sidebar: "flex items-center gap-3 w-full px-3 py-2 text-sm text-left rounded-md mx-1",
        top: "flex items-center gap-2 h-7 px-2.5 text-sm rounded-md whitespace-nowrap",
      },
      active: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "sidebar",
        active: true,
        class: "bg-sidebar-accent text-sidebar-foreground font-medium",
      },
      {
        variant: "sidebar",
        active: false,
        class: "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
      },
      {
        variant: "top",
        active: true,
        class: "bg-primary/10 text-primary font-medium",
      },
      {
        variant: "top",
        active: false,
        class: "text-muted-foreground hover:bg-accent hover:text-foreground",
      },
    ],
    defaultVariants: { variant: "rail", active: false },
  }
);

const pageIconVariants = cva(
  "relative flex items-center justify-center rounded-lg transition-colors duration-150",
  {
    variants: {
      active: {
        true: "bg-primary/10",
        false: "bg-transparent",
      },
      variant: {
        rail: "w-[30px] h-[30px] hover:bg-accent",
        sidebar: "w-8 h-8",
        top: "",
      },
    },
    defaultVariants: { active: false, variant: "rail" },
  }
);

// =============================================================================
// Props
// =============================================================================

export interface DataAppShellPrimaryNavProps
  extends Omit<React.ComponentProps<"nav">, "children" | "onSelect">,
    VariantProps<typeof dataAppShellPrimaryNavVariants> {
  /** Navigation groups; each group contains one or more pages */
  navGroups: NavGroup[];
  /** Controlled active page id — takes precedence over per-page `isActive` */
  activeKey?: string;
  /** Called with the selected page id after the page's own `onClick` */
  onSelect?: (key: string, page: NavPage) => void;
  /** Slot above the items in `rail`/`sidebar`, left of the items in `top` (e.g. app logo) */
  header?: React.ReactNode;
  /** User slot (e.g. `<UserMenu/>`) — bottom in `rail`/`sidebar`, right in `top` */
  user?: React.ReactNode;
  /** Action slot rendered alongside `user` */
  actions?: React.ReactNode;
  /** Escape hatch — full control over an item's rendering */
  renderItem?: (
    page: NavPage,
    state: { active: boolean; variant: DataAppShellPrimaryNavVariant }
  ) => React.ReactNode;
}

// =============================================================================
// NavItem
// =============================================================================

interface NavItemProps {
  page: NavPage;
  variant: DataAppShellPrimaryNavVariant;
  active: boolean;
  onSelect?: (key: string, page: NavPage) => void;
}

function NavItem({ page, variant, active, onSelect }: NavItemProps) {
  const Icon = page.icon;

  const handleClick = () => {
    page.onClick?.();
    onSelect?.(page.id, page);
  };

  if (variant === "top") {
    return (
      <button
        type="button"
        data-slot="data-app-shell-primary-nav-item"
        aria-current={active ? "page" : undefined}
        className={cn(dataAppShellPrimaryNavItemVariants({ variant, active }))}
        onClick={handleClick}
      >
        {Icon && <Icon className="w-4 h-4" />}
        <span>{page.label}</span>
        {page.badge != null && (
          <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
            {page.badge}
          </Badge>
        )}
      </button>
    );
  }

  const iconEl = Icon ? (
    <Icon
      className={cn("w-4 h-4", active ? "text-primary" : "text-muted-foreground")}
    />
  ) : (
    <div
      className={cn(
        "w-2 h-2 rounded-full",
        active ? "bg-primary" : "bg-muted-foreground/40"
      )}
    />
  );

  const iconBox = (
    <div className={cn(pageIconVariants({ active, variant }))}>
      {iconEl}
      {variant === "rail" && page.badge != null && (
        <Badge className="absolute -top-1 -right-1 h-3.5 min-w-3.5 px-1 text-[9px] leading-none">
          {page.badge}
        </Badge>
      )}
    </div>
  );

  if (variant === "rail") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            data-slot="data-app-shell-primary-nav-item"
            aria-label={page.label}
            aria-current={active ? "page" : undefined}
            className={cn(dataAppShellPrimaryNavItemVariants({ variant, active }))}
            onClick={handleClick}
          >
            {iconBox}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{page.label}</TooltipContent>
      </Tooltip>
    );
  }

  // sidebar — icon + label row
  return (
    <button
      type="button"
      data-slot="data-app-shell-primary-nav-item"
      aria-current={active ? "page" : undefined}
      className={cn(dataAppShellPrimaryNavItemVariants({ variant, active }))}
      onClick={handleClick}
    >
      {iconBox}
      <span className="truncate">{page.label}</span>
      {page.badge != null && (
        <Badge variant="secondary" className="ml-auto h-4 px-1.5 text-[10px]">
          {page.badge}
        </Badge>
      )}
    </button>
  );
}

// =============================================================================
// DataAppShellPrimaryNav
// =============================================================================

/**
 * The Data App Shell's nav engine — one `navGroups` model rendered in three
 * placements via `variant`:
 *
 * - **rail** — vertical icon-only (48px rail); labels via tooltip, user slot at the bottom
 * - **sidebar** — vertical icon + label with group headers, user slot at the bottom
 * - **top** — horizontal bar; user/actions slot on the right
 *
 * Active state is either controlled via `activeKey` or per-page `isActive`.
 * Width/background chrome is owned by the container (the shell's rail wrapper,
 * a Sheet, or a TopBar) — this component is layout-neutral.
 */
function DataAppShellPrimaryNav({
  variant,
  navGroups,
  activeKey,
  onSelect,
  header,
  user,
  actions,
  renderItem,
  className,
  ...props
}: DataAppShellPrimaryNavProps) {
  const resolvedVariant: DataAppShellPrimaryNavVariant = variant ?? "rail";
  const isRail = resolvedVariant === "rail";

  return (
    <nav
      data-slot="data-app-shell-primary-nav"
      data-variant={resolvedVariant}
      className={cn(dataAppShellPrimaryNavVariants({ variant: resolvedVariant }), className)}
      {...props}
    >
      <TooltipProvider>
        {header != null && (
          <div
            data-slot="data-app-shell-primary-nav-header"
            className={cn(headerAreaVariants({ variant: resolvedVariant }))}
          >
            {header}
          </div>
        )}
        {/* Rail: short centered divider under the header, aligned with the icon column */}
        {isRail && header != null && (
          <div className="shrink-0 mx-auto w-8 border-t border-sidebar-border" />
        )}

        <div
          data-slot="data-app-shell-primary-nav-items"
          className={cn(itemsAreaVariants({ variant: resolvedVariant }))}
        >
          {navGroups.map((group, groupIndex) => (
            <React.Fragment key={`${groupIndex}-${group.label ?? ""}`}>
              {groupIndex > 0 && (
                <div className={cn(groupSeparatorVariants({ variant: resolvedVariant }))} />
              )}
              {resolvedVariant === "sidebar" && group.label && (
                <span className="px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold">
                  {group.label}
                </span>
              )}
              <div className={cn(groupItemsVariants({ variant: resolvedVariant }))}>
                {group.pages.map((page) => {
                  const active =
                    activeKey == null ? (page.isActive ?? false) : page.id === activeKey;
                  if (renderItem) {
                    return (
                      <React.Fragment key={page.id}>
                        {renderItem(page, { active, variant: resolvedVariant })}
                      </React.Fragment>
                    );
                  }
                  return (
                    <NavItem
                      key={page.id}
                      page={page}
                      variant={resolvedVariant}
                      active={active}
                      onSelect={onSelect}
                    />
                  );
                })}
              </div>
            </React.Fragment>
          ))}
        </div>

        {(user != null || actions != null) && (
          <>
            {/* Rail: short centered divider above the user slot */}
            {isRail && (
              <div className="shrink-0 mx-auto w-8 border-t border-sidebar-border" />
            )}
            <div
              data-slot="data-app-shell-primary-nav-user"
              className={cn(userAreaVariants({ variant: resolvedVariant }))}
            >
              {actions}
              {user}
            </div>
          </>
        )}
      </TooltipProvider>
    </nav>
  );
}

export {
  DataAppShellPrimaryNav,
  dataAppShellPrimaryNavVariants,
  dataAppShellPrimaryNavItemVariants,
};
