import rdkitWasmUrl from "@rdkit/rdkit/dist/RDKit_minimal.wasm?url"
import { expect, waitFor, within } from "storybook/test"

import { MoleculeRenderer } from "./MoleculeRenderer"
import { configureRDKit } from "./rdkit-loader"

import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

// ---------------------------------------------------------------------------
// Air-gapped RDKit — no CDN.
//
// The loader dynamically imports the installed `@rdkit/rdkit` package for the
// glue script; here we only point it at the WASM, resolved from that same
// package via a Vite `?url` import. The asset is served by whichever server is
// active (dev Storybook, the vitest browser runner, the Vercel build), so
// there's no network access and no split between what a human sees and what CI
// tests. RDKit's console chatter is routed to console.debug in the loader so
// the invalid-SMILES path doesn't trip the runner's console-error gate.
// ---------------------------------------------------------------------------

configureRDKit({ wasmSrc: rdkitWasmUrl })

// A couple of real, well-known SMILES for the visual stories.
const MOLECULES = {
  aspirin: { smiles: "CC(=O)Oc1ccccc1C(=O)O", label: "Aspirin" },
  paracetamol: { smiles: "CC(=O)Nc1ccc(O)cc1", label: "Paracetamol" },
} as const

const meta: Meta<typeof MoleculeRenderer> = {
  title: "Design Patterns/Molecule Structure",
  component: MoleculeRenderer,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * The primitive fills its container — it has no size props. Drag the box's
 * bottom-right corner: the vector structure scales to fit at any size.
 */
export const Default: Story = {
  args: { smiles: MOLECULES.aspirin.smiles, alt: "Aspirin" },
  render: (args) => (
    <div
      className="resize overflow-hidden rounded-md border border-border p-2"
      style={{ width: 240, height: 240 }}
    >
      <MoleculeRenderer {...args} className="size-full" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Exposed to assistive tech as a single labelled image.
    await waitFor(() =>
      expect(
        canvas.getByRole("img", { name: "Aspirin" }).querySelector("svg"),
      ).toBeInTheDocument(),
    )
  },
  parameters: { zephyr: { testCaseId: "" } },
}

/** Invalid SMILES render an accessible fallback instead of throwing. */
export const InvalidStructure: Story = {
  args: { smiles: "not a molecule~!", alt: "bad input" },
  render: (args) => <MoleculeRenderer {...args} className="size-48" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitFor(() =>
      expect(
        canvas.getByRole("img", { name: /unable to render structure/i }),
      ).toBeInTheDocument(),
    )
    expect(canvas.getByText(/invalid structure/i)).toBeInTheDocument()
  },
  parameters: { zephyr: { testCaseId: "" } },
}

/** Reveal the structure on hover by composing with the `HoverCard` primitive. */
export const InHoverCard: Story = {
  render: () => (
    <HoverCard openDelay={100}>
      <HoverCardTrigger asChild>
        <button type="button" className="text-sm underline decoration-dotted">
          CPD-0143
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-56">
        <div className="mb-1 text-xs font-medium">CPD-0143</div>
        <MoleculeRenderer
          smiles={MOLECULES.paracetamol.smiles}
          alt="CPD-0143 structure"
          className="h-40 w-full"
        />
        <div className="mt-1 text-2xs text-muted-foreground">
          QED 0.81 · MW 151.2
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(
      canvas.getByRole("button", { name: "CPD-0143" }),
    ).toBeInTheDocument()
  },
  parameters: { zephyr: { testCaseId: "" } },
}
