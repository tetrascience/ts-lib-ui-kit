import React, { useEffect, useRef, useState } from "react";
import { expect, fireEvent, waitFor, within } from "storybook/test";

import { ScatterPlotInteractive } from "./ScatterPlotInteractive";

import type { ScatterPoint, SelectionMode } from "./types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";

const meta: Meta<typeof ScatterPlotInteractive> = {
  title: "Data Viz/Scatter Plot Interactive",
  component: ScatterPlotInteractive,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof ScatterPlotInteractive>;

/** The marks ts-lib-viz draws for points: a circle for a round glyph, a path for the others. */
const pointMarks = (canvasElement: HTMLElement) =>
  canvasElement.querySelectorAll('[data-geom="points"] circle, [data-geom="points"] path');

/** The transparent layer over the points, which takes the pointer. */
const pointerLayer = (canvasElement: HTMLElement) =>
  canvasElement.querySelector('[data-geom="points"] rect') as SVGRectElement;

/** Lets Viz take a hover before the next event reads it. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 50));

type Modifiers = { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean };

/** Where a pointer lands on the middle of an element. */
const centerOf = (element: Element) => {
  const box = element.getBoundingClientRect();
  return { clientX: box.left + box.width / 2, clientY: box.top + box.height / 2, pointerId: 1, button: 0 };
};

/** Moves onto a point and clicks it, with any modifier keys held. The event goes to whatever is on top under the pointer. */
async function clickPoint(canvasElement: HTMLElement, mark: Element, modifiers: Modifiers = {}) {
  const at = { ...centerOf(mark), ...modifiers };
  const target = canvasElement.ownerDocument.elementFromPoint(at.clientX, at.clientY) ?? pointerLayer(canvasElement);
  fireEvent.pointerMove(target, at);
  await settle();
  fireEvent.pointerDown(target, at);
  fireEvent.pointerUp(target, at);
  fireEvent.click(target, at);
  await settle();
}

/** Drags a lasso through the corners given, closes it on the first, and releases. */
async function lassoAround(canvasElement: HTMLElement, corners: Array<{ clientX: number; clientY: number }>) {
  const brush = canvasElement.querySelector("[data-brush]") as SVGGElement;
  const start = { ...corners[0], pointerId: 1, button: 0 };
  fireEvent.pointerDown(brush, start);
  for (const corner of [...corners.slice(1), corners[0]]) {
    fireEvent.pointerMove(brush, { ...corner, pointerId: 1 });
    await settle();
  }
  fireEvent.pointerUp(brush, start);
  // A drag ends in a click on the common ancestor, which is what clears the drag state.
  fireEvent.click(brush);
  await settle();
}

/** Corners of a rectangle that holds the given marks, with a little room to spare. */
function boxAround(marks: Element[], pad = 8) {
  const boxes = marks.map((mark) => mark.getBoundingClientRect());
  const left = Math.min(...boxes.map((box) => box.left)) - pad;
  const right = Math.max(...boxes.map((box) => box.right)) + pad;
  const top = Math.min(...boxes.map((box) => box.top)) - pad;
  const bottom = Math.max(...boxes.map((box) => box.bottom)) + pad;
  return [
    { clientX: left, clientY: top },
    { clientX: right, clientY: top },
    { clientX: right, clientY: bottom },
    { clientX: left, clientY: bottom },
  ];
}

/** A lasso over the lower-left quarter of the plot, from its center down to its corner. */
function lowerLeftQuarter(canvasElement: HTMLElement) {
  const area = pointerLayer(canvasElement).getBoundingClientRect();
  const midX = area.left + area.width / 2;
  const midY = area.top + area.height / 2;
  return [
    { clientX: midX, clientY: midY },
    { clientX: area.left + 4, clientY: midY },
    { clientX: area.left + 4, clientY: area.bottom - 4 },
    { clientX: midX, clientY: area.bottom - 4 },
  ];
}

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
const LARGE_DATA_COUNT = 10_000;

function parseCsvToPoints(text: string): ScatterPoint[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const xIdx = headers.indexOf("x");
  const yIdx = headers.indexOf("y");
  if (xIdx === -1 || yIdx === -1) return [];

  const idIdx = headers.indexOf("id");
  const labelIdx = headers.indexOf("label");
  const metaHeaders = headers.filter((_, i) => ![xIdx, yIdx, idIdx, labelIdx].includes(i));

  return lines.slice(1).flatMap((line, i) => {
    const cols = line.split(",").map((c) => c.trim());
    const x = Number(cols[xIdx]);
    const y = Number(cols[yIdx]);
    if (Number.isNaN(x) || Number.isNaN(y)) return [];

    const metadata: Record<string, unknown> = {};
    for (const key of metaHeaders) {
      const val = cols[headers.indexOf(key)];
      metadata[key] = Number.isNaN(Number(val)) ? val : Number(val);
    }

    return {
      id: idIdx === -1 ? `row-${i}` : cols[idIdx],
      x,
      y,
      label: labelIdx === -1 ? undefined : cols[labelIdx],
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    };
  });
}

function parseJsonToPoints(text: string): ScatterPoint[] {
  const raw = JSON.parse(text);
  const arr: unknown[] = Array.isArray(raw) ? raw : [];
  return arr.flatMap((item, i) => {
    if (typeof item !== "object" || item === null) return [];
    const obj = item as Record<string, unknown>;
    const x = Number(obj.x);
    const y = Number(obj.y);
    if (Number.isNaN(x) || Number.isNaN(y)) return [];

    const { id, x: _, y: __, label, ...rest } = obj;
    return {
      id: id == null ? `row-${i}` : String(id),
      x,
      y,
      label: label == null ? undefined : String(label),
      metadata: Object.keys(rest).length > 0 ? (rest as Record<string, unknown>) : undefined,
    };
  });
}

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
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      await waitFor(
        () => {
          expect(canvas.getByText("Basic Scatter Plot")).toBeInTheDocument();
        },
        { timeout: 15000 },
      );
    });

    await step("Points are drawn", async () => {
      expect(pointMarks(canvasElement).length).toBeGreaterThan(0);
    });

    await step("Marks do not outnumber the rows", async () => {
      expect(pointMarks(canvasElement).length).toBeLessThanOrEqual(args.data.length);
    });

    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("X Axis")).toBeInTheDocument();
      expect(canvas.getByText("Y Axis")).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1149" },
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
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      await waitFor(() => {
        expect(canvas.getByText("Data-Driven Color / Shape / Size")).toBeInTheDocument();
      });
    });

    await step("Points are drawn", async () => {
      expect(pointMarks(canvasElement).length).toBeGreaterThan(0);
    });

    await step("Marks do not outnumber the rows", async () => {
      expect(pointMarks(canvasElement).length).toBeLessThanOrEqual(args.data.length);
    });

    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("X Axis")).toBeInTheDocument();
      expect(canvas.getByText("Y Axis")).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1150" },
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
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      await waitFor(() => {
        expect(canvas.getByText("Static Styling")).toBeInTheDocument();
      });
    });

    await step("Points are drawn", async () => {
      expect(pointMarks(canvasElement).length).toBeGreaterThan(0);
    });

    await step("Marks do not outnumber the rows", async () => {
      expect(pointMarks(canvasElement).length).toBeLessThanOrEqual(args.data.length);
    });

    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("X Axis")).toBeInTheDocument();
      expect(canvas.getByText("Y Axis")).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1151" },
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
        <ScatterPlotInteractive {...args} selectedIds={selectedIds} onSelectionChange={setSelectedIds} />
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
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      await waitFor(() => {
        expect(canvas.getByText("Click / Box / Lasso Selection")).toBeInTheDocument();
      });
    });

    await step("Points are drawn", async () => {
      expect(pointMarks(canvasElement).length).toBeGreaterThan(0);
    });

    await step("Marks do not outnumber the rows", async () => {
      expect(pointMarks(canvasElement).length).toBeLessThanOrEqual(args.data.length);
    });

    await step("Selection count is displayed", async () => {
      expect(canvas.getByText(/Selected:\s*0\s+point\(s\)/)).toBeInTheDocument();
    });

    await step("Clicking a point selects it", async () => {
      await clickPoint(canvasElement, pointMarks(canvasElement)[0]);
      await waitFor(() => {
        expect(canvas.getByText("Selected: 1 point(s)")).toBeInTheDocument();
      });
    });

    await step("A lasso over the lower-left cluster selects its 50 points", async () => {
      await lassoAround(canvasElement, lowerLeftQuarter(canvasElement));
      await waitFor(() => {
        expect(canvas.getByText("Selected: 50 point(s)")).toBeInTheDocument();
      });
    });

    // Leave the pointer off the plot so the hover card from the clicks above closes.
    await step("Pointer leaves the plot and the hover card closes", async () => {
      fireEvent.pointerOut(pointerLayer(canvasElement));
      await waitFor(() => {
        // The card is titled with the record's key, which the clicks above hovered.
        expect(canvas.queryByText("point-0")).not.toBeInTheDocument();
      });
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1152" },
  },
};

