import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { CardSidebar } from "./CardSidebar";

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
  args: {
    title: "Title",
    description: "Description",
    buttonText: "Button",
    linkText: "Link",
    status: "default",
  },
};

export const WithoutButton: Story = {
  args: {
    title: "Title",
    description: "Description",
    linkText: "Link",
    status: "default",
  },
};

export const WithoutLink: Story = {
  args: {
    title: "Title",
    description: "Description",
    buttonText: "Button",
    status: "default",
  },
};

export const Active: Story = {
  args: {
    title: "Title",
    description: "Description",
    buttonText: "Button",
    linkText: "Link",
    status: "active",
  },
};

export const Hover: Story = {
  args: {
    title: "Title",
    description: "Description",
    buttonText: "Button",
    linkText: "Link",
    status: "hover",
  },
};

export const Disabled: Story = {
  args: {
    title: "Title",
    description: "Description",
    buttonText: "Button",
    linkText: "Link",
    status: "disabled",
  },
};

export const WithoutDescription: Story = {
  args: {
    title: "Title",
    buttonText: "Button",
    linkText: "Link",
  },
};

export const LinkOnly: Story = {
  args: {
    title: "Title",
    description: "Description with link only, no button",
    linkText: "Link",
  },
};

export const ButtonOnly: Story = {
  args: {
    title: "Title",
    description: "Description with button only, no link",
    buttonText: "Button",
  },
};

export const TitleOnly: Story = {
  args: {
    title: "Title Only",
    description: "No actions available on this card",
  },
};

export const CustomText: Story = {
  args: {
    title: "Custom Title",
    description:
      "This is a custom description that explains what this card does.",
    buttonText: "Action",
    linkText: "Learn more",
  },
};

export const AllVariants: Story = {
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
        title="Title"
        description="Description"
        buttonText="Button"
        linkText="Link"
        status="default"
      />
      <CardSidebar
        title="Title"
        description="Description"
        buttonText="Button"
        linkText="Link"
        status="active"
      />
      <CardSidebar
        title="Title"
        description="Description"
        buttonText="Button"
        linkText="Link"
        status="hover"
      />
      <CardSidebar
        title="Title"
        description="Description"
        buttonText="Button"
        linkText="Link"
        status="disabled"
      />
    </div>
  ),
};

export const ActionVariations: Story = {
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
      <CardSidebar
        title="Button Only"
        description="This card has only a button"
        buttonText="Button"
      />
      <CardSidebar
        title="Link Only"
        description="This card has only a link"
        linkText="Link"
      />
      <CardSidebar
        title="No Actions"
        description="This card has no button or link"
      />
    </div>
  ),
};

export const WithoutButtonAndLink: Story = {
  args: {
    title: "Title",
    description: "Description with no button and no link",
    status: "default",
  },
};
