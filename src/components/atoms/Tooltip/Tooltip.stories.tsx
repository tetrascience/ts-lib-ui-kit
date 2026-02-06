import { Meta, StoryObj } from "@storybook/react";
import styled from "styled-components";
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

const TooltipDemo = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--blue-900);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
`;

const TooltipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  justify-content: center;
  margin: 50px;
`;

export const Default: Story = {
  name: "[SW-T867] Default",
  args: {
    content: "This is a tooltip content",
    placement: "top",
    children: <TooltipDemo>Hover me</TooltipDemo>,
  },
};

export const AllPlacements: Story = {
  name: "[SW-T868] All Placements",
  render: () => (
    <TooltipContainer>
      <Tooltip content="Tooltip on top" placement="top">
        <TooltipDemo>Top</TooltipDemo>
      </Tooltip>
      <Tooltip content="Tooltip on right" placement="right">
        <TooltipDemo>Right</TooltipDemo>
      </Tooltip>
      <Tooltip content="Tooltip on bottom" placement="bottom">
        <TooltipDemo>Bottom</TooltipDemo>
      </Tooltip>
      <Tooltip content="Tooltip on left" placement="left">
        <TooltipDemo>Left</TooltipDemo>
      </Tooltip>
    </TooltipContainer>
  ),
};

export const WithLongContent: Story = {
  name: "[SW-T869] With Long Content",
  args: {
    content:
      "This is a tooltip with a very long content that will wrap into multiple lines to demonstrate how the tooltip handles long text content.",
    placement: "top",
    children: <TooltipDemo>Hover for long content</TooltipDemo>,
  },
};

export const CustomDelay: Story = {
  name: "[SW-T870] Custom Delay",
  args: {
    content: "This tooltip appears with a 1 second delay",
    placement: "top",
    delay: 1000,
    children: <TooltipDemo>Delayed Tooltip</TooltipDemo>,
  },
};
