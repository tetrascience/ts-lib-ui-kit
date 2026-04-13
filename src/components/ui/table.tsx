import * as React from "react"

import { cn } from "@/lib/utils"

function Table({
  className,
  containerClassName,
  variant,
  ...props
}: React.ComponentProps<"table"> & {
  containerClassName?: string
  variant?: "default" | "card"
}) {
  return (
    <div
      data-slot="table-container"
      data-variant={variant}
      className={cn(
        "relative w-full overflow-auto",
        variant === "card" && "rounded-lg border bg-card",
        containerClassName,
      )}
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
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
        "group/row border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted in-data-[striped]:even:bg-muted/30 in-data-[striped]:hover:bg-muted/50",
        className
      )}
      {...props}
    />
  )
}

function TableHead({
  className,
  variant,
  ...props
}: React.ComponentProps<"th"> & {
  variant?: "default" | "numeric" | "action"
}) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-12 px-4 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        "in-data-[density=compact]:h-8 in-data-[density=relaxed]:h-14",
        variant === "numeric" && "text-right",
        variant === "action" && "w-10",
        className,
      )}
      {...props}
    />
  )
}

function TableCell({
  className,
  variant,
  ...props
}: React.ComponentProps<"td"> & {
  variant?: "default" | "numeric" | "action"
}) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        "in-data-[density=compact]:py-2 in-data-[density=relaxed]:py-5",
        variant === "numeric" && "text-right tabular-nums",
        variant === "action" &&
          "opacity-0 group-hover/row:opacity-100 transition-opacity",
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
