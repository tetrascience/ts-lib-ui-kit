import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { formatCount } from "@/utils/numbers";

export interface WorkflowStep {
  id: string;
  label: string;
  icon: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;
  input?: number;
  output?: number;
}

export interface WorkflowPanelProps {
  steps: WorkflowStep[];
  activeStepId: string;
  onStepClick: (stepId: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function WorkflowPanel({
  steps,
  activeStepId,
  onStepClick,
  collapsed,
  onToggleCollapse,
}: WorkflowPanelProps) {
  if (collapsed) {
    return (
      <div className="flex flex-col w-10 shrink-0 border-r border-sidebar-border bg-sidebar h-full">
        <div className="flex items-center justify-center h-10 border-b border-sidebar-border">
          <button
            type="button"
            aria-label="Expand workflow panel"
            className="flex items-center justify-center w-7 h-7 rounded hover:bg-muted cursor-pointer bg-transparent border-none"
            onClick={onToggleCollapse}
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="flex flex-col items-center gap-2 pt-3">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === activeStepId;
            return (
              <button
                key={step.id}
                type="button"
                title={step.label}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded cursor-pointer bg-transparent border-none transition-colors",
                  isActive ? "bg-primary/10" : "hover:bg-muted"
                )}
                onClick={() => onStepClick(step.id)}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-[200px] shrink-0 border-r border-sidebar-border bg-sidebar h-full">
      <div className="flex items-center justify-between h-10 px-3 border-b border-sidebar-border">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
          Workflow
        </span>
        <button
          type="button"
          aria-label="Collapse workflow panel"
          className="flex items-center justify-center w-6 h-6 rounded hover:bg-muted cursor-pointer bg-transparent border-none"
          onClick={onToggleCollapse}
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      <div className="flex flex-col py-1 overflow-y-auto">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = step.id === activeStepId;
          return (
            <button
              key={step.id}
              type="button"
              className={cn(
                "flex items-start gap-3 w-full px-3 py-3 text-left cursor-pointer bg-transparent border-none border-l-2 transition-colors",
                isActive
                  ? "border-l-primary bg-primary/5"
                  : "border-l-transparent hover:bg-muted/50"
              )}
              onClick={() => onStepClick(step.id)}
            >
              <Icon
                className={cn(
                  "w-4 h-4 mt-0.5 shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <div className="flex flex-col min-w-0">
                <span
                  className={cn(
                    "text-sm leading-tight truncate",
                    isActive
                      ? "font-semibold text-foreground"
                      : "font-medium text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
                {(step.input !== undefined || step.output !== undefined) && (
                  <span className="text-[11px] text-muted-foreground/70 mt-0.5 font-mono">
                    {step.input === undefined ? "" : formatCount(step.input)}
                    {step.input === undefined || step.output === undefined
                      ? ""
                      : " → "}
                    {step.output === undefined ? "" : formatCount(step.output)}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
