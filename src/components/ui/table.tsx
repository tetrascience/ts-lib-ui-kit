import * as React from "react"

import { withRef } from "@/lib/react18-compat"
import { cn } from "@/lib/utils"

function Table19({
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

const Table = withRef("Table", Table19)

function TableHeader19({
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

const TableHeader = withRef("TableHeader", TableHeader19)

function TableBody19({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

const TableBody = withRef("TableBody", TableBody19)

function TableFooter19({ className, ...props }: React.ComponentProps<"tfoot">) {
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

const TableFooter = withRef("TableFooter", TableFooter19)

function TableRow19({ className, ...props }: React.ComponentProps<"tr">) {
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

const TableRow = withRef("TableRow", TableRow19)

function TableHead19({
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

const TableHead = withRef("TableHead", TableHead19)

function TableCell19({
  className,
  variant,
  truncate,
  ...props
}: React.ComponentProps<"td"> & {
  variant?: "default" | "numeric" | "action"
  truncate?: boolean
}) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        "in-data-[density=compact]:py-2 in-data-[density=relaxed]:py-5",
        variant === "numeric" && "text-right tabular-nums",
        variant === "action" &&
          "opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 focus-within:opacity-100 transition-opacity",
        truncate && "truncate",
        className,
      )}
      {...props}
    />
  )
}

const TableCell = withRef("TableCell", TableCell19)

function TableCaption19({
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

const TableCaption = withRef("TableCaption", TableCaption19)

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
