import * as React from "react";
import { expect, userEvent, within } from "storybook/test";

import { Tree, TreeItem, TreeItemGroup, TreeItemLabel } from "./tree";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Tree> = {
  title: "Components/Tree",
  component: Tree,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Accessible hierarchy primitive implementing the WAI-ARIA tree view pattern.",
          "",
          "`Tree` is compound and recursive: nesting `TreeItem` → `TreeItemGroup` → `TreeItem` to any depth is the only",
          "thing needed for `aria-level`, `aria-setsize` and `aria-posinset` to come out right — they are derived from",
          "position in the React tree, not passed in. Expansion and selection each work controlled or uncontrolled.",
          "",
          "Data loading stays with the consumer; the component never fetches. Mark a node whose children have not",
          'arrived yet with `hasChildren` so it still reports `aria-expanded="false"`.',
          "",
          "**Keyboard:** `↓`/`↑` move between visible nodes across levels · `→` expands, then moves to the first child ·",
          "`←` collapses, then moves to the parent · `Home`/`End` jump to the first/last visible node · `Enter` activates.",
        ].join("\n"),
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Tree>;

/* ------------------------------------------------------------------ fixtures */

type Node = { id: string; label: string; children?: Node[] };

const FOLDERS: Node[] = [
  {
    id: "instrument-data",
    label: "Instrument Data",
    children: [
      {
        id: "lcms",
        label: "LC-MS",
        children: [
          { id: "lcms-2026-08", label: "2026-08" },
          { id: "lcms-2026-09", label: "2026-09" },
        ],
      },
      {
        id: "plate-readers",
        label: "Plate Readers",
        children: [{ id: "envision", label: "EnVision 2105" }],
      },
    ],
  },
  {
    id: "processed",
    label: "Processed",
    children: [
      { id: "ids", label: "IDS Documents" },
      { id: "decorated", label: "Decorated Files" },
    ],
  },
  { id: "archive", label: "Archive" },
];

function renderNodes(nodes: Node[]): React.ReactNode {
  return nodes.map((node) => (
    <TreeItem key={node.id} id={node.id} hasChildren={Boolean(node.children?.length)}>
      <TreeItemLabel>{node.label}</TreeItemLabel>
      {node.children ? <TreeItemGroup>{renderNodes(node.children)}</TreeItemGroup> : null}
    </TreeItem>
  ));
}

/* -------------------------------------------------------------------- stories */

export const Default: Story = {
  render: () => (
    <Tree
      aria-label="Data lake folders"
      defaultExpandedIds={new Set(["instrument-data"])}
      defaultSelectedId="lcms"
      className="max-w-xs"
    >
      {renderNodes(FOLDERS)}
    </Tree>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("ARIA state is derived from position in the tree", async () => {
      const root = canvas.getByRole("tree", { name: "Data lake folders" });
      expect(root).toBeInTheDocument();

      const instrumentData = canvas.getByRole("treeitem", { name: "Instrument Data" });
      expect(instrumentData).toHaveAttribute("aria-level", "1");
      expect(instrumentData).toHaveAttribute("aria-posinset", "1");
      expect(instrumentData).toHaveAttribute("aria-setsize", "3");
      expect(instrumentData).toHaveAttribute("aria-expanded", "true");

      const lcms = canvas.getByRole("treeitem", { name: "LC-MS" });
      expect(lcms).toHaveAttribute("aria-level", "2");
      expect(lcms).toHaveAttribute("aria-setsize", "2");
      expect(lcms).toHaveAttribute("aria-selected", "true");
    });

    await step("A leaf node reports no expanded state", async () => {
      expect(canvas.getByRole("treeitem", { name: "Archive" })).not.toHaveAttribute("aria-expanded");
    });

    await step("Collapsed subtrees are absent from the accessibility tree", async () => {
      expect(canvas.queryByRole("treeitem", { name: "IDS Documents" })).not.toBeInTheDocument();
    });
  },
};

export const Flat: Story = {
  name: "Flat (no nesting)",
  render: () => (
    <Tree aria-label="Pipelines" defaultSelectedId="fluorescence" className="max-w-xs">
      <TreeItem id="fluorescence">
        <TreeItemLabel>Fluorescence intensity</TreeItemLabel>
      </TreeItem>
      <TreeItem id="chromatography">
        <TreeItemLabel>Chromatography peak table</TreeItemLabel>
      </TreeItem>
      <TreeItem id="mass-spec">
        <TreeItemLabel>Mass spec deconvolution</TreeItemLabel>
      </TreeItem>
    </Tree>
  ),
};

