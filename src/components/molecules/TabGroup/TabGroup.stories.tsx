import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { TabGroup } from "./TabGroup";

const meta: Meta<typeof TabGroup> = {
  title: "Molecules/TabGroup",
  component: TabGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
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
type Story = StoryObj<typeof TabGroup>;

export const Default: Story = {
  args: {
    tabs: [
      { id: "tab1", label: "Pipeline Builder" },
      { id: "tab2", label: "Configuration" },
      { id: "tab3", label: "Launch" },
    ],
    activeTab: "tab1",
  },
};

export const Medium: Story = {
  args: {
    tabs: [
      { id: "tab1", label: "Pipeline Builder" },
      { id: "tab2", label: "Configuration" },
      { id: "tab3", label: "Launch" },
    ],
    activeTab: "tab2",
    size: "medium",
  },
};

export const Small: Story = {
  args: {
    tabs: [
      { id: "tab1", label: "Pipeline Builder" },
      { id: "tab2", label: "Configuration" },
      { id: "tab3", label: "Launch" },
    ],
    activeTab: "tab3",
    size: "small",
  },
};

export const Disabled: Story = {
  args: {
    tabs: [
      { id: "tab1", label: "Pipeline Builder" },
      { id: "tab2", label: "Configuration" },
      { id: "tab3", label: "Launch" },
    ],
    activeTab: "tab2",
    disabled: true,
  },
};

export const WithDisabledTab: Story = {
  args: {
    tabs: [
      { id: "tab1", label: "Pipeline Builder" },
      { id: "tab2", label: "Configuration", disabled: true },
      { id: "tab3", label: "Launch" },
    ],
    activeTab: "tab3",
  },
};

// Interactive example component
const InteractiveExample = () => {
  const [activeTabId, setActiveTabId] = React.useState("tab1");

  return (
    <div style={{ width: "600px" }}>
      <h3>Click a tab to change active state</h3>
      <TabGroup
        tabs={[
          { id: "tab1", label: "Pipeline Builder" },
          { id: "tab2", label: "Configuration" },
          { id: "tab3", label: "Launch" },
        ]}
        activeTab={activeTabId}
        onChange={(tabId) => setActiveTabId(tabId)}
      />
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveExample />,
};
