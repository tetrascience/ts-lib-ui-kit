import { expect, within } from "storybook/test";

import {
  ChromatogramChart,
  type ChromatogramSeries,
  type PeakAnnotation,
  type RangeAnnotation,
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

// Peak annotations for compound identification (simple labels without boundaries)
const sampleAnnotations: PeakAnnotation[] = [
  { x: 5.8, y: 420, text: "Caffeine", ax: 0, ay: -40 },
  { x: 12.5, y: 180, text: "Theobromine", ax: 30, ay: -55 },
  { x: 18.3, y: 350, text: "Theophylline", ax: -30, ay: -80 },
];

// User-defined peaks with boundary information for boundary markers
// Users simply provide startX and endX (retention times) - the component handles the rest
const userDefinedPeaksWithBoundaries: PeakAnnotation[] = [
  {
    x: 5.8,
    y: 420,
    text: "Caffeine",
    ay: -40,
    startX: 5.0, // Start retention time
    endX: 6.6, // End retention time
    // area is auto-computed from boundaries
  },
  {
    x: 12.5,
    y: 180,
    text: "Theobromine",
    ay: -55,
    startX: 11.5, // Start retention time
    endX: 13.5, // End retention time
  },
  {
    x: 18.3,
    y: 350,
    text: "Theophylline",
    ay: -80,
    startX: 17.3, // Start retention time
    endX: 19.3, // End retention time
  },
];

const meta: Meta<typeof ChromatogramChart> = {
  title: "Charts/ChromatogramChart",
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
 * Series with injection metadata displayed in tooltips.
 */
export const WithMetadata: Story = {
  args: {
    series: [
      {
        ...generateChromatogramData([
          { rt: 5.8, height: 420, width: 0.4 },
          { rt: 12.5, height: 180, width: 0.5 },
          { rt: 18.3, height: 350, width: 0.45 },
        ]),
        name: "Sample A - UV 254nm",
        metadata: {
          sampleName: "Caffeine Standard",
          injectionId: "INJ-2024-001",
          detectorType: "UV",
          wavelength: 254,
          methodName: "Caffeine_HPLC_v2",
          instrumentName: "Agilent 1260",
          wellPosition: "A1",
          injectionVolume: 10,
        },
      },
      {
        ...generateChromatogramData([
          { rt: 5.9, height: 380, width: 0.42 },
          { rt: 12.6, height: 195, width: 0.48 },
          { rt: 18.4, height: 320, width: 0.47 },
        ], 0.8),
        name: "Sample B - UV 254nm",
        metadata: {
          sampleName: "Coffee Extract",
          injectionId: "INJ-2024-002",
          detectorType: "UV",
          wavelength: 254,
          methodName: "Caffeine_HPLC_v2",
          wellPosition: "A2",
        },
      },
    ],
    title: "Chromatogram with Injection Metadata",
    showCrosshairs: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      const title = canvas.getByText("Chromatogram with Injection Metadata");
      expect(title).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });

    await step("Both traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBe(2);
    });

    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Sample A - UV 254nm")).toBeInTheDocument();
      expect(canvas.getByText("Sample B - UV 254nm")).toBeInTheDocument();
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Hover over traces to see injection metadata in the tooltip. Metadata includes sample name, injection ID, detector type, wavelength, method name, and well position.",
      },
    },
    zephyr: { testCaseId: "SW-T1110" },
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
 * Full featured chromatogram combining all major features.
 */
