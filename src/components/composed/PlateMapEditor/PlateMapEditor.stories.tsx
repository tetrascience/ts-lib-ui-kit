import {
  DndContext,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Barcode, FileText, GripVertical, Tag } from "lucide-react";
import * as React from "react";

import { getPlateMapScopedWellId, PlateMapEditor } from "./PlateMapEditor";
import { PLATE_MAP_EMPTY_WELL_FILL } from "./PlatePaintGrid";
import { PlateZoomControl } from "./PlateZoomControl";
import { WellLegend } from "./WellLegend";

import type { WellColumn, WellField, WellId, WellRecord } from "./types";
import type { DragEndEvent } from "@dnd-kit/core";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "@/components/ui/badge";
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
      <span
        aria-hidden
        className="size-3 shrink-0 rounded-full"
        style={{ backgroundColor: ROLE_COLOR[sample.role] }}
      />
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

function PlateMapEditorDefault() {
  const state = useEditorState();

  return (
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
      badges={
        <>
          <Badge variant="secondary">96-well · circle</Badge>
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
      plateToolbar={<PlateZoomControl zoom={state.zoom} onZoomChange={state.setZoom} />}
    />
  );
}

function PlateMapEditorDragDrop() {
  const state = useEditorState();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const data = active.data.current as
      | { sampleId?: string; role?: DemoWell["role"]; notes?: string }
      | undefined;
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
        plateToolbar={<PlateZoomControl zoom={state.zoom} onZoomChange={state.setZoom} />}
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
  title: "Composed/PlateMapEditor",
  component: PlateMapEditor,
  parameters: { layout: "padded" },
};

export default meta;

type Story = StoryObj<typeof PlateMapEditor<DemoWell>>;

export const Default: Story = {
  render: () => <PlateMapEditorDefault />,
};

export const DragAndDrop: Story = {
  name: "Drag-and-drop palette",
  render: () => <PlateMapEditorDragDrop />,
};
