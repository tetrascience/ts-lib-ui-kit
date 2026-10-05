"use client"

import { AspectRatio as AspectRatioPrimitive } from "radix-ui"

import { withRef } from "@/lib/react18-compat"

function AspectRatio19({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}

const AspectRatio = withRef("AspectRatio", AspectRatio19)

export { AspectRatio }
