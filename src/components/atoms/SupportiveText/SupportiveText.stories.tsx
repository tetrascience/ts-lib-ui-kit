import type { Meta, StoryObj } from "@storybook/react";
import { SupportiveText } from "./SupportiveText";

const meta: Meta<typeof SupportiveText> = {
  title: "Atoms/SupportiveText",
  component: SupportiveText,
  tags: ["autodocs"],
  argTypes: {
    children: { control: "text" },
    showCheck: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof SupportiveText>;

export const Default: Story = {
  args: {
    children: "This is a supportive text",
  },
};

export const WithCheckIcon: Story = {
  args: {
    children: "This is a supportive text with check icon",
    showCheck: true,
  },
};
