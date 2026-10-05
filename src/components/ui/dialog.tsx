import { XIcon } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { withRef } from "@/lib/react18-compat"
import { cn } from "@/lib/utils"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const DialogTriggerWithRef = withRef("DialogTrigger", DialogTrigger)

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const DialogCloseWithRef = withRef("DialogClose", DialogClose)

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const DialogOverlayWithRef = withRef("DialogOverlay", DialogOverlay)

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlayWithRef />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex flex-col w-[calc(100%-2rem)] max-w-lg max-h-[90svh] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card/90 dark:bg-background text-sm shadow-elevation-5 ring-1 ring-foreground/10 duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          // Safeguard: DialogContent itself has no padding (so the footer can
          // bleed full-width). Any *unslotted* child dropped straight in — raw
          // text/elements with no data-slot — is inset with mx-4 / my-2 so it's
          // never flush to the edges or butted onto the footer (SW-2528). A
          // present data-slot marks a known component (the dialog-* parts, but
          // also full-bleed children like Command in CommandDialog /
          // ModelSelector that intentionally pass p-0 + size-full), which we
          // must leave untouched. Margin (not padding) insets an element that
          // has its own background as a whole; w-auto overrides a child's w-full
          // so the margins actually shrink it instead of overflowing.
          "[&>*:not([data-slot])]:mx-4 [&>*:not([data-slot])]:my-2 [&>*:not([data-slot])]:w-auto",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" asChild>
            <Button
              // explicit dialog-close slot (overrides Button's own data-slot) so
              // the DialogContent padding safeguard above skips this button
              data-slot="dialog-close"
              variant="ghost"
              className="absolute top-2 right-2"
              size="icon-sm"
            >
              <XIcon
              />
              <span className="sr-only">Close</span>
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const DialogContentWithRef = withRef("DialogContent", DialogContent)

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex shrink-0 flex-col gap-2 px-4 pt-4 pb-2", className)}
      {...props}
    />
  )
}

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const DialogHeaderWithRef = withRef("DialogHeader", DialogHeader)

function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-body"
      className={cn("flex-1 overflow-y-auto px-4 py-2", className)}
      {...props}
    />
  )
}

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const DialogBodyWithRef = withRef("DialogBody", DialogBody)

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex shrink-0 flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 px-4 py-3 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const DialogFooterWithRef = withRef("DialogFooter", DialogFooter)

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-base leading-none font-medium", className)}
      {...props}
    />
  )
}

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const DialogTitleWithRef = withRef("DialogTitle", DialogTitle)

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const DialogDescriptionWithRef = withRef("DialogDescription", DialogDescription)

export {
  Dialog,
  DialogBodyWithRef as DialogBody,
  DialogCloseWithRef as DialogClose,
  DialogContentWithRef as DialogContent,
  DialogDescriptionWithRef as DialogDescription,
  DialogFooterWithRef as DialogFooter,
  DialogHeaderWithRef as DialogHeader,
  DialogOverlayWithRef as DialogOverlay,
  DialogPortal,
  DialogTitleWithRef as DialogTitle,
  DialogTriggerWithRef as DialogTrigger,
}
