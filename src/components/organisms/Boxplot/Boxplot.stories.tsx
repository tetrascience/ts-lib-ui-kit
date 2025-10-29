import type { Meta, StoryObj } from "@storybook/react";
import { COLORS } from "./../../../utils/colors";
import { Boxplot, BoxDataSeries } from "./Boxplot";

const meta: Meta<typeof Boxplot> = {
  title: "Organisms/Boxplot",
  component: Boxplot,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Boxplot>;

const generateBasicBoxData = (): BoxDataSeries[] => {
  return [
    {
      name: "Data A",
      color: COLORS.ORANGE,
      y: [155, 135, 175, 185, 120, 125, 140, 160, 180, 145, 170, 165, 150],
    },
  ];
};

const generateMultipleBoxData = (): BoxDataSeries[] => {
  return [
    {
      name: "Group 1",
      color: COLORS.ORANGE,
      y: [155, 135, 175, 185, 120, 125, 140, 160, 180, 145, 170, 165, 150],
      x: ["Group 1"],
    },
    {
      name: "Group 2",
      color: COLORS.RED,
      y: [90, 85, 95, 105, 75, 80, 88, 92, 98, 82, 96, 87, 91],
      x: ["Group 2"],
    },
    {
      name: "Group 3",
      color: COLORS.GREEN,
      y: [185, 165, 205, 215, 150, 155, 170, 190, 210, 175, 200, 195, 180],
      x: ["Group 3"],
    },
    {
      name: "Group 4",
      color: COLORS.BLUE,
      y: [220, 200, 240, 250, 185, 190, 205, 225, 245, 210, 235, 230, 215],
      x: ["Group 4"],
    },
    {
      name: "Group 5",
      color: COLORS.PURPLE,
      y: [135, 115, 155, 165, 100, 105, 120, 140, 160, 125, 150, 145, 130],
      x: ["Group 5"],
    },
  ];
};

const generateCategoricalBoxData = (): BoxDataSeries[] => {
  return [
    {
      name: "Category A",
      color: COLORS.ORANGE,
      y: [
        155, 135, 175, 185, 120, 125, 140, 160, 180, 145, 170, 165, 150, 155,
        135, 175, 185, 120, 125, 140,
      ],
      x: [
        "200",
        "200",
        "200",
        "200",
        "200",
        "200",
        "200",
        "200",
        "200",
        "200",
        "200",
        "200",
        "200",
        "200",
        "200",
        "200",
        "200",
        "200",
        "200",
        "200",
      ],
    },
    {
      name: "Category B",
      color: COLORS.RED,
      y: [
        90, 85, 95, 105, 75, 80, 88, 92, 98, 82, 96, 87, 91, 85, 95, 105, 75,
        80, 88, 92,
      ],
      x: [
        "350",
        "350",
        "350",
        "350",
        "350",
        "350",
        "350",
        "350",
        "350",
        "350",
        "350",
        "350",
        "350",
        "350",
        "350",
        "350",
        "350",
        "350",
        "350",
        "350",
      ],
    },
    {
      name: "Category C",
      color: COLORS.GREEN,
      y: [
        68, 45, 85, 95, 30, 35, 48, 68, 88, 53, 78, 73, 58, 65, 75, 85, 40, 45,
        58, 72,
      ],
      x: [
        "500",
        "500",
        "500",
        "500",
        "500",
        "500",
        "500",
        "500",
        "500",
        "500",
        "500",
        "500",
        "500",
        "500",
        "500",
        "500",
        "500",
        "500",
        "500",
        "500",
      ],
    },
    {
      name: "Category D",
      color: COLORS.BLUE,
      y: [
        220, 200, 240, 250, 185, 190, 205, 225, 245, 210, 235, 230, 215, 225,
        195, 235, 245, 180, 185, 200,
      ],
      x: [
        "800",
        "800",
        "800",
        "800",
        "800",
        "800",
        "800",
        "800",
        "800",
        "800",
        "800",
        "800",
        "800",
        "800",
        "800",
        "800",
        "800",
        "800",
        "800",
        "800",
      ],
    },
    {
      name: "Category E",
      color: COLORS.PURPLE,
      y: [
        135, 115, 155, 165, 100, 105, 120, 140, 160, 125, 150, 145, 130, 125,
        135, 145, 90, 95, 110, 130,
      ],
      x: [
        "1000",
        "1000",
        "1000",
        "1000",
        "1000",
        "1000",
        "1000",
        "1000",
        "1000",
        "1000",
        "1000",
        "1000",
        "1000",
        "1000",
        "1000",
        "1000",
        "1000",
        "1000",
        "1000",
        "1000",
      ],
    },
  ];
};

export const Basic: Story = {
  args: {
    dataSeries: generateBasicBoxData(),
    title: "Boxplot",
    width: 1000,
    height: 600,
  },
};

export const MultipleBoxes: Story = {
  args: {
    dataSeries: generateMultipleBoxData(),
    title: "Multiple Boxplots",
    width: 1000,
    height: 600,
  },
};

export const CategoricalData: Story = {
  args: {
    dataSeries: generateCategoricalBoxData(),
    title: "Boxplot",
    xTitle: "Columns",
    yTitle: "Rows",
    width: 1000,
    height: 600,
  },
};

export const WithOutliers: Story = {
  args: {
    dataSeries: generateCategoricalBoxData(),
    title: "Boxplot with Outliers",
    xTitle: "Columns",
    yTitle: "Rows",
    showPoints: true,
    width: 1000,
    height: 600,
  },
};

export const CustomStyling: Story = {
  args: {
    dataSeries: generateCategoricalBoxData(),
    title: "Custom Boxplot",
    xTitle: "X-Axis Label",
    yTitle: "Y-Axis Label",
    width: 1000,
    height: 600,
    showPoints: true,
  },
};
