import { Meta, StoryObj } from "@storybook/react";
import Toggle from "./Toggle";

const meta: Meta<typeof Toggle> = {
  title: "Atoms/Toggle",
  component: Toggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    onChange: { action: "changed" },
  },
  args: {
    checked: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  name: "[SW-T863] Default",
};

export const WithLabel: Story = {
  name: "[SW-T864] With Label",
  args: {
    label: "Label",
  },
};

export const CheckedState: Story = {
  name: "[SW-T865] Checked State",
  args: {
    checked: true,
  },
};

export const Disabled: Story = {
  name: "[SW-T866] Disabled",
  args: {
    disabled: true,
  },
};
