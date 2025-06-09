import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { IconName } from "./../../atoms/Icon";
import { Sidebar } from "./Sidebar";

const meta: Meta<typeof Sidebar> = {
  title: "Molecules/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ height: "100vh" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const sidebarItems = [
  { icon: IconName.SEARCH_DOCUMENT, label: "Search" },
  { icon: IconName.SEARCH_SQL, label: "SQL Search" },
  { icon: IconName.LAMP, label: "Projects" },
  { icon: IconName.PIPELINE, label: "Pipelines" },
  { icon: IconName.COMPUTER, label: "Data & AI Workspace" },
  { icon: IconName.CUBE, label: "Artifacts" },
  { icon: IconName.DATABASE, label: "Data Sources" },
  { icon: IconName.PIE_CHART, label: "Health Monitoring" },
  { icon: IconName.BULK_CHECK, label: "Bulk Actions" },
  { icon: IconName.CODE, label: "Attribute Management" },
  { icon: IconName.GEAR, label: "Administration" },
];

// Default sidebar with static items
export const Default: Story = {
  args: {
    items: sidebarItems,
    activeItem: "Pipelines",
  },
};

// Interactive sidebar with state
export const Interactive: React.FC = () => {
  const [activeItem, setActiveItem] = useState("Pipelines");

  const handleItemClick = (label: string) => {
    setActiveItem(label);
    console.log(`Clicked on: ${label}`);
  };

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <Sidebar
        items={sidebarItems}
        activeItem={activeItem}
        onItemClick={handleItemClick}
      />
      <div
        style={{
          padding: "20px",
          backgroundColor: "#f5f7f9",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: "18px",
            color: "#333",
            textAlign: "center",
          }}
        >
          <p>
            Selected navigation: <strong>{activeItem}</strong>
          </p>
          <p>Click on sidebar items to navigate</p>
        </div>
      </div>
    </div>
  );
};
