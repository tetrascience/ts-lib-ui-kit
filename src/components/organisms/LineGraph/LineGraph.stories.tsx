import type { Meta, StoryObj } from "@storybook/react";
import { COLORS } from "../../../utils/colors";
import { LineGraph, LineDataSeries } from "./LineGraph";

const generateBasicDemoData = (): LineDataSeries[] => {
  const x = [200, 300, 400, 500, 600, 700, 800, 900, 1000];

  return [
    {
      name: "Data A",
      color: COLORS.ORANGE,
      x,
      y: [75, 140, 105, 120, 145, 115, 110, 80, 90],
    },
    {
      name: "Data B",
      color: COLORS.RED,
      x,
      y: [125, 160, 115, 145, 190, 180, 120, 105, 110],
    },
    {
      name: "Data C",
      color: COLORS.GREEN,
      x,
      y: [185, 195, 145, 215, 205, 200, 160, 145, 135],
    },
    {
      name: "Data D",
      color: COLORS.BLUE,
      x,
      y: [225, 215, 210, 245, 230, 230, 200, 185, 190],
    },
    {
      name: "Data E",
      color: COLORS.YELLOW,
      x,
      y: [245, 260, 235, 265, 250, 250, 220, 220, 225],
    },
    {
      name: "Data F",
      color: COLORS.PURPLE,
      x,
      y: [275, 295, 270, 285, 300, 300, 250, 255, 260],
    },
  ];
};

const generateDataStartingFromZero = (): LineDataSeries[] => {
  const x = [0, 125, 250, 375, 500, 625, 750, 875, 1000];

  const rand = (min: number, max: number) =>
    Math.round(Math.random() * (max - min) + min);

  return [
    {
      name: "Data A",
      color: COLORS.ORANGE,
      symbol: "circle",
      x,
      y: [
        0,
        rand(40, 80),
        rand(90, 120),
        rand(110, 140),
        rand(130, 160),
        rand(110, 140),
        rand(100, 130),
        rand(70, 100),
        rand(80, 110),
      ],
    },
    {
      name: "Data B",
      color: COLORS.RED,
      symbol: "square",
      x,
      y: [
        rand(20, 60),
        rand(80, 120),
        rand(110, 140),
        rand(130, 170),
        rand(170, 200),
        rand(160, 190),
        rand(110, 140),
        rand(90, 120),
        rand(100, 130),
      ],
    },
    {
      name: "Data C",
      color: COLORS.GREEN,
      symbol: "diamond",
      x,
      y: [
        0,
        rand(70, 110),
        rand(120, 160),
        rand(180, 230),
        rand(170, 220),
        rand(170, 220),
        rand(130, 180),
        rand(120, 170),
        rand(110, 160),
      ],
    },
    {
      name: "Data D",
      color: COLORS.BLUE,
      symbol: "triangle-up",
      x,
      y: [
        rand(30, 80),
        rand(100, 150),
        rand(150, 200),
        rand(220, 270),
        rand(200, 250),
        rand(200, 250),
        rand(170, 220),
        rand(150, 200),
        rand(160, 210),
      ],
    },
    {
      name: "Data E",
      color: COLORS.YELLOW,
      symbol: "triangle-down",
      x,
      y: [
        0,
        rand(120, 160),
        rand(170, 210),
        rand(240, 280),
        rand(220, 260),
        rand(220, 260),
        rand(190, 230),
        rand(190, 230),
        rand(200, 240),
      ],
    },
    {
      name: "Data F",
      color: COLORS.PURPLE,
      symbol: "pentagon",
      x,
      y: [
        rand(50, 100),
        rand(140, 180),
        rand(190, 230),
        rand(260, 300),
        rand(270, 310),
        rand(270, 310),
        rand(220, 260),
        rand(230, 270),
        rand(240, 280),
      ],
    },
  ];
};

const generateWideRangeData = (): LineDataSeries[] => {
  const x = [50, 200, 350, 500, 650, 800, 950, 1100, 1250];

  return [
    {
      name: "Data A",
      color: COLORS.ORANGE,
      symbol: "circle",
      x,
      y: [20, 35, 30, 45, 25, 40, 30, 20, 25],
    },
    {
      name: "Data B",
      color: COLORS.RED,
      symbol: "square",
      x,
      y: [120, 140, 130, 145, 160, 150, 135, 125, 155],
    },
    {
      name: "Data C",
      color: COLORS.GREEN,
      symbol: "diamond",
      x,
      y: [320, 360, 340, 380, 350, 370, 330, 345, 355],
    },
  ];
};

const generateNarrowRangeData = (): LineDataSeries[] => {
  const x = [400, 425, 450, 475, 500, 525, 550, 575, 600];

  return [
    {
      name: "Data A",
      color: COLORS.ORANGE,
      symbol: "circle",
      x,
      y: [160, 158, 165, 162, 170, 168, 172, 165, 175],
    },
    {
      name: "Data B",
      color: COLORS.RED,
      symbol: "square",
      x,
      y: [180, 182, 178, 185, 183, 188, 186, 184, 190],
    },
    {
      name: "Data C",
      color: COLORS.GREEN,
      symbol: "diamond",
      x,
      y: [200, 198, 204, 202, 208, 205, 210, 207, 212],
    },
  ];
};

