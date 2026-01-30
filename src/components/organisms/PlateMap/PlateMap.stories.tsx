import { Meta, StoryObj } from "@storybook/react";
import { PlateMap, WellData } from "./PlateMap";

const meta: Meta<typeof PlateMap> = {
  title: "Organisms/PlateMap",
  component: PlateMap,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PlateMap>;

/**
 * Generate sample 96-well plate data with WellData format
 */
function generate96WellData(): WellData[] {
  const wells: WellData[] = [];
  const rows = "ABCDEFGH";
  
  for (let r = 0; r < 8; r++) {
    for (let c = 1; c <= 12; c++) {
      const wellId = `${rows[r]}${c}`;
      // Create some variation - higher values in center, some empty wells
      const baseValue = 5000 + Math.random() * 20000;
      const centerBoost = (r >= 2 && r <= 5 && c >= 4 && c <= 9) ? 10000 : 0;
      
      // Make a few wells empty
      if ((r === 0 && c === 12) || (r === 7 && c === 1)) {
        wells.push({ wellId, value: null });
      } else {
        wells.push({
          wellId,
          value: Math.round(baseValue + centerBoost),
          metadata: { sampleId: `S${r * 12 + c}`, concentration: "100 nM" },
        });
      }
    }
  }
  return wells;
}

/**
 * Generate sample 384-well plate data as 2D array
 */
function generate384WellGrid(): (number | null)[][] {
  const grid: (number | null)[][] = [];
  
  for (let r = 0; r < 16; r++) {
    const row: (number | null)[] = [];
    for (let c = 0; c < 24; c++) {
      // Create a gradient pattern
      const value = 1000 + (r * 1000) + (c * 500) + Math.random() * 2000;
      // Some empty wells at corners
      if ((r < 2 && c < 2) || (r >= 14 && c >= 22)) {
        row.push(null);
      } else {
        row.push(Math.round(value));
      }
    }
    grid.push(row);
  }
  return grid;
}

/**
 * 96-well plate with WellData array input
 * Demonstrates the recommended data format with well IDs, values, and metadata
 */
export const Plate96Well: Story = {
  args: {
    data: generate96WellData(),
    plateFormat: "96",
    title: "96-Well Plate Assay Results",
    valueUnit: " RFU",
    precision: 0,
    width: 700,
    height: 450,
    onWellClick: (wellId, value, metadata) => {
      console.log(`Clicked ${wellId}:`, value, metadata);
    },
  },
};

/**
 * 384-well plate with 2D array input
 * Demonstrates using a simple 2D array for larger plates
 */
export const Plate384Well: Story = {
  args: {
    data: generate384WellGrid(),
    plateFormat: "384",
    title: "384-Well Plate Screening",
    valueUnit: " AU",
    precision: 0,
    width: 900,
    height: 500,
  },
};

/**
 * Custom plate dimensions
 * Demonstrates using custom rows/columns for non-standard plates
 */
export const CustomDimensions: Story = {
  args: {
    data: [
      [100, 200, 300, 400],
      [150, 250, 350, 450],
      [200, 300, 400, 500],
    ],
    plateFormat: "custom",
    rows: 3,
    columns: 4,
    title: "Custom 3x4 Plate",
    valueUnit: " nM",
    precision: 1,
    width: 500,
    height: 350,
  },
};

/**
 * Partial plate with empty wells
 * Demonstrates handling of sparse data and empty wells
 */
export const PartialPlate: Story = {
  args: {
    data: [
      { wellId: "A1", value: 5000 },
      { wellId: "A2", value: 7500 },
      { wellId: "A3", value: null },
      { wellId: "B1", value: 6000 },
      { wellId: "B2", value: 8500 },
      { wellId: "B3", value: 9000 },
      { wellId: "C1", value: null },
      { wellId: "C2", value: 7000 },
      { wellId: "D4", value: 12000 },
      { wellId: "H12", value: 25000 },
    ] as WellData[],
    plateFormat: "96",
    title: "Partial Plate (Sparse Data)",
    valueUnit: " RFU",
    width: 700,
    height: 450,
    emptyWellColor: "#e0e0e0",
  },
};

/**
 * Generic heatmap with axis titles
 * Demonstrates using PlateMap as a general-purpose heatmap with custom axis labels
 */
export const GenericHeatmap: Story = {
  args: {
    data: [
      [5000, 10000, 15000, 20000, 25000],
      [10000, 15000, 20000, 25000, 30000],
      [15000, 20000, 25000, 30000, 35000],
      [20000, 25000, 30000, 35000, 40000],
      [25000, 30000, 35000, 40000, 45000],
    ],
    plateFormat: "custom",
    rows: 5,
    columns: 5,
    xLabels: ["X1", "X2", "X3", "X4", "X5"],
    yLabels: ["Y1", "Y2", "Y3", "Y4", "Y5"],
    xTitle: "X Axis",
    yTitle: "Y Axis",
    title: "Generic Heatmap with Custom Labels",
    width: 600,
    height: 500,
    precision: 0,
  },
};

/**
 * Auto-generated random data
 * Demonstrates PlateMap with no data - generates random values automatically
 */
export const RandomData: Story = {
  args: {
    plateFormat: "96",
    title: "Auto-generated Random Data",
    xTitle: "Columns",
    yTitle: "Rows",
    valueUnit: " RFU",
    precision: 0,
    width: 800,
    height: 500,
  },
};
