import type { Meta, StoryObj } from "@storybook/react";
import { COLORS } from "../../../utils/colors";
import { Histogram } from "./Histogram";

const meta: Meta<typeof Histogram> = {
  title: "Organisms/Histogram",
  component: Histogram,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Histogram>;

const generateNormalData = (mean: number, stdDev: number, count: number): number[] => {
  const data: number[] = [];

  for (let i = 0; i < count; i++) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const value = mean + z0 * stdDev;
    data.push(value);
  }

  return data;
};

export const Default: Story = {
  name: "[SW-T990] Default",
  args: {
    dataSeries: {
      x: generateNormalData(20, 8, 200),
      name: "Label",
    },
    title: "Histogram",
    xTitle: "Torque",
    yTitle: "Frequency",
    width: 480,
    height: 480,
  },
};

export const WithCustomColor: Story = {
  name: "[SW-T991] With Custom Color",
  args: {
    dataSeries: {
      x: generateNormalData(20, 8, 200),
      name: "Custom Color",
      color: COLORS.RED,
    },
    title: "Histogram with Custom Color",
    xTitle: "Torque",
    yTitle: "Frequency",
    width: 480,
    height: 480,
  },
};

export const WithCustomBins: Story = {
  name: "[SW-T992] With Custom Bins",
  args: {
    dataSeries: {
      x: generateNormalData(20, 8, 200),
      name: "Custom Bins",
      autobinx: false,
      xbins: {
        start: 0,
        end: 40,
        size: 4,
      },
    },
    title: "Histogram with Custom Bins",
    xTitle: "Torque",
    yTitle: "Frequency",
    width: 480,
    height: 480,
  },
};

export const StackedHistogram: Story = {
  name: "[SW-T993] Stacked Histogram",
  args: {
    dataSeries: [
      {
        x: generateNormalData(20, 8, 200),
        name: "Series A",
        color: COLORS.ORANGE,
      },
      {
        x: generateNormalData(20, 6, 150),
        name: "Series B",
        color: COLORS.RED,
      },
    ],
    title: "Group of Histogram",
    xTitle: "Torque",
    yTitle: "Frequency",
    width: 480,
    height: 480,
  },
};

export const MultipleSeries: Story = {
  name: "[SW-T994] Multiple Series",
  args: {
    dataSeries: [
      {
        x: generateNormalData(10, 5, 100),
        name: "Series A",
        color: COLORS.BLUE,
      },
      {
        x: generateNormalData(20, 5, 100),
        name: "Series B",
        color: COLORS.RED,
      },
      {
        x: generateNormalData(30, 5, 100),
        name: "Series C",
        color: COLORS.GREEN,
      },
      {
        x: generateNormalData(40, 5, 100),
        name: "Series D",
        color: COLORS.ORANGE,
      },
    ],
    title: "Multiple Series Histogram",
    xTitle: "Torque",
    yTitle: "Frequency",
    width: 600,
    height: 480,
  },
};

export const WithDistributionLine: Story = {
  name: "[SW-T995] With Distribution Line",
  args: {
    dataSeries: {
      x: generateNormalData(20, 8, 200),
      name: "Label",
      color: COLORS.ORANGE,
    },
    title: "Histogram with Fitted Distribution Line",
    xTitle: "Torque",
    yTitle: "Frequency",
    width: 480,
    height: 480,
    showDistributionLine: true,
  },
};

export const WithCustomBinsAndDistributionLine: Story = {
  name: "[SW-T996] With Custom Bins And Distribution Line",
  args: {
    dataSeries: {
      x: generateNormalData(20, 8, 200),
      name: "Label",
      color: COLORS.ORANGE,
      autobinx: false,
      xbins: {
        start: 0,
        end: 40,
        size: 4,
      },
    },
    title: "Histogram with Fitted Distribution Line",
    xTitle: "Torque",
    yTitle: "Frequency",
    width: 480,
    height: 480,
    showDistributionLine: true,
  },
};

export const MultipleSeriesWithDistributionLines: Story = {
  name: "[SW-T997] Multiple Series With Distribution Lines",
  args: {
    dataSeries: [
      {
        x: generateNormalData(20, 8, 200),
        name: "Series A",
        color: COLORS.ORANGE,
      },
      {
        x: generateNormalData(15, 5, 150),
        name: "Series B",
        color: COLORS.RED,
      },
    ],
    title: "Group of Histogram with Fitted Distribution Line",
    xTitle: "Torque",
    yTitle: "Frequency",
    width: 600,
    height: 500,
    showDistributionLine: true,
  },
};
