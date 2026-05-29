import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { plateOptionsFromCsvTriage, triagePlateMapCsvByBarcode } from "../csvPlateTriage";
import { PlateMapActionsMenu } from "../PlateMapActionsMenu";
import { PlateMapEditor } from "../PlateMapEditor";
import { PlateMapPlateSelector } from "../PlateMapPlateSelector";
import { PlatePaintGrid, PLATE_MAP_CELL_BORDER, PLATE_MAP_EMPTY_WELL_FILL } from "../PlatePaintGrid";
import { TemplateIOPanel } from "../TemplateIOPanel";
import { WellManifestTable } from "../WellManifestTable";
import { WellMetadataForm } from "../WellMetadataForm";

import type { WellColumn, WellField, WellId, WellRecord } from "../types";

interface SimpleWell extends WellRecord {
  plateBarcode?: string;
  role?: "sample" | "control" | "blank";
  sampleId?: string;
  amount?: number | string;
  custom?: string;
  active?: boolean;
  collectedAt?: string;
  collectedTime?: string;
  tags?: string[];
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

function findMenuItem(label: string) {
  return [...document.body.querySelectorAll('[role="menuitem"], [data-slot="dropdown-menu-item"]')].find((item) =>
    item.textContent?.includes(label),
  ) as HTMLElement | undefined;
}

function setFileInput(input: HTMLInputElement, file: File) {
  Object.defineProperty(input, "files", {
    configurable: true,
    value: [file],
  });
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

async function flushFilePick() {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
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
  let priorActEnv: boolean | undefined;

  beforeAll(() => {
    const g = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
    priorActEnv = g.IS_REACT_ACT_ENVIRONMENT;
    g.IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterAll(() => {
    const g = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
    if (priorActEnv === undefined) delete g.IS_REACT_ACT_ENVIRONMENT;
    else g.IS_REACT_ACT_ENVIRONMENT = priorActEnv;
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
    act(() => {});

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
    act(() => {});

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
    act(() => {});

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
      act(() => {});
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

  it("renders plate selector add and barcode selection states", () => {
    const onAddPlate = vi.fn();
    const onPlateChange = vi.fn();

    renderElement(<PlateMapPlateSelector onAddPlate={onAddPlate} />);

    act(() => {
      findButton(container, "Add Plate")?.click();
    });
    expect(onAddPlate).toHaveBeenCalledTimes(1);

    renderElement(
      <PlateMapPlateSelector
        plates={[
          { id: "PLATE-001", barcode: "PLATE-001", count: 2 },
          { id: "PLATE-002", barcode: "PLATE-002", count: 1 },
        ]}
        activePlateId="PLATE-002"
        onPlateChange={onPlateChange}
        onAddPlate={onAddPlate}
      />,
    );

    expect(container.textContent).toContain("PLATE-002");

    const trigger = container.querySelector('button[aria-label="Plate"]') as HTMLButtonElement;
    act(() => {
      trigger.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, button: 0 }));
    });

    const firstPlateItem = [
      ...document.body.querySelectorAll('[role="menuitem"], [data-slot="dropdown-menu-item"]'),
    ].find((item) => item.textContent?.includes("PLATE-001")) as HTMLElement | undefined;

    expect(firstPlateItem).toBeDefined();

    act(() => {
      firstPlateItem?.click();
    });

    expect(onPlateChange).toHaveBeenCalledWith("PLATE-001");
  });

  it("scopes grid and manifest rows to the active plate barcode", () => {
    const values = new Map<WellId, SimpleWell>([
      ["PLATE-001::A01", { plateBarcode: "PLATE-001", role: "sample", sampleId: "S-1" }],
      ["PLATE-002::A01", { plateBarcode: "PLATE-002", role: "control", sampleId: "S-2" }],
    ]);
    const onSelectionChange = vi.fn();

    const renderScopedEditor = (activePlateId: string, selection = new Set<WellId>()) =>
      renderElement(
        <PlateMapEditor<SimpleWell>
          format="96"
          values={values}
          onChange={() => {}}
          selection={selection}
          onSelectionChange={onSelectionChange}
          fields={FIELDS}
          tableColumns={COLUMNS}
          colorForWell={colorForWell}
          emptyEntry={emptyEntry}
          plates={[
            { id: "PLATE-001", barcode: "PLATE-001", count: 1 },
            { id: "PLATE-002", barcode: "PLATE-002", count: 1 },
          ]}
          activePlateId={activePlateId}
          onPlateChange={() => {}}
        />,
      );

    renderScopedEditor("PLATE-001");
    expect(container.textContent).toContain("Plate Barcode");
    expect(container.textContent).toContain("PLATE-001");
    expect(container.textContent).toContain("S-1");
    expect(container.textContent).not.toContain("S-2");
    expect(container.querySelector('[data-well="A01"]')?.getAttribute("fill")).toBe(ROLE_COLOR.sample);

    renderScopedEditor("PLATE-002", new Set(["A01"]));
    expect(container.textContent).toContain("PLATE-002");
    expect(container.textContent).toContain("S-2");
    expect(container.textContent).not.toContain("S-1");
    expect(onSelectionChange).toHaveBeenCalledWith(new Set());

    renderScopedEditor("PLATE-002");
    expect(container.querySelector('[data-well="A01"]')?.getAttribute("fill")).toBe(ROLE_COLOR.control);
  });

  it("updates uncontrolled plate selection from the editor selector", () => {
    const onPlateChange = vi.fn();

    renderElement(
      <PlateMapEditor<SimpleWell>
        format="96"
        values={new Map()}
        onChange={() => {}}
        selection={new Set()}
        onSelectionChange={() => {}}
        fields={FIELDS}
        tableColumns={COLUMNS}
        colorForWell={colorForWell}
        emptyEntry={emptyEntry}
        plates={[
          { id: "PLATE-001", barcode: "PLATE-001", count: 0 },
          { id: "PLATE-002", barcode: "PLATE-002", count: 2 },
        ]}
        onPlateChange={onPlateChange}
      />,
    );

    expect(container.textContent).toContain("PLATE-001");

    const trigger = container.querySelector('button[aria-label="Plate"]') as HTMLButtonElement;
    act(() => {
      trigger.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, button: 0 }));
    });
    act(() => {
      findMenuItem("PLATE-002")?.click();
    });

    expect(onPlateChange).toHaveBeenCalledWith("PLATE-002");
    expect(container.textContent).toContain("PLATE-002");
  });

