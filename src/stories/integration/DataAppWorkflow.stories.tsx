/**
 * Source-tree integration tests for the UI kit.
 *
 * These stories wire up a realistic scientific data app using components
 * imported via the package alias (which resolves to src/index.ts in this
 * repo — not the compiled dist/). They catch interaction regressions in
 * sort, filter, pagination, and row actions across the component surface,
 * but do not validate the published build artifact.
 *
 * For a consumer build smoke test (verifying dist/ exports are intact after
 * a release), a separate CI job running against the compiled output would be
 * needed.
 */
import {
  Badge,
  Button,
  DataTable,
  DataTableFilter,
  DataTablePagination,
  TableToolbar,
} from "@tetrascience-npm/tetrascience-react-ui"
import { expect, fn, userEvent, within } from "storybook/test"

import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ColumnDef } from "@tanstack/react-table"

// ---------------------------------------------------------------------------
// Sample dataset — a compound registry a scientist would see in a data app
// ---------------------------------------------------------------------------

interface Compound {
  id: string
  name: string
  category: string
  status: "Active" | "Inactive" | "Under Review"
  purity: number
  mw: number
}

const compounds: Compound[] = [
  { id: "CPD-001", name: "Aspirin",        category: "Analgesic",      status: "Active",       purity: 99.2, mw: 180.16 },
  { id: "CPD-002", name: "Ibuprofen",      category: "Analgesic",      status: "Active",       purity: 99.8, mw: 206.29 },
  { id: "CPD-003", name: "Metformin",      category: "Antidiabetic",   status: "Active",       purity: 99.0, mw: 129.16 },
  { id: "CPD-004", name: "Penicillin G",   category: "Antibiotic",     status: "Inactive",     purity: 97.1, mw: 334.39 },
  { id: "CPD-005", name: "Omeprazole",     category: "Antacid",        status: "Active",       purity: 98.9, mw: 345.42 },
  { id: "CPD-006", name: "Loratadine",     category: "Antihistamine",  status: "Inactive",     purity: 99.5, mw: 382.88 },
  { id: "CPD-007", name: "Amoxicillin",    category: "Antibiotic",     status: "Active",       purity: 96.3, mw: 365.40 },
  { id: "CPD-008", name: "Atorvastatin",   category: "Statin",         status: "Active",       purity: 98.1, mw: 558.64 },
  { id: "CPD-009", name: "Lisinopril",     category: "ACE Inhibitor",  status: "Under Review", purity: 97.8, mw: 405.49 },
  { id: "CPD-010", name: "Sertraline",     category: "Antidepressant", status: "Active",       purity: 98.4, mw: 306.23 },
  { id: "CPD-011", name: "Ciprofloxacin",  category: "Antibiotic",     status: "Active",       purity: 99.1, mw: 331.34 },
  { id: "CPD-012", name: "Warfarin",       category: "Anticoagulant",  status: "Under Review", purity: 98.7, mw: 308.33 },
]

const statusVariant: Record<Compound["status"], "default" | "secondary" | "outline"> = {
  "Active":       "default",
  "Inactive":     "secondary",
  "Under Review": "outline",
}

// ---------------------------------------------------------------------------
// Test fixture — a representative data app built on top of the kit
// ---------------------------------------------------------------------------

function CompoundRegistry({ onView }: { onView: (compound: Compound) => void }) {
  const columns: ColumnDef<Compound>[] = [
    { accessorKey: "id",       header: "ID" },
    { accessorKey: "name",     header: "Name" },
    { accessorKey: "category", header: "Category" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue<Compound["status"]>("status")
        return <Badge variant={statusVariant[status]}>{status}</Badge>
      },
    },
    { accessorKey: "purity", header: "Purity (%)" },
    { accessorKey: "mw",     header: "MW (g/mol)" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button size="xs" variant="outline" onClick={() => onView(row.original)}>
          View
        </Button>
      ),
    },
  ]

  return (
    <div className="p-4 space-y-2">
      <h2 className="text-title-md font-medium">Compound Registry</h2>
      <DataTable
        columns={columns}
        data={compounds}
        enableSorting
        enableFiltering
        enablePagination
        defaultPageSize={5}
      >
        <TableToolbar>
          <DataTableFilter />
        </TableToolbar>
        <DataTablePagination />
      </DataTable>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Storybook meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof CompoundRegistry> = {
  title: "Integration/DataAppWorkflow",
  component: CompoundRegistry,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Source-tree integration tests. Exercises sort, filter, pagination, and row actions across DataTable, Badge, Button, and toolbar components in a realistic data-app composition.",
      },
    },
  },
}

export default meta

type Story = StoryObj<typeof CompoundRegistry>

// ---------------------------------------------------------------------------
// Story 1: Table renders correctly
// ---------------------------------------------------------------------------

