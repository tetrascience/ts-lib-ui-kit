import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Checkbox from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Atoms/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Unchecked: Story = {
  name: "[SW-T764] Unchecked",
  args: {
    checked: false,
    label: "Unchecked option",
  },
};

export const Checked: Story = {
  name: "[SW-T765] Checked",
  args: {
    checked: true,
    label: "Checked option",
  },
};

export const WithoutLabel: Story = {
  name: "[SW-T766] Without Label",
  args: {
    checked: false,
  },
};

export const Disabled: Story = {
  name: "[SW-T767] Disabled",
  args: {
    checked: false,
    disabled: true,
    label: "Disabled option",
  },
};

export const DisabledChecked: Story = {
  name: "[SW-T768] Disabled Checked",
  args: {
    checked: true,
    disabled: true,
    label: "Disabled checked option",
  },
};

export const NoPadding: Story = {
  name: "[SW-T769] No Padding",
  args: {
    checked: false,
    label: "No padding option",
    noPadding: true,
  },
};
const InteractiveComponent = () => {
  const [checked, setChecked] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <Checkbox checked={checked} onChange={(isChecked) => setChecked(isChecked)} label="Click me to toggle" />
      <div>Checkbox is {checked ? "checked" : "unchecked"}</div>
    </div>
  );
};

export const Interactive: Story = {
  name: "[SW-T770] Interactive",
  render: () => <InteractiveComponent />,
};
const ComparisonWithAndWithoutPaddingComponent = () => {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        border: "1px dashed #ccc",
        width: "300px",
      }}
    >
      <div style={{ borderBottom: "1px solid #eee" }}>
        <Checkbox checked={checked1} onChange={(isChecked) => setChecked1(isChecked)} label="With default padding" />
      </div>
      <div>
        <Checkbox
          checked={checked2}
          onChange={(isChecked) => setChecked2(isChecked)}
          label="With no padding"
          noPadding={true}
        />
      </div>
    </div>
  );
};

export const ComparisonWithAndWithoutPadding: Story = {
  name: "[SW-T771] Comparison With And Without Padding",
  render: () => <ComparisonWithAndWithoutPaddingComponent />,
};
