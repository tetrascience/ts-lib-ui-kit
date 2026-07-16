import * as React from "react"

import { MoleculeRenderer } from "./MoleculeRenderer"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useIsDark } from "@/hooks/use-is-dark"
import { cn } from "@/lib/utils"


export interface StructureTooltipProps {
  /** SMILES string to render inside the tooltip. */
  smiles: string
  /** The element that triggers the tooltip on hover/focus. */
  children: React.ReactNode
  /** Heading shown above the structure (e.g. a compound ID). */
  title?: React.ReactNode
  /** Extra content beneath the structure (e.g. QED, MW rows). */
  footer?: React.ReactNode
  /** Side length in pixels of the structure inside the tooltip. @default 180 */
  size?: number
  /** Tooltip side. @default "top" */
  side?: React.ComponentProps<typeof TooltipContent>["side"]
  /** Delay before the tooltip opens, in ms. @default 100 */
  delayDuration?: number
  /** Class applied to the tooltip content surface. */
  className?: string
}

/**
 * Wrap any element so that hovering (or focusing) it reveals a 2D chemical
 * structure in a popover — the hover affordance for compound IDs in tables and
 * for points in an interactive scatter.
 *
 * @example
 * ```tsx
 * <StructureTooltip smiles="CCO" title="CPD-0142" footer={<span>QED 0.81</span>}>
 *   <span className="underline decoration-dotted">CPD-0142</span>
 * </StructureTooltip>
 * ```
 */
export function StructureTooltip({
  smiles,
  children,
  title,
  footer,
  size = 180,
  side = "top",
  delayDuration = 100,
  className,
}: StructureTooltipProps) {
  const isDark = useIsDark()

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className={cn("flex flex-col gap-1.5 p-2", className)}>
          {title !== undefined && (
            <div className="text-xs font-medium">{title}</div>
          )}
          {/* The tooltip surface is `bg-foreground` — the inverse of the page
              surface — so draw the structure in the opposite mode for contrast
              (light structure on the dark bubble in light theme). Keeping the
              default surface means the default arrow matches, unlike a custom
              light card. */}
          <div
            className="overflow-hidden rounded-sm"
            style={{ width: size, height: size }}
          >
            <MoleculeRenderer
              smiles={smiles}
              dark={!isDark}
              className="size-full"
            />
          </div>
          {footer !== undefined && (
            <div className="text-2xs opacity-80">{footer}</div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