export const FullFeatured: Story = {
  args: {
    series: multiInjectionData,
    annotations: sampleAnnotations,
    title: "Full Featured Chromatogram",
    showGridX: true,
    showGridY: true,
    showCrosshairs: true,
    baselineCorrection: "linear",
    peakDetectionOptions: {
      minHeight: 0.15,
      prominence: 0.1,
    },
    showPeakAreas: true,
    boundaryMarkers: "enabled",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      const title = canvas.getByText("Full Featured Chromatogram");
      expect(title).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });

    await step("Multiple traces are rendered", async () => {
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBeGreaterThanOrEqual(3);
    });

    await step("User annotations are displayed", async () => {
      expect(canvas.getByText("Caffeine")).toBeInTheDocument();
      expect(canvas.getByText("Theobromine")).toBeInTheDocument();
      expect(canvas.getByText("Theophylline")).toBeInTheDocument();
    });

    await step("Peak area annotations are displayed", async () => {
      const annotations = canvasElement.querySelectorAll(".annotation-text");
      // User annotations are displayed (auto-detected peaks at same positions are filtered out)
      expect(annotations.length).toBeGreaterThanOrEqual(3);
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Combines all major features: multiple traces, grid lines, crosshairs, manual annotations, baseline correction, and automatic peak detection.",
      },
    },
    zephyr: { testCaseId: "SW-T1112" },
  },
};

/**
 * Peak boundary markers showing triangle markers at peak start and diamond markers
 * with vertical lines at peak end (the default styling).
 */
export const WithBoundaryMarkers: Story = {
  args: {
    series: [{ ...singleInjectionData, name: "Sample A" }],
    title: "Peak Boundary Markers",
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
      const title = canvas.getByText("Peak Boundary Markers");
      expect(title).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });

    await step("Boundary marker traces are rendered", async () => {
      // Boundary markers add additional scatter traces for the markers
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBeGreaterThan(1); // Main trace + boundary marker traces
    });

    await step("Peak area annotations are displayed", async () => {
      const annotations = canvasElement.querySelectorAll(".annotation-text");
      expect(annotations.length).toBeGreaterThan(0);
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Peak boundary markers visually indicate peak start and end points. Use 'auto' to automatically choose triangle markers (▲) for isolated boundaries at baseline or diamond markers (◆) with vertical lines for overlapping peaks. Set to 'triangle' or 'diamond' to force a specific marker style.",
      },
    },
    zephyr: { testCaseId: "SW-T1113" },
  },
};

/**
 * User-defined peaks with boundary information. Users can provide their own peak
 * annotations with startIndex and endIndex to display boundary markers without
 * using automatic peak detection.
 */
export const UserDefinedPeakBoundaries: Story = {
  args: {
    series: [{ ...singleInjectionData, name: "Sample A" }],
    title: "User-Defined Peak Boundaries",
    annotations: userDefinedPeaksWithBoundaries,
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

    await step("User-defined peak annotations are displayed", async () => {
      expect(canvas.getByText("Caffeine")).toBeInTheDocument();
      expect(canvas.getByText("Theobromine")).toBeInTheDocument();
      expect(canvas.getByText("Theophylline")).toBeInTheDocument();
    });

    await step("Boundary marker traces are rendered for user-defined peaks", async () => {
      // With boundary markers enabled, additional traces should be rendered
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBeGreaterThan(1);
    });
  },
  parameters: {
    docs: {
      description: {
        story: "Users can provide their own peak annotations with boundary information (startIndex, endIndex) to display boundary markers. This is useful when peak boundaries are known from external analysis or when manual peak integration is required. The annotations array accepts PeakAnnotation objects with optional index, startIndex, endIndex, and area fields.",
      },
    },
    zephyr: { testCaseId: "SW-T1114" },
  },
};

// ---------------------------------------------------------------------------
// Range annotation data
// ---------------------------------------------------------------------------

// IgG charge-variant chromatogram — three fractions across a single peak cluster.
const chargeVariantData = generateChromatogramData([
  { rt: 5.2, height: 120, width: 0.25 },
  { rt: 5.8, height: 420, width: 0.3 },
  { rt: 6.4, height: 180, width: 0.25 },
  { rt: 7.1, height: 80,  width: 0.2  },
]);

// Three adjacent fractions matching the screenshot layout
const adjacentRangeAnnotations: RangeAnnotation[] = [
  { label: "Acidic-01", startX: 4.5, endX: 5.5,  color: "#8E8E93" },
  { label: "Acidic-02", startX: 5.5, endX: 6.7,  color: "#FF3B30" },
  { label: "Main",      startX: 6.7, endX: 7.8,  color: "#34C759" },
];

