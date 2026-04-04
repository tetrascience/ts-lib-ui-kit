import { useState } from "react"
import { expect, within } from "storybook/test"

import {
  DataTable,
  type DataTableColumnDef,
  type DataTableColumnGroup,
  type DataTableBatchAction,
} from "./data-table"

import type { Meta, StoryObj } from "@storybook/react-vite"

// ── Sample data: compound library (from prototype) ──────────────────────────

interface Compound {
  id: string
  name: string
  formula: string
  mw: number
  category: string
  purity: number
  status: string
  detail: string
}

const compounds: Compound[] = [
  { id: "1", name: "Aspirin", formula: "C\u2089H\u2088O\u2084", mw: 180.16, category: "Analgesic", status: "Active", purity: 99.2, detail: "Acetylsalicylic acid. Common NSAID used for pain relief, fever reduction, and anti-inflammatory purposes." },
  { id: "2", name: "Caffeine", formula: "C\u2088H\u2081\u2080N\u2084O\u2082", mw: 194.19, category: "Stimulant", status: "Active", purity: 98.5, detail: "Methylxanthine alkaloid. Central nervous system stimulant found in coffee, tea, and various beverages." },
  { id: "3", name: "Ibuprofen", formula: "C\u2081\u2083H\u2081\u2088O\u2082", mw: 206.29, category: "Analgesic", status: "Active", purity: 99.8, detail: "Propionic acid derivative NSAID. Commonly used for inflammation, pain, and fever." },
  { id: "4", name: "Penicillin G", formula: "C\u2081\u2086H\u2081\u2088N\u2082O\u2084S", mw: 334.39, category: "Antibiotic", status: "Inactive", purity: 97.1, detail: "Beta-lactam antibiotic. First member of the penicillin group discovered by Alexander Fleming." },
  { id: "5", name: "Metformin", formula: "C\u2084H\u2081\u2081N\u2085", mw: 129.16, category: "Antidiabetic", status: "Active", purity: 99.0, detail: "Biguanide oral antidiabetic. First-line medication for the treatment of type 2 diabetes." },
  { id: "6", name: "Omeprazole", formula: "C\u2081\u2087H\u2081\u2089N\u2083O\u2083S", mw: 345.42, category: "Antacid", status: "Active", purity: 98.9, detail: "Proton-pump inhibitor (PPI). Used to treat gastroesophageal reflux disease and peptic ulcers." },
  { id: "7", name: "Amoxicillin", formula: "C\u2081\u2086H\u2081\u2089N\u2083O\u2085S", mw: 365.40, category: "Antibiotic", status: "Active", purity: 96.3, detail: "Broad-spectrum beta-lactam antibiotic. Commonly prescribed for bacterial infections." },
  { id: "8", name: "Loratadine", formula: "C\u2082\u2082H\u2082\u2083ClN\u2082O\u2082", mw: 382.88, category: "Antihistamine", status: "Inactive", purity: 99.5, detail: "Second-generation antihistamine. Used to treat allergies without significant sedation." },
  { id: "9", name: "Atorvastatin", formula: "C\u2083\u2083H\u2083\u2085FN\u2082O\u2085", mw: 558.64, category: "Statin", status: "Active", purity: 99.1, detail: "HMG-CoA reductase inhibitor. Used to lower cholesterol and reduce risk of cardiovascular disease." },
  { id: "10", name: "Lisinopril", formula: "C\u2082\u2081H\u2083\u2081N\u2083O\u2085", mw: 405.49, category: "Antihypertensive", status: "Active", purity: 98.7, detail: "ACE inhibitor. Used to treat high blood pressure and heart failure." },
  { id: "11", name: "Amlodipine", formula: "C\u2082\u2080H\u2082\u2085ClN\u2082O\u2085", mw: 408.88, category: "Antihypertensive", status: "Active", purity: 99.3, detail: "Calcium channel blocker. Used for hypertension and coronary artery disease." },
  { id: "12", name: "Ciprofloxacin", formula: "C\u2081\u2087H\u2081\u2088FN\u2083O\u2083", mw: 331.34, category: "Antibiotic", status: "Active", purity: 97.8, detail: "Fluoroquinolone antibiotic. Broad-spectrum agent for urinary tract and respiratory infections." },
  { id: "13", name: "Warfarin", formula: "C\u2081\u2089H\u2081\u2086O\u2084", mw: 308.33, category: "Anticoagulant", status: "Active", purity: 99.6, detail: "Vitamin K antagonist. Used for prevention and treatment of thromboembolic disorders." },
  { id: "14", name: "Diazepam", formula: "C\u2081\u2086H\u2081\u2083ClN\u2082O", mw: 284.74, category: "Anxiolytic", status: "Inactive", purity: 99.4, detail: "Benzodiazepine. Used for anxiety, seizures, muscle spasms, and alcohol withdrawal." },
  { id: "15", name: "Prednisone", formula: "C\u2082\u2081H\u2082\u2086O\u2085", mw: 358.43, category: "Corticosteroid", status: "Active", purity: 98.2, detail: "Synthetic corticosteroid. Used as anti-inflammatory and immunosuppressant." },
  { id: "16", name: "Morphine", formula: "C\u2081\u2087H\u2081\u2089NO\u2083", mw: 285.34, category: "Analgesic", status: "Inactive", purity: 99.7, detail: "Opioid analgesic. Used for severe pain management in clinical settings." },
  { id: "17", name: "Doxycycline", formula: "C\u2082\u2082H\u2082\u2084N\u2082O\u2088", mw: 444.43, category: "Antibiotic", status: "Active", purity: 96.9, detail: "Tetracycline antibiotic. Used for bacterial infections, acne, and malaria prophylaxis." },
  { id: "18", name: "Gabapentin", formula: "C\u2089H\u2081\u2087NO\u2082", mw: 171.24, category: "Anticonvulsant", status: "Active", purity: 99.0, detail: "GABA analogue. Used for neuropathic pain and as adjunctive therapy for seizures." },
  { id: "19", name: "Levothyroxine", formula: "C\u2081\u2085H\u2081\u2081I\u2084NO\u2084", mw: 776.87, category: "Thyroid", status: "Active", purity: 98.1, detail: "Synthetic thyroid hormone. Used to treat hypothyroidism and thyroid hormone deficiency." },
  { id: "20", name: "Sildenafil", formula: "C\u2082\u2082H\u2083\u2080N\u2086O\u2084S", mw: 474.58, category: "PDE5 Inhibitor", status: "Active", purity: 99.3, detail: "Phosphodiesterase type 5 inhibitor. Used for erectile dysfunction and pulmonary arterial hypertension." },
]

