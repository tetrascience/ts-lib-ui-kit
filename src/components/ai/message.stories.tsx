import { CopyIcon, RefreshCcwIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"
import { expect, within } from "storybook/test"

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
} from "@/components/ai-elements/snippet"


const meta: Meta = {
  title: "AI Elements/Message",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj

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
      await expect(canvas.getByText(/speed of light/)).toBeInTheDocument()
      await expect(canvas.getByText(/8 minutes and 20 seconds/)).toBeInTheDocument()
    })
  },
}

export const WithBranching: Story = {
  render: () => (
    <div className="w-full max-w-2xl space-y-1">
      <MessageBranch branches={["branch-1", "branch-2", "branch-3"]} currentIndex={1}>
        <MessageBranchContent>
          <Message from="assistant">
            <MessageContent>
              <MessageResponse>
                Here is one way to explain recursion: a function that calls itself with a smaller version of the problem.
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
      await expect(canvas.getByText(/recursion/)).toBeInTheDocument()
      await expect(canvas.getByText("2 / 3")).toBeInTheDocument()
    })
  },
}