/**
 * Keyboard modifiers apply to click selection only.
 * Click = replace, Shift+Click = add, Ctrl/Cmd+Click = remove,
 * Shift+Ctrl/Cmd+Click = toggle. Box/lasso selection always replaces.
 * The active mode is shown below.
 */
export const KeyboardModifierSelection: Story = {
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [lastMode, setLastMode] = useState<SelectionMode>("replace");

    return (
      <div>
        <ScatterPlotInteractive
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
            Click: replace · Shift+Click: add · Ctrl+Click (Win) / Cmd+Click (Mac): remove · Shift+Ctrl+Click (Win) /
            Shift+Cmd+Click (Mac): toggle · Box/Lasso: always replace
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
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      await waitFor(() => {
        expect(canvas.getByText("Keyboard Modifier Selection")).toBeInTheDocument();
      });
    });

    await step("Points are drawn", async () => {
      expect(pointMarks(canvasElement).length).toBeGreaterThan(0);
    });

    await step("Marks do not outnumber the rows", async () => {
      expect(pointMarks(canvasElement).length).toBeLessThanOrEqual(args.data.length);
    });

    await step("Selection status and mode are displayed", async () => {
      expect(canvas.getByText(/Selected:\s*0/)).toBeInTheDocument();
      expect(canvas.getByText("replace", { selector: "strong" })).toBeInTheDocument();
    });

    await step("A plain click replaces the selection with the clicked point", async () => {
      await clickPoint(canvasElement, pointMarks(canvasElement)[0]);
      await waitFor(() => {
        expect(canvas.getByText(/Selected:\s*1\s*\|/)).toBeInTheDocument();
        expect(canvas.getByText("replace", { selector: "strong" })).toBeInTheDocument();
      });
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1154" },
  },
};

