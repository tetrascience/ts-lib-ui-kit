import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Icon, IconName } from "./../../atoms/Icon";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Atoms/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    children: { control: "text" },
    size: {
      control: { type: "select" },
      options: ["small", "medium"],
    },
    variant: {
      control: { type: "select" },
      options: ["default", "primary"],
    },
    disabled: { control: "boolean" },
    iconLeft: { control: "boolean" },
    iconRight: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: "Badge",
    variant: "default",
    size: "medium",
  },
};

export const Primary: Story = {
  args: {
    children: "Badge",
    variant: "primary",
    size: "medium",
  },
};

export const Small: Story = {
  args: {
    children: "Badge",
    variant: "default",
    size: "small",
  },
};

export const SmallPrimary: Story = {
  args: {
    children: "Badge",
    variant: "primary",
    size: "small",
  },
};

export const Disabled: Story = {
  args: {
    children: "Badge",
    variant: "default",
    size: "medium",
    disabled: true,
  },
};

export const DisabledPrimary: Story = {
  args: {
    children: "Badge",
    variant: "primary",
    size: "medium",
    disabled: true,
  },
};

export const WithLeftIcon: Story = {
  args: {
    children: "Search",
    variant: "default",
    size: "medium",
    iconLeft: <Icon name={IconName.SEARCH} />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: "Next",
    variant: "primary",
    size: "medium",
    iconRight: <Icon name={IconName.CLOSE} />,
  },
};

export const WithBothIcons: Story = {
  args: {
    children: "Navigate",
    variant: "default",
    size: "medium",
    iconLeft: <Icon name={IconName.SEARCH} />,
    iconRight: <Icon name={IconName.CLOSE} />,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
      <Badge variant="default" size="medium">
        Badge
      </Badge>
      <Badge variant="primary" size="medium">
        Badge
      </Badge>
      <Badge variant="default" size="small">
        Badge
      </Badge>
      <Badge variant="primary" size="small">
        Badge
      </Badge>
      <Badge variant="default" size="medium" disabled>
        Badge
      </Badge>
      <Badge variant="primary" size="medium" disabled>
        Badge
      </Badge>
      <Badge
        variant="default"
        size="medium"
        iconLeft={<Icon name={IconName.SEARCH} />}
      >
        With Icon
      </Badge>
      <Badge
        variant="primary"
        size="medium"
        iconRight={<Icon name={IconName.CLOSE} />}
      >
        With Icon
      </Badge>
    </div>
  ),
};
