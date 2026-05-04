import { expect, within } from "storybook/test";

import { StackedChromatogramChart } from "./StackedChromatogramChart";

import type { StackedChromatogramChartProps } from "./types";
import type { Meta, StoryObj } from "@storybook/react-vite";

const generateChromatogramData = (
  peaks: Array<{ rt: number; height: number; width: number }>,
  noise: number = 0.5
): { x: number[]; y: number[] } => {
  const x: number[] = [];
  const y: number[] = [];
  for (let t = 0; t <= 30; t += 0.05) {
    x.push(parseFloat(t.toFixed(2)));
    let signal = 0;
    peaks.forEach((peak) => {
      signal +=
        peak.height *
        Math.exp(-Math.pow(t - peak.rt, 2) / (2 * Math.pow(peak.width, 2)));
    });
    signal += (Math.random() - 0.5) * noise;
    y.push(Math.max(0, signal));
  }
  return { x, y };
};

// Three injections with slight retention-time drift — typical system suitability set
const injection1 = generateChromatogramData([
  { rt: 5.8, height: 420, width: 0.4 },
  { rt: 12.5, height: 180, width: 0.5 },
  { rt: 18.3, height: 350, width: 0.45 },
]);
const injection2 = generateChromatogramData(
  [
    { rt: 5.9, height: 380, width: 0.42 },
    { rt: 12.6, height: 195, width: 0.48 },
    { rt: 18.4, height: 320, width: 0.47 },
  ],
  0.8
);
const injection3 = generateChromatogramData(
  [
    { rt: 5.7, height: 440, width: 0.38 },
    { rt: 12.4, height: 170, width: 0.52 },
    { rt: 18.2, height: 365, width: 0.43 },
  ],
  0.6
);

const overlaySeriesData: StackedChromatogramChartProps["series"] = [
  { ...injection1, name: "Injection 1" },
  { ...injection2, name: "Injection 2" },
  { ...injection3, name: "Injection 3" },
];

// IgG charge-variant runs with clearly separated peaks for stack mode
const chargeVariant1 = generateChromatogramData([
  { rt: 5.2, height: 120, width: 0.25 },
  { rt: 5.8, height: 420, width: 0.3 },
  { rt: 6.5, height: 180, width: 0.25 },
]);
const chargeVariant2 = generateChromatogramData(
  [
    { rt: 5.3, height: 100, width: 0.25 },
    { rt: 5.9, height: 390, width: 0.31 },
    { rt: 6.6, height: 160, width: 0.26 },
  ],
  0.7
);
const chargeVariant3 = generateChromatogramData(
  [
    { rt: 5.1, height: 135, width: 0.24 },
    { rt: 5.75, height: 450, width: 0.29 },
    { rt: 6.4, height: 200, width: 0.24 },
  ],
  0.6
);

const stackSeriesData: StackedChromatogramChartProps["series"] = [
  { ...chargeVariant1, name: "Day 1" },
  { ...chargeVariant2, name: "Day 2" },
  { ...chargeVariant3, name: "Day 3" },
];

const meta: Meta<typeof StackedChromatogramChart> = {
  title: "Charts/StackedChromatogramChart",
  component: StackedChromatogramChart,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof StackedChromatogramChart>;

/**
 * Overlay mode (default) — all traces share the same y-axis. Useful for comparing
 * retention-time reproducibility across injections.
 */
export const OverlayMode: Story = {
  args: {
    series: overlaySeriesData,
    title: "Injection Overlay — System Suitability",
    stackingMode: "overlay",
    showCrosshairs: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      expect(
        canvas.getByText("Injection Overlay — System Suitability")
      ).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });

    await step("Three traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(3);
    });

    await step("Legend shows all injection names", async () => {
      expect(canvas.getByText("Injection 1")).toBeInTheDocument();
      expect(canvas.getByText("Injection 2")).toBeInTheDocument();
      expect(canvas.getByText("Injection 3")).toBeInTheDocument();
    });
  },
  parameters: {
    docs: {
      description: {
        story:
          "Overlay mode (default). All traces occupy the same y-axis range so retention times and peak heights can be compared directly. Crosshairs are enabled to aid comparison.",
      },
    },
    zephyr: { testCaseId: "SW-T1120" },
  },
};

/**
 * Stack mode — each series is offset vertically by stackOffset AU so traces don't
 * overlap. Ideal for visualizing many runs in a waterfall layout.
 */
export const StackMode: Story = {
  args: {
    series: stackSeriesData,
    title: "Charge Variant Runs — Stacked",
    stackingMode: "stack",
    stackOffset: 500,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      expect(
        canvas.getByText("Charge Variant Runs — Stacked")
      ).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });

    await step("Three traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(3);
    });

    await step("Legend shows all day labels", async () => {
      expect(canvas.getByText("Day 1")).toBeInTheDocument();
      expect(canvas.getByText("Day 2")).toBeInTheDocument();
      expect(canvas.getByText("Day 3")).toBeInTheDocument();
    });
  },
  parameters: {
    docs: {
      description: {
        story:
          "Stack mode shifts each series up by stackOffset data units, creating a waterfall layout. The y-axis range automatically expands to fit all offset traces.",
      },
    },
    zephyr: { testCaseId: "SW-T1121" },
  },
};

