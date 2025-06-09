import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { ButtonControlGroup } from "./ButtonControlGroup";

const meta: Meta<typeof ButtonControlGroup> = {
  title: "Molecules/ButtonControlGroup",
  component: ButtonControlGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    vertical: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ButtonControlGroup>;

// SVG Icons
const Icon = (): React.ReactNode => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="4" y="4" width="12" height="12" rx="2" fill="currentColor" />
  </svg>
);

export const VerticalGroup: Story = {
  args: {
    controls: [
      { id: "btn1", icon: <Icon /> },
      { id: "btn2", icon: <Icon /> },
      { id: "btn3", icon: <Icon /> },
      { id: "btn4", icon: <Icon /> },
    ],
    selectedId: "btn3",
    vertical: true,
  },
};

export const HorizontalGroup: Story = {
  args: {
    controls: [
      { id: "btn1", icon: <Icon /> },
      { id: "btn2", icon: <Icon /> },
      { id: "btn3", icon: <Icon /> },
      { id: "btn4", icon: <Icon /> },
    ],
    selectedId: "btn2",
    vertical: false,
  },
};

export const DisabledGroup: Story = {
  args: {
    controls: [
      { id: "btn1", icon: <Icon /> },
      { id: "btn2", icon: <Icon /> },
      { id: "btn3", icon: <Icon /> },
      { id: "btn4", icon: <Icon /> },
    ],
    selectedId: "btn3",
    disabled: true,
  },
};

export const MixedStateGroup: Story = {
  args: {
    controls: [
      { id: "btn1", icon: <Icon /> },
      { id: "btn2", icon: <Icon /> },
      { id: "btn3", icon: <Icon />, disabled: true },
      { id: "btn4", icon: <Icon /> },
    ],
    selectedId: "btn2",
  },
};

const InteractiveGroupExample = () => {
  const [selectedId, setSelectedId] = useState("btn1");

  const controls = [
    { id: "btn1", icon: <Icon /> },
    { id: "btn2", icon: <Icon /> },
    { id: "btn3", icon: <Icon /> },
    { id: "btn4", icon: <Icon /> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h3>Click buttons to change selection</h3>
      <ButtonControlGroup
        controls={controls}
        selectedId={selectedId}
        onChange={setSelectedId}
      />
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveGroupExample />,
};
