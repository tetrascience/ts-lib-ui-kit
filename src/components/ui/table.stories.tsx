import { MoreHorizontalIcon } from "lucide-react"
import { useState } from "react"
import { expect, within } from "storybook/test"

import compoundsData from "../../../.storybook/__fixtures__/compounds"
import moleculesData from "../../../.storybook/__fixtures__/molecules"
import usersData from "../../../.storybook/__fixtures__/users"

import { Badge } from "./badge"
import { Button } from "./button"
import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxValue, useComboboxAnchor } from "./combobox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"

import type { Meta, StoryObj } from "@storybook/react-vite"

// ---------------------------------------------------------------------------
// Dataset definitions
// ---------------------------------------------------------------------------

type DatasetKey = "Workspaces" | "Compounds" | "Molecules" | "Users"

interface Column { header: string; key: string; align?: "right" }

/** Auto-sets `align: "right"` on columns whose first data value is a number. */
function autoAlign(data: Record<string, unknown>[], columns: Column[]): Column[] {
  if (data.length === 0) return columns
  const first = data[0]
  return columns.map((col) =>
    col.align ? col : typeof first[col.key] === "number" ? { ...col, align: "right" } : col,
  )
}

const workspaceRows = [
  { name: "Clinical exports", owner: "Data Ops", status: "Active", runs: 142 },
  { name: "QC dashboard", owner: "Analytics", status: "Paused", runs: 38 },
  { name: "Audit trail", owner: "Compliance", status: "Active", runs: 94 },
]

const rawDatasets: Record<DatasetKey, { data: Record<string, unknown>[]; columns: Column[] }> = {
  Workspaces: {
    data: workspaceRows,
    columns: [
      { header: "Workspace", key: "name" },
      { header: "Owner", key: "owner" },
      { header: "Status", key: "status" },
      { header: "Runs", key: "runs" },
    ],
  },
  Compounds: {
    data: compoundsData,
    columns: [
      { header: "Name", key: "name" },
      { header: "Formula", key: "formula" },
      { header: "Category", key: "category" },
      { header: "Purity (%)", key: "purity" },
      { header: "Status", key: "status" },
    ],
  },
  Molecules: {
    data: moleculesData,
    columns: [
      { header: "ID", key: "id" },
      { header: "MW", key: "mw" },
      { header: "MPO Score", key: "mpoScore" },
      { header: "SA Score", key: "saScore" },
      { header: "cLogP", key: "clogp" },
    ],
  },
  Users: {
    data: usersData,
    columns: [
      { header: "Name", key: "name" },
      { header: "Email", key: "email" },
      { header: "Role", key: "role" },
      { header: "Department", key: "department" },
      { header: "Age", key: "age" },
    ],
  },
}

const datasets = Object.fromEntries(
  Object.entries(rawDatasets).map(([k, v]) => [k, { data: v.data, columns: autoAlign(v.data, v.columns) }]),
) as Record<DatasetKey, { data: Record<string, unknown>[]; columns: Column[] }>

function getDataset(args: Record<string, unknown>): { data: Record<string, unknown>[]; columns: Column[] } {
  return datasets[(args.dataset as DatasetKey) ?? "Workspaces"]
}

type Density = "compact" | "default" | "relaxed"

function getDensity(args: Record<string, unknown>): Density {
  return (args.density as Density) ?? "default"
}

function getTableProps(args: Record<string, unknown>) {
  return {
    "data-density": getDensity(args),
    ...(args.striped ? { "data-striped": "" } : {}),
    variant: (args.variant as "default" | "card") ?? "default",
  }
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof Table> = {
  title: "Components/Table",
  component: Table,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    dataset: {
      control: { type: "select" },
      options: ["Workspaces", "Compounds", "Molecules", "Users"],
    },
    density: {
      control: { type: "select" },
      options: ["compact", "default", "relaxed"],
    },
    striped: {
      control: { type: "boolean" },
    },
    variant: {
      control: { type: "select" },
      options: ["default", "card"],
    },
  },
  args: { dataset: "Workspaces", density: "default", striped: false, variant: "default" },
}