export const DeepNesting: Story = {
  name: "Deep nesting (six levels)",
  render: () => {
    const ids = ["org", "site", "lab", "instrument", "run", "result"];
    const labels = [
      "Acme Pharma",
      "Cambridge site",
      "Analytical lab",
      "Xevo G2-XS",
      "Run 2026-09-01",
      "peaks.ids.json",
    ];

    const build = (index: number): React.ReactNode => (
      <TreeItem id={ids[index]} hasChildren={index < ids.length - 1}>
        <TreeItemLabel>{labels[index]}</TreeItemLabel>
        {index < ids.length - 1 ? <TreeItemGroup>{build(index + 1)}</TreeItemGroup> : null}
      </TreeItem>
    );

    return (
      <Tree aria-label="Sample lineage" defaultExpandedIds={new Set(ids)} className="max-w-xs">
        {build(0)}
      </Tree>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Depth is unbounded and aria-level keeps counting", async () => {
      expect(canvas.getByRole("treeitem", { name: "peaks.ids.json" })).toHaveAttribute("aria-level", "6");
    });
  },
};

export const EmptyGroup: Story = {
  name: "Empty group (children not loaded)",
  render: () => (
    <Tree aria-label="Folders" className="max-w-xs">
      <TreeItem id="unknown-contents" hasChildren>
        <TreeItemLabel>Not fetched yet</TreeItemLabel>
      </TreeItem>
      <TreeItem id="known-empty" hasChildren>
        <TreeItemLabel>Fetched, and empty</TreeItemLabel>
        <TreeItemGroup />
      </TreeItem>
    </Tree>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("hasChildren with nothing rendered still reports aria-expanded=false", async () => {
      const node = canvas.getByRole("treeitem", { name: "Not fetched yet" });
      expect(node).toHaveAttribute("aria-expanded", "false");

      await userEvent.click(canvas.getByText("Not fetched yet"));
      expect(node).toHaveAttribute("aria-expanded", "true");
      expect(canvas.queryByRole("group")).not.toBeInTheDocument();
    });
  },
};

export const LongLabels: Story = {
  render: () => (
    <Tree aria-label="Files" defaultExpandedIds={new Set(["batch"])} className="max-w-[260px]">
      <TreeItem id="batch" hasChildren>
        <TreeItemLabel>
          Batch-QC-2026-09-01_plate-01_fluorescence-intensity_replicate-03_operator-initials.rawdata
        </TreeItemLabel>
        <TreeItemGroup>
          <TreeItem id="batch-child">
            <TreeItemLabel>
              nested-and-also-far-too-long-to-fit-in-the-available-width_normalised_v4.ids.json
            </TreeItemLabel>
          </TreeItem>
        </TreeItemGroup>
      </TreeItem>
    </Tree>
  ),
};

export const DarkTheme: Story = {
  name: "Dark theme",
  parameters: {
    docs: {
      description: {
        story:
          "Rendered inside a local `.dark` scope so the accessibility check covers dark-mode contrast on the same run as the light-mode stories.",
      },
    },
  },
  render: () => (
    <div className="dark bg-background rounded-lg p-4">
      <Tree
        aria-label="Data lake folders"
        defaultExpandedIds={new Set(["instrument-data", "lcms"])}
        defaultSelectedId="lcms-2026-09"
        className="max-w-xs"
      >
        {renderNodes(FOLDERS)}
      </Tree>
    </div>
  ),
};

export const DisabledNode: Story = {
  name: "Disabled node",
  parameters: {
    docs: {
      description: {
        story:
          "A disabled node stays reachable by keyboard — the WAI-ARIA pattern keeps disabled nodes in the traversal order so they can be read rather than silently skipped — but cannot be selected or activated.",
      },
    },
  },
  render: () => (
    <Tree aria-label="Folders" className="max-w-xs">
      <TreeItem id="available">
        <TreeItemLabel>Available</TreeItemLabel>
      </TreeItem>
      <TreeItem id="restricted" disabled hasChildren>
        <TreeItemLabel>Restricted (no access)</TreeItemLabel>
        <TreeItemGroup>
          <TreeItem id="restricted-child">
            <TreeItemLabel>Hidden until expanded</TreeItemLabel>
          </TreeItem>
        </TreeItemGroup>
      </TreeItem>
    </Tree>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const restricted = canvas.getByRole("treeitem", { name: "Restricted (no access)" });

    await step("A disabled node reports aria-disabled and resists clicks", async () => {
      expect(restricted).toHaveAttribute("aria-disabled", "true");
      // The row is already `pointer-events: none`, so the check is deliberately bypassed to prove
      // the state guard holds too and not just the styling.
      await userEvent.click(canvas.getByText("Restricted (no access)"), { pointerEventsCheck: 0 });
      expect(restricted).toHaveAttribute("aria-selected", "false");
    });

    await step("It is still reachable by keyboard, but Enter does not activate it", async () => {
      // Clicking it did move focus — a disabled node is focusable, it just isn't selectable.
      expect(restricted).toHaveFocus();

      await userEvent.keyboard("{ArrowUp}");
      expect(canvas.getByRole("treeitem", { name: "Available" })).toHaveFocus();
      await userEvent.keyboard("{ArrowDown}");
      expect(restricted).toHaveFocus();

      await userEvent.keyboard("{Enter}");
      expect(restricted).toHaveAttribute("aria-selected", "false");
      expect(restricted).toHaveAttribute("aria-expanded", "false");
    });
  },
};

