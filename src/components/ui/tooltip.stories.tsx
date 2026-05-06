import { expect, userEvent, within } from "storybook/test"

import { Button } from "./button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof TooltipContent> = {
  title: "Components/Tooltip",
  component: TooltipContent,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    side: {
      control: { type: "select" },
      options: ["top", "right", "bottom", "left"],
    },
  },
  args: {
    side: "top",
    sideOffset: 8,
  },
}

export default meta

type Story = StoryObj<typeof TooltipContent>

function renderTooltip(args: Story["args"]) {
  return (
    <TooltipProvider>
      <div className="flex h-[180px] w-[260px] items-center justify-center rounded-xl border bg-background">
        <Tooltip open>
          <TooltipTrigger asChild>
            <Button variant="outline">Export status</Button>
          </TooltipTrigger>
          <TooltipContent {...args}>Last synced 3 minutes ago</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}

export const Top: Story = {
  render: renderTooltip,
  parameters: {
    zephyr: { testCaseId: "SW-T1326" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Tooltip trigger renders", async () => {
      expect(canvas.getByRole("button", { name: "Export status" })).toBeInTheDocument()
    })

    await step("Tooltip content is visible in portal", async () => {
      const nodes = body.getAllByText("Last synced 3 minutes ago")
      expect(nodes.length).toBeGreaterThan(0)
      expect(nodes[0]).toBeInTheDocument()
    })
  },
}

export const Right: Story = {
  args: {
    side: "right",
  },
  render: renderTooltip,
  parameters: {
    zephyr: { testCaseId: "SW-T1327" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Tooltip trigger renders", async () => {
      expect(canvas.getByRole("button", { name: "Export status" })).toBeInTheDocument()
    })

    await step("Tooltip content is visible in portal", async () => {
      const nodes = body.getAllByText("Last synced 3 minutes ago")
      expect(nodes.length).toBeGreaterThan(0)
      expect(nodes[0]).toBeInTheDocument()
    })
  },
}

export const Bottom: Story = {
  args: {
    side: "bottom",
  },
  render: renderTooltip,
  parameters: {
    zephyr: { testCaseId: "SW-T1328" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Tooltip trigger renders", async () => {
      expect(canvas.getByRole("button", { name: "Export status" })).toBeInTheDocument()
    })

    await step("Tooltip content is visible in portal", async () => {
      const nodes = body.getAllByText("Last synced 3 minutes ago")
      expect(nodes.length).toBeGreaterThan(0)
      expect(nodes[0]).toBeInTheDocument()
    })
  },
}

export const Left: Story = {
  args: {
    side: "left",
  },
  render: renderTooltip,
  parameters: {
    zephyr: { testCaseId: "SW-T1329" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Tooltip trigger renders", async () => {
      expect(canvas.getByRole("button", { name: "Export status" })).toBeInTheDocument()
    })

    await step("Tooltip content is visible in portal", async () => {
      const nodes = body.getAllByText("Last synced 3 minutes ago")
      expect(nodes.length).toBeGreaterThan(0)
      expect(nodes[0]).toBeInTheDocument()
    })
  },
}

const tableRows = [
  {
    workspace: "Clinical exports",
    owner: "Data Ops",
    lastRun: "3 minutes ago",
    detail: "Last sync completed at 14:32 UTC — 142 rows transferred",
  },
  {
    workspace: "QC dashboard",
    owner: "Analytics",
    lastRun: "2 hours ago",
    detail: "Paused by jcurie@tetrascience.com pending schema review",
  },
  {
    workspace: "Audit trail",
    owner: "Compliance",
    lastRun: "yesterday",
    detail: "Scheduled daily at 03:00 UTC — next run in 11 hours",
  },
]

export const InTableCells: Story = {
  parameters: {
    layout: "padded",
    zephyr: { testCaseId: "SW-T1474" },
    docs: {
      description: {
        story:
          "Regression coverage for SW-1474: tooltips inside table cells must render via portal, " +
          "not as inline text that overlaps adjacent rows.",
      },
    },
  },
  render: () => (
    <TooltipProvider>
      <div className="w-[640px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workspace</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Last run</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableRows.map((row) => (
              <TableRow key={row.workspace}>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="text-left underline decoration-dotted underline-offset-2"
                      >
                        {row.workspace}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{row.detail}</TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>{row.owner}</TableCell>
                <TableCell>{row.lastRun}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)

    await step("Tooltip content is not rendered inline before hover", async () => {
      expect(canvas.queryByText(tableRows[0].detail)).not.toBeInTheDocument()
    })

    await step("Hovering trigger reveals tooltip in portal", async () => {
      const trigger = canvas.getByRole("button", { name: tableRows[0].workspace })
      await userEvent.hover(trigger)
      const nodes = await body.findAllByText(tableRows[0].detail)
      expect(nodes.length).toBeGreaterThan(0)
      expect(nodes.every((node) => !canvasElement.contains(node))).toBe(true)
    })
  },
}
