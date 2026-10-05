import { AnimatePresence, motion } from "motion/react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";


import type { ToolUIPart } from "ai";
import type { ComponentProps, PropsWithChildren, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { Kbd } from "@/components/ui/kbd";
import { withRef } from "@/lib/react18-compat";
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

const ACCEPTED_HIDE_DELAY = 1500;

const Confirmation = ({
  className,
  approval,
  state,
  children,
  ref,
  ...props
}: ConfirmationProps) => {
  const contextValue = useMemo(() => ({ approval, state }), [approval, state]);
  const [visible, setVisible] = useState(true);

  const isAccepted =
    approval?.approved === true &&
    (state === "approval-responded" ||
      state === "output-available" ||
      state === "output-denied");

  useEffect(() => {
    if (isAccepted) {
      const timer = setTimeout(() => setVisible(false), ACCEPTED_HIDE_DELAY);
      return () => clearTimeout(timer);
    }
  }, [isAccepted]);

  if (!approval || state === "input-streaming" || state === "input-available") {
    return null;
  }

  // Pass through data-* and aria-* only; drop event handlers to avoid
  // onDrag type conflict between React and framer-motion.
  const passthroughProps = Object.fromEntries(
    Object.entries(props).filter(([k]) => k.startsWith("data-") || k.startsWith("aria-"))
  );

  return (
    <ConfirmationContext.Provider value={contextValue}>
      <AnimatePresence>
        {visible && (
          <motion.div
            {...passthroughProps}
            ref={ref}
            className={cn(
              "flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-elevation-3",
              className
            )}
            exit={{ opacity: 0, scale: 0.96 }}
            id={props.id}
            style={props.style}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmationContext.Provider>
  );
};

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const ConfirmationWithRef = withRef("Confirmation", Confirmation);
export { ConfirmationWithRef as Confirmation };

// ---------------------------------------------------------------------------
// ConfirmationTitle
// ---------------------------------------------------------------------------

export type ConfirmationTitleProps = PropsWithChildren<ComponentProps<"h3">>;

const ConfirmationTitle = ({
  className,
  children,
  ...props
}: ConfirmationTitleProps) => (
  <h3
    className={cn("font-semibold text-base text-foreground", className)}
    {...props}
  >
    {children}
  </h3>
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const ConfirmationTitleWithRef = withRef("ConfirmationTitle", ConfirmationTitle);
export { ConfirmationTitleWithRef as ConfirmationTitle };

// ---------------------------------------------------------------------------
// ConfirmationCode — monospace command/code block
// ---------------------------------------------------------------------------

export type ConfirmationCodeProps = ComponentProps<typeof CodeBlock>;

const ConfirmationCode = ({
  className,
  children,
  ...props
}: ConfirmationCodeProps) => (
  <CodeBlock className={cn(className)} {...props} language="bash" code={children?.toString() ?? ''} />
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const ConfirmationCodeWithRef = withRef("ConfirmationCode", ConfirmationCode);
export { ConfirmationCodeWithRef as ConfirmationCode };

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

const ConfirmationActions = ({
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

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const ConfirmationActionsWithRef = withRef("ConfirmationActions", ConfirmationActions);
export { ConfirmationActionsWithRef as ConfirmationActions };

// ---------------------------------------------------------------------------
// ConfirmationAction — individual button
// ---------------------------------------------------------------------------

export type ConfirmationActionProps = ComponentProps<typeof Button>;

const ConfirmationAction = ({
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

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const ConfirmationActionWithRef = withRef("ConfirmationAction", ConfirmationAction);
export { ConfirmationActionWithRef as ConfirmationAction };

// ---------------------------------------------------------------------------
// ConfirmationShortcut — keyboard shortcut label inside a button
// ---------------------------------------------------------------------------

export type ConfirmationShortcutProps = ComponentProps<typeof Kbd>;

const ConfirmationShortcut = ({
  className,
  ...props
}: ConfirmationShortcutProps) => (
  <Kbd className={cn("ml-0.5", className)} {...props} />
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const ConfirmationShortcutWithRef = withRef("ConfirmationShortcut", ConfirmationShortcut);
export { ConfirmationShortcutWithRef as ConfirmationShortcut };
