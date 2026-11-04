import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Chromatogram, type ChromatogramSeries, type PeakAnnotation, type PeakSelectEvent } from "./Chromatogram";

import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Generate realistic HPLC chromatogram data with Gaussian peaks
 */
const generateChromatogramData = (
  peaks: Array<{ rt: number; height: number; width: number }>,
  noise: number = 0.5,
): { x: number[]; y: number[] } => {
  const x: number[] = [];
  const y: number[] = [];

  for (let t = 0; t <= 30; t += 0.05) {
    x.push(parseFloat(t.toFixed(2)));
    let signal = 0;
    peaks.forEach((peak) => {
      signal += peak.height * Math.exp(-Math.pow(t - peak.rt, 2) / (2 * Math.pow(peak.width, 2)));
    });
    signal += (Math.random() - 0.5) * noise;
    y.push(Math.max(0, signal));
  }
  return { x, y };
};

// Sample data for a single injection
const singleInjectionData = generateChromatogramData([
  { rt: 3.2, height: 150, width: 0.3 },
  { rt: 5.8, height: 420, width: 0.4 },
  { rt: 8.1, height: 280, width: 0.35 },
  { rt: 12.5, height: 180, width: 0.5 },
  { rt: 18.3, height: 350, width: 0.45 },
  { rt: 24.1, height: 220, width: 0.4 },
]);

// Sample data for multiple injections (overlay comparison)
const multiInjectionData: ChromatogramSeries[] = [
  {
    ...generateChromatogramData([
      { rt: 5.8, height: 420, width: 0.4 },
      { rt: 12.5, height: 180, width: 0.5 },
      { rt: 18.3, height: 350, width: 0.45 },
    ]),
    name: "Injection 1",
  },
  {
    ...generateChromatogramData(
      [
        { rt: 5.9, height: 380, width: 0.42 },
        { rt: 12.6, height: 195, width: 0.48 },
        { rt: 18.4, height: 320, width: 0.47 },
      ],
      0.8,
    ),
    name: "Injection 2",
  },
  {
    ...generateChromatogramData(
      [
        { rt: 5.7, height: 440, width: 0.38 },
        { rt: 12.4, height: 170, width: 0.52 },
        { rt: 18.2, height: 365, width: 0.43 },
      ],
      0.6,
    ),
    name: "Injection 3",
  },
];

// User-defined peaks with boundary information.
// Provide startX and endX (retention times) — the component computes area and boundary markers.
const userDefinedPeaks: PeakAnnotation[] = [
  {
    x: 5.8,
    y: 420,
    text: "Caffeine (pass)",
    color: "#22c55e",
    ay: -40,
    startX: 5.0,
    endX: 6.6,
  },
  {
    x: 12.5,
    y: 180,
    text: "Theobromine (fail)",
    color: "#ef4444",
    ay: -55,
    startX: 11.5,
    endX: 13.5,
  },
  {
    x: 18.3,
    y: 350,
    text: "Theophylline (N/A)",
    color: "#6b7280",
    ay: -80,
    startX: 17.3,
    endX: 19.3,
  },
];

// Annotations with stable IDs for selection stories
const selectableAnnotations: PeakAnnotation[] = [
  { id: "caffeine", x: 5.8, y: 420, text: "Caffeine" },
  { id: "theobromine", x: 12.5, y: 180, text: "Theobromine" },
  { id: "theophylline", x: 18.3, y: 350, text: "Theophylline" },
];

const meta: Meta<typeof Chromatogram> = {
  title: "Data Viz/Chromatogram/Default",
  component: Chromatogram,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Chromatogram>;

/**
 * Basic single trace chromatogram - the simplest usage of the component.
 */
export const SingleTrace: Story = {
  args: {
    series: [{ ...singleInjectionData, name: "Sample A" }],
    title: "HPLC Chromatogram - Single Injection",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      await waitFor(
        () => {
          const title = canvas.getByText("HPLC Chromatogram - Single Injection");
          expect(title).toBeInTheDocument();
        },
        { timeout: 15000 },
      );
    });

    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector("svg");
      expect(container).toBeInTheDocument();
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Basic chromatogram with a single trace. This is the simplest usage of the component.",
      },
    },
    zephyr: { testCaseId: "SW-T1108" },
  },
};

