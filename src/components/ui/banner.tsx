import { cva, type VariantProps } from "class-variance-authority";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const bannerVariants = cva(
  "flex w-full items-start gap-3 px-4 py-3 text-sm",
  {
    variants: {
      variant: {
        info: "bg-info text-info-foreground",
        positive: "bg-positive text-positive-foreground",
        warning: "bg-warning text-warning-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

const BANNER_ICONS = {
  info: Info,
  positive: CheckCircle2,
  warning: AlertTriangle,
  destructive: XCircle,
} as const;

type DismissibleProps =
  | { dismissible: true; onDismiss: () => void }
  | { dismissible?: false; onDismiss?: never };

export type BannerProps = React.ComponentProps<"div"> &
  VariantProps<typeof bannerVariants> &
  DismissibleProps & {
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
  };

function Banner({
  variant = "info",
  title,
  description,
  action,
  dismissible = false,
  onDismiss,
  className,
  children,
  role,
  "aria-live": ariaLive,
  ...props
}: BannerProps) {
  const resolvedVariant = variant ?? "info";
  const Icon = BANNER_ICONS[resolvedVariant];
  const isUrgentBanner =
    resolvedVariant === "warning" || resolvedVariant === "destructive";
  const resolvedRole = role ?? (isUrgentBanner ? "alert" : "status");
  const resolvedAriaLive = ariaLive ?? (isUrgentBanner ? "assertive" : "polite");

  return (
    <div
      data-slot="banner"
      data-variant={resolvedVariant}
      role={resolvedRole}
      aria-live={resolvedAriaLive}
      className={cn(bannerVariants({ variant: resolvedVariant }), className)}
      {...props}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="flex flex-1 flex-col gap-0.5">
        {title && <p className="font-medium leading-snug">{title}</p>}
        {description && <p className="leading-snug">{description}</p>}
        {children}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {dismissible && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="ml-auto shrink-0 text-current hover:bg-current/15 hover:text-current"
          onClick={onDismiss}
        >
          <X />
          <span className="sr-only">Dismiss</span>
        </Button>
      )}
    </div>
  );
}

export { Banner, bannerVariants };
