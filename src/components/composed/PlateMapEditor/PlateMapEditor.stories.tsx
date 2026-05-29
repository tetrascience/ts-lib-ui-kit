import {
  DndContext,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Barcode, Database, FileText, GripVertical, Plus, Tag, X } from "lucide-react";
import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { getPlateMapScopedWellId, PlateMapEditor } from "./PlateMapEditor";
import { PLATE_MAP_EMPTY_WELL_FILL } from "./PlatePaintGrid";
import { PlateZoomControl } from "./PlateZoomControl";
import { WellLegend } from "./WellLegend";
import { WellMetadataForm } from "./WellMetadataForm";

import type {
  PlateFormat,
  PlateMapCsvTriage,
  TemplateOption,
  WellColumn,
  WellField,
  WellId,
  WellRecord,
} from "./types";
import type { DragEndEvent } from "@dnd-kit/core";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DemoWell extends WellRecord {
  plateBarcode?: string;
  role?: "sample" | "control" | "blank";
  sampleId?: string;
  notes?: string;
}

const ROLE_COLOR: Record<NonNullable<DemoWell["role"]>, string> = {
  sample: "var(--color-chart-1)",
  control: "var(--color-destructive)",
  blank: "var(--color-muted)",
};

const FIELDS: WellField<DemoWell>[] = [
  {
    key: "role",
    label: "Well Role",
    icon: <Tag />,
    kind: "select",
    editableInTable: true,
    options: [
      { value: "sample", label: "Sample", swatch: ROLE_COLOR.sample },
      { value: "control", label: "Control", swatch: ROLE_COLOR.control },
      { value: "blank", label: "Blank", swatch: ROLE_COLOR.blank },
    ],
  },
  { key: "sampleId", label: "Sample ID", icon: <Barcode />, kind: "text", editableInTable: true },
  { key: "notes", label: "Notes", icon: <FileText />, kind: "text", editableInTable: true },
];

const COLUMNS: WellColumn<DemoWell>[] = [
  { header: "Well Role", field: "role", minWidth: 130 },
  { header: "Sample ID", field: "sampleId", minWidth: 130 },
  { header: "Notes", field: "notes", minWidth: 160 },
];

const SAMPLE_PALETTE: ReadonlyArray<{
  id: string;
  role: NonNullable<DemoWell["role"]>;
  notes: string;
}> = [
  { id: "SAMP-001", role: "sample", notes: "primary" },
  { id: "SAMP-002", role: "sample", notes: "primary" },
  { id: "SAMP-003", role: "sample", notes: "replicate" },
  { id: "SAMP-004", role: "control", notes: "positive" },
  { id: "SAMP-005", role: "control", notes: "negative" },
  { id: "BLANK-001", role: "blank", notes: "media" },
];

const SEED_LAYOUT: ReadonlyArray<readonly [WellId, NonNullable<DemoWell["role"]>, number]> = [
  ["A01", "sample", 0],
  ["A02", "sample", 1],
  ["B01", "control", 3],
  ["C01", "blank", 5],
];

const INITIAL_PLATE_ID = "DEMO-PLATE-001";

const DEMO_TEMPLATES: TemplateOption[] = [
  { id: "single-point", label: "Single concentration", group: "Built-in", description: "1 dose, all wells" },
  { id: "three-point-auc", label: "3-point AUC", group: "Built-in", description: "high / medium / low" },
  { id: "seven-point-dr", label: "7-point dose response", group: "Built-in" },
  { id: "eleven-point-dr", label: "11-point dose response", group: "Built-in" },
  { id: "custom", label: "Custom layout", group: "User" },
];

function countPlateEntries(values: Map<WellId, DemoWell>, plateId: string): number {
  const prefix = getPlateMapScopedWellId(plateId, "");
  return [...values.keys()].filter((key) => key.startsWith(prefix)).length;
}

