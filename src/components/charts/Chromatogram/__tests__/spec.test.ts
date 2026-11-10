import { describe, it, expect } from "vitest";

import { buildChromatogramSpec } from "../spec";

import type { ChromatogramSpecInput } from "../spec";
import type { ChromatogramSeries, PeakAnnotation } from "../types";

const trace: ChromatogramSeries = {
  name: "Injection 1",
  x: [0, 1, 2, 3, 4],
  y: [1, 5, 9, 5, 1],
  color: "#123456",
};

const baseInput = (overrides: Partial<ChromatogramSpecInput> = {}): ChromatogramSpecInput => ({
  processedSeries: [trace],
  processedAnnotations: [],
  allDetectedPeaks: [],
  showPeakAreas: false,
  enablePeakDetection: false,
  boundaryMarkers: "none",
  showMarkers: false,
  markerSize: 4,
  xAxisTitle: "Retention Time (min)",
  yAxisTitle: "Signal (mAU)",
  showGridX: true,
  showGridY: true,
  ...overrides,
});

const layersOf = (input: ChromatogramSpecInput) => buildChromatogramSpec(input).spec.layers;

describe("buildChromatogramSpec", () => {
  it("draws each series as a line in its own colour, with the series' own rows", () => {
    const layers = layersOf(baseInput());
    expect(layers).toHaveLength(1);
    expect(layers[0]).toMatchObject({ kind: "line", name: "Injection 1", style: { color: "#123456" } });
    expect(layers[0].data).toEqual([
      { x: 0, y: 1 },
      { x: 1, y: 5 },
      { x: 2, y: 9 },
      { x: 3, y: 5 },
      { x: 4, y: 1 },
    ]);
  });

  it("falls back to the palette colour when a series has none", () => {
    const layers = layersOf(baseInput({ processedSeries: [{ ...trace, color: undefined }] }));
    expect(layers[0].style?.color).toMatch(/^#|^rgb|^oklch|^var/);
  });

  it("adds a point layer per series when markers are shown", () => {
    const layers = layersOf(baseInput({ showMarkers: true, markerSize: 7 }));
    expect(layers.map((layer) => layer.kind)).toEqual(["line", "point"]);
    // markerSize is a diameter, as Plotly sized it; ts-lib-viz takes a radius.
    expect(layers[1]).toMatchObject({ style: { color: "#123456", size: 3.5 } });
  });

  it("draws a region overlay as a line over only the peak's own points", () => {
    const peak: PeakAnnotation = {
      id: "p1",
      x: 2,
      y: 9,
      text: "Peak",
      regionOverlay: true,
      regionOverlayWidth: 6,
      color: "#ff0000",
      _computed: { startIndex: 1, endIndex: 3, area: 10 },
    };
    const layers = layersOf(baseInput({ processedAnnotations: [peak] }));
    const overlay = layers.find((layer, i) => i > 0 && layer.kind === "line");
    expect(overlay).toMatchObject({ kind: "line", style: { color: "#ff0000", linewidth: 6 } });
    expect(overlay?.data).toEqual([
      { x: 1, y: 5 },
      { x: 2, y: 9 },
      { x: 3, y: 5 },
    ]);
  });

  it("labels user peaks with their text, and detected peaks only when their areas are shown", () => {
    const detected: PeakAnnotation = { id: "d1", x: 2, y: 9, _computed: { startIndex: 0, endIndex: 4, area: 12.345 } };
    const user: PeakAnnotation = { id: "u1", x: 1, y: 5, text: "Caffeine" };

    const hidden = layersOf(
      baseInput({ processedAnnotations: [user], allDetectedPeaks: [{ peaks: [detected], seriesIndex: 0 }] }),
    );
    expect(hidden.filter((layer) => layer.kind === "text").flatMap((layer) => layer.data)).toEqual([
      { x: 1, y: 5, label: "Caffeine" },
    ]);

    const shown = layersOf(
      baseInput({
        processedAnnotations: [user],
        allDetectedPeaks: [{ peaks: [detected], seriesIndex: 0 }],
        showPeakAreas: true,
        enablePeakDetection: true,
      }),
    );
    const labels = shown.filter((layer) => layer.kind === "text").flatMap((layer) => layer.data);
    expect(labels).toEqual([
      { x: 1, y: 5, label: "Caffeine" },
      { x: 2, y: 9, label: "Area: 12.35" },
    ]);
  });

  it("draws boundary markers as triangles at the start and diamonds at the end by default", () => {
    const peak: PeakAnnotation = {
      id: "p1",
      x: 2,
      y: 9,
      _computed: { startIndex: 1, endIndex: 3, area: 10 },
    };
    const layers = layersOf(
      baseInput({
        processedAnnotations: [peak],
        boundaryMarkers: "enabled",
      }),
    );
    const markers = layers.filter((layer) => layer.kind === "point");
    expect(markers.map((layer) => layer.style?.shape)).toEqual(["triangle", "diamond"]);
    expect(markers[0].data).toEqual([{ x: 1, y: -5 }]);
    expect(markers[1].data).toEqual([{ x: 3, y: -12 }]);
  });

  it("passes the title, axis titles, limits and grid flags to the scales", () => {
    const { spec } = buildChromatogramSpec(
      baseInput({ title: "HPLC", xRange: [0, 4], yRange: [0, 10], showGridX: false, showGridY: true }),
    );
    expect(spec.headline).toBe("HPLC");
    expect(spec.scales?.x).toMatchObject({ title: "Retention Time (min)", limits: [0, 4], grid: false });
    expect(spec.scales?.y).toMatchObject({ title: "Signal (mAU)", limits: [0, 10], grid: true });
  });
});
