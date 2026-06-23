import { FileTextIcon, MoreHorizontalIcon, StarIcon } from "lucide-react";
import { expect, within } from "storybook/test";

import { Button } from "./button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "./item";

import type { Meta, StoryObj } from "@storybook/react-vite";

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
};

export default meta;

type Story = StoryObj<typeof Item>;

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
        <ItemDescription>Review the latest dashboard exports and share them with the team.</ItemDescription>
      </ItemContent>
    </Item>
  );
}

export const Default: Story = {
  render: renderItem,
  parameters: {
    zephyr: { testCaseId: "SW-T1260" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Item title, description, and actions render", async () => {
      expect(canvas.getByText("Quarterly analytics summary")).toBeInTheDocument();
      expect(canvas.getByText("Review the latest dashboard exports and share them with the team.")).toBeInTheDocument();
      expect(canvas.getByText("More actions")).toBeInTheDocument();
    });
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
  },
  render: renderItem,
  parameters: {
    zephyr: { testCaseId: "SW-T1261" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Item title and description render", async () => {
      expect(canvas.getByText("Quarterly analytics summary")).toBeInTheDocument();
      expect(canvas.getByText("Review the latest dashboard exports and share them with the team.")).toBeInTheDocument();
    });
  },
};

export const Muted: Story = {
  args: {
    variant: "muted",
  },
  render: renderItem,
  parameters: {
    zephyr: { testCaseId: "SW-T1262" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Item title and description render", async () => {
      expect(canvas.getByText("Quarterly analytics summary")).toBeInTheDocument();
      expect(canvas.getByText("Review the latest dashboard exports and share them with the team.")).toBeInTheDocument();
    });
  },
};

export const Small: Story = {
  args: {
    size: "sm",
  },
  render: renderItem,
  parameters: {
    zephyr: { testCaseId: "SW-T1263" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Item title and description render", async () => {
      expect(canvas.getByText("Quarterly analytics summary")).toBeInTheDocument();
      expect(canvas.getByText("Review the latest dashboard exports and share them with the team.")).toBeInTheDocument();
    });
  },
};

export const ExtraSmall: Story = {
  args: {
    size: "xs",
  },
  render: renderItem,
  parameters: {
    zephyr: { testCaseId: "SW-T1264" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Item title and description render", async () => {
      expect(canvas.getByText("Quarterly analytics summary")).toBeInTheDocument();
      expect(canvas.getByText("Review the latest dashboard exports and share them with the team.")).toBeInTheDocument();
    });
  },
};

export const MediaVariants: Story = {
  render: () => (
    <div className="flex w-[440px] flex-col gap-2">
      <Item variant="outline">
        <ItemMedia data-testid="media-default" className="text-primary">
          <span aria-hidden>•</span>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Default media</ItemTitle>
        </ItemContent>
      </Item>
      <Item variant="outline">
        <ItemMedia variant="icon" data-testid="media-icon">
          <FileTextIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Icon media</ItemTitle>
        </ItemContent>
      </Item>
      <Item variant="outline">
        <ItemMedia variant="image" data-testid="media-image">
          <img
            alt="Thumbnail"
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23d4d4d8'/%3E%3C/svg%3E"
          />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Image media</ItemTitle>
          <ItemDescription>Thumbnail layout for media slots.</ItemDescription>
        </ItemContent>
      </Item>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Default media variant renders transparent media slot", async () => {
      const media = canvas.getByTestId("media-default");
      expect(media).toHaveAttribute("data-slot", "item-media");
      expect(media).toHaveAttribute("data-variant", "default");
      expect(media).toHaveClass("bg-transparent");
    });

    await step("Custom className is merged onto the media slot", async () => {
      expect(canvas.getByTestId("media-default")).toHaveClass("text-primary");
    });

    await step("Icon media variant sizes nested svg icons", async () => {
      const media = canvas.getByTestId("media-icon");
      expect(media).toHaveAttribute("data-variant", "icon");
      expect(media).toHaveClass("[&_svg:not([class*='size-'])]:size-4");
      expect(media.querySelector("svg")).not.toBeNull();
    });

    await step("Image media variant clips and rounds its thumbnail", async () => {
      const media = canvas.getByTestId("media-image");
      expect(media).toHaveAttribute("data-variant", "image");
      expect(media).toHaveClass("size-10", "overflow-hidden", "rounded-sm");
      expect(within(media).getByRole("img", { name: "Thumbnail" })).toBeInTheDocument();
    });

    await step("Media aligns to start when a description is present", async () => {
      const media = canvas.getByTestId("media-image");
      expect(media).toHaveClass("group-has-data-[slot=item-description]/item:self-start");
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5410" },
  },
};

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
        <ItemDescription>Item media can also render thumbnail images for richer list layouts.</ItemDescription>
      </ItemContent>
    </Item>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T1265" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Image media item title and description render", async () => {
      expect(canvas.getByText("Generated preview image")).toBeInTheDocument();
      expect(
        canvas.getByText("Item media can also render thumbnail images for richer list layouts."),
      ).toBeInTheDocument();
    });

    await step("Preview image is present", async () => {
      expect(canvas.getByRole("img", { name: "Preview" })).toBeInTheDocument();
    });
  },
};

export const GroupedItems: Story = {
  render: () => (
    <ItemGroup className="w-[440px]">
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Weekly throughput report</ItemTitle>
          <ItemDescription>Aggregated instrument runs for the past week.</ItemDescription>
        </ItemContent>
        <ItemFooter data-testid="item-footer">
          <span>Updated 2 hours ago</span>
          <span>1.2 MB</span>
        </ItemFooter>
      </Item>
      <ItemSeparator data-testid="item-separator" />
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Plate map archive</ItemTitle>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Item group renders as a list containing both items", async () => {
      const group = canvas.getByRole("list");
      expect(group).toHaveAttribute("data-slot", "item-group");
      expect(group).toHaveClass("flex", "flex-col", "gap-4");
      // The w-[440px] override replaces the default w-full via tailwind-merge
      expect(group).toHaveClass("w-[440px]");
      expect(group).not.toHaveClass("w-full");
      expect(within(group).getByText("Weekly throughput report")).toBeInTheDocument();
      expect(within(group).getByText("Plate map archive")).toBeInTheDocument();
    });

    await step("Item separator renders horizontally between items", async () => {
      const separator = canvas.getByTestId("item-separator");
      expect(separator).toHaveAttribute("data-slot", "item-separator");
      expect(separator).toHaveAttribute("data-orientation", "horizontal");
      expect(separator).toHaveClass("my-2");
    });

    await step("Item footer spans the full width with spaced metadata", async () => {
      const footer = canvas.getByTestId("item-footer");
      expect(footer).toHaveAttribute("data-slot", "item-footer");
      expect(footer).toHaveClass("basis-full", "items-center", "justify-between");
      expect(within(footer).getByText("Updated 2 hours ago")).toBeInTheDocument();
      expect(within(footer).getByText("1.2 MB")).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5411" },
  },
};
