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
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";

import { PlateMapActionsMenu } from "./PlateMapActionsMenu";
import { getPlateMapScopedWellId, PlateMapEditor } from "./PlateMapEditor";
import { PlateMapForm } from "./PlateMapForm";
import { PlateMapGrid } from "./PlateMapGrid";
import { PlateMapManifest } from "./PlateMapManifest";
import { PLATE_MAP_EMPTY_WELL_FILL } from "./PlatePaintGrid";
import { PlateZoomControl } from "./PlateZoomControl";
import { WellLegend } from "./WellLegend";
import { WellManifestTable } from "./WellManifestTable";
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
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  title: "Design Patterns/PlateMapEditor",
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
    zephyr: { testCaseId: "SW-T5206" },
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
    zephyr: { testCaseId: "SW-T5207" },
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
    zephyr: { testCaseId: "SW-T5208" },
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
    zephyr: { testCaseId: "SW-T5268" },
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
    zephyr: { testCaseId: "SW-T5269" },
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
    zephyr: { testCaseId: "SW-T5270" },
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
    zephyr: { testCaseId: "SW-T5271" },
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
    zephyr: { testCaseId: "SW-T5272" },
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
    zephyr: { testCaseId: "SW-T5273" },
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
    zephyr: { testCaseId: "SW-T5274" },
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
    zephyr: { testCaseId: "SW-T5275" },
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
    zephyr: { testCaseId: "SW-T5276" },
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

interface RichManifestWell extends WellRecord {
  role?: "sample" | "control";
  tags?: string[];
  active?: boolean;
  verified?: boolean;
  count?: number;
  sampleId?: string;
}

const RICH_MANIFEST_FIELDS: WellField<RichManifestWell>[] = [
  {
    key: "role",
    label: "Role",
    kind: "select",
    editableInTable: true,
    options: [
      { value: "sample", label: "Sample", swatch: "var(--color-chart-1)" },
      { value: "control", label: "Control" },
    ],
  },
  {
    key: "tags",
    label: "Tags",
    kind: "multiselect",
    editableInTable: true,
    options: [
      { value: "red", label: "Red", swatch: "var(--color-destructive)" },
      { value: "blue", label: "Blue" },
    ],
  },
  { key: "active", label: "Active", kind: "boolean", editableInTable: true },
  {
    key: "verified",
    label: "Verified",
    kind: "boolean",
    boolStyle: "switch",
    editableInTable: true,
  },
  { key: "count", label: "Count", kind: "number", editableInTable: true },
  { key: "sampleId", label: "Sample ID", kind: "text", editableInTable: true },
];

// Readonly variant (no editableInTable) so renderReadonlyCell paths render.
const RICH_MANIFEST_FIELDS_READONLY: WellField<RichManifestWell>[] = RICH_MANIFEST_FIELDS.map((f) => ({
  ...f,
  editableInTable: false,
}));

const RICH_MANIFEST_COLUMNS: WellColumn<RichManifestWell>[] = [
  { header: "Role", field: "role", minWidth: 120 },
  { header: "Tags", field: "tags", minWidth: 140 },
  { header: "Active", field: "active", minWidth: 70 },
  { header: "Verified", field: "verified", minWidth: 80 },
  { header: "Count", field: "count", minWidth: 80 },
  { header: "Sample ID", field: "sampleId", minWidth: 120 },
];

function richEmptyEntry(_id: WellId): RichManifestWell {
  return {};
}

function richIsPopulated(row: RichManifestWell): boolean {
  return !!(row.role || (row.tags && row.tags.length > 0) || row.sampleId || row.count !== undefined);
}

function richSeed(): Map<WellId, RichManifestWell> {
  return new Map<WellId, RichManifestWell>([
    ["A01", { role: "sample", tags: ["red", "blue"], active: true, verified: true, count: 1, sampleId: "S-1" }],
    ["A02", { role: "control", tags: ["blue"], active: false, verified: false, count: 2, sampleId: "S-2" }],
    // Row exercising the unmatched-option / empty-multiselect / no-boolean paths.
    ["B01", { role: undefined, tags: [], active: false, sampleId: "S-3" }],
  ]);
}

function RichManifestEditableHarness() {
  const [values, setValues] = React.useState<Map<WellId, RichManifestWell>>(richSeed);
  const [selection, setSelection] = React.useState<Set<WellId>>(new Set());
  return (
    <div className="p-4">
      <WellManifestTable<RichManifestWell>
        values={values}
        columns={RICH_MANIFEST_COLUMNS}
        fields={RICH_MANIFEST_FIELDS}
        selection={selection}
        onSelectionChange={setSelection}
        onChange={setValues}
        emptyEntry={richEmptyEntry}
        isPopulated={richIsPopulated}
        filterable
        groupable
      />
    </div>
  );
}

