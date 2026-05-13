/**
 * Consumer-perspective integration tests for the UI kit.
 *
 * These stories simulate a developer who has installed the kit and built a
 * real scientific data app on top of it — importing only from the public
 * package surface, wiring real data, and exercising the full interaction
 * loop (sort → filter → paginate → row action).
 *
 * If these tests break, a real app built on ts-lib-ui-kit would also break.
 */
import {
  Badge,
  Button,
  DataTable,
  DataTableFilter,
  DataTablePagination,
  TableToolbar,
} from "@tetrascience-npm/tetrascience-react-ui"
import * as React from "react"
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
  { id: "CPD-001", name: "Aspirin",       category: "Analgesic",     status: "Active",       purity: 99.2, mw: 180.16 },
  { id: "CPD-002", name: "Ibuprofen",     category: "Analgesic",     status: "Active",       purity: 99.8, mw: 206.29 },
  { id: "CPD-003", name: "Metformin",     category: "Antidiabetic",  status: "Active",       purity: 99.0, mw: 129.16 },
  { id: "CPD-004", name: "Penicillin G",  category: "Antibiotic",    status: "Inactive",     purity: 97.1, mw: 334.39 },
  { id: "CPD-005", name: "Omeprazole",    category: "Antacid",       status: "Active",       purity: 98.9, mw: 345.42 },
  { id: "CPD-006", name: "Loratadine",    category: "Antihistamine", status: "Inactive",     purity: 99.5, mw: 382.88 },
  { id: "CPD-007", name: "Amoxicillin",   category: "Antibiotic",    status: "Active",       purity: 96.3, mw: 365.40 },
  { id: "CPD-008", name: "Atorvastatin",  category: "Statin",        status: "Active",       purity: 98.1, mw: 558.64 },
  { id: "CPD-009", name: "Lisinopril",    category: "ACE Inhibitor", status: "Under Review", purity: 97.8, mw: 405.49 },
  { id: "CPD-010", name: "Sertraline",    category: "Antidepressant",status: "Active",       purity: 98.4, mw: 306.23 },
  { id: "CPD-011", name: "Ciprofloxacin", category: "Antibiotic",    status: "Active",       purity: 99.1, mw: 331.34 },
  { id: "CPD-012", name: "Warfarin",      category: "Anticoagulant", status: "Under Review", purity: 98.7, mw: 308.33 },
]

const statusVariant: Record<Compound["status"], "default" | "secondary" | "outline"> = {
  "Active":       "default",
  "Inactive":     "secondary",
  "Under Review": "outline",
}

// ---------------------------------------------------------------------------
// Consumer app component — what a developer would actually build
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
          "End-to-end consumer workflow test. Imports exclusively from the public package surface and exercises sort, filter, pagination, and row actions the way a real data app would.",
      },
    },
  },
}

export default meta

type Story = StoryObj<typeof CompoundRegistry>

// ---------------------------------------------------------------------------
// Story 1: Table renders correctly for a consumer app
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
      // getAllByRole("row") includes header — subtract 1
      const dataRows = canvas.getAllByRole("row").slice(1)
      expect(dataRows).toHaveLength(5)
    })

    await step("Status column renders Badge components", async () => {
      // At least one Active badge visible on first page
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
// Story 2: Sorting — clicking a column header sorts the data
// ---------------------------------------------------------------------------

export const SortByName: Story = {
  args: { onView: fn() },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Initial render shows table", async () => {
      expect(canvas.getByRole("table")).toBeInTheDocument()
    })

    await step("Clicking Name header sorts ascending", async () => {
      const nameHeader = canvas.getByRole("columnheader", { name: "Name" })
      await userEvent.click(nameHeader)
      const rows = canvas.getAllByRole("row").slice(1)
      expect(rows.length).toBeGreaterThan(0)
      // First row should now be Amoxicillin (alphabetically first on page 1)
      expect(rows[0]).toHaveTextContent("Amoxicillin")
    })

    await step("Clicking Name header again sorts descending", async () => {
      const nameHeader = canvas.getByRole("columnheader", { name: "Name" })
      await userEvent.click(nameHeader)
      const rows = canvas.getAllByRole("row").slice(1)
      // First row should now be the last alphabetically visible: Warfarin
      expect(rows[0]).toHaveTextContent("Warfarin")
    })
  },
  parameters: {
    zephyr: { testCaseId: "" },
  },
}

