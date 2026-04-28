import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { ChevronDownIcon, SearchIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { ComponentProps } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export type TaskItemFileProps = ComponentProps<"div">;

export const TaskItemFile = ({
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

export type TaskItemProps = ComponentProps<"div">;

export const TaskItem = ({ children, className, ...props }: TaskItemProps) => (
  <div className={cn("text-muted-foreground text-sm", className)} {...props}>
    {children}
  </div>
);

const AUTO_CLOSE_DELAY = 1000;

export type TaskProps = ComponentProps<typeof Collapsible> & {
  isStreaming?: boolean;
};

export const Task = ({
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

export type TaskTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  title: string;
};

export const TaskTrigger = ({
  children,
  className,
  title,
  ...props
}: TaskTriggerProps) => (
  <CollapsibleTrigger asChild className={cn("group", className)} {...props}>
    {children ?? (
      <div className="flex w-full cursor-pointer items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground">
        <SearchIcon className="size-4" />
        <p className="text-sm">{title}</p>
        <ChevronDownIcon className="size-4 transition-transform group-data-[state=open]:rotate-180" />
      </div>
    )}
  </CollapsibleTrigger>
);

export type TaskContentProps = ComponentProps<typeof CollapsibleContent>;

export const TaskContent = ({
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
