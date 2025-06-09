import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Icon, IconName } from "../Icon";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "tertiary"],
    },
    size: {
      control: { type: "select" },
      options: ["small", "medium"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Basic examples
export const Primary: Story = {
  args: {
    children: "Primary Button",
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary Button",
    variant: "secondary",
  },
};

export const Tertiary: Story = {
  args: {
    children: "Tertiary Button",
    variant: "tertiary",
  },
};

// Size examples
export const Small: Story = {
  args: {
    children: "Small Button",
    size: "small",
  },
};

export const Medium: Story = {
  args: {
    children: "Medium Button",
    size: "medium",
  },
};

// State examples
export const Disabled: Story = {
  args: {
    children: "Disabled Button",
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    children: "Loading Button",
    loading: true,
  },
};

// With icons
export const WithLeftIcon: Story = {
  args: {
    children: "Search",
    leftIcon: <Icon name={IconName.SEARCH} />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: "Next",
    rightIcon: <Icon name={IconName.CHEVRON_DOWN} />,
  },
};

export const WithBothIcons: Story = {
  args: {
    children: "Search and Continue",
    leftIcon: <Icon name={IconName.SEARCH} />,
    rightIcon: <Icon name={IconName.CHEVRON_DOWN} />,
  },
};

// Icon only button
export const IconOnly: Story = {
  args: {
    leftIcon: <Icon name={IconName.SEARCH} />,
    "aria-label": "Search",
  },
};

export const FullWidth: Story = {
  args: {
    children: "Full Width Button",
    fullWidth: true,
  },
};
