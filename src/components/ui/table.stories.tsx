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

const rows = [
  { name: "Clinical exports", owner: "Data Ops", status: "Active", runs: 142 },
  { name: "QC dashboard", owner: "Analytics", status: "Paused", runs: 38 },
  { name: "Audit trail", owner: "Compliance", status: "Active", runs: 94 },
] as const

const meta: Meta<typeof Table> = {
  title: "Components/Table",
  component: Table,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof Table>

function renderTable(showFooter = false) {
  return (
    <Table>
        <TableCaption>Recent workspaces and their current execution totals.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Workspace</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Runs</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell>{row.owner}</TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell className="text-right">{row.runs}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        {showFooter && (
          <TableFooter>
            <TableRow>
              <TableCell className="font-medium" colSpan={3}>
                Total runs
              </TableCell>
              <TableCell className="text-right">274</TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
  )
}

export const Default: Story = {
  render: () => renderTable(),
  parameters: {
    zephyr: { testCaseId: "SW-T1308" },
  },
}

export const WithFooter: Story = {
  render: () => renderTable(true),
  parameters: {
    zephyr: { testCaseId: "SW-T1309" },
  },
}