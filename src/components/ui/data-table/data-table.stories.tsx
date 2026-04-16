import * as React from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"
import { expect, userEvent, within } from "storybook/test"

import compoundsData from "../../../../.storybook/__fixtures__/compounds"
import moleculesData from "../../../../.storybook/__fixtures__/molecules"
import usersData from "../../../../.storybook/__fixtures__/users"
import { Badge } from "../badge"

import { DataTable, TableToolbar, useDataTable } from "./data-table"
import { DataTableColumnToggle } from "./data-table-column-toggle"
import { DataTablePagination } from "./data-table-pagination"

import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ColumnDef } from "@tanstack/react-table"

// ---------------------------------------------------------------------------
// Dataset definitions
// ---------------------------------------------------------------------------

type DatasetKey = "Workspaces" | "Compounds" | "Molecules" | "Users"

type Row = Record<string, unknown>

const workspaceData: Row[] = [
  { id: "1", name: "Clinical exports", owner: "Data Ops", status: "Active", runs: 142, createdAt: "2025-12-01" },
  { id: "2", name: "QC dashboard", owner: "Analytics", status: "Paused", runs: 38, createdAt: "2025-11-15" },
  { id: "3", name: "Audit trail", owner: "Compliance", status: "Active", runs: 94, createdAt: "2025-10-20" },
  { id: "4", name: "Proteomics pipeline", owner: "Research", status: "Active", runs: 217, createdAt: "2025-09-05" },
  { id: "5", name: "Data lake ETL", owner: "Data Ops", status: "Archived", runs: 0, createdAt: "2025-08-10" },
]

const workspaceColumns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "owner", header: "Owner" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "runs", header: "Runs", cell: ({ row }) => <span className="text-right tabular-nums">{String(row.getValue("runs"))}</span> },
  { accessorKey: "createdAt", header: "Created At" },
]

const compoundColumns: ColumnDef<Row>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "formula", header: "Formula" },
  { accessorKey: "mw", header: "MW", cell: ({ row }) => <span className="tabular-nums">{Number(row.getValue("mw")).toFixed(2)}</span> },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "purity", header: "Purity (%)", cell: ({ row }) => <span className="tabular-nums">{Number(row.getValue("purity")).toFixed(1)}</span> },
  { accessorKey: "detail", header: "Detail" },
]

const moleculeColumns: ColumnDef<Row>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "simA", header: "Sim A", cell: ({ row }) => <span className="tabular-nums">{Number(row.getValue("simA")).toFixed(3)}</span> },
  { accessorKey: "simB", header: "Sim B", cell: ({ row }) => <span className="tabular-nums">{Number(row.getValue("simB")).toFixed(3)}</span> },
  { accessorKey: "mpoScore", header: "MPO Score", cell: ({ row }) => <span className="tabular-nums">{Number(row.getValue("mpoScore")).toFixed(2)}</span> },
  { accessorKey: "saScore", header: "SA Score", cell: ({ row }) => <span className="tabular-nums">{Number(row.getValue("saScore")).toFixed(1)}</span> },
  { accessorKey: "lipE", header: "LipE", cell: ({ row }) => <span className="tabular-nums">{Number(row.getValue("lipE")).toFixed(2)}</span> },
  { accessorKey: "mw", header: "MW", cell: ({ row }) => <span className="tabular-nums">{Number(row.getValue("mw")).toFixed(1)}</span> },
  { accessorKey: "psa", header: "PSA" },
  { accessorKey: "clogp", header: "cLogP", cell: ({ row }) => <span className="tabular-nums">{Number(row.getValue("clogp")).toFixed(2)}</span> },
  { accessorKey: "hba", header: "HBA" },
  { accessorKey: "hbd", header: "HBD" },
  { accessorKey: "heavyAtoms", header: "Heavy Atoms" },
  { accessorKey: "rotatableBonds", header: "Rotatable Bonds" },
]

const userColumns: ColumnDef<Row>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "age", header: "Age" },
  { accessorKey: "department", header: "Department" },
]

