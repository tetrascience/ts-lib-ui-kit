import rdkitScriptUrl from "@rdkit/rdkit/dist/RDKit_minimal.js?url"
import rdkitWasmUrl from "@rdkit/rdkit/dist/RDKit_minimal.wasm?url"
import * as React from "react"
import { expect, waitFor, within } from "storybook/test"

import { MoleculeRenderer } from "./MoleculeRenderer"
import { configureRDKit, moleculeToSvg } from "./rdkit-loader"
import { StructureThumbnail } from "./StructureThumbnail"
import { StructureTooltip } from "./StructureTooltip"
import { useRDKit } from "./use-rdkit"

import type { ScatterPoint } from "@/components/charts/ScatterPlotInteractive/types"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ColumnDef } from "@tanstack/react-table"

import { ScatterPlotInteractive } from "@/components/charts/ScatterPlotInteractive"
import { DataTable } from "@/components/ui/data-table/data-table"
import { useIsDark } from "@/hooks/use-is-dark"

// ---------------------------------------------------------------------------
// Real RDKit everywhere — stories AND play tests.
//
// Vite `?url` imports resolve the loader script and WASM to asset URLs served
// by whichever server is active (dev Storybook, the vitest browser runner, and
// the Vercel static build), so no CDN or network access is needed and there is
// no behavioural split between what a human sees and what CI tests. RDKit's own
// console chatter is routed to console.debug in the loader so the invalid-SMILES
// path doesn't trip the runner's console-error gate.
// ---------------------------------------------------------------------------

configureRDKit({ scriptSrc: rdkitScriptUrl, wasmSrc: rdkitWasmUrl })

// A few real, well-known SMILES for the visual stories.
const MOLECULES = {
  ethanol: { smiles: "CCO", label: "Ethanol" },
  aspirin: { smiles: "CC(=O)Oc1ccccc1C(=O)O", label: "Aspirin" },
  caffeine: { smiles: "Cn1cnc2c1c(=O)n(C)c(=O)n2C", label: "Caffeine" },
  ibuprofen: { smiles: "CC(C)Cc1ccc(cc1)C(C)C(=O)O", label: "Ibuprofen" },
  paracetamol: { smiles: "CC(=O)Nc1ccc(O)cc1", label: "Paracetamol" },
} as const

const meta: Meta<typeof StructureThumbnail> = {
  title: "Design Patterns/Molecule Structure",
  component: StructureThumbnail,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

/** Fixed-size square thumbnail — the table-cell primitive. */
export const Thumbnail: Story = {
  args: { smiles: MOLECULES.aspirin.smiles, size: 96, alt: "Aspirin" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitFor(() =>
      expect(
        canvas.getByRole("img", { name: "Aspirin" }).querySelector("svg"),
      ).toBeInTheDocument(),
    )
  },
  parameters: { zephyr: { testCaseId: "" } },
}

/** With a caption, e.g. a compound ID beneath the structure. */
export const ThumbnailWithLabel: Story = {
  args: { smiles: MOLECULES.caffeine.smiles, size: 96, label: "CPD-0142" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitFor(() => expect(canvas.getByText("CPD-0142")).toBeInTheDocument())
    expect(canvasElement.querySelector("svg")).toBeInTheDocument()
  },
  parameters: { zephyr: { testCaseId: "" } },
}

/** No `size` → the thumbnail fills its container and stays square. */
export const Responsive: Story = {
  render: (args) => (
    <div style={{ width: 220 }}>
      <StructureThumbnail {...args} />
    </div>
  ),
  args: { smiles: MOLECULES.ibuprofen.smiles, alt: "Ibuprofen" },
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector("svg")).toBeInTheDocument(),
    )
  },
  parameters: { zephyr: { testCaseId: "" } },
}

