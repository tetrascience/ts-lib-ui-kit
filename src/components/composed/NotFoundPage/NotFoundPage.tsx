import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ErrorCode = 404 | 403 | 500 | 503

const CODE_DEFAULTS: Record<
  ErrorCode,
  { title: string; description: string }
> = {
  404: {
    title: "Page not found",
    description:
      "The page you're looking for doesn't exist or has been moved.",
  },
  403: {
    title: "Access denied",
    description: "You don't have permission to view this resource.",
  },
  500: {
    title: "Server error",
    description:
      "Something went wrong on our end. Try refreshing or contact support.",
  },
  503: {
    title: "Service unavailable",
    description:
      "The service is temporarily offline for maintenance. Check back soon.",
  },
}

export interface NotFoundPageProps extends React.ComponentProps<"div"> {
  code?: ErrorCode
  title?: string
  description?: string
  action?: React.ReactNode
}

export function NotFoundPage({
  code,
  title,
  description,
  action,
  className,
  ...props
}: NotFoundPageProps) {
  const defaults = code !== undefined ? CODE_DEFAULTS[code] : undefined
  const resolvedTitle = title ?? defaults?.title
  const resolvedDescription = description ?? defaults?.description

  return (
    <div
      data-slot="not-found-page"
      className={cn(
        "flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center",
        className
      )}
      {...props}
    >
      {code !== undefined && (
        <p className="select-none text-8xl font-bold tabular-nums text-muted-foreground/40">
          {code}
        </p>
      )}
      <div className="max-w-sm space-y-2">
        {resolvedTitle && (
          <p className="text-xl font-semibold">{resolvedTitle}</p>
        )}
        {resolvedDescription && (
          <p className="text-sm text-muted-foreground">{resolvedDescription}</p>
        )}
      </div>
      {action ?? (
        <Button variant="outline">Go to home</Button>
      )}
    </div>
  )
}
