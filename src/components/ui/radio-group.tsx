"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import * as React from "react"

import { cn } from "@/lib/utils"

type RadioSize = "xs" | "sm" | "default" | "lg"

const RadioGroupContext = React.createContext<{ size?: RadioSize }>({})

function RadioGroup({
  className,
  size,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root> & { size?: RadioSize }) {
  return (
    <RadioGroupContext.Provider value={{ size: size ?? "default" }}>
      <RadioGroupPrimitive.Root
        data-slot="radio-group"
        className={cn("grid w-full gap-2", className)}
        {...props}
      />
    </RadioGroupContext.Provider>
  )
}

const radioGroupItemVariants = cva(
  "group/radio-group-item peer relative flex aspect-square shrink-0 rounded-full border border-input bg-card outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:shadow-focus aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",
  {
    variants: {
      // Box scale (SW-2591): default stays 16 (no visual change); xs 14 / lg 20.
      size: {
        xs: "size-3.5",
        sm: "size-4",
        default: "size-4",
        lg: "size-5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function RadioGroupItem({
  className,
  size,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> &
  VariantProps<typeof radioGroupItemVariants>) {
  const context = React.useContext(RadioGroupContext)
  const resolved = size ?? context.size ?? "default"
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      data-size={resolved}
      className={cn(radioGroupItemVariants({ size: resolved }), className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-full items-center justify-center"
      >
        <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground group-data-[size=xs]/radio-group-item:size-1.5 group-data-[size=lg]/radio-group-item:size-2.5" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem, radioGroupItemVariants }