  it("writes active plate edits under a plate-scoped key and stamps the barcode", () => {
    const onChange = vi.fn();

    renderElement(
      <PlateMapEditor<SimpleWell>
        format="96"
        values={
          new Map<WellId, SimpleWell>([
            ["PLATE-001::A01", { plateBarcode: "PLATE-001", sampleId: "S-1" }],
            ["PLATE-002::A02", { plateBarcode: "PLATE-002", sampleId: "S-existing" }],
          ])
        }
        onChange={onChange}
        selection={new Set(["A01"])}
        onSelectionChange={() => {}}
        fields={FIELDS}
        tableColumns={COLUMNS}
        colorForWell={colorForWell}
        emptyEntry={emptyEntry}
        plates={[
          { id: "PLATE-001", barcode: "PLATE-001", count: 1 },
          { id: "PLATE-002", barcode: "PLATE-002", count: 0 },
        ]}
        activePlateId="PLATE-002"
        onPlateChange={() => {}}
      />,
    );

    const sampleInput = container.querySelector('input[id="field-sampleId"]') as HTMLInputElement;
    act(() => {
      setInputValue(sampleInput, "S-2");
    });
    act(() => {
      findButton(container, "Apply")?.click();
    });

    const next = onChange.mock.calls.at(-1)?.[0] as Map<WellId, SimpleWell>;
    expect(next.has("A01")).toBe(false);
    expect(next.get("PLATE-001::A01")?.sampleId).toBe("S-1");
    expect(next.get("PLATE-002::A01")).toEqual({ plateBarcode: "PLATE-002", sampleId: "S-2" });
    expect(next.get("PLATE-002::A02")).toEqual({ plateBarcode: "PLATE-002", sampleId: "S-existing" });
  });

  it("renders group shortcuts with active, disabled, count, and click states", () => {
    const onGroupClick = vi.fn();

    renderElement(
      <PlateMapEditor<SimpleWell>
        format="96"
        values={new Map()}
        onChange={() => {}}
        selection={new Set()}
        onSelectionChange={() => {}}
        fields={FIELDS}
        tableColumns={COLUMNS}
        colorForWell={colorForWell}
        emptyEntry={emptyEntry}
        groups={[
          { id: "samples", label: "Samples", color: "#bbdefb", borderColor: "#1e88e5", count: 12 },
          { id: "controls", label: "Controls", color: "#ffcdd2", disabled: true, wellIds: ["A01", "A02"] },
        ]}
        activeGroupId="samples"
        onGroupClick={onGroupClick}
      />,
    );

    expect(container.textContent).toContain("Samples");
    expect(container.textContent).toContain("12 wells");
    expect(container.textContent).toContain("Controls");
    expect(container.textContent).toContain("2 wells");

    act(() => {
      findButton(container, "Samples12 wells")?.click();
    });

    expect(onGroupClick).toHaveBeenCalledWith(expect.objectContaining({ id: "samples" }));
    expect(findButton(container, "Controls2 wells")?.disabled).toBe(true);
  });

