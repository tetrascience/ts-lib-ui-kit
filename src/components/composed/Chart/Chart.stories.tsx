import { expect, waitFor, within } from "storybook/test";

import { Chart } from "./Chart";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Chart> = {
  title: "Data Viz/Chart",
  component: Chart,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Chart>;

const wells = ["A", "B"].flatMap((row, rowIndex) =>
  Array.from({ length: 12 }, (_, column) => ({
    wellId: `${row}${column + 1}`,
    values: { RFU: 1000 + (rowIndex * 12 + column) * 250 },
  })),
);

/**
 * Pick the chart with `type`. The other props are the ones that chart takes.
 * Here, a line chart of two runs.
 */
export const Line: Story = {
  args: {
    type: "line",
    title: "Signal over time",
    xTitle: "Time (s)",
    yTitle: "Signal",
    dataSeries: [
      { name: "Run 1", x: [0, 1, 2, 3, 4], y: [2, 5, 3, 8, 6] },
      { name: "Run 2", x: [0, 1, 2, 3, 4], y: [1, 4, 6, 5, 9] },
    ],
  } as Story["args"],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("The title and an SVG chart render", async () => {
      await waitFor(() => {
        expect(canvas.getByText("Signal over time")).toBeInTheDocument();
      });
      expect(canvasElement.querySelector("svg")).toBeInTheDocument();
    });
  },
};

/** The same component, switched to a histogram by changing `type` alone. */
export const Histogram: Story = {
  args: {
    type: "histogram",
    title: "Peak heights",
    xTitle: "Height",
    dataSeries: [{ name: "Peaks", x: [4, 5, 5, 6, 6, 6, 7, 7, 8, 9, 9, 10] }],
  } as Story["args"],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("The title and an SVG chart render", async () => {
      await waitFor(() => {
        expect(canvas.getByText("Peak heights")).toBeInTheDocument();
      });
      expect(canvasElement.querySelector("svg")).toBeInTheDocument();
    });
  },
};

/** A plate, with the same `Chart` entry point. */
export const PlateMap: Story = {
  args: {
    type: "plateMap",
    title: "Plate read",
    plateFormat: "custom",
    rows: 2,
    columns: 12,
    data: wells,
    layerConfigs: [{ id: "RFU", valueUnit: "RFU" }],
    width: 640,
    height: 260,
  } as Story["args"],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("The plate renders one marker per well", async () => {
      await waitFor(() => {
        expect(canvas.getByText("Plate read")).toBeInTheDocument();
      });
      expect(canvasElement.querySelectorAll(".platemap-plot circle")).toHaveLength(24);
    });
  },
};

/**
 * A line chart with a threshold and a note. Reference lines and annotations work on every
 * line-based chart type; the threshold stays where its value puts it.
 */
export const ReferenceLines: Story = {
  args: {
    type: "line",
    title: "Signal against a limit",
    xTitle: "Time (s)",
    yTitle: "Signal",
    dataSeries: [{ name: "Run", x: [0, 1, 2, 3, 4], y: [2, 5, 3, 8, 6] }],
    referenceLines: [
      { axis: "y", value: 5, label: "limit", color: "#b91c1c", linetype: "dashed" },
      { axis: "x", value: 3, label: "dose" },
    ],
    annotations: [{ x: 3, y: 8, text: "peak" }],
  } as Story["args"],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("The threshold label renders", async () => {
      await waitFor(() => {
        expect(canvas.getByText("limit")).toBeInTheDocument();
      });
    });
  },
};

/** Deterministic samples around a centre, so the story draws the same shapes on every run. */
const samples = (centre: number, spread: number, count: number) =>
  Array.from({ length: count }, (_, index) => centre + spread * Math.sin(index * 1.7) * Math.cos(index * 0.6));

/**
 * One violin per group, drawn from the raw readings. The median tick and the quartile lines
 * come from the violin itself; `showPoints` adds each reading as a jittered point.
 */
export const Violin: Story = {
  args: {
    type: "violin",
    title: "Expression by group",
    yTitle: "Signal",
    showPoints: true,
    dataSeries: [
      { name: "Control", y: samples(10, 2, 40) },
      { name: "Low dose", y: samples(13, 2.5, 40) },
      { name: "High dose", y: samples(18, 1.5, 40) },
    ],
  } as Story["args"],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("The title renders and one violin is drawn per group", async () => {
      await waitFor(() => {
        expect(canvas.getByText("Expression by group")).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(canvasElement.querySelectorAll('[data-geom="violin"]')).toHaveLength(3);
      });
    });
    await step("Each reading is drawn as a point", async () => {
      expect(canvasElement.querySelectorAll("circle").length).toBeGreaterThanOrEqual(120);
    });
  },
};
