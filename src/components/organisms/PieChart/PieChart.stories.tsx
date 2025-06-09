import type { Meta, StoryObj } from "@storybook/react";
import { COLORS } from "../../../utils/colors";
import { PieChart } from "./index";

const meta = {
  title: "Organisms/PieChart",
  component: PieChart,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PieChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    dataSeries: {
      labels: [
        "pH",
        "Temperature",
        "Dissolved Oxygen",
        "Cell Density",
        "Viability",
      ],
      values: [12, 23, 35, 18, 12],
      name: "Bioreactor Parameters",
    },
    title: "Bioreactor",
    width: 480,
    height: 480,
    textInfo: "percent",
    hole: 0,
    rotation: 0,
  },
};

export const WithCustomColors: Story = {
  args: {
    dataSeries: {
      labels: [
        "pH",
        "Temperature",
        "Dissolved Oxygen",
        "Cell Density",
        "Viability",
      ],
      values: [12, 23, 35, 18, 12],
      name: "Bioreactor Parameters",
      colors: [
        COLORS.ORANGE,
        COLORS.RED,
        COLORS.GREEN,
        COLORS.BLUE,
        COLORS.PURPLE,
      ],
    },
    title: "Bioreactor Parameter Distribution",
    width: 480,
    height: 480,
    textInfo: "percent",
    hole: 0,
    rotation: 0,
  },
};

export const DonutChart: Story = {
  args: {
    dataSeries: {
      labels: [
        "pH",
        "Temperature",
        "Dissolved Oxygen",
        "Cell Density",
        "Viability",
      ],
      values: [12, 23, 35, 18, 12],
      name: "Bioreactor Parameters",
    },
    title: "Bioreactor Parameter Distribution (Donut)",
    width: 480,
    height: 480,
    textInfo: "label+percent",
    hole: 0.5,
    rotation: 0,
  },
};

export const WithLabelAndValues: Story = {
  args: {
    dataSeries: {
      labels: [
        "pH",
        "Temperature",
        "Dissolved Oxygen",
        "Cell Density",
        "Viability",
      ],
      values: [12, 23, 35, 18, 12],
      name: "Bioreactor Parameters",
    },
    title: "Bioreactor Parameter Distribution",
    width: 480,
    height: 480,
    textInfo: "label+value",
    hole: 0,
    rotation: 0,
  },
};

export const WithRotation: Story = {
  args: {
    dataSeries: {
      labels: [
        "pH",
        "Temperature",
        "Dissolved Oxygen",
        "Cell Density",
        "Viability",
      ],
      values: [12, 23, 35, 18, 12],
      name: "Bioreactor Parameters",
    },
    title: "Bioreactor Parameter Distribution (Rotated)",
    width: 480,
    height: 480,
    textInfo: "percent",
    hole: 0,
    rotation: 45,
  },
};
