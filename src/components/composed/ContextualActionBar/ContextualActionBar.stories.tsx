import { Download, Tag, Trash2 } from "lucide-react";
import * as React from "react";
import { expect, userEvent, within } from "storybook/test";

import { ContextualActionBar } from "./ContextualActionBar";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { Checkbox } from "@/components/ui/checkbox";

const meta: Meta<typeof ContextualActionBar> = {
  title: "Design Patterns/ContextualActionBar",
  component: ContextualActionBar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[600px] rounded-lg border bg-card">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const ROWS = [
  { id: "1", name: "Experiment Alpha", assay: "ELISA", team: "Biology" },
  { id: "2", name: "Experiment Beta", assay: "Western Blot", team: "Chemistry" },
  { id: "3", name: "Experiment Gamma", assay: "HPLC", team: "Informatics" },
  { id: "4", name: "Experiment Delta", assay: "ELISA", team: "Biology" },
  { id: "5", name: "Experiment Epsilon", assay: "HPLC", team: "Chemistry" },
];

export const NoSelection: Story = {
  args: {
    selectionCount: 0,
    totalCount: 5,
    actions: [],
    onSelectAll: () => {},
    children: (
      <div className="grid flex-1 grid-cols-3 text-sm font-medium text-muted-foreground">
        <span>Experiment</span>
        <span>Assay</span>
        <span>Team</span>
      </div>
    ),
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1489" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Checkbox and column headers render", async () => {
      expect(canvas.getByRole("checkbox", { name: "Select all rows" })).toBeInTheDocument();
      expect(canvas.getByText("Experiment")).toBeInTheDocument();
      expect(canvas.getByText("Assay")).toBeInTheDocument();
      expect(canvas.getByText("Team")).toBeInTheDocument();
    });
  },
};

export const PartialSelection: Story = {
  args: {
    selectionCount: 2,
    totalCount: 5,
    actions: [
      { label: "Export", icon: Download, onClick: () => {} },
      { label: "Tag", icon: Tag, onClick: () => {} },
      { label: "Delete", icon: Trash2, variant: "destructive", onClick: () => {} },
    ],
    onSelectAll: () => {},
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1490" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Selection count badge and action buttons render", async () => {
      expect(canvas.getByText("2 selected")).toBeInTheDocument();
      expect(canvas.getByRole("button", { name: "Export" })).toBeInTheDocument();
      expect(canvas.getByRole("button", { name: "Tag" })).toBeInTheDocument();
      expect(canvas.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    });

    await step("Clear button appears when items are selected", async () => {
      expect(canvas.getByRole("button", { name: "Clear" })).toBeInTheDocument();
    });
  },
};

export const AllSelected: Story = {
  args: {
    selectionCount: 5,
    totalCount: 5,
    actions: [
      { label: "Export", icon: Download, onClick: () => {} },
      { label: "Tag", icon: Tag, onClick: () => {} },
      { label: "Delete", icon: Trash2, variant: "destructive", onClick: () => {} },
    ],
    onSelectAll: () => {},
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1491" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Selection count shows all items selected", async () => {
      expect(canvas.getByText("5 selected")).toBeInTheDocument();
    });

    await step("Checkbox is checked when all items selected", async () => {
      const checkbox = canvas.getByRole("checkbox", { name: "Select all rows" });
      expect(checkbox).toBeChecked();
    });
  },
};

export const Interactive: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<Set<string>>(new Set());

    const toggleRow = (id: string) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    };

    const handleSelectAll = (checked: boolean) => {
      setSelected(checked ? new Set(ROWS.map((r) => r.id)) : new Set());
    };

    return (
      <div className="divide-y divide-border">
        <ContextualActionBar
          selectionCount={selected.size}
          totalCount={ROWS.length}
          actions={[
            { label: "Export", icon: Download, onClick: () => {} },
            { label: "Tag", icon: Tag, onClick: () => {} },
            {
              label: "Delete",
              icon: Trash2,
              variant: "destructive",
              onClick: () => setSelected(new Set()),
            },
          ]}
          onSelectAll={handleSelectAll}
        >
          <div className="grid flex-1 grid-cols-3 text-sm font-medium text-muted-foreground">
            <span>Experiment</span>
            <span>Assay</span>
            <span>Team</span>
          </div>
        </ContextualActionBar>
        {ROWS.map((row) => (
          <div
            key={row.id}
            role="row"
            tabIndex={0}
            className={`flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-muted/50 ${selected.has(row.id) ? "bg-primary/5" : ""}`}
            onClick={() => toggleRow(row.id)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleRow(row.id); } }}
          >
            <Checkbox
              checked={selected.has(row.id)}
              onCheckedChange={() => toggleRow(row.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="grid flex-1 grid-cols-3 text-sm">
              <span className="font-medium">{row.name}</span>
              <span className="text-muted-foreground">{row.assay}</span>
              <span className="text-muted-foreground">{row.team}</span>
            </div>
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1492" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Interactive table with rows renders", async () => {
      expect(canvas.getByText("Experiment Alpha")).toBeInTheDocument();
      expect(canvas.getByText("Experiment Beta")).toBeInTheDocument();
    });

    await step("Selecting a row shows action bar", async () => {
      const checkboxes = canvas.getAllByRole("checkbox");
      // First checkbox after the select-all is the first row
      await userEvent.click(checkboxes[1]);
      expect(canvas.getByText("1 selected")).toBeInTheDocument();
    });
  },
};
