import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import ProtocolConfiguration from "./ProtocolConfiguration";

const meta: Meta<typeof ProtocolConfiguration> = {
  title: "Molecules/ProtocolConfiguration",
  component: ProtocolConfiguration,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: { type: "text" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProtocolConfiguration>;

// Basic examples
export const Default: Story = {
  name: "[SW-T927] Default",
  args: {},
};

export const WithCustomClassName: Story = {
  name: "[SW-T928] With Custom Class Name",
  args: {
    className: "custom-protocol-config",
  },
};

// Interactive example showing both states
export const Interactive: Story = {
  name: "[SW-T929] Interactive",
  args: {},
  parameters: {
    docs: {
      description: {
        story: "Toggle the Edit Mode switch to see the different states of the component.",
      },
    },
  },
};

// Container example to show how it looks in a layout
export const InContainer: Story = {
  name: "[SW-T930] In Container",
  args: {},
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
        <Story />
      </div>
    ),
  ],
};
