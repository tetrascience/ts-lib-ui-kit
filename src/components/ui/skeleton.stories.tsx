import { expect, within } from "storybook/test"

import { Skeleton } from "./skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof Skeleton>

export const Default: Story = {
  render: () => <Skeleton className="h-8 w-[260px]" />,
  parameters: {
    zephyr: { testCaseId: "SW-T1296" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Skeleton renders", async () => {
      const skeleton = canvas
        .getAllByRole("generic")
        .find((el) => el.getAttribute("data-slot") === "skeleton")
      expect(skeleton).toBeTruthy()
    })

    await step("Skeleton uses pulse placeholder", async () => {
      const el = canvasElement.querySelector('[data-slot="skeleton"]')
      expect(el?.className).toMatch(/shimmer/)
    })
  },
}

export const Text: Story = {
  render: () => (
    <div className="grid w-[320px] gap-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-3/5" />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Text skeleton lines render", async () => {
      const skeletons = canvas
        .getAllByRole("generic")
        .filter((el) => el.getAttribute("data-slot") === "skeleton")
      expect(skeletons).toHaveLength(4)
    })
  },
}

export const ProfileCard: Story = {
  render: () => (
    <div className="flex w-[320px] items-center gap-4 rounded-xl border p-4">
      <Skeleton className="size-12 rounded-full" />
      <div className="grid flex-1 gap-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1297" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Skeleton placeholders render", async () => {
      const slots = canvas
        .getAllByRole("generic")
        .filter((el) => el.getAttribute("data-slot") === "skeleton")
      expect(slots).toHaveLength(3)
    })

    await step("Profile card container", async () => {
      expect(canvasElement.querySelector(".rounded-xl.border")).toBeTruthy()
    })
  },
}

export const TableSkeleton: Story = {
  render: () => {
    const columns = ["Name", "Status", "Created", "Actions"]
    const rows = 5

    return (
      <div className="w-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col}>{col}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }, (_, rowIdx) => (
              <TableRow key={rowIdx}>
                {columns.map((col, colIdx) => (
                  <TableCell key={col}>
                    <Skeleton
                      className={`h-4 ${colIdx === 0 ? "w-32" : colIdx === 3 ? "w-16" : "w-24"}`}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  },
  play: async ({ canvasElement, step }) => {
    await step("Table header renders", async () => {
      const headers = canvasElement.querySelectorAll('[data-slot="table-head"]')
      expect(headers).toHaveLength(4)
    })

    await step("Skeleton cells render in table body", async () => {
      const skeletons = canvasElement.querySelectorAll(
        '[data-slot="table-body"] [data-slot="skeleton"]'
      )
      expect(skeletons).toHaveLength(20)
    })
  },
}
