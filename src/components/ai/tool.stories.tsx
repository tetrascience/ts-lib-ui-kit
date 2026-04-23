import { expect, within } from "storybook/test"

import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "./tool"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta = {
  title: "AI Elements/Tool",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj

export const InputStreaming: Story = {
  render: () => (
    <div className="w-full max-w-lg">
      <Tool defaultOpen>
        <ToolHeader type="tool-get_weather" state="input-streaming" />
        <ToolContent>
          <ToolInput input={{ location: "San Francisco" }} />
        </ToolContent>
      </Tool>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Tool with streaming input renders", async () => {
      await expect(canvas.getByText(/get_weather/i)).toBeInTheDocument()
    })
  },
}

export const InputAvailable: Story = {
  render: () => (
    <div className="w-full max-w-lg">
      <Tool defaultOpen>
        <ToolHeader type="tool-search_web" state="input-available" />
        <ToolContent>
          <ToolInput input={{ query: "TypeScript best practices 2025", maxResults: 10 }} />
        </ToolContent>
      </Tool>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Tool with available input renders", async () => {
      await expect(canvas.getByText(/search_web/i)).toBeInTheDocument()
    })
  },
}

export const OutputAvailable: Story = {
  render: () => (
    <div className="w-full max-w-lg">
      <Tool defaultOpen>
        <ToolHeader type="tool-get_weather" state="output-available" />
        <ToolContent>
          <ToolInput input={{ location: "San Francisco, CA" }} />
          <ToolOutput
            output={{
              temperature: 68,
              unit: "fahrenheit",
              condition: "Partly cloudy",
              humidity: 72,
            }}
          />
        </ToolContent>
      </Tool>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Tool with output renders", async () => {
      await expect(canvas.getByText(/get_weather/i)).toBeInTheDocument()
    })
  },
}

export const OutputError: Story = {
  render: () => (
    <div className="w-full max-w-lg">
      <Tool defaultOpen>
        <ToolHeader type="tool-read_file" state="output-error" />
        <ToolContent>
          <ToolInput input={{ path: "/etc/shadow" }} />
          <ToolOutput output="Error: Permission denied — cannot read /etc/shadow" />
        </ToolContent>
      </Tool>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Tool with error output renders", async () => {
      await expect(canvas.getByText(/read_file/i)).toBeInTheDocument()
    })
  },
}

export const CustomTitle: Story = {
  render: () => (
    <div className="w-full max-w-lg space-y-2">
      <Tool defaultOpen>
        <ToolHeader
          type="tool-execute_code"
          state="output-available"
          title="Run Python Script"
        />
        <ToolContent>
          <ToolInput input={{ code: "print('Hello, world!')", language: "python" }} />
          <ToolOutput output={{ stdout: "Hello, world!\n", exitCode: 0 }} />
        </ToolContent>
      </Tool>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Custom title tool renders", async () => {
      await expect(canvas.getByText("Run Python Script")).toBeInTheDocument()
    })
  },
}
