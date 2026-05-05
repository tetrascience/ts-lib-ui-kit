import * as React from "react"

import { FieldGroup } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export interface FormSectionProps extends React.ComponentProps<"div"> {
  title: string
  description?: string
  children: React.ReactNode
}

export function FormSection({
  title,
  description,
  children,
  className,
  ...props
}: FormSectionProps) {
  return (
    <div
      data-slot="form-section"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      <div className="space-y-0.5">
        <p className="text-sm font-semibold">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Separator />
      <FieldGroup>{children}</FieldGroup>
    </div>
  )
}
