import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "flex field-sizing-content w-full border border-input bg-card transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:shadow-focus disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:shadow-focus dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50",
  {
    variants: {
      // Shared control scale (SW-2591): min-height + padding/radius/text step
      // with the same rhythm as the single-line inputs.
      size: {
        xs: "min-h-12 rounded-md px-2 py-1 text-xs",
        sm: "min-h-14 rounded-md px-2.5 py-1.5 text-[0.8rem]",
        default: "min-h-16 rounded-lg px-2.5 py-2 text-base md:text-sm",
        lg: "min-h-20 rounded-lg px-3 py-2.5 text-base md:text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function Textarea({
  className,
  size,
  ...props
}: React.ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>) {
  return (
    <textarea
      data-slot="textarea"
      data-size={size ?? "default"}
      className={cn(textareaVariants({ size }), className)}
      {...props}
    />
  )
}

export { Textarea, textareaVariants }