const compoundColumns: DataTableColumnDef<Compound>[] = [
  {
    key: "name",
    label: "Name",
    type: "string",
    description: "Compound name",
    renderCell: (_row, value) => (
      <span className="text-[13px] font-semibold text-foreground">{String(value)}</span>
    ),
  },
  {
    key: "formula",
    label: "Formula",
    type: "string",
    description: "Molecular formula",
    renderCell: (_row, value) => (
      <span className="font-mono text-xs text-foreground">{String(value)}</span>
    ),
  },
  {
    key: "mw",
    label: "Mol. weight (g/mol)",
    type: "number",
    description: "Molecular weight in grams per mole",
  },
  { key: "category", label: "Category", type: "list", description: "Therapeutic category" },
  {
    key: "purity",
    label: "Purity (%)",
    type: "number",
    description: "Chemical purity percentage",
    renderCell: (_row, value) => (
      <span className="font-mono text-[13px] text-foreground">
        {Number(value).toFixed(1)}%
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    type: "list",
    description: "Compound status",
    renderCell: (_row, value) => {
      const active = value === "Active"
      return (
        <span
          className={
            active
              ? "inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#099DB322] text-[#099DB3]"
              : "inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground"
          }
        >
          {String(value)}
        </span>
      )
    },
  },
]

// ── Shorter columns (without status badge renderer) for Dynamic variant ─────

const compoundColumnsPlain: DataTableColumnDef<Compound>[] = [
  { key: "name", label: "Name", type: "string" },
  { key: "formula", label: "Formula", type: "string" },
  { key: "mw", label: "Mol. weight", type: "number" },
  { key: "category", label: "Category", type: "string" },
  { key: "purity", label: "Purity (%)", type: "number" },
  { key: "status", label: "Status", type: "string" },
]

// ── Sample data: user directory ─────────────────────────────────────────────

interface User {
  id: string
  name: string
  email: string
  role: string
  age: number
  department: string
}

const emptyUsers: User[] = []

const userColumns: DataTableColumnDef<User>[] = [
  { key: "id", label: "ID", type: "string", description: "Unique user identifier" },
  { key: "name", label: "Name", type: "string", description: "Full name" },
  { key: "email", label: "Email", type: "string", description: "Work email address" },
  { key: "role", label: "Role", type: "string", description: "Job title" },
  { key: "age", label: "Age", type: "number", description: "Age in years" },
  { key: "department", label: "Department", type: "string", description: "Team / department" },
]

// ── Sample data: molecular properties (scientific use case) ─────────────────

interface Molecule {
  id: string
  simA: number
  simB: number
  mpoScore: number
  saScore: number
  lipE: number
  mw: number
  psa: number
  clogp: number
  hba: number
  hbd: number
  heavyAtoms: number
  rotatableBonds: number
}

function seeded(id: string, salt: string, min: number, max: number): number {
  const str = id + salt
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) / 4294967295) * (max - min) + min
}

