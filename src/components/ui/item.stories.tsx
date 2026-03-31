import { FileTextIcon, MoreHorizontalIcon, StarIcon } from "lucide-react"
import { expect, within } from "storybook/test"

import { Button } from "./button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "./item"

import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta<typeof Item> = {
  title: "Components/Item",
  component: Item,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "outline", "muted"],
    },
    size: {
      control: { type: "select" },
      options: ["default", "sm", "xs"],
    },
  },
  args: {
    variant: "default",
    size: "default",
  },
}

export default meta

type Story = StoryObj<typeof Item>

function renderItem(args: Story["args"]) {
  return (
    <Item {...args} className="w-[440px]">
      <ItemMedia variant="icon">
        <FileTextIcon />
      </ItemMedia>
      <ItemContent>
        <ItemHeader>
          <ItemTitle>Quarterly analytics summary</ItemTitle>
          <ItemActions>
            <StarIcon className="size-4 text-muted-foreground" />
            <Button size="icon-xs" variant="ghost">
              <MoreHorizontalIcon />
              <span className="sr-only">More actions</span>
            </Button>
          </ItemActions>
        </ItemHeader>
        <ItemDescription>
          Review the latest dashboard exports and share them with the team.
        </ItemDescription>
      </ItemContent>
    </Item>
  )
}

export const Default: Story = {
  render: renderItem,
  parameters: {
    zephyr: { testCaseId: "SW-T1260" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Item title, description, and actions render", async () => {
      expect(canvas.getByText("Quarterly analytics summary")).toBeInTheDocument()
      expect(
        canvas.getByText(
          "Review the latest dashboard exports and share them with the team.",
        ),
      ).toBeInTheDocument()
      expect(canvas.getByText("More actions")).toBeInTheDocument()
    })
  },
}

export const Outline: Story = {
  args: {
    variant: "outline",
  },
  render: renderItem,
  parameters: {
    zephyr: { testCaseId: "SW-T1261" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Item title and description render", async () => {
      expect(canvas.getByText("Quarterly analytics summary")).toBeInTheDocument()
      expect(
        canvas.getByText(
          "Review the latest dashboard exports and share them with the team.",
        ),
      ).toBeInTheDocument()
    })
  },
}

export const Muted: Story = {
  args: {
    variant: "muted",
  },
  render: renderItem,
  parameters: {
    zephyr: { testCaseId: "SW-T1262" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Item title and description render", async () => {
      expect(canvas.getByText("Quarterly analytics summary")).toBeInTheDocument()
      expect(
        canvas.getByText(
          "Review the latest dashboard exports and share them with the team.",
        ),
      ).toBeInTheDocument()
    })
  },
}

export const Small: Story = {
  args: {
    size: "sm",
  },
  render: renderItem,
  parameters: {
    zephyr: { testCaseId: "SW-T1263" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Item title and description render", async () => {
      expect(canvas.getByText("Quarterly analytics summary")).toBeInTheDocument()
      expect(
        canvas.getByText(
          "Review the latest dashboard exports and share them with the team.",
        ),
      ).toBeInTheDocument()
    })
  },
}

export const ExtraSmall: Story = {
  args: {
    size: "xs",
  },
  render: renderItem,
  parameters: {
    zephyr: { testCaseId: "SW-T1264" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Item title and description render", async () => {
      expect(canvas.getByText("Quarterly analytics summary")).toBeInTheDocument()
      expect(
        canvas.getByText(
          "Review the latest dashboard exports and share them with the team.",
        ),
      ).toBeInTheDocument()
    })
  },
}

export const ImageMedia: Story = {
  render: () => (
    <Item variant="outline" className="w-[440px]">
      <ItemMedia variant="image">
        <img
          alt="Preview"
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' rx='8' fill='%23d4d4d8'/%3E%3Cpath d='M18 54l12-12 10 10 14-18 8 20H18z' fill='%239ca3af'/%3E%3Ccircle cx='28' cy='26' r='6' fill='white'/%3E%3C/svg%3E"
        />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Generated preview image</ItemTitle>
        <ItemDescription>
          Item media can also render thumbnail images for richer list layouts.
        </ItemDescription>
      </ItemContent>
    </Item>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1265" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Image media item title and description render", async () => {
      expect(canvas.getByText("Generated preview image")).toBeInTheDocument()
      expect(
        canvas.getByText(
          "Item media can also render thumbnail images for richer list layouts.",
        ),
      ).toBeInTheDocument()
    })

    await step("Preview image is present", async () => {
      expect(canvas.getByRole("img", { name: "Preview" })).toBeInTheDocument()
    })
  },
}