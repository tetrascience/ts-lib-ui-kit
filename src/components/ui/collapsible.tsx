"use client"

import { Collapsible as CollapsiblePrimitive } from "radix-ui"

import { withRef } from "@/lib/react18-compat"

function Collapsible19({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

const Collapsible = withRef("Collapsible", Collapsible19)

function CollapsibleTrigger19({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

const CollapsibleTrigger = withRef("CollapsibleTrigger", CollapsibleTrigger19)

function CollapsibleContent19({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  )
}

const CollapsibleContent = withRef("CollapsibleContent", CollapsibleContent19)

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
