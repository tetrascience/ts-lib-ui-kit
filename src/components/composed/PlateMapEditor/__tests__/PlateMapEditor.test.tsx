import * as React from "react";
import { act } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { PlateMapEditor } from "../PlateMapEditor";

import type { WellColumn, WellField, WellId, WellRecord } from "../types";

interface SimpleWell extends WellRecord {
  role?: "sample" | "control" | "blank";
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
      { value: "blank", label: "Blank" },
    ],
  },
  { key: "sampleId", label: "Sample ID", kind: "text" },
];

const COLUMNS: WellColumn<SimpleWell>[] = [
  { header: "Role", field: "role" },
  { header: "Sample ID", field: "sampleId" },
];

const ROLE_COLOR: Record<NonNullable<SimpleWell["role"]>, string> = {
  sample: "#bbdefb",
  control: "#ffcdd2",
  blank: "#eeeeee",
};

function colorForWell(well: SimpleWell | undefined): string {
  return well?.role ? ROLE_COLOR[well.role] : "#fafafa";
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
      cycleFieldOnWellDoubleClick="role"
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
    act(() => {
      root.render(<Harness handle={handle} />);
    });
  }

  it("renders header, plate, manifest and template panel", () => {
    render();
    expect(container.textContent).toContain("Test plate");
    expect(container.textContent).toContain("Plate");
    expect(container.textContent).toContain("Sample manifest");
    expect(container.textContent).toContain("Actions");
    const selectionHeader = container.querySelector("thead th");
    expect(selectionHeader?.textContent).toContain("Selected");
    expect(selectionHeader?.querySelector("svg")).not.toBeNull();
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

  it("selects on single click and cycles the configured field on double click", () => {
    render();
    const plate = container.querySelector('svg[aria-label="8 row by 12 column plate map. Drag to select wells."]');
    expect(plate).not.toBeNull();

    const clickA01 = () => {
      act(() => {
        plate!.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, clientX: 30, clientY: 30 }));
      });
      flushSync(() => {});
      act(() => {
        plate!.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, clientX: 30, clientY: 30 }));
      });
    };

    clickA01();
    expect(handle.current.values.get("A01")?.role).toBeUndefined();
    expect(handle.current.selection).toEqual(new Set(["A01"]));

    const doubleClickA01 = () => {
      clickA01();
      clickA01();
      act(() => {
        plate!.dispatchEvent(new MouseEvent("dblclick", { bubbles: true, clientX: 30, clientY: 30 }));
      });
    };

    doubleClickA01();
    expect(handle.current.values.get("A01")?.role).toBe("sample");
    expect(container.querySelector('[data-well="A01"]')?.getAttribute("fill")).toBe(ROLE_COLOR.sample);
    expect(container.querySelector('[data-well-flash="A01"]')).not.toBeNull();

    doubleClickA01();
    expect(handle.current.values.get("A01")?.role).toBe("control");
    expect(container.querySelector('[data-well="A01"]')?.getAttribute("fill")).toBe(ROLE_COLOR.control);

    doubleClickA01();
    expect(handle.current.values.get("A01")?.role).toBe("blank");
    expect(container.querySelector('[data-well="A01"]')?.getAttribute("fill")).toBe(ROLE_COLOR.blank);

    doubleClickA01();
    expect(handle.current.values.get("A01")?.role).toBe("sample");
  });
});