export const Keyboard: Story = {
  name: "Keyboard navigation",
  render: () => (
    <Tree aria-label="Data lake folders" className="max-w-xs">
      {renderNodes(FOLDERS)}
    </Tree>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const item = (name: string) => canvas.getByRole("treeitem", { name });

    await step("The tree is a single tab stop, entered at the first root node", async () => {
      await userEvent.tab();
      expect(item("Instrument Data")).toHaveFocus();
      expect(item("Instrument Data")).toHaveAttribute("tabindex", "0");
      expect(item("Processed")).toHaveAttribute("tabindex", "-1");
    });

    await step("Right expands, then moves to the first child", async () => {
      await userEvent.keyboard("{ArrowRight}");
      expect(item("Instrument Data")).toHaveAttribute("aria-expanded", "true");
      expect(item("Instrument Data")).toHaveFocus();

      await userEvent.keyboard("{ArrowRight}");
      expect(item("LC-MS")).toHaveFocus();
    });

    await step("Down and up cross depth levels", async () => {
      await userEvent.keyboard("{ArrowDown}");
      expect(item("Plate Readers")).toHaveFocus();
      await userEvent.keyboard("{ArrowDown}");
      expect(item("Processed")).toHaveFocus();
      await userEvent.keyboard("{ArrowUp}");
      expect(item("Plate Readers")).toHaveFocus();
    });

    await step("Left collapses, then moves to the parent", async () => {
      await userEvent.keyboard("{ArrowLeft}");
      expect(item("Instrument Data")).toHaveFocus();
      await userEvent.keyboard("{ArrowLeft}");
      expect(item("Instrument Data")).toHaveAttribute("aria-expanded", "false");
    });

    await step("End and Home jump to the last and first visible node", async () => {
      await userEvent.keyboard("{End}");
      expect(item("Archive")).toHaveFocus();
      await userEvent.keyboard("{Home}");
      expect(item("Instrument Data")).toHaveFocus();
    });

    await step("Enter activates the focused node", async () => {
      await userEvent.keyboard("{ArrowDown}{Enter}");
      expect(item("Processed")).toHaveAttribute("aria-selected", "true");
    });
  },
};

export const Activation: Story = {
  name: "Activation (click and Enter)",
  render: function ActivationTree() {
    const [log, setLog] = React.useState<string[]>([]);

    return (
      <div className="flex max-w-md flex-col gap-3">
        <Tree
          aria-label="Data lake folders"
          defaultExpandedIds={new Set(["processed"])}
          onActivate={(id) => setLog((current) => [...current, id])}
        >
          {renderNodes(FOLDERS)}
        </Tree>
        <p data-testid="activations" className="text-muted-foreground text-xs">
          onActivate: {log.join(", ") || "none"}
        </p>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const activations = () => canvas.getByTestId("activations");

    // Regression guard: `onActivate` used to fire from `Enter` only, so a consumer wiring
    // navigation to it saw clicks silently do nothing.
    await step("Clicking a node activates it", async () => {
      await userEvent.click(canvas.getByText("IDS Documents"));
      expect(activations()).toHaveTextContent("onActivate: ids");
    });

    await step("Enter activates the focused node down the same path", async () => {
      await userEvent.keyboard("{Enter}");
      expect(activations()).toHaveTextContent("onActivate: ids, ids");
    });

    await step("The chevron toggles expansion without activating", async () => {
      const archive = canvas.getByRole("treeitem", { name: "Instrument Data" });
      const chevron = archive.querySelector('[data-slot="tree-item-indicator"]');
      expect(chevron).not.toBeNull();
      await userEvent.click(chevron as Element);
      expect(archive).toHaveAttribute("aria-expanded", "true");
      expect(activations()).toHaveTextContent("onActivate: ids, ids");
    });
  },
};

export const Controlled: Story = {
  render: function ControlledTree() {
    const [expandedIds, setExpandedIds] = React.useState(new Set(["instrument-data"]));
    const [selectedId, setSelectedId] = React.useState<string | null>(null);

    return (
      <div className="flex max-w-md flex-col gap-3">
        <Tree
          aria-label="Data lake folders"
          expandedIds={expandedIds}
          onExpandedChange={setExpandedIds}
          selectedId={selectedId}
          onSelectedChange={setSelectedId}
        >
          {renderNodes(FOLDERS)}
        </Tree>
        <p data-testid="state" className="text-muted-foreground text-xs">
          selected: {selectedId ?? "none"} · expanded: {[...expandedIds].join(", ") || "none"}
        </p>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Selection and expansion are driven from consumer state", async () => {
      await userEvent.click(canvas.getByText("Processed"));
      const state = canvas.getByTestId("state");
      expect(state).toHaveTextContent("selected: processed");
      expect(state).toHaveTextContent("instrument-data, processed");
    });
  },
};
