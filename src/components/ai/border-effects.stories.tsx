/**
 * Border Effects — TetraScience brand border utilities showcase
 *
 * Five reusable utility classes defined in src/index.tailwind.css.
 * Apply them to the component or a thin wrapper div.
 *
 * box-shadow family (apply directly to any element):
 *   ts-border-glow    — TS Blue 500 static glow
 *   ts-border-accent  — Light Blue 300 chip ring
 *   ts-border-pulse   — Breathing glow (thinking / reasoning state)
 *
 * background-clip family (apply to a wrapper div):
 *   ts-border-gradient — Static Blue-Vision → Purple gradient ring
 *   ts-border-shimmer  — Animated sweeping gradient ring
 *
 * Dark-mode / card-background override:
 *   Add [--ts-border-bg:var(--card)] when the wrapper sits on a card surface.
 *
 * ── When to use ────────────────────────────────────────────────────────────
 * Use border effects sparingly — only to call attention to a single feature
 * that is new, actively processing, or otherwise needs to stand out. Applying
 * these effects to multiple elements on the same screen diminishes their
 * impact and creates visual noise. A good rule of thumb: if more than one
 * element on the page has a brand border, reconsider whether all of them
 * truly need it.
 *
 * Good candidates:
 *   - The prompt input on an intro / empty-state screen (one-time highlight)
 *   - A reasoning / queue panel while the model is actively thinking
 *   - A "new feature" chip or card being surfaced for the first time
 *
 * Avoid:
 *   - Multiple glowing borders on the same view
 *   - Persistent glow on elements that are always visible
 *   - Decorative use with no functional signal
 */
import { BrainIcon, ChevronDownIcon } from "lucide-react"
import { useState } from "react"
import { expect, userEvent, within } from "storybook/test"

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "./prompt-input"
import { Queue, QueueItem, QueueItemContent, QueueItemIndicator, QueueList } from "./queue"
import { Reasoning, ReasoningContent, ReasoningTrigger, useReasoning } from "./reasoning"
import { Shimmer, TS_SHIMMER_GRADIENT } from "./shimmer"
import { Suggestion } from "./suggestion"

import type { Meta, StoryObj } from "@storybook/react-vite"

import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Shared gradient definition for SVG icon stroke
// ---------------------------------------------------------------------------

const TsBrainGradientDef = () => (
  <svg aria-hidden height={0} style={{ position: "absolute" }} width={0}>
    <defs>
      <linearGradient id="ts-brain-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
        <stop offset="0%" stopColor="#549DFF" />
        <stop offset="50%" stopColor="#8243BA" />
        <stop offset="100%" stopColor="#9665F4" />
      </linearGradient>
    </defs>
  </svg>
)

/** Reads context from the nearest <Reasoning> to render the full trigger row with a gradient icon. */
const GradientBrainTrigger = () => {
  const { isStreaming, isOpen, duration } = useReasoning()
  return (
    <>
      <TsBrainGradientDef />
      <BrainIcon className="size-4" stroke="url(#ts-brain-gradient)" />
      {isStreaming ? (
        <Shimmer duration={1.5} gradient={TS_SHIMMER_GRADIENT}>
          Thinking...
        </Shimmer>
      ) : (
        <span>Thought for {duration ?? "a few"} seconds</span>
      )}
      <ChevronDownIcon
        className={cn(
          "size-4 opacity-0 transition-all group-focus-visible:opacity-100 group-hover:opacity-100",
          isOpen ? "rotate-180 opacity-100" : "rotate-0"
        )}
      />
    </>
  )
}


const meta: Meta = {
  title: "AI Elements/Border Effects",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj

// ---------------------------------------------------------------------------
// ts-border-glow — Prompt Input
// ---------------------------------------------------------------------------

export const GlowOnPromptInput: Story = {
  name: "ts-border-glow — Prompt Input",
  render: () => {
    const [text, setText] = useState("")
    return (
      <div className="w-full max-w-2xl">
        <div className="[&_[data-slot=input-group]]:ts-border-glow [&_[data-slot=input-group]]:rounded-xl">
          <PromptInput onSubmit={() => setText("")}>
            <PromptInputBody>
              <PromptInputTextarea
                onChange={(e) => setText(e.target.value)}
                placeholder="Ask anything…"
                value={text}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools />
              <PromptInputSubmit disabled={!text.trim()} status="ready" />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Prompt input renders with glow border and accepts text", async () => {
      await expect(canvas.getByPlaceholderText("Ask anything…")).toBeInTheDocument()
      await userEvent.type(canvas.getByPlaceholderText("Ask anything…"), "Hello")
      await expect(canvas.getByRole("button", { name: /submit/i })).not.toBeDisabled()
    })
  },
}

// ---------------------------------------------------------------------------
// ts-border-gradient — Prompt Input (wrapper)
// ---------------------------------------------------------------------------