/**
 * Overlay multiple injections to compare retention times and peak intensities.
 */
export const MultipleTraces: Story = {
  args: {
    series: multiInjectionData,
    title: "HPLC Chromatogram - Injection Overlay",
    showCrosshairs: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      await waitFor(() => {
        const title = canvas.getByText("HPLC Chromatogram - Injection Overlay");
        expect(title).toBeInTheDocument();
      });
    });

    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector("svg");
      expect(container).toBeInTheDocument();
    });

    await step("Legend shows all series names", async () => {
      expect(canvas.getByText("Injection 1")).toBeInTheDocument();
      expect(canvas.getByText("Injection 2")).toBeInTheDocument();
      expect(canvas.getByText("Injection 3")).toBeInTheDocument();
    });
  },
  parameters: {
    docs: {
      description: {
        story:
          "Overlay multiple injections to compare retention times and peak intensities. Crosshairs help compare values across traces.",
      },
    },
    zephyr: { testCaseId: "SW-T1109" },
  },
};

/**
 * Automatic peak detection with area calculations using trapezoidal integration.
 */
export const PeakDetection: Story = {
  args: {
    series: [{ ...singleInjectionData, name: "Sample A" }],
    title: "Automatic Peak Detection",
    peakDetectionOptions: {
      minHeight: 0.1,
      prominence: 0.05,
      minDistance: 20,
    },
    showPeakAreas: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      await waitFor(() => {
        const title = canvas.getByText("Automatic Peak Detection");
        expect(title).toBeInTheDocument();
      });
    });

    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector("svg");
      expect(container).toBeInTheDocument();
    });

    await step("Peak area annotations are displayed", async () => {
      // Peak areas are drawn as labels with "Area:" text
      expect(canvas.getAllByText(/Area: /).length).toBeGreaterThan(0);
    });
  },
  parameters: {
    docs: {
      description: {
        story:
          "Automatic peak detection identifies peaks based on height, prominence, and minimum distance. Peak areas are calculated using trapezoidal integration.",
      },
    },
    zephyr: { testCaseId: "SW-T1111" },
  },
};

/**
 * User-provided peaks with startX / endX boundaries and per-peak pass/fail colors.
 * Boundary markers (triangle at start, diamond at end) and annotation label/arrow/border
 * all inherit the peak color. Area is auto-computed via trapezoidal integration over the
 * bounded slice — no auto-detection needed.
 */
export const UserDefinedPeaks: Story = {
  args: {
    series: [{ ...singleInjectionData, name: "Sample A" }],
    title: "User-Defined Peak Boundaries",
    annotations: userDefinedPeaks,
    boundaryMarkers: "enabled",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      await waitFor(() => {
        const title = canvas.getByText("User-Defined Peak Boundaries");
        expect(title).toBeInTheDocument();
      });
    });

    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector("svg");
      expect(container).toBeInTheDocument();
    });

    await step("Colored peak annotations are displayed", async () => {
      expect(canvas.getByText("Caffeine (pass)")).toBeInTheDocument();
      expect(canvas.getByText("Theobromine (fail)")).toBeInTheDocument();
      expect(canvas.getByText("Theophylline (N/A)")).toBeInTheDocument();
    });
  },
  parameters: {
    docs: {
      description: {
        story:
          "Supply `startX`, `endX`, and `color` on each annotation to define peak boundaries with pass/fail coloring (green = pass, red = fail, grey = N/A). The component renders triangle markers (▲) at the start and diamond markers (◆) at the end; the label, arrow, border, and boundary markers all inherit the per-peak color. Area is auto-computed via trapezoidal integration over the bounded slice.",
      },
    },
    zephyr: { testCaseId: "SW-T5420" },
  },
};

/**
 * Region overlay: two peaks have a thickened colored segment painted along the
 * underlying trace between their startX/endX boundaries, using per-peak colors
 * (green = pass, red = fail).
 */
