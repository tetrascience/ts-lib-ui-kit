import { CopyIcon, RefreshCcwIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"
import { useState } from "react"
import { expect, fn, screen, userEvent, within } from "storybook/test"

import {
  Message,
  MessageAction,
  MessageActions,
  MessageBranch,
  MessageBranchContent,
  MessageBranchNext,
  MessageBranchPage,
  MessageBranchPrevious,
  MessageBranchSelector,
  MessageContent,
  MessageResponse,
  MessageToolbar,
} from "./message"

import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  Snippet,
  SnippetCopyButton,
  SnippetInput,
} from "@/components/ui/snippet"


const meta: Meta = {
  title: "AI Elements/Message",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj

const MemoizedResponseHarness = () => {
  const [renderCount, setRenderCount] = useState(0)

  return (
    <div className="w-full max-w-2xl">
      <button type="button" onClick={() => setRenderCount((count) => count + 1)}>
        Re-render parent
      </button>
      <span>Render count: {renderCount}</span>
      <Message from="assistant">
        <MessageContent>
          <MessageResponse isAnimating={false}>Stable memoized response</MessageResponse>
        </MessageContent>
      </Message>
    </div>
  )
}

export const UserMessage: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <Message from="user">
        <MessageContent>
          <MessageResponse>
            How does photosynthesis work? Can you explain it simply?
          </MessageResponse>
        </MessageContent>
      </Message>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("User message renders", async () => {
      await expect(canvas.getByText(/How does photosynthesis/)).toBeInTheDocument()
    })
  },
}

export const AssistantMessage: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <Message from="assistant">
        <MessageContent>
          <MessageResponse>
            {`Photosynthesis is the process plants use to convert sunlight into food.

Here's the simple version:
1. **Light absorbed** — Chlorophyll in leaves captures sunlight
2. **Water split** — Water from roots is broken apart
3. **CO₂ fixed** — Carbon dioxide from air is combined with hydrogen
4. **Sugar made** — Glucose is produced as stored energy
5. **Oxygen released** — As a byproduct, oxygen is released into the air

The overall equation:`}
          </MessageResponse>
          <Snippet code="6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂">
            <SnippetInput />
            <SnippetCopyButton />
          </Snippet>
        </MessageContent>
      </Message>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Assistant message renders", async () => {
      await expect(canvas.getByText(/Photosynthesis is the process/)).toBeInTheDocument()
    })
  },
}

export const WithActions: Story = {
  render: () => (
    <div className="w-full max-w-2xl space-y-1">
      <Message from="assistant">
        <MessageContent>
          <MessageResponse>
            The Eiffel Tower is located in Paris, France, on the Champ de Mars.
          </MessageResponse>
        </MessageContent>
      </Message>
      <MessageActions>
        <MessageAction label="Copy" onClick={() => {}}>
          <CopyIcon className="size-3" />
        </MessageAction>
        <MessageAction label="Retry" onClick={() => {}}>
          <RefreshCcwIcon className="size-3" />
        </MessageAction>
        <MessageAction label="Like" onClick={() => {}}>
          <ThumbsUpIcon className="size-3" />
        </MessageAction>
        <MessageAction label="Dislike" onClick={() => {}}>
          <ThumbsDownIcon className="size-3" />
        </MessageAction>
      </MessageActions>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Message with action buttons renders", async () => {
      await expect(canvas.getByText(/Eiffel Tower/)).toBeInTheDocument()
      await expect(canvas.getByRole("button", { name: "Copy" })).toBeInTheDocument()
    })
  },
}

export const Conversation: Story = {
  render: () => (
    <div className="w-full max-w-2xl space-y-4">
      <Message from="user">
        <MessageContent>
          <MessageResponse>What is the speed of light?</MessageResponse>
        </MessageContent>
      </Message>
      <Message from="assistant">
        <MessageContent>
          <MessageResponse>
            {`The speed of light in a vacuum is approximately **299,792,458 metres per second** (about 186,282 miles per second), often denoted as *c*.

This is a fundamental constant of nature and forms the basis of Einstein's theory of special relativity.`}
          </MessageResponse>
        </MessageContent>
      </Message>
      <Message from="user">
        <MessageContent>
          <MessageResponse>How long does it take light to travel from the Sun to Earth?</MessageResponse>
        </MessageContent>
      </Message>
      <Message from="assistant">
        <MessageContent>
          <MessageResponse>
            Light takes approximately **8 minutes and 20 seconds** to travel from the Sun to Earth — a distance of about 150 million kilometres (93 million miles).
          </MessageResponse>
        </MessageContent>
      </Message>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Full conversation renders", async () => {
      await expect(canvas.getAllByText(/speed of light/i).length).toBeGreaterThan(0)
      await expect(canvas.getByText(/8 minutes and 20 seconds/)).toBeInTheDocument()
    })
  },
}

