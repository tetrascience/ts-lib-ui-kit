import { Barcode, FileText, Tag } from "lucide-react";
import * as React from "react";
import { expect, userEvent, within } from "storybook/test";

import { getPlateMapScopedWellId, PlateMapEditor } from "./PlateMapEditor";
import { PLATE_MAP_EMPTY_WELL_FILL } from "./PlatePaintGrid";
import { PlateZoomControl } from "./PlateZoomControl";
import { WellLegend } from "./WellLegend";

import type { PlateFormat, WellColumn, WellField, WellId, WellRecord } from "./types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const GROUPS = [
  {
    id: "g1",
    label: "Group A",
    wellIds: ["A01", "A02", "A03"],
    color: "var(--color-chart-1)",
    borderColor: "var(--color-primary)",
  },
  {
    id: "g2",
    label: "Group B",
    wellIds: ["B01", "B02", "B03"],
    color: "var(--color-positive)",
    borderColor: "var(--color-positive)",
  },
];

const DEMO_PLATES = ["DEMO-PLATE-001", "DEMO-PLATE-002"] as const;

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

const meta: Meta<typeof PlateMapEditor<DemoWell>> = {
  title: "Composed/PlateMapEditor",
  component: PlateMapEditor,
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj<typeof PlateMapEditor<DemoWell>>;

function DemoEditor() {
  const [values, setValues] = React.useState<Map<WellId, DemoWell>>(new Map());
  const [selection, setSelection] = React.useState<Set<WellId>>(new Set());
  const [activeGroupId, setActiveGroupId] = React.useState<string>();
  const [format, setFormat] = React.useState<PlateFormat>("96");
  const [activePlateId, setActivePlateId] = React.useState("DEMO-PLATE-001");
  const activePlateAssigned = countPlateEntries(values, activePlateId);

  const handleFormatChange = (nextFormat: PlateFormat) => {
    setFormat(nextFormat);
    setValues(new Map());
    setSelection(new Set());
    setActiveGroupId(undefined);
  };

  const handlePlateChange = (plateId: string) => {
    setActivePlateId(plateId);
    setSelection(new Set());
    setActiveGroupId(undefined);
  };

  return (
    <PlateMapEditor<DemoWell>
      format={format}
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
      title="Demo plate"
      plates={[
        ...DEMO_PLATES.map((plateId) => ({
          id: plateId,
          barcode: plateId,
          count: countPlateEntries(values, plateId),
        })),
      ]}
      activePlateId={activePlateId}
      onPlateChange={handlePlateChange}
      onAddPlate={() => {}}
      groups={GROUPS}
      activeGroupId={activeGroupId}
      onGroupClick={(group) => {
        setActiveGroupId(group.id);
        setSelection(new Set(group.wellIds ?? []));
      }}
      plateToolbar={
        <Select value={format} onValueChange={(next) => handleFormatChange(next as PlateFormat)}>
          <SelectTrigger size="sm" className="h-7 w-[112px]" aria-label="Plate format">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="96">96-well</SelectItem>
            <SelectItem value="384">384-well</SelectItem>
          </SelectContent>
        </Select>
      }
      badges={
        <>
          <Badge variant="secondary">{format}-well</Badge>
          <Badge variant="outline">{activePlateAssigned} assigned</Badge>
          <Badge variant={selection.size ? "info" : "outline"}>{selection.size} selected</Badge>
        </>
      }
      templates={[
        {
          id: "t1",
          group: "Built-in",
          label: "Standard plate",
          description: "Simple role painting",
        },
        {
          id: "t2",
          group: "Built-in",
          label: "Dose response",
          description: "Grouped dilution layout",
        },
      ]}
      onTemplateChange={() => {}}
      onClearTemplate={() => {}}
      onImportCsv={() => {}}
      onExportCsv={() => {}}
      onImportTemplate={() => {}}
      onExportTemplate={() => {}}
      footer={
        <>
          <Button variant="outline" size="sm">
            Back
          </Button>
          <Button size="sm">Save</Button>
        </>
      }
    />
  );
}

export const Default: Story = {
  render: () => <DemoEditor />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Editor renders core regions", async () => {
      expect(canvas.getByText("Demo plate")).toBeInTheDocument();
      expect(canvas.getByText("Plate")).toBeInTheDocument();
      expect(canvas.getByText("DEMO-PLATE-001")).toBeInTheDocument();
      expect(canvas.getByText("Sample manifest")).toBeInTheDocument();
      expect(canvas.getByRole("button", { name: /Actions/i })).toBeInTheDocument();
      expect(canvas.getByRole("button", { name: /Group A/ })).toBeInTheDocument();
    });

    await step("Header badges show counts", async () => {
      expect(canvas.getByRole("combobox", { name: "Plate format" })).toHaveTextContent("96-well");
      expect(canvas.getByText("0 assigned")).toBeInTheDocument();
      expect(canvas.getByText("0 selected")).toBeInTheDocument();
    });

    await step("Select all populates selection", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Select all" }));
      expect(canvas.getByText("96 selected")).toBeInTheDocument();
    });

    await step("Apply button enables once wells are selected", async () => {
      const applyBtn = canvas.getByRole("button", { name: "Apply" });
      expect(applyBtn).not.toBeDisabled();
    });

    await step("Deselect all clears selection", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Deselect all" }));
      expect(canvas.getByText("0 selected")).toBeInTheDocument();
    });
  },
};

