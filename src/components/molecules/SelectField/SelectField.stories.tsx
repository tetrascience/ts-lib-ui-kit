import { Meta, StoryObj } from "@storybook/react";
import SelectField from "./SelectField";

const meta: Meta<typeof SelectField> = {
  title: "Molecules/SelectField",
  component: SelectField,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["xsmall", "small"],
      defaultValue: "small",
    },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
    showSupportiveCheck: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof SelectField>;

const sampleOptions = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
  { value: "option4", label: "Option 4", disabled: true },
  { value: "option5", label: "Option 5" },
];

export const Default: Story = {
  name: "[SW-T934] Default",
  args: {
    label: "Label",
    placeholder: "Select an option",
    options: sampleOptions,
  },
};

export const WithInfoText: Story = {
  name: "[SW-T935] With Info Text",
  args: {
    label: "Label",
    infoText: "This is some helpful information about this field",
    placeholder: "Select an option",
    options: sampleOptions,
  },
};

export const WithSupportiveText: Story = {
  name: "[SW-T936] With Supportive Text",
  args: {
    label: "Label",
    placeholder: "Select an option",
    supportiveText: "Supportive Text",
    options: sampleOptions,
  },
};

export const WithSupportiveCheck: Story = {
  name: "[SW-T937] With Supportive Check",
  args: {
    label: "Label",
    placeholder: "Select an option",
    supportiveText: "Supportive Text",
    showSupportiveCheck: true,
    options: sampleOptions,
  },
};

export const WithError: Story = {
  name: "[SW-T938] With Error",
  args: {
    label: "Label",
    placeholder: "Select an option",
    supportiveText: "Error message goes here",
    error: true,
    options: sampleOptions,
  },
};

export const Disabled: Story = {
  name: "[SW-T939] Disabled",
  args: {
    label: "Label",
    placeholder: "Select an option",
    supportiveText: "This field is disabled",
    disabled: true,
    options: sampleOptions,
  },
};

export const WithDefaultValue: Story = {
  name: "[SW-T940] With Default Value",
  args: {
    label: "Label",
    placeholder: "Select an option",
    supportiveText: "Option is pre-selected",
    options: sampleOptions,
    value: "option2",
  },
};

export const Complete: Story = {
  name: "[SW-T941] Complete",
  args: {
    label: "Label",
    infoText: "Additional information about this select field",
    placeholder: "Select an option",
    supportiveText: "Please select an option from the dropdown",
    options: sampleOptions,
    size: "small",
  },
};