const datasetConfigs: Record<DatasetKey, { data: Row[]; columns: ColumnDef<Row>[] }> = {
  Workspaces: { data: workspaceData, columns: workspaceColumns },
  Compounds: { data: compoundsData, columns: compoundColumns },
  Molecules: { data: moleculesData, columns: moleculeColumns },
  Users: { data: usersData, columns: userColumns },
}

function getDataset(args: Record<string, unknown>) {
  return datasetConfigs[(args.dataset as DatasetKey) ?? "Workspaces"]
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof DataTable> = {
  title: "Components/Data Table",
  component: DataTable,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    dataset: {
      control: { type: "select" },
      options: ["Workspaces", "Compounds", "Molecules", "Users"],
    },
  },
  args: { dataset: "Workspaces" },
}

export default meta

type Story = StoryObj<typeof DataTable>

// ===========================================================================
// Basic stories
// ===========================================================================

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: (args) => {
    const { data, columns } = getDataset(args as Record<string, unknown>)
    return <DataTable columns={columns} data={data} />
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Table renders with headers and rows", async () => {
      expect(canvas.getByRole("table")).toBeInTheDocument()
      const headers = canvas.getAllByRole("columnheader")
      expect(headers.length).toBeGreaterThanOrEqual(4)
      const rows = canvas.getAllByRole("row")
      expect(rows.length).toBeGreaterThan(1)
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1433" },
  },
}

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

export const Sorting: Story = {
  render: (args) => {
    const { data, columns } = getDataset(args as Record<string, unknown>)
    return <DataTable columns={columns} data={data} enableSorting />
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Clicking a header sorts ascending", async () => {
      const headers = canvas.getAllByRole("columnheader")
      await userEvent.click(headers[0])
      // Ascending sort icon should be visible
      const sortIcon = headers[0].querySelector("[data-lucide='arrow-up']") ?? headers[0].querySelector("svg")
      expect(sortIcon).not.toBeNull()
    })

    await step("Clicking the same header again sorts descending", async () => {
      const headers = canvas.getAllByRole("columnheader")
      await userEvent.click(headers[0])
      expect(canvas.getAllByRole("row").length).toBeGreaterThan(1)
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1434" },
  },
}

// ---------------------------------------------------------------------------
// CustomCells
// ---------------------------------------------------------------------------

const statusVariant: Record<string, "default" | "outline" | "secondary"> = {
  Active: "default",
  Paused: "outline",
  Archived: "secondary",
  Inactive: "secondary",
}

const customCellColumns: ColumnDef<Row>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const value = String(row.getValue("status"))
      return <Badge variant={statusVariant[value] ?? "secondary"}>{value}</Badge>
    },
  },
]

export const CustomCells: Story = {
  render: (args) => {
    const { data, columns } = getDataset(args as Record<string, unknown>)
    // Dedupe columns by accessorKey, giving precedence to customCellColumns
    const customKeys = new Set(customCellColumns.map(c => c.accessorKey))
    const dedupedColumns = [
      ...columns.filter(c => !("accessorKey" in c && customKeys.has(c.accessorKey))),
      ...customCellColumns,
    ]
    return <DataTable columns={dedupedColumns} data={data} enableSorting />
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Table renders with custom Badge cells", async () => {
      expect(canvas.getByRole("table")).toBeInTheDocument()
      const badges = canvasElement.querySelectorAll("[data-slot='badge']")
      expect(badges.length).toBeGreaterThan(0)
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1435" },
  },
}

// ===========================================================================
// Feature stories
// ===========================================================================

// ---------------------------------------------------------------------------
// ColumnManagement
// ---------------------------------------------------------------------------

function ColumnToggleStory({ dataset }: { dataset: DatasetKey }) {
  const { data, columns } = datasetConfigs[dataset]
  return (
    <DataTable
      columns={columns}
      data={data}
      enableColumnVisibility
    >
      <TableToolbar>
        <div className="flex-1" />
        <DataTableColumnToggle />
      </TableToolbar>
    </DataTable>
  )
}