function makeMol(id: string): Molecule {
  const mw = +seeded(id, "mw", 180, 550).toFixed(1)
  const simA = +seeded(id, "simA", 0.3, 0.98).toFixed(3)
  const simB = +seeded(id, "simB", 0.2, 0.95).toFixed(3)
  const hba = Math.round(seeded(id, "hba", 1, 10))
  const hbd = Math.round(seeded(id, "hbd", 0, 5))
  const logp = +seeded(id, "logp", 0.5, 5.0).toFixed(2)
  return {
    id,
    simA,
    simB,
    mpoScore: +seeded(id, "mpo", 0.4, 1.0).toFixed(2),
    saScore: +seeded(id, "sa", 1.5, 4.5).toFixed(1),
    lipE: +(simA * 8 - logp).toFixed(2),
    mw,
    psa: Math.round(20 * hbd + 17 * hba),
    clogp: logp,
    hba,
    hbd,
    heavyAtoms: Math.round(mw / 13),
    rotatableBonds: Math.round(seeded(id, "rb", 2, 9)),
  }
}

const molecules: Molecule[] = Array.from({ length: 12 }, (_, i) =>
  makeMol(`MOL-${String(i + 1).padStart(3, "0")}`),
)

const molColumnGroups: DataTableColumnGroup[] = [
  { key: "scores", label: "Scores" },
  { key: "physicochemical", label: "Physicochemical Properties" },
]