  it("does not infer a barcode from activePlateId without a user or CSV plate option", () => {
    const onChange = vi.fn();

    renderElement(
      <PlateMapEditor<SimpleWell>
        format="96"
        values={new Map<WellId, SimpleWell>()}
        onChange={onChange}
        selection={new Set(["A01"])}
        onSelectionChange={() => {}}
        fields={FIELDS}
        tableColumns={COLUMNS}
        colorForWell={colorForWell}
        emptyEntry={emptyEntry}
        activePlateId="PLATE-001"
      />,
    );

    const sampleInput = container.querySelector('input[id="field-sampleId"]') as HTMLInputElement;
    act(() => {
      setInputValue(sampleInput, "S-1");
    });
    act(() => {
      findButton(container, "Apply")?.click();
    });

    const next = onChange.mock.calls.at(-1)?.[0] as Map<WellId, SimpleWell>;
    expect(next.get("A01")).toEqual({ sampleId: "S-1" });
    expect(next.has("PLATE-001::A01")).toBe(false);
    expect(container.textContent).not.toContain("Plate Barcode");
  });

  it("triages CSV rows by user-provided plate barcode", () => {
    const triage = triagePlateMapCsvByBarcode(
      "plate barcode,well,sample\nPLATE-001,A01,S-1\nPLATE-002,A01,S-2\nPLATE-001,A02,S-3\n,A03,S-4",
    );

    expect(triage.plateBarcodeColumn).toBe("plate barcode");
    expect(triage.plates).toEqual([
      expect.objectContaining({ id: "PLATE-001", barcode: "PLATE-001", rowCount: 2 }),
      expect.objectContaining({ id: "PLATE-002", barcode: "PLATE-002", rowCount: 1 }),
    ]);
    expect(triage.missingBarcodeRows.map((row) => row.line)).toEqual([5]);
    expect(plateOptionsFromCsvTriage(triage)).toEqual([
      { id: "PLATE-001", barcode: "PLATE-001", count: 2 },
      { id: "PLATE-002", barcode: "PLATE-002", count: 1 },
    ]);
  });

  it("triages quoted CSV fields and skips blank records", () => {
    const triage = triagePlateMapCsvByBarcode(
      '"plate barcode",well,sample\r\n"PLATE,001",A01,"S ""alpha"""\r\n,,\r\nPLATE-002,A02,S-2',
    );

    expect(triage.headers).toEqual(["plate barcode", "well", "sample"]);
    expect(triage.rows).toHaveLength(2);
    expect(triage.rows[0]).toEqual({
      line: 2,
      values: {
        "plate barcode": "PLATE,001",
        well: "A01",
        sample: 'S "alpha"',
      },
    });
    expect(triage.plates.map((plate) => plate.barcode)).toEqual(["PLATE,001", "PLATE-002"]);
    expect(triage.missingBarcodeRows).toEqual([]);
  });

