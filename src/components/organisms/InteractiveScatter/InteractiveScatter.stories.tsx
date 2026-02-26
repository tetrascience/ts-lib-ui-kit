import React, { useState } from "react";

import { InteractiveScatter } from "./InteractiveScatter";

import type { ScatterPoint, SelectionMode } from "./types";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof InteractiveScatter> = {
  title: "Organisms/InteractiveScatter",
  component: InteractiveScatter,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof InteractiveScatter>;

const CATEGORIES = ["Group A", "Group B", "Group C"];
const STATUSES = ["Active", "Inactive", "Pending"];

const rand = () => Math.random();

function scatterData(count: number): ScatterPoint[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `point-${i}`,
    x: rand() * 100,
    y: rand() * 100,
    label: `Point ${i}`,
    metadata: {
      category: CATEGORIES[i % 3],
      status: STATUSES[i % 3],
      value: rand() * 1000,
      intensity: rand() * 10,
      concentration: Number((rand() * 100).toFixed(2)),
    },
  }));
}

function clusteredData(): ScatterPoint[] {
  const clusters = [
    { cx: 25, cy: 25, label: "Cluster A", n: 50 },
    { cx: 75, cy: 75, label: "Cluster B", n: 50 },
    { cx: 50, cy: 90, label: "Cluster C", n: 30 },
  ];
  let id = 0;
  return clusters.flatMap((c) =>
    Array.from({ length: c.n }, () => ({
      id: `point-${id++}`,
      x: c.cx + (rand() - 0.5) * 20,
      y: c.cy + (rand() - 0.5) * 20,
      label: `${c.label} ${id}`,
      metadata: { cluster: c.label, value: rand() * 1000, intensity: rand() * 10 },
    })),
  );
}

function logScaleData(): ScatterPoint[] {
  return Array.from({ length: 80 }, (_, i) => ({
    id: `point-${i}`,
    x: 10 ** (rand() * 4),
    y: 10 ** (rand() * 5),
    label: `Sample ${i}`,
    metadata: { category: i % 2 === 0 ? "Type X" : "Type Y" },
  }));
}

const BASIC_DATA = scatterData(100);
const STYLED_DATA = scatterData(150);
const STATIC_DATA = scatterData(80);
const SELECTION_DATA = scatterData(80);
const CLUSTERED_DATA = clusteredData();
const TOOLTIP_DATA = scatterData(100);
const AXIS_DATA = scatterData(200);
const LOG_DATA = logScaleData();
const LARGE_DATA = scatterData(10_000);

const DEFAULT_DIMS = { width: 800, height: 600 } as const;

const cellStyle: React.CSSProperties = { padding: 8, border: "1px solid #ddd" };

/** Minimal scatter plot — just data and axis titles, everything else defaults. */
export const BasicScatter: Story = {
  args: {
    data: BASIC_DATA,
    title: "Basic Scatter Plot",
    xAxis: { title: "X Axis" },
    yAxis: { title: "Y Axis" },
    ...DEFAULT_DIMS,
  },
};

/**
 * Color mapped to `category` (categorical), shape to `status` (categorical),
 * size to `intensity` (continuous) — all driven by point metadata.
 */
export const DataDrivenStyling: Story = {
  args: {
    data: STYLED_DATA,
    title: "Data-Driven Color / Shape / Size",
    xAxis: { title: "X Axis" },
    yAxis: { title: "Y Axis" },
    colorMapping: {
      type: "categorical",
      field: "category",
      categoryColors: { "Group A": "#4575b4", "Group B": "#d73027", "Group C": "#1a9850" },
    },
    shapeMapping: {
      type: "categorical",
      field: "status",
      categoryShapes: { Active: "circle", Inactive: "square", Pending: "diamond" },
    },
    sizeMapping: { type: "continuous", field: "intensity", sizeRange: [4, 20] },
    ...DEFAULT_DIMS,
  },
};

/** Fixed color, shape, and size — ignores data values entirely. */
export const StaticStyling: Story = {
  args: {
    data: STATIC_DATA,
    title: "Static Styling",
    xAxis: { title: "X Axis" },
    yAxis: { title: "Y Axis" },
    colorMapping: { type: "static", value: "#e377c2" },
    shapeMapping: { type: "static", value: "diamond" },
    sizeMapping: { type: "static", value: 12 },
    ...DEFAULT_DIMS,
  },
};

/**
 * All three selection modes enabled: click a point, drag a box, or draw a
 * lasso. The selected count is shown below the chart.
 */
export const Selection: Story = {
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

    return (
      <div>
        <InteractiveScatter {...args} selectedIds={selectedIds} onSelectionChange={setSelectedIds} />
        <p style={{ fontFamily: "monospace", marginTop: 12 }}>Selected: {selectedIds.size} point(s)</p>
      </div>
    );
  },
  args: {
    data: CLUSTERED_DATA,
    title: "Click / Box / Lasso Selection",
    xAxis: { title: "X Axis" },
    yAxis: { title: "Y Axis" },
    colorMapping: { type: "categorical", field: "cluster" },
    enableClickSelection: true,
    enableBoxSelection: true,
    enableLassoSelection: true,
    ...DEFAULT_DIMS,
  },
};

/**
 * Click = replace, Shift+Click = add, Ctrl/Cmd+Click = remove,
 * Shift+Ctrl/Cmd+Click = toggle. The active mode is shown below.
 */