const molColumns: DataTableColumnDef<Molecule>[] = [
  { key: "id", label: "ID", type: "string", description: "Molecule identifier" },
  { key: "simA", label: "Sim(A)", type: "number", description: "Tanimoto similarity to Parent A (0\u20131)" },
  { key: "simB", label: "Sim(B)", type: "number", description: "Tanimoto similarity to Parent B (0\u20131)" },
  { key: "mpoScore", label: "MPO Score", type: "number", description: "Multi-Parameter Optimization (0\u20131, higher = better)", group: "scores" },
  { key: "saScore", label: "SA Score", type: "number", description: "Synthetic Accessibility (1\u201310, lower = easier)", group: "scores" },
  { key: "lipE", label: "LipE", type: "number", description: "Lipophilic Efficiency (higher = better)", group: "scores" },
  { key: "mw", label: "MW", type: "number", description: "Molecular Weight (g/mol)", group: "physicochemical" },
  { key: "psa", label: "PSA", type: "number", description: "Polar Surface Area (\u00c5\u00b2)", group: "physicochemical" },
  { key: "clogp", label: "cLogP", type: "number", description: "Calculated lipophilicity", group: "physicochemical" },
  { key: "hba", label: "HBA", type: "number", description: "Hydrogen Bond Acceptors", group: "physicochemical" },
  { key: "hbd", label: "HBD", type: "number", description: "Hydrogen Bond Donors", group: "physicochemical" },
  { key: "heavyAtoms", label: "Heavy Atoms", type: "number", description: "Non-hydrogen atom count", group: "physicochemical" },
  { key: "rotatableBonds", label: "Rotatable Bonds", type: "number", description: "Rotatable bond count", group: "physicochemical" },
]

// ── Storybook meta ──────────────────────────────────────────────────────────

const meta: Meta<typeof DataTable> = {
  title: "Components/DataTable",
  component: DataTable,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof DataTable>

// ── Stories ─────────────────────────────────────────────────────────────────

/** Basic table with sorting and pagination — no batch actions or expansion. */
export const Basic: Story = {
  render: () => (
    <div>
      <DataTable<Compound>
        data={compounds}
        columns={compoundColumns}
        title="Compound Library"
        subtitle={`${compounds.length} compounds`}
        getRowId={(r) => r.id}
        defaultSortRules={[{ key: "name", dir: "asc" }]}
        pagination
        defaultPerPage={10}
      />
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1573-1" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Table renders with title and column headers", async () => {
      expect(canvas.getByText("Compound Library")).toBeInTheDocument()
      expect(canvas.getByText("8 compounds")).toBeInTheDocument()
      expect(canvas.getByText("Name")).toBeInTheDocument()
      expect(canvas.getByText("Formula")).toBeInTheDocument()
      expect(canvas.getByText("Category")).toBeInTheDocument()
    })

    await step("Data rows render", async () => {
      expect(canvas.getByText("Aspirin")).toBeInTheDocument()
      expect(canvas.getByText("Caffeine")).toBeInTheDocument()
    })

    await step("Toolbar buttons render", async () => {
      expect(canvas.getByText("Hide fields")).toBeInTheDocument()
      expect(canvas.getByText("Filter")).toBeInTheDocument()
      expect(canvas.getByText("Sort")).toBeInTheDocument()
    })

    await step("Pagination renders", async () => {
      expect(canvas.getByText("Rows per page:")).toBeInTheDocument()
    })
  },
}

/** Selectable rows with a batch action bar that appears on selection. */
export const BatchActions: Story = {
  render: () => {
    const batchActions: DataTableBatchAction[] = [
      {
        label: "Export",
        onClick: (ids) => alert(`Export ${ids.size} items`),
      },
      {
        label: "Flag for review",
        onClick: (ids) => alert(`Flagged ${ids.size} items`),
      },
      {
        label: "Delete",
        onClick: (ids) => alert(`Delete ${ids.size} items`),
      },
    ]

    return (
      <div>
        <DataTable<Compound>
          data={compounds}
          columns={compoundColumns}
          title="Compound Library"
          subtitle="Select rows to see batch actions"
          getRowId={(r) => r.id}
          defaultSortRules={[{ key: "name", dir: "asc" }]}
          selectable
          batchActions={batchActions}
        />
      </div>
    )
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1573-5" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Checkboxes render", async () => {
      const checkboxes = canvasElement.querySelectorAll("input[type=checkbox]")
      expect(checkboxes.length).toBeGreaterThan(0)
    })

    await step("Title and subtitle render", async () => {
      expect(canvas.getByText("Compound Library")).toBeInTheDocument()
      expect(
        canvas.getByText("Select rows to see batch actions"),
      ).toBeInTheDocument()
    })
  },
}

