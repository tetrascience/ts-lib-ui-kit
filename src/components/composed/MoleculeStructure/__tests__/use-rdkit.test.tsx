import { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, describe, expect, it, vi } from "vitest"

import { useRDKit, type UseRDKitResult } from "../use-rdkit"

import type { RDKitModule } from "@rdkit/rdkit"
import type { Root } from "react-dom/client"

// Controllable loadRDKit: each test resolves or rejects the pending promise.
// `vi.mock` is hoisted above these imports by vitest, so the mock is in place
// before `useRDKit` (and its `loadRDKit` import) is evaluated.
const { loadRDKitMock } = vi.hoisted(() => ({ loadRDKitMock: vi.fn() }))
vi.mock("../rdkit-loader", () => ({ loadRDKit: loadRDKitMock }))

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true

const roots: Array<{ root: Root; container: HTMLElement }> = []

function renderHook() {
  const result: { current: UseRDKitResult } = {
    current: { rdkit: null, status: "loading", error: null },
  }

  function Probe() {
    result.current = useRDKit()
    return null
  }

  const container = document.createElement("div")
  document.body.append(container)
  const root = createRoot(container)
  act(() => root.render(<Probe />))
  roots.push({ root, container })
  return result
}

afterEach(() => {
  act(() => {
    for (const { root } of roots) root.unmount()
  })
  roots.forEach(({ container }) => container.remove())
  roots.length = 0
  loadRDKitMock.mockReset()
})

const fakeModule = {} as RDKitModule
const flush = () => act(async () => {})

describe("useRDKit", () => {
  it("starts in the loading state", () => {
    loadRDKitMock.mockReturnValue(new Promise(() => {})) // never settles
    const result = renderHook()
    expect(result.current.status).toBe("loading")
    expect(result.current.rdkit).toBeNull()
  })

  it("transitions to ready with the module once loaded", async () => {
    loadRDKitMock.mockResolvedValue(fakeModule)
    const result = renderHook()
    await flush()
    expect(result.current.status).toBe("ready")
    expect(result.current.rdkit).toBe(fakeModule)
    expect(result.current.error).toBeNull()
  })

  it("transitions to error and surfaces an Error when loading fails", async () => {
    loadRDKitMock.mockRejectedValue(new Error("no wasm"))
    const result = renderHook()
    await flush()
    expect(result.current.status).toBe("error")
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe("no wasm")
  })

  it("wraps a non-Error rejection in an Error", async () => {
    loadRDKitMock.mockRejectedValue("boom")
    const result = renderHook()
    await flush()
    expect(result.current.status).toBe("error")
    expect(result.current.error?.message).toBe("boom")
  })

  it("does not update state after unmount (cancelled)", async () => {
    let resolve!: (m: RDKitModule) => void
    loadRDKitMock.mockReturnValue(
      new Promise<RDKitModule>((r) => {
        resolve = r
      }),
    )
    const result = renderHook()
    act(() => {
      for (const { root } of roots) root.unmount()
    })
    // Resolving after unmount must not throw or flip status to "ready".
    await act(async () => {
      resolve(fakeModule)
    })
    expect(result.current.status).toBe("loading")
  })
})
