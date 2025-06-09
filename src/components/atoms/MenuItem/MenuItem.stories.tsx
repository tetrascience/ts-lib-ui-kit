import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MenuItem } from "./MenuItem";

const meta: Meta<typeof MenuItem> = {
  title: "Atoms/MenuItem",
  component: MenuItem,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MenuItem>;

export const Default: Story = {
  args: {
    label: "Menu Item",
    showCheckbox: false,
    active: false,
  },
};

export const WithCheckbox: Story = {
  args: {
    label: "Menu Item with Checkbox",
    showCheckbox: true,
    checked: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "When showCheckbox is true, the label is displayed as part of the Checkbox component.",
      },
    },
  },
};

export const WithCheckboxChecked: Story = {
  args: {
    label: "Checked Menu Item",
    showCheckbox: true,
    checked: true,
  },
};

export const Active: Story = {
  args: {
    label: "Active Menu Item",
    active: true,
  },
};

export const ActiveWithCheckbox: Story = {
  args: {
    label: "Active Checked Menu Item",
    showCheckbox: true,
    checked: true,
    active: true,
  },
};

export const ComparisonWithAndWithoutCheckbox: React.FC = () => {
  return (
    <div
      style={{
        width: "300px",
        border: "1px solid #eee",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <MenuItem label="Regular MenuItem (without checkbox)" />
      <MenuItem
        label="MenuItem with Checkbox"
        showCheckbox={true}
        checked={false}
      />
    </div>
  );
};

export const Interactive: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({
    item1: false,
    item2: true,
    item3: false,
  });

  const handleClick = (itemId: string) => {
    setActiveItem(itemId);
  };

  const handleCheckChange = (itemId: string, isChecked: boolean) => {
    setChecked((prev) => ({
      ...prev,
      [itemId]: isChecked,
    }));
  };

  return (
    <div
      style={{
        width: "300px",
        border: "1px solid #eee",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <MenuItem
        label="Menu Item 1"
        active={activeItem === "item1"}
        onClick={() => handleClick("item1")}
        showCheckbox={true}
        checked={checked.item1}
        onCheckChange={(isChecked) => handleCheckChange("item1", isChecked)}
      />
      <MenuItem
        label="Menu Item 2"
        active={activeItem === "item2"}
        onClick={() => handleClick("item2")}
        showCheckbox={true}
        checked={checked.item2}
        onCheckChange={(isChecked) => handleCheckChange("item2", isChecked)}
      />
      <MenuItem
        label="Menu Item 3"
        active={activeItem === "item3"}
        onClick={() => handleClick("item3")}
        showCheckbox={true}
        checked={checked.item3}
        onCheckChange={(isChecked) => handleCheckChange("item3", isChecked)}
      />
    </div>
  );
};