// Two annotations covering exactly the same range — forces auto lane stacking
const sameRangeAnnotations: RangeAnnotation[] = [
  { label: "IgG Fraction",   startX: 5.0, endX: 7.2, color: "#007AFF" },
  { label: "Caffeine Window", startX: 5.0, endX: 7.2, color: "#FF9500" },
];

// Nested ranges: one broad outer bracket + two narrower inner sub-regions
const nestedRangeAnnotations: RangeAnnotation[] = [
  { label: "Acidic Region",  startX: 4.5, endX: 7.5, color: "#8E8E93" },
  { label: "Acidic-01",      startX: 4.5, endX: 5.5, color: "#FF6B6B" },
  { label: "Acidic-02",      startX: 5.6, endX: 6.8, color: "#FF3B30" },
];

/**
 * Combining automatic peak detection with user-defined annotations. Auto-detected peaks
 * show computed areas while user annotations provide custom labels. Both can have
 * boundary markers displayed.
 */
export const CombinedAutoAndUserPeaks: Story = {
  args: {
    series: [{ ...singleInjectionData, name: "Sample A" }],
    title: "Combined Auto-Detected and User-Defined Peaks",
    annotations: [
      // User-defined annotation with boundaries (will show boundary markers)
      // Just provide startX and endX - area is auto-computed
      {
        x: 5.8,
        y: 420,
        text: "Caffeine (user-defined)",
        ay: -40,
        startX: 5.0,
        endX: 6.6,
      },
      // Simple user annotation without boundaries (just a label)
      { x: 24.1, y: 220, text: "Unknown Peak", ay: -60 },
    ],
    peakDetectionOptions: {
      minHeight: 0.1,
      prominence: 0.05,
    },
    showPeakAreas: true,
    boundaryMarkers: "enabled",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      const title = canvas.getByText("Combined Auto-Detected and User-Defined Peaks");
      expect(title).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });

    await step("User-defined annotations are displayed", async () => {
      expect(canvas.getByText("Caffeine (user-defined)")).toBeInTheDocument();
      expect(canvas.getByText("Unknown Peak")).toBeInTheDocument();
    });

    await step("Auto-detected peak area annotations are displayed", async () => {
      // Peak areas from auto-detection + user annotations
      const annotations = canvasElement.querySelectorAll(".annotation-text");
      expect(annotations.length).toBeGreaterThan(2);
    });

    await step("Boundary markers from both sources are rendered", async () => {
      // Main trace + boundary marker traces from both auto-detected and user-defined peaks
      const traces = canvasElement.querySelectorAll(".scatterlayer .trace");
      expect(traces.length).toBeGreaterThan(1);
    });
  },
  parameters: {
    docs: {
      description: {
        story: "This example shows automatic peak detection combined with user-provided annotations. The auto-detected peaks display computed areas, while user annotations can provide custom labels. User annotations with boundary info (startIndex, endIndex) will also display boundary markers alongside auto-detected peaks.",
      },
    },
    zephyr: { testCaseId: "SW-T1115" },
  },
};

/**
 * Three adjacent, non-overlapping fraction windows rendered at the top of the plot
 * area — replicating the charge-variant labeling style shown in the design screenshot.
 * All bars share lane 0 and sit flush with the top of the plot in paper-space.
 */
export const RangeAnnotationsBasic: Story = {
  args: {
    series: [{ ...chargeVariantData, name: "IgG Sample" }],
    title: "Charge Variant Fractions",
    rangeAnnotations: adjacentRangeAnnotations,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Charge Variant Fractions")).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });

    await step("Range annotation labels are rendered", async () => {
      const labels = canvasElement.querySelectorAll(".annotation-text");
      expect(labels.length).toBeGreaterThanOrEqual(3);
    });
  },
  parameters: {
    docs: {
      description: {
        story:
          "Adjacent fraction windows with no overlap. All three fit in lane 0 and are rendered as paper-space bars flush with the top of the plot. Colors are supplied per-annotation.",
      },
    },
    zephyr: { testCaseId: "SW-T1116" },
  },
};

