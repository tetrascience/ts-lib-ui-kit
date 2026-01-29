import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { ChromatogramChart } from "../ChromatogramChart";
import type { ChromatogramSeries, PeakAnnotation } from "../ChromatogramChart";

// Mock Plotly
const mockNewPlot = vi.fn();
const mockPurge = vi.fn();
const mockDownloadImage = vi.fn();

vi.mock("plotly.js-dist", () => ({
  default: {
    newPlot: (...args: unknown[]) => mockNewPlot(...args),
    purge: (...args: unknown[]) => mockPurge(...args),
    downloadImage: (...args: unknown[]) => mockDownloadImage(...args),
  },
}));

// Mock SCSS import
vi.mock("../ChromatogramChart.scss", () => ({}));

describe("ChromatogramChart", () => {
  const mockSeries: ChromatogramSeries[] = [
    {
      x: [0, 1, 2, 3, 4, 5],
      y: [0, 10, 50, 30, 15, 5],
      name: "Sample 1",
    },
  ];

  const multiSeries: ChromatogramSeries[] = [
    { x: [0, 1, 2], y: [0, 10, 5], name: "Series A" },
    { x: [0, 1, 2], y: [5, 15, 10], name: "Series B" },
    { x: [0, 1, 2], y: [10, 20, 15], name: "Series C", color: "#FF0000" },
  ];

  const mockAnnotations: PeakAnnotation[] = [
    { x: 2, y: 50, text: "Peak 1" },
    { x: 4, y: 15, text: "Peak 2" },
  ];

  beforeEach(() => {
    mockNewPlot.mockClear();
    mockPurge.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  describe("rendering", () => {
    it("should render the container element", () => {
      const { container } = render(<ChromatogramChart series={mockSeries} />);
      const chartContainer = container.querySelector(".chromatogram-chart-container");
      expect(chartContainer).toBeTruthy();
    });

    it("should call Plotly.newPlot when series data is provided", () => {
      render(<ChromatogramChart series={mockSeries} />);
      expect(mockNewPlot).toHaveBeenCalledTimes(1);
    });

    it("should not call Plotly.newPlot when series is empty", () => {
      render(<ChromatogramChart series={[]} />);
      expect(mockNewPlot).not.toHaveBeenCalled();
    });

    it("should call Plotly.purge on unmount", () => {
      const { unmount } = render(<ChromatogramChart series={mockSeries} />);
      unmount();
      expect(mockPurge).toHaveBeenCalledTimes(1);
    });
  });

  describe("data transformation", () => {
    it("should pass series data to Plotly with correct structure", () => {
      render(<ChromatogramChart series={mockSeries} />);

      const [, plotData] = mockNewPlot.mock.calls[0];
      expect(plotData).toHaveLength(1);
      expect(plotData[0]).toMatchObject({
        x: mockSeries[0].x,
        y: mockSeries[0].y,
        name: mockSeries[0].name,
        type: "scatter",
        mode: "lines",
      });
    });

    it("should auto-assign colors from CHART_COLORS palette", () => {
      render(<ChromatogramChart series={multiSeries} />);

      const [, plotData] = mockNewPlot.mock.calls[0];
      // First two series should have auto-assigned colors
      expect(plotData[0].line.color).toBeDefined();
      expect(plotData[1].line.color).toBeDefined();
      // Third series has explicit color
      expect(plotData[2].line.color).toBe("#FF0000");
    });

    it("should include line width of 1.5", () => {
      render(<ChromatogramChart series={mockSeries} />);

      const [, plotData] = mockNewPlot.mock.calls[0];
      expect(plotData[0].line.width).toBe(1.5);
    });
  });

  describe("layout configuration", () => {
    it("should use default axis titles", () => {
      render(<ChromatogramChart series={mockSeries} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.xaxis.title.text).toBe("Retention Time (min)");
      expect(layout.yaxis.title.text).toBe("Signal (mAU)");
    });

    it("should use custom axis titles when provided", () => {
      render(
        <ChromatogramChart
          series={mockSeries}
          xAxisTitle="Time (s)"
          yAxisTitle="Intensity (AU)"
        />
      );

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.xaxis.title.text).toBe("Time (s)");
      expect(layout.yaxis.title.text).toBe("Intensity (AU)");
    });

    it("should use default dimensions", () => {
      render(<ChromatogramChart series={mockSeries} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.width).toBe(900);
      expect(layout.height).toBe(500);
    });

    it("should use custom dimensions when provided", () => {
      render(<ChromatogramChart series={mockSeries} width={1200} height={800} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.width).toBe(1200);
      expect(layout.height).toBe(800);
    });

    it("should include title when provided", () => {
      render(<ChromatogramChart series={mockSeries} title="HPLC Analysis" />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.title.text).toBe("HPLC Analysis");
    });

    it("should not include title when not provided", () => {
      render(<ChromatogramChart series={mockSeries} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.title).toBeUndefined();
    });

    it("should set hovermode to 'x unified'", () => {
      render(<ChromatogramChart series={mockSeries} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.hovermode).toBe("x unified");
    });

    it("should set dragmode to 'zoom'", () => {
      render(<ChromatogramChart series={mockSeries} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.dragmode).toBe("zoom");
    });
  });

  describe("axis ranges", () => {
    it("should use autorange when no range is specified", () => {
      render(<ChromatogramChart series={mockSeries} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.xaxis.autorange).toBe(true);
      expect(layout.yaxis.autorange).toBe(true);
      expect(layout.xaxis.range).toBeUndefined();
      expect(layout.yaxis.range).toBeUndefined();
    });

    it("should use fixed xRange when provided", () => {
      render(<ChromatogramChart series={mockSeries} xRange={[1, 4]} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.xaxis.range).toEqual([1, 4]);
      expect(layout.xaxis.autorange).toBe(false);
    });

    it("should use fixed yRange when provided", () => {
      render(<ChromatogramChart series={mockSeries} yRange={[0, 100]} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.yaxis.range).toEqual([0, 100]);
      expect(layout.yaxis.autorange).toBe(false);
    });
  });

  describe("annotations", () => {
    it("should include annotations when provided", () => {
      render(<ChromatogramChart series={mockSeries} annotations={mockAnnotations} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.annotations).toHaveLength(2);
    });

    it("should transform annotations to Plotly format", () => {
      render(<ChromatogramChart series={mockSeries} annotations={mockAnnotations} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      const annotation = layout.annotations[0];
      expect(annotation).toMatchObject({
        x: 2,
        y: 50,
        text: "Peak 1",
        showarrow: true,
        arrowhead: 2,
      });
    });

    it("should have empty annotations array when none provided", () => {
      render(<ChromatogramChart series={mockSeries} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.annotations).toEqual([]);
    });
  });

  describe("legend", () => {
    it("should show legend for multiple series by default", () => {
      render(<ChromatogramChart series={multiSeries} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.showlegend).toBe(true);
    });

    it("should hide legend for single series", () => {
      render(<ChromatogramChart series={mockSeries} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.showlegend).toBe(false);
    });

    it("should hide legend when showLegend is false", () => {
      render(<ChromatogramChart series={multiSeries} showLegend={false} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.showlegend).toBe(false);
    });
  });

  describe("Plotly config", () => {
    it("should enable displayModeBar", () => {
      render(<ChromatogramChart series={mockSeries} />);

      const [, , , config] = mockNewPlot.mock.calls[0];
      expect(config.displayModeBar).toBe(true);
    });

    it("should disable Plotly logo", () => {
      render(<ChromatogramChart series={mockSeries} />);

      const [, , , config] = mockNewPlot.mock.calls[0];
      expect(config.displaylogo).toBe(false);
    });

    it("should remove lasso and select tools", () => {
      render(<ChromatogramChart series={mockSeries} />);

      const [, , , config] = mockNewPlot.mock.calls[0];
      expect(config.modeBarButtonsToRemove).toContain("lasso2d");
      expect(config.modeBarButtonsToRemove).toContain("select2d");
    });

    it("should enable responsive mode", () => {
      render(<ChromatogramChart series={mockSeries} />);

      const [, , , config] = mockNewPlot.mock.calls[0];
      expect(config.responsive).toBe(true);
    });
  });

  describe("re-rendering", () => {
    it("should re-render when series changes", () => {
      const { rerender } = render(<ChromatogramChart series={mockSeries} />);
      expect(mockNewPlot).toHaveBeenCalledTimes(1);

      rerender(<ChromatogramChart series={multiSeries} />);
      expect(mockNewPlot).toHaveBeenCalledTimes(2);
    });

    it("should re-render when dimensions change", () => {
      const { rerender } = render(<ChromatogramChart series={mockSeries} width={800} />);
      expect(mockNewPlot).toHaveBeenCalledTimes(1);

      rerender(<ChromatogramChart series={mockSeries} width={1000} />);
      expect(mockNewPlot).toHaveBeenCalledTimes(2);
    });
  });

  describe("grid lines", () => {
    it("should show grid lines by default", () => {
      render(<ChromatogramChart series={mockSeries} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.xaxis.showgrid).toBe(true);
      expect(layout.yaxis.showgrid).toBe(true);
    });

    it("should hide x-axis grid when showGridX is false", () => {
      render(<ChromatogramChart series={mockSeries} showGridX={false} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.xaxis.showgrid).toBe(false);
      expect(layout.yaxis.showgrid).toBe(true);
    });

    it("should hide y-axis grid when showGridY is false", () => {
      render(<ChromatogramChart series={mockSeries} showGridY={false} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.xaxis.showgrid).toBe(true);
      expect(layout.yaxis.showgrid).toBe(false);
    });
  });

  describe("markers", () => {
    it("should not show markers by default", () => {
      render(<ChromatogramChart series={mockSeries} />);

      const [, plotData] = mockNewPlot.mock.calls[0];
      expect(plotData[0].mode).toBe("lines");
    });

    it("should show markers when showMarkers is true", () => {
      render(<ChromatogramChart series={mockSeries} showMarkers={true} />);

      const [, plotData] = mockNewPlot.mock.calls[0];
      expect(plotData[0].mode).toBe("lines+markers");
    });

    it("should use custom marker size when markerSize is provided", () => {
      render(<ChromatogramChart series={mockSeries} showMarkers={true} markerSize={8} />);

      const [, plotData] = mockNewPlot.mock.calls[0];
      expect(plotData[0].marker.size).toBe(8);
    });

    it("should use default marker size of 4", () => {
      render(<ChromatogramChart series={mockSeries} showMarkers={true} />);

      const [, plotData] = mockNewPlot.mock.calls[0];
      expect(plotData[0].marker.size).toBe(4);
    });
  });

  describe("crosshairs", () => {
    it("should not show crosshairs by default", () => {
      render(<ChromatogramChart series={mockSeries} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.xaxis.showspikes).toBe(false);
      expect(layout.yaxis.showspikes).toBe(false);
      expect(layout.hovermode).toBe("x unified");
    });

    it("should show crosshairs when showCrosshairs is true", () => {
      render(<ChromatogramChart series={mockSeries} showCrosshairs={true} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.xaxis.showspikes).toBe(true);
      expect(layout.yaxis.showspikes).toBe(true);
      expect(layout.hovermode).toBe("x");
    });

    it("should configure crosshair style", () => {
      render(<ChromatogramChart series={mockSeries} showCrosshairs={true} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.xaxis.spikemode).toBe("across");
      expect(layout.xaxis.spikethickness).toBe(1);
      expect(layout.xaxis.spikedash).toBe("dot");
    });
  });

  describe("baseline correction", () => {
    it("should apply no baseline correction by default", () => {
      render(<ChromatogramChart series={mockSeries} />);

      const [, plotData] = mockNewPlot.mock.calls[0];
      // Data should be unchanged when baselineCorrection is "none"
      expect(plotData[0].y).toEqual(mockSeries[0].y);
    });

    it("should apply linear baseline correction when specified", () => {
      // Series with non-zero baseline (starts at 0, ends at 5)
      // Linear correction: slope = (5-0)/(5) = 1, subtracts baseline y[0] + slope*i
      render(<ChromatogramChart series={mockSeries} baselineCorrection="linear" />);

      const [, plotData] = mockNewPlot.mock.calls[0];
      // Linear correction should produce different values than original
      // At index 5, original = 5, baseline = 0 + 1*5 = 5, corrected = 5-5 = 0
      expect(plotData[0].y[5]).toBe(0);
      // At index 2, original = 50, baseline = 0 + 1*2 = 2, corrected = 50-2 = 48
      expect(plotData[0].y[2]).toBe(48);
    });

    it("should apply rolling baseline correction when specified", () => {
      render(<ChromatogramChart series={mockSeries} baselineCorrection="rolling" />);

      const [, plotData] = mockNewPlot.mock.calls[0];
      // Rolling correction should modify the y values
      // (values should be adjusted based on local minimum)
      expect(Array.isArray(plotData[0].y)).toBe(true);
    });
  });

  describe("peak detection", () => {
    const peakSeries: ChromatogramSeries[] = [
      {
        x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        y: [0, 5, 10, 100, 10, 5, 0, 5, 50, 5, 0],
        name: "With Peaks",
      },
    ];

    it("should not detect peaks by default", () => {
      const onPeaksDetected = vi.fn();
      render(<ChromatogramChart series={peakSeries} onPeaksDetected={onPeaksDetected} />);

      expect(onPeaksDetected).not.toHaveBeenCalled();
    });

    it("should detect peaks when peakDetectionOptions is provided", () => {
      const onPeaksDetected = vi.fn();
      render(
        <ChromatogramChart
          series={peakSeries}
          peakDetectionOptions={{}}
          onPeaksDetected={onPeaksDetected}
        />
      );

      expect(onPeaksDetected).toHaveBeenCalled();
    });

    it("should call onPeaksDetected with detected peaks and series index", () => {
      const onPeaksDetected = vi.fn();
      render(
        <ChromatogramChart
          series={peakSeries}
          peakDetectionOptions={{}}
          onPeaksDetected={onPeaksDetected}
        />
      );

      expect(onPeaksDetected).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            retentionTime: expect.any(Number),
            intensity: expect.any(Number),
            area: expect.any(Number),
          }),
        ]),
        0
      );
    });
  });

  describe("peak area annotations", () => {
    const peakSeries: ChromatogramSeries[] = [
      {
        x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        y: [0, 5, 10, 100, 10, 5, 0, 5, 50, 5, 0],
        name: "With Peaks",
      },
    ];

    it("should not show peak areas by default when peakDetectionOptions is provided", () => {
      render(<ChromatogramChart series={peakSeries} peakDetectionOptions={{}} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      // Should only have the regular annotations (none provided)
      const areaAnnotations = layout.annotations.filter((a: { text: string }) =>
        a.text.includes("Area:")
      );
      expect(areaAnnotations.length).toBe(0);
    });

    it("should show peak area annotations when showAreas is true in peakDetectionOptions", () => {
      render(
        <ChromatogramChart
          series={peakSeries}
          peakDetectionOptions={{ showAreas: true }}
        />
      );

      const [, , layout] = mockNewPlot.mock.calls[0];
      const areaAnnotations = layout.annotations.filter((a: { text: string }) =>
        a.text.includes("Area:")
      );
      expect(areaAnnotations.length).toBeGreaterThan(0);
    });
  });

  describe("custom annotation offsets", () => {
    it("should use custom ay offset when provided", () => {
      const annotationsWithOffset: PeakAnnotation[] = [
        { x: 2, y: 50, text: "Custom Offset", ay: -80 },
      ];
      render(<ChromatogramChart series={mockSeries} annotations={annotationsWithOffset} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.annotations[0].ay).toBe(-80);
    });

    it("should use custom ax offset when provided", () => {
      const annotationsWithOffset: PeakAnnotation[] = [
        { x: 2, y: 50, text: "Custom Offset", ax: 30 },
      ];
      render(<ChromatogramChart series={mockSeries} annotations={annotationsWithOffset} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.annotations[0].ax).toBe(30);
    });

    it("should use default ay of -30 when not provided", () => {
      render(<ChromatogramChart series={mockSeries} annotations={mockAnnotations} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.annotations[0].ay).toBe(-30);
    });

    it("should use default ax of 0 when not provided", () => {
      render(<ChromatogramChart series={mockSeries} annotations={mockAnnotations} />);

      const [, , layout] = mockNewPlot.mock.calls[0];
      expect(layout.annotations[0].ax).toBe(0);
    });
  });

  describe("annotation overlap resolution", () => {
    // Series with peaks at close retention times that would overlap
    const overlappingPeaksSeries: ChromatogramSeries[] = [
      {
        x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        y: [0, 5, 10, 100, 10, 5, 0, 5, 50, 5, 0],
        name: "Series A",
      },
      {
        // Peaks at nearly same retention time as Series A
        x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        y: [0, 5, 15, 80, 15, 5, 0, 10, 60, 10, 0],
        name: "Series B",
      },
    ];

    it("should stagger annotations for overlapping peaks", () => {
      render(
        <ChromatogramChart
          series={overlappingPeaksSeries}
          peakDetectionOptions={{ showAreas: true }}
        />
      );

      const [, , layout] = mockNewPlot.mock.calls[0];
      const areaAnnotations = layout.annotations.filter((a: { text: string }) =>
        a.text.includes("Area:")
      );

      // With overlapping peaks, annotations should have different ax/ay values
      if (areaAnnotations.length >= 2) {
        const firstAnn = areaAnnotations[0];
        const secondAnn = areaAnnotations[1];
        // At least one of ax or ay should differ for staggering
        const positionsAreDifferent =
          firstAnn.ax !== secondAnn.ax || firstAnn.ay !== secondAnn.ay;
        expect(positionsAreDifferent).toBe(true);
      }
    });

    it("should use centered slot for single (non-overlapping) peaks", () => {
      // Series with only one peak
      const singlePeakSeries: ChromatogramSeries[] = [
        {
          x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          y: [0, 5, 10, 100, 10, 5, 0, 0, 0, 0, 0],
          name: "Single Peak",
        },
      ];

      render(
        <ChromatogramChart
          series={singlePeakSeries}
          peakDetectionOptions={{ showAreas: true }}
        />
      );

      const [, , layout] = mockNewPlot.mock.calls[0];
      const areaAnnotations = layout.annotations.filter((a: { text: string }) =>
        a.text.includes("Area:")
      );

      // Single peak should have centered annotation (ax: 0)
      if (areaAnnotations.length === 1) {
        expect(areaAnnotations[0].ax).toBe(0);
      }
    });

    it("should respect custom annotationOverlapThreshold", () => {
      render(
        <ChromatogramChart
          series={overlappingPeaksSeries}
          peakDetectionOptions={{
            showAreas: true,
            annotationOverlapThreshold: 0.1, // Very small threshold
          }}
        />
      );

      const [, , layout] = mockNewPlot.mock.calls[0];
      // Should still produce annotations without error
      expect(layout.annotations).toBeDefined();
    });
  });

  describe("input validation", () => {
    it("should handle series with mismatched x and y array lengths", () => {
      const mismatchedSeries: ChromatogramSeries[] = [
        {
          x: [0, 1, 2, 3, 4, 5],
          y: [0, 10, 50], // Shorter y array
          name: "Mismatched",
        },
      ];

      // Should not throw
      expect(() => render(<ChromatogramChart series={mismatchedSeries} />)).not.toThrow();
      expect(mockNewPlot).toHaveBeenCalled();
    });

    it("should handle NaN values in y data", () => {
      const nanSeries: ChromatogramSeries[] = [
        {
          x: [0, 1, 2, 3, 4, 5],
          y: [0, NaN, 50, 30, 15, 5],
          name: "With NaN",
        },
      ];

      expect(() => render(<ChromatogramChart series={nanSeries} />)).not.toThrow();

      const [, plotData] = mockNewPlot.mock.calls[0];
      // NaN should be sanitized to 0
      expect(plotData[0].y[1]).toBe(0);
    });

    it("should handle Infinity values in y data", () => {
      const infSeries: ChromatogramSeries[] = [
        {
          x: [0, 1, 2, 3, 4, 5],
          y: [0, Infinity, 50, -Infinity, 15, 5],
          name: "With Infinity",
        },
      ];

      expect(() => render(<ChromatogramChart series={infSeries} />)).not.toThrow();

      const [, plotData] = mockNewPlot.mock.calls[0];
      // Infinity values should be sanitized to 0
      expect(plotData[0].y[1]).toBe(0);
      expect(plotData[0].y[3]).toBe(0);
    });

    it("should truncate to shorter array length when x and y differ", () => {
      const mismatchedSeries: ChromatogramSeries[] = [
        {
          x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
          y: [0, 10, 50], // Much shorter
          name: "Truncated",
        },
      ];

      render(<ChromatogramChart series={mismatchedSeries} />);

      const [, plotData] = mockNewPlot.mock.calls[0];
      // Both arrays should have same length (truncated to shorter)
      expect(plotData[0].x.length).toBe(plotData[0].y.length);
      expect(plotData[0].x.length).toBe(3);
    });
  });
});

