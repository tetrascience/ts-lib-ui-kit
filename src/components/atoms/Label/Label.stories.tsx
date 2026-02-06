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
  name: "[SW-T808] Default",
  args: {
    children: "Label",
  },
};

export const WithInfoIcon: Story = {
  name: "[SW-T809] With Info Icon",
  args: {
    children: "Label",
    infoText: "This is additional information about the label",
  },
};

export const Complete: Story = {
  name: "[SW-T810] Complete",
  args: {
    children: "Label",
    infoText: "This is additional information about the label",
  },
};
