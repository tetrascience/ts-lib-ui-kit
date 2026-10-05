import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { ChevronDownIcon, SearchIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { ComponentProps } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { withRef } from "@/lib/react18-compat";
import { cn } from "@/lib/utils";

export type TaskItemFileProps = ComponentProps<"div">;

const TaskItemFile = ({
  children,
  className,
  ...props
}: TaskItemFileProps) => (
  <div
    className={cn(
      "inline-flex items-center gap-1 rounded-md border bg-secondary px-1.5 py-0.5 text-foreground text-xs",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const TaskItemFileWithRef = withRef("TaskItemFile", TaskItemFile);
export { TaskItemFileWithRef as TaskItemFile };

export type TaskItemProps = ComponentProps<"div">;

const TaskItem = ({ children, className, ...props }: TaskItemProps) => (
  <div className={cn("text-muted-foreground text-sm", className)} {...props}>
    {children}
  </div>
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const TaskItemWithRef = withRef("TaskItem", TaskItem);
export { TaskItemWithRef as TaskItem };

const AUTO_CLOSE_DELAY = 1000;

export type TaskProps = ComponentProps<typeof Collapsible> & {
  isStreaming?: boolean;
};

const Task = ({
  defaultOpen = true,
  isStreaming = false,
  open,
  onOpenChange,
  className,
  ...props
}: TaskProps) => {
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    defaultProp: defaultOpen,
    onChange: onOpenChange,
    prop: open,
  });

  const hasEverStreamedRef = useRef(isStreaming);
  const [hasAutoClosed, setHasAutoClosed] = useState(false);

  useEffect(() => {
    if (isStreaming) hasEverStreamedRef.current = true;
  }, [isStreaming]);

  useEffect(() => {
    if (hasEverStreamedRef.current && !isStreaming && isOpen && !hasAutoClosed) {
      const timer = setTimeout(() => {
        setIsOpen(false);
        setHasAutoClosed(true);
      }, AUTO_CLOSE_DELAY);
      return () => clearTimeout(timer);
    }
  }, [isStreaming, isOpen, setIsOpen, hasAutoClosed]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => setIsOpen(newOpen),
    [setIsOpen]
  );

  return (
    <Collapsible
      className={cn(className)}
      onOpenChange={handleOpenChange}
      open={isOpen}
      {...props}
    />
  );
};

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const TaskWithRef = withRef("Task", Task);
export { TaskWithRef as Task };

export type TaskTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  title: string;
};

const TaskTrigger = ({
  children,
  className,
  title,
  ...props
}: TaskTriggerProps) => (
  <CollapsibleTrigger asChild className={cn("group", className)} {...props}>
    {children ?? (
      <button
        type="button"
        className="group flex w-full cursor-pointer items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
      >
        <SearchIcon className="size-4" />
        <span className="text-sm">{title}</span>
        <ChevronDownIcon
          className="size-4 opacity-0 transition-all group-focus-visible:opacity-100 group-hover:opacity-100 group-data-[state=open]:rotate-180 group-data-[state=open]:opacity-100"
          data-slot="collapsible-chevron"
        />
      </button>
    )}
  </CollapsibleTrigger>
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const TaskTriggerWithRef = withRef("TaskTrigger", TaskTrigger);
export { TaskTriggerWithRef as TaskTrigger };

export type TaskContentProps = ComponentProps<typeof CollapsibleContent>;

const TaskContent = ({
  children,
  className,
  ...props
}: TaskContentProps) => (
  <CollapsibleContent
    className={cn(
      "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-popover-foreground outline-none data-[state=closed]:animate-out data-[state=open]:animate-in",
      className
    )}
    {...props}
  >
    <div className="mt-4 space-y-2 border-border border-l-2 pl-4">
      {children}
    </div>
  </CollapsibleContent>
);

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const TaskContentWithRef = withRef("TaskContent", TaskContent);
export { TaskContentWithRef as TaskContent };
