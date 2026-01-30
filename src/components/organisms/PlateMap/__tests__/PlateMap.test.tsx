import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { PlateMap } from "../PlateMap";
import type { WellData } from "../PlateMap";

// Mock Plotly
const mockNewPlot = vi.fn();
const mockPurge = vi.fn();
const mockOn = vi.fn();

vi.mock("plotly.js-dist", () => ({
  default: {
    newPlot: (...args: unknown[]) => {
      mockNewPlot(...args);
      // Return a mock element with 'on' method for click handling
      if (args[0] && typeof args[0] === "object") {
        (args[0] as { on: typeof mockOn }).on = mockOn;
      }
    },
    purge: (...args: unknown[]) => mockPurge(...args),
  },
}));

// Mock SCSS import
vi.mock("../PlateMap.scss", () => ({}));

describe("PlateMap", () => {
  const mockWellData: WellData[] = [
    { wellId: "A1", value: 1000 },
    { wellId: "A2", value: 2000 },
    { wellId: "B1", value: 1500 },
    { wellId: "B2", value: 2500 },
  ];

  const mock2DData: (number | null)[][] = [
    [100, 200, 300],
    [400, 500, 600],
    [700, 800, 900],
  ];

  beforeEach(() => {
    mockNewPlot.mockClear();
    mockPurge.mockClear();
    mockOn.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  describe("rendering", () => {
    it("should render the container element", () => {
      const { container } = render(<PlateMap data={mockWellData} />);
      const chartContainer = container.querySelector(".platemap-container");
      expect(chartContainer).toBeTruthy();
    });

    it("should call Plotly.newPlot when data is provided", () => {
      render(<PlateMap data={mockWellData} />);
      expect(mockNewPlot).toHaveBeenCalledTimes(1);
    });

    it("should call Plotly.purge on unmount", () => {
      const { unmount } = render(<PlateMap data={mockWellData} />);
      unmount();
      expect(mockPurge).toHaveBeenCalledTimes(1);
    });

    it("should render with empty data array", () => {
      const { container } = render(<PlateMap data={[]} />);
      expect(container.querySelector(".platemap-container")).toBeTruthy();
    });
  });

  describe("plate format configurations", () => {
    it("should use 96-well format by default (8 rows, 12 columns)", () => {
      render(<PlateMap data={mockWellData} />);
      
      const [, plotData] = mockNewPlot.mock.calls[0];
      const heatmapData = plotData[0];
      
      // y-axis should have 8 row labels (A-H)
      expect(heatmapData.y).toHaveLength(8);
      expect(heatmapData.y[0]).toBe("A");
      expect(heatmapData.y[7]).toBe("H");
      
      // x-axis should have 12 column labels (1-12)
      expect(heatmapData.x).toHaveLength(12);
      expect(heatmapData.x[0]).toBe(1);
      expect(heatmapData.x[11]).toBe(12);
    });

    it("should use 384-well format when specified (16 rows, 24 columns)", () => {
      render(<PlateMap data={mock2DData} plateFormat="384" />);
      
      const [, plotData] = mockNewPlot.mock.calls[0];
      const heatmapData = plotData[0];
      
      expect(heatmapData.y).toHaveLength(16);
      expect(heatmapData.y[0]).toBe("A");
      expect(heatmapData.y[15]).toBe("P");
      
      expect(heatmapData.x).toHaveLength(24);
      expect(heatmapData.x[0]).toBe(1);
      expect(heatmapData.x[23]).toBe(24);
    });

    it("should use custom dimensions when plateFormat is custom", () => {
      render(
        <PlateMap
          data={mock2DData}
          plateFormat="custom"
          rows={3}
          columns={4}
        />
      );
      
      const [, plotData] = mockNewPlot.mock.calls[0];
      const heatmapData = plotData[0];
      
      expect(heatmapData.y).toHaveLength(3);
      expect(heatmapData.x).toHaveLength(4);
    });
  });

  describe("data handling", () => {
    it("should convert WellData array to grid format", () => {
      render(<PlateMap data={mockWellData} plateFormat="96" />);
      
      const [, plotData] = mockNewPlot.mock.calls[0];
      const grid = plotData[0].z;
      
      // A1 should be at grid[0][0] = 1000
      expect(grid[0][0]).toBe(1000);
      // A2 should be at grid[0][1] = 2000
      expect(grid[0][1]).toBe(2000);
      // B1 should be at grid[1][0] = 1500
      expect(grid[1][0]).toBe(1500);
      // B2 should be at grid[1][1] = 2500
      expect(grid[1][1]).toBe(2500);
    });

    it("should handle 2D array input directly", () => {
      render(<PlateMap data={mock2DData} plateFormat="custom" rows={3} columns={3} />);

      const [, plotData] = mockNewPlot.mock.calls[0];
      const grid = plotData[0].z;

      expect(grid[0][0]).toBe(100);
      expect(grid[1][1]).toBe(500);
      expect(grid[2][2]).toBe(900);
    });

    it("should handle null values for empty wells", () => {
      const dataWithNulls: WellData[] = [
        { wellId: "A1", value: 1000 },
        { wellId: "A2", value: null },
        { wellId: "B1", value: null },
        { wellId: "B2", value: 2000 },
      ];

      render(<PlateMap data={dataWithNulls} plateFormat="96" />);

      const [, plotData] = mockNewPlot.mock.calls[0];
      const grid = plotData[0].z;

      expect(grid[0][0]).toBe(1000);
      expect(grid[0][1]).toBeNull();
      expect(grid[1][0]).toBeNull();
      expect(grid[1][1]).toBe(2000);
    });

    it("should handle wells not provided (sparse data)", () => {
      const sparseData: WellData[] = [
        { wellId: "A1", value: 1000 },
        { wellId: "H12", value: 5000 },
      ];

      render(<PlateMap data={sparseData} plateFormat="96" />);

      const [, plotData] = mockNewPlot.mock.calls[0];
      const grid = plotData[0].z;

      // A1 should have data
      expect(grid[0][0]).toBe(1000);
      // H12 should have data (row 7, col 11)
      expect(grid[7][11]).toBe(5000);
      // Other wells should be null
      expect(grid[0][5]).toBeNull();
      expect(grid[3][3]).toBeNull();
    });

    it("should handle case-insensitive well IDs", () => {
      const mixedCaseData: WellData[] = [
        { wellId: "a1", value: 100 },
        { wellId: "B2", value: 200 },
        { wellId: "c3", value: 300 },
      ];

      render(<PlateMap data={mixedCaseData} plateFormat="96" />);

      const [, plotData] = mockNewPlot.mock.calls[0];
      const grid = plotData[0].z;

      expect(grid[0][0]).toBe(100);
      expect(grid[1][1]).toBe(200);
      expect(grid[2][2]).toBe(300);
    });

    it("should ignore invalid well IDs", () => {
      const dataWithInvalid: WellData[] = [
        { wellId: "A1", value: 1000 },
        { wellId: "ZZ99", value: 9999 }, // Invalid
        { wellId: "A", value: 8888 }, // Invalid
        { wellId: "", value: 7777 }, // Invalid
      ];

      render(<PlateMap data={dataWithInvalid} plateFormat="96" />);

      const [, plotData] = mockNewPlot.mock.calls[0];
      const grid = plotData[0].z;

      expect(grid[0][0]).toBe(1000);
      // Invalid wells should not appear - grid should be mostly null
      expect(grid[0][1]).toBeNull();
    });
  });

  describe("value range calculation", () => {
    it("should auto-calculate min/max from data", () => {
      const rangeData: WellData[] = [
        { wellId: "A1", value: 100 },
        { wellId: "A2", value: 500 },
        { wellId: "A3", value: 300 },
      ];

      render(<PlateMap data={rangeData} plateFormat="96" />);

      const [, plotData] = mockNewPlot.mock.calls[0];

      expect(plotData[0].zmin).toBe(100);
      expect(plotData[0].zmax).toBe(500);
    });

    it("should use provided valueMin and valueMax", () => {
      render(
        <PlateMap
          data={mockWellData}
          valueMin={0}
          valueMax={10000}
          plateFormat="96"
        />
      );

      const [, plotData] = mockNewPlot.mock.calls[0];

      expect(plotData[0].zmin).toBe(0);
      expect(plotData[0].zmax).toBe(10000);
    });

    it("should handle all-null data gracefully", () => {
      const nullData: WellData[] = [
        { wellId: "A1", value: null },
        { wellId: "A2", value: null },
      ];

      render(<PlateMap data={nullData} plateFormat="96" />);

      const [, plotData] = mockNewPlot.mock.calls[0];

      // Should default to 0-1 range when all nulls
      expect(plotData[0].zmin).toBe(0);
      expect(plotData[0].zmax).toBe(1);
    });
  });

  describe("tooltip and hover text", () => {
    it("should generate hover text with well IDs", () => {
      render(<PlateMap data={mockWellData} plateFormat="96" />);

      const [, plotData] = mockNewPlot.mock.calls[0];
      const hoverText = plotData[0].text;

      // Check A1 hover text
      expect(hoverText[0][0]).toContain("Well A1");
      expect(hoverText[0][0]).toContain("1000");
    });

    it("should show 'No data' for null values", () => {
      const dataWithNull: WellData[] = [
        { wellId: "A1", value: null },
      ];

      render(<PlateMap data={dataWithNull} plateFormat="96" />);

      const [, plotData] = mockNewPlot.mock.calls[0];
      const hoverText = plotData[0].text;

      expect(hoverText[0][0]).toContain("Well A1");
      expect(hoverText[0][0]).toContain("No data");
    });

    it("should include metadata in hover text", () => {
      const dataWithMetadata: WellData[] = [
        { wellId: "A1", value: 1000, metadata: { sample: "Test1", batch: "B001" } },
      ];

      render(<PlateMap data={dataWithMetadata} plateFormat="96" />);

      const [, plotData] = mockNewPlot.mock.calls[0];
      const hoverText = plotData[0].text;

      expect(hoverText[0][0]).toContain("sample");
      expect(hoverText[0][0]).toContain("Test1");
    });

    it("should apply valueUnit to hover text", () => {
      render(<PlateMap data={mockWellData} valueUnit=" RFU" plateFormat="96" />);

      const [, plotData] = mockNewPlot.mock.calls[0];
      const hoverText = plotData[0].text;

      expect(hoverText[0][0]).toContain("RFU");
    });
  });

  describe("layout and appearance", () => {
    it("should use provided title", () => {
      render(<PlateMap data={mockWellData} title="Test Plate" plateFormat="96" />);

      const [, , layout] = mockNewPlot.mock.calls[0];

      expect(layout.title.text).toBe("Test Plate");
    });

    it("should use provided dimensions", () => {
      render(<PlateMap data={mockWellData} width={1000} height={600} plateFormat="96" />);

      const [, , layout] = mockNewPlot.mock.calls[0];

      expect(layout.width).toBe(1000);
      expect(layout.height).toBe(600);
    });

    it("should show color bar by default", () => {
      render(<PlateMap data={mockWellData} plateFormat="96" />);

      const [, plotData] = mockNewPlot.mock.calls[0];

      expect(plotData[0].showscale).toBe(true);
    });

    it("should hide color bar when showColorBar is false", () => {
      render(<PlateMap data={mockWellData} showColorBar={false} plateFormat="96" />);

      const [, plotData] = mockNewPlot.mock.calls[0];

      expect(plotData[0].showscale).toBe(false);
    });

    it("should use custom color scale when provided", () => {
      const customScale: Array<[number, string]> = [
        [0, "#000000"],
        [1, "#FFFFFF"],
      ];

      render(<PlateMap data={mockWellData} colorScale={customScale} plateFormat="96" />);

      const [, plotData] = mockNewPlot.mock.calls[0];

      expect(plotData[0].colorscale).toEqual(customScale);
    });
  });

  describe("axis titles and custom labels", () => {
    it("should use xTitle and yTitle when provided", () => {
      render(
        <PlateMap
          data={mockWellData}
          plateFormat="96"
          xTitle="Columns"
          yTitle="Rows"
        />
      );

      const [, , layout] = mockNewPlot.mock.calls[0];

      expect(layout.xaxis.title.text).toBe("Columns");
      expect(layout.yaxis.title.text).toBe("Rows");
    });

    it("should use custom xLabels when provided", () => {
      const customData = [
        [100, 200, 300],
        [400, 500, 600],
      ];

      render(
        <PlateMap
          data={customData}
          plateFormat="custom"
          rows={2}
          columns={3}
          xLabels={["X1", "X2", "X3"]}
        />
      );

      const [, plotData] = mockNewPlot.mock.calls[0];

      expect(plotData[0].x).toEqual(["X1", "X2", "X3"]);
    });

    it("should use custom yLabels when provided", () => {
      const customData = [
        [100, 200, 300],
        [400, 500, 600],
      ];

      render(
        <PlateMap
          data={customData}
          plateFormat="custom"
          rows={2}
          columns={3}
          yLabels={["Row 1", "Row 2"]}
        />
      );

      const [, plotData] = mockNewPlot.mock.calls[0];

      expect(plotData[0].y).toEqual(["Row 1", "Row 2"]);
    });

    it("should generate random data when no data is provided", () => {
      render(<PlateMap plateFormat="96" />);

      const [, plotData] = mockNewPlot.mock.calls[0];

      // Should generate 8 rows for 96-well format
      expect(plotData[0].z.length).toBe(8);
      // Each row should have 12 columns
      expect(plotData[0].z[0].length).toBe(12);
      // Values should be numbers (generated randomly)
      expect(typeof plotData[0].z[0][0]).toBe("number");
    });

    it("should support numeric xLabels and yLabels", () => {
      const customData = [[100, 200], [300, 400]];

      render(
        <PlateMap
          data={customData}
          plateFormat="custom"
          rows={2}
          columns={2}
          xLabels={[1, 2]}
          yLabels={[10, 20]}
        />
      );

      const [, plotData] = mockNewPlot.mock.calls[0];

      expect(plotData[0].x).toEqual([1, 2]);
      expect(plotData[0].y).toEqual([10, 20]);
    });
  });
});
