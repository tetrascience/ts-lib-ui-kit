import React, { useState } from "react";
import { expect, within } from "storybook/test";

import { InteractiveScatter } from "./InteractiveScatter";

import type { ScatterPoint } from "./types";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof InteractiveScatter> = {
  title: "Organisms/InteractiveScatter",
  component: InteractiveScatter,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof InteractiveScatter>;

/**
 * Generate sample scatter data
 */
function generateScatterData(count: number): ScatterPoint[] {
  const points: ScatterPoint[] = [];
  const categories = ["Group A", "Group B", "Group C"];
  const statuses = ["Active", "Inactive", "Pending"];

  for (let i = 0; i < count; i++) {
    points.push({
      id: `point-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      label: `Point ${i}`,
      metadata: {
        category: categories[i % categories.length],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        value: Math.random() * 1000,
        intensity: Math.random() * 10,
        concentration: (Math.random() * 100).toFixed(2),
      },
    });
  }

  return points;
}

/**
 * Generate clustered data for demonstrating patterns
 */
function generateClusteredData(): ScatterPoint[] {
  const points: ScatterPoint[] = [];
  const clusters = [
    { centerX: 25, centerY: 25, label: "Cluster A", count: 50 },
    { centerX: 75, centerY: 75, label: "Cluster B", count: 50 },
    { centerX: 50, centerY: 90, label: "Cluster C", count: 30 },
  ];

  let id = 0;
  for (const cluster of clusters) {
    for (let i = 0; i < cluster.count; i++) {
      points.push({
        id: `point-${id++}`,
        x: cluster.centerX + (Math.random() - 0.5) * 20,
        y: cluster.centerY + (Math.random() - 0.5) * 20,
        label: `${cluster.label} ${i}`,
        metadata: {
          cluster: cluster.label,
          value: Math.random() * 1000,
          intensity: Math.random() * 10,
        },
      });
    }
  }

  return points;
}

/**
 * Basic scatter plot with default settings
 */
export const BasicScatter: Story = {
  args: {
    data: generateScatterData(100),
    title: "Basic Scatter Plot",
    xAxis: { title: "X Axis" },
    yAxis: { title: "Y Axis" },
    width: 800,
    height: 600,
  },
  play: async ({ canvasElement, step }) => {
    const _canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      const title = _canvas.getByText("Basic Scatter Plot");
      expect(title).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T2001" },
  },
};

/**
 * Combined styling: color, shape, and size
 */
export const CombinedStyling: Story = {
  args: {
    data: generateScatterData(150),
    title: "Combined Color, Shape, and Size Mapping",
    xAxis: { title: "X Axis" },
    yAxis: { title: "Y Axis" },
    colorMapping: {
      type: "categorical",
      field: "category",
      categoryColors: {
        "Group A": "#4575b4",
        "Group B": "#d73027",
        "Group C": "#1a9850",
      },
    },
    shapeMapping: {
      type: "categorical",
      field: "status",
      categoryShapes: {
        Active: "circle",
        Inactive: "square",
        Pending: "diamond",
      },
    },
    sizeMapping: {
      type: "continuous",
      field: "intensity",
      sizeRange: [4, 20],
    },
    width: 800,
    height: 600,
  },
  play: async ({ canvasElement, step }) => {
    await step("Chart renders with combined styling", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T2007" },
  },
};

/**
 * Large dataset with downsampling
 */
export const LargeDataset: Story = {
  args: {
    data: generateScatterData(10000),
    title: "Large Dataset (10k points with downsampling)",
    xAxis: { title: "X Axis" },
    yAxis: { title: "Y Axis" },
    downsampling: {
      enabled: true,
      maxPoints: 2000,
      strategy: "lttb",
    },
    width: 800,
    height: 600,
  },
  play: async ({ canvasElement, step }) => {
    await step("Chart renders with downsampled data", async () => {
      const container = canvasElement.querySelector(".js-plotly-plot");
      expect(container).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T2014" },
  },
};

/**
 * Selection with data table (demonstrates selection propagation)
 */
export const SelectionWithTable: Story = {
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

    const selectedPoints = args.data.filter((p) => selectedIds.has(p.id));

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <InteractiveScatter {...args} selectedIds={selectedIds} onSelectionChange={setSelectedIds} />
        <div style={{ maxWidth: 800 }}>
          <h3 style={{ marginTop: 0 }}>Selected Points ({selectedPoints.length})</h3>
          {selectedPoints.length > 0 ? (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #ddd",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f0f0f0" }}>
                  <th style={{ padding: 8, border: "1px solid #ddd" }}>ID</th>
                  <th style={{ padding: 8, border: "1px solid #ddd" }}>X</th>
                  <th style={{ padding: 8, border: "1px solid #ddd" }}>Y</th>
                  <th style={{ padding: 8, border: "1px solid #ddd" }}>Cluster</th>
                  <th style={{ padding: 8, border: "1px solid #ddd" }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {selectedPoints.map((point) => (
                  <tr key={point.id}>
                    <td style={{ padding: 8, border: "1px solid #ddd" }}>{point.id}</td>
                    <td style={{ padding: 8, border: "1px solid #ddd" }}>{point.x.toFixed(2)}</td>
                    <td style={{ padding: 8, border: "1px solid #ddd" }}>{point.y.toFixed(2)}</td>
                    <td style={{ padding: 8, border: "1px solid #ddd" }}>{String(point.metadata?.cluster ?? "")}</td>
                    <td style={{ padding: 8, border: "1px solid #ddd" }}>
                      {typeof point.metadata?.value === "number" ? (point.metadata.value as number).toFixed(2) : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No points selected. Use box or lasso selection to select points.</p>
          )}
        </div>
      </div>
    );
  },
  args: {
    data: generateClusteredData(),
    title: "Selection Propagation Demo",
    xAxis: { title: "X Axis" },
    yAxis: { title: "Y Axis" },
    colorMapping: {
      type: "categorical",
      field: "cluster",
    },
    enableBoxSelection: true,
    enableLassoSelection: true,
    width: 800,
    height: 600,
  },
  parameters: {
    zephyr: { testCaseId: "SW-T2016" },
  },
};

/**
 * All features combined
 */
export const AllFeaturesCombined: Story = {
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <p>Selected: {selectedIds.size} points</p>
        </div>
        <InteractiveScatter
          {...args}
          selectedIds={selectedIds}
          onSelectionChange={(ids, mode) => {
            setSelectedIds(ids);
            console.log(`Selection changed (${mode}):`, [...ids]);
          }}
          onPointClick={(point) => {
            console.log("Point clicked:", point);
          }}
        />
      </div>
    );
  },
  args: {
    data: generateScatterData(500),
    title: "All Features Demo",
    xAxis: { title: "X Axis", autoRange: true },
    yAxis: { title: "Y Axis", autoRange: true },
    colorMapping: {
      type: "continuous",
      field: "value",
      colorScale: "Viridis",
    },
    shapeMapping: {
      type: "categorical",
      field: "status",
    },
    sizeMapping: {
      type: "continuous",
      field: "intensity",
      sizeRange: [4, 16],
    },
    tooltip: {
      enabled: true,
      fields: ["category", "status", "concentration"],
    },
    enableClickSelection: true,
    enableBoxSelection: true,
    enableLassoSelection: true,
    width: 900,
    height: 700,
  },
  parameters: {
    zephyr: { testCaseId: "SW-T2017" },
  },
};
