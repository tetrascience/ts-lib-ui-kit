import { Barcode, FileText, Tag } from "lucide-react";
import * as React from "react";
import { expect, userEvent, within } from "storybook/test";

import { getPlateMapScopedWellId, PlateMapEditor } from "./PlateMapEditor";
import { PLATE_MAP_EMPTY_WELL_FILL } from "./PlatePaintGrid";

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
    options: [
      { value: "sample", label: "Sample", swatch: ROLE_COLOR.sample },
      { value: "control", label: "Control", swatch: ROLE_COLOR.control },
      { value: "blank", label: "Blank", swatch: ROLE_COLOR.blank },
    ],
  },
  { key: "sampleId", label: "Sample ID", icon: <Barcode />, kind: "text" },
  { key: "notes", label: "Notes", icon: <FileText />, kind: "text" },
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