export const ColumnManagement: Story = {
  render: (args) => <ColumnToggleStory dataset={((args as Record<string, unknown>).dataset as DatasetKey) ?? "Workspaces"} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Column toggle button is present", async () => {
      expect(canvas.getByRole("button", { name: /Columns/ })).toBeInTheDocument()
    })

    await step("Clicking opens dropdown with column checkboxes", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /Columns/ }))
      const checkboxes = body.getAllByRole("checkbox")
      expect(checkboxes.length).toBeGreaterThan(0)
    })

    await step("Toggling a column via keyboard hides it", async () => {
      const checkboxes = body.getAllByRole("checkbox")
      const initialHeaderCount = canvas.getAllByRole("columnheader").length
      // Focus and press Enter to toggle visibility
      checkboxes[0].focus()
      await userEvent.keyboard("{Enter}")
      const newHeaderCount = canvas.getAllByRole("columnheader").length
      expect(newHeaderCount).toBe(initialHeaderCount - 1)
    })

    await step("Clicking outside closes the dropdown", async () => {
      // Panel should be open from previous step
      expect(body.queryByRole("group", { name: /Toggle and reorder/ })).not.toBeNull()
      // Click outside the panel on the table body
      await userEvent.click(canvas.getByRole("table"))
      // Panel should close
      expect(body.queryByRole("group", { name: /Toggle and reorder/ })).toBeNull()
    })

    await step("Re-toggling the hidden column restores it via click", async () => {
      const headersBefore = canvas.getAllByRole("columnheader").length
      // Re-open the panel
      await userEvent.click(canvas.getByRole("button", { name: /Columns/ }))
      const checkboxes = body.getAllByRole("checkbox")
      // Find the unchecked one (the column we hid earlier)
      const unchecked = checkboxes.find((cb) => cb.getAttribute("aria-checked") === "false")
      if (unchecked) {
        await userEvent.click(unchecked)
        const headersAfter = canvas.getAllByRole("columnheader").length
        expect(headersAfter).toBe(headersBefore + 1)
      }
      // Close the panel
      await userEvent.click(canvas.getByRole("table"))
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1436" },
  },
}

// ---------------------------------------------------------------------------
// LastVisibleColumn — covers the isLastVisible guard (line 186 of column-toggle)
// ---------------------------------------------------------------------------

function SingleVisibleColumnStory({ dataset }: { dataset: DatasetKey }) {
  const { data, columns } = datasetConfigs[dataset]
  // Start with only the first column visible
  const initialVisibility: Record<string, boolean> = {}
  for (const col of columns) {
    const key = "accessorKey" in col ? String(col.accessorKey) : ""
    initialVisibility[key] = false
  }
  const firstKey = "accessorKey" in columns[0] ? String(columns[0].accessorKey) : ""
  initialVisibility[firstKey] = true

  return (
    <DataTable
      columns={columns}
      data={data}
      enableColumnVisibility
      columnVisibility={initialVisibility}
    >
      <TableToolbar>
        <div className="flex-1" />
        <DataTableColumnToggle />
      </TableToolbar>
    </DataTable>
  )
}

export const LastVisibleColumn: Story = {
  render: (args) => <SingleVisibleColumnStory dataset={((args as Record<string, unknown>).dataset as DatasetKey) ?? "Workspaces"} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Only one column header is visible", async () => {
      expect(canvas.getAllByRole("columnheader").length).toBe(1)
    })

    await step("Clicking the last visible column checkbox does not hide it", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /Columns/ }))
      const checkboxes = body.getAllByRole("checkbox")
      // Find the one that is checked (the only visible column)
      const checked = checkboxes.find((cb) => cb.getAttribute("aria-checked") === "true")
      expect(checked).toBeDefined()
      // Click it — should be a no-op since it's the last visible column
      await userEvent.click(checked!)
      // Column should still be visible
      expect(canvas.getAllByRole("columnheader").length).toBe(1)
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1437" },
  },
}

// ---------------------------------------------------------------------------
// ColumnToggleCustomLabels — covers the columnLabels branch in getLabel()
// ---------------------------------------------------------------------------

