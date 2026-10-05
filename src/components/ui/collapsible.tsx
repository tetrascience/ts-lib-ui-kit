"use client"

import { Collapsible as CollapsiblePrimitive } from "radix-ui"

import { withRef } from "@/lib/react18-compat"

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const CollapsibleWithRef = withRef("Collapsible", Collapsible)

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const CollapsibleTriggerWithRef = withRef("CollapsibleTrigger", CollapsibleTrigger)

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  )
}

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const CollapsibleContentWithRef = withRef("CollapsibleContent", CollapsibleContent)

export { CollapsibleWithRef as Collapsible, CollapsibleTriggerWithRef as CollapsibleTrigger, CollapsibleContentWithRef as CollapsibleContent }
