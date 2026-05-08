import * as React from "react";
import { act } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { PlateMapEditor } from "../PlateMapEditor";
import { PlatePaintGrid } from "../PlatePaintGrid";
import { TemplateIOPanel } from "../TemplateIOPanel";
import { WellManifestTable } from "../WellManifestTable";
import { WellMetadataForm } from "../WellMetadataForm";

import type { WellColumn, WellField, WellId, WellRecord } from "../types";

interface SimpleWell extends WellRecord {
  role?: "sample" | "control" | "blank";
  sampleId?: string;
  amount?: number | string;
  custom?: string;
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

function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function findButton(container: HTMLElement, label: string) {
  return [...container.querySelectorAll("button")].find((b) => b.textContent?.trim() === label) as
    | HTMLButtonElement
    | undefined;
}

function setFileInput(input: HTMLInputElement, file: File) {
  Object.defineProperty(input, "files", {
    configurable: true,
    value: [file],
  });
  input.dispatchEvent(new Event("change", { bubbles: true }));
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
    vi.restoreAllMocks();
  });

  function render() {
    act(() => {
      root.render(<Harness handle={handle} />);
    });
  }

  function renderElement(element: React.ReactElement) {
    act(() => {
      root.render(element);
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
      setInputValue(sampleInput!, "S-1");
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

  it("shows hover metadata and optional legend content", () => {
    const values = new Map<WellId, SimpleWell>([["A01", { role: "sample", sampleId: "S-1" }]]);
    const selection = new Set<WellId>();

    renderElement(
      <PlateMapEditor<SimpleWell>
        format="96"
        values={values}
        onChange={() => {}}
        selection={selection}
        onSelectionChange={() => {}}
        fields={FIELDS}
        tableColumns={COLUMNS}
        colorForWell={colorForWell}
        emptyEntry={emptyEntry}
        title="Hover test"
        legend={<div>Role color legend</div>}
      />,
    );

    const plate = container.querySelector('svg[aria-label="8 row by 12 column plate map. Drag to select wells."]');
    expect(plate).not.toBeNull();

    act(() => {
      plate!.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientX: 30, clientY: 30 }));
    });

    expect(container.textContent).toContain("A01 • Sample • S-1");
    expect(container.textContent).toContain("Role color legend");
  });

  it("handles template panel imports, exports, and clearing", () => {
    const onTemplateChange = vi.fn();
    const onClearTemplate = vi.fn();
    const onImportCsv = vi.fn();
    const onExportCsv = vi.fn();
    const onImportTemplate = vi.fn();
    const onExportTemplate = vi.fn();
    const inputClick = vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => {});

    renderElement(
      <TemplateIOPanel
        templates={[
          { id: "standard", group: "Built-in", label: "Standard plate" },
          { id: "custom", label: "Custom layout" },
        ]}
        templateId="standard"
        onTemplateChange={onTemplateChange}
        onClearTemplate={onClearTemplate}
        hasEntries
        onImportCsv={onImportCsv}
        onExportCsv={onExportCsv}
        onImportTemplate={onImportTemplate}
        onExportTemplate={onExportTemplate}
        csvAccept=".csv"
        templateAccept=".json"
        className="test-template-panel"
      />,
    );

    expect(container.querySelector("[data-slot='template-io-panel']")?.className).toContain("test-template-panel");
    expect(container.textContent).toContain("Template & import / export");
    expect(container.textContent).toContain("Template");
    expect(container.textContent).toContain("Plate map");

    act(() => {
      findButton(container, "Clear template")?.click();
      findButton(container, "Export template (JSON)")?.click();
      findButton(container, "Export plate map (CSV)")?.click();
    });

    expect(onClearTemplate).toHaveBeenCalledTimes(1);
    expect(onExportTemplate).toHaveBeenCalledTimes(1);
    expect(onExportCsv).toHaveBeenCalledTimes(1);

    act(() => {
      findButton(container, "Import template (JSON)")?.click();
      findButton(container, "Import plate map (CSV)")?.click();
    });

    expect(inputClick).toHaveBeenCalledTimes(2);

    const templateInput = container.querySelector('input[accept=".json"]') as HTMLInputElement;
    const csvInput = container.querySelector('input[accept=".csv"]') as HTMLInputElement;

    act(() => {
      setFileInput(templateInput, new File(["{}"], "template.json", { type: "application/json" }));
      setFileInput(csvInput, new File(["well,sample"], "plate.csv", { type: "text/csv" }));
    });

    expect(onImportTemplate).toHaveBeenCalledWith(expect.objectContaining({ name: "template.json" }));
    expect(onImportCsv).toHaveBeenCalledWith(expect.objectContaining({ name: "plate.csv" }));
  });

  it("renders disabled template panel actions when no entries exist", () => {
    renderElement(
      <TemplateIOPanel
        templates={[{ id: "standard", label: "Standard plate" }]}
        onTemplateChange={() => {}}
        onClearTemplate={() => {}}
        hasEntries={false}
        onExportCsv={() => {}}
        onExportTemplate={() => {}}
      />,
    );

    expect(findButton(container, "Clear template")?.disabled).toBe(true);
    expect(findButton(container, "Export template (JSON)")?.disabled).toBe(true);
    expect(findButton(container, "Export plate map (CSV)")?.disabled).toBe(true);
  });

  it("handles metadata form text, number, custom, apply, and clear paths", () => {
    const onChange = vi.fn();
    const onApply = vi.fn();
    const onClear = vi.fn();
    const richFields: WellField<SimpleWell>[] = [
      FIELDS[0],
      { key: "amount", label: "Amount", kind: "number", placeholder: "0" },
      { key: "sampleId", label: "Sample ID", kind: "text" },
      {
        key: "custom",
        label: "Custom",
        kind: "custom",
        render: ({ value, onChange: setCustom, selectionSize }) => (
          <button type="button" onClick={() => setCustom(`${selectionSize}:${value ?? "empty"}`)}>
            Set custom
          </button>
        ),
      },
    ];

    renderElement(
      <WellMetadataForm<SimpleWell>
        fields={richFields}
        value={{ role: "sample", amount: 2, sampleId: "S-1" }}
        onChange={onChange}
        selectionSize={1}
        onApply={onApply}
        onClear={onClear}
        applyLabel="Apply metadata"
        clearLabel="Clear metadata"
        extras={<span>Extra controls</span>}
      />,
    );

    expect(container.textContent).toContain("Apply to 1 well");
    expect(container.textContent).toContain("Extra controls");

    const amountInput = container.querySelector('input[type="number"]') as HTMLInputElement;
    const sampleInput = container.querySelector('input[id="field-sampleId"]') as HTMLInputElement;

    act(() => {
      setInputValue(amountInput, "3.5");
    });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ amount: 3.5 }));

    act(() => {
      setInputValue(amountInput, "");
    });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ amount: undefined }));

    act(() => {
      setInputValue(sampleInput, "S-2");
    });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ sampleId: "S-2" }));

    act(() => {
      findButton(container, "Set custom")?.click();
      findButton(container, "Apply metadata")?.click();
      findButton(container, "Clear metadata")?.click();
    });

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ custom: "1:empty" }));
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("edits manifest rows, custom cells, and row selection", () => {
    const onChange = vi.fn();
    const onSelectionChange = vi.fn();
    const values = new Map<WellId, SimpleWell>([
      ["A01", { role: "sample", amount: 1, sampleId: "S-1" }],
      ["A02", {}],
    ]);

    renderElement(
      <WellManifestTable<SimpleWell>
        values={values}
        onChange={onChange}
        columns={[
          { header: "Role", field: "role", minWidth: 120 },
          { header: "Amount", field: "amount" },
          { header: "Sample ID", field: "sampleId" },
          {
            header: "Custom",
            render: ({ wellId, update }) => (
              <button type="button" onClick={() => update({ sampleId: `custom-${wellId}` })}>
                Custom {wellId}
              </button>
            ),
          },
          { header: "Static" },
        ]}
        fields={[
          FIELDS[0],
          { key: "amount", label: "Amount", kind: "number" },
          { key: "sampleId", label: "Sample ID", kind: "text" },
        ]}
        selection={new Set(["A01", "A03"])}
        onSelectionChange={onSelectionChange}
        emptyEntry={emptyEntry}
        pageSize={10}
      />,
    );

    expect(container.textContent).toContain("3 rows · 2 selected");
    expect(container.textContent).toContain("A03");

    const amountInput = container.querySelector('input[type="number"]') as HTMLInputElement;
    act(() => {
      setInputValue(amountInput, "7");
    });
    let next = onChange.mock.calls.at(-1)?.[0] as Map<WellId, SimpleWell>;
    expect(next.get("A01")).toEqual({ role: "sample", amount: 7, sampleId: "S-1" });

    act(() => {
      findButton(container, "Custom A01")?.click();
    });
    next = onChange.mock.calls.at(-1)?.[0] as Map<WellId, SimpleWell>;
    expect(next.get("A01")).toEqual({ role: "sample", amount: 1, sampleId: "custom-A01" });

    const checkbox = container.querySelector('[aria-label="Select A01"]') as HTMLElement;
    act(() => {
      checkbox.click();
    });
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["A03"]));
  });

  it("fills visible manifest cells downward when no row selection is active", () => {
    const onChange = vi.fn();
    const values = new Map<WellId, SimpleWell>([
      ["A01", { sampleId: "S-1" }],
      ["A02", {}],
      ["A03", {}],
    ]);

    renderElement(
      <WellManifestTable<SimpleWell>
        values={values}
        onChange={onChange}
        columns={[{ header: "Sample ID", field: "sampleId" }]}
        fields={[{ key: "sampleId", label: "Sample ID", kind: "text" }]}
        emptyEntry={emptyEntry}
        pageSize={10}
      />,
    );

    const fillDown = container.querySelector('button[aria-label="Fill down Sample ID"]') as HTMLButtonElement;
    expect(fillDown.disabled).toBe(false);

    act(() => {
      fillDown.click();
    });

    const next = onChange.mock.calls.at(-1)?.[0] as Map<WellId, SimpleWell>;
    expect(next.get("A02")?.sampleId).toBe("S-1");
    expect(next.get("A03")?.sampleId).toBe("S-1");
  });

  it("handles manifest filtering, empty state, paging, and disabled fill down", () => {
    const values = new Map<WellId, SimpleWell>([
      ["A01", { sampleId: "S-1" }],
      ["A02", {}],
    ]);

    renderElement(
      <WellManifestTable<SimpleWell>
        values={values}
        onChange={() => {}}
        columns={[{ header: "Sample ID", field: "sampleId" }]}
        fields={[{ key: "sampleId", label: "Sample ID", kind: "text" }]}
        emptyEntry={emptyEntry}
        isPopulated={(row) => !!row.sampleId}
        pageSize={1}
        pageSizeOptions={[1, 2]}
        enableFillDown={false}
      />,
    );

    expect(container.textContent).toContain("1 rows · 0 selected");
    expect(container.textContent).toContain("1–1 of 1");
    expect(container.querySelector('button[aria-label="Fill down Sample ID"]')).toBeNull();

    act(() => {
      findButton(container, "Show all wells")?.click();
    });
    expect(container.textContent).toContain("2 rows · 0 selected");

    act(() => {
      findButton(container, "Next")?.click();
    });
    expect(container.textContent).toContain("2–2 of 2");

    act(() => {
      findButton(container, "Prev")?.click();
      findButton(container, "Hide empty wells")?.click();
    });
    expect(container.textContent).toContain("1–1 of 1");

    renderElement(
      <WellManifestTable<SimpleWell>
        values={new Map()}
        onChange={() => {}}
        columns={[{ header: "Sample ID", field: "sampleId" }]}
        emptyEntry={emptyEntry}
      />,
    );

    expect(container.textContent).toContain("No rows. Paint wells on the plate.");
    expect(container.textContent).toContain("0 of 0");
  });

  it("supports additive and subtractive plate drag selections", () => {
    const onSelectionChange = vi.fn();
    const onWellHover = vi.fn();
    const values = new Map<WellId, SimpleWell>([["B02", { role: "sample" }]]);

    const renderGrid = (selection: Set<WellId>) =>
      renderElement(
        <PlatePaintGrid<SimpleWell>
          format="96"
          values={values}
          selection={selection}
          onSelectionChange={onSelectionChange}
          colorForWell={colorForWell}
          cellSize={34}
          onWellHover={onWellHover}
        />,
      );

    renderGrid(new Set(["A01"]));
    const plate = container.querySelector('svg[aria-label="8 row by 12 column plate map. Drag to select wells."]');
    expect(plate).not.toBeNull();

    act(() => {
      plate!.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, shiftKey: true, clientX: 77, clientY: 77 }));
    });
    act(() => {
      plate!.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, shiftKey: true, clientX: 111, clientY: 77 }));
    });
    act(() => {
      plate!.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, shiftKey: true, clientX: 111, clientY: 77 }));
    });

    expect(onWellHover).toHaveBeenCalledWith("B03");
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(["A01", "B02", "B03"]));

    renderGrid(new Set(["A01", "B02", "B03"]));
    const rerenderedPlate = container.querySelector(
      'svg[aria-label="8 row by 12 column plate map. Drag to select wells."]',
    );

    act(() => {
      rerenderedPlate!.dispatchEvent(
        new MouseEvent("mousedown", { bubbles: true, altKey: true, clientX: 77, clientY: 77 }),
      );
    });
    act(() => {
      rerenderedPlate!.dispatchEvent(
        new MouseEvent("mousemove", { bubbles: true, altKey: true, clientX: 111, clientY: 77 }),
      );
    });
    act(() => {
      rerenderedPlate!.dispatchEvent(new MouseEvent("mouseout", { bubbles: true, relatedTarget: document.body }));
    });

    expect(onWellHover).toHaveBeenLastCalledWith(null);
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(["A01"]));
  });
});