/** Invalid SMILES render a fallback instead of throwing. */
export const InvalidStructure: Story = {
  args: { smiles: "not a molecule~!", size: 96 },
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

/** Hover a compound ID to reveal its structure. */
export const Tooltip: Story = {
  render: () => (
    <StructureTooltip
      smiles={MOLECULES.paracetamol.smiles}
      title="CPD-0143"
      footer={<span>QED 0.81 · MW 151.2</span>}
    >
      <span className="cursor-help underline decoration-dotted">CPD-0143</span>
    </StructureTooltip>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Trigger is present", async () => {
      expect(canvas.getByText("CPD-0143")).toBeInTheDocument()
    })
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
      <StructureThumbnail
        smiles={row.original.smiles}
        size={56}
        alt={row.original.id}
      />
    ),
  },
  {
    accessorKey: "id",
    header: "Compound",
    cell: ({ row }) => (
      <StructureTooltip smiles={row.original.smiles} title={row.original.id}>
        <span className="cursor-help underline decoration-dotted">
          {row.original.id}
        </span>
      </StructureTooltip>
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

/** Thumbnails and hover tooltips inside a `DataTable`. */
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
      expect(canvasElement.querySelectorAll("svg").length).toBeGreaterThanOrEqual(
        3,
      ),
    )
  },
  parameters: { layout: "padded", zephyr: { testCaseId: "" } },
}

// ---------------------------------------------------------------------------
// Integration: interactive scatter custom tooltip
// ---------------------------------------------------------------------------

const SCATTER_DATA: ScatterPoint[] = [
  { id: "CPD-0142", x: 12, y: 34, label: "CPD-0142", metadata: { smiles: MOLECULES.aspirin.smiles } },
  { id: "CPD-0143", x: 45, y: 52, label: "CPD-0143", metadata: { smiles: MOLECULES.caffeine.smiles } },
  { id: "CPD-0144", x: 68, y: 21, label: "CPD-0144", metadata: { smiles: MOLECULES.ibuprofen.smiles } },
  { id: "CPD-0145", x: 30, y: 70, label: "CPD-0145", metadata: { smiles: MOLECULES.paracetamol.smiles } },
]

function ScatterWithStructureTooltips() {
  const { rdkit } = useRDKit()
  const isDark = useIsDark()

  const content = React.useCallback(
    (point: ScatterPoint) => {
      const smiles = String(point.metadata?.smiles ?? "")
      // The chart tooltip bubble uses the `foreground` colour — the inverse of
      // the page surface — so draw the structure in the opposite mode for
      // contrast (light structure on the dark bubble in light theme).
      const svg =
        rdkit && smiles
          ? moleculeToSvg(rdkit, smiles, { width: 140, height: 110, dark: !isDark })
          : null
      return [
        `<b>${point.label ?? point.id}</b>`,
        svg ?? "Loading structure…",
      ].join("<br>")
    },
    [rdkit, isDark],
  )

  return (
    <ScatterPlotInteractive
      data={SCATTER_DATA}
      title="Hits — hover for structure"
      xAxis={{ title: "Property A" }}
      yAxis={{ title: "Property B" }}
      tooltip={{ enabled: true, content }}
      width={640}
      height={420}
    />
  )
}

/** `StructureTooltip`/`moleculeToSvg` feeding an `InteractiveScatter` tooltip. */
export const InInteractiveScatter: Story = {
  render: () => <ScatterWithStructureTooltips />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitFor(() =>
      expect(canvas.getByText("Hits — hover for structure")).toBeInTheDocument(),
    )
    expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument()
  },
  parameters: { layout: "fullscreen", zephyr: { testCaseId: "" } },
}

/** The core renderer, sized via `className`. */
export const Core: Story = {
  render: () => (
    <MoleculeRenderer
      smiles={MOLECULES.caffeine.smiles}
      className="size-48"
      alt="Caffeine"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitFor(() =>
      expect(
        canvas.getByRole("img", { name: "Caffeine" }).querySelector("svg"),
      ).toBeInTheDocument(),
    )
  },
  parameters: { zephyr: { testCaseId: "" } },
}
