import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Menu, MenuItemData } from "./Menu";

const meta: Meta<typeof Menu> = {
  title: "Molecules/Menu",
  component: Menu,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Menu>;

const defaultItems: MenuItemData[] = [
  { id: "item1", label: "Menu Item 1", showCheckbox: false },
  { id: "item2", label: "Menu Item 2", showCheckbox: false },
  { id: "item3", label: "Menu Item 3", showCheckbox: false },
];

const itemsWithCheckboxes: MenuItemData[] = [
  { id: "item1", label: "Menu Item 1", showCheckbox: true, checked: false },
  { id: "item2", label: "Menu Item 2", showCheckbox: true, checked: true },
  { id: "item3", label: "Menu Item 3", showCheckbox: true, checked: false },
];

export const Default: Story = {
  args: {
    items: defaultItems,
  },
};

export const WithTitle: Story = {
  args: {
    title: "Title",
    items: defaultItems,
  },
};

export const WithCheckboxes: Story = {
  args: {
    title: "Title",
    items: itemsWithCheckboxes,
  },
};

export const WithActiveItem: Story = {
  args: {
    title: "Title",
    items: defaultItems,
    activeItemId: "item2",
  },
};

export const Interactive: React.FC = () => {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [items, setItems] = useState<MenuItemData[]>([
    { id: "item1", label: "Menu Item 1", showCheckbox: true, checked: false },
    { id: "item2", label: "Menu Item 2", showCheckbox: true, checked: true },
    { id: "item3", label: "Menu Item 3", showCheckbox: true, checked: false },
  ]);

  const handleItemClick = (itemId: string) => {
    setActiveItemId(itemId);
  };

  const handleItemCheckChange = (itemId: string, checked: boolean) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, checked } : item
      )
    );
  };

  return (
    <div style={{ width: "300px" }}>
      <Menu
        title="Interactive Menu"
        items={items}
        activeItemId={activeItemId}
        onItemClick={handleItemClick}
        onItemCheckChange={handleItemCheckChange}
      />
    </div>
  );
};

export const MultipleMenus: React.FC = () => {
  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <div style={{ width: "300px" }}>
        <Menu
          title="Title"
          items={[
            { id: "item1", label: "Menu Item 1" },
            { id: "item2", label: "Menu Item 2" },
          ]}
        />
      </div>
      <div style={{ width: "300px" }}>
        <Menu
          title="Title"
          items={[
            { id: "item1", label: "Menu Item 1" },
            { id: "item2", label: "Menu Item 2" },
            { id: "item3", label: "Menu Item 3" },
          ]}
        />
      </div>
      <div style={{ width: "300px" }}>
        <Menu
          title="Title"
          items={[
            { id: "item1", label: "Menu Item 1" },
            { id: "item2", label: "Menu Item 2" },
            { id: "item3", label: "Menu Item 3" },
            { id: "item4", label: "Menu Item 4" },
          ]}
        />
      </div>
    </div>
  );
};