export const GradientOnPromptInput: Story = {
  name: "ts-border-gradient — Prompt Input",
  render: () => {
    const [text, setText] = useState("")
    return (
      <div className="w-full max-w-2xl">
        <div className="ts-border-gradient rounded-xl [&_[data-slot=input-group]]:rounded-[calc(0.75rem-1.5px)] [&_[data-slot=input-group]]:border-none [&_[data-slot=input-group]]:shadow-none">
          <PromptInput onSubmit={() => setText("")}>
            <PromptInputBody>
              <PromptInputTextarea
                onChange={(e) => setText(e.target.value)}
                placeholder="How can I help you today?"
                value={text}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools />
              <PromptInputSubmit disabled={!text.trim()} status="ready" />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Prompt input renders with gradient border and accepts text", async () => {
      await expect(canvas.getByPlaceholderText("How can I help you today?")).toBeInTheDocument()
      await userEvent.type(canvas.getByPlaceholderText("How can I help you today?"), "Hello")
      await expect(canvas.getByRole("button", { name: /submit/i })).not.toBeDisabled()
    })
  },
}

// ---------------------------------------------------------------------------
// ts-border-pulse — Queue (reasoning / in-progress state)
// ---------------------------------------------------------------------------

export const PulseOnQueue: Story = {
  name: "ts-border-pulse — Queue",
  render: () => (
    <div className="w-full max-w-sm">
      <div className="ts-border-pulse rounded-lg">
        <Queue>
          <QueueList>
            <QueueItem>
              <QueueItemIndicator status="loading" />
              <QueueItemContent>Searching web for context</QueueItemContent>
            </QueueItem>
            <QueueItem>
              <QueueItemIndicator status="pending" />
              <QueueItemContent>Reading three papers</QueueItemContent>
            </QueueItem>
            <QueueItem>
              <QueueItemIndicator status="done" />
              <QueueItemContent completed>Summarising findings</QueueItemContent>
            </QueueItem>
          </QueueList>
        </Queue>
      </div>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Queue renders with pulse border", async () => {
      await expect(canvas.getByText("Searching web for context")).toBeInTheDocument()
    })
  },
}

// ---------------------------------------------------------------------------
// ts-border-accent — Suggestion (selected chip)
// ---------------------------------------------------------------------------

export const AccentOnSuggestion: Story = {
  name: "ts-border-accent — Suggestion",
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      <Suggestion suggestion="Write" />
      <Suggestion suggestion="Learn" />
      {/* Selected chip carries the accent border */}
      <div className="ts-border-accent rounded-full">
        <Suggestion suggestion="Code" />
      </div>
      <Suggestion suggestion="Analyse" />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Suggestion chips render with accent on selected", async () => {
      await expect(canvas.getByText("Code")).toBeInTheDocument()
    })
  },
}

// ---------------------------------------------------------------------------
// Brand gradient Shimmer — text sweeps through blue→purple brand gradient.
// No border wrapper; the gradient lives in the text animation itself.
// ---------------------------------------------------------------------------

export const BrandGradientShimmer: Story = {
  name: "Brand gradient — Shimmer text",
  render: () => (
    <div className="flex flex-col gap-3 max-w-sm p-4">
      <Shimmer as="p" className="text-sm font-medium" gradient={TS_SHIMMER_GRADIENT}>
        Generating response…
      </Shimmer>
      <Shimmer as="p" className="text-sm" gradient={TS_SHIMMER_GRADIENT} duration={2.4}>
        Cross-referencing sources…
      </Shimmer>
      <Shimmer as="p" className="text-sm" gradient={TS_SHIMMER_GRADIENT} duration={2.8}>
        Preparing summary…
      </Shimmer>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Brand shimmer text renders", async () => {
      await expect(canvas.getByText("Generating response…")).toBeInTheDocument()
    })
  },
}

// ---------------------------------------------------------------------------
// Brand gradient shimmer on Reasoning "Thinking…" text.
// Same effect as the Shimmer story — the sweep lives in the text, not a border.
// ---------------------------------------------------------------------------

export const GradientShimmerOnReasoning: Story = {
  name: "Brand gradient shimmer — Reasoning",
  render: () => (
    <div className="w-full max-w-lg">
      <Reasoning defaultOpen isStreaming>
        {/* GradientBrainTrigger reads context from Reasoning and renders the
            full trigger row: gradient BrainIcon + shimmer "Thinking…" text + chevron */}
        <ReasoningTrigger>
          <GradientBrainTrigger />
        </ReasoningTrigger>
        <ReasoningContent>
          The user is asking about quantum entanglement. I should explain it
          in terms of correlated quantum states without invoking faster-than-light
          communication, which is a common misconception…
        </ReasoningContent>
      </Reasoning>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Reasoning renders with brand gradient shimmer trigger", async () => {
      await expect(canvas.getByText("Thinking...")).toBeInTheDocument()
      await expect(canvas.getByText(/quantum entanglement/)).toBeInTheDocument()
    })
  },
}

