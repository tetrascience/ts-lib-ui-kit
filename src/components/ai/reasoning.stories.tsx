import { useState } from "react"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { Reasoning, ReasoningContent, ReasoningTrigger } from "./reasoning"

import type { Meta, StoryObj } from "@storybook/react-vite"


const shortReasoning = `The user is asking about the capital of France.
This is a straightforward factual question. The answer is Paris.`

const longReasoning = `Let me think step by step about this problem.

First, I need to understand what the user is asking. They want to know how to implement a binary search tree in TypeScript.

A binary search tree has these properties:
1. Each node has at most two children (left and right)
2. All nodes in the left subtree have values less than the parent
3. All nodes in the right subtree have values greater than the parent

I'll define a Node interface, then a BinarySearchTree class with insert, search, and delete methods.

The time complexity for balanced BST operations is O(log n), but can degrade to O(n) for unbalanced trees.

I should also consider edge cases: empty tree, single node, duplicate values.`

const meta: Meta = {
  title: "AI Elements/Reasoning",
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

const ReasoningLifecycleDemo = () => {
  const [isStreaming, setIsStreaming] = useState(false)

  return (
    <div className="w-full max-w-2xl space-y-3">
      <div className="flex gap-2">
        <button type="button" onClick={() => setIsStreaming(true)}>
          Start reasoning
        </button>
        <button type="button" onClick={() => setIsStreaming(false)}>
          Finish reasoning
        </button>
      </div>
      <Reasoning isStreaming={isStreaming}>
        <ReasoningTrigger />
        <ReasoningContent>Auto opened reasoning content</ReasoningContent>
      </Reasoning>
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <Reasoning defaultOpen>
        <ReasoningTrigger />
        <ReasoningContent>{shortReasoning}</ReasoningContent>
      </Reasoning>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Reasoning trigger renders", async () => {
      await expect(canvas.getByRole("button")).toBeInTheDocument()
    })
  },
}

export const WithDuration: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <Reasoning defaultOpen duration={4.2}>
        <ReasoningTrigger />
        <ReasoningContent>{longReasoning}</ReasoningContent>
      </Reasoning>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Reasoning with duration renders", async () => {
      await expect(canvas.getByText(/4\.2 seconds/)).toBeInTheDocument()
    })
  },
}

export const Streaming: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <Reasoning isStreaming defaultOpen>
        <ReasoningTrigger />
        <ReasoningContent>
          {`Let me think through this carefully...\n\nThe user wants to know about`}
        </ReasoningContent>
      </Reasoning>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Streaming state shows thinking indicator", async () => {
      await expect(canvas.getByRole("button")).toBeInTheDocument()
    })
  },
}

export const Collapsed: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <Reasoning defaultOpen={false} duration={2.1}>
        <ReasoningTrigger />
        <ReasoningContent>{longReasoning}</ReasoningContent>
      </Reasoning>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Collapsed reasoning shows trigger only", async () => {
      await expect(canvas.getByRole("button")).toBeInTheDocument()
    })
    await step("Collapsed chevron appears on hover", async () => {
      await expectCollapsedChevronConfiguredForHoverReveal(canvas.getByRole("button"))
    })
  },
}

export const StreamingLifecycle: Story = {
  render: () => <ReasoningLifecycleDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const reasoningTrigger = canvas.getByRole("button", {
      name: /thought for a few seconds/i,
    })

    await step("Streaming start auto-opens reasoning", async () => {
      await expect(reasoningTrigger).toHaveAttribute("aria-expanded", "false")
      await userEvent.click(canvas.getByRole("button", { name: "Start reasoning" }))
      await waitFor(() => expect(reasoningTrigger).toHaveAttribute("aria-expanded", "true"))
      await expect(canvas.getByText("Auto opened reasoning content")).toBeInTheDocument()
    })

    await step("Streaming finish records duration and auto-closes", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Finish reasoning" }))
      await waitFor(() => expect(reasoningTrigger).toHaveTextContent(/Thought for \d+ seconds/), {
        timeout: 1500,
      })
      await waitFor(() => expect(reasoningTrigger).toHaveAttribute("aria-expanded", "false"), {
        timeout: 1800,
      })
    })
  },
}
