import { expect, within } from "storybook/test"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./combobox"

import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ComponentProps } from "react"

const frameworks = ["Next.js", "SvelteKit", "Nuxt", "Remix", "Astro"] as const

const meta: Meta<typeof ComboboxInput> = {
  title: "Components/Combobox",
  component: ComboboxInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    showTrigger: {
      control: { type: "boolean" },
    },
    showClear: {
      control: { type: "boolean" },
    },
  },
  args: {
    showTrigger: true,
    showClear: false,
  },
}

export default meta

type Story = StoryObj<typeof ComboboxInput>

type ComboboxContentProps = ComponentProps<typeof ComboboxContent>

function renderCombobox(
  args: Story["args"],
  contentProps?: Partial<ComboboxContentProps>,
) {
  return (
    <Combobox items={frameworks}>
      <ComboboxInput {...args} className="w-[240px]" placeholder="Choose a framework" />
      <ComboboxContent {...contentProps}>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export const Default: Story = {
  render: (args) => renderCombobox(args),
  parameters: {
    zephyr: { testCaseId: "SW-T1221" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Combobox input and placeholder render", async () => {
      expect(canvas.getByPlaceholderText("Choose a framework")).toBeInTheDocument()
      expect(canvas.getByRole("combobox")).toBeInTheDocument()
    })

    await step("Combobox role is accessible", async () => {
      expect(canvas.getByRole("combobox")).toBeInTheDocument()
    })
  },
}

export const WithClearButton: Story = {
  args: {
    showClear: true,
  },
  render: (args) => renderCombobox(args),
  parameters: {
    zephyr: { testCaseId: "SW-T1222" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Combobox renders with placeholder", async () => {
      expect(canvas.getByPlaceholderText("Choose a framework")).toBeInTheDocument()
    })

    await step("Combobox role is accessible", async () => {
      expect(canvas.getByRole("combobox")).toBeInTheDocument()
    })
  },
}

export const WithoutTrigger: Story = {
  args: {
    showTrigger: false,
  },
  render: (args) => renderCombobox(args),
  parameters: {
    zephyr: { testCaseId: "SW-T1223" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Combobox input renders", async () => {
      expect(canvas.getByPlaceholderText("Choose a framework")).toBeInTheDocument()
      expect(canvas.getByRole("combobox")).toBeInTheDocument()
    })

    await step("Dropdown trigger hidden", async () => {
      expect(canvasElement.querySelector('[data-slot="combobox-trigger"]')).not.toBeInTheDocument()
    })
  },
}

export const TopAlignedEnd: Story = {
  render: (args) =>
    renderCombobox(args, {
      align: "end",
      side: "top",
    }),
  parameters: {
    zephyr: { testCaseId: "SW-T1224" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Combobox renders for top alignment", async () => {
      expect(canvas.getByPlaceholderText("Choose a framework")).toBeInTheDocument()
      expect(canvas.getByRole("combobox")).toBeInTheDocument()
    })
  },
}