/** Select points and a data grid to the right updates in real time. */
export const SelectionWithDataGrid: Story = {
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const selected = args.data.filter((p) => selectedIds.has(p.id));

    return (
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <ScatterPlotInteractive {...args} selectedIds={selectedIds} onSelectionChange={setSelectedIds} />

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
            <p className="text-muted-foreground">Select points to populate the grid.</p>
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
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      await waitFor(() => {
        expect(canvas.getByText("Selection → Data Grid")).toBeInTheDocument();
      });
    });

    await step("Points are drawn", async () => {
      expect(pointMarks(canvasElement).length).toBeGreaterThan(0);
    });

    await step("Marks do not outnumber the rows", async () => {
      expect(pointMarks(canvasElement).length).toBeLessThanOrEqual(args.data.length);
    });

    await step("Data grid heading is displayed", async () => {
      expect(canvas.getByText("Selected Points (0)")).toBeInTheDocument();
    });

    await step("Clicking a point adds it to the data grid", async () => {
      await clickPoint(canvasElement, pointMarks(canvasElement)[0]);
      await waitFor(() => {
        expect(canvas.getByText("Selected Points (1)")).toBeInTheDocument();
      });
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1156" },
  },
};

/**
 * The hover card lists the metadata fields named in `tooltip.fields`. ts-lib-viz does not draw
 * Plotly-era `tooltip.content` HTML, so this story names the fields it shows.
 */
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
    tooltip: { fields: ["category", "status"] },
    ...DEFAULT_DIMS,
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      await waitFor(() => {
        expect(canvas.getByText("Custom Rich Tooltips")).toBeInTheDocument();
      });
    });

    await step("Points are drawn", async () => {
      expect(pointMarks(canvasElement).length).toBeGreaterThan(0);
    });

    await step("Marks do not outnumber the rows", async () => {
      expect(pointMarks(canvasElement).length).toBeLessThanOrEqual(args.data.length);
    });

    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("X Axis")).toBeInTheDocument();
      expect(canvas.getByText("Y Axis")).toBeInTheDocument();
    });

    await step("Hovering a point lists its configured fields", async () => {
      fireEvent.pointerMove(pointerLayer(canvasElement), centerOf(pointMarks(canvasElement)[0]));
      await waitFor(() => {
        expect(within(canvasElement).getByText(String(args.data[0].metadata?.status))).toBeInTheDocument();
      });
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1157" },
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
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      await waitFor(() => {
        expect(canvas.getByText("Fixed Axis Ranges (zoomed to 20-80)")).toBeInTheDocument();
      });
    });

    await step("Points are drawn", async () => {
      expect(pointMarks(canvasElement).length).toBeGreaterThan(0);
    });

    await step("Marks do not outnumber the rows", async () => {
      expect(pointMarks(canvasElement).length).toBeLessThanOrEqual(args.data.length);
    });

    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("X Axis")).toBeInTheDocument();
      expect(canvas.getByText("Y Axis")).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1158" },
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
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      await waitFor(() => {
        expect(canvas.getByText("Log-Scale Axes")).toBeInTheDocument();
      });
    });

    await step("Points are drawn", async () => {
      expect(pointMarks(canvasElement).length).toBeGreaterThan(0);
    });

    await step("Marks do not outnumber the rows", async () => {
      expect(pointMarks(canvasElement).length).toBeLessThanOrEqual(args.data.length);
    });

    await step("Log axis titles are displayed", async () => {
      expect(canvas.getByText("X (log)")).toBeInTheDocument();
      expect(canvas.getByText("Y (log)")).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1159" },
  },
};