/**
 * Stack mode with per-series peak annotations. Each annotations[i] array maps to
 * series[i]; in stack mode the annotation y-values are shifted by the same offset as
 * the trace so labels stay pinned to their peaks.
 */
export const StackModeWithAnnotations: Story = {
  args: {
    series: stackSeriesData,
    title: "Stacked Runs with Peak Labels",
    stackingMode: "stack",
    stackOffset: 500,
    annotations: [
      // Day 1 annotations
      [
        { x: 5.8, y: 420, text: "Main", ay: -35 },
        { x: 5.2, y: 120, text: "Acidic", ay: -35, ax: -30 },
        { x: 6.5, y: 180, text: "Basic", ay: -35, ax: 30 },
      ],
      // Day 2 annotations
      [
        { x: 5.9, y: 390, text: "Main", ay: -35 },
        { x: 5.3, y: 100, text: "Acidic", ay: -35, ax: -30 },
        { x: 6.6, y: 160, text: "Basic", ay: -35, ax: 30 },
      ],
      // Day 3 annotations
      [
        { x: 5.75, y: 450, text: "Main", ay: -35 },
        { x: 5.1, y: 135, text: "Acidic", ay: -35, ax: -30 },
        { x: 6.4, y: 200, text: "Basic", ay: -35, ax: 30 },
      ],
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      expect(
        canvas.getByText("Stacked Runs with Peak Labels")
      ).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });

    await step("Three traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(3);
    });

    await step("Annotations are rendered", async () => {
      const annotationEls = canvasElement.querySelectorAll(".annotation-text");
      // 3 series × 3 peaks each = 9 annotations total
      expect(annotationEls.length).toBeGreaterThanOrEqual(9);
    });
  },
  parameters: {
    docs: {
      description: {
        story:
          "Per-series annotations passed as a 2-D array (annotations[i] → series[i]). In stack mode the component automatically shifts each annotation's y-value by the same offset applied to its trace, so labels stay anchored to their peaks.",
      },
    },
    zephyr: { testCaseId: "SW-T1122" },
  },
};

/**
 * Overlay with automatic peak detection enabled. Since both modes share the same
 * underlying ChromatogramChart, all peak-detection and boundary-marker features work
 * transparently in both modes.
 */
export const OverlayWithPeakDetection: Story = {
  args: {
    series: [
      { ...injection1, name: "Injection 1" },
      { ...injection2, name: "Injection 2" },
    ],
    title: "Overlay + Auto Peak Detection",
    stackingMode: "overlay",
    peakDetectionOptions: {
      minHeight: 0.1,
      prominence: 0.05,
      minDistance: 20,
    },
    showPeakAreas: true,
    boundaryMarkers: "enabled",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      expect(
        canvas.getByText("Overlay + Auto Peak Detection")
      ).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });

    await step("Two data traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      // Main traces + boundary marker traces
      expect(traces.length).toBeGreaterThanOrEqual(2);
    });

    await step("Peak area annotations are displayed", async () => {
      const annotations = canvasElement.querySelectorAll(".annotation-text");
      expect(annotations.length).toBeGreaterThan(0);
    });
  },
  parameters: {
    docs: {
      description: {
        story:
          "Overlay mode with automatic peak detection, area display, and boundary markers enabled. All ChromatogramChart features (peak detection, boundary markers, range annotations, baseline correction) are available in both stacking modes.",
      },
    },
    zephyr: { testCaseId: "SW-T1123" },
  },
};

// Per-series fraction windows for the charge-variant stack stories.
// Each series has three adjacent fractions; yAnchor is set just above the
// local peak maximum so bars stay pinned to their trace when the offset changes.
const fractionAnnotationsPerSeries = [
  // Day 1 — unshifted; peaks at ~135 (Acidic), ~450 (Main), ~200 (Basic)
  [
    { label: "Acidic", startX: 4.8, endX: 5.45, color: "#8E8E93", yAnchor: 145, barHeight: 30 },
    { label: "Main",   startX: 5.45, endX: 6.25, color: "#007AFF", yAnchor: 460, barHeight: 30 },
    { label: "Basic",  startX: 6.25, endX: 7.0,  color: "#34C759", yAnchor: 210, barHeight: 30 },
  ],
  // Day 2 — same yAnchor values; in stack mode these are shifted up by stackOffset
  [
    { label: "Acidic", startX: 4.8, endX: 5.45, color: "#8E8E93", yAnchor: 145, barHeight: 30 },
    { label: "Main",   startX: 5.45, endX: 6.25, color: "#007AFF", yAnchor: 460, barHeight: 30 },
    { label: "Basic",  startX: 6.25, endX: 7.0,  color: "#34C759", yAnchor: 210, barHeight: 30 },
  ],
  // Day 3
  [
    { label: "Acidic", startX: 4.8, endX: 5.45, color: "#8E8E93", yAnchor: 145, barHeight: 30 },
    { label: "Main",   startX: 5.45, endX: 6.25, color: "#007AFF", yAnchor: 460, barHeight: 30 },
    { label: "Basic",  startX: 6.25, endX: 7.0,  color: "#34C759", yAnchor: 210, barHeight: 30 },
  ],
];

