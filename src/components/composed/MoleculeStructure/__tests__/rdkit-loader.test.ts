import { afterEach, describe, expect, it, vi } from "vitest"

import type { RDKitModule } from "@rdkit/rdkit"

type MolStub = {
  is_valid: () => boolean
  get_svg_with_highlights: (details: string) => string
  delete: () => void
}

/**
 * A minimal fake of the slice of RDKit the loader touches. `get_mol` returns
 * `null` for the SMILES "BAD" (parse failure) and an invalid mol for "INVALID".
 */
function makeFakeRDKit() {
  const deleted: MolStub[] = []
  const lastDetails: { value: string | null } = { value: null }

  const module = {
    get_mol: (smiles: string) => {
      if (smiles === "BAD") return null
      const mol: MolStub = {
        is_valid: () => smiles !== "INVALID",
        get_svg_with_highlights: (details: string) => {
          lastDetails.value = details
          return `<?xml version='1.0' encoding='iso-8859-1'?>\n<svg data-smiles='${smiles}'></svg>`
        },
        delete: () => deleted.push(mol),
      }
      return mol
    },
  } as unknown as RDKitModule

  return { module, deleted, lastDetails }
}

// Re-import the module fresh each test so its singleton state (loadPromise,
// defaultConfig) never leaks between cases.
async function freshLoader() {
  vi.resetModules()
  return import("../rdkit-loader")
}

const originalInit = (window as { initRDKitModule?: unknown }).initRDKitModule

afterEach(() => {
  // Restore any stubbed globals (e.g. the SSR test stubs `document`) BEFORE
  // touching `document` below, or this cleanup would throw and leak the stub.
  vi.unstubAllGlobals()
  ;(window as { initRDKitModule?: unknown }).initRDKitModule = originalInit
  document
    .querySelectorAll("script[data-rdkit-loader]")
    .forEach((node) => node.remove())
})

describe("moleculeToSvg", () => {
  it("strips RDKit's XML prolog so the SVG embeds in inline HTML", async () => {
    const { moleculeToSvg } = await freshLoader()
    const { module } = makeFakeRDKit()
    const svg = moleculeToSvg(module, "CCO")
    expect(svg).not.toBeNull()
    expect(svg!.startsWith("<svg")).toBe(true)
    expect(svg).not.toContain("<?xml")
  })

  it("returns null when the SMILES cannot be parsed", async () => {
    const { moleculeToSvg } = await freshLoader()
    const { module } = makeFakeRDKit()
    expect(moleculeToSvg(module, "BAD")).toBeNull()
  })

  it("returns null and frees the mol when the structure is invalid", async () => {
    const { moleculeToSvg } = await freshLoader()
    const { module, deleted } = makeFakeRDKit()
    expect(moleculeToSvg(module, "INVALID")).toBeNull()
    expect(deleted).toHaveLength(1) // freed in `finally`
  })

  it("frees the mol after a successful render", async () => {
    const { moleculeToSvg } = await freshLoader()
    const { module, deleted } = makeFakeRDKit()
    moleculeToSvg(module, "CCO")
    expect(deleted).toHaveLength(1)
  })

  it("defaults size to 250x200 with a transparent background", async () => {
    const { moleculeToSvg } = await freshLoader()
    const { module, lastDetails } = makeFakeRDKit()
    moleculeToSvg(module, "CCO")
    const details = JSON.parse(lastDetails.value!)
    expect(details.width).toBe(250)
    expect(details.height).toBe(200)
    expect(details.backgroundColour).toEqual([0, 0, 0, 0])
    expect(details.atomColourPalette).toBeUndefined()
  })

  it("passes legend and extra draw options through", async () => {
    const { moleculeToSvg } = await freshLoader()
    const { module, lastDetails } = makeFakeRDKit()
    moleculeToSvg(module, "CCO", {
      width: 120,
      height: 90,
      legend: "CPD-1",
      drawOptions: { bondLineWidth: 3 },
    })
    const details = JSON.parse(lastDetails.value!)
    expect(details).toMatchObject({
      width: 120,
      height: 90,
      legend: "CPD-1",
      bondLineWidth: 3,
    })
  })

  it("applies a brightened atom palette in dark mode (hex parsed to 0-1 RGB)", async () => {
    const { moleculeToSvg } = await freshLoader()
    const { module, lastDetails } = makeFakeRDKit()
    moleculeToSvg(module, "CCO", { dark: true })
    const details = JSON.parse(lastDetails.value!)
    // Nitrogen (#75a1ff) shifted from RDKit's dim default blue.
    expect(details.atomColourPalette["7"]).toEqual([
      0x75 / 255,
      0xa1 / 255,
      0xff / 255,
    ])
    // Default/carbon lightened for legibility on dark surfaces.
    expect(details.atomColourPalette["-1"]).toEqual([0xe5 / 255, 0xe5 / 255, 0xe5 / 255])
  })
})

