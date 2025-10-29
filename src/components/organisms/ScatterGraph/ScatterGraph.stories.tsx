import type { Meta, StoryObj } from "@storybook/react";
import { COLORS } from "../../../utils/colors";
import { ScatterGraph, ScatterDataSeries } from "./ScatterGraph";

const generateScatterDemoData = (): ScatterDataSeries[] => {
  return [
    {
      name: "Data A",
      color: COLORS.ORANGE,
      x: [400, 430, 450, 470, 490, 510, 530, 550, 570, 590, 610, 630, 650],
      y: [85, 72, 75, 92, 87, 125, 143, 145, 150, 165, 170, 160, 145],
    },
    {
      name: "Data B",
      color: COLORS.RED,
      x: [390, 410, 430, 450, 470, 490, 510, 530, 550, 570, 590, 610],
      y: [50, 75, 80, 85, 100, 105, 115, 135, 140, 150, 155, 145],
    },
    {
      name: "Data C",
      color: COLORS.GREEN,
      x: [410, 440, 460, 480, 500, 520, 540, 560, 580, 600, 620, 640],
      y: [60, 85, 90, 100, 110, 120, 125, 150, 160, 165, 175, 170],
    },
  ];
};

const meta: Meta<typeof ScatterGraph> = {
  title: "Organisms/ScatterGraph",
  component: ScatterGraph,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ScatterGraph>;

export const Default: Story = {
  args: {
    dataSeries: generateScatterDemoData(),
    width: 900,
    height: 600,
    title: "Scatter Plot",
    xTitle: "Columns",
    yTitle: "Rows",
  },
};

export const CustomRanges: Story = {
  args: {
    ...Default.args,
    xRange: [300, 700],
    yRange: [0, 200],
  },
};
