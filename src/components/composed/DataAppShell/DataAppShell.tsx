import { type LucideIcon } from "lucide-react";
import * as React from "react";

import { DataAppShellHeader } from "./DataAppShell-header";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavPage {
  label: string;
  icon?: LucideIcon;
  isActive?: boolean;
  onClick?: () => void;
}

interface NavGroup {
  label?: string;
  pages: NavPage[];
}

interface BreadcrumbItemConfig {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface DataAppShellProps {
  /** App name displayed as the first breadcrumb */
  appName?: string;
  /** App icon shown before the app name in the breadcrumb */
  appIcon?: React.ReactNode;
  /** Callback when the app name breadcrumb is clicked */
  onAppNameClick?: () => void;
  /** Help button click handler — if provided, shows Help button */
  onHelpClick?: () => void;
  /** Sidebar navigation groups */
  navGroups: NavGroup[];
  /** Version string displayed at sidebar bottom */
  version?: string;
  /** Breadcrumb items after the app name (e.g. current page path) */
  breadcrumbs?: BreadcrumbItemConfig[];
  /** Main content */
  children: React.ReactNode;
  /** Additional class name for the root element */
  className?: string;
}

const DataAppShell: React.FC<DataAppShellProps> = ({
  appName,
  appIcon,
  onAppNameClick,
  onHelpClick,
  navGroups,
  version,
  breadcrumbs,
  children,
  className,
}) => {
  const allBreadcrumbs: BreadcrumbItemConfig[] = [];

  if (appName) {
    allBreadcrumbs.push({
      label: appName,
      onClick: onAppNameClick,
    });
  }

  if (breadcrumbs) {
    allBreadcrumbs.push(...breadcrumbs);
  }

  return (
      <SidebarProvider className={cn("flex flex-col", className)}>
        <DataAppShellHeader
          appIcon={appIcon}
          appName={appName}
          onAppNameClick={onAppNameClick}
          onHelpClick={onHelpClick}
          breadcrumbs={allBreadcrumbs}
        />
        <div className="flex flex-1">
          <Sidebar variant="sidebar" className="top-15 h-[calc(100svh-var(--header-height))]!">
            <SidebarContent>
              {navGroups.map((group, gIndex) => (
                <SidebarGroup key={gIndex}>
                  {gIndex > 0 && <SidebarSeparator className="mx-0 mb-2" />}
                  {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.pages.map((page, pIndex) => (
                        <SidebarMenuItem key={pIndex}>
                          <SidebarMenuButton
                            isActive={page.isActive}
                            tooltip={page.label}
                            onClick={page.onClick}
                          >
                            {page.icon &&
                              React.createElement(page.icon, {
                                className: "size-4",
                              })}
                            <span>{page.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarContent>

            {version && (
              <SidebarFooter>
                <span className="text-xs text-muted-foreground truncate px-2 py-1">
                  {version}
                </span>
              </SidebarFooter>
            )}
          </Sidebar>
          {/* Content area */}
          <SidebarInset>
            <div className="flex flex-1 flex-col overflow-auto p-4">
              {children}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
  );
};

export { DataAppShell };
export type { DataAppShellProps, NavPage, NavGroup, BreadcrumbItemConfig };
