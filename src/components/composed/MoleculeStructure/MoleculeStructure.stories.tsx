import rdkitWasmUrl from "@rdkit/rdkit/dist/RDKit_minimal.wasm?url"
import { expect, waitFor, within } from "storybook/test"

import { MoleculeRenderer } from "./MoleculeRenderer"
import { configureRDKit } from "./rdkit-loader"

import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/ui/data-table/data-table"
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

// A few real, well-known SMILES for the visual stories.
const MOLECULES = {
  ethanol: { smiles: "CCO", label: "Ethanol" },
  aspirin: { smiles: "CC(=O)Oc1ccccc1C(=O)O", label: "Aspirin" },
  caffeine: { smiles: "Cn1cnc2c1c(=O)n(C)c(=O)n2C", label: "Caffeine" },
  ibuprofen: { smiles: "CC(C)Cc1ccc(cc1)C(C)C(=O)O", label: "Ibuprofen" },
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

/** The core primitive: a 2D structure from SMILES, sized via `className`. */
export const Default: Story = {
  args: { smiles: MOLECULES.aspirin.smiles, alt: "Aspirin" },
  render: (args) => <MoleculeRenderer {...args} className="size-48" />,
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

/** The SVG is vector: size the wrapper and it scales to fit. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <MoleculeRenderer smiles={MOLECULES.caffeine.smiles} alt="Caffeine" className="size-16" />
      <MoleculeRenderer smiles={MOLECULES.caffeine.smiles} alt="Caffeine" className="size-28" />
      <MoleculeRenderer smiles={MOLECULES.caffeine.smiles} alt="Caffeine" className="size-44" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelectorAll("svg").length).toBeGreaterThanOrEqual(3),
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

// ---------------------------------------------------------------------------
// Integration: DataTable cell
// ---------------------------------------------------------------------------

interface CompoundRow {
  id: string
  smiles: string
  qed: number
}

const COMPOUND_ROWS: CompoundRow[] = [
  { id: "CPD-0142", smiles: MOLECULES.aspirin.smiles, qed: 0.81 },
  { id: "CPD-0143", smiles: MOLECULES.caffeine.smiles, qed: 0.74 },
  { id: "CPD-0144", smiles: MOLECULES.ibuprofen.smiles, qed: 0.69 },
]

const compoundColumns: ColumnDef<CompoundRow>[] = [
  {
    accessorKey: "smiles",
    header: "Structure",
    cell: ({ row }) => (
      <MoleculeRenderer
        smiles={row.original.smiles}
        alt={`${row.original.id} structure`}
        className="size-14"
      />
    ),
  },
  {
    accessorKey: "id",
    header: "Compound",
    cell: ({ row }) => (
      <HoverCard openDelay={100}>
        <HoverCardTrigger asChild>
          <button type="button" className="text-sm underline decoration-dotted">
            {row.original.id}
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-48">
          <MoleculeRenderer
            smiles={row.original.smiles}
            alt={`${row.original.id} structure`}
            className="h-36 w-full"
          />
        </HoverCardContent>
      </HoverCard>
    ),
  },
  {
    accessorKey: "qed",
    header: "QED",
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.qed.toFixed(2)}</span>
    ),
  },
]

/** Structures rendered directly in `DataTable` cells, with a hover-card ID. */
export const InDataTable: Story = {
  render: () => (
    <div className="w-[520px]">
      <DataTable columns={compoundColumns} data={COMPOUND_ROWS} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByRole("table")).toBeInTheDocument()
    await waitFor(() =>
      expect(canvasElement.querySelectorAll("svg").length).toBeGreaterThanOrEqual(3),
    )
  },
  parameters: { layout: "padded", zephyr: { testCaseId: "" } },
}
