import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Tooltip, TooltipProps } from "./Tooltip";

const meta: Meta<TooltipProps> = {
  title: "Atoms/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    content: { control: "text" },
    placement: {
      control: { type: "select" },
      options: ["top", "right", "bottom", "left"],
    },
    delay: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<TooltipProps>;

const tooltipDemoStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "var(--blue-900)",
  color: "white",
  padding: "8px 12px",
  borderRadius: "6px",
  fontFamily: "Inter, sans-serif",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
  userSelect: "none",
};

const tooltipContainerStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "40px",
  justifyContent: "center",
  margin: "50px",
};

export const Default: Story = {
  args: {
    content: "This is a tooltip content",
    placement: "top",
    children: <div style={tooltipDemoStyle}>Hover me</div>,
  },
};

export const AllPlacements: Story = {
  render: () => (
    <div style={tooltipContainerStyle}>
      <Tooltip content="Tooltip on top" placement="top">
        <div style={tooltipDemoStyle}>Top</div>
      </Tooltip>
      <Tooltip content="Tooltip on right" placement="right">
        <div style={tooltipDemoStyle}>Right</div>
      </Tooltip>
      <Tooltip content="Tooltip on bottom" placement="bottom">
        <div style={tooltipDemoStyle}>Bottom</div>
      </Tooltip>
      <Tooltip content="Tooltip on left" placement="left">
        <div style={tooltipDemoStyle}>Left</div>
      </Tooltip>
    </div>
  ),
};

export const WithLongContent: Story = {
  args: {
    content:
      "This is a tooltip with a very long content that will wrap into multiple lines to demonstrate how the tooltip handles long text content.",
    placement: "top",
    children: <div style={tooltipDemoStyle}>Hover for long content</div>,
  },
};

export const CustomDelay: Story = {
  args: {
    content: "This tooltip appears with a 1 second delay",
    placement: "top",
    delay: 1000,
    children: <div style={tooltipDemoStyle}>Delayed Tooltip</div>,
  },
};
