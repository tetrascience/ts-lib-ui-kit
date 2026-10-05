import * as React from "react"

import { FieldGroup } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { withRef } from "@/lib/react18-compat"
import { cn } from "@/lib/utils"

export interface FormSectionProps extends React.ComponentProps<"div"> {
  heading: string
  description?: string
  children: React.ReactNode
}

function FormSection({
  heading,
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
        <p className="text-sm font-semibold">{heading}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Separator />
      <FieldGroup>{children}</FieldGroup>
    </div>
  )
}

// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const FormSectionWithRef = withRef("FormSection", FormSection)
export { FormSectionWithRef as FormSection }
