import * as React from "react"

import { MoleculeRenderer, type MoleculeRendererProps } from "./MoleculeRenderer"

import { cn } from "@/lib/utils"


export interface StructureThumbnailProps
  extends Omit<MoleculeRendererProps, "width" | "height"> {
  /**
   * Fixed side length in pixels for a square thumbnail. When omitted the
   * thumbnail is responsive: it fills its container's width and stays square.
   */
  size?: number
  /** Optional caption shown beneath the structure (e.g. a compound ID). */
  label?: React.ReactNode
}

/**
 * A compact, bordered 2D structure thumbnail — sized for a table cell, list
 * row, or card. Pass `size` for a fixed square, or omit it to fill the
 * available width responsively.
 *
 * @example
 * ```tsx
 * <StructureThumbnail smiles="CCO" size={48} />
 * <StructureThumbnail smiles="CCO" label="CPD-0142" />
 * ```
 */
export function StructureThumbnail({
  smiles,
  size,
  label,
  alt,
  className,
  ...props
}: StructureThumbnailProps) {
  const sizeStyle =
    size === undefined ? undefined : { width: size, height: size }

  return (
    <figure
      data-slot="structure-thumbnail"
      className={cn("inline-flex flex-col items-center gap-1", className)}
    >
      <div
        className={cn(
          "aspect-square overflow-hidden rounded-md border border-border bg-card p-1",
          size === undefined && "w-full",
        )}
        style={sizeStyle}
      >
        <MoleculeRenderer
          smiles={smiles}
          alt={alt}
          className="size-full"
          {...props}
        />
      </div>
      {label !== undefined && (
        <figcaption className="max-w-full truncate text-2xs text-muted-foreground">
          {label}
        </figcaption>
      )}
    </figure>
  )
}