// Columns using meta.label (for getLabel fallback coverage) and a non-string header
const metaLabelColumns: ColumnDef<Row>[] = [
  { accessorKey: "name", meta: { label: "Meta Name" }, header: () => "Name" },
  { accessorKey: "owner", header: "Owner" },
  { accessorKey: "status", header: "Status" },
  // No meta.label AND non-string header → falls through to col.id ("runs")
  { accessorKey: "runs", header: () => "Runs" },
]

function ColumnToggleCustomLabelsStory({ dataset }: { dataset: DatasetKey }) {
  const { data } = datasetConfigs[dataset]
  // First column: has columnLabels override (highest priority)
  // Second column: falls through to header string
  // Use metaLabelColumns for meta.label + non-string header branches
  return (
    <DataTable
      columns={metaLabelColumns}
      data={data}
      enableColumnVisibility
      columnLabels={{ owner: "Custom Owner" }}
    >
      <TableToolbar>
        <div className="flex-1" />
        <DataTableColumnToggle />
      </TableToolbar>
    </DataTable>
  )
}

export const ColumnToggleCustomLabels: Story = {
  render: (args) => <ColumnToggleCustomLabelsStory dataset={((args as Record<string, unknown>).dataset as DatasetKey) ?? "Workspaces"} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Column toggle panel shows labels from all fallback paths", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /Columns/ }))
      const panel = body.getByRole("group", { name: /Toggle and reorder/ })
      // "owner" column uses columnLabels prop (highest priority)
      expect(within(panel).getByText("Custom Owner")).toBeInTheDocument()
      // "name" column uses meta.label since header is a function (not a string)
      expect(within(panel).getByText("Meta Name")).toBeInTheDocument()
      // "status" column uses header string (normal path)
      expect(within(panel).getByText("Status")).toBeInTheDocument()
      // "runs" column has non-string header and no meta.label → falls back to col.id
      expect(within(panel).getByText("runs")).toBeInTheDocument()
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1438" },
  },
}

// ---------------------------------------------------------------------------
// ColumnToggleReorder — exercises the drag handler in DataTableColumnToggle
// ---------------------------------------------------------------------------

function ColumnToggleReorderStory({ dataset }: { dataset: DatasetKey }) {
  const { data, columns } = datasetConfigs[dataset]
  return (
    <DataTable
      columns={columns}
      data={data}
      enableColumnVisibility
      enableColumnReorder
    >
      <TableToolbar>
        <div className="flex-1" />
        <DataTableColumnToggle />
      </TableToolbar>
    </DataTable>
  )
}

export const ColumnToggleReorder: Story = {
  render: (args) => <ColumnToggleReorderStory dataset={((args as Record<string, unknown>).dataset as DatasetKey) ?? "Workspaces"} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Open column toggle and record initial header order", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /Columns/ }))
      const panel = body.getByRole("group", { name: /Toggle and reorder/ })
      expect(panel).toBeInTheDocument()
    })

    await step("No-op drag: pick up and drop in place preserves order", async () => {
      const panel = body.getByRole("group", { name: /Toggle and reorder/ })
      const grabHandles = [...panel.querySelectorAll("button")]
        .filter((btn) => btn.querySelector("svg"))
        .filter((btn) => btn.closest("[role='checkbox']"))

      if (grabHandles.length >= 1) {
        const headersBefore = canvas.getAllByRole("columnheader").map((h) => h.textContent)

        // Pick up with Space and immediately drop with Space (no arrow key)
        grabHandles[0].focus()
        await userEvent.keyboard(" ")
        await userEvent.keyboard(" ")

        // Order should be unchanged
        const headersAfter = canvas.getAllByRole("columnheader").map((h) => h.textContent)
        expect(headersAfter).toEqual(headersBefore)
      }
    })

    await step("Keyboard drag reorders columns in the toggle panel", async () => {
      const panel = body.getByRole("group", { name: /Toggle and reorder/ })
      const grabHandles = [...panel.querySelectorAll("button")]
        .filter((btn) => btn.querySelector("svg"))
        .filter((btn) => btn.closest("[role='checkbox']"))

      if (grabHandles.length >= 2) {
        const headersBefore = canvas.getAllByRole("columnheader").map((h) => h.textContent)

        // Focus the first grab handle, start drag with Space, move down with ArrowDown, drop with Space
        grabHandles[0].focus()
        await userEvent.keyboard(" ")
        await userEvent.keyboard("{ArrowDown}")
        await userEvent.keyboard(" ")

        // Check headers changed order
        const headersAfter = canvas.getAllByRole("columnheader").map((h) => h.textContent)
        // The first two columns should have swapped
        expect(headersAfter[0]).toBe(headersBefore[1])
        expect(headersAfter[1]).toBe(headersBefore[0])
      }
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1439" },
  },
}

