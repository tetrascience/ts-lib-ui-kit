import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Icon, IconName } from "./Icon";

const meta: Meta<typeof Icon> = {
  title: "Atoms/Icon",
  component: Icon,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Icon>;

// Custom color
export const CustomColor: Story = {
  args: {
    name: IconName.SEARCH,
    fill: "#4072D2",
  },
};

// Custom size
export const CustomSize: Story = {
  args: {
    name: IconName.SEARCH,
    width: "32",
    height: "32",
  },
};

// All icons in a grid
export const AllIcons: React.FC = () => {
  const allIcons = Object.values(IconName);

  const containerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "24px",
    padding: "16px",
  };

  const iconCardStyle = {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    padding: "16px",
    border: "1px solid #e1e7ef",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  };

  const iconStyle = {
    marginBottom: "8px",
  };

  const labelStyle = {
    fontSize: "12px",
    color: "#48566a",
    textAlign: "center" as const,
    wordBreak: "break-word" as const,
  };

  return (
    <div style={containerStyle}>
      {allIcons.map((iconName) => (
        <div key={iconName} style={iconCardStyle}>
          <div style={iconStyle}>
            <Icon name={iconName} width="24" height="24" />
          </div>
          <div style={labelStyle}>{iconName}</div>
        </div>
      ))}
    </div>
  );
};
