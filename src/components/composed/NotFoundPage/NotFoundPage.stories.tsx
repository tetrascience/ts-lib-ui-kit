import { expect, within } from "storybook/test"

import { Button } from "@/components/ui/button"

import { NotFoundPage } from "./NotFoundPage"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof NotFoundPage> = {
  title: "Design Patterns/NotFoundPage",
  component: NotFoundPage,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background">
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof NotFoundPage>

export const NotFound: Story = {
  args: {
    code: 404,
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1505" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Error code renders", async () => {
      expect(canvas.getByText("404")).toBeInTheDocument()
    })

    await step("Title and description render", async () => {
      expect(canvas.getByText("Page not found")).toBeInTheDocument()
      expect(
        canvas.getByText(/The page you're looking for/)
      ).toBeInTheDocument()
    })

    await step("Default action button renders", async () => {
      expect(
        canvas.getByRole("button", { name: "Go to home" })
      ).toBeInTheDocument()
    })
  },
}

export const Forbidden: Story = {
  args: {
    code: 403,
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1506" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("403 code and content render", async () => {
      expect(canvas.getByText("403")).toBeInTheDocument()
      expect(canvas.getByText("Access denied")).toBeInTheDocument()
    })
  },
}

export const ServerError: Story = {
  args: {
    code: 500,
    action: <Button variant="outline">Retry</Button>,
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1507" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("500 code and content render", async () => {
      expect(canvas.getByText("500")).toBeInTheDocument()
      expect(canvas.getByText("Server error")).toBeInTheDocument()
    })

    await step("Custom retry action renders", async () => {
      expect(
        canvas.getByRole("button", { name: "Retry" })
      ).toBeInTheDocument()
    })
  },
}

export const ServiceUnavailable: Story = {
  args: {
    code: 503,
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1508" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("503 code and content render", async () => {
      expect(canvas.getByText("503")).toBeInTheDocument()
      expect(canvas.getByText("Service unavailable")).toBeInTheDocument()
    })
  },
}

export const CustomContent: Story = {
  args: {
    code: 404,
    title: "Experiment not found",
    description:
      "This experiment may have been archived or the link is no longer valid.",
    action: (
      <div className="flex gap-2">
        <Button variant="outline">Back to experiments</Button>
        <Button>Create new experiment</Button>
      </div>
    ),
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1509" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Custom title overrides default", async () => {
      expect(canvas.getByText("Experiment not found")).toBeInTheDocument()
      expect(canvas.queryByText("Page not found")).not.toBeInTheDocument()
    })

    await step("Custom action buttons render", async () => {
      expect(
        canvas.getByRole("button", { name: "Back to experiments" })
      ).toBeInTheDocument()
      expect(
        canvas.getByRole("button", { name: "Create new experiment" })
      ).toBeInTheDocument()
    })
  },
}