export const KeyboardModifierSelection: Story = {
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [lastMode, setLastMode] = useState<SelectionMode>("replace");

    return (
      <div>
        <InteractiveScatter
          {...args}
          selectedIds={selectedIds}
          onSelectionChange={(ids, mode) => {
            setSelectedIds(ids);
            setLastMode(mode);
          }}
        />
        <div style={{ fontFamily: "monospace", marginTop: 12, lineHeight: 1.8 }}>
          <p style={{ margin: 0 }}>
            Selected: {selectedIds.size} &nbsp;|&nbsp; Mode: <strong>{lastMode}</strong>
          </p>
          <p style={{ margin: 0, color: "#666", fontSize: 13 }}>
            Click = replace · Shift = add · Ctrl/Cmd = remove · Shift+Ctrl/Cmd = toggle
          </p>
        </div>
      </div>
    );
  },
  args: {
    data: SELECTION_DATA,
    title: "Keyboard Modifier Selection",
    xAxis: { title: "X Axis" },
    yAxis: { title: "Y Axis" },
    colorMapping: { type: "categorical", field: "category" },
    enableClickSelection: true,
    enableBoxSelection: true,
    enableLassoSelection: true,
    ...DEFAULT_DIMS,
  },
};

/** Select points and a data grid to the right updates in real time. */
export const SelectionWithDataGrid: Story = {
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const selected = args.data.filter((p) => selectedIds.has(p.id));

    return (
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <InteractiveScatter {...args} selectedIds={selectedIds} onSelectionChange={setSelectedIds} />

        <div style={{ minWidth: 340, maxHeight: 600, overflowY: "auto" }}>
          <h3 style={{ margin: "0 0 8px" }}>Selected Points ({selected.length})</h3>
          {selected.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd", fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: "#f0f0f0" }}>
                  {["ID", "X", "Y", "Cluster", "Value"].map((h) => (
                    <th key={h} style={cellStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selected.map((p) => (
                  <tr key={p.id}>
                    <td style={cellStyle}>{p.id}</td>
                    <td style={cellStyle}>{p.x.toFixed(2)}</td>
                    <td style={cellStyle}>{p.y.toFixed(2)}</td>
                    <td style={cellStyle}>{String(p.metadata?.cluster ?? "")}</td>
                    <td style={cellStyle}>
                      {typeof p.metadata?.value === "number" ? (p.metadata.value as number).toFixed(2) : "–"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: "#888" }}>Select points to populate the grid.</p>
          )}
        </div>
      </div>
    );
  },
  args: {
    data: CLUSTERED_DATA,
    title: "Selection → Data Grid",
    xAxis: { title: "X Axis" },
    yAxis: { title: "Y Axis" },
    colorMapping: { type: "categorical", field: "cluster" },
    enableClickSelection: true,
    enableBoxSelection: true,
    enableLassoSelection: true,
    width: 700,
    height: 600,
  },
};

/** Uses `tooltip.content` to render rich HTML tooltips with status badges. */
export const CustomTooltips: Story = {
  args: {
    data: TOOLTIP_DATA,
    title: "Custom Rich Tooltips",
    xAxis: { title: "X Axis" },
    yAxis: { title: "Y Axis" },
    colorMapping: {
      type: "categorical",
      field: "category",
      categoryColors: { "Group A": "#4575b4", "Group B": "#d73027", "Group C": "#1a9850" },
    },
    sizeMapping: { type: "continuous", field: "intensity", sizeRange: [5, 18] },
    tooltip: {
      enabled: true,
      content: (point: ScatterPoint) => {
        const status = point.metadata?.status ?? "Unknown";
        const value = typeof point.metadata?.value === "number" ? (point.metadata.value as number).toFixed(1) : "–";
        const badge = status === "Active" ? "#1a9850" : status === "Inactive" ? "#d73027" : "#fdae61";
        return [
          `<b>${point.label ?? point.id}</b>`,
          `<span style="background:${badge};color:#fff;padding:1px 6px;border-radius:3px;font-size:11px">${String(status)}</span>`,
          `X: ${point.x.toFixed(2)} · Y: ${point.y.toFixed(2)}`,
          `Value: <b>${value}</b> · Conc: ${String(point.metadata?.concentration ?? "–")}`,
        ].join("<br>");
      },
    },
    ...DEFAULT_DIMS,
  },
};

/** Fixed axis ranges zoom the viewport to a specific data region. */
export const AxisFixedRanges: Story = {
  args: {
    data: AXIS_DATA,
    title: "Fixed Axis Ranges (zoomed to 20-80)",
    xAxis: { title: "X Axis", range: [20, 80] },
    yAxis: { title: "Y Axis", range: [20, 80] },
    colorMapping: { type: "categorical", field: "category" },
    ...DEFAULT_DIMS,
  },
};

/** Log-scale axes for data spanning several orders of magnitude. */
export const AxisLogScale: Story = {
  args: {
    data: LOG_DATA,
    title: "Log-Scale Axes",
    xAxis: { title: "X (log)", scale: "log" },
    yAxis: { title: "Y (log)", scale: "log" },
    colorMapping: { type: "categorical", field: "category" },
    ...DEFAULT_DIMS,
  },
};

/** 10k points downsampled to 2k via LTTB to keep the chart responsive. */
export const Downsampling: Story = {
  args: {
    data: LARGE_DATA,
    title: "Downsampling (10k → 2k via LTTB)",
    xAxis: { title: "X Axis" },
    yAxis: { title: "Y Axis" },
    downsampling: { enabled: true, maxPoints: 2000, strategy: "lttb" },
    ...DEFAULT_DIMS,
  },
};
