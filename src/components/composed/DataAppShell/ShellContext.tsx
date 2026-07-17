"use client";

import * as React from "react";

// =============================================================================
// ShellContext — the AppShell publishes layout state; zone children consume it
// =============================================================================

export type DataAppShellNavVariant = "vertical" | "horizontal";

export interface DataAppShellContextValue {
  /** Which axis the primary nav renders on. */
  navVariant: DataAppShellNavVariant;
  /** The shell's single collapse state — primary + secondary collapse together. */
  collapsed: boolean;
  /** Flip the shell collapse state (no-op when the shell is not collapsible). */
  setCollapsed: (collapsed: boolean) => void;
  /** When true, collapsing hides the primary rail so one icon rail remains. */
  hideNavOnCollapse: boolean;
}

const DataAppShellContext = React.createContext<DataAppShellContextValue | null>(null);

export function DataAppShellProvider({
  value,
  children,
}: {
  value: DataAppShellContextValue;
  children: React.ReactNode;
}) {
  return <DataAppShellContext.Provider value={value}>{children}</DataAppShellContext.Provider>;
}

/** Shell layout state; throws outside a `DataAppShell`. */
export function useDataAppShell(): DataAppShellContextValue {
  const ctx = React.useContext(DataAppShellContext);
  if (!ctx) throw new Error("useDataAppShell must be used within a DataAppShell");
  return ctx;
}

/** Shell layout state, or `null` when rendered outside a `DataAppShell`. */
export function useOptionalDataAppShell(): DataAppShellContextValue | null {
  return React.useContext(DataAppShellContext);
}
