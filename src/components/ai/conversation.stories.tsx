import { MessageSquareIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { expect, userEvent, within } from "storybook/test"


import {
  Conversation,
  ConversationContent,
  ConversationDownload,
  ConversationEmptyState,
  ConversationScrollButton,
  messagesToMarkdown,
} from "./conversation"
import { Message, MessageContent, MessageResponse } from "./message"
import { StreamStatus } from "./stream-status"

import type { Meta, StoryObj } from "@storybook/react-vite"
import type { UIMessage } from "ai"

const meta: Meta = {
  title: "AI Elements/Conversation",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj

export const Empty: Story = {
  render: () => (
    <div className="h-full w-full max-w-2xl">
      <Conversation>
        <ConversationContent>
          <ConversationEmptyState
            icon={<MessageSquareIcon className="size-10" />}
            title="Start a conversation"
            description="Ask anything to get started"
          />
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Empty state renders with title and description", async () => {
      await expect(canvas.getByText("Start a conversation")).toBeInTheDocument()
      await expect(canvas.getByText("Ask anything to get started")).toBeInTheDocument()
    })
  },
}

export const WithMessages: Story = {
  render: () => (
    <div className="h-[400px] w-full max-w-2xl rounded-lg border">
      <Conversation>
        <ConversationContent>
          <Message from="user">
            <MessageContent>
              <MessageResponse>What are the main principles of SOLID?</MessageResponse>
            </MessageContent>
          </Message>
          <Message from="assistant">
            <MessageContent>
              <MessageResponse>
                {`SOLID is an acronym for five design principles:

1. **S**ingle Responsibility — A class should have one reason to change
2. **O**pen/Closed — Open for extension, closed for modification
3. **L**iskov Substitution — Subtypes must be substitutable for their base types
4. **I**nterface Segregation — Many specific interfaces over one general interface
5. **D**ependency Inversion — Depend on abstractions, not concretions`}
              </MessageResponse>
            </MessageContent>
          </Message>
          <Message from="user">
            <MessageContent>
              <MessageResponse>Can you give me an example of the Single Responsibility Principle?</MessageResponse>
            </MessageContent>
          </Message>
          <Message from="assistant">
            <MessageContent>
              <MessageResponse>
                Sure! A classic example: instead of one `User` class that handles data storage, email sending, and PDF generation — split those into `UserRepository`, `EmailService`, and `ReportGenerator`. Each class has exactly one job.
              </MessageResponse>
            </MessageContent>
          </Message>
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Conversation messages render", async () => {
      await expect(canvas.getByText(/SOLID is an acronym/)).toBeInTheDocument()
    })
  },
}

export const StreamingInProgress: Story = {
  name: "Streaming In Progress",
  render: () => {
    const [start] = useState(() => new Date())
    const [tokens, setTokens] = useState(0)
    const [response, setResponse] = useState("")
    const fullResponse =
      "Dependency Inversion means high-level modules should not depend on low-level modules — both should depend on abstractions. For example, instead of a `UserService` importing a concrete `MySQLDatabase`, it depends on a `DatabaseInterface`. You can then swap `MySQLDatabase` for `PostgresDatabase` or a mock without changing `UserService` at all."

    useEffect(() => {
      let i = 0
      const id = setInterval(() => {
        if (i >= fullResponse.length) {
          clearInterval(id)
          return
        }
        i += Math.floor(Math.random() * 6) + 2
        setResponse(fullResponse.slice(0, i))
        setTokens((t) => t + Math.floor(Math.random() * 15) + 5)
      }, 60)
      return () => clearInterval(id)
    }, [])

    const isStreaming = response.length < fullResponse.length

    return (
      <div className="h-[400px] w-full max-w-2xl rounded-lg border">
        <Conversation>
          <ConversationContent>
            <Message from="user">
              <MessageContent>
                <MessageResponse>Can you explain Dependency Inversion?</MessageResponse>
              </MessageContent>
            </Message>
            <Message from="assistant">
              <MessageContent>
                <MessageResponse>{response || "…"}</MessageResponse>
                <StreamStatus
                  className="mt-2"
                  iconVariant="loader-circle"
                  isStreaming={isStreaming}
                  showIndicator
                  startTime={start}
                  state={isStreaming ? "streaming" : "done"}
                  tokenCount={tokens}
                />
              </MessageContent>
            </Message>
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Streaming status renders with elapsed time", async () => {
      await expect(canvas.getByText(/tokens/i)).toBeInTheDocument()
    })
  },
}

const sampleMessages: UIMessage[] = [
  {
    id: "m1",
    role: "user",
    parts: [{ type: "text", text: "Summarise TypeScript generics." }],
  },
  {
    id: "m2",
    role: "assistant",
    parts: [
      { type: "text", text: "Generics let you parameterise types for reuse." },
    ],
  },
]

export const WithDownload: Story = {
  render: () => (
    <div className="relative h-[300px] w-full max-w-2xl rounded-lg border">
      <Conversation>
        <ConversationContent>
          {sampleMessages.map((m) => (
            <Message from={m.role} key={m.id}>
              <MessageContent>
                <MessageResponse>
                  {m.parts.map((p) => (p.type === "text" ? p.text : "")).join("")}
                </MessageResponse>
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
        <ConversationDownload aria-label="Download conversation" messages={sampleMessages} />
      </Conversation>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Clicking download button triggers handler", async () => {
      const button = canvas.getByRole("button", { name: "Download conversation" })
      const originalCreateURL = URL.createObjectURL
      const originalRevokeURL = URL.revokeObjectURL
      URL.createObjectURL = () => "blob:mock"
      URL.revokeObjectURL = () => {}
      await userEvent.click(button)
      URL.createObjectURL = originalCreateURL
      URL.revokeObjectURL = originalRevokeURL
    })
  },
}

export const MarkdownSerialisation: Story = {
  render: () => <div>Exercises messagesToMarkdown utility</div>,
  play: async ({ step }) => {
    await step("Default formatter produces role-prefixed markdown", async () => {
      const md = messagesToMarkdown(sampleMessages)
      await expect(md).toContain("**User:**")
      await expect(md).toContain("**Assistant:**")
    })
    await step("Custom formatter is respected", async () => {
      const md = messagesToMarkdown(sampleMessages, (m, i) => `${i}: ${m.role}`)
      await expect(md).toBe("0: user\n\n1: assistant")
    })
  },
}

export const CustomEmptyStateChildren: Story = {
  render: () => (
    <div className="h-[200px] w-full max-w-2xl rounded-lg border">
      <Conversation>
        <ConversationContent>
          <ConversationEmptyState>
            <div>Totally custom empty</div>
          </ConversationEmptyState>
        </ConversationContent>
      </Conversation>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Custom children replace default empty state", async () => {
      await expect(canvas.getByText("Totally custom empty")).toBeInTheDocument()
    })
  },
}

export const CustomEmptyState: Story = {
  render: () => (
    <div className="h-[400px] w-full max-w-2xl rounded-lg border">
      <Conversation>
        <ConversationContent>
          <ConversationEmptyState
            icon={<span className="text-4xl">🤖</span>}
            title="Hello! How can I help?"
            description="I can answer questions, write code, and analyse data."
          />
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Custom empty state renders", async () => {
      await expect(canvas.getByText("Hello! How can I help?")).toBeInTheDocument()
    })
  },
}