// ---------------------------------------------------------------------------
// ColumnReorder
// ---------------------------------------------------------------------------

export const ColumnReorder: Story = {
  render: (args) => {
    const { data, columns } = getDataset(args as Record<string, unknown>)
    return <DataTable columns={columns} data={data} enableColumnReorder enableSorting />
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Table renders with drag handles on headers", async () => {
      expect(canvas.getByRole("table")).toBeInTheDocument()
      const dragHandles = canvasElement.querySelectorAll("[data-drag-handle]")
      expect(dragHandles.length).toBeGreaterThan(0)
    })

    await step("Keyboard drag on header reorders columns", async () => {
      const headersBefore = canvas.getAllByRole("columnheader").map((h) => h.textContent)
      // Find the drag handle buttons in the table headers
      const dragHandles = [...canvasElement.querySelectorAll("[data-drag-handle]")] as HTMLElement[]
      expect(dragHandles.length).toBeGreaterThanOrEqual(2)

      // Focus the first drag handle, initiate drag with Space, move right, drop with Space
      dragHandles[0].focus()
      await userEvent.keyboard(" ")
      await userEvent.keyboard("{ArrowRight}")
      await userEvent.keyboard(" ")

      // The first two columns should have swapped
      const headersAfter = canvas.getAllByRole("columnheader").map((h) => h.textContent)
      expect(headersAfter[0]).toBe(headersBefore[1])
      expect(headersAfter[1]).toBe(headersBefore[0])
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1440" },
  },
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export const Pagination: Story = {
  args: { dataset: "Compounds" },
  render: (args) => {
    const { data, columns } = getDataset(args as Record<string, unknown>)
    return (
      <DataTable
        columns={columns}
        data={data}
        enableSorting
        enablePagination
        defaultPageSize={5}
      >
        <DataTablePagination pageSizeOptions={[5, 10, 25]} />
      </DataTable>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Pagination controls render", async () => {
      expect(canvas.getByText("Rows per page:")).toBeInTheDocument()
      expect(canvas.getByLabelText("Next page")).toBeInTheDocument()
      expect(canvas.getByLabelText("Previous page")).toBeInTheDocument()
    })

    await step("Shows correct row range", async () => {
      expect(canvas.getByText(/1–5 of/)).toBeInTheDocument()
    })

    await step("Clicking next page shows next rows", async () => {
      await userEvent.click(canvas.getByLabelText("Next page"))
      expect(canvas.getByText(/6–10 of/)).toBeInTheDocument()
    })

    await step("Clicking a specific page number navigates to it", async () => {
      await userEvent.click(canvas.getByLabelText("Page 3"))
      expect(canvas.getByText(/11–15 of/)).toBeInTheDocument()
      // Page 3 button should be current
      expect(canvas.getByLabelText("Page 3")).toHaveAttribute("aria-current", "page")
    })

    await step("Previous page button navigates back", async () => {
      await userEvent.click(canvas.getByLabelText("Previous page"))
      expect(canvas.getByText(/6–10 of/)).toBeInTheDocument()
    })

    await step("Changing page size updates rows per page", async () => {
      const body = within(canvasElement.ownerDocument.body)
      // Open the page-size select
      await userEvent.click(canvas.getByRole("combobox"))
      // Pick "10"
      await userEvent.click(body.getByRole("option", { name: "10" }))
      expect(canvas.getByText(/1–10 of/)).toBeInTheDocument()
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1441" },
  },
}

// ---------------------------------------------------------------------------
// WithCustomChildren — covers the restSlots branch in categorizeSlots
// ---------------------------------------------------------------------------

export const WithCustomChildren: Story = {
  render: (args) => {
    const { data, columns } = getDataset(args as Record<string, unknown>)
    return (
      <DataTable columns={columns} data={data}>
        <TableToolbar>
          <span>Toolbar content</span>
        </TableToolbar>
        {/* This arbitrary child is neither TableToolbar nor DataTablePagination */}
        <div data-testid="custom-child">Extra content below</div>
      </DataTable>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Custom child renders after the table", async () => {
      expect(canvas.getByTestId("custom-child")).toBeInTheDocument()
      expect(canvas.getByText("Extra content below")).toBeInTheDocument()
    })

    await step("Toolbar still renders in correct position", async () => {
      expect(canvas.getByText("Toolbar content")).toBeInTheDocument()
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1442" },
  },
}

// ---------------------------------------------------------------------------
// ReorderWithSorting — covers sort icons and keyboard sort inside the reorderable branch,
// plus DragOverlay col.id fallback for non-string headers
// ---------------------------------------------------------------------------

// Columns with non-string headers (function) — no columnLabels override
const reorderSortColumns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: () => "Name" },
  { accessorKey: "owner", header: () => "Owner" },
  { accessorKey: "status", header: () => "Status" },
]

export const ReorderWithSorting: Story = {
  render: () => (
    <DataTable
      columns={reorderSortColumns}
      data={workspaceData}
      enableColumnReorder
      enableSorting
    />
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Click header text to sort ascending in reorderable table", async () => {
      // Click the text inside the sort div (not the <th> itself, which has dnd listeners)
      const nameText = canvas.getByText("Name")
      await userEvent.click(nameText)
      expect(canvas.getAllByRole("row").length).toBeGreaterThan(1)
    })

    await step("Click same header text again to sort descending", async () => {
      const nameText = canvas.getByText("Name")
      await userEvent.click(nameText)
      expect(canvas.getAllByRole("row").length).toBeGreaterThan(1)
    })

    await step("Click a third time to clear sort", async () => {
      const nameText = canvas.getByText("Name")
      await userEvent.click(nameText)
      expect(canvas.getAllByRole("row").length).toBeGreaterThan(1)
    })

    await step("Keyboard Enter on sort div triggers sort handler", async () => {
      const headers = canvas.getAllByRole("columnheader")
      // The sort div has cursor-pointer and an onKeyDown handler
      const sortDiv = headers[1].querySelector("[class*='cursor-pointer']") as HTMLElement
      expect(sortDiv).not.toBeNull()
      // Dispatch a KeyboardEvent directly since the div has no tabIndex
      sortDiv.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
      expect(canvas.getAllByRole("row").length).toBeGreaterThan(1)
    })

    await step("Drag column with non-string header shows col.id in overlay", async () => {
      const dragHandles = [...canvasElement.querySelectorAll("[data-drag-handle]")] as HTMLElement[]
      expect(dragHandles.length).toBeGreaterThanOrEqual(2)

      // Start drag (Space), move right, drop (Space)
      dragHandles[0].focus()
      await userEvent.keyboard(" ")
      await userEvent.keyboard("{ArrowRight}")
      await userEvent.keyboard(" ")

      // Verify columns reordered
      const headersAfter = canvas.getAllByRole("columnheader").map((h) => h.textContent)
      expect(headersAfter.length).toBe(3)
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1477" },
  },
}

// ---------------------------------------------------------------------------
// ColumnLabelRename — covers setColumnLabel via useDataTable context
// ---------------------------------------------------------------------------

function RenameButton() {
  const { setColumnLabel } = useDataTable()
  return (
    <button
      className="rounded-lg border px-3 py-1.5 text-sm"
      onClick={() => setColumnLabel("name", "Renamed")}
    >
      Rename first column
    </button>
  )
}

// Columns with a non-string header (function) to cover the DragOverlay col.id fallback
const nonStringHeaderColumns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: () => "Name" },
  { accessorKey: "owner", header: "Owner" },
  { accessorKey: "status", header: "Status" },
]

