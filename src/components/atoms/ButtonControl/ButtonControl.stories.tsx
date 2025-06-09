import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { ButtonControl } from "./ButtonControl";

const meta: Meta<typeof ButtonControl> = {
  title: "Atoms/ButtonControl",
  component: ButtonControl,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    selected: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ButtonControl>;

// SVG Icons
const Icon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="4" y="4" width="12" height="12" rx="2" fill="currentColor" />
  </svg>
);

export const Default: Story = {
  args: {
    icon: <Icon />,
  },
};

export const Selected: Story = {
  args: {
    icon: <Icon />,
    selected: true,
  },
};

export const Disabled: Story = {
  args: {
    icon: <Icon />,
    disabled: true,
  },
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "12px" }}>
      <ButtonControl icon={<Icon />} />
      <ButtonControl icon={<Icon />} selected />
      <ButtonControl icon={<Icon />} disabled />
    </div>
  ),
};
