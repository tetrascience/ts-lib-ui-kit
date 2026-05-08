import { TriangleAlertIcon } from "lucide-react"
import * as React from "react"

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

export interface ConfirmDialogProps {
  title: string
  description?: string
  variant?: "default" | "destructive"
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  onCancel?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactElement
  loading?: boolean
}

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
          <div className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            <TriangleAlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>This action cannot be undone.</span>
          </div>
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
