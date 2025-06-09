import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./Checkbox";

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
  args: {
    checked: false,
    label: "Unchecked option",
  },
};

export const Checked: Story = {
  args: {
    checked: true,
    label: "Checked option",
  },
};

export const WithoutLabel: Story = {
  args: {
    checked: false,
  },
};

export const Disabled: Story = {
  args: {
    checked: false,
    disabled: true,
    label: "Disabled option",
  },
};

export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true,
    label: "Disabled checked option",
  },
};

export const NoPadding: Story = {
  args: {
    checked: false,
    label: "No padding option",
    noPadding: true,
  },
};

export const Interactive: React.FC = () => {
  const [checked, setChecked] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <Checkbox
        checked={checked}
        onChange={(isChecked) => setChecked(isChecked)}
        label="Click me to toggle"
      />
      <div>Checkbox is {checked ? "checked" : "unchecked"}</div>
    </div>
  );
};

export const ComparisonWithAndWithoutPadding: React.FC = () => {
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
        <Checkbox
          checked={checked1}
          onChange={(isChecked) => setChecked1(isChecked)}
          label="With default padding"
        />
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
