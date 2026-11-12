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
  parameters: {
    zephyr: { testCaseId: "SW-T5797" },
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
  parameters: {
    zephyr: { testCaseId: "SW-T5798" },
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
  parameters: {
    zephyr: { testCaseId: "SW-T5799" },
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
  parameters: {
    zephyr: { testCaseId: "SW-T5800" },
  },
};

/**
 * A Levey-Jennings control chart: the centre line and the sigma bands come from `controlChart`.
 * The centre and sigma are the qualified mean and standard deviation, not estimated from the runs.
 */
export const ControlChart: Story = {
  args: {
    type: "line",
    title: "QC control chart",
    xTitle: "Run",
    yTitle: "Recovery (%)",
    dataSeries: [
      {
        name: "QC sample",
        symbol: "circle",
        x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        y: [100.4, 99.1, 101.8, 98.2, 103.5, 100.9, 97.6, 100.2, 105.1, 99.8],
      },
    ],
    controlChart: { center: 100, sigma: 1.5 },
    variant: "lines+markers",
  } as Story["args"],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("The centre and sigma labels render", async () => {
      await waitFor(() => {
        expect(canvas.getByText("Mean")).toBeInTheDocument();
        expect(canvas.getByText("+2σ")).toBeInTheDocument();
        expect(canvas.getByText("-3σ")).toBeInTheDocument();
      });
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5838" },
  },
};