describe("configureRDKit + loadRDKit", () => {
  it("returns a pre-configured instance without touching the network", async () => {
    const { configureRDKit, loadRDKit } = await freshLoader()
    const { module } = makeFakeRDKit()
    const initSpy = vi.fn()
    ;(window as { initRDKitModule?: unknown }).initRDKitModule = initSpy

    configureRDKit({ instance: module })
    await expect(loadRDKit()).resolves.toBe(module)
    expect(initSpy).not.toHaveBeenCalled()
  })

  it("memoises so the module is initialised only once", async () => {
    const { loadRDKit } = await freshLoader()
    const { module } = makeFakeRDKit()
    const initSpy = vi.fn(() => Promise.resolve(module))
    ;(window as { initRDKitModule?: unknown }).initRDKitModule = initSpy

    const [a, b] = await Promise.all([loadRDKit(), loadRDKit()])
    expect(a).toBe(module)
    expect(b).toBe(module)
    expect(initSpy).toHaveBeenCalledTimes(1)
  })

  it("ignores configureRDKit once loading has begun", async () => {
    const { configureRDKit, loadRDKit } = await freshLoader()
    const { module } = makeFakeRDKit()
    ;(window as { initRDKitModule?: unknown }).initRDKitModule = vi.fn(() =>
      Promise.resolve(module),
    )

    const promise = loadRDKit()
    // Too late — this must be a no-op and not swap in a different instance.
    configureRDKit({ instance: makeFakeRDKit().module })
    await expect(promise).resolves.toBe(module)
  })

  it("injects the loader script when initRDKitModule is absent", async () => {
    const { loadRDKit } = await freshLoader()
    const { module } = makeFakeRDKit()
    delete (window as { initRDKitModule?: unknown }).initRDKitModule

    const promise = loadRDKit()
    const script = document.querySelector<HTMLScriptElement>(
      "script[data-rdkit-loader]",
    )
    expect(script).not.toBeNull()

    // The script "loads" and defines the global; then init resolves.
    ;(window as { initRDKitModule?: unknown }).initRDKitModule = vi.fn(() =>
      Promise.resolve(module),
    )
    script!.dispatchEvent(new Event("load"))
    await expect(promise).resolves.toBe(module)
  })

  it("rejects outside a browser environment", async () => {
    const { loadRDKit } = await freshLoader()
    // Simulate SSR: `document` absent. Read an unset property to get `undefined`
    // without the literal (which `unicorn/no-useless-undefined` flags as an arg).
    const absent: Record<string, undefined> = {}
    vi.stubGlobal("document", absent.value)
    await expect(loadRDKit()).rejects.toThrow(/browser environment/)
  })

  it("reuses an already-loaded loader script without re-injecting", async () => {
    const { loadRDKit } = await freshLoader()
    delete (window as { initRDKitModule?: unknown }).initRDKitModule
    const existing = document.createElement("script")
    existing.dataset.rdkitLoader = "true"
    existing.dataset.loaded = "true"
    document.head.append(existing)

    // The existing loaded script short-circuits injection; with no global
    // defined afterwards, loadRDKit reports the missing-init error.
    await expect(loadRDKit()).rejects.toThrow(/did not define initRDKitModule/)
    expect(document.querySelectorAll("script[data-rdkit-loader]")).toHaveLength(1)
  })

  it("rejects when a pending existing loader script errors", async () => {
    const { loadRDKit } = await freshLoader()
    delete (window as { initRDKitModule?: unknown }).initRDKitModule
    const existing = document.createElement("script")
    existing.dataset.rdkitLoader = "true"
    document.head.append(existing)

    const promise = loadRDKit()
    existing.dispatchEvent(new Event("error"))
    await expect(promise).rejects.toThrow(/Failed to load the RDKit loader script/)
  })

  it("rejects and allows a retry when the script fails to load", async () => {
    const { loadRDKit } = await freshLoader()
    delete (window as { initRDKitModule?: unknown }).initRDKitModule

    const first = loadRDKit()
    document
      .querySelector<HTMLScriptElement>("script[data-rdkit-loader]")!
      .dispatchEvent(new Event("error"))
    await expect(first).rejects.toThrow(/RDKit loader script/)

    // The failed attempt is not cached: a second call tries again.
    const { module } = makeFakeRDKit()
    const second = loadRDKit()
    ;(window as { initRDKitModule?: unknown }).initRDKitModule = vi.fn(() =>
      Promise.resolve(module),
    )
    document
      .querySelector<HTMLScriptElement>("script[data-rdkit-loader]")!
      .dispatchEvent(new Event("load"))
    await expect(second).resolves.toBe(module)
  })
})
