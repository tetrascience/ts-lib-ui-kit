import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./Label";

const meta: Meta<typeof Label> = {
  title: "Atoms/Label",
  component: Label,
  tags: ["autodocs"],
  argTypes: {
    children: { control: "text" },
    infoText: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    children: "Label",
  },
};

export const WithInfoIcon: Story = {
  args: {
    children: "Label",
    infoText: "This is additional information about the label",
  },
};

export const Complete: Story = {
  args: {
    children: "Label",
    infoText: "This is additional information about the label",
  },
};
