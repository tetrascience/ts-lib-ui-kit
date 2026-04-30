import { expect, within } from "storybook/test"

import { SpeechInput } from "./speech-input"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof SpeechInput> = {
  title: "AI Elements/Speech Input",
  component: SpeechInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof SpeechInput>

export const Default: Story = {
  args: {},
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Speech input button renders", async () => {
      await expect(canvas.getByRole("button")).toBeInTheDocument()
    })
  },
}

export const WithTranscriptionHandler: Story = {
  args: {
    onTranscriptionChange: (text: string) => {
      console.log("Transcript:", text)
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Button renders with transcription handler", async () => {
      await expect(canvas.getByRole("button")).toBeInTheDocument()
    })
  },
}

export const GhostVariant: Story = {
  args: {
    variant: "ghost",
    size: "icon-sm",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Ghost variant speech input renders", async () => {
      await expect(canvas.getByRole("button")).toBeInTheDocument()
    })
  },
}

export const InPromptContext: Story = {
  render: () => (
    <div className="flex items-center gap-2 rounded-lg border p-2">
      <span className="text-muted-foreground text-sm">Say something…</span>
      <SpeechInput
        onTranscriptionChange={(text) => console.log(text)}
        size="icon-sm"
        variant="ghost"
      />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Speech input renders in prompt context", async () => {
      await expect(canvas.getByText("Say something…")).toBeInTheDocument()
      await expect(canvas.getByRole("button")).toBeInTheDocument()
    })
  },
}
