"use client"

import { AspectRatio as AspectRatioPrimitive } from "radix-ui"

import { withRef } from "@/lib/react18-compat"

const AspectRatio = withRef("AspectRatio", function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
})

export { AspectRatio }