export const WithRegionOverlay: Story = {
  args: {
    series: [{ ...singleInjectionData, name: "Sample A" }],
    title: "Peak Region Overlays",
    annotationStyle: "inline",
    annotations: [
      {
        id: "peak-pass",
        x: 5.8,
        y: 420,
        text: "Caffeine (pass)",
        color: "#22c55e",
        startX: 5.0,
        endX: 6.6,
        regionOverlay: true,
        regionOverlayWidth: 4,
        hoverText:
          "<b>Caffeine</b><br>RT: 5.80 min<br>Area: 1842.3<br>USP Tailing: 1.04<br>S/N: 42.1<br>Status: <span style='color:#22c55e'>PASS</span>",
      },
      {
        id: "peak-fail",
        x: 12.5,
        y: 180,
        text: "Theobromine (fail)",
        color: "#ef4444",
        startX: 11.5,
        endX: 13.5,
        regionOverlay: true,
        hoverText:
          "<b>Theobromine</b><br>RT: 12.50 min<br>Area: 631.7<br>USP Tailing: 1.48<br>S/N: 18.3<br>Status: <span style='color:#ef4444'>FAIL</span>",
      },
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      await waitFor(() => {
        expect(canvas.getByText("Peak Region Overlays")).toBeInTheDocument();
      });
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector("svg")).toBeInTheDocument();
    });

    await step("Annotation labels are rendered", async () => {
      expect(canvas.getByText("Caffeine (pass)")).toBeInTheDocument();
      expect(canvas.getByText("Theobromine (fail)")).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5422" },
    docs: {
      description: {
        story:
          'Each peak with `regionOverlay: true` paints a thickened colored line segment along the underlying trace between its `startX` and `endX`. Uses `peak.color` when set; falls back to the series color. Labels use `annotationStyle="inline"` — floating directly above the trace with no arrow.',
      },
    },
  },
};

/**
 * Empty series — the component should mount cleanly and not attempt to call
 * Plotly.newPlot. Exercises the `series.length === 0` early return in the main
 * effect.
 */
export const EmptySeries: Story = {
  args: {
    series: [],
    title: "Empty Series",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Empty state renders instead of a blank plot", async () => {
      // Container mounts but Plotly is never initialized when series is empty.
      const container = canvasElement.querySelector(".chromatogram-chart-container");
      expect(container).toBeInTheDocument();
      // A clear "no data" placeholder is shown rather than a blank canvas.
      expect(canvas.getByText("No chromatogram data")).toBeVisible();
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5424" },
    docs: {
      description: {
        story:
          "When `series` is empty the component skips Plotly initialization and renders a 'no data' empty state instead of a blank canvas — useful when data is still loading.",
      },
    },
  },
};

/**
 * Inline annotation style: labels float directly above the trace at the peak Y value
 * with no arrow. Cleaner for dense chromatograms where arrows create visual noise.
 * Use `titleFontSize` and `titleTopMargin` to shrink the title area for compact
 * multi-panel layouts (e.g. `titleFontSize={13}` matches the SST runner panel style).
 */
export const InlineAnnotationStyle: Story = {
  args: {
    series: [{ ...singleInjectionData, name: "Sample A" }],
    title: "Inline Annotation Style",
    annotations: selectableAnnotations,
    annotationStyle: "inline",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      await waitFor(() => {
        expect(canvas.getByText("Inline Annotation Style")).toBeInTheDocument();
      });
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector("svg")).toBeInTheDocument();
    });

    await step("Inline annotation labels are displayed", async () => {
      expect(canvas.getByText("Caffeine")).toBeInTheDocument();
      expect(canvas.getByText("Theobromine")).toBeInTheDocument();
      expect(canvas.getByText("Theophylline")).toBeInTheDocument();
    });
  },
  parameters: {
    docs: {
      description: {
        story:
          'With `annotationStyle="inline"` labels sit 4 px above the actual trace Y value with no arrow. Useful for dense chromatograms where arrowheads clutter the signal.',
      },
    },
    zephyr: { testCaseId: "SW-T5425" },
  },
};