/**
 * Three stacked runs each labelled with Acidic / Main / Basic fraction windows.
 * The bars are positioned with numeric yAnchor so they are pinned just above their
 * respective trace — they shift upward by stackOffset × seriesIndex automatically.
 */
export const StackWithRangeAnnotations: Story = {
  args: {
    series: stackSeriesData,
    title: "Charge Variant Fractions — Stacked",
    stackingMode: "stack",
    stackOffset: 500,
    rangeAnnotations: fractionAnnotationsPerSeries,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      expect(
        canvas.getByText("Charge Variant Fractions — Stacked")
      ).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });

    await step("Three data traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(3);
    });

    await step("Range annotation labels are rendered (3 fractions × 3 series)", async () => {
      const labels = canvasElement.querySelectorAll(".annotation-text");
      // 3 fractions × 3 series = 9 range annotation labels
      expect(labels.length).toBeGreaterThanOrEqual(9);
    });
  },
  parameters: {
    docs: {
      description: {
        story:
          "Each series carries its own set of fraction windows (Acidic / Main / Basic) defined with numeric `yAnchor` values relative to the unshifted data. In stack mode the component adds `seriesIndex × stackOffset` to each numeric `yAnchor`, so the bars stay anchored just above their own trace regardless of the offset.",
      },
    },
    zephyr: { testCaseId: "SW-T1125" },
  },
};

/**
 * Drag the "Stack Offset" slider in the Controls panel to adjust the vertical
 * separation between traces in real time. stackingMode is locked to 'stack'.
 */
export const InteractiveOffset: Story = {
  argTypes: {
    stackOffset: {
      control: { type: "range", min: 0, max: 700, step: 10 },
      description: "Vertical separation between stacked traces (data units)",
    },
  },
  args: {
    series: stackSeriesData,
    title: "Stacked Offset — Interactive",
    stackingMode: "stack",
    stackOffset: 500,
    showCrosshairs: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Use the **Stack Offset** slider in the Controls panel to adjust vertical separation between traces live. At 0 the traces overlap (equivalent to overlay mode); increasing the offset creates a waterfall layout.",
      },
    },
    zephyr: { testCaseId: "SW-T1124" },
  },
};

// Fraction windows for the interactive story.
// yAnchor = peak_height - barHeight so each bar's top sits at the peak apex —
// bars are always inside the stacked y-axis range and move with their trace.
const fractionAnnotationsInteractive = [
  [
    { label: "Acidic", startX: 4.8,  endX: 5.45, color: "#8E8E93", yAnchor: 90,  barHeight: 25 },
    { label: "Main",   startX: 5.45, endX: 6.25, color: "#007AFF", yAnchor: 390, barHeight: 25 },
    { label: "Basic",  startX: 6.25, endX: 7.0,  color: "#34C759", yAnchor: 150, barHeight: 25 },
  ],
  [
    { label: "Acidic", startX: 4.8,  endX: 5.2,  color: "#FF9500", yAnchor: 65,  barHeight: 25 },
    { label: "Main",      startX: 5.5,  endX: 6.3,  color: "#007AFF", yAnchor: 362, barHeight: 25 },
    { label: "Basic",     startX: 6.3,  endX: 7.0,  color: "#34C759", yAnchor: 130, barHeight: 25 },
  ],
  [
    { label: "Acidic", startX: 4.7,  endX: 5.4,  color: "#8E8E93", yAnchor: 108, barHeight: 25 },
    { label: "Main",   startX: 5.4,  endX: 6.15, color: "#007AFF", yAnchor: 420, barHeight: 25 },
    { label: "Basic",  startX: 6.15, endX: 6.8,  color: "#34C759", yAnchor: 170, barHeight: 25 },
  ],
];

/**
 * Combine the offset slider with per-series fraction windows positioned just above
 * each trace. Dragging the slider moves both traces and their bars together.
 */
export const InteractiveOffsetWithRangeAnnotations: Story = {
  argTypes: {
    stackOffset: {
      control: { type: "range", min: 0, max: 700, step: 10 },
      description: "Vertical separation between stacked traces (data units)",
    },
  },
  args: {
    series: stackSeriesData,
    title: "Stacked Fractions — Interactive Offset",
    stackingMode: "stack",
    stackOffset: 500,
    rangeAnnotations: fractionAnnotationsInteractive,
    showCrosshairs: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Drag the **Stack Offset** slider to spread or collapse the traces. Each run's fraction bars use a numeric `yAnchor` set just above the local peak, so bars move with their trace. Day 2 splits the acidic region into Acidic-01 / Acidic-02; Day 3 uses slightly shifted boundaries.",
      },
    },
    zephyr: { testCaseId: "SW-T1126" },
  },
};