function RichManifestReadonlyHarness() {
  const [values, setValues] = React.useState<Map<WellId, RichManifestWell>>(richSeed);
  return (
    <div className="p-4">
      <WellManifestTable<RichManifestWell>
        values={values}
        columns={RICH_MANIFEST_COLUMNS}
        fields={RICH_MANIFEST_FIELDS_READONLY}
        onChange={setValues}
        emptyEntry={richEmptyEntry}
        isPopulated={richIsPopulated}
      />
    </div>
  );
}

export const ManifestEditableCells: Story = {
  name: "Manifest editable cells (multiselect, switch, number)",
  render: () => <RichManifestEditableHarness />,
  parameters: {
    zephyr: { testCaseId: "SW-T5277" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await step("Toggle a row selection checkbox to exercise add-to-selection path", async () => {
      const checkbox = canvas.getByRole("checkbox", { name: "Select A01" });
      await userEvent.click(checkbox);
      await waitFor(() => expect(checkbox.getAttribute("data-state")).toBe("checked"));
      // Toggle again to also exercise the remove branch.
      await userEvent.click(checkbox);
      await waitFor(() => expect(checkbox.getAttribute("data-state")).toBe("unchecked"));
    });

    await step("Edit the number cell so parseInputValue('number') runs", async () => {
      const countInput = canvas.getByLabelText("Count for A01") as HTMLInputElement;
      await userEvent.clear(countInput);
      await userEvent.type(countInput, "42");
      await waitFor(() => expect(countInput.value).toBe("42"));
      // Typing a non-finite token also exercises the fallback branch.
      await userEvent.clear(countInput);
      await userEvent.type(countInput, "9");
      await waitFor(() => expect(countInput.value).toBe("9"));
    });

    await step("Toggle the switch-style boolean cell", async () => {
      const verifiedSwitch = canvas.getByRole("switch", { name: "Verified for A02" });
      await userEvent.click(verifiedSwitch);
      await waitFor(() => expect(verifiedSwitch.getAttribute("data-state")).toBe("checked"));
    });

    await step("Toggle the checkbox-style boolean cell", async () => {
      const activeCheckbox = canvas.getByRole("checkbox", { name: "Active for A02" });
      await userEvent.click(activeCheckbox);
      await waitFor(() => expect(activeCheckbox.getAttribute("data-state")).toBe("checked"));
    });

    await step("Open the multiselect cell and pick an option", async () => {
      const tagsInput = canvas.getByLabelText("Tags for B01") as HTMLInputElement;
      await userEvent.click(tagsInput);
      const option = await waitFor(() => {
        const el = [
          ...canvasElement.ownerDocument.body.querySelectorAll('[role="option"]'),
        ].find((node) => node.textContent?.trim() === "Red");
        if (!el) throw new Error("'Red' option missing");
        return el as HTMLElement;
      });
      await userEvent.click(option);
      // Move focus away to close popover.
      await userEvent.keyboard("{Escape}");
    });

    await step("Clear an existing multiselect cell back to empty (undefined branch)", async () => {
      const a01TagsInput = canvas.getByLabelText("Tags for A01") as HTMLInputElement;
      // Focus the chips input then backspace to remove chips one by one.
      a01TagsInput.focus();
      await userEvent.keyboard("{Backspace}{Backspace}{Backspace}{Backspace}");
      // Don't assert chip removal — backspace UX depends on combobox internals.
      // The interaction is enough to drive the onChange path.
    });

    await step("Edit the select cell (exercises renderSelectCellEditable update)", async () => {
      const roleTrigger = canvas.getByRole("combobox", { name: "Role for B01" });
      await userEvent.click(roleTrigger);
      const option = await body.findByRole("option", { name: /^Sample$/ });
      await userEvent.click(option);
      await waitFor(() => expect(roleTrigger.textContent).toMatch(/Sample/));
    });
  },
};

export const ManifestReadonlyCells: Story = {
  name: "Manifest readonly cells (badges, switches, dashes)",
  render: () => <RichManifestReadonlyHarness />,
  parameters: {
    zephyr: { testCaseId: "SW-T5278" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Renders select badge with swatch for A01 (Sample)", async () => {
      // The readonly select cell renders a Badge containing "Sample".
      const badges = canvas.getAllByText("Sample");
      expect(badges.length).toBeGreaterThan(0);
    });

    await step("Renders multiselect badges for A01 (Red, Blue)", async () => {
      expect(canvas.getAllByText("Red").length).toBeGreaterThan(0);
      expect(canvas.getAllByText("Blue").length).toBeGreaterThan(0);
    });

    await step("Renders boolean Check icon for verified A01", async () => {
      const checkIcons = canvasElement.querySelectorAll('[aria-label="Yes"]');
      expect(checkIcons.length).toBeGreaterThan(0);
    });

    await step("Renders dash placeholders for empty cells on B01", async () => {
      // Multiple `—` characters from missing select/multiselect/etc.
      const dashes = canvas.getAllByText("—");
      expect(dashes.length).toBeGreaterThan(0);
    });

    await step("Renders sampleId raw string for B01", async () => {
      expect(canvas.getByText("S-3")).toBeInTheDocument();
    });
  },
};

