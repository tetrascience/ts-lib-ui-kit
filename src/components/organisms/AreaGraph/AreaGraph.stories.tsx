import type { Meta, StoryObj } from "@storybook/react";
import { COLORS } from "./../../../utils/colors";
import { AreaGraph } from "./AreaGraph";

const meta: Meta<typeof AreaGraph> = {
  title: "organisms/AreaGraph",
  component: AreaGraph,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["normal", "stacked"],
    },
    width: {
      control: { type: "number" },
    },
    height: {
      control: { type: "number" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleDataSeries = [
  {
    x: [200, 300, 400, 500, 600, 700, 800, 900, 1000],
    y: [120, 130, 100, 110, 140, 160, 150, 140, 110],
    name: "Series 1",
    color: COLORS.ORANGE,
  },
  {
    x: [200, 300, 400, 500, 600, 700, 800, 900, 1000],
    y: [30, 40, 50, 60, 70, 50, 40, 30, 20],
    name: "Series 2",
    color: COLORS.RED,
  },
  {
    x: [200, 300, 400, 500, 600, 700, 800, 900, 1000],
    y: [20, 30, 25, 35, 40, 30, 25, 20, 15],
    name: "Series 3",
    color: COLORS.GREEN,
  },
];

export const Default: Story = {
  args: {
    dataSeries: sampleDataSeries,
    title: "Area Graph",
    xTitle: "Columns",
    yTitle: "Rows",
    width: 1000,
    height: 600,
    variant: "normal",
  },
};

export const Stacked: Story = {
  args: {
    dataSeries: sampleDataSeries,
    title: "Stacked Area Graph",
    xTitle: "Columns",
    yTitle: "Rows",
    width: 1000,
    height: 600,
    variant: "stacked",
  },
};

export const CustomRange: Story = {
  args: {
    dataSeries: sampleDataSeries,
    title: "Area Graph with Custom Range",
    xTitle: "Columns",
    yTitle: "Rows",
    width: 1000,
    height: 600,
    variant: "normal",
    xRange: [300, 900],
    yRange: [0, 200],
  },
};
