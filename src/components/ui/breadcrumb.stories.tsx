import { expect, within } from "storybook/test"

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof Breadcrumb> = {
  title: "Components/Breadcrumb",
  component: Breadcrumb,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof Breadcrumb>

export const Default: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">UI Kit</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Storybook</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1198" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Breadcrumb navigation renders", async () => {
      expect(canvas.getByRole("navigation", { name: "breadcrumb" })).toBeInTheDocument()
    })

    await step("Trail links and current page are visible", async () => {
      expect(canvas.getByRole("link", { name: "Workspace" })).toBeInTheDocument()
      expect(canvas.getByRole("link", { name: "UI Kit" })).toBeInTheDocument()
      expect(canvas.getByRole("link", { name: "Storybook" })).toBeInTheDocument()
    })
  },
}

export const Collapsed: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Hover Card</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1199" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Breadcrumb with ellipsis renders", async () => {
      expect(canvas.getByRole("navigation", { name: "breadcrumb" })).toBeInTheDocument()
    })

    await step("Collapsed trail shows links, ellipsis, and current page", async () => {
      expect(canvas.getByRole("link", { name: "Workspace" })).toBeInTheDocument()
      expect(canvas.getByText("More")).toBeInTheDocument()
      expect(canvas.getByRole("link", { name: "Components" })).toBeInTheDocument()
      expect(canvas.getByRole("link", { name: "Hover Card" })).toBeInTheDocument()
    })
  },
}