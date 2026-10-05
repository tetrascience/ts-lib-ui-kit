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

const QueueItem19 = ({ className, ...props }: QueueItemProps) => (
  <li
    className={cn(
      "group flex flex-row items-center gap-2 rounded-md px-3 py-1 text-sm transition-colors hover:bg-accent",
      className
    )}
    {...props}
  />
);

export const QueueItem = withRef("QueueItem", QueueItem19);

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

const QueueItemIndicator19 = ({
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

export const QueueItemIndicator = withRef("QueueItemIndicator", QueueItemIndicator19);

// ---------------------------------------------------------------------------
// QueueItemContent
// ---------------------------------------------------------------------------

export type QueueItemContentProps = ComponentProps<"span"> & {
  completed?: boolean;
};

const QueueItemContent19 = ({
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

export const QueueItemContent = withRef("QueueItemContent", QueueItemContent19);

// ---------------------------------------------------------------------------
// QueueItemDescription
// For items with a description, wrap QueueItemContent + QueueItemDescription
// in a <div className="flex flex-col gap-0.5 min-w-0 flex-1">
// ---------------------------------------------------------------------------

export type QueueItemDescriptionProps = ComponentProps<"div"> & {
  completed?: boolean;
};

const QueueItemDescription19 = ({
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

export const QueueItemDescription = withRef("QueueItemDescription", QueueItemDescription19);

// ---------------------------------------------------------------------------
// QueueItemActions / QueueItemAction
// ---------------------------------------------------------------------------

export type QueueItemActionsProps = ComponentProps<"div">;

const QueueItemActions19 = ({
  className,
  ...props
}: QueueItemActionsProps) => (
  <div className={cn("ml-auto flex shrink-0 gap-1", className)} {...props} />
);

export const QueueItemActions = withRef("QueueItemActions", QueueItemActions19);

export type QueueItemActionProps = Omit<
  ComponentProps<typeof Button>,
  "variant" | "size"
>;

const QueueItemAction19 = ({
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

export const QueueItemAction = withRef("QueueItemAction", QueueItemAction19);

// ---------------------------------------------------------------------------
// QueueItemAttachment / QueueItemImage / QueueItemFile
// ---------------------------------------------------------------------------

export type QueueItemAttachmentProps = ComponentProps<"div">;

const QueueItemAttachment19 = ({
  className,
  ...props
}: QueueItemAttachmentProps) => (
  <div className={cn("flex flex-wrap gap-2", className)} {...props} />
);

export const QueueItemAttachment = withRef("QueueItemAttachment", QueueItemAttachment19);

export type QueueItemImageProps = ComponentProps<"img">;

const QueueItemImage19 = ({
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

export const QueueItemImage = withRef("QueueItemImage", QueueItemImage19);

export type QueueItemFileProps = ComponentProps<"span">;

const QueueItemFile19 = ({
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

export const QueueItemFile = withRef("QueueItemFile", QueueItemFile19);

// ---------------------------------------------------------------------------
// QueueList
// ---------------------------------------------------------------------------

export type QueueListProps = ComponentProps<typeof ScrollArea>;

const QueueList19 = ({
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

export const QueueList = withRef("QueueList", QueueList19);

// ---------------------------------------------------------------------------
// QueueSection / QueueSectionTrigger / QueueSectionLabel / QueueSectionContent
// ---------------------------------------------------------------------------

export type QueueSectionProps = ComponentProps<typeof Collapsible>;

const QueueSection19 = ({
  className,
  defaultOpen = true,
  ...props
}: QueueSectionProps) => (
  <Collapsible className={cn(className)} defaultOpen={defaultOpen} {...props} />
);

export const QueueSection = withRef("QueueSection", QueueSection19);

export type QueueSectionTriggerProps = ComponentProps<"button">;

const QueueSectionTrigger19 = ({
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

export const QueueSectionTrigger = withRef("QueueSectionTrigger", QueueSectionTrigger19);

export type QueueSectionLabelProps = ComponentProps<"span"> & {
  count?: number;
  icon?: React.ReactNode;
};

const QueueSectionLabel19 = ({
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

export const QueueSectionLabel = withRef("QueueSectionLabel", QueueSectionLabel19);

export type QueueSectionContentProps = ComponentProps<typeof CollapsibleContent>;

const QueueSectionContent19 = ({
  className,
  ...props
}: QueueSectionContentProps) => (
  <CollapsibleContent className={cn(className)} {...props} />
);

export const QueueSectionContent = withRef("QueueSectionContent", QueueSectionContent19);

// ---------------------------------------------------------------------------
// Queue (root)
// ---------------------------------------------------------------------------

const AUTO_HIDE_DELAY = 1000;

export type QueueProps = ComponentProps<"div"> & {
  isStreaming?: boolean;
};

const Queue19 = ({ className, isStreaming = false, children, style, id, ref, ...props }: QueueProps) => {
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

export const Queue = withRef("Queue", Queue19);
