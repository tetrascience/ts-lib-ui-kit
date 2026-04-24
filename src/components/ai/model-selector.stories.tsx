import { useState } from "react"
import { expect, screen, userEvent, within } from "storybook/test"

import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorDialog,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorSeparator,
  ModelSelectorShortcut,
  ModelSelectorTrigger,
} from "./model-selector"

import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "@/components/ui/button"
import { Command } from "@/components/ui/command"




const meta: Meta = {
  title: "AI Elements/Model Selector",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj

const models = [
  { id: "claude-opus-4", name: "Claude Opus 4", provider: "anthropic" as const },
  { id: "gpt-4o", name: "GPT-4o", provider: "openai" as const },
  { id: "gemini-2", name: "Gemini 2", provider: "google" as const },
]

export const Default: Story = {
  render: () => {
    const Example = () => {
      const [open, setOpen] = useState(false)
      const [selected, setSelected] = useState(models[0])

      return (
        <>
          <ModelSelector onOpenChange={setOpen} open={open}>
            <ModelSelectorTrigger asChild>
              <Button variant="outline">
                <ModelSelectorLogoGroup>
                  <ModelSelectorLogo provider={selected.provider} />
                </ModelSelectorLogoGroup>
                <ModelSelectorName>{selected.name}</ModelSelectorName>
              </Button>
            </ModelSelectorTrigger>
            <ModelSelectorContent>
              <ModelSelectorInput placeholder="Search models…" />
              <ModelSelectorList>
                <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                <ModelSelectorGroup heading="Available models">
                  {models.map((m) => (
                    <ModelSelectorItem
                      key={m.id}
                      onSelect={() => {
                        setSelected(m)
                        setOpen(false)
                      }}
                      value={m.name}
                    >
                      <ModelSelectorLogo provider={m.provider} />
                      <ModelSelectorName>{m.name}</ModelSelectorName>
                      <ModelSelectorShortcut>⌘{m.id[0]}</ModelSelectorShortcut>
                    </ModelSelectorItem>
                  ))}
                </ModelSelectorGroup>
                <ModelSelectorSeparator />
                <ModelSelectorGroup heading="Actions">
                  <ModelSelectorItem value="settings">
                    Settings
                  </ModelSelectorItem>
                </ModelSelectorGroup>
              </ModelSelectorList>
            </ModelSelectorContent>
          </ModelSelector>
        </>
      )
    }

    return <Example />
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Trigger button renders selected model", async () => {
      await expect(canvas.getByText("Claude Opus 4")).toBeInTheDocument()
    })

    await step("Opening dialog shows models list", async () => {
      await userEvent.click(canvas.getByRole("button"))
      await screen.findByPlaceholderText("Search models…")
      await expect(screen.getByText("Available models")).toBeInTheDocument()
      await expect(screen.getByText("GPT-4o")).toBeInTheDocument()
    })

    await step("Selecting a model updates trigger", async () => {
      await userEvent.click(screen.getByText("GPT-4o"))
      await expect(canvas.getByText("GPT-4o")).toBeInTheDocument()
    })
  },
}

export const EmptySearch: Story = {
  render: () => {
    const Example = () => (
      <ModelSelector defaultOpen>
        <ModelSelectorTrigger asChild>
          <Button variant="outline">Open</Button>
        </ModelSelectorTrigger>
        <ModelSelectorContent>
          <ModelSelectorInput placeholder="Search models…" />
          <ModelSelectorList>
            <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
            <ModelSelectorGroup heading="Available">
              {models.map((m) => (
                <ModelSelectorItem key={m.id} value={m.name}>
                  {m.name}
                </ModelSelectorItem>
              ))}
            </ModelSelectorGroup>
          </ModelSelectorList>
        </ModelSelectorContent>
      </ModelSelector>
    )

    return <Example />
  },
  play: async ({ step }) => {
    await step("Searching for nonexistent model shows empty state", async () => {
      const input = await screen.findByPlaceholderText("Search models…")
      await userEvent.type(input, "zzznothing")
      await expect(await screen.findByText("No models found.")).toBeInTheDocument()
    })
  },
}

export const UsingCommandDialog: Story = {
  render: () => {
    const Example = () => {
      const [open, setOpen] = useState(true)
      return (
        <ModelSelectorDialog onOpenChange={setOpen} open={open} title="Pick a model">
          <Command>
            <ModelSelectorInput placeholder="Type a model…" />
            <ModelSelectorList>
              <ModelSelectorEmpty>No matches.</ModelSelectorEmpty>
              <ModelSelectorGroup heading="Models">
                {models.map((m) => (
                  <ModelSelectorItem key={m.id} value={m.name}>
                    <ModelSelectorLogoGroup>
                      <ModelSelectorLogo provider={m.provider} />
                      <ModelSelectorLogo provider="vercel" />
                    </ModelSelectorLogoGroup>
                    <ModelSelectorName>{m.name}</ModelSelectorName>
                  </ModelSelectorItem>
                ))}
              </ModelSelectorGroup>
            </ModelSelectorList>
          </Command>
        </ModelSelectorDialog>
      )
    }

    return <Example />
  },
  play: async ({ step }) => {
    await step("CommandDialog opens with model list", async () => {
      await expect(await screen.findByPlaceholderText("Type a model…")).toBeInTheDocument()
      await expect(screen.getByText("Models")).toBeInTheDocument()
    })
  },
}
