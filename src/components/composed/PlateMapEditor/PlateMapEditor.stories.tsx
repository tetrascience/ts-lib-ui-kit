import { Barcode, FileText, Tag } from "lucide-react";
import * as React from "react";

import { getPlateMapScopedWellId, PlateMapEditor } from "./PlateMapEditor";
import { PLATE_MAP_EMPTY_WELL_FILL } from "./PlatePaintGrid";
import { PlateZoomControl } from "./PlateZoomControl";
import { WellLegend } from "./WellLegend";

import type { WellColumn, WellField, WellId, WellRecord } from "./types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "@/components/ui/badge";

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

const SAMPLE_IDS = ["SAMP-001", "SAMP-002", "SAMP-003", "SAMP-004", "SAMP-005", "SAMP-006"];

const SEED_LAYOUT: ReadonlyArray<readonly [WellId, NonNullable<DemoWell["role"]>, number]> = [
  ["A01", "sample", 0],
  ["A02", "sample", 1],
  ["A03", "sample", 2],
  ["B01", "control", 3],
  ["B02", "control", 4],
  ["C01", "blank", 5],
  ["C02", "blank", 5],
  ["D04", "sample", 0],
  ["D05", "sample", 1],
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

function PlateMapEditorDemo() {
  const seed = React.useMemo(() => {
    const map = new Map<WellId, DemoWell>();
    for (const [wellId, role, idx] of SEED_LAYOUT) {
      map.set(getPlateMapScopedWellId(INITIAL_PLATE_ID, wellId), {
        plateBarcode: INITIAL_PLATE_ID,
        role,
        sampleId: SAMPLE_IDS[idx % SAMPLE_IDS.length],
        notes: idx % 2 === 0 ? "primary" : "replicate",
      });
    }
    return map;
  }, []);

  const [values, setValues] = React.useState<Map<WellId, DemoWell>>(seed);
  const [selection, setSelection] = React.useState<Set<WellId>>(new Set());
  const [activePlateId, setActivePlateId] = React.useState(INITIAL_PLATE_ID);
  const [hoveredSampleId, setHoveredSampleId] = React.useState<string | null>(null);
  const [zoom, setZoom] = React.useState(1);

  const plateIds = React.useMemo(() => {
    const ids = new Set<string>();
    [...values.keys()].forEach((key) => {
      const idx = key.indexOf("::");
      if (idx > 0) ids.add(key.slice(0, idx));
    });
    if (ids.size === 0) ids.add(INITIAL_PLATE_ID);
    return [...ids];
  }, [values]);

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
    setActivePlateId(next);
  };

  const handleRemovePlate = (plateId: string) => {
    const next = new Map(values);
    [...next.keys()].forEach((key) => {
      if (key.startsWith(`${plateId}::`)) next.delete(key);
    });
    setValues(next);
    if (activePlateId === plateId) {
      const fallback = plateIds.find((id) => id !== plateId);
      setActivePlateId(fallback ?? INITIAL_PLATE_ID);
    }
  };

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
      title="Plate map editor"
      wellShape="circle"
      plates={plateOptions}
      activePlateId={activePlateId}
      onPlateChange={(plateId) => {
        setActivePlateId(plateId);
        setSelection(new Set());
      }}
      onAddPlate={handleAddPlate}
      onRemovePlate={handleRemovePlate}
      plateSelectorVariant="tabs"
      highlightedWellIds={highlightedWellIds}
      manifestFilterable
      manifestGroupable
      badges={
        <>
          <Badge variant="secondary">96-well · circle</Badge>
          <Badge variant="info">{selection.size} selected</Badge>
        </>
      }
      legend={
        <WellLegend
          items={legendItems}
          onHoverEnter={setHoveredSampleId}
          onHoverLeave={() => setHoveredSampleId(null)}
          emptyLabel="No samples assigned yet"
        />
      }
      plateToolbar={<PlateZoomControl zoom={zoom} onZoomChange={setZoom} />}
    />
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
  render: () => <PlateMapEditorDemo />,
};
