import { AlertTriangleIcon } from "lucide-react"
import * as React from "react"

import { moleculeToSvg } from "./rdkit-loader"
import { useRDKit } from "./use-rdkit"

import { Skeleton } from "@/components/ui/skeleton"
import { useIsDark } from "@/hooks/use-is-dark"
import { cn } from "@/lib/utils"


export interface MoleculeRendererProps
  extends Omit<React.ComponentProps<"div">, "children" | "onError"> {
  /** SMILES string to render as a 2D structure. */
  smiles: string
  /**
   * Drawing resolution width in pixels. This sets the SVG's internal
   * coordinate space and aspect ratio; the rendered structure is vector and
   * scales to fill the wrapper, so size the wrapper via `className`.
   * @default 250
   */
  width?: number
  /** Drawing resolution height in pixels. @default 200 */
  height?: number
  /** Optional caption drawn beneath the structure by RDKit. */
  legend?: string
  /**
   * Force dark/light drawing colours. Defaults to following the active theme
   * (the `.dark` class on the document root).
   */
  dark?: boolean
  /**
   * Accessible label for the structure. Defaults to the SMILES string.
   * Rendered as the SVG group's `aria-label` and the wrapper's title.
   */
  alt?: string
  /** Extra RDKit MolDraw2D options. */
  drawOptions?: Record<string, unknown>
  /** Rendered while the WASM module and structure are being prepared. */
  loadingContent?: React.ReactNode
  /** Rendered when the SMILES is invalid or RDKit fails to load. */
  errorContent?: React.ReactNode
  /**
   * Called when the SMILES cannot be parsed into a valid molecule. May fire
   * more than once for the same input — e.g. under React StrictMode, or when
   * the drawing inputs (size, theme, options) change and the SVG is recomputed.
   */
  onError?: (smiles: string) => void
}

/** Make an RDKit SVG fluid: fill the wrapper and scale with its aspect ratio. */
function makeResponsive(svg: string): string {
  return svg
    .replace(/width=(['"])[^'"]*\1/, `width='100%'`)
    .replace(/height=(['"])[^'"]*\1/, `height='100%'`)
}

/**
 * Core cheminformatics primitive: render a 2D chemical structure from a SMILES
 * string. RDKit's WASM module is loaded lazily on first mount (see
 * {@link loadRDKit}), so pages that never render a molecule pay nothing for it.
 *
 * The output is a vector SVG that fills this component's box — size it with
 * `className` (e.g. `className="size-32"`). Invalid SMILES render a fallback
 * rather than throwing.
 *
 * @example
 * ```tsx
 * <MoleculeRenderer smiles="CC(=O)Oc1ccccc1C(=O)O" className="size-40" />
 * ```
 */
export function MoleculeRenderer({
  smiles,
  width = 250,
  height = 200,
  legend,
  dark,
  alt,
  drawOptions,
  loadingContent,
  errorContent,
  onError,
  className,
  ...props
}: MoleculeRendererProps) {
  const { rdkit, status } = useRDKit()
  const isDark = useIsDark()
  const useDark = dark ?? isDark

  const label = alt ?? smiles
  const onErrorRef = React.useRef(onError)
  React.useEffect(() => {
    onErrorRef.current = onError
  })

  const svg = React.useMemo(() => {
    if (!rdkit) return null
    const drawn = moleculeToSvg(rdkit, smiles, {
      width,
      height,
      dark: useDark,
      legend,
      drawOptions,
    })
    if (drawn === null) {
      onErrorRef.current?.(smiles)
      return null
    }
    return makeResponsive(drawn)
  }, [rdkit, smiles, width, height, useDark, legend, drawOptions])

  const failed = status === "error" || (status === "ready" && svg === null)

  return (
    <div
      data-slot="molecule-renderer"
      className={cn("relative flex items-center justify-center", className)}
      title={label}
      aria-busy={status === "loading"}
      {...props}
    >
      {status === "loading" &&
        (loadingContent ?? (
          <Skeleton
            role="img"
            aria-label={`Loading structure: ${label}`}
            className="size-full rounded-md"
          />
        ))}

      {failed &&
        (errorContent ?? (
          <div
            role="img"
            aria-label={`Unable to render structure: ${label}`}
            className="flex size-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border p-2 text-center text-muted-foreground"
          >
            <AlertTriangleIcon className="size-4 shrink-0" aria-hidden />
            <span className="text-2xs leading-tight break-all">
              Invalid structure
            </span>
          </div>
        ))}

      {status === "ready" && svg !== null && (
        <div
          // RDKit emits the SVG markup itself; the SMILES is only ever parsed
          // into a molecule, never echoed into the DOM, so this is trusted.
          role="img"
          aria-label={label}
          className="size-full [&>svg]:size-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
    </div>
  )
}