/** Dynamic editing with inline add, edit, and delete actions. */
export const Dynamic: Story = {
  render: () => {
    const [rows, setRows] = useState(compounds)
    const [editId, setEditId] = useState<string | null>(null)
    const [editRow, setEditRow] = useState<Compound | null>(null)

    const saveEdit = () => {
      if (!editRow) return
      setRows((prev) =>
        prev.map((r) => (r.id === editId ? editRow : r)),
      )
      setEditId(null)
      setEditRow(null)
    }
    const deleteRow = (id: string) =>
      setRows((prev) => prev.filter((r) => r.id !== id))

    const editColumns: DataTableColumnDef<Compound>[] =
      compoundColumnsPlain.map((col) => ({
        ...col,
        renderCell: (row: Compound, value: unknown) => {
          if (editId === row.id && editRow) {
            const field = col.key as keyof Compound
            if (field === "id" || field === "detail") {
              return (
                <span className="font-mono text-[13px]">
                  {String(value)}
                </span>
              )
            }
            return (
              <input
                type={col.type === "number" ? "number" : "text"}
                value={String(editRow[field])}
                onChange={(e) =>
                  setEditRow({
                    ...editRow,
                    [field]:
                      col.type === "number"
                        ? parseFloat(e.target.value) || 0
                        : e.target.value,
                  })
                }
                className="w-full text-xs border border-input rounded px-2 py-1 bg-background text-foreground focus:outline-none focus:border-primary"
              />
            )
          }
          if (col.type === "number") {
            const num = Number(value)
            return (
              <span className="font-mono text-[13px]">
                {Number.isFinite(num) ? num.toFixed(col.key === "purity" ? 1 : 2) : String(value)}
              </span>
            )
          }
          return (
            <span className="font-mono text-[13px]">{String(value)}</span>
          )
        },
      }))

    return (
      <div>
        <DataTable<Compound>
          data={rows}
          columns={editColumns}
          title="Compound Library"
          subtitle="Dynamic editing"
          getRowId={(r) => r.id}
          defaultSortRules={[{ key: "name", dir: "asc" }]}
          renderActions={(row) =>
            editId === row.id ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={saveEdit}
                  title="Save"
                  className="p-1 rounded hover:bg-muted"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setEditId(null)
                    setEditRow(null)
                  }}
                  title="Cancel"
                  className="p-1 rounded hover:bg-muted"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditId(row.id)
                    setEditRow({ ...row })
                  }}
                  title="Edit"
                  className="p-1 rounded hover:bg-muted"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => deleteRow(row.id)}
                  title="Delete"
                  className="p-1 rounded hover:bg-muted"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            )
          }
        />
      </div>
    )
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1573-6" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Table renders with dynamic editing subtitle", async () => {
      expect(canvas.getByText("Dynamic editing")).toBeInTheDocument()
    })

    await step("Action column renders", async () => {
      expect(canvas.getByText("Action")).toBeInTheDocument()
    })
  },
}

/** Expandable rows with a detail panel — click the chevron to expand. */
export const Expansion: Story = {
  render: () => (
    <div>
      <DataTable<Compound>
        data={compounds}
        columns={compoundColumns}
        title="Compound Library"
        subtitle="Click chevron to expand rows"
        getRowId={(r) => r.id}
        defaultSortRules={[{ key: "name", dir: "asc" }]}
        expandable
        renderExpandedRow={(row) => (
          <div>
            <strong className="text-primary">{row.name}</strong>
            <span className="text-muted-foreground"> &mdash; {row.detail}</span>
          </div>
        )}
      />
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1573-7" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Expand chevrons render", async () => {
      const buttons = canvasElement.querySelectorAll(
        "button[class*='inline-flex']",
      )
      expect(buttons.length).toBeGreaterThan(0)
    })

    await step("Table title renders", async () => {
      expect(canvas.getByText("Compound Library")).toBeInTheDocument()
      expect(
        canvas.getByText("Click chevron to expand rows"),
      ).toBeInTheDocument()
    })
  },
}

