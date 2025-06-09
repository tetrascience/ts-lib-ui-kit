import { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Atoms/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["xsmall", "small"],
    },
    error: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Placeholder",
  },
};

export const Small: Story = {
  args: {
    placeholder: "Placeholder",
    size: "small",
  },
};

export const XSmall: Story = {
  args: {
    placeholder: "Placeholder",
    size: "xsmall",
  },
};

export const Error: Story = {
  args: {
    placeholder: "Placeholder",
    error: true,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Placeholder",
    disabled: true,
  },
};