/**
 * Two annotations sharing exactly the same x-range. The auto lane-assignment algorithm
 * detects the overlap and places them in separate lanes (lane 0 on top, lane 1 below).
 */
export const RangeAnnotationsSameRange: Story = {
  args: {
    series: [{ ...chargeVariantData, name: "IgG Sample" }],
    title: "Same-Range Annotations (Auto-Stacked)",
    rangeAnnotations: sameRangeAnnotations,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      expect(
        canvas.getByText("Same-Range Annotations (Auto-Stacked)")
      ).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });

    await step("Both overlapping labels are rendered in separate lanes", async () => {
      const labels = canvasElement.querySelectorAll(".annotation-text");
      expect(labels.length).toBeGreaterThanOrEqual(2);
    });
  },
  parameters: {
    docs: {
      description: {
        story:
          "When two range annotations share the same startX/endX the lane auto-assignment stacks them vertically. No `lane` prop is required — overlap is detected automatically.",
      },
    },
    zephyr: { testCaseId: "SW-T1117" },
  },
};

/**
 * A broad outer bracket contains two narrower inner sub-regions. The auto lane-assignment
 * puts the outer region in lane 0 (top) and the two inner bars in lane 1 (below),
 * creating a two-level hierarchy without any explicit `lane` props.
 */
export const RangeAnnotationsNested: Story = {
  args: {
    series: [{ ...chargeVariantData, name: "IgG Sample" }],
    title: "Nested Range Annotations (Auto-Stacked)",
    rangeAnnotations: nestedRangeAnnotations,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      expect(
        canvas.getByText("Nested Range Annotations (Auto-Stacked)")
      ).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });

    await step("All three annotation labels are rendered", async () => {
      const labels = canvasElement.querySelectorAll(".annotation-text");
      expect(labels.length).toBeGreaterThanOrEqual(3);
    });
  },
  parameters: {
    docs: {
      description: {
        story:
          "A broad outer annotation overlaps two narrower inner annotations. The greedy lane algorithm places the outer bar in lane 0 and both inner bars in lane 1, producing a two-row hierarchy automatically.",
      },
    },
    zephyr: { testCaseId: "SW-T1118" },
  },
};

/**
 * Explicit `lane` props override auto-assignment. Here the outer bracket is forced to
 * lane 1 (visually below the inner bars at lane 0) to demonstrate manual control.
 * Also shows `yAnchor: "auto"` which floats the bars just above the local signal peak.
 */
export const RangeAnnotationsExplicitLanes: Story = {
  args: {
    series: [{ ...chargeVariantData, name: "IgG Sample" }],
    title: "Explicit Lane Override + Auto Y-Anchor",
    rangeAnnotations: [
      {
        label: "Acidic-01",
        startX: 4.5,
        endX: 5.5,
        color: "#FF6B6B",
        yAnchor: "auto",
        lane: 0,
      },
      {
        label: "Acidic-02",
        startX: 5.6,
        endX: 6.8,
        color: "#FF3B30",
        yAnchor: "auto",
        lane: 0,
      },
      {
        label: "Acidic Region",
        startX: 4.5,
        endX: 7.5,
        color: "#8E8E93",
        yAnchor: "auto",
        lane: 1,
      },
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      expect(
        canvas.getByText("Explicit Lane Override + Auto Y-Anchor")
      ).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });

    await step("All annotation labels are rendered", async () => {
      const labels = canvasElement.querySelectorAll(".annotation-text");
      expect(labels.length).toBeGreaterThanOrEqual(3);
    });
  },
  parameters: {
    docs: {
      description: {
        story:
          "Explicit `lane` values override auto-assignment. The two narrow sub-regions are pinned to lane 0 and the broad outer bracket to lane 1, so it renders below them. `yAnchor: \"auto\"` places all bars in data-space just above the local signal maximum rather than in fixed paper-space.",
      },
    },
    zephyr: { testCaseId: "SW-T1119" },
  },
};
