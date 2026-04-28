import { expect, userEvent, within } from "storybook/test"

import {
  Snippet,
  SnippetAddon,
  SnippetCopyButton,
  SnippetInput,
  SnippetText,
} from "./snippet"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta = {
  title: "AI Elements/Snippet",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj

export const Default: Story = {
  render: () => (
    <div className="w-96">
      <Snippet code="npm install @tetrascience/react-ui">
        <SnippetInput />
        <SnippetCopyButton />
      </Snippet>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Renders the code value", async () => {
      await expect(canvas.getByDisplayValue("npm install @tetrascience/react-ui")).toBeInTheDocument()
    })
    await step("Copy button is present", async () => {
      await expect(canvas.getByRole("button", { name: /copy/i })).toBeInTheDocument()
    })
  },
}

export const WithPrefix: Story = {
  render: () => (
    <div className="w-96">
      <Snippet code="npx shadcn@latest add button">
        <SnippetAddon>
          <SnippetText>$</SnippetText>
        </SnippetAddon>
        <SnippetInput />
        <SnippetCopyButton />
      </Snippet>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Prefix and code render", async () => {
      await expect(canvas.getByText("$")).toBeInTheDocument()
      await expect(canvas.getByDisplayValue("npx shadcn@latest add button")).toBeInTheDocument()
    })
  },
}

export const Equation: Story = {
  render: () => (
    <div className="w-96">
      <Snippet code="6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂">
        <SnippetInput />
        <SnippetCopyButton />
      </Snippet>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Equation renders", async () => {
      await expect(canvas.getByDisplayValue(/6CO₂/)).toBeInTheDocument()
    })
  },
}

export const CopyFeedback: Story = {
  render: () => (
    <div className="w-96">
      <Snippet code="yarn dev">
        <SnippetInput />
        <SnippetCopyButton />
      </Snippet>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Clicking copy shows check icon briefly", async () => {
      const button = canvas.getByRole("button", { name: /copy/i })
      await userEvent.click(button)
      await expect(button).toBeInTheDocument()
    })
  },
}
