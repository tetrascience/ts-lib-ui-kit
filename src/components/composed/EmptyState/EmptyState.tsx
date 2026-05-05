import {
  Database,
  FolderOpen,
  Lock,
  SearchX,
  ServerCrash,
} from "lucide-react";
import * as React from "react";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";


export type EmptyStateVariant =
  | "no-data"
  | "no-results"
  | "no-access"
  | "empty-folder"
  | "server-error";

const VARIANT_DEFAULTS: Record<
  EmptyStateVariant,
  { icon: LucideIcon; title: string; description: string }
> = {
  "no-data": {
    icon: Database,
    title: "No records yet",
    description: "Import a dataset or connect a data source to get started.",
  },
  "no-results": {
    icon: SearchX,
    title: "No results found",
    description:
      "Nothing matches your current search. Try adjusting your filters or search terms.",
  },
  "no-access": {
    icon: Lock,
    title: "Access restricted",
    description:
      "You don't have permission to view this resource. Contact your admin.",
  },
  "empty-folder": {
    icon: FolderOpen,
    title: "This folder is empty",
    description:
      "Drag files here or use the upload button to add content.",
  },
  "server-error": {
    icon: ServerCrash,
    title: "Something went wrong",
    description:
      "An unexpected error occurred. Refresh the page or try again later.",
  },
};

export interface EmptyStateProps extends React.ComponentProps<"div"> {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;
  action?: React.ReactNode;
}

function EmptyState({
  variant,
  title,
  description,
  icon,
  action,
  className,
  ...props
}: EmptyStateProps) {
  const defaults = variant ? VARIANT_DEFAULTS[variant] : undefined;
  const Icon = icon ?? defaults?.icon;
  const resolvedTitle = title ?? defaults?.title;
  const resolvedDescription = description ?? defaults?.description;

  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-14 text-center",
        className
      )}
      {...props}
    >
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Icon className="h-7 w-7 text-muted-foreground" />
        </div>
      )}
      {(resolvedTitle ?? resolvedDescription) && (
        <div className="max-w-xs space-y-1">
          {resolvedTitle && (
            <p className="text-sm font-semibold">{resolvedTitle}</p>
          )}
          {resolvedDescription && (
            <p className="text-sm text-muted-foreground">{resolvedDescription}</p>
          )}
        </div>
      )}
      {action}
    </div>
  );
}

export { EmptyState };
