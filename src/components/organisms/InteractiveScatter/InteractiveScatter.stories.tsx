import { Button } from "@atoms/Button";
import React, { useEffect, useRef, useState } from "react";


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
  parameters: {
    zephyr: { testCaseId: "SW-T1156" },
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
        <InteractiveScatter {...args} data={data} />
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
  <InteractiveScatter
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
