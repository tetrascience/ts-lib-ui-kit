import { expect, waitFor, within } from "storybook/test";

import { Chart } from "./Chart";

import type { Fit, FitGroup, Fitter } from "@/vendor/ts-lib-viz/core";
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

/**
 * Demo fitter for the dose-response stories only. A four-parameter logistic has its bottom and
 * top solved by linear least squares for each EC50 and Hill slope, so a grid over those two
 * finds the least-squares fit. The consuming app's stats service does this in production.
 */
const demoFitter: Fitter = async (requests) => {
  const byLayer = new Map<string, { fits: Fit[]; dropped: number }>();
  for (const request of requests) {
    byLayer.set(request.layerId, { fits: request.groups.map(fourPlFit), dropped: 0 });
  }
  return byLayer;
};

function fourPlFit(group: FitGroup): Fit {
  const logX = group.points.map((point) => Math.log10(point.x));
  const ys = group.points.map((point) => point.y);
  const n = ys.length;
  const low = Math.min(...logX);
  const high = Math.max(...logX);
  const shape = (lx: number, logEc50: number, hill: number) => 1 / (1 + Math.pow(10, -hill * (lx - logEc50)));

  let best = { sse: Number.POSITIVE_INFINITY, logEc50: low, hill: 1, bottom: 0, top: 0 };
  for (let i = 0; i <= 120; i += 1) {
    const logEc50 = low + ((high - low) * i) / 120;
    for (let j = 0; j <= 40; j += 1) {
      const hill = Math.pow(10, -1 + (2 * j) / 40);
      let aa = 0;
      let ab = 0;
      let bb = 0;
      let ay = 0;
      let by = 0;
      logX.forEach((lx, k) => {
        const g = shape(lx, logEc50, hill);
        aa += (1 - g) * (1 - g);
        ab += (1 - g) * g;
        bb += g * g;
        ay += (1 - g) * ys[k]!;
        by += g * ys[k]!;
      });
      const det = aa * bb - ab * ab;
      if (Math.abs(det) < 1e-12) continue;
      const bottom = (ay * bb - by * ab) / det;
      const top = (by * aa - ay * ab) / det;
      const sse = logX.reduce((total, lx, k) => {
        const g = shape(lx, logEc50, hill);
        return total + (ys[k]! - (bottom * (1 - g) + top * g)) ** 2;
      }, 0);
      if (sse < best.sse) best = { sse, logEc50, hill, bottom, top };
    }
  }

  const mean = ys.reduce((total, y) => total + y, 0) / n;
  const sst = ys.reduce((total, y) => total + (y - mean) ** 2, 0);
  const curveX = Array.from({ length: 100 }, (_, i) => Math.pow(10, low + ((high - low) * i) / 99));
  const curveY = curveX.map((x) => {
    const g = shape(Math.log10(x), best.logEc50, best.hill);
    return best.bottom * (1 - g) + best.top * g;
  });

  return {
    id: group.id,
    ...(group.panel === undefined ? {} : { panel: group.panel }),
    success: true,
    reason: null,
    params: { bottom: best.bottom, top: best.top, ec50: Math.pow(10, best.logEc50), hill: best.hill },
    r2: sst === 0 ? null : 1 - best.sse / sst,
    rmse: Math.sqrt(best.sse / n),
    n,
    curveX,
    curveY,
    band: null,
  };
}

const DOSES = [0.01, 0.03, 0.1, 0.3, 1, 3, 10, 30, 100];
const NOISE = [1.5, -2, 0.8, -1.1, 2.2, -0.6, 1, -1.8, 0.4];
/** A four-parameter logistic, with a fixed noise pattern so the story is the same on every run. */
const logistic = (dose: number, ec50: number, hill: number) => 5 + 95 / (1 + Math.pow(dose / ec50, -hill));

/**
 * A dose-response with a fitted 4PL curve through each compound. The fitter is what draws the
 * curves; ts-lib-viz does not compute them.
 */
export const DoseResponse: Story = {
  args: {
    type: "doseResponse",
    title: "Inhibition by dose",
    xTitle: "Concentration (µM)",
    yTitle: "Inhibition (%)",
    dataSeries: [
      {
        name: "Compound A",
        dose: DOSES,
        response: DOSES.map((dose, i) => Math.round((logistic(dose, 1, 1.2) + NOISE[i]!) * 10) / 10),
        error: DOSES.map(() => 3),
      },
      {
        name: "Compound B",
        dose: DOSES,
        response: DOSES.map((dose, i) => Math.round((logistic(dose, 0.3, 2) + NOISE[8 - i]!) * 10) / 10),
      },
    ],
    fitter: demoFitter,
  } as Story["args"],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("The title and both series render", async () => {
      await waitFor(() => {
        expect(canvas.getByText("Inhibition by dose")).toBeInTheDocument();
      });
      expect(canvas.getByText("Compound A")).toBeInTheDocument();
      expect(canvas.getByText("Compound B")).toBeInTheDocument();
    });
    await step("A fitted curve is drawn through each series", async () => {
      await waitFor(() => {
        const curves = canvasElement.querySelectorAll('path[fill="none"][stroke-linecap="round"]');
        expect(curves.length).toBeGreaterThanOrEqual(2);
      });
    });
  },
};

/**
 * The same data with no fitter: the chart draws the points and their error bars, and no curve.
 */
export const DoseResponsePointsOnly: Story = {
  args: {
    type: "doseResponse",
    title: "Measured response by dose",
    xTitle: "Concentration (µM)",
    yTitle: "Inhibition (%)",
    dataSeries: [
      {
        name: "Compound A",
        dose: DOSES,
        response: DOSES.map((dose, i) => Math.round((logistic(dose, 1, 1.2) + NOISE[i]!) * 10) / 10),
        error: DOSES.map(() => 3),
      },
    ],
  } as Story["args"],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("The points render without a fitted curve", async () => {
      await waitFor(() => {
        expect(canvas.getByText("Measured response by dose")).toBeInTheDocument();
      });
      expect(canvasElement.querySelector("svg")).toBeInTheDocument();
      expect(canvasElement.querySelectorAll('path[fill="none"][stroke-linecap="round"]')).toHaveLength(0);
    });
  },
};
