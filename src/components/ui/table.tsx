import * as React from "react"

import { withRef } from "@/lib/react18-compat"
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

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const TableWithRef = withRef("Table", Table)

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

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const TableHeaderWithRef = withRef("TableHeader", TableHeader)

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const TableBodyWithRef = withRef("TableBody", TableBody)

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

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const TableFooterWithRef = withRef("TableFooter", TableFooter)

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

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const TableRowWithRef = withRef("TableRow", TableRow)

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

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const TableHeadWithRef = withRef("TableHead", TableHead)

function TableCell({
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

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const TableCellWithRef = withRef("TableCell", TableCell)

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

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const TableCaptionWithRef = withRef("TableCaption", TableCaption)

export {
  TableWithRef as Table,
  TableHeaderWithRef as TableHeader,
  TableBodyWithRef as TableBody,
  TableFooterWithRef as TableFooter,
  TableHeadWithRef as TableHead,
  TableRowWithRef as TableRow,
  TableCellWithRef as TableCell,
  TableCaptionWithRef as TableCaption,
}