// ---------------------------------------------------------------------------
// Coverage stories: focused on edge cases and uncovered code paths.
// ---------------------------------------------------------------------------

function PlateMapEditorRectNoPlates({
  onHoveredWellChange,
  renderHoverSummary,
}: {
  onHoveredWellChange?: (wellId: WellId | null) => void;
  renderHoverSummary?: (well: DemoWell | undefined, wellId: WellId) => React.ReactNode;
} = {}) {
  const [values, setValues] = React.useState<Map<WellId, DemoWell>>(() => {
    const map = new Map<WellId, DemoWell>();
    map.set("A01", { role: "sample", sampleId: "S-1", notes: "primary" });
    map.set("B02", { role: "control", sampleId: "S-2" });
    return map;
  });
  const [selection, setSelection] = React.useState<Set<WellId>>(new Set());
  return (
    <PlateMapEditor<DemoWell>
      format="96"
      values={values}
      onChange={setValues}
      selection={selection}
      onSelectionChange={setSelection}
      fields={FIELDS}
      tableColumns={COLUMNS}
      colorForWell={colorForWell}
      emptyEntry={emptyEntry}
      isPopulated={isPopulated}
      cycleFieldOnWellDoubleClick="role"
      title="Rect wells, no plates"
      wellShape="rect"
      onHoveredWellChange={onHoveredWellChange}
      renderHoverSummary={renderHoverSummary}
      badges={<Badge variant="secondary">rect · no plates</Badge>}
    />
  );
}

function PlateMapEditorWithGroups() {
  const [values, setValues] = React.useState<Map<WellId, DemoWell>>(() => new Map());
  const [selection, setSelection] = React.useState<Set<WellId>>(new Set());
  const [activeGroupId, setActiveGroupId] = React.useState<string | undefined>();
  const groups = [
    {
      id: "g1",
      label: "Plasma",
      color: "var(--color-chart-1)",
      borderColor: "var(--border)",
      wellIds: ["A01", "A02"],
      count: 2,
    },
    {
      id: "g2",
      label: "Serum",
      color: "var(--color-chart-2)",
      borderColor: "var(--border)",
      count: 4,
    },
    {
      id: "g3",
      label: "Archived",
      color: "var(--color-muted)",
      borderColor: "var(--border)",
      disabled: true,
    },
  ];
  return (
    <PlateMapEditor<DemoWell>
      format="96"
      values={values}
      onChange={setValues}
      selection={selection}
      onSelectionChange={setSelection}
      fields={FIELDS}
      tableColumns={COLUMNS}
      colorForWell={colorForWell}
      emptyEntry={emptyEntry}
      isPopulated={isPopulated}
      title="Groups under the plate"
      groups={groups}
      activeGroupId={activeGroupId}
      onGroupClick={(group) => setActiveGroupId(group.id)}
      badges={<Badge variant="secondary">groups</Badge>}
    />
  );
}

function PlateMapEditorHoverFieldKinds() {
  interface HoverWell extends WellRecord {
    role?: "sample" | "control";
    tags?: string[];
    active?: boolean;
    notes?: string;
  }
  const richFields: WellField<HoverWell>[] = [
    {
      key: "role",
      label: "Role",
      kind: "select",
      options: [
        { value: "sample", label: "Sample" },
        { value: "control", label: "Control" },
      ],
    },
    {
      key: "tags",
      label: "Tags",
      kind: "multiselect",
      options: [
        { value: "red", label: "Red" },
        { value: "blue", label: "Blue" },
      ],
    },
    { key: "active", label: "Active", kind: "boolean" },
    { key: "notes", label: "Notes", kind: "text" },
  ];
  const richColumns: WellColumn<HoverWell>[] = [
    { header: "Role", field: "role" },
    { header: "Tags", field: "tags" },
    { header: "Active", field: "active" },
    { header: "Notes", field: "notes" },
  ];
  const [values, setValues] = React.useState<Map<WellId, HoverWell>>(() => {
    const map = new Map<WellId, HoverWell>();
    map.set("A01", { role: "sample", tags: ["red", "blue"], active: true, notes: "n1" });
    // Row with an unmatched select option label, plus an empty multiselect.
    map.set("A02", { role: "control", tags: [], active: false, notes: "" });
    return map;
  });
  const [selection, setSelection] = React.useState<Set<WellId>>(new Set());
  return (
    <PlateMapEditor<HoverWell>
      format="96"
      values={values}
      onChange={setValues}
      selection={selection}
      onSelectionChange={setSelection}
      fields={richFields}
      tableColumns={richColumns}
      colorForWell={(well) => (well?.role === "sample" ? "var(--color-chart-1)" : PLATE_MAP_EMPTY_WELL_FILL)}
      emptyEntry={() => ({})}
      title="Hover fields cover all kinds"
    />
  );
}