// ---------------------------------------------------------------------------
// Story 3: Filtering — typing in the filter narrows visible rows
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
      // The column selector is a combobox — open it and pick Category
      const columnSelects = body.getAllByRole("combobox")
      await userEvent.click(columnSelects[0])
      const categoryOption = body.getByRole("option", { name: "Category" })
      await userEvent.click(categoryOption)
    })

    await step("Typing 'Antibiotic' filters to only antibiotic rows", async () => {
      await userEvent.type(body.getByPlaceholderText(/value/i), "Antibiotic")
      const rows = canvas.getAllByRole("row").slice(1)
      // 3 antibiotics in the dataset: Penicillin G, Amoxicillin, Ciprofloxacin
      expect(rows.length).toBeLessThanOrEqual(3)
      rows.forEach((row) => expect(row).toHaveTextContent("Antibiotic"))
    })

    await step("Clear all restores all rows", async () => {
      await userEvent.click(body.getByRole("button", { name: /clear all/i }))
      const rows = canvas.getAllByRole("row").slice(1)
      // Back to page 1 with 5 rows
      expect(rows).toHaveLength(5)
    })
  },
  parameters: {
    zephyr: { testCaseId: "" },
  },
}

// ---------------------------------------------------------------------------
// Story 4: Pagination — navigating between pages
// ---------------------------------------------------------------------------

export const Pagination: Story = {
  args: { onView: fn() },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Page 1 shows first 5 compounds and pagination summary", async () => {
      expect(canvas.getByRole("table")).toBeInTheDocument()
      expect(canvas.getAllByRole("row").slice(1)).toHaveLength(5)
      expect(canvas.getByText(/1–5 of 12/)).toBeInTheDocument()
    })

    await step("Clicking Next shows page 2 with remaining compounds", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /next/i }))
      const rows = canvas.getAllByRole("row").slice(1)
      expect(rows).toHaveLength(5)
      expect(canvas.getByText(/6–10 of 12/)).toBeInTheDocument()
    })

    await step("Clicking Next again shows the last page", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /next/i }))
      const rows = canvas.getAllByRole("row").slice(1)
      // Last page has 2 rows (12 total, page size 5)
      expect(rows).toHaveLength(2)
      expect(canvas.getByText(/11–12 of 12/)).toBeInTheDocument()
    })

    await step("Clicking Previous returns to page 2", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /previous/i }))
      expect(canvas.getByText(/6–10 of 12/)).toBeInTheDocument()
    })
  },
  parameters: {
    zephyr: { testCaseId: "" },
  },
}

// ---------------------------------------------------------------------------
// Story 5: Row action — clicking View fires the callback with correct data
// ---------------------------------------------------------------------------

export const RowActionCallback: Story = {
  args: { onView: fn() },
  play: async ({ canvasElement, step, args }) => {
    const canvas = within(canvasElement)

    await step("Table renders with View buttons", async () => {
      expect(canvas.getAllByRole("button", { name: "View" })).toHaveLength(5)
    })

    await step("Clicking View on first row calls onView with correct compound", async () => {
      const viewButtons = canvas.getAllByRole("button", { name: "View" })
      await userEvent.click(viewButtons[0])
      expect(args.onView).toHaveBeenCalledTimes(1)
      // First compound in the dataset is Aspirin (CPD-001)
      expect(args.onView).toHaveBeenCalledWith(
        expect.objectContaining({ id: "CPD-001", name: "Aspirin" }),
      )
    })

    await step("Clicking View on a second row calls onView again with that compound", async () => {
      const viewButtons = canvas.getAllByRole("button", { name: "View" })
      await userEvent.click(viewButtons[1])
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
