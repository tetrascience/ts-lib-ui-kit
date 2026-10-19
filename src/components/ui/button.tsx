import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Disabled uses a neutral muted treatment per variant (SW-2443) rather than a
  // blanket opacity fade, which failed AA text contrast and left the transparent
  // variants indistinguishable from enabled.
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:shadow-focus active:translate-y-px disabled:pointer-events-none aria-invalid:border-destructive aria-invalid:shadow-focus dark:aria-invalid:border-destructive/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[color-mix(in_oklab,var(--primary),var(--primary-foreground)_15%)] disabled:bg-muted disabled:text-muted-foreground",
        outline:
          "border-border bg-transparent hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent aria-expanded:text-accent-foreground dark:border-input aria-pressed:bg-selected aria-pressed:text-selected-foreground aria-pressed:shadow-(--shadow-inset-pressed) disabled:border-border disabled:bg-muted/40 disabled:text-muted-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklab,var(--secondary),var(--secondary-foreground)_15%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground disabled:bg-muted disabled:text-muted-foreground",
        ghost:
          "hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent aria-expanded:text-accent-foreground aria-pressed:bg-selected aria-pressed:text-selected-foreground aria-pressed:shadow-(--shadow-inset-pressed) disabled:text-muted-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:border-destructive/40 disabled:bg-muted disabled:text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline disabled:text-muted-foreground disabled:no-underline",
        // One step in a trail of steps (UXT-177). The current and done looks are
        // keyed on `aria-current="step"` and `data-done`, so what is shown and what
        // a screen reader hears can't drift apart; callers add a tick to a done
        // step so colour is never the only sign. Tailwind orders `aria-*` and
        // `data-*` after `hover:` and `disabled:`, so the two state looks outrank
        // both: a disabled trail (e.g. while saving) keeps showing where you are,
        // and only a to-do step mutes. A done step loses its border only when it
        // isn't also current, which keeps the current step's primary border.
        // To do is transparent, like `outline`: a `bg-card` fill would put muted
        // text on --card, which is under AA (4.14:1) in dark mode.
        step: "border-border bg-transparent font-semibold text-muted-foreground hover:border-primary/35 hover:text-foreground disabled:bg-muted/40 aria-[current=step]:border-primary aria-[current=step]:bg-primary/8 aria-[current=step]:text-primary aria-[current=step]:hover:bg-primary/15 data-done:bg-primary/8 data-done:text-primary data-done:hover:bg-primary/15 data-done:not-aria-[current=step]:border-transparent",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    compoundVariants: [
      // A step is a pill at every size (the xs/sm radii would otherwise win), and
      // at the default size it is the compact 28px chip of a step trail.
      { variant: "step", className: "rounded-full" },
      {
        variant: "step",
        size: "default",
        className: "h-7 px-[11px] text-xs [&_svg:not([class*='size-'])]:size-3",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
