import { ChevronDownIcon, PaperclipIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { withRef } from "@/lib/react18-compat";
import { cn } from "@/lib/utils";

export interface QueueMessagePart {
  type: string;
  text?: string;
  url?: string;
  filename?: string;
  mediaType?: string;
}

export interface QueueMessage {
  id: string;
  parts: QueueMessagePart[];
}

export interface QueueTodo {
  id: string;
  title: string;
  description?: string;
  status?: "pending" | "completed";
}

// ---------------------------------------------------------------------------
// QueueItem
// ---------------------------------------------------------------------------

export type QueueItemProps = ComponentProps<"li">;

const QueueItem = ({ className, ...props }: QueueItemProps) => (
  <li
    className={cn(
      "group flex flex-row items-center gap-2 rounded-md px-3 py-1 text-sm transition-colors hover:bg-accent",
      className
    )}
    {...props}
  />
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const QueueItemWithRef = withRef("QueueItem", QueueItem);
export { QueueItemWithRef as QueueItem };

// ---------------------------------------------------------------------------
// QueueItemIndicator
// ---------------------------------------------------------------------------

export type QueueItemStatus = "pending" | "loading" | "done" | "error";

export type QueueItemIndicatorProps = ComponentProps<"span"> & {
  /**
   * Visual state of the indicator dot.
   * - `pending`  — unfilled muted ring
   * - `loading`  — spinning ring (primary accent)
   * - `done`     — filled muted dot (task complete)
   * - `error`    — filled destructive dot
   */
  status?: QueueItemStatus;
  /** @deprecated Use `status="done"` instead. */
  completed?: boolean;
};

const INDICATOR_STATUS: Record<QueueItemStatus, string> = {
  pending: "border border-muted-foreground/40",
  loading:
    "border-2 border-muted-foreground/20 border-t-primary animate-spin",
  done: "border border-muted-foreground/20 bg-muted-foreground/30",
  error: "border border-destructive/30 bg-destructive/70",
};

const QueueItemIndicator = ({
  status,
  completed = false,
  className,
  ...props
}: QueueItemIndicatorProps) => {
  const resolvedStatus: QueueItemStatus =
    status ?? (completed ? "done" : "pending");

  return (
    <span
      className={cn(
        "inline-block size-2.5 shrink-0 rounded-full",
        INDICATOR_STATUS[resolvedStatus],
        className
      )}
      {...props}
    />
  );
};

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const QueueItemIndicatorWithRef = withRef("QueueItemIndicator", QueueItemIndicator);
export { QueueItemIndicatorWithRef as QueueItemIndicator };

// ---------------------------------------------------------------------------
// QueueItemContent
// ---------------------------------------------------------------------------

export type QueueItemContentProps = ComponentProps<"span"> & {
  completed?: boolean;
};

const QueueItemContent = ({
  completed = false,
  className,
  ...props
}: QueueItemContentProps) => (
  <span
    className={cn(
      "min-w-0 flex-1 truncate text-muted-foreground",
      completed && "line-through",
      className
    )}
    {...props}
  />
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const QueueItemContentWithRef = withRef("QueueItemContent", QueueItemContent);
export { QueueItemContentWithRef as QueueItemContent };

// ---------------------------------------------------------------------------
// QueueItemDescription
// For items with a description, wrap QueueItemContent + QueueItemDescription
// in a <div className="flex flex-col gap-0.5 min-w-0 flex-1">
// ---------------------------------------------------------------------------

export type QueueItemDescriptionProps = ComponentProps<"div"> & {
  completed?: boolean;
};

const QueueItemDescription = ({
  completed = false,
  className,
  ...props
}: QueueItemDescriptionProps) => (
  <div
    className={cn(
      "text-xs text-muted-foreground",
      completed && "line-through",
      className
    )}
    {...props}
  />
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const QueueItemDescriptionWithRef = withRef("QueueItemDescription", QueueItemDescription);
export { QueueItemDescriptionWithRef as QueueItemDescription };

// ---------------------------------------------------------------------------
// QueueItemActions / QueueItemAction
// ---------------------------------------------------------------------------

export type QueueItemActionsProps = ComponentProps<"div">;

const QueueItemActions = ({
  className,
  ...props
}: QueueItemActionsProps) => (
  <div className={cn("ml-auto flex shrink-0 gap-1", className)} {...props} />
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const QueueItemActionsWithRef = withRef("QueueItemActions", QueueItemActions);
export { QueueItemActionsWithRef as QueueItemActions };

export type QueueItemActionProps = Omit<
  ComponentProps<typeof Button>,
  "variant" | "size"
>;

const QueueItemAction = ({
  className,
  ...props
}: QueueItemActionProps) => (
  <Button
    className={cn(
      "size-auto rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted-foreground/10 hover:text-foreground group-hover:opacity-100",
      className
    )}
    size="icon"
    type="button"
    variant="ghost"
    {...props}
  />
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const QueueItemActionWithRef = withRef("QueueItemAction", QueueItemAction);
export { QueueItemActionWithRef as QueueItemAction };

// ---------------------------------------------------------------------------
// QueueItemAttachment / QueueItemImage / QueueItemFile
// ---------------------------------------------------------------------------

export type QueueItemAttachmentProps = ComponentProps<"div">;

const QueueItemAttachment = ({
  className,
  ...props
}: QueueItemAttachmentProps) => (
  <div className={cn("flex flex-wrap gap-2", className)} {...props} />
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const QueueItemAttachmentWithRef = withRef("QueueItemAttachment", QueueItemAttachment);
export { QueueItemAttachmentWithRef as QueueItemAttachment };

export type QueueItemImageProps = ComponentProps<"img">;

const QueueItemImage = ({
  className,
  ...props
}: QueueItemImageProps) => (
  <img
    alt=""
    className={cn("size-8 rounded border object-cover", className)}
    height={32}
    width={32}
    {...props}
  />
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const QueueItemImageWithRef = withRef("QueueItemImage", QueueItemImage);
export { QueueItemImageWithRef as QueueItemImage };

export type QueueItemFileProps = ComponentProps<"span">;

const QueueItemFile = ({
  children,
  className,
  ...props
}: QueueItemFileProps) => (
  <span
    className={cn(
      "flex items-center gap-1 rounded border bg-muted px-2 py-1 text-xs",
      className
    )}
    {...props}
  >
    <PaperclipIcon size={12} />
    <span className="max-w-[100px] truncate">{children}</span>
  </span>
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const QueueItemFileWithRef = withRef("QueueItemFile", QueueItemFile);
export { QueueItemFileWithRef as QueueItemFile };

// ---------------------------------------------------------------------------
// QueueList
// ---------------------------------------------------------------------------

export type QueueListProps = ComponentProps<typeof ScrollArea>;

const QueueList = ({
  children,
  className,
  ...props
}: QueueListProps) => (
  <ScrollArea className={cn("-mb-1 mt-2", className)} {...props}>
    <div className="max-h-40 pr-4">
      <ul className="flex flex-col gap-0.5">{children}</ul>
    </div>
  </ScrollArea>
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const QueueListWithRef = withRef("QueueList", QueueList);
export { QueueListWithRef as QueueList };

// ---------------------------------------------------------------------------
// QueueSection / QueueSectionTrigger / QueueSectionLabel / QueueSectionContent
// ---------------------------------------------------------------------------

export type QueueSectionProps = ComponentProps<typeof Collapsible>;

const QueueSection = ({
  className,
  defaultOpen = true,
  ...props
}: QueueSectionProps) => (
  <Collapsible className={cn(className)} defaultOpen={defaultOpen} {...props} />
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const QueueSectionWithRef = withRef("QueueSection", QueueSection);
export { QueueSectionWithRef as QueueSection };

export type QueueSectionTriggerProps = ComponentProps<"button">;

const QueueSectionTrigger = ({
  children,
  className,
  ...props
}: QueueSectionTriggerProps) => (
  <CollapsibleTrigger asChild>
    <button
      className={cn(
        "group flex w-full items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-left font-medium text-muted-foreground text-sm transition-colors hover:bg-accent",
        className
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  </CollapsibleTrigger>
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const QueueSectionTriggerWithRef = withRef("QueueSectionTrigger", QueueSectionTrigger);
export { QueueSectionTriggerWithRef as QueueSectionTrigger };

export type QueueSectionLabelProps = ComponentProps<"span"> & {
  count?: number;
  icon?: React.ReactNode;
};

const QueueSectionLabel = ({
  count,
  icon,
  className,
  children,
  ...props
}: QueueSectionLabelProps) => (
  <span className={cn("flex items-center gap-2", className)} {...props}>
    <ChevronDownIcon
      className="size-4 opacity-0 transition-all group-focus-visible:opacity-100 group-hover:opacity-100 group-data-[state=open]:opacity-100 group-data-[state=closed]:-rotate-90"
      data-slot="collapsible-chevron"
    />
    {icon}
    <span>
      {count === undefined ? "" : `${count} `}
      {children}
    </span>
  </span>
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const QueueSectionLabelWithRef = withRef("QueueSectionLabel", QueueSectionLabel);
export { QueueSectionLabelWithRef as QueueSectionLabel };

export type QueueSectionContentProps = ComponentProps<typeof CollapsibleContent>;

const QueueSectionContent = ({
  className,
  ...props
}: QueueSectionContentProps) => (
  <CollapsibleContent className={cn(className)} {...props} />
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const QueueSectionContentWithRef = withRef("QueueSectionContent", QueueSectionContent);
export { QueueSectionContentWithRef as QueueSectionContent };

// ---------------------------------------------------------------------------
// Queue (root)
// ---------------------------------------------------------------------------

const AUTO_HIDE_DELAY = 1000;

export type QueueProps = ComponentProps<"div"> & {
  isStreaming?: boolean;
};

const Queue = ({ className, isStreaming = false, children, style, id, ref, ...props }: QueueProps) => {
  const [visible, setVisible] = useState(true);
  const hasEverStreamedRef = useRef(isStreaming);
  const [hasAutoHidden, setHasAutoHidden] = useState(false);

  useEffect(() => {
    if (isStreaming) hasEverStreamedRef.current = true;
  }, [isStreaming]);

  useEffect(() => {
    if (hasEverStreamedRef.current && !isStreaming && visible && !hasAutoHidden) {
      const timer = setTimeout(() => {
        setVisible(false);
        setHasAutoHidden(true);
      }, AUTO_HIDE_DELAY);
      return () => clearTimeout(timer);
    }
  }, [isStreaming, visible, hasAutoHidden]);

  // Spread data-* and aria-* attributes through; drop event handlers to avoid
  // onDrag type conflict between React and framer-motion.
  const passthroughProps = Object.fromEntries(
    Object.entries(props).filter(([k]) => k.startsWith("data-") || k.startsWith("aria-"))
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          {...passthroughProps}
          ref={ref}
          className={cn(
            "flex flex-col gap-2 rounded-xl border border-border bg-background px-2 pb-2 pt-2 shadow-elevation-2",
            className
          )}
          exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, overflow: "hidden" }}
          id={id}
          style={style}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const QueueWithRef = withRef("Queue", Queue);
export { QueueWithRef as Queue };
