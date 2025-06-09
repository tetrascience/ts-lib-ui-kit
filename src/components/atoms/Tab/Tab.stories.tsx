import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Tab } from "./Tab";

const meta: Meta<typeof Tab> = {
  title: "Atoms/Tab",
  component: Tab,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    active: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
    size: {
      control: { type: "select" },
      options: ["small", "medium"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tab>;

export const Default: Story = {
  args: {
    label: "Label",
    size: "medium",
  },
};

export const Small: Story = {
  args: {
    label: "Label",
    size: "small",
  },
};

export const Medium: Story = {
  args: {
    label: "Label",
    size: "medium",
  },
};

export const Active: Story = {
  args: {
    label: "Label",
    active: true,
  },
};

export const Disabled: Story = {
  args: {
    label: "Label",
    disabled: true,
  },
};

export const TabVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h3>Medium Tabs (Default)</h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <Tab label="Label" size="medium" />
          <Tab label="Label" size="medium" active />
          <Tab label="Label" size="medium" disabled />
        </div>
      </div>

      <div>
        <h3>Small Tabs</h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <Tab label="Label" size="small" />
          <Tab label="Label" size="small" active />
          <Tab label="Label" size="small" disabled />
        </div>
      </div>
    </div>
  ),
};
