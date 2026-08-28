import { type VariantProps } from "class-variance-authority"
import { CircleDashed, Check } from "lucide-react"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"
import * as React from "react"

import { toggleVariants } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }
>({
  size: "default",
  variant: "default",
  spacing: 0,
  orientation: "horizontal",
})

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  orientation = "horizontal",
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-lg data-[size=sm]:rounded-[min(var(--radius-md),10px)] data-vertical:flex-col data-vertical:items-stretch",
        // SW-2445: a segmented group (spacing=0) is always outlined — a single
        // container border — so the segments read in every variant and in every
        // state (none / some / all selected), not only variant="outline".
        "data-[spacing=0]:border data-[spacing=0]:border-input",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant = "default",
  size = "default",
  selectedIndicator = "none",
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants> & {
    /**
     * Leading indicator for the selectable state (SW-2445). `"dot"` shows a
     * faint dotted ring when off that cross-fades to a check when on — a resting
     * affordance so an item reads as "selectable" and stays legible when every
     * option is selected. `"none"` (default) suits icon-only groups, where the
     * tint + pressed + dividers carry the state.
     */
    selectedIndicator?: "dot" | "none"
  }) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        "shrink-0 group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2 focus:z-10 focus-visible:z-10 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-lg group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-lg group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-lg group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-lg",
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        // SW-2445: in a segmented group the container draws the outer border;
        // each item drops its own border and instead draws a divider on its
        // leading edge, so the segments stay countable even when all are on.
        "group-data-[spacing=0]/toggle-group:border-0 group-data-[spacing=0]/toggle-group:border-input group-data-horizontal/toggle-group:data-[spacing=0]:[&:not(:first-child)]:border-l group-data-vertical/toggle-group:data-[spacing=0]:[&:not(:first-child)]:border-t",
        className
      )}
      {...props}
    >
      {selectedIndicator === "dot" && (
        <span
          aria-hidden
          className="grid size-4 shrink-0 place-items-center [&>svg]:[grid-area:1/1]"
        >
          <CircleDashed className="size-3.5 text-muted-foreground/50 transition-opacity group-data-[state=on]/toggle:opacity-0" />
          <Check className="size-3.5 opacity-0 transition-opacity group-data-[state=on]/toggle:opacity-100" />
        </span>
      )}
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }
