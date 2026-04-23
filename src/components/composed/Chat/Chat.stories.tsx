import { expect, userEvent, within } from "storybook/test"

import { Chat } from "./Chat"

import type { ChatMessage } from "./Chat"
import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof Chat> = {
  title: "Composed/Chat",
  component: Chat,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof Chat>

// ---------------------------------------------------------------------------
// Shared mock data
// ---------------------------------------------------------------------------

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    role: "user",
    content: "How does photosynthesis work?",
  },
  {
    id: "2",
    role: "assistant",
    reasoning:
      "The user is asking about a fundamental biology concept. I should explain it in plain language with a clear structure.",
    sources: [
      {
        href: "https://en.wikipedia.org/wiki/Photosynthesis",
        title: "Photosynthesis — Wikipedia",
      },
      {
        href: "https://www.khanacademy.org/science/photosynthesis",
        title: "Photosynthesis — Khan Academy",
      },
    ],
    content: `Photosynthesis is the process plants use to convert sunlight into food.

Here's the simple version:
1. **Light absorbed** — Chlorophyll in leaves captures sunlight
2. **Water split** — Water from roots is broken apart
3. **CO₂ fixed** — Carbon dioxide from air is combined with hydrogen
4. **Sugar made** — Glucose is produced as stored energy
5. **Oxygen released** — As a byproduct, oxygen is released into the air

The overall equation: **6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂**`,
  },
  {
    id: "3",
    role: "user",
    content: "What is chlorophyll exactly?",
  },
  {
    id: "4",
    role: "assistant",
    branches: [
      "Chlorophyll is a green pigment found in plant cells, specifically inside organelles called **chloroplasts**. It absorbs light most efficiently in the red and blue wavelengths, reflecting green light — which is why plants appear green.",
      "Chlorophyll is a photosynthetic pigment. The word comes from Greek: *khloros* (green) + *phyllon* (leaf). There are several types; chlorophyll‑a is the primary pigment in most plants.",
    ],
    content:
      "Chlorophyll is a green pigment found in plant cells, specifically inside organelles called **chloroplasts**. It absorbs light most efficiently in the red and blue wavelengths, reflecting green light — which is why plants appear green.",
  },
]

const MOCK_MODELS = [
  { id: "claude-sonnet-4-6", name: "Claude Sonnet" },
  { id: "claude-opus-4-7", name: "Claude Opus" },
  { id: "gpt-4o", name: "GPT-4o" },
]

const MOCK_SUGGESTIONS = [
  "Explain quantum entanglement",
  "Write a haiku about the ocean",
  "What is the Turing test?",
  "Summarise the French Revolution",
]

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Empty: Story = {
  args: {
    models: MOCK_MODELS,
    suggestions: MOCK_SUGGESTIONS,
  },
  render: (args) => (
    <div className="h-[600px] w-full max-w-2xl rounded-lg border">
      <Chat {...args} />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Empty state renders with suggestions", async () => {
      await expect(canvas.getByText("Start a conversation")).toBeInTheDocument()
      await expect(canvas.getByText("Explain quantum entanglement")).toBeInTheDocument()
    })
    await step("Clicking a suggestion fills the textarea", async () => {
      await userEvent.click(canvas.getByText("Explain quantum entanglement"))
      await expect(canvas.getByPlaceholderText("Ask anything...")).toHaveValue(
        "Explain quantum entanglement"
      )
    })
  },
}

export const WithMessages: Story = {
  args: {
    initialMessages: MOCK_MESSAGES,
    models: MOCK_MODELS,
    suggestions: MOCK_SUGGESTIONS,
  },
  render: (args) => (
    <div className="h-[600px] w-full max-w-2xl rounded-lg border">
      <Chat {...args} />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("User and assistant messages render", async () => {
      await expect(canvas.getByText(/How does photosynthesis/)).toBeInTheDocument()
      await expect(canvas.getByText(/Photosynthesis is the process/)).toBeInTheDocument()
    })
    await step("Branch navigation is visible for multi-branch message", async () => {
      await expect(canvas.getByText(/1 of 2/)).toBeInTheDocument()
    })
    await step("Sources panel renders", async () => {
      await expect(canvas.getByText(/Used 2 sources/i)).toBeInTheDocument()
    })
  },
}

export const SingleModel: Story = {
  args: {
    initialMessages: MOCK_MESSAGES,
    models: [{ id: "claude-sonnet-4-6", name: "Claude Sonnet" }],
  },
  render: (args) => (
    <div className="h-[600px] w-full max-w-2xl rounded-lg border">
      <Chat {...args} />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Model selector hidden with single model", async () => {
      await expect(canvas.queryByRole("combobox")).not.toBeInTheDocument()
    })
  },
}

export const Interactive: Story = {
  args: {
    models: MOCK_MODELS,
    suggestions: MOCK_SUGGESTIONS,
    onSend: async (message) => {
      await new Promise<void>((resolve) => {
        const id = setTimeout(resolve, 800)
        return () => clearTimeout(id)
      })
      return `You said: "${message}". This is a simulated reply.`
    },
  },
  render: (args) => (
    <div className="h-[600px] w-full max-w-2xl rounded-lg border">
      <Chat {...args} />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Textarea is present", async () => {
      await expect(canvas.getByPlaceholderText("Ask anything...")).toBeInTheDocument()
    })
    await step("Typing a message enables the submit button", async () => {
      await userEvent.type(canvas.getByPlaceholderText("Ask anything..."), "Hello")
      await expect(canvas.getByRole("button", { name: /send|submit/i })).not.toBeDisabled()
    })
  },
}