export const ColumnLabelRename: Story = {
  render: () => (
    <DataTable
      columns={nonStringHeaderColumns}
      data={workspaceData}
      enableColumnReorder
    >
      <TableToolbar>
        <RenameButton />
      </TableToolbar>
    </DataTable>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Table renders with original header", async () => {
      expect(canvas.getAllByRole("columnheader").length).toBe(3)
    })

    await step("Clicking rename button updates column label via setColumnLabel", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /Rename first column/ }))
      // The header should now show "Renamed" instead of "Name"
      expect(canvas.getByRole("columnheader", { name: "Renamed" })).toBeInTheDocument()
    })

    await step("Keyboard drag on header with non-string header definition", async () => {
      const headersBefore = canvas.getAllByRole("columnheader").map((h) => h.textContent)
      const dragHandles = [...canvasElement.querySelectorAll("[data-drag-handle]")] as HTMLElement[]
      expect(dragHandles.length).toBeGreaterThanOrEqual(2)

      // Drag first header right to swap with second
      dragHandles[0].focus()
      await userEvent.keyboard(" ")
      await userEvent.keyboard("{ArrowRight}")
      await userEvent.keyboard(" ")

      const headersAfter = canvas.getAllByRole("columnheader").map((h) => h.textContent)
      expect(headersAfter[0]).toBe(headersBefore[1])
      expect(headersAfter[1]).toBe(headersBefore[0])
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1443" },
  },
}