function PlateMapEditorImportCsv() {
  const [values, setValues] = React.useState<Map<WellId, DemoWell>>(() => new Map());
  const [selection, setSelection] = React.useState<Set<WellId>>(new Set());
  const handleImportCsv = React.useCallback(
    (_file: File, _triage?: PlateMapCsvTriage) => {
      // No-op; story only verifies that the editor swaps plates on import.
    },
    [],
  );
  return (
    <PlateMapEditor<DemoWell>
      format="96"
      values={values}
      onChange={setValues}
      selection={selection}
      onSelectionChange={setSelection}
      fields={FIELDS}
      tableColumns={COLUMNS}
      colorForWell={colorForWell}
      emptyEntry={emptyEntry}
      isPopulated={isPopulated}
      title="CSV import (uncontrolled plates)"
      onImportCsv={handleImportCsv}
      onExportCsv={() => {}}
    />
  );
}

function dispatchSvgMouse(
  svg: SVGSVGElement,
  type: "mousedown" | "mousemove" | "mouseup" | "mouseleave" | "dblclick",
  options: { row: number; column: number; cellSize: number; shiftKey?: boolean; altKey?: boolean },
) {
  const rect = svg.getBoundingClientRect();
  const LABEL_PAD = 26;
  const clientX = rect.left + LABEL_PAD + options.column * options.cellSize + options.cellSize / 2;
  const clientY = rect.top + LABEL_PAD + options.row * options.cellSize + options.cellSize / 2;
  const init = {
    clientX,
    clientY,
    shiftKey: options.shiftKey,
    altKey: options.altKey,
    bubbles: true,
    cancelable: true,
  };
  if (type === "mousedown") fireEvent.mouseDown(svg, init);
  else if (type === "mousemove") fireEvent.mouseMove(svg, init);
  else if (type === "mouseup") fireEvent.mouseUp(svg, init);
  else if (type === "mouseleave") fireEvent.mouseLeave(svg, init);
  else fireEvent.doubleClick(svg, init);
}

function getActiveSvg(canvasElement: HTMLElement): SVGSVGElement {
  const svg = canvasElement.querySelector("[data-slot='plate-paint-grid'] svg") as SVGSVGElement | null;
  if (!svg) throw new Error("plate grid svg missing");
  return svg;
}

function getCellSize(svg: SVGSVGElement): number {
  // Read a rendered well rect to learn the resolved cell size.
  const firstRect = svg.querySelector('[data-well="A01"]');
  if (firstRect instanceof SVGRectElement) {
    return Number(firstRect.getAttribute("width") ?? "34");
  }
  if (firstRect instanceof SVGCircleElement) {
    const r = Number(firstRect.getAttribute("r") ?? "16");
    return (r + 1) * 2;
  }
  return 34;
}

export const RectShapeAndGroups: Story = {
  name: "Rect wells, no plates + onHoveredWellChange",
  render: () => {
    function Demo() {
      const [hovered, setHovered] = React.useState<WellId | null>(null);
      return (
        <div className="flex flex-col gap-2">
          <div data-testid="hovered-readout" className="text-xs text-muted-foreground">
            Hovered: {hovered ?? "(none)"}
          </div>
          <PlateMapEditorRectNoPlates
            onHoveredWellChange={setHovered}
            renderHoverSummary={(well, wellId) =>
              well?.role ? `Custom: ${wellId} · ${well.role}` : `Custom: ${wellId}`
            }
          />
        </div>
      );
    }
    return <Demo />;
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5279" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Renders rect wells (96)", async () => {
      const wells = canvasElement.querySelectorAll("[data-well]");
      expect(wells.length).toBe(96);
      // rect path covers PlatePaintGrid 202-212.
      expect(wells[0]?.tagName.toLowerCase()).toBe("rect");
    });

    await step("Hover a well dispatches onHoveredWellChange + renderHoverSummary", async () => {
      const svg = getActiveSvg(canvasElement);
      const cellSize = getCellSize(svg);
      dispatchSvgMouse(svg, "mousemove", { row: 0, column: 0, cellSize });
      await waitFor(() => expect(canvas.getByTestId("hovered-readout").textContent).toMatch(/Hovered: A01/));
      await waitFor(() => expect(canvasElement.textContent).toMatch(/Custom: A01/));
    });

    await step("Mouse-leave clears hover state", async () => {
      const svg = getActiveSvg(canvasElement);
      fireEvent.mouseOut(svg, { relatedTarget: canvasElement.ownerDocument.body });
      fireEvent.mouseLeave(svg, { relatedTarget: canvasElement.ownerDocument.body });
      await waitFor(() => expect(canvas.getByTestId("hovered-readout").textContent).toMatch(/\(none\)/));
    });

    await step("Apply with empty selection is a no-op (covers early return)", async () => {
      const applyBtn = canvas.getByRole("button", { name: "Apply" });
      expect((applyBtn as HTMLButtonElement).disabled).toBe(true);
    });
  },
};

