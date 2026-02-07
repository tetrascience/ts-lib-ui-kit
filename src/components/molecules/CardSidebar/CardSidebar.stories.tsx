import { Meta, StoryObj } from "@storybook/react";
import CardSidebar from "./CardSidebar";

const meta: Meta<typeof CardSidebar> = {
  title: "Molecules/CardSidebar",
  component: CardSidebar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["default", "active", "hover", "disabled"],
    },
    onButtonClick: { action: "button clicked" },
    onLinkClick: { action: "link clicked" },
  },
};

export default meta;
type Story = StoryObj<typeof CardSidebar>;

export const Default: Story = {
  name: "[SW-T880] Default",
  args: {
    title: "Title",
    description: "Description",
    buttonText: "Button",
    linkText: "Link",
    status: "default",
  },
};

export const WithoutButton: Story = {
  name: "[SW-T881] Without Button",
  args: {
    title: "Title",
    description: "Description",
    linkText: "Link",
    status: "default",
  },
};

export const WithoutLink: Story = {
  name: "[SW-T882] Without Link",
  args: {
    title: "Title",
    description: "Description",
    buttonText: "Button",
    status: "default",
  },
};

export const Active: Story = {
  name: "[SW-T883] Active",
  args: {
    title: "Title",
    description: "Description",
    buttonText: "Button",
    linkText: "Link",
    status: "active",
  },
};

export const Hover: Story = {
  name: "[SW-T884] Hover",
  args: {
    title: "Title",
    description: "Description",
    buttonText: "Button",
    linkText: "Link",
    status: "hover",
  },
};

export const Disabled: Story = {
  name: "[SW-T885] Disabled",
  args: {
    title: "Title",
    description: "Description",
    buttonText: "Button",
    linkText: "Link",
    status: "disabled",
  },
};

export const WithoutDescription: Story = {
  name: "[SW-T886] Without Description",
  args: {
    title: "Title",
    buttonText: "Button",
    linkText: "Link",
  },
};

export const LinkOnly: Story = {
  name: "[SW-T887] Link Only",
  args: {
    title: "Title",
    description: "Description with link only, no button",
    linkText: "Link",
  },
};

export const ButtonOnly: Story = {
  name: "[SW-T888] Button Only",
  args: {
    title: "Title",
    description: "Description with button only, no link",
    buttonText: "Button",
  },
};

export const TitleOnly: Story = {
  name: "[SW-T889] Title Only",
  args: {
    title: "Title Only",
    description: "No actions available on this card",
  },
};

export const CustomText: Story = {
  name: "[SW-T890] Custom Text",
  args: {
    title: "Custom Title",
    description: "This is a custom description that explains what this card does.",
    buttonText: "Action",
    linkText: "Learn more",
  },
};

export const AllVariants: Story = {
  name: "[SW-T891] All Variants",
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "400px",
      }}
    >
      <CardSidebar title="Title" description="Description" buttonText="Button" linkText="Link" status="default" />
      <CardSidebar title="Title" description="Description" buttonText="Button" linkText="Link" status="active" />
      <CardSidebar title="Title" description="Description" buttonText="Button" linkText="Link" status="hover" />
      <CardSidebar title="Title" description="Description" buttonText="Button" linkText="Link" status="disabled" />
    </div>
  ),
};

export const ActionVariations: Story = {
  name: "[SW-T892] Action Variations",
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "400px",
      }}
    >
      <CardSidebar
        title="With Both"
        description="This card has both button and link"
        buttonText="Button"
        linkText="Link"
      />
      <CardSidebar title="Button Only" description="This card has only a button" buttonText="Button" />
      <CardSidebar title="Link Only" description="This card has only a link" linkText="Link" />
      <CardSidebar title="No Actions" description="This card has no button or link" />
    </div>
  ),
};

export const WithoutButtonAndLink: Story = {
  name: "[SW-T893] Without Button And Link",
  args: {
    title: "Title",
    description: "Description with no button and no link",
    status: "default",
  },
};
