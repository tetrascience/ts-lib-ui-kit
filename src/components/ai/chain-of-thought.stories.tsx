import { expect, within } from "storybook/test"

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtImage,
  ChainOfThoughtSource,
  ChainOfThoughtSources,
  ChainOfThoughtStep,
  ChainOfThoughtTrigger,
} from "./chain-of-thought"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta = {
  title: "AI Elements/Chain of Thought",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj

// ---------------------------------------------------------------------------
// Default — bullet steps + source chips
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => (
    <ChainOfThought className="w-full max-w-2xl">
      <ChainOfThoughtTrigger />
      <ChainOfThoughtContent>
        <ChainOfThoughtStep>
          The user wants to know about photosynthesis — the process by which
          plants convert light energy into chemical energy.
        </ChainOfThoughtStep>
        <ChainOfThoughtSources>
          <ChainOfThoughtSource href="#">Wikipedia</ChainOfThoughtSource>
          <ChainOfThoughtSource href="#">Khan Academy</ChainOfThoughtSource>
          <ChainOfThoughtSource href="#">Biology Online</ChainOfThoughtSource>
        </ChainOfThoughtSources>
        <ChainOfThoughtStep>
          Combining information from multiple sources to produce a clear,
          accurate explanation of the photosynthesis process.
        </ChainOfThoughtStep>
      </ChainOfThoughtContent>
    </ChainOfThought>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Chain of thought renders with steps and sources", async () => {
      await expect(canvas.getAllByText(/photosynthesis/).length).toBeGreaterThan(0)
      await expect(canvas.getByText("Wikipedia")).toBeInTheDocument()
    })
  },
}

// ---------------------------------------------------------------------------
// With web search — search icon, URL chips, inline image
// ---------------------------------------------------------------------------

export const WithSearch: Story = {
  name: "With Web Search",
  render: () => (
    <ChainOfThought className="w-full max-w-2xl">
      <ChainOfThoughtTrigger />
      <ChainOfThoughtContent>
        <ChainOfThoughtStep variant="search">
          Searching for profiles for Hayden Bleasel
        </ChainOfThoughtStep>
        <ChainOfThoughtSources>
          <ChainOfThoughtSource href="#">www.x.com</ChainOfThoughtSource>
          <ChainOfThoughtSource href="#">www.instagram.com</ChainOfThoughtSource>
          <ChainOfThoughtSource href="#">www.github.com</ChainOfThoughtSource>
        </ChainOfThoughtSources>
        <ChainOfThoughtStep variant="image">
          Found the profile photo for Hayden Bleasel
        </ChainOfThoughtStep>
        <ChainOfThoughtImage
          alt="Profile photo"
          caption="Profile photo from x.com, showing a Ghibli-style avatar."
          src="https://placehold.co/600x300/e2e8f0/64748b?text=Profile+Image"
        />
        <ChainOfThoughtStep>
          Hayden Bleasel is an Australian product designer, software engineer,
          and founder. He is currently based in the United States working for
          Vercel, an American cloud application company.
        </ChainOfThoughtStep>
        <ChainOfThoughtStep variant="search">
          Searching for recent work…
        </ChainOfThoughtStep>
        <ChainOfThoughtSources>
          <ChainOfThoughtSource href="#">www.github.com</ChainOfThoughtSource>
          <ChainOfThoughtSource href="#">www.dribbble.com</ChainOfThoughtSource>
        </ChainOfThoughtSources>
      </ChainOfThoughtContent>
    </ChainOfThought>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Search steps and image render", async () => {
      await expect(canvas.getByText(/Searching for profiles/)).toBeInTheDocument()
      await expect(canvas.getAllByText("www.github.com").length).toBeGreaterThan(0)
    })
  },
}

// ---------------------------------------------------------------------------
// With image analysis
// ---------------------------------------------------------------------------

export const WithImageAnalysis: Story = {
  name: "With Image Analysis",
  render: () => (
    <ChainOfThought className="w-full max-w-2xl">
      <ChainOfThoughtTrigger />
      <ChainOfThoughtContent>
        <ChainOfThoughtStep variant="image">
          Examining the chart data from the uploaded image.
        </ChainOfThoughtStep>
        <ChainOfThoughtImage
          alt="Revenue chart"
          caption="Revenue trend Q1–Q4"
          src="https://placehold.co/600x200/e2e8f0/64748b?text=Revenue+Chart"
        />
        <ChainOfThoughtStep>
          Revenue grew 23% YoY with strongest growth in Q3.
        </ChainOfThoughtStep>
      </ChainOfThoughtContent>
    </ChainOfThought>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Image and caption render", async () => {
      await expect(canvas.getByText("Revenue trend Q1–Q4")).toBeInTheDocument()
      await expect(canvas.getByText(/Revenue grew 23%/)).toBeInTheDocument()
    })
  },
}

// ---------------------------------------------------------------------------
// Streaming — pulsing dot while reasoning is active
// ---------------------------------------------------------------------------

export const Streaming: Story = {
  render: () => (
    <ChainOfThought className="w-full max-w-2xl">
      <ChainOfThoughtTrigger isStreaming />
      <ChainOfThoughtContent>
        <ChainOfThoughtStep variant="search">
          Searching for recent AI research papers…
        </ChainOfThoughtStep>
        <ChainOfThoughtSources>
          <ChainOfThoughtSource href="#">arxiv.org</ChainOfThoughtSource>
          <ChainOfThoughtSource href="#">paperswithcode.com</ChainOfThoughtSource>
        </ChainOfThoughtSources>
        <ChainOfThoughtStep>
          Identifying the most cited papers from Q1 2025…
        </ChainOfThoughtStep>
      </ChainOfThoughtContent>
    </ChainOfThought>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Streaming state renders with steps", async () => {
      await expect(canvas.getByText(/Searching for recent/)).toBeInTheDocument()
    })
  },
}

// ---------------------------------------------------------------------------
// Collapsed
// ---------------------------------------------------------------------------

export const Collapsed: Story = {
  render: () => (
    <ChainOfThought className="w-full max-w-2xl" defaultOpen={false}>
      <ChainOfThoughtTrigger />
      <ChainOfThoughtContent>
        <ChainOfThoughtStep>
          This content is hidden by default.
        </ChainOfThoughtStep>
      </ChainOfThoughtContent>
    </ChainOfThought>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Collapsed trigger renders", async () => {
      await expect(canvas.getByRole("button")).toBeInTheDocument()
    })
  },
}