/** Batch expansion — expand all rows at once with the header chevron toggle. */
export const BatchExpansion: Story = {
  render: () => (
    <div>
      <DataTable<Compound>
        data={compounds}
        columns={compoundColumns}
        title="Compound Library"
        subtitle="Expand all with header chevron"
        getRowId={(r) => r.id}
        defaultSortRules={[{ key: "name", dir: "asc" }]}
        expandable
        batchExpandable
        renderExpandedRow={(row) => (
          <div>
            <strong className="text-primary">{row.name}</strong>
            <span className="text-muted-foreground"> &mdash; {row.detail}</span>
          </div>
        )}
      />
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1573-8" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Table renders with batch expansion subtitle", async () => {
      expect(
        canvas.getByText("Expand all with header chevron"),
      ).toBeInTheDocument()
    })
  },
}

/** Full-featured filtering table with search, column hiding, filters, sort, and pagination. */
export const Filtering: Story = {
  render: () => (
    <div>
      <DataTable<Compound>
        data={compounds}
        columns={compoundColumns}
        title="Compound Library"
        getRowId={(r) => r.id}
        defaultSortRules={[{ key: "name", dir: "asc" }]}
        searchable
        searchPlaceholder="Search name or formula\u2026"
        searchKeys={["name", "formula"]}
        pagination
        defaultPerPage={10}
      />
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1573-9" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Search input renders", async () => {
      const searchInput = canvasElement.querySelector(
        "input[placeholder*='Search']",
      )
      expect(searchInput).toBeInTheDocument()
    })

    await step("Toolbar buttons render", async () => {
      expect(canvas.getByText("Hide fields")).toBeInTheDocument()
      expect(canvas.getByText("Filter")).toBeInTheDocument()
      expect(canvas.getByText("Sort")).toBeInTheDocument()
    })

    await step("Pagination renders", async () => {
      expect(canvas.getByText("Rows per page:")).toBeInTheDocument()
    })
  },
}

/** Demonstrates column groups with spanning headers and default hidden columns. */
export const ScientificData: Story = {
  render: () => {
    const [selected, setSelected] = useState<string | null>(null)
    return (
      <div>
        <DataTable<Molecule>
          data={molecules}
          columns={molColumns}
          columnGroups={molColumnGroups}
          title="Molecular Property Table"
          getRowId={(r) => r.id}
          selectedRowId={selected}
          onSelectionChange={setSelected}
          defaultSortRules={[{ key: "simA", dir: "desc" }]}
          defaultHiddenColumns={
            new Set([
              "mw",
              "psa",
              "clogp",
              "hba",
              "hbd",
              "heavyAtoms",
              "rotatableBonds",
            ])
          }
        />
      </div>
    )
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1573-2" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Table renders with molecular data", async () => {
      expect(
        canvas.getByText("Molecular Property Table"),
      ).toBeInTheDocument()
      expect(canvas.getByText("MOL-001")).toBeInTheDocument()
    })

    await step("Group header renders for Scores", async () => {
      expect(canvas.getByText("Scores")).toBeInTheDocument()
      expect(canvas.getByText("MPO Score")).toBeInTheDocument()
      expect(canvas.getByText("SA Score")).toBeInTheDocument()
    })

    await step("Hidden columns badge shows count", async () => {
      expect(canvas.getByText("7")).toBeInTheDocument()
    })
  },
}

