import type { Meta, StoryObj } from "@storybook/react";
import {
  ChromatogramChart,
  ChromatogramSeries,
  PeakAnnotation,
} from "./ChromatogramChart";

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

// Peak annotations for compound identification
const sampleAnnotations: PeakAnnotation[] = [
  { x: 5.8, y: 420, text: "Caffeine", ay: -40 },
  { x: 12.5, y: 180, text: "Theobromine", ay: -55 },
  { x: 18.3, y: 350, text: "Theophylline", ay: -80 },
];

const meta: Meta<typeof ChromatogramChart> = {
  title: "Organisms/ChromatogramChart",
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
  parameters: {
    docs: {
      description: {
        story: "Basic chromatogram with a single trace. This is the simplest usage of the component.",
      },
    },
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
  parameters: {
    docs: {
      description: {
        story: "Overlay multiple injections to compare retention times and peak intensities. Crosshairs help compare values across traces.",
      },
    },
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
      showAreas: true,
    },
    onPeaksDetected: (peaks, seriesIndex) => {
      console.log(`Detected ${peaks.length} peaks in series ${seriesIndex}:`, peaks);
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Automatic peak detection identifies peaks based on height, prominence, and minimum distance. Peak areas are calculated using trapezoidal integration. Use onPeaksDetected callback to receive peak data.",
      },
    },
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
      showAreas: true,
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Combines all major features: multiple traces, grid lines, crosshairs, manual annotations, baseline correction, and automatic peak detection.",
      },
    },
  },
};