const generateDemoData = (): LineDataSeries[] => {
  const x = [200, 300, 400, 500, 600, 700, 800, 900, 1000];

  return [
    {
      name: "Data A",
      color: COLORS.ORANGE,
      symbol: "circle",
      x,
      y: [75, 140, 105, 120, 145, 115, 110, 80, 90],
    },
    {
      name: "Data B",
      color: COLORS.RED,
      symbol: "square",
      x,
      y: [125, 160, 115, 145, 190, 180, 120, 105, 110],
    },
    {
      name: "Data C",
      color: COLORS.GREEN,
      symbol: "diamond",
      x,
      y: [185, 195, 145, 215, 205, 200, 160, 145, 135],
    },
    {
      name: "Data D",
      color: COLORS.BLUE,
      symbol: "triangle-up",
      x,
      y: [225, 215, 210, 245, 230, 230, 200, 185, 190],
    },
    {
      name: "Data E",
      color: COLORS.YELLOW,
      symbol: "triangle-down",
      x,
      y: [245, 260, 235, 265, 250, 250, 220, 220, 225],
    },
    {
      name: "Data F",
      color: COLORS.PURPLE,
      symbol: "pentagon",
      x,
      y: [275, 295, 270, 285, 300, 300, 250, 255, 260],
    },
  ];
};

const generateDemoDataWithErrorBars = (): LineDataSeries[] => {
  const baseSeries = generateDemoData();

  return baseSeries.map((series) => ({
    ...series,
    error_y: {
      type: "data",
      array: series.y.map(() => 10),
      visible: true,
    },
  }));
};

const meta: Meta<typeof LineGraph> = {
  title: "Organisms/LineGraph",
  component: LineGraph,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LineGraph>;

export const Basic: Story = {
  args: {
    dataSeries: generateBasicDemoData(),
    title: "Basic Line Graph",
  },
};

export const WithMarkers: Story = {
  args: {
    dataSeries: generateDataStartingFromZero(),
    variant: "lines+markers",
    title: "Line Graph with Markers",
  },
};

export const WithErrorBars: Story = {
  args: {
    dataSeries: generateDemoDataWithErrorBars(),
    variant: "lines+markers+error_bars",
    title: "Line Graph with Error Bars",
  },
};

export const WideRange: Story = {
  args: {
    dataSeries: generateWideRangeData(),
    variant: "lines+markers",
    title: "Wide Range Data Graph",
  },
};

export const NarrowRange: Story = {
  args: {
    dataSeries: generateNarrowRangeData(),
    variant: "lines+markers",
    title: "Narrow Range Data Graph",
  },
};

export const CustomAxes: Story = {
  args: {
    dataSeries: generateBasicDemoData(),
    xTitle: "Time (s)",
    yTitle: "Temperature (°C)",
    title: "Temperature Over Time",
  },
};

export const CustomRange: Story = {
  args: {
    dataSeries: generateBasicDemoData(),
    xRange: [300, 800],
    yRange: [100, 300],
    title: "Custom Range Graph",
  },
};

export const AutoRangeLineGraph: Story = {
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateDemoData(),
    variant: "lines+markers",
    xTitle: "Columns",
    yTitle: "Rows",
  },
  parameters: {
    docs: {
      description: {
        story:
          "This story demonstrates how the LineGraph automatically calculates appropriate ranges when none are provided.",
      },
    },
  },
};

export const WideRangeAutoScaled: Story = {
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateWideRangeData(),
    variant: "lines+markers",
    xTitle: "Columns",
    yTitle: "Rows",
  },
  parameters: {
    docs: {
      description: {
        story:
          "A graph with a wider data range, demonstrating how the LineGraph adapts its scales automatically.",
      },
    },
  },
};

export const NarrowRangeAutoScaled: Story = {
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateNarrowRangeData(),
    variant: "lines+markers",
    xTitle: "Columns",
    yTitle: "Rows",
  },
  parameters: {
    docs: {
      description: {
        story:
          "A graph with a narrower data range, showing how the LineGraph adapts to focused data.",
      },
    },
  },
};

export const OnlyXRangeProvided: Story = {
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateDemoData(),
    variant: "lines+markers",
    xRange: [150, 1050],
    xTitle: "Columns",
    yTitle: "Rows",
  },
  parameters: {
    docs: {
      description: {
        story:
          "In this example, only the X-axis range is provided, while the Y-axis uses autorange.",
      },
    },
  },
};

export const OnlyYRangeProvided: Story = {
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateDemoData(),
    variant: "lines+markers",
    yRange: [50, 350],
    xTitle: "Columns",
    yTitle: "Rows",
  },
  parameters: {
    docs: {
      description: {
        story:
          "In this example, only the Y-axis range is provided, while the X-axis uses autorange.",
      },
    },
  },
};

export const LineGraphStartingFromZero: Story = {
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateDataStartingFromZero(),
    variant: "lines+markers",
    xTitle: "Columns",
    yTitle: "Rows",
  },
  parameters: {
    docs: {
      description: {
        story:
          "This graph demonstrates data that starts from 0 on both axes, with evenly distributed data points.",
      },
    },
  },
};
