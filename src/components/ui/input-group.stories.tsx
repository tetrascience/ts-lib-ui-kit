import { SearchIcon } from "lucide-react"
import { expect, within } from "storybook/test"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "./input-group"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof InputGroup> = {
  title: "Components/InputGroup",
  component: InputGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof InputGroup>

function renderAddon(align: "inline-start" | "inline-end" | "block-start" | "block-end") {
  const addon = (
    <InputGroupAddon align={align}>
      <InputGroupText>https://</InputGroupText>
    </InputGroupAddon>
  )

  return (
    <div className="w-[320px]">
      <InputGroup>
        {(align === "inline-start" || align === "block-start") && addon}
        <InputGroupInput placeholder="app.tetrascience.com" />
        {(align === "inline-end" || align === "block-end") && addon}
      </InputGroup>
    </div>
  )
}

function renderButton(size: "xs" | "sm" | "icon-xs" | "icon-sm") {
  const isIcon = size === "icon-xs" || size === "icon-sm"

  return (
    <div className="w-[320px]">
      <InputGroup>
        <InputGroupInput placeholder="Search" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size={size}>
            {isIcon ? <SearchIcon /> : "Go"}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

export const InlineStart: Story = {
  render: () => renderAddon("inline-start"),
  parameters: {
    zephyr: { testCaseId: "SW-T1247" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Addon prefix and input render", async () => {
      expect(canvas.getByText("https://")).toBeInTheDocument()
      expect(canvas.getByPlaceholderText("app.tetrascience.com")).toBeInTheDocument()
    })
  },
}

export const InlineEnd: Story = {
  render: () => renderAddon("inline-end"),
  parameters: {
    zephyr: { testCaseId: "SW-T1248" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Addon suffix and input render", async () => {
      expect(canvas.getByText("https://")).toBeInTheDocument()
      expect(canvas.getByPlaceholderText("app.tetrascience.com")).toBeInTheDocument()
    })
  },
}

export const BlockStart: Story = {
  render: () => renderAddon("block-start"),
  parameters: {
    zephyr: { testCaseId: "SW-T1249" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Block-start addon and input render", async () => {
      expect(canvas.getByText("https://")).toBeInTheDocument()
      expect(canvas.getByPlaceholderText("app.tetrascience.com")).toBeInTheDocument()
    })
  },
}

export const BlockEnd: Story = {
  render: () => renderAddon("block-end"),
  parameters: {
    zephyr: { testCaseId: "SW-T1250" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Block-end addon and input render", async () => {
      expect(canvas.getByText("https://")).toBeInTheDocument()
      expect(canvas.getByPlaceholderText("app.tetrascience.com")).toBeInTheDocument()
    })
  },
}

export const ButtonXs: Story = {
  render: () => renderButton("xs"),
  parameters: {
    zephyr: { testCaseId: "SW-T1251" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Search input and Go button render", async () => {
      expect(canvas.getByPlaceholderText("Search")).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Go" })).toBeInTheDocument()
    })
  },
}

export const ButtonSm: Story = {
  render: () => renderButton("sm"),
  parameters: {
    zephyr: { testCaseId: "SW-T1252" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Search input and Go button render", async () => {
      expect(canvas.getByPlaceholderText("Search")).toBeInTheDocument()
      expect(canvas.getByRole("button", { name: "Go" })).toBeInTheDocument()
    })
  },
}

export const ButtonIconXs: Story = {
  render: () => renderButton("icon-xs"),
  parameters: {
    zephyr: { testCaseId: "SW-T1253" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Search input and icon suffix button render", async () => {
      expect(canvas.getByPlaceholderText("Search")).toBeInTheDocument()
      expect(canvas.getByRole("button")).toBeInTheDocument()
    })
  },
}

export const ButtonIconSm: Story = {
  render: () => renderButton("icon-sm"),
  parameters: {
    zephyr: { testCaseId: "SW-T1254" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Search input and icon suffix button render", async () => {
      expect(canvas.getByPlaceholderText("Search")).toBeInTheDocument()
      expect(canvas.getByRole("button")).toBeInTheDocument()
    })
  },
}