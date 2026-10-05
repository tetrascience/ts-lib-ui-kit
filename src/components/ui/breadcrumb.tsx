import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"
import { Slot } from "radix-ui"
import * as React from "react"

import { withRef } from "@/lib/react18-compat"
import { cn } from "@/lib/utils"


function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className={cn(className)}
      {...props}
    />
  )
}

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const BreadcrumbWithRef = withRef("Breadcrumb", Breadcrumb)

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm wrap-break-word text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const BreadcrumbListWithRef = withRef("BreadcrumbList", BreadcrumbList)

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  )
}

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const BreadcrumbItemWithRef = withRef("BreadcrumbItem", BreadcrumbItem)

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "a"

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("transition-colors hover:text-foreground", className)}
      {...props}
    />
  )
}

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const BreadcrumbLinkWithRef = withRef("BreadcrumbLink", BreadcrumbLink)

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
  )
}

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const BreadcrumbPageWithRef = withRef("BreadcrumbPage", BreadcrumbPage)

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? (
        <ChevronRightIcon />
      )}
    </li>
  )
}

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const BreadcrumbSeparatorWithRef = withRef("BreadcrumbSeparator", BreadcrumbSeparator)

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn(
        "flex size-5 items-center justify-center [&>svg]:size-4",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon
      />
      <span className="sr-only">More</span>
    </span>
  )
}

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const BreadcrumbEllipsisWithRef = withRef("BreadcrumbEllipsis", BreadcrumbEllipsis)

export {
  BreadcrumbWithRef as Breadcrumb,
  BreadcrumbListWithRef as BreadcrumbList,
  BreadcrumbItemWithRef as BreadcrumbItem,
  BreadcrumbLinkWithRef as BreadcrumbLink,
  BreadcrumbPageWithRef as BreadcrumbPage,
  BreadcrumbSeparatorWithRef as BreadcrumbSeparator,
  BreadcrumbEllipsisWithRef as BreadcrumbEllipsis,
}
