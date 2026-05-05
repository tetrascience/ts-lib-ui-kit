import { cva, type VariantProps } from "class-variance-authority";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const bannerVariants = cva(
  "flex w-full items-start gap-3 border px-4 py-3 text-sm",
  {
    variants: {
      variant: {
        info: "border-info/20 bg-info/10 text-info",
        positive: "border-positive/20 bg-positive/10 text-positive",
        warning: "border-warning/20 bg-warning/10 text-warning",
        destructive:
          "border-destructive/20 bg-destructive/10 text-destructive",
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

export interface BannerProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof bannerVariants> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

function Banner({
  variant = "info",
  title,
  description,
  action,
  dismissible = false,
  onDismiss,
  className,
  children,
  ...props
}: BannerProps) {
  const Icon = BANNER_ICONS[variant ?? "info"];

  return (
    <div
      data-slot="banner"
      data-variant={variant}
      role="status"
      className={cn(bannerVariants({ variant }), className)}
      {...props}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="flex flex-1 flex-col gap-0.5">
        {title && <p className="font-medium leading-snug">{title}</p>}
        {description && (
          <p className="text-current/80 leading-snug">{description}</p>
        )}
        {children}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss"
          className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export { Banner, bannerVariants };
