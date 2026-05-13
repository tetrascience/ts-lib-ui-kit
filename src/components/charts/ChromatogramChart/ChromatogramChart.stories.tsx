import { useState } from "react";
import { expect, within } from "storybook/test";

import {
  ChromatogramChart,
  type ChromatogramSeries,
  type PeakAnnotation,
  type PeakSelectEvent,
} from "./ChromatogramChart";

import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Generate realistic HPLC chromatogram data with Gaussian peaks
 */
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
    ...generateChromatogramData([
      { rt: 5.9, height: 380, width: 0.42 },
      { rt: 12.6, height: 195, width: 0.48 },
      { rt: 18.4, height: 320, width: 0.47 },
    ], 0.8),
    name: "Injection 2",
  },
  {
    ...generateChromatogramData([
      { rt: 5.7, height: 440, width: 0.38 },
      { rt: 12.4, height: 170, width: 0.52 },
      { rt: 18.2, height: 365, width: 0.43 },
    ], 0.6),
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

const meta: Meta<typeof ChromatogramChart> = {
  title: "Charts/Chromatogram Chart",
  component: ChromatogramChart,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ChromatogramChart>;

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
      const title = canvas.getByText("HPLC Chromatogram - Single Injection");
      expect(title).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });

    await step("Trace is rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(1);
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
      const title = canvas.getByText("HPLC Chromatogram - Injection Overlay");
      expect(title).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });

    await step("Multiple traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(3);
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
        story: "Overlay multiple injections to compare retention times and peak intensities. Crosshairs help compare values across traces.",
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
      const title = canvas.getByText("Automatic Peak Detection");
      expect(title).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });

    await step("Peak area annotations are displayed", async () => {
      // Peak areas are displayed as annotations with "Area:" text
      const annotations = canvasElement.querySelectorAll(".annotation-text");
      expect(annotations.length).toBeGreaterThan(0);
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Automatic peak detection identifies peaks based on height, prominence, and minimum distance. Peak areas are calculated using trapezoidal integration.",
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
      const title = canvas.getByText("User-Defined Peak Boundaries");
      expect(title).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });

    await step("Colored peak annotations are displayed", async () => {
      expect(canvas.getByText("Caffeine (pass)")).toBeInTheDocument();
      expect(canvas.getByText("Theobromine (fail)")).toBeInTheDocument();
      expect(canvas.getByText("Theophylline (N/A)")).toBeInTheDocument();
    });

    await step("Boundary marker traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBeGreaterThan(1);
    });
  },
  parameters: {
    docs: {
      description: {
        story:
          "Supply `startX`, `endX`, and `color` on each annotation to define peak boundaries with pass/fail coloring (green = pass, red = fail, grey = N/A). The component renders triangle markers (▲) at the start and diamond markers (◆) at the end; the label, arrow, border, and boundary markers all inherit the per-peak color. Area is auto-computed via trapezoidal integration over the bounded slice.",
      },
    },
    zephyr: { testCaseId: "SW-T1114" },
  },
};

/**
 * Demonstrates click-to-select and hover feedback on individual peaks.
 * Click any peak label or its invisible hit target to toggle selection (blue highlight).
 * Unselected peaks dim when another is selected. Hover thickens the trace line.
 */
export const PeakHoverAndSelection: StoryObj<typeof ChromatogramChart> = {
  render: (args) => {
    const [selectedPeakIds, setSelectedPeakIds] = useState<string[]>([]);
    const [hoveredPeak, setHoveredPeak] = useState<PeakSelectEvent | null>(null);

    const handlePeakClick = (event: PeakSelectEvent) => {
      setSelectedPeakIds((prev) =>
        prev.includes(event.id) ? prev.filter((id) => id !== event.id) : [...prev, event.id]
      );
    };

    return (
      <div style={{ fontFamily: "Inter, sans-serif" }}>
        <ChromatogramChart
          {...args}
          selectedPeakIds={selectedPeakIds}
          onPeakClick={handlePeakClick}
          onPeakHover={setHoveredPeak}
        />
        <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280", minHeight: 36 }}>
          {hoveredPeak && (
            <div>Hovering: <strong>{hoveredPeak.peak.text ?? hoveredPeak.id}</strong></div>
          )}
          {selectedPeakIds.length > 0 && (
            <div>
              Selected: <strong>{selectedPeakIds.join(", ")}</strong>
              {" "}
              <button onClick={() => setSelectedPeakIds([])}>Clear</button>
            </div>
          )}
        </div>
      </div>
    );
  },
  args: {
    series: [{ ...singleInjectionData, name: "Sample A" }],
    title: "Peak Hover and Selection",
    annotations: selectableAnnotations,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Click a peak to select it (blue border, bold label). Click again to deselect. Other peaks dim while one is selected. Hover over the trace to thicken the line.",
      },
    },
    zephyr: { testCaseId: "SW-T1118" },
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
        hoverText: "<b>Caffeine</b><br>RT: 5.80 min<br>Area: 1842.3<br>USP Tailing: 1.04<br>S/N: 42.1<br>Status: <span style='color:#22c55e'>PASS</span>",
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
        hoverText: "<b>Theobromine</b><br>RT: 12.50 min<br>Area: 631.7<br>USP Tailing: 1.48<br>S/N: 18.3<br>Status: <span style='color:#ef4444'>FAIL</span>",
      },
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Peak Region Overlays")).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });

    await step("Annotation labels are rendered", async () => {
      expect(canvas.getByText("Caffeine (pass)")).toBeInTheDocument();
      expect(canvas.getByText("Theobromine (fail)")).toBeInTheDocument();
    });

    await step("Region overlay traces are present (series + overlays)", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      // 1 series trace + 2 region overlay traces + 1 hit-area trace = at least 4
      expect(traces.length).toBeGreaterThanOrEqual(4);
    });
  },
  parameters: {
    docs: {
      description: {
        story:
          "Each peak with `regionOverlay: true` paints a thickened colored line segment along the underlying trace between its `startX` and `endX`. Uses `peak.color` when set; falls back to the series color.",
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
      expect(canvas.getByText("Inline Annotation Style")).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
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
    zephyr: { testCaseId: "SW-T1119" },
  },
};
