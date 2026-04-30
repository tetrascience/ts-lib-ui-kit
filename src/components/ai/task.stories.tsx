import { useState } from "react"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger } from "./task"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta = {
  title: "AI Elements/Task",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj

const expectCollapsedChevronConfiguredForHoverReveal = async (
  trigger: HTMLElement
) => {
  const chevron = trigger.querySelector<SVGElement>(
    '[data-slot="collapsible-chevron"]'
  )

  if (!chevron) {
    throw new Error("Expected collapsible chevron to render")
  }

  await expect(chevron).toHaveClass("opacity-0")
  await expect(chevron).toHaveClass("group-hover:opacity-100")
}

const StreamingTaskDemo = () => {
  const [isStreaming, setIsStreaming] = useState(true)

  return (
    <div className="w-full max-w-lg space-y-2">
      <button type="button" onClick={() => setIsStreaming(false)}>
        Finish task
      </button>
      <Task defaultOpen isStreaming={isStreaming}>
        <TaskTrigger title="Search knowledge base" />
        <TaskContent>
          <TaskItem>Reading indexed results</TaskItem>
        </TaskContent>
      </Task>
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-lg space-y-2">
      <Task defaultOpen>
        <TaskTrigger title="Set up project structure" />
        <TaskContent>
          <TaskItem>Create src/ directory layout</TaskItem>
          <TaskItem>Initialize package.json with dependencies</TaskItem>
          <TaskItem>Configure TypeScript and ESLint</TaskItem>
        </TaskContent>
      </Task>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Task renders with title and items", async () => {
      await expect(canvas.getByText("Set up project structure")).toBeInTheDocument()
      await expect(canvas.getByText("Create src/ directory layout")).toBeInTheDocument()
    })
  },
}

export const MultipleTasks: Story = {
  render: () => (
    <div className="w-full max-w-lg space-y-2">
      <Task defaultOpen>
        <TaskTrigger title="Initialize repository" />
        <TaskContent>
          <TaskItem>Run git init</TaskItem>
          <TaskItem>Create .gitignore</TaskItem>
          <TaskItem>Add initial README.md</TaskItem>
        </TaskContent>
      </Task>
      <Task defaultOpen>
        <TaskTrigger title="Install dependencies" />
        <TaskContent>
          <TaskItem>Install React and TypeScript</TaskItem>
          <TaskItem>Install Vite build tool</TaskItem>
          <TaskItem>Install testing libraries</TaskItem>
        </TaskContent>
      </Task>
      <Task>
        <TaskTrigger title="Configure CI/CD" />
        <TaskContent>
          <TaskItem>Set up GitHub Actions workflow</TaskItem>
          <TaskItem>Configure deployment pipeline</TaskItem>
        </TaskContent>
      </Task>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Multiple tasks render", async () => {
      await expect(canvas.getByText("Initialize repository")).toBeInTheDocument()
      await expect(canvas.getByText("Install dependencies")).toBeInTheDocument()
      await expect(canvas.getByText("Configure CI/CD")).toBeInTheDocument()
    })
  },
}

export const WithFileReferences: Story = {
  render: () => (
    <div className="w-full max-w-lg">
      <Task defaultOpen>
        <TaskTrigger title="Create component files" />
        <TaskContent>
          <TaskItem>
            Creating{" "}
            <TaskItemFile>
              <span className="text-blue-500">Button.tsx</span>
            </TaskItemFile>
          </TaskItem>
          <TaskItem>
            Updating{" "}
            <TaskItemFile>
              <span className="text-green-600">index.ts</span>
            </TaskItemFile>
          </TaskItem>
          <TaskItem>
            Writing tests in{" "}
            <TaskItemFile>
              <span className="text-yellow-600">Button.test.tsx</span>
            </TaskItemFile>
          </TaskItem>
        </TaskContent>
      </Task>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Task with file references renders", async () => {
      await expect(canvas.getByText("Button.tsx")).toBeInTheDocument()
      await expect(canvas.getByText("index.ts")).toBeInTheDocument()
    })
  },
}

export const Collapsed: Story = {
  render: () => (
    <div className="w-full max-w-lg space-y-2">
      <Task defaultOpen={false}>
        <TaskTrigger title="Completed: Scaffold project" />
        <TaskContent>
          <TaskItem>Created all files</TaskItem>
        </TaskContent>
      </Task>
      <Task defaultOpen>
        <TaskTrigger title="In progress: Implement features" />
        <TaskContent>
          <TaskItem>Building authentication flow</TaskItem>
          <TaskItem>Setting up routing</TaskItem>
        </TaskContent>
      </Task>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Collapsed task shows only title", async () => {
      await expect(canvas.getByText("Completed: Scaffold project")).toBeInTheDocument()
      await expect(canvas.getByText("Building authentication flow")).toBeInTheDocument()
    })
    await step("Collapsed chevron appears on hover", async () => {
      const trigger = canvas
        .getByText("Completed: Scaffold project")
        .closest("[aria-expanded]")

      if (!trigger) {
        throw new Error("Expected task trigger to render")
      }

      await expectCollapsedChevronConfiguredForHoverReveal(trigger as HTMLElement)
    })
  },
}

export const StreamingAutoClose: Story = {
  render: () => <StreamingTaskDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const taskTrigger = canvas.getByText("Search knowledge base").closest("[aria-expanded]")

    if (!taskTrigger) {
      throw new Error("Expected task trigger to render")
    }

    await step("Streaming task starts open", async () => {
      await expect(taskTrigger).toHaveAttribute("aria-expanded", "true")
      await expect(canvas.getByText("Reading indexed results")).toBeInTheDocument()
    })

    await step("Stopping streaming auto-closes the task", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Finish task" }))
      await waitFor(() => expect(taskTrigger).toHaveAttribute("aria-expanded", "false"), {
        timeout: 1800,
      })
    })
  },
}