// ---------------------------------------------------------------------------
// Dark "thinking card" — screenshot-inspired composition
// Vivid blue→purple gradient border on a dark surface wrapping a
// reasoning panel in its streaming / "thinking" state.
// ---------------------------------------------------------------------------

export const ThinkingCard: Story = {
  name: "Thinking Card — Dark surface",
  parameters: { backgrounds: { default: "dark" } },
  render: () => (
    <div className="flex items-center justify-center p-8" style={{ background: "#111827" }}>
      {/*
        ts-border-gradient with --ts-border-bg overridden to match the dark
        card surface so the padding-box fill is transparent to the card colour.
      */}
      <div
        className="ts-border-gradient w-full max-w-sm rounded-2xl p-5 shadow-2xl"
        style={{ "--ts-border-bg": "#1a2235" } as React.CSSProperties}
      >
        {/* Card background */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{ background: "#1a2235", zIndex: -1 }}
        />

        {/* Top loading dots */}
        <div className="mb-4 flex w-fit items-center gap-1 rounded-full bg-white/10 px-3 py-2">
          {[0, 1, 2].map((i) => (
            <span
              className="size-1.5 animate-pulse rounded-full bg-white/70"
              key={i}
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        {/* Reasoning panel */}
        <Reasoning defaultOpen isStreaming>
          <ReasoningContent className="text-white/80">
            The user is asking about a dark mode. I should check existing tokens,
            identify the relevant CSS variables, and produce a clean dark-mode
            implementation that respects the brand palette…
          </ReasoningContent>
        </Reasoning>

        {/* Thinking shimmer line */}
        <div className="mt-4 flex items-center gap-2 text-white/60">
          <Shimmer as="span" className="text-sm italic">Thinking…</Shimmer>
        </div>
      </div>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Thinking card renders reasoning content", async () => {
      await expect(canvas.getByText(/dark mode/i)).toBeInTheDocument()
      await expect(canvas.getByText(/Thinking/i)).toBeInTheDocument()
    })
  },
}

// ---------------------------------------------------------------------------
// ts-border-gradient — Task queue (use when surfacing a new agentic feature)
// ---------------------------------------------------------------------------

export const GradientOnQueue: Story = {
  name: "ts-border-gradient — Task Queue",
  render: () => (
    <div className="w-full max-w-sm">
      <div className="ts-border-gradient rounded-xl">
        <Queue>
          <QueueList>
            <QueueItem>
              <QueueItemIndicator status="loading" />
              <QueueItemContent>Fetching data from API</QueueItemContent>
            </QueueItem>
            <QueueItem>
              <QueueItemIndicator status="pending" />
              <QueueItemContent>Analysing results</QueueItemContent>
            </QueueItem>
            <QueueItem>
              <QueueItemIndicator status="done" />
              <QueueItemContent completed>Validating schema</QueueItemContent>
            </QueueItem>
          </QueueList>
        </Queue>
      </div>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Queue renders with gradient border", async () => {
      await expect(canvas.getByText("Fetching data from API")).toBeInTheDocument()
      await expect(canvas.getByText("Validating schema")).toBeInTheDocument()
    })
  },
}

// ---------------------------------------------------------------------------
// All effects side-by-side
// ---------------------------------------------------------------------------

export const AllEffects: Story = {
  name: "All Effects — Reference",
  render: () => (
    <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-2">
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">ts-border-glow</p>
        <div className="ts-border-glow rounded-lg p-4 text-sm">
          TS Blue 500 static glow — prompt input, active states
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">ts-border-accent</p>
        <div className="ts-border-accent rounded-full px-4 py-2 text-sm w-fit">
          Light Blue 300 ring — selected suggestion chips
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">ts-border-pulse</p>
        <div className="ts-border-pulse rounded-lg p-4 text-sm">
          Breathing glow — reasoning / thinking states
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">ts-border-gradient</p>
        <div className="ts-border-gradient rounded-lg p-4 text-sm">
          Blue-Vision → Purple static ring — prompt card wrappers
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">ts-border-shimmer</p>
        <div className="ts-border-shimmer rounded-lg p-4 text-sm">
          Animated sweeping gradient ring — loading containers
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">ts-reasoning-accent</p>
        <div className="ts-reasoning-accent rounded-sm p-4 text-sm">
          Gradient left bar — reasoning / thinking panels
        </div>
      </div>

      <div className="col-span-full space-y-2">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Brand gradient Shimmer text</p>
        <div className="rounded-lg p-4">
          <Shimmer as="p" className="text-sm font-medium" gradient={TS_SHIMMER_GRADIENT}>
            Generating response… blue → purple sweep on the text itself
          </Shimmer>
        </div>
      </div>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("All effect labels render", async () => {
      await expect(canvas.getByText(/ts-border-glow/i)).toBeInTheDocument()
      await expect(canvas.getByText(/ts-border-shimmer/i)).toBeInTheDocument()
    })
  },
}
