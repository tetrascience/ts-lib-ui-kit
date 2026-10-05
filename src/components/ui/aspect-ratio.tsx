"use client"

import { AspectRatio as AspectRatioPrimitive } from "radix-ui"

import { withRef } from "@/lib/react18-compat"

function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const AspectRatioWithRef = withRef("AspectRatio", AspectRatio)

export { AspectRatioWithRef as AspectRatio }
