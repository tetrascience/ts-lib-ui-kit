import { expect, within } from "storybook/test"

import {
  Context,
  ContextCacheUsage,
  ContextContent,
  ContextContentBody,
  ContextContentFooter,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextTrigger,
} from "./context"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta = {
  title: "AI Elements/Context",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj

const baseUsage = {
  inputTokens: 1200,
  outputTokens: 450,
}

export const Default: Story = {
  render: () => (
    <Context usedTokens={1650} maxTokens={128000} modelId="gpt-4o" usage={baseUsage}>
      <ContextTrigger />
      <ContextContent>
        <ContextContentHeader />
        <ContextContentBody>
          <ContextInputUsage />
          <ContextOutputUsage />
        </ContextContentBody>
        <ContextContentFooter />
      </ContextContent>
    </Context>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Context trigger renders", async () => {
      await expect(canvas.getByRole("button")).toBeInTheDocument()
    })
  },
}

export const WithReasoning: Story = {
  render: () => (
    <Context
      usedTokens={8500}
      maxTokens={32000}
      modelId="claude-sonnet-4-6"
      usage={{
        inputTokens: 5000,
        outputTokens: 2000,
        reasoningTokens: 1500,
      }}
    >
      <ContextTrigger />
      <ContextContent>
        <ContextContentHeader />
        <ContextContentBody>
          <ContextInputUsage />
          <ContextOutputUsage />
          <ContextReasoningUsage />
        </ContextContentBody>
        <ContextContentFooter />
      </ContextContent>
    </Context>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Context with reasoning renders", async () => {
      await expect(canvas.getByRole("button")).toBeInTheDocument()
    })
  },
}

export const WithCaching: Story = {
  render: () => (
    <Context
      usedTokens={3200}
      maxTokens={200000}
      modelId="claude-opus-4-7"
      usage={{
        inputTokens: 2000,
        outputTokens: 1200,
        cachedInputTokens: 800,
      }}
    >
      <ContextTrigger />
      <ContextContent>
        <ContextContentHeader />
        <ContextContentBody>
          <ContextInputUsage />
          <ContextOutputUsage />
          <ContextCacheUsage />
        </ContextContentBody>
        <ContextContentFooter />
      </ContextContent>
    </Context>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Context with cache usage renders", async () => {
      await expect(canvas.getByRole("button")).toBeInTheDocument()
    })
  },
}

export const NearLimit: Story = {
  render: () => (
    <Context
      usedTokens={122000}
      maxTokens={128000}
      modelId="gpt-4o"
      usage={{
        inputTokens: 110000,
        outputTokens: 12000,
      }}
    >
      <ContextTrigger />
      <ContextContent>
        <ContextContentHeader />
        <ContextContentBody>
          <ContextInputUsage />
          <ContextOutputUsage />
        </ContextContentBody>
        <ContextContentFooter />
      </ContextContent>
    </Context>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Near-limit context renders", async () => {
      await expect(canvas.getByRole("button")).toBeInTheDocument()
    })
  },
}
