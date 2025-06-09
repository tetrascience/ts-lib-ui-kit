import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { FormField } from "./FormField";

const meta: Meta<typeof FormField> = {
  title: "Molecules/FormField",
  component: FormField,
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
type Story = StoryObj<typeof FormField>;

export const Default: Story = {
  args: {
    label: "Label",
    placeholder: "Placeholder",
  },
};

export const WithInfoText: Story = {
  args: {
    label: "Label",
    infoText: "This is some helpful information about this field",
    placeholder: "Placeholder",
  },
};

export const WithSupportiveText: Story = {
  args: {
    label: "Label",
    placeholder: "Placeholder",
    supportiveText: "Supportive Text",
  },
};

export const WithSupportiveCheck: Story = {
  args: {
    label: "Label",
    placeholder: "Placeholder",
    supportiveText: "Supportive Text",
    showSupportiveCheck: true,
  },
};

export const WithError: Story = {
  args: {
    label: "Label",
    placeholder: "Placeholder",
    supportiveText: "Error message goes here",
    error: true,
  },
};

export const WithIconLeft: Story = {
  args: {
    label: "Label",
    placeholder: "Placeholder",
    supportiveText: "Supportive Text",
    iconLeft: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8ZM9 5C9 5.55228 8.55228 6 8 6C7.44772 6 7 5.55228 7 5C7 4.44772 7.44772 4 8 4C8.55228 4 9 4.44772 9 5ZM6.75 8C6.33579 8 6 8.33579 6 8.75C6 9.16421 6.33579 9.5 6.75 9.5H7.5V11.25C7.5 11.6642 7.83579 12 8.25 12C8.66421 12 9 11.6642 9 11.25V8.75C9 8.33579 8.66421 8 8.25 8H6.75Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
};

export const WithIconRight: Story = {
  args: {
    label: "Label",
    placeholder: "Placeholder",
    supportiveText: "Supportive Text",
    iconRight: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.8536 5.35355C13.0488 5.15829 13.0488 4.84171 12.8536 4.64645C12.6583 4.45118 12.3417 4.45118 12.1464 4.64645L8 8.79289L3.85355 4.64645C3.65829 4.45118 3.34171 4.45118 3.14645 4.64645C2.95118 4.84171 2.95118 5.15829 3.14645 5.35355L7.64645 9.85355C7.84171 10.0488 8.15829 10.0488 8.35355 9.85355L12.8536 5.35355Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
};

export const Disabled: Story = {
  args: {
    label: "Label",
    placeholder: "Placeholder",
    supportiveText: "This field is disabled",
    disabled: true,
  },
};

export const Complete: Story = {
  args: {
    label: "Label",
    infoText: "Additional information about this field",
    placeholder: "Placeholder",
    supportiveText: "Supportive Text with information",
    size: "small",
  },
};

export const AsSelect: Story = {
  args: {
    label: "Label",
    placeholder: "Placeholder",
    iconRight: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.8536 5.35355C13.0488 5.15829 13.0488 4.84171 12.8536 4.64645C12.6583 4.45118 12.3417 4.45118 12.1464 4.64645L8 8.79289L3.85355 4.64645C3.65829 4.45118 3.34171 4.45118 3.14645 4.64645C2.95118 4.84171 2.95118 5.15829 3.14645 5.35355L7.64645 9.85355C7.84171 10.0488 8.15829 10.0488 8.35355 9.85355L12.8536 5.35355Z"
          fill="currentColor"
        />
      </svg>
    ),
    supportiveText: "Select an option from the dropdown",
  },
};
