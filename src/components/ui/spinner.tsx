import { cva, type VariantProps } from "class-variance-authority"
import { Loader2Icon } from "lucide-react"

import { withRef } from "@/lib/react18-compat"
import { cn } from "@/lib/utils"

const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      sm: "size-5",
      default: "size-6",
      md: "size-8",
      lg: "size-12",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

function Spinner19({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"svg"> & VariantProps<typeof spinnerVariants>) {
  return (
    <Loader2Icon
      data-slot="spinner"
      data-size={size}
      role="status"
      aria-label="Loading"
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    />
  )
}

const Spinner = withRef("Spinner", Spinner19)

export { Spinner, spinnerVariants }
