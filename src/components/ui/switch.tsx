"use client"

import { Switch as SwitchPrimitive } from "radix-ui"
import * as React from "react"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  // SW-2591: sm + default are unchanged; xs and lg are added around them.
  size?: "xs" | "sm" | "default" | "lg"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:shadow-focus aria-invalid:border-destructive aria-invalid:shadow-focus data-[size=xs]:h-3 data-[size=xs]:w-5 data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=lg]:h-[22px] data-[size=lg]:w-10 dark:aria-invalid:border-destructive/50 data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=xs]/switch:size-2.5 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:size-4 group-data-[size=lg]/switch:size-5 data-checked:translate-x-[calc(100%-2px)] data-unchecked:translate-x-0 dark:data-checked:bg-primary-foreground dark:data-unchecked:bg-foreground"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