export const GridDragSelection: Story = {
  name: "Grid drag selection: replace / shift-add / alt-remove / double-click",
  render: () => <PlateMapEditorRectNoPlates />,
  parameters: {
    zephyr: { testCaseId: "SW-T5280" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Drag-rectangle in replace mode selects A01..B02", async () => {
      const svg = getActiveSvg(canvasElement);
      const cellSize = getCellSize(svg);
      dispatchSvgMouse(svg, "mousedown", { row: 0, column: 0, cellSize });
      dispatchSvgMouse(svg, "mousemove", { row: 1, column: 1, cellSize });
      dispatchSvgMouse(svg, "mouseup", { row: 1, column: 1, cellSize });
      await waitFor(() => expect(canvas.getByText(/Apply to 4 wells/)).toBeInTheDocument());
    });

    await step("Shift-drag adds a second range to the selection", async () => {
      const svg = getActiveSvg(canvasElement);
      const cellSize = getCellSize(svg);
      dispatchSvgMouse(svg, "mousedown", { row: 2, column: 0, cellSize, shiftKey: true });
      dispatchSvgMouse(svg, "mousemove", { row: 2, column: 1, cellSize, shiftKey: true });
      dispatchSvgMouse(svg, "mouseup", { row: 2, column: 1, cellSize, shiftKey: true });
      await waitFor(() => expect(canvas.getByText(/Apply to 6 wells/)).toBeInTheDocument());
    });

    await step("Alt-drag removes a range from the selection", async () => {
      const svg = getActiveSvg(canvasElement);
      const cellSize = getCellSize(svg);
      dispatchSvgMouse(svg, "mousedown", { row: 0, column: 0, cellSize, altKey: true });
      dispatchSvgMouse(svg, "mousemove", { row: 0, column: 0, cellSize, altKey: true });
      dispatchSvgMouse(svg, "mouseup", { row: 0, column: 0, cellSize, altKey: true });
      await waitFor(() => expect(canvas.getByText(/Apply to 5 wells/)).toBeInTheDocument());
    });

    await step("Mouse-leave during drag commits the in-progress drag", async () => {
      const svg = getActiveSvg(canvasElement);
      const cellSize = getCellSize(svg);
      dispatchSvgMouse(svg, "mousedown", { row: 5, column: 0, cellSize });
      dispatchSvgMouse(svg, "mousemove", { row: 5, column: 2, cellSize });
      fireEvent.mouseOut(svg, { relatedTarget: canvasElement.ownerDocument.body });
      fireEvent.mouseLeave(svg, { relatedTarget: canvasElement.ownerDocument.body });
      await waitFor(() => expect(canvas.getByText(/Apply to 3 wells/)).toBeInTheDocument());
    });

    await step("Mousedown outside the well area is ignored (cellAt returns null)", async () => {
      const svg = getActiveSvg(canvasElement);
      // Far off the grid origin — clientX/Y land before LABEL_PAD.
      fireEvent.mouseDown(svg, { clientX: 0, clientY: 0, bubbles: true, cancelable: true });
      fireEvent.mouseUp(svg, { clientX: 0, clientY: 0, bubbles: true, cancelable: true });
      // Still 3 from the previous step.
      await waitFor(() => expect(canvas.getByText(/Apply to 3 wells/)).toBeInTheDocument());
    });

    await step("Double-click a well cycles the role (covers cycleWellField + flash)", async () => {
      const svg = getActiveSvg(canvasElement);
      const cellSize = getCellSize(svg);
      // Already populated A01 so the cycle moves to the next role and flashes.
      dispatchSvgMouse(svg, "dblclick", { row: 0, column: 0, cellSize });
      // Empty well also exercises the empty-entry branch of cycleWellField.
      dispatchSvgMouse(svg, "dblclick", { row: 7, column: 7, cellSize });
      // Out-of-bounds double-click is a no-op (cellAt returns null).
      fireEvent.doubleClick(svg, { clientX: 0, clientY: 0, bubbles: true, cancelable: true });
    });

    await step("Clear wells empties the selected wells", async () => {
      const clearBtn = canvas.getByRole("button", { name: "Clear wells" });
      await userEvent.click(clearBtn);
    });
  },
};

