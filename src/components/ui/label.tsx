"use client"

import { Label as LabelPrimitive } from "radix-ui"
import * as React from "react"

import { withRef } from "@/lib/react18-compat"
import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const LabelWithRef = withRef("Label", Label)

export { LabelWithRef as Label }