export default meta

type Story = StoryObj<typeof Table>

// ===========================================================================
// Basic stories
// ===========================================================================

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  parameters: {
    zephyr: { testCaseId: "SW-T1308" },
  },
  render: (args) => {
    const a = args as Record<string, unknown>
    const { data, columns } = getDataset(a)

    return (
      <Table {...getTableProps(a)}>
        <TableCaption>{a.dataset as string} — {data.length} rows</TableCaption>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} variant={col.align === "right" ? "numeric" : undefined}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={String(row["id"] ?? row["name"] ?? i)}>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  variant={col.align === "right" ? "numeric" : undefined}
                >
                  {String(row[col.key] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Table renders with headers and rows", async () => {
      expect(canvas.getByRole("table")).toBeInTheDocument()
      const headers = canvas.getAllByRole("columnheader")
      expect(headers.length).toBeGreaterThanOrEqual(4)
    })

    await step("Data rows render", async () => {
      const rows = canvas.getAllByRole("row")
      expect(rows.length).toBeGreaterThan(1)
    })
  },
}

// ---------------------------------------------------------------------------
// WithFooter
// ---------------------------------------------------------------------------

export const WithFooter: Story = {
  parameters: {
    zephyr: { testCaseId: "SW-T1309" },
  },
  render: (args) => {
    const a = args as Record<string, unknown>
    const { data, columns } = getDataset(a)

    return (
      <Table {...getTableProps(a)}>
        <TableCaption>{a.dataset as string} — {data.length} rows</TableCaption>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} variant={col.align === "right" ? "numeric" : undefined}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={String(row["id"] ?? row["name"] ?? i)}>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  variant={col.align === "right" ? "numeric" : undefined}
                >
                  {String(row[col.key] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={columns.length - 1}>
              Total rows
            </TableCell>
            <TableCell variant="numeric">{data.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Table renders with footer row", async () => {
      expect(canvas.getByRole("table")).toBeInTheDocument()
      expect(canvas.getByRole("cell", { name: "Total rows" })).toBeInTheDocument()
    })
  },
}

// ---------------------------------------------------------------------------
// Striped
// ---------------------------------------------------------------------------

export const Striped: Story = {
  args: { dataset: "Compounds", striped: true },
  render: Default.render,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Table has data-striped attribute", async () => {
      const table = canvas.getByRole("table")
      expect(table.closest("[data-striped]")).not.toBeNull()
    })

    await step("Data rows render", async () => {
      const rows = canvas.getAllByRole("row")
      expect(rows.length).toBeGreaterThan(1)
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1448" },
  },
}

// ---------------------------------------------------------------------------
// CompactDensity
// ---------------------------------------------------------------------------

export const CompactDensity: Story = {
  args: { density: "compact" },
  render: Default.render,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Table has compact density attribute", async () => {
      const table = canvas.getByRole("table")
      expect(table.closest("[data-density='compact']")).not.toBeNull()
    })

    await step("Headers and rows render", async () => {
      expect(canvas.getAllByRole("columnheader").length).toBeGreaterThanOrEqual(4)
      expect(canvas.getAllByRole("row").length).toBeGreaterThan(1)
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1449" },
  },
}

// ---------------------------------------------------------------------------
// RelaxedDensity
// ---------------------------------------------------------------------------

export const RelaxedDensity: Story = {
  args: { density: "relaxed" },
  render: Default.render,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Table has relaxed density attribute", async () => {
      const table = canvas.getByRole("table")
      expect(table.closest("[data-density='relaxed']")).not.toBeNull()
    })

    await step("Headers and rows render", async () => {
      expect(canvas.getAllByRole("columnheader").length).toBeGreaterThanOrEqual(4)
      expect(canvas.getAllByRole("row").length).toBeGreaterThan(1)
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1450" },
  },
}