export const Plate384: Story = {
  name: "384-well",
  render: () => {
    function Demo384() {
      const [values, setValues] = React.useState<Map<WellId, DemoWell>>(new Map());
      const [selection, setSelection] = React.useState<Set<WellId>>(new Set());
      return (
        <PlateMapEditor<DemoWell>
          format="384"
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
          title="384-well demo"
        />
      );
    }
    return <Demo384 />;
  },
};

const SAMPLE_IDS = [
  "SAMP-001",
  "SAMP-002",
  "SAMP-003",
  "SAMP-004",
  "SAMP-005",
  "SAMP-006",
];

function FullDemoEditor() {
  const seed = React.useMemo(() => {
    const map = new Map<WellId, DemoWell>();
    const plateBarcode = "DEMO-PLATE-001";
    const layouts: Array<[string, DemoWell["role"], number]> = [
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
    for (const [wellId, role, idx] of layouts) {
      map.set(getPlateMapScopedWellId(plateBarcode, wellId), {
        plateBarcode,
        role,
        sampleId: SAMPLE_IDS[idx % SAMPLE_IDS.length],
        notes: idx % 2 === 0 ? "primary" : "replicate",
      });
    }
    return map;
  }, []);

  const [values, setValues] = React.useState<Map<WellId, DemoWell>>(seed);
  const [selection, setSelection] = React.useState<Set<WellId>>(new Set());
  const [activePlateId, setActivePlateId] = React.useState("DEMO-PLATE-001");
  const [hoveredSampleId, setHoveredSampleId] = React.useState<string | null>(null);

  const plateIds = React.useMemo(() => {
    const ids = new Set<string>();
    [...values.keys()].forEach((key) => {
      const idx = key.indexOf("::");
      if (idx > 0) ids.add(key.slice(0, idx));
    });
    if (ids.size === 0) ids.add("DEMO-PLATE-001");
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
      const idx = key.indexOf("::");
      const wellId = idx > 0 ? key.slice(idx + 2) : key;
      const platePrefix = idx > 0 ? key.slice(0, idx) : null;
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

  return (
    <div className="flex flex-col gap-4">
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
        title="Full-featured plate"
        wellShape="circle"
        plates={plateOptions}
        activePlateId={activePlateId}
        onPlateChange={(plateId) => {
          setActivePlateId(plateId);
          setSelection(new Set());
        }}
        onAddPlate={() => {
          const next = `DEMO-PLATE-${String(plateIds.length + 1).padStart(3, "0")}`;
          setActivePlateId(next);
        }}
        onRemovePlate={(plateId) => {
          const next = new Map(values);
          [...next.keys()].forEach((key) => {
            if (key.startsWith(`${plateId}::`)) next.delete(key);
          });
          setValues(next);
          if (activePlateId === plateId) {
            const fallback = plateIds.find((id) => id !== plateId);
            setActivePlateId(fallback ?? "DEMO-PLATE-001");
          }
        }}
        plateSelectorVariant="tabs"
        highlightedWellIds={highlightedWellIds}
        manifestFilterable
        manifestGroupable
        badges={
          <>
            <Badge variant="secondary">circle wells</Badge>
            <Badge variant="info">tabs · filter · group</Badge>
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
        plateToolbar={<PlateZoomControl zoom={1} onZoomChange={() => {}} />}
      />
    </div>
  );
}

export const FullFeatured: Story = {
  name: "Full-featured (circle + tabs + filter + group + legend)",
  render: () => <FullDemoEditor />,
};