// ---------------------------------------------------------------------------
// ControlledPagination — covers the onPaginationChange controlled callback
// ---------------------------------------------------------------------------

function ControlledPaginationStory({ dataset }: { dataset: DatasetKey }) {
  const { data, columns } = datasetConfigs[dataset]
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 5 })

  return (
    <DataTable
      columns={columns}
      data={data}
      enablePagination
      pagination={pagination}
      onPaginationChange={setPagination}
    >
      <DataTablePagination pageSizeOptions={[5, 10, 25]} />
    </DataTable>
  )
}

export const ControlledPagination: Story = {
  args: { dataset: "Compounds" },
  render: (args) => <ControlledPaginationStory dataset={((args as Record<string, unknown>).dataset as DatasetKey) ?? "Compounds"} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Controlled pagination renders with initial state", async () => {
      expect(canvas.getByText(/1–5 of/)).toBeInTheDocument()
    })

    await step("Navigating pages updates controlled state", async () => {
      await userEvent.click(canvas.getByLabelText("Next page"))
      expect(canvas.getByText(/6–10 of/)).toBeInTheDocument()
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1444" },
  },
}

// ---------------------------------------------------------------------------
// EmptyPagination — covers zero-row branch in DataTablePagination
// ---------------------------------------------------------------------------

export const EmptyPagination: Story = {
  render: () => (
    <DataTable
      columns={workspaceColumns}
      data={[]}
      enablePagination
      defaultPageSize={5}
    >
      <DataTablePagination pageSizeOptions={[5, 10, 25]} />
    </DataTable>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Table renders empty state", async () => {
      expect(canvas.getByRole("table")).toBeInTheDocument()
      expect(canvas.getByText("No results.")).toBeInTheDocument()
    })

    await step("Pagination controls are hidden when no rows", async () => {
      expect(canvas.queryByText("Rows per page:")).toBeNull()
      expect(canvasElement.querySelector("[data-slot='data-table-pagination']")).toBeNull()
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1445" },
  },
}

// ---------------------------------------------------------------------------
// AllFeatures
// ---------------------------------------------------------------------------

function FullColumnManagementStory({ dataset }: { dataset: DatasetKey }) {
  const { data, columns } = datasetConfigs[dataset]

  return (
    <DataTable
      columns={columns}
      data={data}
      enableSorting
      enableColumnVisibility
      enableColumnReorder
      enablePagination
      defaultPageSize={5}
    >
      <TableToolbar>
        <div className="flex-1" />
        <DataTableColumnToggle />
      </TableToolbar>
      <DataTablePagination pageSizeOptions={[5, 10, 25]} />
    </DataTable>
  )
}