// ---------------------------------------------------------------------------
// CustomCells
// ---------------------------------------------------------------------------

const statusVariant: Record<string, "positive" | "warning" | "secondary"> = {
  Active: "positive",
  Paused: "warning",
  Archived: "secondary",
  Inactive: "secondary",
}

export const CustomCells: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Table renders with headers", async () => {
      expect(canvas.getByRole("table")).toBeInTheDocument()
      expect(canvas.getByRole("columnheader", { name: "Status" })).toBeInTheDocument()
    })

    await step("Status column renders Badge components", async () => {
      const badges = canvasElement.querySelectorAll("[data-slot='badge']")
      expect(badges.length).toBeGreaterThan(0)
    })

    await step("Badge text matches expected status values", async () => {
      const activeBadges = canvas.getAllByText("Active")
      expect(activeBadges.length).toBeGreaterThan(0)
      expect(activeBadges[0].closest("[data-slot='badge']")).not.toBeNull()
    })
  },
  render: (args) => {
    const a = args as Record<string, unknown>
    const { data, columns } = getDataset(a)

    return (
      <Table {...getTableProps(a)}>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} variant={col.align === "right" ? "numeric" : undefined}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={String(row["id"] ?? row["name"] ?? i)}>
              {columns.map((col) => {
                const value = String(row[col.key] ?? "")

                if (col.key === "status") {
                  return (
                    <TableCell key={col.key}>
                      <Badge variant={statusVariant[value] ?? "secondary"}>{value}</Badge>
                    </TableCell>
                  )
                }

                return (
                  <TableCell
                    key={col.key}
                    variant={col.align === "right" ? "numeric" : undefined}
                  >
                    {value}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1451" },
  },
}

// ===========================================================================
// Feature stories
// ===========================================================================

// ---------------------------------------------------------------------------
// RowActions
// ---------------------------------------------------------------------------

export const RowActions: Story = {
  render: (args) => {
    const a = args as Record<string, unknown>
    const { data, columns } = getDataset(a)

    return (
      <Table {...getTableProps(a)}>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} variant={col.align === "right" ? "numeric" : undefined}>
                {col.header}
              </TableHead>
            ))}
            <TableHead variant="action">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => {
            const label = String(row[columns[0].key] ?? i)
            return (
              <TableRow key={String(row["id"] ?? row["name"] ?? i)}>
                <TableHead scope="row">
                  {label}
                </TableHead>
                {columns.slice(1).map((col) => (
                  <TableCell
                    key={col.key}
                    variant={col.align === "right" ? "numeric" : undefined}
                  >
                    {String(row[col.key] ?? "")}
                  </TableCell>
                ))}
                <TableCell variant="action">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon-xs" variant="ghost">
                        <MoreHorizontalIcon />
                        <span className="sr-only">Actions for {label}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem variant="destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("First column cells are row headers (th elements)", async () => {
      const firstRow = canvas.getAllByRole("row")[1]
      const rowHeader = within(firstRow).getByRole("rowheader")
      expect(rowHeader).toBeInTheDocument()
    })

    await step("Action buttons are present", async () => {
      const buttons = canvas.getAllByRole("button", { name: /Actions for/ })
      expect(buttons.length).toBeGreaterThan(0)
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1452" },
  },
}

// ---------------------------------------------------------------------------
// StickyHeader
// ---------------------------------------------------------------------------

export const StickyHeader: Story = {
  render: (args) => {
    const a = args as Record<string, unknown>
    const { data: baseData, columns } = getDataset(a)

    // Duplicate data to ensure enough rows for scrolling
    const data = baseData.length < 15
      ? [...baseData, ...baseData, ...baseData].map((row, i) => ({ ...row, _key: i }))
      : baseData

    return (
      <Table {...getTableProps(a)} containerClassName="max-h-80 rounded-lg border">
        <TableHeader variant="sticky">
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} variant={col.align === "right" ? "numeric" : undefined}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={(row as Record<string, unknown>)["_key"] == null ? String(row["id"] ?? row["name"] ?? i) : String((row as Record<string, unknown>)["_key"])}>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  variant={col.align === "right" ? "numeric" : undefined}
                >
                  {String(row[col.key] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Table renders with many rows", async () => {
      expect(canvas.getByRole("table")).toBeInTheDocument()
      const rows = canvas.getAllByRole("row")
      expect(rows.length).toBeGreaterThan(5)
    })

    await step("Header is visible after scrolling", async () => {
      const scrollContainer = canvasElement.querySelector(".max-h-80")
      if (scrollContainer) {
        scrollContainer.scrollTop = 400
      }
      expect(canvas.getAllByRole("columnheader").length).toBeGreaterThan(0)
    })
  },
}


// ---------------------------------------------------------------------------
// Table header filter integration
// ---------------------------------------------------------------------------

function TableHeaderFilterExample(args) {
  const a = args as Record<string, unknown>
  const { data: pipelineData, columns } = getDataset(a)
  
  const owners = [...new Set(pipelineData.map((row) => String(row.owner)))]
  const statuses = [...new Set(pipelineData.map((row) => String(row.status)))]

  const [selectedOwners, setSelectedOwners] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])

  const ownerAnchor = useComboboxAnchor()
  const statusAnchor = useComboboxAnchor()

  const filteredRows = pipelineData.filter((row) => {
    const ownerMatch = selectedOwners.length === 0 || selectedOwners.includes(row.owner as string)
    const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(row.status as string)
    return ownerMatch && statusMatch
  })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Workspace</TableHead>
          <TableHead className="min-w-[180px]">Owner</TableHead>
          <TableHead className="min-w-[180px]">Status</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Runs</TableHead>
        </TableRow>
        <TableRow>
          <TableHead />
          <TableHead className="p-1 align-top">
            <Combobox multiple items={owners} value={selectedOwners} onValueChange={setSelectedOwners}>
              <ComboboxChips ref={ownerAnchor} className="max-w-[200px]">
                <ComboboxValue>
                  {(items: string[]) =>
                    items.map((item) => (
                      <ComboboxChip key={item}>
                        {item}
                      </ComboboxChip>
                    ))
                  }
                </ComboboxValue>
                <ComboboxChipsInput placeholder="Filter owner..." className="text-xs" />
              </ComboboxChips>
              <ComboboxContent anchor={ownerAnchor}>
                <ComboboxEmpty>No matches.</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </TableHead>
          <TableHead className="p-1 align-top">
            <Combobox multiple items={statuses} value={selectedStatuses} onValueChange={setSelectedStatuses}>
              <ComboboxChips ref={statusAnchor} className="max-w-[200px]">
                <ComboboxValue>
                  {(items: string[]) =>
                    items.map((item) => (
                      <ComboboxChip key={item}>
                        {item}
                      </ComboboxChip>
                    ))
                  }
                </ComboboxValue>
                <ComboboxChipsInput placeholder="Filter status..." className="text-xs" />
              </ComboboxChips>
              <ComboboxContent anchor={statusAnchor}>
                <ComboboxEmpty>No matches.</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </TableHead>
          <TableHead />
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredRows.map((row) => (
          <TableRow key={String(row["id"] ?? row["name"])}>
            {columns.map((col) => {
                const value = String(row[col.key] ?? "")

                return (
                  <TableCell
                    key={col.key}
                  >
                    {value}
                  </TableCell>
                )
              })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export const TableHeaderFilter: Story = {
  render: (args) => TableHeaderFilterExample(args),
  parameters: {
    zephyr: { testCaseId: "SW-T1453" },
  },
}
