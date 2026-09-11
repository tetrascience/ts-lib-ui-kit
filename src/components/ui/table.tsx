import * as React from "react"

import { cn } from "@/lib/utils"

function Table({
  className,
  containerClassName,
  variant,
  layout = "auto",
  ...props
}: React.ComponentProps<"table"> & {
  containerClassName?: string
  variant?: "default" | "card"
  layout?: "auto" | "fixed"
}) {
  return (
    <div
      data-slot="table-container"
      data-variant={variant}
      tabIndex={0}
      className={cn(
        "relative w-full overflow-auto bg-card",
        variant === "card" && "rounded-lg border",
        containerClassName,
      )}
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", layout === "fixed" && "table-fixed", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({
  className,
  variant,
  ...props
}: React.ComponentProps<"thead"> & {
  variant?: "default" | "sticky"
}) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "bg-muted/50 [&_tr]:border-b",
        variant === "sticky" && "sticky top-0 z-10 bg-background",
        className,
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "group/row border-b transition-colors hover:bg-accent/50 data-[state=selected]:bg-muted in-data-[striped]:even:bg-muted/30 in-data-[striped]:hover:bg-accent/50",
        className
      )}
      {...props}
    />
  )
}

function TableHead({
  className,
  variant,
  truncate,
  ...props
}: React.ComponentProps<"th"> & {
  variant?: "default" | "numeric" | "action"
  truncate?: boolean
}) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-12 px-4 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        "in-data-[density=compact]:h-8 in-data-[density=relaxed]:h-14",
        variant === "numeric" && "text-right",
        variant === "action" && "w-10",
        truncate && "truncate",
        className,
      )}
      {...props}
    />
  )
}

function TableCell({
  className,
  variant,
  truncate,
  alwaysVisible,
  ...props
}: React.ComponentProps<"td"> & {
  variant?: "default" | "numeric" | "action"
  truncate?: boolean
  /**
   * For `variant="action"` only: keep the cell's contents visible at rest on
   * every device, instead of the default reveal-on-row-hover (SW-2535). The
   * default already shows action cells at rest on coarse pointers (touch); use
   * `alwaysVisible` to also show them at rest on hover-capable (mouse) devices.
   * No effect on other variants.
   */
  alwaysVisible?: boolean
}) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        "in-data-[density=compact]:py-2 in-data-[density=relaxed]:py-5",
        variant === "numeric" && "text-right tabular-nums",
        // Action cells reveal on row hover/focus by default. On a coarse pointer
        // (touch: no hover to reveal them) they always show, so they stay
        // discoverable on tablets/phones (SW-2535). `alwaysVisible` opts out of
        // the fade entirely, showing the actions at rest on every device.
        variant === "action" &&
          !alwaysVisible &&
          "opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 focus-within:opacity-100 pointer-coarse:opacity-100 transition-opacity",
        truncate && "truncate",
        className,
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
