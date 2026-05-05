import * as React from "react";

import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";


export interface ContextualAction {
  label: string;
  icon?: LucideIcon;
  variant?: "default" | "destructive";
  onClick: () => void;
}

export interface ContextualActionBarProps extends React.ComponentProps<"div"> {
  selectionCount: number;
  totalCount: number;
  actions: ContextualAction[];
  onSelectAll: (checked: boolean) => void;
  children?: React.ReactNode;
}

function ContextualActionBar({
  selectionCount,
  totalCount,
  actions,
  onSelectAll,
  children,
  className,
  ...props
}: ContextualActionBarProps) {
  const isAllSelected = selectionCount === totalCount && totalCount > 0;
  const isIndeterminate = selectionCount > 0 && selectionCount < totalCount;
  const hasSelection = selectionCount > 0;

  return (
    <div
      data-slot="contextual-action-bar"
      className={cn(
        "flex items-center gap-3 border-b bg-card px-4 py-2.5 transition-colors",
        hasSelection && "bg-primary/5",
        className
      )}
      {...props}
    >
      <Checkbox
        checked={isIndeterminate ? "indeterminate" : isAllSelected}
        onCheckedChange={(checked) => onSelectAll(checked === true)}
        aria-label="Select all rows"
      />
      {hasSelection ? (
        <>
          <Badge variant="secondary" className="font-mono">
            {selectionCount} selected
          </Badge>
          <div className="flex items-center gap-1.5">
            {actions.map((action, i) => {
              const Icon = action.icon;
              return (
                <Button
                  key={`${action.label}-${i}`}
                  variant={action.variant === "destructive" ? "destructive" : "outline"}
                  size="sm"
                  onClick={action.onClick}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {action.label}
                </Button>
              );
            })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => onSelectAll(false)}
          >
            Clear
          </Button>
        </>
      ) : (
        <div className="flex flex-1 items-center gap-4">{children}</div>
      )}
    </div>
  );
}

export { ContextualActionBar };