  it("passes CSV plate triage through the editor import handler", async () => {
    const onImportCsv = vi.fn();

    renderElement(
      <PlateMapEditor<SimpleWell>
        format="96"
        values={new Map()}
        onChange={() => {}}
        selection={new Set()}
        onSelectionChange={() => {}}
        fields={FIELDS}
        tableColumns={COLUMNS}
        colorForWell={colorForWell}
        emptyEntry={emptyEntry}
        onImportCsv={onImportCsv}
      />,
    );

    const csvInput = container.querySelector('input[accept=".csv,text/csv"]') as HTMLInputElement;

    act(() => {
      setFileInput(
        csvInput,
        new File(["plate barcode,well\nPLATE-001,A01\nPLATE-002,A01"], "plates.csv", { type: "text/csv" }),
      );
    });
    await flushFilePick();

    expect(onImportCsv).toHaveBeenCalledWith(
      expect.objectContaining({ name: "plates.csv" }),
      expect.objectContaining({
        plateBarcodeColumn: "plate barcode",
        plates: [
          expect.objectContaining({ id: "PLATE-001", barcode: "PLATE-001" }),
          expect.objectContaining({ id: "PLATE-002", barcode: "PLATE-002" }),
        ],
      }),
    );
    expect(container.textContent).toContain("PLATE-001");

    const trigger = container.querySelector('button[aria-label="Plate"]') as HTMLButtonElement;
    act(() => {
      trigger.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, button: 0 }));
    });
    const secondPlateItem = [
      ...document.body.querySelectorAll('[role="menuitem"], [data-slot="dropdown-menu-item"]'),
    ].find((item) => item.textContent?.includes("PLATE-002"));
    expect(secondPlateItem).toBeDefined();
  });

  it("renders the compact actions menu and invokes menu and file handlers", async () => {
    const onTemplateChange = vi.fn();
    const onClearTemplate = vi.fn();
    const onImportCsv = vi.fn();
    const onExportCsv = vi.fn();
    const onImportTemplate = vi.fn();
    const onExportTemplate = vi.fn();
    const inputClick = vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => {});

    renderElement(
      <PlateMapActionsMenu
        templates={[
          { id: "standard", group: "Built-in", label: "Standard plate", description: "96 wells" },
          { id: "custom", label: "Custom layout", disabled: true },
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
        className="test-actions-menu"
      />,
    );

    const trigger = findButton(container, "Actions") as HTMLButtonElement;
    expect(trigger.className).toContain("test-actions-menu");

    const openActionsMenu = () => {
      act(() => {
        trigger.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, button: 0 }));
      });
    };

    act(() => {
      trigger.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, button: 0 }));
    });

    expect(document.body.textContent).toContain("Built-in");
    expect(document.body.textContent).toContain("96 wells");

    act(() => {
      findMenuItem("Standard plate")?.click();
    });
    expect(onTemplateChange).toHaveBeenCalledWith("standard");

    openActionsMenu();
    act(() => {
      findMenuItem("Save template")?.click();
    });
    openActionsMenu();
    act(() => {
      findMenuItem("Export plate map (CSV)")?.click();
    });
    openActionsMenu();
    act(() => {
      findMenuItem("Clear template")?.click();
    });

    expect(onExportTemplate).toHaveBeenCalledTimes(1);
    expect(onExportCsv).toHaveBeenCalledTimes(1);
    expect(onClearTemplate).toHaveBeenCalledTimes(1);

    openActionsMenu();
    act(() => {
      findMenuItem("Import template (JSON)")?.click();
    });
    openActionsMenu();
    act(() => {
      findMenuItem("Import plate map (CSV)")?.click();
    });

    expect(inputClick).toHaveBeenCalledTimes(2);

    const templateInput = container.querySelector('input[accept=".json"]') as HTMLInputElement;
    const csvInput = container.querySelector('input[accept=".csv"]') as HTMLInputElement;

    act(() => {
      templateInput.dispatchEvent(new Event("change", { bubbles: true }));
    });

    act(() => {
      setFileInput(templateInput, new File(["{}"], "template.json", { type: "application/json" }));
      setFileInput(csvInput, new File(["plate barcode,well\nPLATE-001,A01"], "plates.csv", { type: "text/csv" }));
    });
    await flushFilePick();

    expect(onImportTemplate).toHaveBeenCalledWith(expect.objectContaining({ name: "template.json" }));
    expect(onImportCsv).toHaveBeenCalledWith(
      expect.objectContaining({ name: "plates.csv" }),
      expect.objectContaining({ plateBarcodeColumn: "plate barcode" }),
    );
  });

  it("handles template panel imports, exports, and clearing", async () => {
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
    await flushFilePick();

    expect(onImportTemplate).toHaveBeenCalledWith(expect.objectContaining({ name: "template.json" }));
    expect(onImportCsv).toHaveBeenCalledWith(
      expect.objectContaining({ name: "plate.csv" }),
      expect.objectContaining({ headers: ["well", "sample"], plates: [] }),
    );
  });

  it("handles optional template panel sections and empty file picks", () => {
    const onImportTemplate = vi.fn();
    const onImportCsv = vi.fn();

    renderElement(
      <TemplateIOPanel
        templates={[{ id: "standard", label: "Standard plate" }]}
        templateId="standard"
        onTemplateChange={() => {}}
        onImportTemplate={onImportTemplate}
      />,
    );

    expect(container.textContent).toContain("Template & import / export");
    expect(container.textContent).not.toContain("Clear template");
    expect(container.textContent).not.toContain("Export template (JSON)");
    expect(container.textContent).not.toContain("Plate map");

    const templateInput = container.querySelector('input[accept="application/json"]') as HTMLInputElement;
    act(() => {
      templateInput.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(onImportTemplate).not.toHaveBeenCalled();

    renderElement(<TemplateIOPanel onImportCsv={onImportCsv} />);

    expect(container.textContent).not.toContain("Standard plate");
    expect(container.textContent).not.toContain("Import template (JSON)");
    expect(container.textContent).toContain("Plate map");
    expect(container.textContent).not.toContain("Export plate map (CSV)");
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

  it("renders manifest custom cells and row selection", () => {
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
    expect(container.textContent).toContain("Sample");
    expect(container.textContent).toContain("S-1");
    expect(container.querySelector("[data-slot='badge']")?.textContent).toContain("Sample");
    expect(container.querySelector("[data-slot='table-container']")?.getAttribute("data-variant")).toBeNull();

    expect(container.querySelector('input[type="number"]')).toBeNull();

    act(() => {
      findButton(container, "Custom A01")?.click();
    });
    const next = onChange.mock.calls.at(-1)?.[0] as Map<WellId, SimpleWell>;
    expect(next.get("A01")).toEqual({ role: "sample", amount: 1, sampleId: "custom-A01" });

    const checkbox = container.querySelector('[aria-label="Select A01"]') as HTMLElement;
    act(() => {
      checkbox.click();
    });
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["A03"]));
  });

  it("renders inline text/number/date/integer inputs when field.editableInTable is set", () => {
    const onChange = vi.fn();
    const values = new Map<WellId, SimpleWell>([
      ["A01", { sampleId: "S-1", amount: 4 }],
    ]);

    renderElement(
      <WellManifestTable<SimpleWell>
        values={values}
        onChange={onChange}
        columns={[
          { header: "Sample ID", field: "sampleId" },
          { header: "Amount", field: "amount" },
        ]}
        fields={[
          { key: "sampleId", label: "Sample ID", kind: "text", editableInTable: true },
          { key: "amount", label: "Amount", kind: "integer", editableInTable: true },
        ]}
        emptyEntry={emptyEntry}
        pageSize={10}
      />,
    );

    const sampleCell = container.querySelector(
      'input[aria-label="Sample ID for A01"]',
    ) as HTMLInputElement;
    expect(sampleCell).not.toBeNull();
    expect(sampleCell.type).toBe("text");
    expect(sampleCell.value).toBe("S-1");

    const amountCell = container.querySelector(
      'input[aria-label="Amount for A01"]',
    ) as HTMLInputElement;
    expect(amountCell).not.toBeNull();
    expect(amountCell.type).toBe("number");
    expect(amountCell.getAttribute("step")).toBe("1");

    act(() => {
      setInputValue(sampleCell, "S-2");
    });
    let next = onChange.mock.calls.at(-1)?.[0] as Map<WellId, SimpleWell>;
    expect(next.get("A01")?.sampleId).toBe("S-2");

    act(() => {
      setInputValue(amountCell, "7");
    });
    next = onChange.mock.calls.at(-1)?.[0] as Map<WellId, SimpleWell>;
    expect(next.get("A01")?.amount).toBe(7);
  });

  it("renders datetime and time inputs with editableInTable", () => {
    const onChange = vi.fn();
    const values = new Map<WellId, SimpleWell>([["A01", {}]]);

    renderElement(
      <WellManifestTable<SimpleWell>
        values={values}
        onChange={onChange}
        columns={[
          { header: "Collected At", field: "collectedAt" },
          { header: "Collected Time", field: "collectedTime" },
        ]}
        fields={[
          { key: "collectedAt", label: "Collected At", kind: "datetime", editableInTable: true },
          { key: "collectedTime", label: "Collected Time", kind: "time", editableInTable: true },
        ]}
        emptyEntry={emptyEntry}
        pageSize={10}
      />,
    );

    const dt = container.querySelector('input[aria-label="Collected At for A01"]') as HTMLInputElement;
    expect(dt.type).toBe("datetime-local");
    const time = container.querySelector('input[aria-label="Collected Time for A01"]') as HTMLInputElement;
    expect(time.type).toBe("time");

    act(() => {
      setInputValue(time, "08:30");
    });
    const next = onChange.mock.calls.at(-1)?.[0] as Map<WellId, SimpleWell>;
    expect(next.get("A01")?.collectedTime).toBe("08:30");
  });

  it("renders an editable boolean checkbox that toggles row state", () => {
    const onChange = vi.fn();
    const values = new Map<WellId, SimpleWell>([["A01", { active: false }]]);

    renderElement(
      <WellManifestTable<SimpleWell>
        values={values}
        onChange={onChange}
        columns={[{ header: "Active", field: "active" }]}
        fields={[{ key: "active", label: "Active", kind: "boolean", editableInTable: true }]}
        emptyEntry={emptyEntry}
        pageSize={10}
      />,
    );

    const checkbox = container.querySelector('[aria-label="Active for A01"]') as HTMLElement;
    expect(checkbox).not.toBeNull();
    expect(checkbox.getAttribute("data-state")).toBe("unchecked");

    act(() => {
      checkbox.click();
    });

    const next = onChange.mock.calls.at(-1)?.[0] as Map<WellId, SimpleWell>;
    expect(next.get("A01")?.active).toBe(true);
  });

  it("renders read-only multiselect badges and boolean check for non-editable fields", () => {
    const values = new Map<WellId, SimpleWell>([
      ["A01", { active: true, tags: ["red", "blue"] }],
    ]);

    renderElement(
      <WellManifestTable<SimpleWell>
        values={values}
        onChange={() => {}}
        columns={[
          { header: "Active", field: "active" },
          { header: "Tags", field: "tags" },
        ]}
        fields={[
          { key: "active", label: "Active", kind: "boolean" },
          {
            key: "tags",
            label: "Tags",
            kind: "multiselect",
            options: [
              { value: "red", label: "Red" },
              { value: "blue", label: "Blue" },
              { value: "green", label: "Green" },
            ],
          },
        ]}
        emptyEntry={emptyEntry}
        pageSize={10}
      />,
    );

    const badges = [...container.querySelectorAll("[data-slot='badge']")].map((b) => b.textContent);
    expect(badges).toEqual(expect.arrayContaining(["Red", "Blue"]));
    expect(container.querySelector('svg[aria-label="Yes"]')).not.toBeNull();
  });

  it("renders a select trigger in the manifest when field.editableInTable is set", () => {
    const values = new Map<WellId, SimpleWell>([["A01", { role: "sample" }]]);

    renderElement(
      <WellManifestTable<SimpleWell>
        values={values}
        onChange={() => {}}
        columns={[{ header: "Role", field: "role" }]}
        fields={[{ ...FIELDS[0], editableInTable: true }]}
        emptyEntry={emptyEntry}
        pageSize={10}
      />,
    );

    const trigger = container.querySelector('button[aria-label="Role for A01"]') as HTMLButtonElement;
    expect(trigger).not.toBeNull();
    expect(trigger.getAttribute("role")).toBe("combobox");
    expect(trigger.textContent).toContain("Sample");
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

  it("uses the plate cell backdrop for empty wells by default", () => {
    const renderGrid = (emptyWellFillColor?: string | null) =>
      renderElement(
        <PlatePaintGrid<SimpleWell>
          format="96"
          values={new Map()}
          selection={new Set()}
          onSelectionChange={() => {}}
          colorForWell={colorForWell}
          emptyWellFillColor={emptyWellFillColor}
        />,
      );

    renderGrid();
    expect(container.querySelector('[data-well="A01"]')?.getAttribute("fill")).toBe(PLATE_MAP_EMPTY_WELL_FILL);
    expect(container.querySelector('[data-well="A01"]')?.getAttribute("stroke")).toBe("none");
    expect(container.querySelector('[data-plate-grid-line="column-0"]')?.getAttribute("stroke")).toBe(
      PLATE_MAP_CELL_BORDER,
    );
    const svg = container.querySelector("svg") as SVGSVGElement;
    const rightBorder = container.querySelector('[data-plate-grid-line="column-12"]') as SVGLineElement;
    const bottomBorder = container.querySelector('[data-plate-grid-line="row-8"]') as SVGLineElement;
    const strokeWidth = Number(rightBorder.getAttribute("stroke-width"));
    expect(Number(svg.getAttribute("width")) - Number(rightBorder.getAttribute("x1"))).toBeGreaterThanOrEqual(
      strokeWidth / 2,
    );
    expect(Number(svg.getAttribute("height")) - Number(bottomBorder.getAttribute("y1"))).toBeGreaterThanOrEqual(
      strokeWidth / 2,
    );

    renderGrid(null);
    expect(container.querySelector('[data-well="A01"]')?.getAttribute("fill")).toBe("#fafafa");
  });
});
