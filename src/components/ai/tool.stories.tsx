import { useState } from "react"
import { expect, userEvent, waitFor, within } from "storybook/test"

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

const StreamingToolDemo = () => {
  const [isStreaming, setIsStreaming] = useState(true)

  return (
    <div className="w-full max-w-lg space-y-2">
      <button type="button" onClick={() => setIsStreaming(false)}>
        Finish tool
      </button>
      <Tool defaultOpen isStreaming={isStreaming}>
        <ToolHeader
          state={isStreaming ? "input-available" : "output-available"}
          type="tool-search_web"
        />
        <ToolContent>
          <ToolInput input={{ query: "lab notebook entries" }} />
          {!isStreaming && <ToolOutput errorText={undefined} output={{ matches: 3 }} />}
        </ToolContent>
      </Tool>
    </div>
  )
}

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

export const StreamingAutoClose: Story = {
  render: () => <StreamingToolDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const toolTrigger = canvas.getByText("search_web").closest("button")

    if (!toolTrigger) {
      throw new Error("Expected tool trigger button to render")
    }

    await step("Streaming tool starts open", async () => {
      await expect(toolTrigger).toHaveAttribute("aria-expanded", "true")
      await expect(canvas.getByText("Running")).toBeInTheDocument()
    })

    await step("Stopping streaming auto-closes the tool", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Finish tool" }))
      await waitFor(() => expect(toolTrigger).toHaveAttribute("aria-expanded", "false"), {
        timeout: 1800,
      })
    })
  },
}

export const OutputEdgeCases: Story = {
  render: () => (
    <div className="w-full max-w-lg space-y-2">
      <Tool defaultOpen>
        <ToolHeader state="approval-requested" toolName="customLookup" type="dynamic-tool" />
        <ToolContent>
          <ToolInput input={{ id: "sample-42" }} />
          <ToolOutput errorText={undefined} output={undefined} />
        </ToolContent>
      </Tool>
      <Tool defaultOpen>
        <ToolHeader state="approval-responded" toolName="customLookup" type="dynamic-tool" />
        <ToolContent>
          <ToolOutput errorText="Denied by policy" output={undefined} />
        </ToolContent>
      </Tool>
      <Tool defaultOpen>
        <ToolHeader state="output-denied" type="tool-delete_file" />
        <ToolContent>
          <ToolOutput errorText={undefined} output={<span>Manual review required</span>} />
        </ToolContent>
      </Tool>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Dynamic tool names and approval states render", async () => {
      await expect(canvas.getAllByText("customLookup")).toHaveLength(2)
      await expect(canvas.getByText("Awaiting Approval")).toBeInTheDocument()
      await expect(canvas.getByText("Responded")).toBeInTheDocument()
    })

    await step("Denied and element outputs render with expected labels", async () => {
      await expect(canvas.getByText("Error")).toBeInTheDocument()
      await expect(canvas.getByText("Denied by policy")).toBeInTheDocument()
      await expect(canvas.getByText("Denied")).toBeInTheDocument()
      await expect(canvas.getByText("Manual review required")).toBeInTheDocument()
    })
  },
}