export const RendersWithData: Story = {
  args: { onView: fn() },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Table renders with correct column headers", async () => {
      expect(canvas.getByRole("table")).toBeInTheDocument()
      expect(canvas.getByRole("columnheader", { name: "Name" })).toBeInTheDocument()
      expect(canvas.getByRole("columnheader", { name: "Category" })).toBeInTheDocument()
      expect(canvas.getByRole("columnheader", { name: "Status" })).toBeInTheDocument()
    })

    await step("First page shows 5 data rows (defaultPageSize=5)", async () => {
      const dataRows = canvas.getAllByRole("row").slice(1)
      expect(dataRows).toHaveLength(5)
    })

    await step("Status column renders Badge components", async () => {
      const activeBadges = canvas.getAllByText("Active")
      expect(activeBadges.length).toBeGreaterThan(0)
    })

    await step("Each row has a View action button", async () => {
      const viewButtons = canvas.getAllByRole("button", { name: "View" })
      expect(viewButtons).toHaveLength(5)
    })
  },
  parameters: {
    zephyr: { testCaseId: "" },
  },
}

// ---------------------------------------------------------------------------
// Story 2: Sorting
// ---------------------------------------------------------------------------

export const SortByName: Story = {
  args: { onView: fn() },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Initial render shows table", async () => {
      expect(canvas.getByRole("table")).toBeInTheDocument()
    })

    await step("Clicking Name header sorts ascending", async () => {
      // Click the inner sort div, not the <th> — the onClick handler lives there
      await userEvent.click(canvas.getByText("Name"))
      const rows = canvas.getAllByRole("row").slice(1)
      expect(rows[0]).toHaveTextContent("Amoxicillin")
    })

    await step("Clicking Name header again sorts descending", async () => {
      await userEvent.click(canvas.getByText("Name"))
      const rows = canvas.getAllByRole("row").slice(1)
      expect(rows[0]).toHaveTextContent("Warfarin")
    })
  },
  parameters: {
    zephyr: { testCaseId: "" },
  },
}

// ---------------------------------------------------------------------------
// Story 3: Filtering
// ---------------------------------------------------------------------------

export const FilterByCategory: Story = {
  args: { onView: fn() },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Open filter panel and add a filter row", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /filter/i }))
      await userEvent.click(body.getByRole("button", { name: /add filter/i }))
      expect(body.getByPlaceholderText(/value/i)).toBeInTheDocument()
    })

    await step("Select Category column in the filter", async () => {
      const columnSelects = body.getAllByRole("combobox")
      await userEvent.click(columnSelects[0])
      await userEvent.click(body.getByRole("option", { name: "Category" }))
    })

    await step("Typing 'Antibiotic' filters to exactly 3 matching rows", async () => {
      await userEvent.type(body.getByPlaceholderText(/value/i), "Antibiotic")
      const rows = canvas.getAllByRole("row").slice(1)
      // Dataset has exactly 3 antibiotics: Penicillin G, Amoxicillin, Ciprofloxacin
      expect(rows).toHaveLength(3)
      rows.forEach((row) => expect(row).toHaveTextContent("Antibiotic"))
    })

    await step("Clear all restores all rows", async () => {
      await userEvent.click(body.getByRole("button", { name: /clear all/i }))
      expect(canvas.getAllByRole("row").slice(1)).toHaveLength(5)
    })
  },
  parameters: {
    zephyr: { testCaseId: "" },
  },
}

// ---------------------------------------------------------------------------
// Story 4: Pagination
// ---------------------------------------------------------------------------

export const Pagination: Story = {
  args: { onView: fn() },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Page 1 shows first 5 rows and pagination summary", async () => {
      expect(canvas.getAllByRole("row").slice(1)).toHaveLength(5)
      expect(canvas.getByText(/1–5 of 12/)).toBeInTheDocument()
    })

    await step("Next → page 2", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /next/i }))
      expect(canvas.getAllByRole("row").slice(1)).toHaveLength(5)
      expect(canvas.getByText(/6–10 of 12/)).toBeInTheDocument()
    })

    await step("Next → last page with 2 rows", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /next/i }))
      expect(canvas.getAllByRole("row").slice(1)).toHaveLength(2)
      expect(canvas.getByText(/11–12 of 12/)).toBeInTheDocument()
    })

    await step("Previous → back to page 2", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /previous/i }))
      expect(canvas.getByText(/6–10 of 12/)).toBeInTheDocument()
    })
  },
  parameters: {
    zephyr: { testCaseId: "" },
  },
}

// ---------------------------------------------------------------------------
// Story 5: Row action callback
// ---------------------------------------------------------------------------

export const RowActionCallback: Story = {
  args: { onView: fn() },
  play: async ({ canvasElement, step, args }) => {
    const canvas = within(canvasElement)

    await step("Table renders with View buttons", async () => {
      expect(canvas.getAllByRole("button", { name: "View" })).toHaveLength(5)
    })

    await step("Clicking View on first row calls onView with correct compound", async () => {
      await userEvent.click(canvas.getAllByRole("button", { name: "View" })[0])
      expect(args.onView).toHaveBeenCalledTimes(1)
      expect(args.onView).toHaveBeenCalledWith(
        expect.objectContaining({ id: "CPD-001", name: "Aspirin" }),
      )
    })

    await step("Clicking View on second row calls onView with correct compound", async () => {
      await userEvent.click(canvas.getAllByRole("button", { name: "View" })[1])
      expect(args.onView).toHaveBeenCalledTimes(2)
      expect(args.onView).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: "CPD-002", name: "Ibuprofen" }),
      )
    })
  },
  parameters: {
    zephyr: { testCaseId: "" },
  },
}
