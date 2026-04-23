import { useState } from "react"
import { expect, userEvent, within } from "storybook/test"

import { Suggestion, Suggestions } from "./suggestion"

import type { Meta, StoryObj } from "@storybook/react-vite"


const defaultSuggestions = [
  "Explain quantum computing",
  "Write a haiku about autumn",
  "How do I make pasta carbonara?",
  "What is the tallest mountain?",
]

const meta: Meta = {
  title: "AI Elements/Suggestion",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj

export const Default: Story = {
  render: () => (
    <Suggestions>
      {defaultSuggestions.map((s) => (
        <Suggestion key={s} suggestion={s} onClick={() => {}} />
      ))}
    </Suggestions>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Suggestions render", async () => {
      await expect(canvas.getByText("Explain quantum computing")).toBeInTheDocument()
      await expect(canvas.getByText("How do I make pasta carbonara?")).toBeInTheDocument()
    })
  },
}

export const Interactive: Story = {
  render: () => {
    const [selected, setSelected] = useState<string | null>(null)
    return (
      <div className="space-y-4">
        <Suggestions>
          {defaultSuggestions.map((s) => (
            <Suggestion key={s} suggestion={s} onClick={setSelected} />
          ))}
        </Suggestions>
        {selected && (
          <p className="text-sm text-muted-foreground">
            Selected: <strong>{selected}</strong>
          </p>
        )}
      </div>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Clicking a suggestion selects it", async () => {
      const btn = canvas.getByText("Write a haiku about autumn")
      await userEvent.click(btn)
      await expect(canvas.getByText(/Write a haiku about autumn/)).toBeInTheDocument()
    })
  },
}

export const Few: Story = {
  render: () => (
    <Suggestions>
      <Suggestion suggestion="Tell me a joke" onClick={() => {}} />
      <Suggestion suggestion="Summarize this document" onClick={() => {}} />
    </Suggestions>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Two suggestions render", async () => {
      await expect(canvas.getByText("Tell me a joke")).toBeInTheDocument()
    })
  },
}
