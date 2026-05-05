import {
  AlertCircle,
  CheckCircle2,
  GitBranch,
  Info,
  Upload,
  UserCheck,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ActivityEventType =
  | "success"
  | "info"
  | "warning"
  | "error"
  | "upload"
  | "user"
  | "deploy";

export interface ActivityFeedItem {
  id: string;
  type: ActivityEventType;
  title: string;
  description?: string;
  actor?: string;
  timestamp: string;
  badges?: string[];
}

export interface ActivityFeedProps extends React.ComponentProps<"div"> {
  items: ActivityFeedItem[];
  onLoadMore?: () => void;
}

const EVENT_ICON: Record<ActivityEventType, React.FC<React.SVGProps<SVGSVGElement>>> = {
  success: CheckCircle2,
  info: Info,
  warning: AlertCircle,
  error: AlertCircle,
  upload: Upload,
  user: UserCheck,
  deploy: GitBranch,
};

const EVENT_ICON_CN: Record<ActivityEventType, string> = {
  success: "text-positive dark:text-positive",
  info: "text-info dark:text-info",
  warning: "text-warning dark:text-warning",
  error: "text-destructive dark:text-destructive",
  upload: "text-violet-600 dark:text-violet-400",
  user: "text-sky-600 dark:text-sky-400",
  deploy: "text-indigo-600 dark:text-indigo-400",
};

const EVENT_DOT_CN: Record<ActivityEventType, string> = {
  success: "bg-positive",
  info: "bg-info",
  warning: "bg-warning",
  error: "bg-destructive",
  upload: "bg-violet-500",
  user: "bg-sky-500",
  deploy: "bg-indigo-500",
};

function ActivityFeed({
  items,
  onLoadMore,
  className,
  ...props
}: ActivityFeedProps) {
  return (
    <div
      data-slot="activity-feed"
      className={cn("relative flex flex-col", className)}
      {...props}
    >
      <div className="absolute left-[1.1875rem] top-2 bottom-2 w-px bg-border" />
      <div className="flex flex-col">
        {items.map((item) => {
          const Icon = EVENT_ICON[item.type];
          return (
            <div key={item.id} className="flex gap-3 px-4 py-3">
              <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-card ring-2 ring-border">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    EVENT_DOT_CN[item.type]
                  )}
                />
              </div>
              <div className="flex flex-1 flex-col gap-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Icon
                    className={cn("h-4 w-4 shrink-0", EVENT_ICON_CN[item.type])}
                  />
                  <span className="text-sm font-medium leading-tight">
                    {item.title}
                  </span>
                  {item.badges?.map((badge) => (
                    <Badge key={badge} variant="secondary">
                      {badge}
                    </Badge>
                  ))}
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {item.timestamp}
                  </span>
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
                {item.actor && (
                  <p className="text-xs text-muted-foreground">
                    by {item.actor}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {onLoadMore && (
        <div className="flex justify-center px-4 py-3">
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={onLoadMore}
          >
            Load older activity
          </button>
        </div>
      )}
    </div>
  );
}

export { ActivityFeed };
