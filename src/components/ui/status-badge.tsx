import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type JobStatus = "running" | "queued" | "completed" | "failed" | "paused" | "cancelled";

type BadgeVariant = NonNullable<React.ComponentProps<typeof Badge>["variant"]>;

export interface StatusBadgeProps
  extends Omit<React.ComponentProps<typeof Badge>, "children" | "variant"> {
  status: JobStatus;
  pulse?: boolean;
}

const statusConfig: Record<
  JobStatus,
  {
    label: string;
    badgeVariant: BadgeVariant;
    dotClass: string;
    defaultPulse: boolean;
  }
> = {
  running: {
    label: "Running",
    badgeVariant: "info",
    dotClass: "bg-info",
    defaultPulse: true,
  },
  queued: {
    label: "Queued",
    badgeVariant: "warning",
    dotClass: "bg-warning",
    defaultPulse: false,
  },
  completed: {
    label: "Completed",
    badgeVariant: "positive",
    dotClass: "bg-positive",
    defaultPulse: false,
  },
  failed: {
    label: "Failed",
    badgeVariant: "destructive",
    dotClass: "bg-destructive",
    defaultPulse: false,
  },
  paused: {
    label: "Paused",
    badgeVariant: "accent",
    dotClass: "bg-accent",
    defaultPulse: false,
  },
  cancelled: {
    label: "Cancelled",
    badgeVariant: "muted",
    dotClass: "bg-muted-foreground/40",
    defaultPulse: false,
  },
};

function StatusBadge({ status, pulse, className, ...props }: StatusBadgeProps) {
  const config = statusConfig[status];
  const shouldPulse = pulse ?? config.defaultPulse;

  return (
    <Badge
      data-slot="status-badge"
      data-status={status}
      variant={config.badgeVariant}
      className={cn("gap-1.5 px-2.5", className)}
      {...props}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          config.dotClass,
          shouldPulse && "animate-pulse motion-reduce:animate-none",
        )}
      />
      {config.label}
    </Badge>
  );
}

export { StatusBadge };