function colorForWell(well: DemoWell | undefined): string {
  if (!well?.role) return PLATE_MAP_EMPTY_WELL_FILL;
  return ROLE_COLOR[well.role];
}

function emptyEntry(_id: WellId): DemoWell {
  return {};
}

function isPopulated(row: DemoWell): boolean {
  return !!(row.role || row.sampleId || row.notes);
}

function seedPlate(): Map<WellId, DemoWell> {
  const map = new Map<WellId, DemoWell>();
  for (const [wellId, role, idx] of SEED_LAYOUT) {
    const sample = SAMPLE_PALETTE[idx];
    map.set(getPlateMapScopedWellId(INITIAL_PLATE_ID, wellId), {
      plateBarcode: INITIAL_PLATE_ID,
      role,
      sampleId: sample.id,
      notes: sample.notes,
    });
  }
  return map;
}

function useEditorState() {
  const [values, setValues] = React.useState<Map<WellId, DemoWell>>(seedPlate);
  const [selection, setSelection] = React.useState<Set<WellId>>(new Set());
  const [plateIds, setPlateIds] = React.useState<string[]>([INITIAL_PLATE_ID]);
  const [activePlateId, setActivePlateId] = React.useState(INITIAL_PLATE_ID);
  const [hoveredSampleId, setHoveredSampleId] = React.useState<string | null>(null);
  const [zoom, setZoom] = React.useState(1);

  const legendItems = React.useMemo(() => {
    const seen = new Map<string, DemoWell>();
    values.forEach((row) => {
      if (row.sampleId && !seen.has(row.sampleId)) seen.set(row.sampleId, row);
    });
    return [...seen.entries()].map(([sampleId, row]) => ({
      id: sampleId,
      label: sampleId,
      color: row.role ? ROLE_COLOR[row.role] : "var(--color-muted)",
      meta: row.role ?? "—",
    }));
  }, [values]);

  const highlightedWellIds = React.useMemo<ReadonlySet<WellId>>(() => {
    if (!hoveredSampleId) return new Set();
    const matches = new Set<WellId>();
    values.forEach((row, key) => {
      if (row.sampleId !== hoveredSampleId) return;
      const sepIdx = key.indexOf("::");
      const wellId = sepIdx > 0 ? key.slice(sepIdx + 2) : key;
      const platePrefix = sepIdx > 0 ? key.slice(0, sepIdx) : null;
      if (platePrefix && platePrefix !== activePlateId) return;
      matches.add(wellId);
    });
    return matches;
  }, [hoveredSampleId, values, activePlateId]);

  const plateOptions = plateIds.map((plateId) => ({
    id: plateId,
    barcode: plateId,
    count: countPlateEntries(values, plateId),
  }));

  const handleAddPlate = () => {
    const next = `DEMO-PLATE-${String(plateIds.length + 1).padStart(3, "0")}`;
    setPlateIds((prev) => (prev.includes(next) ? prev : [...prev, next]));
    setActivePlateId(next);
    setSelection(new Set());
  };

  const handleRemovePlate = (plateId: string) => {
    const next = new Map(values);
    [...next.keys()].forEach((key) => {
      if (key.startsWith(`${plateId}::`)) next.delete(key);
    });
    setValues(next);
    setPlateIds((prev) => prev.filter((id) => id !== plateId));
    if (activePlateId === plateId) {
      const fallback = plateIds.find((id) => id !== plateId);
      setActivePlateId(fallback ?? INITIAL_PLATE_ID);
    }
  };

  return {
    values,
    setValues,
    selection,
    setSelection,
    activePlateId,
    setActivePlateId,
    setHoveredSampleId,
    zoom,
    setZoom,
    legendItems,
    highlightedWellIds,
    plateOptions,
    handleAddPlate,
    handleRemovePlate,
  };
}

/**
 * Story-only LIMS query panel. Demonstrates wiring an app-owned action into
 * the editor's `plateToolbar` slot. In production the OCB app would replace
 * the `onSubmit` handler with a real backend call and map the response into
 * the editor's `Map<WellId, T>` state via `onChange`.
 */
