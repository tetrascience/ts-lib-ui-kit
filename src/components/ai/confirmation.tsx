import { createContext, useContext, useMemo } from "react";

import type { ToolUIPart } from "ai";
import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


type ToolUIPartApproval =
  | { id: string; approved?: never; reason?: never }
  | { id: string; approved: boolean; reason?: string }
  | { id: string; approved: true; reason?: string }
  | { id: string; approved: false; reason?: string }
  | undefined;

interface ConfirmationContextValue {
  approval: ToolUIPartApproval;
  state: ToolUIPart["state"];
}

const ConfirmationContext = createContext<ConfirmationContextValue | null>(null);

const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error("Confirmation components must be used within Confirmation");
  }
  return context;
};

// ---------------------------------------------------------------------------
// Confirmation (root)
// ---------------------------------------------------------------------------

export type ConfirmationProps = ComponentProps<"div"> & {
  approval?: ToolUIPartApproval;
  state: ToolUIPart["state"];
};

export const Confirmation = ({
  className,
  approval,
  state,
  ...props
}: ConfirmationProps) => {
  const contextValue = useMemo(() => ({ approval, state }), [approval, state]);

  if (!approval || state === "input-streaming" || state === "input-available") {
    return null;
  }

  return (
    <ConfirmationContext.Provider value={contextValue}>
      <div
        className={cn(
          "flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm",
          className
        )}
        {...props}
      />
    </ConfirmationContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// ConfirmationTitle
// ---------------------------------------------------------------------------

export type ConfirmationTitleProps = ComponentProps<"h3">;

export const ConfirmationTitle = ({
  className,
  ...props
}: ConfirmationTitleProps) => (
  <h3
    className={cn("font-semibold text-base text-foreground", className)}
    {...props}
  />
);

// ---------------------------------------------------------------------------
// ConfirmationCode — monospace command/code block
// ---------------------------------------------------------------------------

export type ConfirmationCodeProps = ComponentProps<"pre">;

export const ConfirmationCode = ({
  className,
  ...props
}: ConfirmationCodeProps) => (
  <pre
    className={cn(
      "overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-muted px-4 py-3 font-mono text-sm leading-relaxed text-foreground/80",
      className
    )}
    {...props}
  />
);

// ---------------------------------------------------------------------------
// ConfirmationRequest / Accepted / Rejected — conditional renderers
// ---------------------------------------------------------------------------

export const ConfirmationRequest = ({ children }: { children?: ReactNode }) => {
  const { state } = useConfirmation();
  if (state !== "approval-requested") return null;
  return <>{children}</>;
};

export const ConfirmationAccepted = ({ children }: { children?: ReactNode }) => {
  const { approval, state } = useConfirmation();
  if (
    !approval?.approved ||
    (state !== "approval-responded" &&
      state !== "output-denied" &&
      state !== "output-available")
  ) {
    return null;
  }
  return <>{children}</>;
};

export const ConfirmationRejected = ({ children }: { children?: ReactNode }) => {
  const { approval, state } = useConfirmation();
  if (
    approval?.approved !== false ||
    (state !== "approval-responded" &&
      state !== "output-denied" &&
      state !== "output-available")
  ) {
    return null;
  }
  return <>{children}</>;
};

// ---------------------------------------------------------------------------
// ConfirmationActions — deny left, allow buttons right
// ---------------------------------------------------------------------------

export type ConfirmationActionsProps = ComponentProps<"div">;

export const ConfirmationActions = ({
  className,
  ...props
}: ConfirmationActionsProps) => {
  const { state } = useConfirmation();
  if (state !== "approval-requested") return null;
  return (
    <div
      className={cn("flex items-center justify-between gap-2", className)}
      {...props}
    />
  );
};

// ---------------------------------------------------------------------------
// ConfirmationAction — individual button
// ---------------------------------------------------------------------------

export type ConfirmationActionProps = ComponentProps<typeof Button>;

export const ConfirmationAction = ({
  className,
  size = "sm",
  ...props
}: ConfirmationActionProps) => (
  <Button
    className={cn("gap-1.5", className)}
    size={size}
    type="button"
    {...props}
  />
);

// ---------------------------------------------------------------------------
// ConfirmationShortcut — keyboard shortcut label inside a button
// ---------------------------------------------------------------------------

export type ConfirmationShortcutProps = ComponentProps<"kbd">;

export const ConfirmationShortcut = ({
  className,
  ...props
}: ConfirmationShortcutProps) => (
  <kbd
    className={cn(
      "ml-0.5 rounded px-1 py-0.5 font-sans text-[10px] opacity-60",
      className
    )}
    {...props}
  />
);
