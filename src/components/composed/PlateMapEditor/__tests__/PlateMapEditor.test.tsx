import * as React from "react";
import { act } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { PlateMapEditor } from "../PlateMapEditor";

import type { WellColumn, WellField, WellId, WellRecord } from "../types";

interface SimpleWell extends WellRecord {
  role?: "sample" | "control";
  sampleId?: string;
}

const FIELDS: WellField<SimpleWell>[] = [
  {
    key: "role",
    label: "Role",
    kind: "select",
    options: [
      { value: "sample", label: "Sample" },
      { value: "control", label: "Control" },
    ],
  },
  { key: "sampleId", label: "Sample ID", kind: "text" },
];

const COLUMNS: WellColumn<SimpleWell>[] = [
  { header: "Role", field: "role" },
  { header: "Sample ID", field: "sampleId" },
];

function colorForWell(): string {
  return "#fafafa";
}
function emptyEntry(): SimpleWell {
  return {};
}

interface HarnessHandle {
  current: {
    values: Map<WellId, SimpleWell>;
    selection: Set<WellId>;
    setSelection: (s: Set<WellId>) => void;
    setValues: (m: Map<WellId, SimpleWell>) => void;
  };
}

function Harness({ handle }: { handle: HarnessHandle }) {
  const [values, setValues] = React.useState<Map<WellId, SimpleWell>>(new Map());
  const [selection, setSelection] = React.useState<Set<WellId>>(new Set());
  handle.current = { values, selection, setSelection, setValues };
  return (
    <PlateMapEditor<SimpleWell>
      format="96"
      values={values}
      onChange={setValues}
      selection={selection}
      onSelectionChange={setSelection}
      fields={FIELDS}
      tableColumns={COLUMNS}
      colorForWell={colorForWell}
      emptyEntry={emptyEntry}
      title="Test plate"
      onImportCsv={() => {}}
      onExportCsv={() => {}}
    />
  );
}

describe("PlateMapEditor", () => {
  let container: HTMLDivElement;
  let root: Root;
  let handle: HarnessHandle;

  beforeAll(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    handle = { current: null! };
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  function render() {
    flushSync(() => {
      root.render(<Harness handle={handle} />);
    });
  }

  it("renders header, plate, manifest and template panel", () => {
    render();
    expect(container.textContent).toContain("Test plate");
    expect(container.textContent).toContain("Plate");
    expect(container.textContent).toContain("Sample manifest");
    expect(container.textContent).toContain("Actions");
    const wells = container.querySelectorAll("[data-well]");
    expect(wells.length).toBe(96);
  });

  it("applies staged form fields onto the selection", () => {
    render();
    act(() => {
      handle.current.setSelection(new Set(["A01", "A02"]));
    });
    flushSync(() => {});

    const sampleInput = container.querySelector('input[id="field-sampleId"]') as HTMLInputElement | null;
    expect(sampleInput).not.toBeNull();

    act(() => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      setter?.call(sampleInput, "S-1");
      sampleInput!.dispatchEvent(new Event("input", { bubbles: true }));
    });

    const applyBtn = [...container.querySelectorAll("button")].find(
      (b) => b.textContent?.trim() === "Apply",
    ) as HTMLButtonElement;
    expect(applyBtn).toBeDefined();
    expect(applyBtn.disabled).toBe(false);

    act(() => {
      applyBtn.click();
    });

    expect(handle.current.values.get("A01")?.sampleId).toBe("S-1");
    expect(handle.current.values.get("A02")?.sampleId).toBe("S-1");
  });

  it("clear wells removes selected entries", () => {
    render();
    act(() => {
      const m = new Map<WellId, SimpleWell>();
      m.set("A01", { sampleId: "S-1" });
      m.set("A02", { sampleId: "S-2" });
      handle.current.setValues(m);
      handle.current.setSelection(new Set(["A01"]));
    });
    flushSync(() => {});

    const clearBtn = [...container.querySelectorAll("button")].find(
      (b) => b.textContent?.trim() === "Clear wells",
    ) as HTMLButtonElement;
    act(() => {
      clearBtn.click();
    });

    expect(handle.current.values.has("A01")).toBe(false);
    expect(handle.current.values.get("A02")?.sampleId).toBe("S-2");
  });

  it("fills a table column down across selected rows", () => {
    render();
    act(() => {
      const m = new Map<WellId, SimpleWell>();
      m.set("A01", { role: "sample" });
      handle.current.setValues(m);
      handle.current.setSelection(new Set(["A01", "A02", "A03"]));
    });
    flushSync(() => {});

    const fillDownRole = [...container.querySelectorAll("button")].find(
      (b) => b.getAttribute("aria-label") === "Fill down Role",
    ) as HTMLButtonElement;
    expect(fillDownRole).toBeDefined();
    expect(fillDownRole.disabled).toBe(false);

    act(() => {
      fillDownRole.click();
    });

    expect(handle.current.values.get("A02")?.role).toBe("sample");
    expect(handle.current.values.get("A03")?.role).toBe("sample");
  });

  it("select all and deselect all toggle the entire selection", () => {
    render();
    const selectAll = [...container.querySelectorAll("button")].find(
      (b) => b.textContent?.trim() === "Select all",
    ) as HTMLButtonElement;
    act(() => {
      selectAll.click();
    });
    expect(handle.current.selection.size).toBe(96);

    const deselect = [...container.querySelectorAll("button")].find(
      (b) => b.textContent?.trim() === "Deselect all",
    ) as HTMLButtonElement;
    act(() => {
      deselect.click();
    });
    expect(handle.current.selection.size).toBe(0);
  });
});
