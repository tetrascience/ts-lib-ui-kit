import { AlertTriangleIcon, CheckIcon, XIcon } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

export type StepStatus = "pending" | "active" | "completed" | "error" | "warning"

export interface StepperStep {
  title: string
  status: StepStatus
}

export interface StepperProps extends React.ComponentProps<"ol"> {
  steps: StepperStep[]
}

const STATUS_CLASSES: Record<StepStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  active: "bg-primary text-primary-foreground",
  completed: "bg-positive/15 text-positive",
  error: "bg-destructive/15 text-destructive",
  warning: "bg-warning/15 text-warning",
}

const STATUS_TITLE_CLASSES: Record<StepStatus, string> = {
  pending: "text-muted-foreground",
  active: "text-foreground font-medium",
  completed: "text-foreground",
  error: "text-destructive",
  warning: "text-warning",
}

const STATUS_LABELS: Record<StepStatus, string> = {
  pending: "not started",
  active: "current step",
  completed: "completed",
  error: "error",
  warning: "warning",
}

function StepIcon({ status, index }: { status: StepStatus; index: number }) {
  if (status === "completed") return <CheckIcon className="size-3.5" />
  if (status === "error") return <XIcon className="size-3.5" />
  if (status === "warning") return <AlertTriangleIcon className="size-3.5" />
  return <span className="text-xs font-semibold leading-none">{index + 1}</span>
}

export function Stepper({ steps, className, ...props }: StepperProps) {
  return (
    <ol
      data-slot="stepper"
      aria-label="Progress steps"
      aria-live="polite"
      aria-atomic="false"
      className={cn("flex w-full items-start", className)}
      {...props}
    >
      {steps.map((step, i) => (
        <li
          key={step.title}
          aria-roledescription="step"
          aria-current={step.status === "active" ? "step" : undefined}
          className={cn(
            "flex items-start",
            i < steps.length - 1 ? "flex-1" : "shrink-0"
          )}
        >
          <div className="flex flex-col items-center gap-1.5 min-w-0">
            <div
              data-slot="stepper-indicator"
              data-status={step.status}
              aria-hidden="true"
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full",
                STATUS_CLASSES[step.status]
              )}
            >
              <StepIcon status={step.status} index={i} />
            </div>
            <span
              data-slot="stepper-title"
              className={cn(
                "max-w-[80px] text-center text-xs leading-tight break-words",
                STATUS_TITLE_CLASSES[step.status]
              )}
            >
              {step.title}
              <span className="sr-only"> — {STATUS_LABELS[step.status]}</span>
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              data-slot="stepper-connector"
              aria-hidden="true"
              className="mt-3.5 flex-1 shrink-0 border-t border-border"
            />
          )}
        </li>
      ))}
    </ol>
  )
}
