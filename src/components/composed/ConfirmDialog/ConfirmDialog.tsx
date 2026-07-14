import * as React from "react"

import { Banner } from "@/components/ui/banner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"

interface ConfirmDialogBaseProps {
  title: string
  description?: string
  variant?: "default" | "destructive"
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  onCancel?: () => void
  trigger?: React.ReactElement
  loading?: boolean
}

type ConfirmDialogControlledProps = ConfirmDialogBaseProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ConfirmDialogUncontrolledProps = ConfirmDialogBaseProps & {
  open?: never
  onOpenChange?: never
}

export type ConfirmDialogProps =
  | ConfirmDialogControlledProps
  | ConfirmDialogUncontrolledProps

export function ConfirmDialog({
  title,
  description,
  variant = "default",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  open,
  onOpenChange,
  trigger,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        {variant === "destructive" && (
          <Banner
            variant="destructive"
            description="This action cannot be undone."
            className="rounded-md"
          />
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onCancel}>
              {cancelLabel}
            </Button>
          </DialogClose>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading && <Spinner size="sm" className="mr-2" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
