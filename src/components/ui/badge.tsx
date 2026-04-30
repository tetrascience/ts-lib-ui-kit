import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import * as React from "react"

import { cn } from "@/lib/utils"
import { withVisualization } from "@/lib/visualization"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        info:
          "bg-info/15 text-info focus-visible:ring-info/20 dark:bg-info/20 dark:text-info dark:focus-visible:ring-info/40 [a]:hover:bg-info/25",
        destructive:
          "bg-destructive/15 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:text-destructive dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/25",
        positive:
          "bg-positive/15 text-positive focus-visible:ring-positive/20 dark:bg-positive/20 dark:text-positive dark:focus-visible:ring-positive/40 [a]:hover:bg-positive/25",
        warning:
          "bg-warning/15 text-warning focus-visible:ring-warning/20 dark:bg-warning/20 dark:text-warning dark:focus-visible:ring-warning/40 [a]:hover:bg-warning/25",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

const BadgeWithMeta = withVisualization(Badge, {
  id: "badge",
  inputKind: "number",
  description: "Compact scalar or status value rendered as a badge.",
  tunableProps: [
    {
      name: "variant",
      type: "select",
      description: "Badge visual style.",
      default: "default",
      options: [
        "default",
        "secondary",
        "info",
        "destructive",
        "positive",
        "warning",
        "outline",
        "ghost",
        "link",
      ],
    },
  ],
})

export { BadgeWithMeta as Badge, badgeVariants }
