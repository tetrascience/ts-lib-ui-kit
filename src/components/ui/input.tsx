import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "w-full min-w-0 border border-input bg-card py-1 transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:shadow-focus disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:shadow-focus dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50",
  {
    variants: {
      // Shared control scale (SW-2591): 24 / 28 / 32 / 36, matching Button.
      size: {
        xs: "h-6 rounded-md px-2 text-xs",
        sm: "h-7 rounded-md px-2.5 text-[0.8rem]",
        default: "h-8 rounded-lg px-2.5 text-base md:text-sm",
        lg: "h-9 rounded-lg px-3 text-base md:text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function Input({
  className,
  type,
  size,
  htmlSize,
  ...props
}: Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants> & {
    /** Native HTML `size` attribute (visible character width); the CVA `size` prop takes the name. */
    htmlSize?: number
  }) {
  return (
    <input
      type={type}
      data-slot="input"
      data-size={size ?? "default"}
      size={htmlSize}
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  )
}

export { Input, inputVariants }
