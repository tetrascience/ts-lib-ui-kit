import rdkitWasmUrl from "@rdkit/rdkit/dist/RDKit_minimal.wasm?url"
import { expect, waitFor, within } from "storybook/test"

import { MoleculeStructure } from "./MoleculeStructure"
import { configureRDKit } from "./rdkit-loader"

import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "@/components/ui/button"
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

const meta: Meta<typeof MoleculeStructure> = {
  title: "Design Patterns/Molecule Structure",
  component: MoleculeStructure,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * The primitive has no size props — the vector structure fills its box, so
 * size it with `className` (here `size-64`) and it scales to fit.
 */
export const Default: Story = {
  args: { smiles: MOLECULES.aspirin.smiles, alt: "Aspirin", className: "size-64" },
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
  args: { smiles: "not a molecule~!", alt: "bad input", className: "size-48" },
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
        <Button variant="link">CPD-0143</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-56">
        <MoleculeStructure
          smiles={MOLECULES.paracetamol.smiles}
          label="CPD-0143"
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
  parameters: {
    zephyr: { testCaseId: "" },
    // Show the composition sample in "Show code" rather than the whole story
    // object (a `render` + `play` story otherwise dumps its full definition).
    docs: {
      source: {
        code: `<HoverCard>
  <HoverCardTrigger asChild>
    <Button variant="link">CPD-0143</Button>
  </HoverCardTrigger>
  <HoverCardContent className="w-56">
    <MoleculeStructure
      smiles="CC(=O)Nc1ccc(O)cc1"
      label="CPD-0143"
      className="h-40 w-full"
    />
    <div className="mt-1 text-2xs text-muted-foreground">QED 0.81 · MW 151.2</div>
  </HoverCardContent>
</HoverCard>`,
      },
    },
  },
}