/**
 * 10k points downsampled to 1k via LTTB to keep the chart responsive.
 *
 * You can upload your own data file to test downsampling:
 * - **CSV** — must have `x` and `y` columns. Optional: `id`, `label`. Any extra columns become `metadata`.
 *   ```
 *   id,x,y,label,category,value
 *   p-0,2.3,4.1,Alpha,Group A,120.5
 *   ```
 * - **JSON** — array of objects with at least `x` and `y` fields.
 *   ```
 *   [{ "id": "p-0", "x": 2.3, "y": 4.1, "label": "Alpha", "category": "Group A" }]
 *   ```
 */
export const Downsampling: Story = {
  render: (args) => {
    const [data, setData] = useState<ScatterPoint[]>([]);
    const [source, setSource] = useState<"generated" | string>("generated");
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      const handle = requestAnimationFrame(() => {
        setData(scatterData(LARGE_DATA_COUNT));
      });
      return () => cancelAnimationFrame(handle);
    }, []);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setError(null);

      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const text = ev.target?.result as string;
          const points = file.name.endsWith(".json") ? parseJsonToPoints(text) : parseCsvToPoints(text);
          if (points.length === 0) {
            setError("No valid points found. CSV needs x,y columns; JSON needs [{x, y}, …].");
            return;
          }
          setData(points);
          setSource(file.name);
        } catch {
          setError("Failed to parse file. Check that it is valid CSV or JSON.");
        }
      };
      reader.readAsText(file);
    };

    const resetToGenerated = () => {
      setData(scatterData(LARGE_DATA_COUNT));
      setSource("generated");
      setError(null);
      if (fileRef.current) fileRef.current.value = "";
    };

    if (data.length === 0) {
      return (
        <div style={{ width: args.width, height: args.height, display: "grid", placeItems: "center", color: "#888" }}>
          Generating {LARGE_DATA_COUNT.toLocaleString()} points…
        </div>
      );
    }

    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, fontSize: 13 }}>
          <Button variant="secondary" size="small" onClick={() => fileRef.current?.click()}>
            Upload CSV / JSON
          </Button>
          <input ref={fileRef} type="file" accept=".csv,.json" onChange={handleFile} style={{ display: "none" }} />
          {source !== "generated" && (
            <Button variant="tertiary" size="small" onClick={resetToGenerated}>
              Reset to random data
            </Button>
          )}
          <span style={{ color: "#666" }}>
            {source === "generated"
              ? `${data.length.toLocaleString()} random points`
              : `${data.length.toLocaleString()} points from ${source}`}
          </span>
          {error && <span style={{ color: "#d73027" }}>{error}</span>}
        </div>
        <ScatterPlotInteractive {...args} data={data} />
      </div>
    );
  },
  args: {
    data: [],
    title: "Downsampling (10k → 1k via LTTB)",
    xAxis: { title: "X Axis" },
    yAxis: { title: "Y Axis" },
    downsampling: { enabled: true, maxPoints: 1000, strategy: "lttb" },
    ...DEFAULT_DIMS,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      expect(await canvas.findByText("Downsampling (10k → 1k via LTTB)", {}, { timeout: 15000 })).toBeInTheDocument();
    });

    // The generated 10k rows arrive after the first frame, then LTTB keeps 1k of them.
    await step("Chart draws the 1k points LTTB keeps", async () => {
      await waitFor(
        () => {
          expect(pointMarks(canvasElement).length).toBe(1000);
        },
        { timeout: 15000 },
      );
    });

    await step("Upload control is displayed", async () => {
      expect(canvas.getByRole("button", { name: /upload csv \/ json/i })).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1161" },
    docs: {
      source: {
        code: `
function scatterData(count: number): ScatterPoint[] {
  return Array.from({ length: count }, (_, i) => ({
    id: \`point-\${i}\`,
    x: rand() * 100,
    y: rand() * 100,
    label: \`Point \${i}\`,
    metadata: {
      category: CATEGORIES[\${i} % 3],
      status: STATUSES[\${i} % 3],
      value: rand() * 1000,
      intensity: rand() * 10,
      concentration: Number((\${rand()} * 100).toFixed(2)),
    },
  }));
}

const [data, setData] = useState<ScatterPoint[]>([]);

useEffect(() => {
  const handle = requestAnimationFrame(() => {
    setData(scatterData(10_000));
  });
  return () => cancelAnimationFrame(handle);
}, []);

return (
  <ScatterPlotInteractive
    data={data}
    title="Downsampling (10k → 1k via LTTB)"
    xAxis={{ title: "X Axis" }}
    yAxis={{ title: "Y Axis" }}
    downsampling={{ enabled: true, maxPoints: 1000, strategy: "lttb" }}
    width={800}
    height={600}
  />
);`.trim(),
        language: "tsx",
      },
    },
  },
};