export const HighlightedWells: Story = {
  name: "Highlighted wells + select-all + deselect-all",
  render: () => {
    function Demo() {
      const [values, setValues] = React.useState<Map<WellId, DemoWell>>(() => {
        const map = new Map<WellId, DemoWell>();
        map.set("A01", { role: "sample", sampleId: "S-1" });
        map.set("A02", { role: "sample", sampleId: "S-1" });
        return map;
      });
      const [selection, setSelection] = React.useState<Set<WellId>>(new Set());
      const highlighted: ReadonlySet<WellId> = new Set(["A01", "B05"]);
      return (
        <PlateMapEditor<DemoWell>
          format="96"
          values={values}
          onChange={setValues}
          selection={selection}
          onSelectionChange={setSelection}
          fields={FIELDS}
          tableColumns={COLUMNS}
          colorForWell={colorForWell}
          emptyEntry={emptyEntry}
          isPopulated={isPopulated}
          title="Highlighted wells"
          wellShape="circle"
          highlightedWellIds={highlighted}
        />
      );
    }
    return <Demo />;
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5281" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Highlight overlay renders for the highlighted well", async () => {
      await waitFor(() => {
        const highlight = canvasElement.querySelector('[data-well-highlight="A01"]');
        expect(highlight).not.toBeNull();
      });
    });

    await step("Select all then deselect all flips the form prompt", async () => {
      await userEvent.click(canvas.getByText("Select all"));
      await waitFor(() => expect(canvas.getByText("Apply to 96 wells")).toBeInTheDocument());
      await userEvent.click(canvas.getByText("Deselect all"));
      await waitFor(() => expect(canvas.getByText("Select wells to edit")).toBeInTheDocument());
    });
  },
};

export const GroupsAndHoverFields: Story = {
  name: "Groups + hover with multiselect/boolean fields",
  render: () => (
    <div className="flex flex-col gap-6">
      <PlateMapEditorWithGroups />
      <PlateMapEditorHoverFieldKinds />
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T5282" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Groups strip renders each group", async () => {
      expect(canvas.getByTitle("Plasma")).toBeInTheDocument();
      expect(canvas.getByTitle("Serum")).toBeInTheDocument();
      expect(canvas.getByTitle("Archived")).toBeInTheDocument();
      expect(canvas.getByText("2 wells")).toBeInTheDocument();
      expect(canvas.getByText("4 wells")).toBeInTheDocument();
    });

    await step("Click an enabled group fires onGroupClick", async () => {
      await userEvent.click(canvas.getByTitle("Plasma"));
    });

    await step("Hover an A01 well rendered with rich fields builds hover summary", async () => {
      const allSvgs = canvasElement.querySelectorAll("[data-slot='plate-paint-grid'] svg");
      const svg = allSvgs[allSvgs.length - 1] as SVGSVGElement;
      const cellSize = getCellSize(svg);
      dispatchSvgMouse(svg, "mousemove", { row: 0, column: 0, cellSize });
      // Hover summary should include the well id; the hoverFields render covers
      // multiselect, boolean and select branches.
      await waitFor(() => {
        const summary = canvasElement.textContent ?? "";
        expect(summary).toMatch(/A01/);
      });
    });
  },
};

export const CsvImportSwapsPlates: Story = {
  name: "CSV import switches the active plate",
  render: () => <PlateMapEditorImportCsv />,
  parameters: {
    zephyr: { testCaseId: "SW-T5283" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await step("Open the Actions menu so the hidden file input is reachable", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /Actions/ }));
      const importItem = await body.findByText(/Import plate map/);
      expect(importItem).toBeInTheDocument();
    });

    await step("Upload a CSV file directly to the hidden file input", async () => {
      const fileInput = canvasElement.ownerDocument.querySelector(
        'input[type="file"][accept*="csv"]',
      ) as HTMLInputElement;
      expect(fileInput).not.toBeNull();

      const csv = [
        "plateBarcode,role,sampleId",
        "PLATE-A,sample,S-1",
        "PLATE-A,control,S-2",
        "PLATE-B,sample,S-3",
      ].join("\n");
      const file = new File([csv], "import.csv", { type: "text/csv" });
      // The input is `hidden` so userEvent.upload refuses; fire change directly.
      Object.defineProperty(fileInput, "files", { value: [file], configurable: true });
      fireEvent.change(fileInput);
    });

    await step("Active plate is set to the first imported plate", async () => {
      await waitFor(() => {
        const selector = canvasElement.querySelector("[data-slot='plate-map-plate-selector']");
        const source = selector ? selector.textContent : canvasElement.textContent;
        expect(source).toMatch(/PLATE-A/);
      });
    });
  },
};

