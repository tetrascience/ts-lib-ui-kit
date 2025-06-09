import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./Textarea";

const meta: Meta<typeof Textarea> = {
  title: "Atoms/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

// Default textarea
export const Default: Story = {
  args: {
    placeholder: "Enter text here...",
  },
};

// XSmall size
export const XSmall: Story = {
  args: {
    placeholder: "Enter text here...",
    size: "xsmall",
  },
};

// Small size
export const Small: Story = {
  args: {
    placeholder: "Enter text here...",
    size: "small",
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    placeholder: "This textarea is disabled",
    disabled: true,
  },
};

// Error state
export const Error: Story = {
  args: {
    placeholder: "Enter text here...",
    error: true,
  },
};

// With value
export const WithValue: Story = {
  args: {
    value:
      "This is a textarea with some initial value that shows how the text would look when filled in by the user.",
    rows: 5,
  },
};

// Full width
export const FullWidth: Story = {
  args: {
    placeholder: "Full width textarea",
    fullWidth: true,
  },
  parameters: {
    layout: "padded",
  },
};