/**
 * Continuous color mapping: point color encodes a numeric field via the
 * CVD-friendly diverging colorscale, with a colorbar legend.
 */
export const ContinuousColorMapping: Story = {
  args: {
    data: BASIC_DATA,
    title: "Continuous Color Mapping",
    xAxis: { title: "X Axis" },
    yAxis: { title: "Y Axis" },
    colorMapping: { type: "continuous", field: "value" },
    ...DEFAULT_DIMS,
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step("Every row is drawn as a point", async () => {
      await waitFor(() => {
        expect(pointMarks(canvasElement).length).toBe(args.data.length);
      });
    });

    await step("Marks take colors from the ramp, not one color", async () => {
      const fills = new Set([...pointMarks(canvasElement)].map((mark) => mark.getAttribute("fill")));
      expect(fills.size).toBeGreaterThan(1);
    });

    await step("Color legend is titled with the field name and draws a ramp", async () => {
      expect(canvas.getByText("value")).toBeInTheDocument();
      expect(canvasElement.querySelector("linearGradient")).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5412" },
  },
};

const EVENT_DATA: ScatterPoint[] = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1, // numeric IDs exercise the original-ID restoration path
  x: (i + 1) * 10,
  y: (i + 1) * 10,
  label: `Point ${i + 1}`,
  metadata: { category: CATEGORIES[i % 3] },
}));

