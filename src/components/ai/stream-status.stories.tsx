import { useEffect, useState } from "react"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { StreamStatus } from "./stream-status"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof StreamStatus> = {
  title: "AI Elements/Stream Status",
  component: StreamStatus,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof StreamStatus>

const StreamingTransitionDemo = () => {
  const [isStreaming, setIsStreaming] = useState(true)
  const [startTime] = useState(() => Date.now() - 65 * 1000)

  return (
    <div className="flex flex-col gap-3 p-4 min-w-72">
      <button type="button" onClick={() => setIsStreaming(false)}>
        Finish stream
      </button>
      <StreamStatus
        icon={<span data-testid="custom-stream-icon">Custom icon</span>}
        isStreaming={isStreaming}
        showIndicator
        startTime={startTime}
        tokenCount={1_200_000}
        tokenLabel={null}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Default — time + tokens, no icon, no indicator
// ---------------------------------------------------------------------------

export const Default: Story = {
  args: {
    startTime: new Date(Date.now() - 9 * 60 * 1000 - 37 * 1000),
    isStreaming: true,
    tokenCount: 8700,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Renders elapsed time and token count", async () => {
      await expect(canvas.getByText(/tokens/i)).toBeInTheDocument()
    })
  },
}

// ---------------------------------------------------------------------------
// Icon variants — the four built-in Lucide spinners
// ---------------------------------------------------------------------------

export const IconVariants: Story = {
  name: "Icon Variants",
  render: () => (
    <div className="flex flex-col gap-4 p-4 min-w-72">
      <StreamStatus
        iconVariant="loader"
        isStreaming
        startTime={new Date(Date.now() - 9 * 60 * 1000 - 37 * 1000)}
        tokenCount={8700}
      />
      <StreamStatus
        iconVariant="loader-circle"
        isStreaming
        startTime={new Date(Date.now() - 2 * 60 * 1000 + 5 * 1000)}
        tokenCount={4300}
      />
      <StreamStatus
        iconVariant="loader-pinwheel"
        isStreaming
        startTime={new Date(Date.now() - 45 * 1000)}
        tokenCount={1200}
      />
      <StreamStatus
        iconVariant="disc-3"
        isStreaming
        startTime={new Date(Date.now() - 12 * 1000)}
      />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("All four icon variants render", async () => {
      await expect(canvas.getByText("8.7k tokens")).toBeInTheDocument()
    })
  },
}

// ---------------------------------------------------------------------------
// Indicator states — right-end dot, all colour states
// ---------------------------------------------------------------------------

export const IndicatorStates: Story = {
  name: "Indicator States",
  render: () => (
    <div className="flex flex-col gap-4 p-4 min-w-72">
      <StreamStatus
        iconVariant="loader-circle"
        isStreaming
        showIndicator
        startTime={new Date(Date.now() - 25 * 1000)}
        state="streaming"
        tokenCount={2100}
      />
      <StreamStatus
        iconVariant="loader-circle"
        showIndicator
        startTime={new Date(Date.now() - 9 * 60 * 1000 - 37 * 1000)}
        state="done"
        tokenCount={8700}
      />
      <StreamStatus
        iconVariant="loader-circle"
        showIndicator
        startTime={new Date(Date.now() - 4 * 1000)}
        state="error"
        tokenCount={310}
      />
      <StreamStatus
        iconVariant="loader-circle"
        showIndicator
        startTime={new Date(Date.now() - 60 * 1000)}
        state="idle"
      />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("All indicator states render", async () => {
      await expect(canvas.getByText("2.1k tokens")).toBeInTheDocument()
    })
  },
}

// ---------------------------------------------------------------------------
// No indicator (default) vs with indicator
// ---------------------------------------------------------------------------

export const WithAndWithoutIndicator: Story = {
  name: "showIndicator — On vs Off",
  render: () => (
    <div className="flex flex-col gap-4 p-4 min-w-72">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">showIndicator=false (default)</p>
        <StreamStatus
          iconVariant="loader-pinwheel"
          isStreaming
          startTime={new Date(Date.now() - 9 * 60 * 1000 - 37 * 1000)}
          tokenCount={8700}
        />
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">showIndicator=true</p>
        <StreamStatus
          iconVariant="loader-pinwheel"
          isStreaming
          showIndicator
          startTime={new Date(Date.now() - 9 * 60 * 1000 - 37 * 1000)}
          tokenCount={8700}
        />
      </div>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Both variants render tokens", async () => {
      await expect(canvas.getAllByText("8.7k tokens")).toHaveLength(2)
    })
  },
}

// ---------------------------------------------------------------------------
// Live timer — real elapsed time + growing token count
// ---------------------------------------------------------------------------

export const LiveTimer: Story = {
  name: "Live Timer",
  render: () => {
    const [start] = useState(() => new Date())
    const [tokens, setTokens] = useState(0)

    useEffect(() => {
      const id = setInterval(
        () => setTokens((t) => t + Math.floor(Math.random() * 45) + 10),
        700
      )
      return () => clearInterval(id)
    }, [])

    return (
      <StreamStatus
        iconVariant="disc-3"
        isStreaming
        showIndicator
        startTime={start}
        tokenCount={tokens}
      />
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Live timer renders", async () => {
      await expect(canvas.getByText(/tokens/i)).toBeInTheDocument()
    })
  },
}

// ---------------------------------------------------------------------------
// Finished — not streaming, frozen display
// ---------------------------------------------------------------------------

export const Finished: Story = {
  args: {
    startTime: new Date(Date.now() - 9 * 60 * 1000 - 37 * 1000),
    isStreaming: false,
    state: "done",
    showIndicator: true,
    iconVariant: "loader-circle",
    tokenCount: 12400,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Done state renders frozen with green indicator", async () => {
      await expect(canvas.getByText(/12\.4k tokens/i)).toBeInTheDocument()
    })
  },
}

// ---------------------------------------------------------------------------
// Time only — no tokens, no icon
// ---------------------------------------------------------------------------

export const TimeOnly: Story = {
  name: "Time Only",
  args: {
    startTime: new Date(Date.now() - 23 * 1000),
    isStreaming: true,
    showIndicator: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Time-only variant renders", async () => {
      await expect(canvas.getByText(/s$/)).toBeInTheDocument()
    })
  },
}

export const CustomIconAndFinishRipple: Story = {
  render: () => <StreamingTransitionDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Custom icon, numeric start time, and million-token formatting render", async () => {
      await expect(canvas.getByTestId("custom-stream-icon")).toBeInTheDocument()
      await expect(canvas.getByText("1.2m tokens")).toBeInTheDocument()
      await expect(canvas.getByText(/\d+m \d{2}s/)).toBeInTheDocument()
    })

    await step("Stopping the stream shows and clears the confirm ripple", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Finish stream" }))
      await waitFor(() =>
        expect(canvasElement.querySelector(".ts-bubble-confirm")).toBeInTheDocument()
      )
      await waitFor(
        () => expect(canvasElement.querySelector(".ts-bubble-confirm")).not.toBeInTheDocument(),
        { timeout: 1200 }
      )
    })
  },
}

export const IdleWithoutStartTime: Story = {
  render: () => (
    <StreamStatus
      isStreaming={false}
      showIndicator
      tokenCount={42}
      tokenLabel={null}
    />
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Idle status can render tokens without elapsed time", async () => {
      await expect(canvas.getByText("42 tokens")).toBeInTheDocument()
    })
  },
}