/** Example with custom cell renderers and row action buttons. */
export const WithActionsAndCustomCells: Story = {
  render: () => {
    const [selected, setSelected] = useState<string | null>(null)
    const [cart, setCart] = useState<Set<string>>(new Set())

    const columnsWithRenderer: DataTableColumnDef<Molecule>[] = [
      { key: "id", label: "ID", type: "string" },
      {
        key: "simA",
        label: "Similarity (A)",
        type: "number",
        description: "Tanimoto similarity to parent molecule A",
        renderCell: (_row, value) => {
          const v = Number(value)
          const pct = Math.round(v * 100)
          return (
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${pct}%`, opacity: Math.max(0.3, v) }}
                />
              </div>
              <span className="font-mono text-xs text-foreground">
                {v.toFixed(3)}
              </span>
            </div>
          )
        },
      },
      { key: "mw", label: "MW", type: "number" },
      { key: "mpoScore", label: "MPO Score", type: "number" },
      { key: "saScore", label: "SA Score", type: "number" },
    ]

    return (
      <div>
        <DataTable<Molecule>
          data={molecules}
          columns={columnsWithRenderer}
          title="Molecules with Actions"
          getRowId={(r) => r.id}
          selectedRowId={selected}
          onSelectionChange={setSelected}
          defaultSortRules={[{ key: "mpoScore", dir: "desc" }]}
          renderActions={(row) => {
            const inCart = cart.has(row.id)
            return inCart ? (
              <button
                onClick={() =>
                  setCart((prev) => {
                    const n = new Set(prev)
                    n.delete(row.id)
                    return n
                  })
                }
                className="px-2 py-1 rounded bg-primary/10 text-primary hover:bg-destructive/10 hover:text-destructive text-[11px] font-medium transition-colors whitespace-nowrap"
              >
                In cart
              </button>
            ) : (
              <button
                onClick={() =>
                  setCart((prev) => new Set(prev).add(row.id))
                }
                className="px-2 py-1 rounded border border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 text-[11px] font-medium transition-colors whitespace-nowrap"
              >
                Add
              </button>
            )
          }}
        />
      </div>
    )
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1573-3" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Table renders with custom cells", async () => {
      expect(
        canvas.getByText("Molecules with Actions"),
      ).toBeInTheDocument()
      expect(canvas.getByText("Action")).toBeInTheDocument()
    })
  },
}

/** Compact density for data-dense views. */
export const CompactDensity: Story = {
  render: () => (
    <div>
      <DataTable<Compound>
        data={compounds}
        columns={compoundColumns}
        title="Compound Library"
        subtitle={`${compounds.length} compounds`}
        getRowId={(r) => r.id}
        defaultSortRules={[{ key: "name", dir: "asc" }]}
        density="compact"
      />
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1573-10" },
  },
}

/** Relaxed density for improved readability. */
export const RelaxedDensity: Story = {
  render: () => (
    <div>
      <DataTable<Compound>
        data={compounds}
        columns={compoundColumns}
        title="Compound Library"
        subtitle={`${compounds.length} compounds`}
        getRowId={(r) => r.id}
        defaultSortRules={[{ key: "name", dir: "asc" }]}
        density="relaxed"
      />
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1573-11" },
  },
}

/** Drag column headers to reorder columns. */
export const Reorderable: Story = {
  render: () => (
    <div>
      <DataTable<Compound>
        data={compounds}
        columns={compoundColumns}
        title="Compound Library"
        subtitle="Drag column headers to reorder"
        getRowId={(r) => r.id}
        defaultSortRules={[{ key: "name", dir: "asc" }]}
        reorderable
        pagination
        defaultPerPage={10}
      />
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1573-12" },
  },
}

/** Empty state when no data is provided. */
export const EmptyState: Story = {
  render: () => (
    <div>
      <DataTable<User>
        data={emptyUsers}
        columns={userColumns}
        title="Empty Table"
      />
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1573-4" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Empty state renders", async () => {
      expect(canvas.getByText("Empty Table")).toBeInTheDocument()
      expect(canvas.getByText("0 rows")).toBeInTheDocument()
      expect(canvas.getByText("No data to display")).toBeInTheDocument()
    })
  },
}
