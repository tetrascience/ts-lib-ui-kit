import type { Meta, StoryObj } from "@storybook/react";
import { COLORS } from "./../../../utils/colors";
import { BarGraph, BarDataSeries } from "./BarGraph";

const meta: Meta<typeof BarGraph> = {
  title: "Organisms/BarGraph",
  component: BarGraph,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BarGraph>;

const generateBasicData = (): BarDataSeries[] => {
  const x = [200, 300, 400, 500, 600, 700, 800, 900, 1000];

  return [
    {
      name: "Data A",
      color: COLORS.ORANGE,
      x,
      y: [220, 180, 200, 135, 185, 160, 280, 225, 280],
    },
  ];
};

const generateGroupedBarData = (): BarDataSeries[] => {
  const x = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

  return [
    {
      name: "Data A",
      color: COLORS.ORANGE,
      x,
      y: [140, 140, 195, 205, 230, 65, 300, 290, 175, 280],
    },
    {
      name: "Data B",
      color: COLORS.RED,
      x,
      y: [150, 75, 300, 210, 130, 75, 140, 35, 290, 70],
    },
    {
      name: "Data C",
      color: COLORS.GREEN,
      x,
      y: [55, 185, 225, 75, 105, 120, 215, 155, 90, 265],
    },
  ];
};

const generateStackedBarData = (): BarDataSeries[] => {
  const x = [200, 300, 400, 500, 600, 700, 800, 900, 1000];

  return [
    {
      name: "Data A",
      color: COLORS.ORANGE,
      x,
      y: [90, 105, 105, 45, 95, 70, 190, 135, 190],
    },
    {
      name: "Data B",
      color: COLORS.RED,
      x,
      y: [90, 75, 90, 90, 95, 90, 90, 90, 90],
    },
  ];
};

export const Basic: Story = {
  args: {
    dataSeries: generateBasicData(),
    title: "Bar Graph",
    width: 1000,
    height: 600,
  },
};

export const GroupedBars: Story = {
  args: {
    dataSeries: generateGroupedBarData(),
    variant: "group",
    title: "Cluster Bar Graph",
    width: 1000,
    height: 600,
  },
};

export const StackedBars: Story = {
  args: {
    dataSeries: generateStackedBarData(),
    variant: "stack",
    title: "Stacked Bar Graph",
    width: 1000,
    height: 600,
  },
};

export const CustomStyling: Story = {
  args: {
    dataSeries: generateGroupedBarData(),
    title: "Custom Bar Graph",
    xTitle: "X-Axis Label",
    yTitle: "Y-Axis Label",
    width: 1000,
    height: 600,
    barWidth: 16,
  },
};
