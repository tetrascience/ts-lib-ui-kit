import * as React from "react";

import type {
  SidebarPageEntry,
  SidebarUserMenuItem,
  SidebarUserProfile,
  WorkflowStep,
} from "@/components/composed/DataAppSidebar";
import type {
  DataCount,
  TopNavBreadcrumbItem,
  DataAppTopNavProps,
} from "@/components/composed/DataAppTopNav";

import { MainSidebar, WorkflowPanel } from "@/components/composed/DataAppSidebar";
import { DataAppTopNav } from "@/components/composed/DataAppTopNav";
import { cn } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

export interface DataAppShellProps {
  // -- Sidebar props --
  /** Application name/logo text shown at top of sidebar */
  appName: string;
  /** Full application name shown in the app menu dropdown */
  appFullName?: string;
  /** Custom logo element (replaces appName text) */
  logo?: React.ReactNode;
  /** Main page entries (e.g. Project, Explorer) */
  pages: SidebarPageEntry[];
  /** User profile for the avatar section */
  user?: SidebarUserProfile;
  /** Menu items for the user dropdown */
  userMenuItems?: SidebarUserMenuItem[];
  /** Callback when logo/app name is clicked */
  onLogoClick?: () => void;
  /** Callback when "Back to TDP Platform" is clicked */
  onBackToPlatform?: () => void;
  /** Whether the workflow panel is visible */
  showWorkflow?: boolean;
  /** Workflow steps to display in the collapsible panel */
  workflowSteps?: WorkflowStep[];
  /** Whether the workflow panel is collapsed */
  workflowCollapsed?: boolean;
  /** Called when the workflow panel collapse/expand is toggled */
  onWorkflowCollapseChange?: (collapsed: boolean) => void;

  // -- Top nav props --
  /** Breadcrumb items from root to current page */
  breadcrumbs?: TopNavBreadcrumbItem[];
  /** Data counts shown on the right side (e.g. Input, Output) */
  dataCounts?: DataCount[];
  /** Whether to show the "Next" navigation button */
  showNextButton?: boolean;
  /** Label for the next button */
  nextButtonLabel?: string;
  /** Whether the next button is disabled */
  nextButtonDisabled?: boolean;
  /** Click handler for the next button */
  onNextClick?: () => void;
  /** Additional action buttons for the top nav */
  topNavActions?: React.ReactNode;

  // -- Shell props --
  /** Main content area */
  children?: React.ReactNode;
  /** Additional className for the root container */
  className?: string;
}

// =============================================================================
// DataAppShell
// =============================================================================

function DataAppShell({
  // Sidebar
  appName,
  appFullName,
  logo,
  pages,
  user,
  userMenuItems,
  onLogoClick,
  onBackToPlatform,
  showWorkflow = false,
  workflowSteps = [],
  workflowCollapsed = false,
  onWorkflowCollapseChange,
  // TopNav
  breadcrumbs = [],
  dataCounts = [],
  showNextButton = false,
  nextButtonLabel,
  nextButtonDisabled,
  onNextClick,
  topNavActions,
  // Shell
  children,
  className,
}: DataAppShellProps) {
  // Compose top nav props
  const topNavProps: DataAppTopNavProps = {
    breadcrumbs,
    dataCounts,
    showNextButton,
    nextButtonLabel,
    nextButtonDisabled,
    onNextClick,
    actions: topNavActions,
  };

  const showWorkflowPanel = showWorkflow && workflowSteps.length > 0;

  return (
    <div
      data-slot="data-app-shell"
      className={cn("flex flex-row w-full h-screen overflow-hidden", className)}
    >
      {/* Icon rail (always full height, hidden when workflow collapsed) */}
      {!(showWorkflow && workflowCollapsed) && (
        <MainSidebar
          appName={appName}
          appFullName={appFullName}
          logo={logo}
          pages={pages}
          user={user}
          userMenuItems={userMenuItems}
          onLogoClick={onLogoClick}
          onBackToPlatform={onBackToPlatform}
        />
      )}

      {/* Right of icon rail: top nav spanning full width, then workflow panel + content below */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top navigation bar (spans workflow panel + content) */}
        <DataAppTopNav {...topNavProps} />

        {/* Below top nav: workflow panel + content side by side */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Workflow panel */}
          {showWorkflowPanel && (
            <WorkflowPanel
              steps={workflowSteps}
              collapsed={workflowCollapsed}
              onCollapseChange={
                onWorkflowCollapseChange ?? (() => { /* noop */ })
              }
            />
          )}

          {/* Content area */}
          <main
            data-slot="data-app-shell-content"
            className="flex-1 overflow-auto bg-[#F4F5F7]"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default DataAppShell;
export { DataAppShell };
