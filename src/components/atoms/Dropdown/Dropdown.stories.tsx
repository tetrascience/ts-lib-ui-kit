import React from "react";
import { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Dropdown } from "./Dropdown";

const meta: Meta<typeof Dropdown> = {
  title: "Atoms/Dropdown",
  component: Dropdown,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: { type: "boolean" },
    },
    error: {
      control: { type: "boolean" },
    },
    size: {
      control: { type: "select" },
      options: ["small", "xsmall"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

const sampleOptions = [
  { value: "v0.0.1", label: "v0.0.1" },
  { value: "v0.0.2", label: "v0.0.2" },
  { value: "v0.0.3", label: "v0.0.3" },
  { value: "v0.0.4", label: "v0.0.4", disabled: true },
  { value: "v0.0.5", label: "v0.0.5" },
];

export const Default: Story = {
  args: {
    options: sampleOptions,
    placeholder: "Placeholder",
    size: "small",
  },
};

export const XSmall: Story = {
  args: {
    options: sampleOptions,
    placeholder: "Placeholder",
    size: "xsmall",
  },
};

export const Small: Story = {
  args: {
    options: sampleOptions,
    placeholder: "Placeholder",
    size: "small",
  },
};

export const WithValue: Story = {
  args: {
    options: sampleOptions,
    value: "v0.0.1",
    placeholder: "Placeholder",
  },
};

export const Disabled: Story = {
  args: {
    options: sampleOptions,
    value: "v0.0.1",
    disabled: true,
    placeholder: "Placeholder",
  },
};

export const WithError: Story = {
  args: {
    options: sampleOptions,
    error: true,
    placeholder: "Placeholder",
  },
};

export const WithDisabledOption: Story = {
  args: {
    options: sampleOptions,
    placeholder: "Placeholder",
  },
};

export const NoData: Story = {
  args: {
    options: [],
    placeholder: "No options available",
  },
};

// Interactive example with controlled state
const InteractiveExample = () => {
  const [selectedValue, setSelectedValue] = useState("v0.0.1");

  return (
    <div style={{ width: "200px" }}>
      <p>Selected value: {selectedValue}</p>
      <Dropdown
        options={sampleOptions}
        value={selectedValue}
        onChange={(value) => setSelectedValue(value)}
        placeholder="Select version"
      />
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveExample />,
};

// Showcase all variants
export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "200px",
      }}
    >
      <div>
        <h4>Small (36px)</h4>
        <Dropdown
          options={sampleOptions}
          placeholder="Placeholder"
          size="small"
        />
      </div>

      <div>
        <h4>Extra Small (32px)</h4>
        <Dropdown
          options={sampleOptions}
          placeholder="Placeholder"
          size="xsmall"
        />
      </div>

      <div>
        <h4>With Value</h4>
        <Dropdown
          options={sampleOptions}
          value="v0.0.1"
          placeholder="Placeholder"
        />
      </div>

      <div>
        <h4>With Error</h4>
        <Dropdown
          options={sampleOptions}
          placeholder="Placeholder"
          error={true}
        />
      </div>

      <div>
        <h4>Disabled</h4>
        <Dropdown
          options={sampleOptions}
          placeholder="Placeholder"
          disabled={true}
        />
      </div>

      <div>
        <h4>With Disabled Option Selected</h4>
        <Dropdown
          options={sampleOptions}
          value="v0.0.4" // This is a disabled option
          placeholder="Placeholder"
        />
      </div>

      <div>
        <h4>No Data</h4>
        <Dropdown options={[]} placeholder="No options available" />
      </div>
    </div>
  ),
};
