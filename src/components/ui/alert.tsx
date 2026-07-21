import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "group/alert relative flex w-full flex-wrap  items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm [&>svg]:mt-0.5 [&>svg]:shrink-0 [&>svg]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-card text-card-foreground [&>svg]:text-foreground",
        destructive:
          "bg-destructive border-destructive/20 text-destructive-foreground [&>svg]:text-destructive-foreground",
        info:
          "bg-info border-info/20 text-info-foreground [&>svg]:text-info-foreground",
        positive:
          "bg-positive border-positive/20 text-positive-foreground [&>svg]:text-positive-foreground",
        warning:
          "bg-warning border-warning/20 text-warning-foreground [&>svg]:text-warning-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "flex-1 min-w-0 font-medium leading-none tracking-tight [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "w-full pl-7 text-sm text-balance text-current md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2 right-2", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
