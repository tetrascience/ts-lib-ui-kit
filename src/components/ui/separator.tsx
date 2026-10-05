import { Separator as SeparatorPrimitive } from "radix-ui"
import * as React from "react"

import { withRef } from "@/lib/react18-compat"
import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        className
      )}
      {...props}
    />
  )
}

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const SeparatorWithRef = withRef("Separator", Separator)

export { SeparatorWithRef as Separator }