/**
 * Drives the pointer the way a reader does: a click on a point, a lasso around
 * two points, then a click on empty plot area. Each step checks the selection
 * the chart reports back.
 */
export const SelectionEvents: Story = {
  render: function Render(args) {
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [lastMode, setLastMode] = useState<SelectionMode | "none">("none");
    return (
      <div>
        <ScatterPlotInteractive
          {...args}
          onSelectionChange={(ids, mode) => {
            setSelectedIds(ids);
            setLastMode(mode);
          }}
        />
        <p style={{ fontFamily: "monospace", marginTop: 12 }}>
          Selected: {selectedIds.size} | Mode: {lastMode} | Ids: {[...selectedIds].join(",")}
        </p>
      </div>
    );
  },
  args: {
    data: EVENT_DATA,
    title: "Selection Events",
    enableClickSelection: true,
    enableBoxSelection: true,
    enableLassoSelection: true,
    ...DEFAULT_DIMS,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Clicking a point replaces the selection", async () => {
      await clickPoint(canvasElement, pointMarks(canvasElement)[1]);
      await waitFor(() => {
        expect(canvas.getByText("Selected: 1 | Mode: replace | Ids: 2")).toBeInTheDocument();
      });
    });

    await step("A click on empty plot area clears the selection", async () => {
      const box = pointerLayer(canvasElement).getBoundingClientRect();
      const at = { clientX: box.left + 4, clientY: box.top + 4, pointerId: 1, button: 0 };
      const target =
        canvasElement.ownerDocument.elementFromPoint(at.clientX, at.clientY) ?? pointerLayer(canvasElement);
      fireEvent.pointerOut(target, at);
      await settle();
      fireEvent.click(target, at);
      await waitFor(() => {
        expect(canvas.getByText(/Selected: 0 \| Mode: replace/)).toBeInTheDocument();
      });
    });

    await step("A lasso around two points replaces it with both", async () => {
      const [, , third, fourth] = [...pointMarks(canvasElement)];
      await lassoAround(canvasElement, boxAround([third, fourth]));
      await waitFor(() => {
        expect(canvas.getByText("Selected: 2 | Mode: replace | Ids: 3,4")).toBeInTheDocument();
      });
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5413" },
  },
};

/**
 * The hover card follows the design tokens in light and dark mode and lists the
 * columns named in `tooltip.fields`. It replaces Plotly's hover labels.
 */
export const ThemedTooltip: Story = {
  args: {
    data: EVENT_DATA,
    title: "Themed Tooltip",
    tooltip: { enabled: true, fields: ["category"] },
    ...DEFAULT_DIMS,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Hovering a point shows the configured field in the card", async () => {
      fireEvent.pointerMove(pointerLayer(canvasElement), centerOf(pointMarks(canvasElement)[0]));
      await waitFor(() => {
        expect(canvas.getByText("Group A")).toBeInTheDocument();
      });
    });

    await step("Fields that are not configured stay out of the card", async () => {
      expect(canvas.queryByText("Point 1")).not.toBeInTheDocument();
    });

    await step("Moving off the point hides the card", async () => {
      fireEvent.pointerOut(pointerLayer(canvasElement));
      await waitFor(() => {
        expect(canvas.queryByText("Group A")).not.toBeInTheDocument();
      });
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5414" },
  },
};
