import type { Meta, StoryObj } from "@storybook/react";
import { Navbar } from "./Navbar";

const meta: Meta<typeof Navbar> = {
  title: "Molecules/Navbar",
  component: Navbar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Navbar>;

// Default Navbar example
export const Default: Story = {
  args: {
    organization: {
      name: "TetraScience",
      subtext: "tetrascience",
    },
  },
};