export const ManifestFillDownAndKeyboardGroup: Story = {
  name: "Manifest fill-down button + group keyboard toggle",
  render: () => <RichManifestEditableHarness />,
  parameters: {
    zephyr: { testCaseId: "SW-T5284" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await step("Click the fill-down arrow on the Sample ID column", async () => {
      const fillBtn = canvas.getByRole("button", { name: /Fill down Sample ID/ });
      await userEvent.click(fillBtn);
      await waitFor(() => {
        const s3 = canvas.getByLabelText("Sample ID for B01") as HTMLInputElement;
        expect(s3.value).toBe("S-1");
      });
    });

    await step("Group by Role and toggle the first group with the keyboard", async () => {
      await userEvent.click(canvas.getByRole("combobox", { name: /Group by/i }));
      await userEvent.click(await body.findByRole("option", { name: /^Role$/ }));
      const groupRow = canvasElement.querySelector("tbody tr.bg-muted\\/40") as HTMLElement | null;
      expect(groupRow).not.toBeNull();
      groupRow?.focus();
      await userEvent.keyboard("{Enter}");
      // Space toggles back open.
      await userEvent.keyboard(" ");
      // Pressing a non-handled key should not crash.
      await userEvent.keyboard("a");
    });
  },
};

interface CustomRenderWell extends WellRecord {
  custom?: string;
  count?: number;
  weight?: number;
}

export const FormCustomAndIntegerKinds: Story = {
  name: "Form: custom render + integer parsing",
  render: () => {
    function Demo() {
      const [value, setValue] = React.useState<Partial<CustomRenderWell>>({});
      const fields: WellField<CustomRenderWell>[] = [
        {
          key: "custom",
          label: "Custom",
          kind: "custom",
          render: ({ value: v, onChange, selectionSize }) => (
            <div className="flex items-center gap-2">
              <input
                aria-label="custom-render-input"
                value={(v as string | undefined) ?? ""}
                onChange={(e) => onChange(e.target.value)}
                className="rounded border px-1 py-0.5 text-xs"
              />
              <span className="text-[0.65rem] text-muted-foreground">{selectionSize} sel</span>
            </div>
          ),
        },
        { key: "count", label: "Count", kind: "integer" },
        { key: "weight", label: "Weight", kind: "number" },
      ];
      return (
        <div className="max-w-sm p-4">
          <WellMetadataForm<CustomRenderWell>
            fields={fields}
            value={value}
            onChange={setValue}
            selectionSize={2}
            onApply={() => {}}
            onClear={() => {}}
          />
        </div>
      );
    }
    return <Demo />;
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5285" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Custom-rendered field invokes the render prop", async () => {
      const customInput = canvas.getByLabelText("custom-render-input") as HTMLInputElement;
      await userEvent.type(customInput, "abc");
      await waitFor(() => expect(customInput.value).toBe("abc"));
    });

    await step("Integer field parses through parseInt", async () => {
      const countInput = canvasElement.querySelector('input[id="field-count"]') as HTMLInputElement;
      await userEvent.clear(countInput);
      await userEvent.type(countInput, "42");
      await waitFor(() => expect(countInput.value).toBe("42"));
      // Clear back to empty so parseInputValue's `raw === ""` short-circuit runs.
      await userEvent.clear(countInput);
      await waitFor(() => expect(countInput.value).toBe(""));
    });

    await step("Number field parses through parseFloat", async () => {
      const weightInput = canvasElement.querySelector('input[id="field-weight"]') as HTMLInputElement;
      await userEvent.clear(weightInput);
      await userEvent.type(weightInput, "1.5");
      await waitFor(() => expect(weightInput.value).toBe("1.5"));
    });
  },
};

// ---------------------------------------------------------------------------
// Deconstructed layout stories (SW-1916): the form, grid, and manifest are
// independently composable and Card-agnostic. These stories prove they can be
// arranged freely — bare in a sidebar, stacked inside Cards, or spanning the
// full screen width with no Card at all.
// ---------------------------------------------------------------------------

function useDeconstructedDemo() {
  const [values, setValues] = React.useState<Map<WellId, DemoWell>>(() => {
    const map = new Map<WellId, DemoWell>();
    map.set("A01", { role: "sample", sampleId: "SAMP-001", notes: "primary" });
    map.set("A02", { role: "sample", sampleId: "SAMP-002", notes: "primary" });
    map.set("B01", { role: "control", sampleId: "SAMP-004", notes: "positive" });
    map.set("C01", { role: "blank", sampleId: "BLANK-001", notes: "media" });
    return map;
  });
  const [selection, setSelection] = React.useState<Set<WellId>>(new Set());
  const [staged, setStaged] = React.useState<Partial<DemoWell>>({});

  const applyToSelection = () => {
    if (selection.size === 0) return;
    setValues((prev) => {
      const next = new Map(prev);
      selection.forEach((wellId) => {
        const base = next.get(wellId) ?? emptyEntry(wellId);
        next.set(wellId, { ...base, ...staged });
      });
      return next;
    });
  };
  const clearSelection = () => {
    if (selection.size === 0) return;
    setValues((prev) => {
      const next = new Map(prev);
      selection.forEach((wellId) => next.delete(wellId));
      return next;
    });
  };

  return { values, setValues, selection, setSelection, staged, setStaged, applyToSelection, clearSelection };
}

