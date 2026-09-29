import { Slider as SliderPrimitive } from "radix-ui"
import * as React from "react"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  size = "default",
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  // SW-2591: default (thumb 12 / track 4) unchanged; xs and lg scale around it.
  size?: "xs" | "sm" | "default" | "lg"
}) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      data-size={size}
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "group/slider relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow overflow-hidden rounded-full bg-muted data-horizontal:h-1 data-vertical:w-1 group-data-[size=xs]/slider:data-horizontal:h-0.5 group-data-[size=xs]/slider:data-vertical:w-0.5 group-data-[size=lg]/slider:data-horizontal:h-1.5 group-data-[size=lg]/slider:data-vertical:w-1.5 data-horizontal:w-full data-vertical:h-full"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute bg-primary select-none data-horizontal:h-full data-vertical:w-full"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          aria-label={_values.length > 1 ? `Value ${index + 1}` : "Value"}
          data-slot="slider-thumb"
          key={index}
          className="relative block size-3 shrink-0 rounded-full border border-ring bg-white transition-[color,box-shadow] select-none group-data-[size=xs]/slider:size-2.5 group-data-[size=lg]/slider:size-3.5 after:absolute after:-inset-2 focus-visible:shadow-focus focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
