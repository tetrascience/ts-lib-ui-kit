import { useEffect, useState } from "react"

import { loadRDKit } from "./rdkit-loader"

import type { RDKitModule } from "@rdkit/rdkit"

/** Lifecycle of the lazily-loaded RDKit module. */
export type RDKitStatus = "loading" | "ready" | "error"

export interface UseRDKitResult {
  /** The initialised module, or `null` until it is ready. */
  rdkit: RDKitModule | null
  status: RDKitStatus
  /** The load failure, if `status` is `"error"`. */
  error: Error | null
}

/**
 * Lazily load the RDKit WASM module and track its status. The module is a
 * page-wide singleton, so mounting many molecule components triggers only one
 * download.
 *
 * Use this when you need RDKit available synchronously inside a callback — for
 * example feeding the interactive scatter's `tooltip.content`, which must
 * return a string. For a single structure, prefer the `MoleculeStructure`
 * component, which wraps this hook.
 *
 * @example
 * ```tsx
 * const { rdkit, status } = useRDKit()
 * // ...
 * content: (point) =>
 *   rdkit ? moleculeToSvg(rdkit, point.meta.smiles) ?? "" : "Loading…"
 * ```
 */
export function useRDKit(): UseRDKitResult {
  const [rdkit, setRdkit] = useState<RDKitModule | null>(null)
  const [status, setStatus] = useState<RDKitStatus>("loading")
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    loadRDKit()
      .then((module) => {
        if (cancelled) return
        setRdkit(module)
        setStatus("ready")
      })
      .catch((cause: unknown) => {
        if (cancelled) return
        setError(cause instanceof Error ? cause : new Error(String(cause)))
        setStatus("error")
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { rdkit, status, error }
}
