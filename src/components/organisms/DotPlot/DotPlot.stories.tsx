import type { Meta, StoryObj } from "@storybook/react";
import { COLORS } from "../../../utils/colors";
import { DotPlot, type MarkerSymbol } from "./DotPlot";

const meta: Meta<typeof DotPlot> = {
  title: "Organisms/DotPlot",
  component: DotPlot,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DotPlot>;

// Generate grid data for dotplot
const generateGridData = (
  rows: number,
  cols: number,
  density: number = 0.15
): { x: number[]; y: number[] } => {
  const x: number[] = [];
  const y: number[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (Math.random() < density) {
        x.push(col);
        y.push(row);
      }
    }
  }

  return { x, y };
};

// Generate stacked data for multiple series
const generateStackedData = (
  rows: number,
  cols: number,
  seriesCount: number
): Array<{ x: number[]; y: number[]; name: string }> => {
  const series: Array<{ x: number[]; y: number[]; name: string }> = [];
  const baseNames = ["Label", "Label", "Label", "Label", "Label", "Label"];

  for (let i = 0; i < seriesCount; i++) {
    const { x, y } = generateGridData(rows, cols, 0.05);
    series.push({
      x,
      y: y.map((val) => val + i * 0.2), // Slight offset for stacking effect
      name: baseNames[i % baseNames.length],
    });
  }

  return series;
};

export const Default: Story = {
  args: {
    dataSeries: {
      x: generateGridData(25, 41, 0.12).x,
      y: generateGridData(25, 41, 0.12).y,
      name: "Label",
      color: COLORS.ORANGE,
    },
    title: "Dotplot",
    xTitle: "Columns",
    yTitle: "Rows",
    width: 1000,
    height: 600,
    variant: "default",
    markerSize: 8,
  },
};

export const Stacked: Story = {
  args: {
    dataSeries: generateStackedData(25, 41, 4).map((series, index) => ({
      ...series,
      color: [
        COLORS.ORANGE,
        COLORS.RED,
        COLORS.GREEN,
        COLORS.BLUE,
        COLORS.YELLOW,
        COLORS.PURPLE,
      ][index],
      symbol: (
        ["circle", "square", "diamond", "triangle-up"] as MarkerSymbol[]
      )[index],
    })),
    title: "Dotplot Stacked",
    xTitle: "Columns",
    yTitle: "Rows",
    width: 1000,
    height: 600,
    variant: "stacked",
    markerSize: 8,
  },
};

export const WithCustomColors: Story = {
  args: {
    dataSeries: [
      {
        x: generateGridData(15, 25, 0.15).x,
        y: generateGridData(15, 25, 0.15).y,
        name: "Series A",
        color: COLORS.BLUE,
        symbol: "circle" as MarkerSymbol,
      },
      {
        x: generateGridData(15, 25, 0.1).x,
        y: generateGridData(15, 25, 0.1).y,
        name: "Series B",
        color: COLORS.RED,
        symbol: "square" as MarkerSymbol,
      },
    ],
    title: "Custom Colors Dotplot",
    xTitle: "X Axis",
    yTitle: "Y Axis",
    width: 1000,
    height: 600,
    variant: "stacked",
    markerSize: 10,
  },
};

export const LargeMarkers: Story = {
  args: {
    dataSeries: {
      x: generateGridData(12, 20, 0.18).x,
      y: generateGridData(12, 20, 0.18).y,
      name: "Large Dots",
      color: COLORS.GREEN,
    },
    title: "Large Marker Dotplot",
    xTitle: "Columns",
    yTitle: "Rows",
    width: 1000,
    height: 600,
    variant: "default",
    markerSize: 15,
  },
};

export const MultipleSeriesColors: Story = {
  args: {
    dataSeries: [
      {
        x: generateGridData(10, 15, 0.12).x,
        y: generateGridData(10, 15, 0.12).y,
        name: "Series A",
        color: COLORS.ORANGE,
        symbol: "circle" as MarkerSymbol,
      },
      {
        x: generateGridData(10, 15, 0.1).x,
        y: generateGridData(10, 15, 0.1).y,
        name: "Series B",
        color: COLORS.BLUE,
        symbol: "square" as MarkerSymbol,
      },
      {
        x: generateGridData(10, 15, 0.1).x,
        y: generateGridData(10, 15, 0.1).y,
        name: "Series C",
        color: COLORS.RED,
        symbol: "diamond" as MarkerSymbol,
      },
      {
        x: generateGridData(10, 15, 0.09).x,
        y: generateGridData(10, 15, 0.09).y,
        name: "Series D",
        color: COLORS.GREEN,
        symbol: "triangle-up" as MarkerSymbol,
      },
    ],
    title: "Multiple Series Colors",
    xTitle: "Position X",
    yTitle: "Position Y",
    width: 1000,
    height: 600,
    variant: "stacked",
    markerSize: 12,
  },
};

export const SmallScale: Story = {
  args: {
    dataSeries: {
      x: generateGridData(8, 12, 0.4).x,
      y: generateGridData(8, 12, 0.4).y,
      name: "Small Grid",
      color: COLORS.PURPLE,
    },
    title: "Small Scale Dotplot",
    xTitle: "X",
    yTitle: "Y",
    width: 500,
    height: 600,
    variant: "default",
    markerSize: 6,
  },
};

export const HighDensity: Story = {
  args: {
    dataSeries: {
      x: generateGridData(20, 30, 0.25).x,
      y: generateGridData(20, 30, 0.25).y,
      name: "High Density",
      color: COLORS.ORANGE,
    },
    title: "High Density Dotplot",
    xTitle: "Columns",
    yTitle: "Rows",
    width: 1000,
    height: 600,
    variant: "default",
    markerSize: 6,
  },
};
