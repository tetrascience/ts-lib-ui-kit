import { expect, screen, within } from "storybook/test"

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
    <Context usedTokens={1650} maxTokens={128000} usage={baseUsage}>
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
    await step("Overall percentage is hidden by default", async () => {
      await expect(canvas.queryByText("1.3%")).not.toBeInTheDocument()
      await expect(canvas.getByRole("img", { name: "Model context usage" })).toBeInTheDocument()
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4532" },
  },
}

export const WithVisiblePercentage: Story = {
  render: () => (
    <Context usedTokens={1650} maxTokens={128000} usage={baseUsage}>
      <ContextTrigger showPercentage />
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
    await step("Overall percentage can be shown", async () => {
      await expect(canvas.getByText("1.3%")).toBeInTheDocument()
      await expect(canvas.getByRole("img", { name: "Model context usage" })).toBeInTheDocument()
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4533" },
  },
}

export const WithReasoning: Story = {
  render: () => (
    <Context
      usedTokens={8500}
      maxTokens={32000}
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
  parameters: {
    zephyr: { testCaseId: "SW-T4534" },
  },
}

export const WithCaching: Story = {
  render: () => (
    <Context
      usedTokens={3200}
      maxTokens={200000}
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
  parameters: {
    zephyr: { testCaseId: "SW-T4535" },
  },
}

export const OpenPopover: Story = {
  render: () => (
    <Context
      open
      usedTokens={1650}
      maxTokens={128000}
      usage={{
        inputTokens: 1200,
        outputTokens: 450,
        reasoningTokens: 300,
        cachedInputTokens: 150,
      }}
    >
      <ContextTrigger />
      <ContextContent>
        <ContextContentHeader />
        <ContextContentBody>
          <ContextInputUsage />
          <ContextOutputUsage />
          <ContextReasoningUsage />
          <ContextCacheUsage />
        </ContextContentBody>
        <ContextContentFooter />
      </ContextContent>
    </Context>
  ),
  play: async ({ step }) => {
    await step("Popover contents visible", async () => {
      await expect(await screen.findByText("Input")).toBeInTheDocument()
      await expect(screen.getByText("Output")).toBeInTheDocument()
      await expect(screen.getByText("Reasoning")).toBeInTheDocument()
      await expect(screen.getByText("Cache")).toBeInTheDocument()
      await expect(screen.getByText("Total cost")).toBeInTheDocument()
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4536" },
  },
}

export const WarningThreshold: Story = {
  render: () => (
    <Context
      open
      usedTokens={100000}
      maxTokens={128000}
      usage={{ inputTokens: 90000, outputTokens: 10000 }}
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
  play: async ({ step }) => {
    await step("Warning threshold renders progress bar", async () => {
      await expect(await screen.findByText("Input")).toBeInTheDocument()
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4537" },
  },
}

export const CustomChildrenOverride: Story = {
  render: () => (
    <Context
      open
      usedTokens={500}
      maxTokens={1000}
      usage={{
        inputTokens: 200,
        outputTokens: 100,
        reasoningTokens: 50,
        cachedInputTokens: 25,
      }}
    >
      <ContextTrigger>
        <button type="button">Custom Trigger</button>
      </ContextTrigger>
      <ContextContent>
        <ContextContentHeader>
          <div>Custom header</div>
        </ContextContentHeader>
        <ContextContentBody>
          <ContextInputUsage>
            <div>Custom input row</div>
          </ContextInputUsage>
          <ContextOutputUsage>
            <div>Custom output row</div>
          </ContextOutputUsage>
          <ContextReasoningUsage>
            <div>Custom reasoning row</div>
          </ContextReasoningUsage>
          <ContextCacheUsage>
            <div>Custom cache row</div>
          </ContextCacheUsage>
        </ContextContentBody>
        <ContextContentFooter>
          <div>Custom footer</div>
        </ContextContentFooter>
      </ContextContent>
    </Context>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Custom trigger renders", async () => {
      await expect(canvas.getByText("Custom Trigger")).toBeInTheDocument()
    })
    await step("All custom content slots render", async () => {
      await expect(await screen.findByText("Custom header")).toBeInTheDocument()
      await expect(screen.getByText("Custom input row")).toBeInTheDocument()
      await expect(screen.getByText("Custom output row")).toBeInTheDocument()
      await expect(screen.getByText("Custom reasoning row")).toBeInTheDocument()
      await expect(screen.getByText("Custom cache row")).toBeInTheDocument()
      await expect(screen.getByText("Custom footer")).toBeInTheDocument()
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4538" },
  },
}

export const ZeroUsageHidesRows: Story = {
  render: () => (
    <Context open usedTokens={0} maxTokens={1000} usage={{ inputTokens: 0, outputTokens: 0 }}>
      <ContextTrigger />
      <ContextContent>
        <ContextContentHeader />
        <ContextContentBody>
          <ContextInputUsage />
          <ContextOutputUsage />
          <ContextReasoningUsage />
          <ContextCacheUsage />
        </ContextContentBody>
        <ContextContentFooter />
      </ContextContent>
    </Context>
  ),
  play: async ({ step }) => {
    await step("Zero-token rows are hidden but footer still renders", async () => {
      await expect(await screen.findByText("Total cost")).toBeInTheDocument()
      await expect(screen.queryByText("Input")).not.toBeInTheDocument()
      await expect(screen.queryByText("Output")).not.toBeInTheDocument()
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4539" },
  },
}

export const NearLimit: Story = {
  render: () => (
    <Context
      usedTokens={122000}
      maxTokens={128000}
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
  parameters: {
    zephyr: { testCaseId: "SW-T4540" },
  },
}

export const UsageWithoutCost: Story = {
  render: () => (
    <Context
      open
      maxTokens={8000}
      usedTokens={4200}
      usage={{
        cachedInputTokens: 100,
        inputTokens: 1200,
        outputTokens: 300,
        reasoningTokens: 200,
      }}
    >
      <ContextTrigger />
      <ContextContent>
        <ContextContentHeader />
        <ContextContentBody>
          <ContextInputUsage />
          <ContextOutputUsage />
          <ContextReasoningUsage />
          <ContextCacheUsage />
        </ContextContentBody>
        <ContextContentFooter />
      </ContextContent>
    </Context>
  ),
  play: async ({ step }) => {
    await step("Usage rows render without cost text when no cost is provided", async () => {
      await expect(await screen.findByText("Input")).toBeInTheDocument()
      await expect(screen.getByText("Output")).toBeInTheDocument()
      await expect(screen.getByText("Reasoning")).toBeInTheDocument()
      await expect(screen.getByText("Cache")).toBeInTheDocument()
      await expect(screen.queryByText(/\$\d/)).not.toBeInTheDocument()
      await expect(screen.getByText("—")).toBeInTheDocument()
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4541" },
  },
}

export const WithCostBreakdown: Story = {
  render: () => (
    <Context
      open
      maxTokens={200000}
      usedTokens={12000}
      usage={{
        cachedInputTokens: 800,
        inputTokens: 8000,
        outputTokens: 3200,
      }}
      cost={{
        cache: 0.0008,
        input: 0.024,
        output: 0.048,
        total: 0.0728,
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
  play: async ({ step }) => {
    await step("Cost breakdown renders with pre-computed values", async () => {
      await expect(await screen.findByText("Input")).toBeInTheDocument()
      await expect(screen.getByText("Output")).toBeInTheDocument()
      await expect(screen.getByText("Cache")).toBeInTheDocument()
      await expect(screen.getByText("$0.07")).toBeInTheDocument()
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4542" },
  },
}
