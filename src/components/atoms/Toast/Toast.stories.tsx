import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Toast, ToastProps } from "./Toast";

const meta: Meta<ToastProps> = {
  title: "Atoms/Toast",
  component: Toast,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    type: {
      control: { type: "select" },
      options: ["info", "success", "warning", "danger", "default"],
    },
    heading: { control: "text" },
    description: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<ToastProps>;

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  width: "400px",
};

export const Default: Story = {
  args: {
    type: "default",
    heading: "Heading",
    description: "Description",
  },
};

export const AllTypes: Story = {
  render: () => (
    <div style={containerStyle}>
      <Toast type="default" heading="Heading" description="Description" />
      <Toast type="info" heading="Heading" description="Description" />
      <Toast type="success" heading="Heading" description="Description" />
      <Toast type="warning" heading="Heading" description="Description" />
      <Toast type="danger" heading="Heading" description="Description" />
    </div>
  ),
};

export const WithoutDescription: Story = {
  args: {
    type: "info",
    heading: "Heading without description",
  },
};

export const LongContent: Story = {
  args: {
    type: "warning",
    heading:
      "This is a heading with a very long text that might wrap to multiple lines in some cases",
    description:
      "And this is a description with very long text content that will definitely wrap to multiple lines to demonstrate how the component handles long content in both heading and description.",
  },
};