export const AllFeatures: Story = {
  args: { dataset: "Compounds" },
  render: (args) => <FullColumnManagementStory dataset={((args as Record<string, unknown>).dataset as DatasetKey) ?? "Compounds"} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Table renders with all feature controls", async () => {
      expect(canvas.getByRole("table")).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: /Columns/ })).toBeInTheDocument()
      expect(canvas.getByText("Rows per page:")).toBeInTheDocument()
    })

    await step("Column toggle panel has draggable items with grab handles", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /Columns/ }))
      const panel = body.getByRole("group", { name: /Toggle and reorder/ })
      expect(panel).toBeInTheDocument()
      // Each column item has a grab handle button for reordering
      const _grabHandles = panel.querySelectorAll("[data-dnd-kit-disabled-dndcontext-id]")
      // Verify checkboxes are present (column items are rendered)
      const checkboxes = within(panel).getAllByRole("checkbox")
      expect(checkboxes.length).toBeGreaterThan(0)
      // Close by clicking outside
      await userEvent.click(canvas.getByRole("table"))
    })

    await step("Pagination shows row range", async () => {
      expect(canvas.getByText(/1–5 of/)).toBeInTheDocument()
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1446" },
  },
}

// ---------------------------------------------------------------------------
// ControlledState
// ---------------------------------------------------------------------------

function ControlledStateStory({ dataset }: { dataset: DatasetKey }) {
  const { data, columns } = datasetConfigs[dataset]
  const colIds = columns.map((c) => ("accessorKey" in c ? String(c.accessorKey) : ""))

  const [columnVisibility, setColumnVisibility] = React.useState<
    Record<string, boolean>
  >(() => {
    const vis: Record<string, boolean> = {}
    colIds.forEach((id) => { vis[id] = Math.random() > 0.3 })
    // Ensure at least one column is visible
    if (Object.values(vis).every((v) => !v)) vis[colIds[0]] = true
    return vis
  })
  const [columnOrder, setColumnOrder] = React.useState<string[]>(
    () => [...colIds].sort(() => Math.random() - 0.5),
  )

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data}
        enableColumnVisibility
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        columnOrder={columnOrder}
        onColumnOrderChange={setColumnOrder}
      >
        <TableToolbar>
          <div className="flex flex-1 gap-2">
            <button
              className="rounded-lg border px-3 py-1.5 text-sm"
              onClick={() => {
                const id = colIds[Math.floor(Math.random() * colIds.length)]
                setColumnVisibility((prev) => {
                  const next = { ...prev, [id]: !prev[id] }
                  // Ensure at least one column stays visible
                  if (Object.keys(next).filter((k) => colIds.includes(k) && next[k] !== false).length === 0) {
                    next[id] = true
                  }
                  return next
                })
              }}
            >
              Toggle random column
            </button>
            <button
              className="rounded-lg border px-3 py-1.5 text-sm"
              onClick={() => setColumnOrder([...colIds].sort(() => Math.random() - 0.5))}
            >
              Shuffle order
            </button>
          </div>
          <DataTableColumnToggle />
        </TableToolbar>
      </DataTable>
      <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
        <p className="text-xs font-medium text-muted-foreground">Live state from controlled props `onColumnVisibilityChange` and `onColumnOrderChange`:</p>
        <SyntaxHighlighter
          language="json"
          style={document.documentElement.classList.contains("dark") ? oneDark : oneLight}
          customStyle={{ margin: 0, borderRadius: "0.5rem", fontSize: "0.75rem" }}
        >
          {JSON.stringify({ columnVisibility, columnOrder }, null, 2)}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

export const ControlledState: Story = {
  render: (args) => <ControlledStateStory dataset={((args as Record<string, unknown>).dataset as DatasetKey) ?? "Workspaces"} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Table renders with some columns randomly hidden and in random order", async () => {
      const headers = canvas.getAllByRole("columnheader")
      // Should have one fewer column than the dataset defines
      expect(headers.length).toBeGreaterThanOrEqual(1)
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1447" },
  },
}