function QueryLimsPanel({ onSubmit }: { onSubmit?: (plateIds: string[]) => void }) {
  const [open, setOpen] = React.useState(false);
  const [plateIds, setPlateIds] = React.useState<string[]>([""]);

  const updateId = (idx: number, value: string) =>
    setPlateIds((prev) => prev.map((v, i) => (i === idx ? value : v)));
  const addId = () => setPlateIds((prev) => [...prev, ""]);
  const removeId = (idx: number) =>
    setPlateIds((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

  const handleSubmit = () => {
    const cleaned = plateIds.map((v) => v.trim()).filter(Boolean);
    onSubmit?.(cleaned);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Database aria-hidden className="size-3.5" />
          Query LIMS
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium">Query LIMS</div>
          <div className="text-xs text-muted-foreground">
            Enter one or more plate IDs to populate from LIMS.
          </div>
          <div className="flex flex-col gap-1.5">
            {plateIds.map((value, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <Input
                  aria-label={`Plate ID ${idx + 1}`}
                  placeholder="PLATE-XXXX"
                  value={value}
                  onChange={(e) => updateId(idx, e.target.value)}
                  className="h-8"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  disabled={plateIds.length === 1}
                  aria-label={`Remove plate ID ${idx + 1}`}
                  onClick={() => removeId(idx)}
                >
                  <X aria-hidden className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="ghost" size="sm" className="justify-start" onClick={addId}>
            <Plus aria-hidden className="size-3.5" />
            Add plate ID
          </Button>
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!plateIds.some((v) => v.trim())}
              onClick={handleSubmit}
            >
              Query
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function DraggableSampleChip({ sample }: { sample: (typeof SAMPLE_PALETTE)[number] }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${sample.id}`,
    data: { sampleId: sample.id, role: sample.role, notes: sample.notes },
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "flex cursor-grab items-center gap-2 rounded-md border bg-card px-2 py-1.5 text-xs",
        "ring-1 ring-foreground/5 active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      <GripVertical aria-hidden className="size-3 text-muted-foreground" />
      <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ backgroundColor: ROLE_COLOR[sample.role] }} />
      <span className="flex-1 truncate font-medium">{sample.id}</span>
      <span className="text-[0.65rem] text-muted-foreground">{sample.role}</span>
    </div>
  );
}

function DroppableWellOverlay({ wellId, cellSize }: { wellId: WellId; cellSize: number }) {
  const { isOver, setNodeRef, active } = useDroppable({ id: wellId });
  if (!active) return null;
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "pointer-events-auto h-full w-full rounded-full transition-colors",
        isOver && "bg-primary/20 ring-2 ring-primary",
      )}
      style={{ width: cellSize, height: cellSize }}
    />
  );
}

function PlateMapEditorDefault({ format = "96" }: { format?: PlateFormat } = {}) {
  const state = useEditorState();
  const [templateId, setTemplateId] = React.useState<string | undefined>();

  const handleImportCsv = React.useCallback((file: File, triage?: PlateMapCsvTriage) => {
    console.log("[story] import CSV", file.name, triage?.plates.length ?? 0, "plate(s)");
  }, []);
  const handleExportCsv = React.useCallback(() => {
    console.log("[story] export CSV", state.values.size, "wells");
  }, [state.values]);
  const handleClearTemplate = React.useCallback(() => {
    setTemplateId(undefined);
    state.setValues(new Map());
    state.setSelection(new Set());
  }, [state]);

  return (
    <PlateMapEditor<DemoWell>
      format={format}
      values={state.values}
      onChange={state.setValues}
      selection={state.selection}
      onSelectionChange={state.setSelection}
      fields={FIELDS}
      tableColumns={COLUMNS}
      colorForWell={colorForWell}
      emptyEntry={emptyEntry}
      isPopulated={isPopulated}
      cycleFieldOnWellDoubleClick="role"
      title="Plate map editor"
      wellShape="circle"
      framedPlate
      plates={state.plateOptions}
      activePlateId={state.activePlateId}
      onPlateChange={(plateId) => {
        state.setActivePlateId(plateId);
        state.setSelection(new Set());
      }}
      onAddPlate={state.handleAddPlate}
      onRemovePlate={state.handleRemovePlate}
      plateSelectorVariant="tabs"
      highlightedWellIds={state.highlightedWellIds}
      manifestFilterable
      manifestGroupable
      templates={DEMO_TEMPLATES}
      templateId={templateId}
      onTemplateChange={setTemplateId}
      onClearTemplate={handleClearTemplate}
      onImportCsv={handleImportCsv}
      onExportCsv={handleExportCsv}
      badges={
        <>
          <Badge variant="secondary">{format}-well · circle</Badge>
          <Badge variant="info">{state.selection.size} selected</Badge>
        </>
      }
      legend={
        <WellLegend
          items={state.legendItems}
          onHoverEnter={state.setHoveredSampleId}
          onHoverLeave={() => state.setHoveredSampleId(null)}
          emptyLabel="No samples assigned yet"
        />
      }
      plateToolbar={
        <>
          <PlateZoomControl zoom={state.zoom} onZoomChange={state.setZoom} />
          <QueryLimsPanel
            onSubmit={(ids) => {
              console.log("[story] Query LIMS", ids);
            }}
          />
        </>
      }
    />
  );
}

function PlateMapEditorDragDrop() {
  const state = useEditorState();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const data = active.data.current as { sampleId?: string; role?: DemoWell["role"]; notes?: string } | undefined;
    if (!data?.sampleId) return;
    const wellId = String(over.id);
    const next = new Map(state.values);
    next.set(getPlateMapScopedWellId(state.activePlateId, wellId), {
      plateBarcode: state.activePlateId,
      role: data.role,
      sampleId: data.sampleId,
      notes: data.notes,
    });
    state.setValues(next);
  };

  const palette = (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-medium text-muted-foreground">Drag a sample onto a well</div>
      <div className="flex flex-col gap-1.5">
        {SAMPLE_PALETTE.map((sample) => (
          <DraggableSampleChip key={sample.id} sample={sample} />
        ))}
      </div>
    </div>
  );

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragEnd={handleDragEnd}>
      <PlateMapEditor<DemoWell>
        format="96"
        values={state.values}
        onChange={state.setValues}
        selection={state.selection}
        onSelectionChange={state.setSelection}
        fields={FIELDS}
        tableColumns={COLUMNS}
        colorForWell={colorForWell}
        emptyEntry={emptyEntry}
        isPopulated={isPopulated}
        title="Drag samples onto plate"
        wellShape="circle"
        framedPlate
        wrapWell={(wellId, cellSize) => <DroppableWellOverlay wellId={wellId} cellSize={cellSize} />}
        plates={state.plateOptions}
        activePlateId={state.activePlateId}
        onPlateChange={(plateId) => {
          state.setActivePlateId(plateId);
          state.setSelection(new Set());
        }}
        onAddPlate={state.handleAddPlate}
        onRemovePlate={state.handleRemovePlate}
        plateSelectorVariant="tabs"
        highlightedWellIds={state.highlightedWellIds}
        manifestFilterable
        manifestGroupable
        formSlot={palette}
        legend={
          <WellLegend
            items={state.legendItems}
            onHoverEnter={state.setHoveredSampleId}
            onHoverLeave={() => state.setHoveredSampleId(null)}
            emptyLabel="No samples assigned yet"
          />
        }
        plateToolbar={
          <>
            <PlateZoomControl zoom={state.zoom} onZoomChange={state.setZoom} />
            <QueryLimsPanel
              onSubmit={(ids) => {
                console.log("[story] Query LIMS", ids);
              }}
            />
          </>
        }
        badges={
          <>
            <Badge variant="secondary">96-well · circle</Badge>
            <Badge variant="info">drag & drop</Badge>
          </>
        }
      />
    </DndContext>
  );
}

const meta: Meta<typeof PlateMapEditor<DemoWell>> = {
  title: "Patterns/PlateMapEditor",
  component: PlateMapEditor,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof PlateMapEditor<DemoWell>>;

export const Default: Story = {
  name: "Default (96-well)",
  render: () => <PlateMapEditorDefault format="96" />,
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Renders header title and badges", async () => {
      expect(canvas.getByText("Plate map editor")).toBeInTheDocument();
      expect(canvas.getByText(/96-well/)).toBeInTheDocument();
    });

    await step("Renders 96 wells in the plate grid", async () => {
      const wells = canvasElement.querySelectorAll("[data-well]");
      expect(wells.length).toBe(96);
    });

    await step("Renders the sample manifest table", async () => {
      expect(canvas.getByText("Sample manifest")).toBeInTheDocument();
    });

    await step("Renders the template I/O panel actions", async () => {
      expect(canvas.getByRole("button", { name: /actions/i })).toBeInTheDocument();
    });
  },
};

export const Default384: Story = {
  name: "Default (384-well)",
  render: () => <PlateMapEditorDefault format="384" />,
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Renders 384-well badge", async () => {
      expect(canvas.getByText(/384-well/)).toBeInTheDocument();
    });

    await step("Renders 384 wells in the plate grid", async () => {
      const wells = canvasElement.querySelectorAll("[data-well]");
      expect(wells.length).toBe(384);
    });
  },
};

export const DragAndDrop: Story = {
  name: "Drag-and-drop palette",
  render: () => <PlateMapEditorDragDrop />,
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Renders DnD title and badge", async () => {
      expect(canvas.getByText("Drag samples onto plate")).toBeInTheDocument();
      expect(canvas.getByText(/drag & drop/i)).toBeInTheDocument();
    });

    await step("Renders draggable sample palette", async () => {
      expect(canvas.getByText("Drag a sample onto a well")).toBeInTheDocument();
      expect(canvas.getAllByText("SAMP-001").length).toBeGreaterThan(0);
      expect(canvas.getAllByText("BLANK-001").length).toBeGreaterThan(0);
    });

    await step("Renders 96 wells in the plate grid", async () => {
      const wells = canvasElement.querySelectorAll("[data-well]");
      expect(wells.length).toBe(96);
    });
  },
};

export const FormApplyAndClear: Story = {
  name: "Form apply + clear",
  render: () => <PlateMapEditorDefault format="96" />,
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Select all wells via the link button", async () => {
      await userEvent.click(canvas.getByText("Select all"));
      await waitFor(() =>
        expect(canvas.getByText("Apply to 96 wells")).toBeInTheDocument(),
      );
    });

    await step("Stage a sample id, then apply it to the selection", async () => {
      const sampleInput = canvasElement.querySelector(
        'input[id="field-sampleId"]',
      ) as HTMLInputElement;
      expect(sampleInput).not.toBeNull();
      await userEvent.clear(sampleInput);
      await userEvent.type(sampleInput, "SAMP-APPLY");
      await userEvent.click(canvas.getByRole("button", { name: "Apply" }));
      await waitFor(() => {
        const cell = canvasElement.querySelector(
          'input[aria-label="Sample ID for A01"]',
        ) as HTMLInputElement | null;
        expect(cell?.value).toBe("SAMP-APPLY");
      });
    });

    await step("Deselect everything and confirm the form is disabled", async () => {
      await userEvent.click(canvas.getByText("Deselect all"));
      await waitFor(() =>
        expect(canvas.getByText("Select wells to edit")).toBeInTheDocument(),
      );
      const apply = canvas.getByRole("button", { name: "Apply" }) as HTMLButtonElement;
      expect(apply.disabled).toBe(true);
    });
  },
};

export const Filtering: Story = {
  name: "Manifest filtering",
  render: () => <PlateMapEditorDefault format="96" />,
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await step("Open the manifest filter popover", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /^Filter$/ }));
      await userEvent.click(await body.findByRole("button", { name: /Add filter/i }));
      expect(body.getByPlaceholderText(/Value…/)).toBeInTheDocument();
    });

    await step("Type a value and confirm the active filter badge", async () => {
      await userEvent.type(body.getByPlaceholderText(/Value…/), "SAMP");
      await waitFor(() => {
        expect(canvas.getByRole("button", { name: /Filter \(1 active\)/ })).toBeInTheDocument();
      });
    });

    await step("Add a second filter row, then clear all", async () => {
      await userEvent.click(body.getByRole("button", { name: /Add filter/i }));
      await waitFor(() =>
        expect(canvas.getByRole("button", { name: /Filter \(2 active\)/ })).toBeInTheDocument(),
      );
      await userEvent.click(body.getByRole("button", { name: /Clear all/i }));
      await waitFor(() =>
        expect(canvas.getByRole("button", { name: /^Filter$/ })).toBeInTheDocument(),
      );
    });
  },
};

export const FilteringIsEmpty: Story = {
  name: "Manifest filter — operator switch",
  render: () => <PlateMapEditorDefault format="96" />,
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await step("Open the popover and add a filter row", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /^Filter$/ }));
      await userEvent.click(await body.findByRole("button", { name: /Add filter/i }));
    });

    await step("Switch operator to a value-free operator", async () => {
      const popover = canvasElement.ownerDocument.body.querySelector(
        '[role="dialog"]',
      ) as HTMLElement;
      const popoverComboboxes = popover.querySelectorAll('[role="combobox"]');
      await userEvent.click(popoverComboboxes[1] as HTMLElement);
      const option = await body.findByRole("option", { name: /is empty/i });
      await userEvent.click(option);
      await waitFor(() => {
        expect(
          canvasElement.ownerDocument.body.querySelector('input[placeholder="Value…"]'),
        ).toBeNull();
      });
    });

    await step("Switch the column and confirm the operator falls back", async () => {
      const popover = canvasElement.ownerDocument.body.querySelector(
        '[role="dialog"]',
      ) as HTMLElement;
      const popoverComboboxes = popover.querySelectorAll('[role="combobox"]');
      await userEvent.click(popoverComboboxes[0] as HTMLElement);
      const option = await body.findByRole("option", { name: /Sample ID/i });
      await userEvent.click(option);
    });
  },
};

export const GroupingAndPaging: Story = {
  name: "Grouping + page size",
  render: () => <PlateMapEditorDefault format="96" />,
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    const manifestSummary = () => {
      const span = canvasElement.querySelector(
        "[data-slot='well-manifest-table'] span.text-xs.text-muted-foreground",
      ) as HTMLElement | null;
      return span?.textContent ?? "";
    };

    await step("Select all wells so the manifest reaches its row cap", async () => {
      await userEvent.click(canvas.getByText("Select all"));
      await waitFor(() => expect(manifestSummary()).toMatch(/96 rows/));
    });

    await step("Group manifest rows by 'Well Role'", async () => {
      await userEvent.click(canvas.getByRole("combobox", { name: /Group by/i }));
      await userEvent.click(await body.findByRole("option", { name: /^Well Role$/ }));
      await waitFor(() => {
        const groupHeader = canvasElement.querySelector("tbody tr.bg-muted\\/40");
        expect(groupHeader).not.toBeNull();
      });
    });

    await step("Collapse a group by clicking its header twice", async () => {
      const groupRows = canvasElement.querySelectorAll("tbody tr.bg-muted\\/40");
      expect(groupRows.length).toBeGreaterThan(0);
      const firstHeader = groupRows[0] as HTMLElement;
      await userEvent.click(firstHeader);
      await userEvent.click(firstHeader);
    });

    await step("Switch back to ungrouped and change rows-per-page", async () => {
      await userEvent.click(canvas.getByRole("combobox", { name: /Group by/i }));
      await userEvent.click(await body.findByRole("option", { name: /^No grouping$/ }));

      await userEvent.click(canvas.getByRole("combobox", { name: /Rows per page/i }));
      await userEvent.click(await body.findByRole("option", { name: "50" }));
      await waitFor(() => expect(canvasElement.textContent).toContain("1–50 of 96"));
    });
  },
};

export const ZoomControls: Story = {
  name: "Plate zoom buttons",
  render: () => <PlateMapEditorDefault format="96" />,
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Zoom in until the button is disabled at max", async () => {
      const zoomIn = canvas.getByRole("button", { name: /Zoom in/i }) as HTMLButtonElement;
      for (let i = 0; i < 12 && !zoomIn.disabled; i++) {
        await userEvent.click(zoomIn);
      }
      await waitFor(() => expect(zoomIn.disabled).toBe(true));
      expect(canvas.getByText("200%")).toBeInTheDocument();
    });

    await step("Zoom out until the button is disabled at min", async () => {
      const zoomOut = canvas.getByRole("button", { name: /Zoom out/i }) as HTMLButtonElement;
      for (let i = 0; i < 24 && !zoomOut.disabled; i++) {
        await userEvent.click(zoomOut);
      }
      await waitFor(() => expect(zoomOut.disabled).toBe(true));
      expect(canvas.getByText("50%")).toBeInTheDocument();
    });
  },
};

export const LegendStates: Story = {
  name: "WellLegend states",
  render: () => {
    const items = [
      { id: "SAMP-001", label: "SAMP-001", color: "var(--color-chart-1)", meta: "sample" },
      { id: "SAMP-002", label: "SAMP-002", color: "var(--color-chart-2)" },
      { id: "DISABLED", label: "Archived", color: "var(--color-muted)", disabled: true },
    ];
    return (
      <div className="flex flex-col gap-4 p-4">
        <div>
          <div className="mb-2 text-xs font-medium">Empty</div>
          <WellLegend items={[]} emptyLabel="No samples assigned yet" />
        </div>
        <div>
          <div className="mb-2 text-xs font-medium">With meta + remove</div>
          <WellLegend
            items={items}
            onHoverEnter={() => {}}
            onHoverLeave={() => {}}
            onRemove={() => {}}
            removeLabel="Remove"
          />
        </div>
      </div>
    );
  },
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Empty legend renders the empty label", async () => {
      expect(canvas.getByText("No samples assigned yet")).toBeInTheDocument();
    });

    await step("Hover the first legend item then leave", async () => {
      const item = canvasElement.querySelectorAll("[data-slot='well-legend-item']")[0] as HTMLElement;
      await userEvent.hover(item);
      await userEvent.unhover(item);
    });

    await step("Click the remove button on the first item", async () => {
      const removeBtn = canvas.getByRole("button", { name: "Remove SAMP-001" });
      await userEvent.click(removeBtn);
    });
  },
};

export const RichForm: Story = {
  name: "Form with rich field kinds",
  render: () => {
    interface RichWell {
      role?: "sample" | "control";
      tags?: string[];
      active?: boolean;
      verified?: boolean;
      sampleId?: string;
      count?: number;
    }
    function Demo() {
      const [value, setValue] = React.useState<Partial<RichWell>>({});
      return (
        <div className="max-w-sm p-4">
          <WellMetadataForm<RichWell>
            fields={[
              {
                key: "role",
                label: "Role",
                kind: "select",
                options: [
                  { value: "sample", label: "Sample", swatch: "var(--color-chart-1)" },
                  { value: "control", label: "Control" },
                ],
              },
              {
                key: "tags",
                label: "Tags",
                kind: "multiselect",
                options: [
                  { value: "red", label: "Red", swatch: "var(--color-destructive)" },
                  { value: "blue", label: "Blue" },
                ],
              },
              { key: "active", label: "Active", kind: "boolean" },
              { key: "verified", label: "Verified", kind: "boolean", boolStyle: "switch" },
              { key: "count", label: "Count", kind: "integer" },
              { key: "sampleId", label: "Sample ID", kind: "text", icon: <Barcode /> },
            ]}
            value={value}
            onChange={setValue}
            selectionSize={3}
            onApply={() => {}}
            onClear={() => {}}
          />
        </div>
      );
    }
    return <Demo />;
  },
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Toggle the checkbox boolean field", async () => {
      const activeCheckbox = canvas.getByRole("checkbox", { name: /Active/ });
      await userEvent.click(activeCheckbox);
      await waitFor(() => expect(activeCheckbox.getAttribute("data-state")).toBe("checked"));
    });

    await step("Toggle the switch boolean field", async () => {
      const verifiedSwitch = canvas.getByRole("switch", { name: /Verified/ });
      await userEvent.click(verifiedSwitch);
      await waitFor(() => expect(verifiedSwitch.getAttribute("data-state")).toBe("checked"));
    });

    await step("Type into the integer field", async () => {
      const countInput = canvasElement.querySelector(
        'input[id="field-count"]',
      ) as HTMLInputElement;
      await userEvent.clear(countInput);
      await userEvent.type(countInput, "7");
      expect(countInput.value).toBe("7");
    });

    await step("Open the tags multiselect and pick an option", async () => {
      const chipsInput = canvasElement.querySelector(
        'input[id="field-tags"]',
      ) as HTMLInputElement;
      await userEvent.click(chipsInput);
      const option = await waitFor(() => {
        const el = [
          ...canvasElement.ownerDocument.body.querySelectorAll('[role="option"]'),
        ].find((node) => node.textContent?.trim() === "Red");
        if (!el) throw new Error("'Red' option missing");
        return el as HTMLElement;
      });
      await userEvent.click(option);
      await waitFor(() =>
        expect(canvasElement.querySelector('[data-slot="combobox-chip"]')).not.toBeNull(),
      );
    });

    await step("Apply to 3 wells label is shown", async () => {
      expect(canvas.getByText("Apply to 3 wells")).toBeInTheDocument();
    });
  },
};

export const MultiPlateTabs: Story = {
  name: "Tabs: add + remove plates",
  render: () => <PlateMapEditorDefault format="96" />,
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Add a second plate via the + button", async () => {
      await userEvent.click(canvas.getByLabelText("Add Plate"));
      await waitFor(() => expect(canvas.queryByLabelText("DEMO-PLATE-002")).not.toBeNull());
    });

    await step("Switch back to the first plate via tab click", async () => {
      const firstPlateTab = canvas.getByLabelText("DEMO-PLATE-001");
      await userEvent.click(firstPlateTab);
      await waitFor(() => expect(firstPlateTab.getAttribute("data-state")).toBe("on"));
    });

    await step("Remove the second plate via its X button", async () => {
      const removeBtn = canvas.getByLabelText("Remove plate DEMO-PLATE-002");
      await userEvent.click(removeBtn);
      await waitFor(() => expect(canvas.queryByLabelText("DEMO-PLATE-002")).toBeNull());
    });
  },
};

export const ZoomReadoutHidden: Story = {
  name: "Zoom control without readout",
  render: () => {
    function Demo() {
      const [zoom, setZoom] = React.useState(1);
      return (
        <div className="p-4">
          <PlateZoomControl zoom={zoom} onZoomChange={setZoom} showReadout={false} />
        </div>
      );
    }
    return <Demo />;
  },
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Readout span is hidden", async () => {
      expect(canvas.queryByText("100%")).toBeNull();
    });

    await step("Zoom in and out cycle without the readout", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /Zoom in/i }));
      await userEvent.click(canvas.getByRole("button", { name: /Zoom out/i }));
    });
  },
};