export const WithBranching: Story = {
  render: () => (
    <div className="w-full max-w-2xl space-y-1">
      <MessageBranch defaultBranch={1}>
        <MessageBranchContent>
          <Message from="assistant" key="branch-1">
            <MessageContent>
              <MessageResponse>
                Recursion is when a function calls itself to solve a smaller
                piece of the problem, building up the answer as the call stack
                unwinds.
              </MessageResponse>
            </MessageContent>
          </Message>
          <Message from="assistant" key="branch-2">
            <MessageContent>
              <MessageResponse>
                Here is one way to explain recursion: a function that calls itself with a smaller version of the problem.
              </MessageResponse>
            </MessageContent>
          </Message>
          <Message from="assistant" key="branch-3">
            <MessageContent>
              <MessageResponse>
                Think of recursion like nesting dolls — each doll contains a
                smaller version of itself until you reach the smallest one.
              </MessageResponse>
            </MessageContent>
          </Message>
        </MessageBranchContent>
        <MessageToolbar>
          <MessageBranchSelector>
            <MessageBranchPrevious />
            <MessageBranchPage />
            <MessageBranchNext />
          </MessageBranchSelector>
        </MessageToolbar>
      </MessageBranch>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Branched message with navigation renders", async () => {
      await expect(canvas.getAllByText(/recursion/).length).toBeGreaterThan(0)
      await expect(canvas.getByText(/2 of 3/)).toBeInTheDocument()
    })
  },
}

export const TooltipAndBranchNavigation: Story = {
  args: {
    onAction: fn(),
    onBranchChange: fn(),
  },
  render: (args) => (
    <div className="w-full max-w-2xl space-y-3">
      <MessageActions>
        <MessageAction
          onClick={args.onAction as () => void}
          tooltip="Copy response"
        >
          <CopyIcon className="size-3" />
        </MessageAction>
      </MessageActions>
      <MessageBranch onBranchChange={args.onBranchChange as (index: number) => void}>
        <MessageBranchContent>
          <Message from="assistant" key="branch-a">
            <MessageContent>
              <MessageResponse>Branch A response</MessageResponse>
            </MessageContent>
          </Message>
          <Message from="assistant" key="branch-b">
            <MessageContent>
              <MessageResponse>Branch B response</MessageResponse>
            </MessageContent>
          </Message>
          <Message from="assistant" key="branch-c">
            <MessageContent>
              <MessageResponse>Branch C response</MessageResponse>
            </MessageContent>
          </Message>
        </MessageBranchContent>
        <MessageToolbar>
          <MessageBranchSelector>
            <MessageBranchPrevious />
            <MessageBranchPage />
            <MessageBranchNext />
          </MessageBranchSelector>
        </MessageToolbar>
      </MessageBranch>
    </div>
  ),
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Tooltip-only action exposes an accessible label", async () => {
      const action = canvas.getByRole("button", { name: "Copy response" })
      await userEvent.hover(action)
      await expect((await screen.findAllByText("Copy response")).length).toBeGreaterThan(1)
      await userEvent.click(action)
      await expect(args.onAction).toHaveBeenCalledOnce()
    })

    await step("Branch controls move forward and wrap around", async () => {
      await expect(canvas.getByText("1 of 3")).toBeInTheDocument()
      await userEvent.click(canvas.getByRole("button", { name: "Previous branch" }))
      await expect(canvas.getByText("3 of 3")).toBeInTheDocument()
      await expect(args.onBranchChange).toHaveBeenCalledWith(2)
      await userEvent.click(canvas.getByRole("button", { name: "Next branch" }))
      await expect(canvas.getByText("1 of 3")).toBeInTheDocument()
      await expect(args.onBranchChange).toHaveBeenCalledWith(0)
      await userEvent.click(canvas.getByRole("button", { name: "Next branch" }))
      await expect(canvas.getByText("2 of 3")).toBeInTheDocument()
      await expect(args.onBranchChange).toHaveBeenCalledWith(1)
    })
  },
}

export const SingleBranchControls: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <MessageBranch>
        <MessageBranchContent>
          <Message from="assistant" key="only-branch">
            <MessageContent>
              <MessageResponse>Only branch response</MessageResponse>
            </MessageContent>
          </Message>
        </MessageBranchContent>
        <MessageToolbar>
          <MessageBranchPrevious>Previous</MessageBranchPrevious>
          <MessageBranchPage />
          <MessageBranchNext>Next</MessageBranchNext>
          <MessageBranchSelector>Hidden selector</MessageBranchSelector>
        </MessageToolbar>
      </MessageBranch>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Single branch renders disabled controls and hides selector", async () => {
      await expect(canvas.getByText("Only branch response")).toBeInTheDocument()
      await expect(canvas.getByText("1 of 1")).toBeInTheDocument()
      await expect(canvas.getByRole("button", { name: "Previous branch" })).toBeDisabled()
      await expect(canvas.getByRole("button", { name: "Next branch" })).toBeDisabled()
      await expect(canvas.queryByText("Hidden selector")).not.toBeInTheDocument()
    })
  },
}

export const MemoizedResponse: Story = {
  render: () => <MemoizedResponseHarness />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("MessageResponse skips unnecessary re-render work", async () => {
      await expect(canvas.getByText("Stable memoized response")).toBeInTheDocument()
      await userEvent.click(canvas.getByRole("button", { name: "Re-render parent" }))
      await expect(canvas.getByText("Render count: 1")).toBeInTheDocument()
      await expect(canvas.getByText("Stable memoized response")).toBeInTheDocument()
    })
  },
}