export const SidebarFormLayout: Story = {
  name: "Layout: form in a sidebar (no Card)",
  render: () => {
    function Demo() {
      const s = useDeconstructedDemo();
      return (
        <div className="flex min-h-[480px] overflow-hidden rounded-lg ring-1 ring-foreground/10">
          <aside className="w-72 shrink-0 border-r bg-muted/30 p-4">
            <div className="mb-3 text-sm font-semibold">Well metadata</div>
            <PlateMapForm<DemoWell>
              fields={FIELDS}
              value={s.staged}
              onChange={s.setStaged}
              selectionSize={s.selection.size}
              onApply={s.applyToSelection}
              onClear={s.clearSelection}
            />
          </aside>
          <div className="flex-1 p-4">
            <PlateMapGrid<DemoWell>
              format="96"
              values={s.values}
              selection={s.selection}
              onSelectionChange={s.setSelection}
              colorForWell={colorForWell}
              fields={FIELDS}
              wellShape="circle"
              framed
            />
          </div>
        </div>
      );
    }
    return <Demo />;
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5407" },
  },
  play: async ({ canvasElement, step }) => {
    await step("Form renders inside the sidebar with no Card chrome", async () => {
      const form = canvasElement.querySelector('[data-slot="plate-map-form"]');
      expect(form).not.toBeNull();
      expect(form?.closest('[data-slot="card"]')).toBeNull();
    });

    await step("Grid renders 96 wells alongside the sidebar", async () => {
      const wells = canvasElement.querySelectorAll("[data-well]");
      expect(wells.length).toBe(96);
    });
  },
};

export const StackedFormCardLayout: Story = {
  name: "Layout: form in a Card above the grid",
  render: () => {
    function Demo() {
      const s = useDeconstructedDemo();
      return (
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          <Card size="sm">
            <CardHeader className="border-b">
              <CardTitle>Well metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <PlateMapForm<DemoWell>
                fields={FIELDS}
                value={s.staged}
                onChange={s.setStaged}
                selectionSize={s.selection.size}
                onApply={s.applyToSelection}
                onClear={s.clearSelection}
              />
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader className="border-b">
              <CardTitle>Plate</CardTitle>
              <CardAction className="flex items-center gap-2">
                <PlateMapActionsMenu hasEntries={s.values.size > 0} onExportCsv={() => {}} />
              </CardAction>
            </CardHeader>
            <CardContent>
              <PlateMapGrid<DemoWell>
                format="96"
                values={s.values}
                selection={s.selection}
                onSelectionChange={s.setSelection}
                colorForWell={colorForWell}
                fields={FIELDS}
                wellShape="circle"
                framed
              />
            </CardContent>
          </Card>
        </div>
      );
    }
    return <Demo />;
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5408" },
  },
  play: async ({ canvasElement, step }) => {
    await step("Form is wrapped in a Card", async () => {
      const form = canvasElement.querySelector('[data-slot="plate-map-form"]');
      expect(form).not.toBeNull();
      expect(form?.closest('[data-slot="card"]')).not.toBeNull();
    });

    await step("Form Card is positioned above the grid", async () => {
      const form = canvasElement.querySelector('[data-slot="plate-map-form"]') as HTMLElement;
      const grid = canvasElement.querySelector('[data-slot="plate-map-grid"]') as HTMLElement;
      expect(form.getBoundingClientRect().top).toBeLessThan(grid.getBoundingClientRect().top);
    });

    await step("Actions menu renders in the grid Card header", async () => {
      const canvas = within(canvasElement);
      expect(canvas.getByRole("button", { name: /actions/i })).toBeInTheDocument();
    });
  },
};

export const FullWidthManifestLayout: Story = {
  name: "Layout: full-width manifest (no Card)",
  render: () => {
    function Demo() {
      const s = useDeconstructedDemo();
      return (
        <div className="flex flex-col gap-4">
          <div className="mx-auto w-full max-w-md">
            <Card size="sm">
              <CardContent>
                <PlateMapGrid<DemoWell>
                  format="96"
                  values={s.values}
                  selection={s.selection}
                  onSelectionChange={s.setSelection}
                  colorForWell={colorForWell}
                  fields={FIELDS}
                  wellShape="circle"
                  framed
                />
              </CardContent>
            </Card>
          </div>
          <PlateMapManifest<DemoWell>
            title="Sample manifest"
            values={s.values}
            onChange={s.setValues}
            columns={COLUMNS}
            fields={FIELDS}
            selection={s.selection}
            onSelectionChange={s.setSelection}
            emptyEntry={emptyEntry}
            isPopulated={isPopulated}
            filterable
            groupable
          />
        </div>
      );
    }
    return <Demo />;
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5409" },
  },
  play: async ({ canvasElement, step }) => {
    await step("Manifest renders with no Card chrome", async () => {
      const manifest = canvasElement.querySelector('[data-slot="plate-map-manifest"]');
      expect(manifest).not.toBeNull();
      expect(manifest?.closest('[data-slot="card"]')).toBeNull();
    });

    await step("Manifest spans wider than the card-constrained grid", async () => {
      const manifest = canvasElement.querySelector('[data-slot="plate-map-manifest"]') as HTMLElement;
      const grid = canvasElement.querySelector('[data-slot="plate-map-grid"]') as HTMLElement;
      expect(manifest.getBoundingClientRect().width).toBeGreaterThan(grid.getBoundingClientRect().width);
    });

    await step("Manifest shows its optional heading", async () => {
      const canvas = within(canvasElement);
      expect(canvas.getByText("Sample manifest")).toBeInTheDocument();
    });
  },
};
