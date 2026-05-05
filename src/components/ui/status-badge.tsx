import * as React from "react";

import { cn } from "@/lib/utils";

export type JobStatus =
  | "running"
  | "queued"
  | "completed"
  | "failed"
  | "paused"
  | "cancelled";

export interface StatusBadgeProps extends React.ComponentProps<"span"> {
  status: JobStatus;
  pulse?: boolean;
}

const statusConfig: Record<
  JobStatus,
  { label: string; badgeClass: string; dotClass: string; defaultPulse: boolean }
> = {
  running: {
    label: "Running",
    badgeClass:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
    dotClass: "bg-blue-500",
    defaultPulse: true,
  },
  queued: {
    label: "Queued",
    badgeClass:
      "border-warning/30 bg-warning/10 text-warning dark:border-warning/30 dark:bg-warning/20",
    dotClass: "bg-warning",
    defaultPulse: false,
  },
  completed: {
    label: "Completed",
    badgeClass:
      "border-positive/30 bg-positive/10 text-positive dark:border-positive/30 dark:bg-positive/20",
    dotClass: "bg-positive",
    defaultPulse: false,
  },
  failed: {
    label: "Failed",
    badgeClass:
      "border-destructive/30 bg-destructive/10 text-destructive dark:border-destructive/30 dark:bg-destructive/20",
    dotClass: "bg-destructive",
    defaultPulse: false,
  },
  paused: {
    label: "Paused",
    badgeClass:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300",
    dotClass: "bg-violet-500",
    defaultPulse: false,
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "border-border bg-muted text-muted-foreground",
    dotClass: "bg-muted-foreground/40",
    defaultPulse: false,
  },
};

function StatusBadge({ status, pulse, className, ...props }: StatusBadgeProps) {
  const config = statusConfig[status];
  const shouldPulse = pulse ?? config.defaultPulse;

  return (
    <span
      data-slot="status-badge"
      data-status={status}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.badgeClass,
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          config.dotClass,
          shouldPulse && "animate-pulse"
        )}
      />
      {config.label}
    </span>
  );
}

export { StatusBadge };
