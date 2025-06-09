import type { Meta, StoryObj } from "@storybook/react";
import { Main } from "./Main";

const meta: Meta<typeof Main> = {
  title: "Organisms/Main",
  component: Main,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Main>;

export const Default: Story = {
  args: {
    hostname: "localhost:3000",
    userProfile: {
      name: "Chris Calo",
      avatar: undefined,
    },
    organization: {
      name: "TetraScience",
      subtext: "tetrascience",
    },
  },
};
