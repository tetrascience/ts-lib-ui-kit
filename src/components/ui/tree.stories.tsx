import { FileTextIcon, FlaskConicalIcon, FolderIcon, FolderOpenIcon } from "lucide-react";
import * as React from "react";
import { expect, userEvent, within } from "storybook/test";

import { Tree, TreeItem, TreeItemGroup, TreeItemLabel, useTreeItem } from "./tree";

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
          "",
          "**Icons:** pass a decorative icon to `TreeItemLabel`'s `icon` prop. It is hidden from assistive tech, so",
          "anything a screen reader must convey belongs in the label text. Read `expanded` from `useTreeItem()` to swap",
          "open and closed folder icons, as `FolderNodeIcon` does below.",
        ].join("\n"),
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Tree>;

/* ------------------------------------------------------------------ fixtures */

/** Reads its own node's state from context to swap open/closed folder icons. */
function FolderNodeIcon() {
  const { expanded } = useTreeItem();
  return expanded ? <FolderOpenIcon /> : <FolderIcon />;
}

type Node = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: Node[];
  /** Set on a node whose children exist but have not been fetched yet. */
  unloaded?: boolean;
  disabled?: boolean;
};

const FOLDERS: Node[] = [
  {
    id: "instrument-data",
    label: "Instrument Data",
    children: [
      {
        id: "lcms",
        label: "LC-MS",
        children: [
          { id: "lcms-2026-08", label: "2026-08", icon: <FileTextIcon /> },
          {
            id: "lcms-long",
            label: "Batch-QC-2026-09-01_plate-01_fluorescence-intensity_replicate-03_operator-initials.rawdata",
            icon: <FileTextIcon />,
          },
        ],
      },
      { id: "plate-readers", label: "Plate Readers", unloaded: true },
      { id: "legacy", label: "Legacy (read-only)", disabled: true, icon: <FlaskConicalIcon /> },
    ],
  },
  {
    id: "processed",
    label: "Processed",
    children: [
      { id: "ids", label: "IDS Documents", icon: <FileTextIcon /> },
      { id: "decorated", label: "Decorated Files", icon: <FileTextIcon /> },
    ],
  },
  { id: "archive", label: "Archive", icon: <FlaskConicalIcon /> },
];

function renderNodes(nodes: Node[]): React.ReactNode {
  return nodes.map((node) => {
    const hasChildren = Boolean(node.children?.length) || Boolean(node.unloaded);
    return (
      <TreeItem key={node.id} id={node.id} hasChildren={hasChildren} disabled={node.disabled}>
        <TreeItemLabel icon={node.icon ?? (hasChildren ? <FolderNodeIcon /> : undefined)}>{node.label}</TreeItemLabel>
        {node.children ? <TreeItemGroup>{renderNodes(node.children)}</TreeItemGroup> : null}
      </TreeItem>
    );
  });
}

/* -------------------------------------------------------------------- stories */

/**
 * A realistic folder tree: leading icons, open/closed folder swapping, a long label that truncates,
 * a node whose children have not been fetched, and a disabled node.
 */
export const Default: Story = {
  render: function DefaultTree() {
    const [activated, setActivated] = React.useState<string[]>([]);

    return (
      <div className="flex max-w-md flex-col gap-3">
        <Tree
          aria-label="Data lake folders"
          defaultExpandedIds={new Set(["instrument-data"])}
          defaultSelectedId="lcms"
          onActivate={(id) => setActivated((current) => [...current, id])}
          className="max-w-xs"
        >
          {renderNodes(FOLDERS)}
        </Tree>
        <p data-testid="activations" className="text-muted-foreground text-xs">
          onActivate: {activated.join(", ") || "none"}
        </p>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const item = (name: string) => canvas.getByRole("treeitem", { name });
    const activations = () => canvas.getByTestId("activations");

    await step("ARIA state is derived from position in the tree", async () => {
      expect(canvas.getByRole("tree", { name: "Data lake folders" })).toBeInTheDocument();

      const instrumentData = item("Instrument Data");
      expect(instrumentData).toHaveAttribute("aria-level", "1");
      expect(instrumentData).toHaveAttribute("aria-posinset", "1");
      expect(instrumentData).toHaveAttribute("aria-setsize", "3");
      expect(instrumentData).toHaveAttribute("aria-expanded", "true");

      const lcms = item("LC-MS");
      expect(lcms).toHaveAttribute("aria-level", "2");
      expect(lcms).toHaveAttribute("aria-setsize", "3");
      expect(lcms).toHaveAttribute("aria-selected", "true");
    });

    await step("Leaves report no expanded state, and collapsed subtrees are absent entirely", async () => {
      expect(item("Archive")).not.toHaveAttribute("aria-expanded");
      expect(canvas.queryByRole("treeitem", { name: "IDS Documents" })).not.toBeInTheDocument();
      // Children exist but have not been fetched — still an expandable node.
      expect(item("Plate Readers")).toHaveAttribute("aria-expanded", "false");
    });

    await step("Icons are decorative, so they stay out of every node's accessible name", async () => {
      // The `getByRole` lookups above match on exact accessible name, so an icon leaking into a name
      // would already have failed. Assert the mechanism directly too.
      expect(item("Archive").querySelector('[data-slot="tree-item-icon"]')).toHaveAttribute("aria-hidden", "true");
    });

    // Ordering note: every step below moves focus, and the roving tab stop follows it — so the
    // single-tab-stop assertion has to come before the first interaction, and the disabled node
    // (which legitimately becomes the tab stop once focused) has to come last.
    await step("The tree is a single tab stop, entered at the first root node", async () => {
      await userEvent.tab();
      expect(item("Instrument Data")).toHaveFocus();
      expect(item("Instrument Data")).toHaveAttribute("tabindex", "0");
      expect(item("Processed")).toHaveAttribute("tabindex", "-1");
    });

    await step("Arrow keys expand, descend and cross depth levels", async () => {
      await userEvent.keyboard("{ArrowRight}");
      expect(item("LC-MS")).toHaveFocus();

      await userEvent.keyboard("{ArrowDown}");
      expect(item("Plate Readers")).toHaveFocus();

      // Expanding a node whose children are not rendered leaves it with no group.
      await userEvent.keyboard("{ArrowRight}");
      expect(item("Plate Readers")).toHaveAttribute("aria-expanded", "true");
      expect(item("Plate Readers").querySelector('[role="group"]')).toBeNull();

      await userEvent.keyboard("{ArrowLeft}");
      expect(item("Plate Readers")).toHaveAttribute("aria-expanded", "false");
      await userEvent.keyboard("{ArrowLeft}");
      expect(item("Instrument Data")).toHaveFocus();
    });

    await step("Home and End jump to the first and last visible node", async () => {
      await userEvent.keyboard("{End}");
      expect(item("Archive")).toHaveFocus();
      await userEvent.keyboard("{Home}");
      expect(item("Instrument Data")).toHaveFocus();
    });

    await step("Enter and click activate down the same path", async () => {
      await userEvent.keyboard("{Enter}");
      expect(activations()).toHaveTextContent("instrument-data");

      await userEvent.click(canvas.getByText("Processed"));
      expect(activations()).toHaveTextContent("instrument-data, processed");
      expect(item("Processed")).toHaveAttribute("aria-selected", "true");
    });

    await step("The chevron toggles expansion without activating", async () => {
      const processed = item("Processed");
      const logged = activations().textContent;
      await userEvent.click(processed.querySelector('[data-slot="tree-item-indicator"]') as Element);
      expect(processed).toHaveAttribute("aria-expanded", "false");
      expect(activations()).toHaveTextContent(logged as string);
    });

    await step("A disabled node is focusable but neither selectable nor activatable", async () => {
      // Activating `Instrument Data` above collapsed it, taking its children with it.
      const parent = item("Instrument Data");
      expect(parent).toHaveAttribute("aria-expanded", "false");
      await userEvent.click(parent.querySelector('[data-slot="tree-item-indicator"]') as Element);

      const disabled = item("Legacy (read-only)");
      expect(disabled).toHaveAttribute("aria-disabled", "true");
      disabled.focus();
      expect(disabled).toHaveFocus();
      await userEvent.keyboard("{Enter}");
      expect(disabled).toHaveAttribute("aria-selected", "false");
      expect(activations()).not.toHaveTextContent("legacy");
    });
  },
};

/** No nesting: the same primitive works as a flat single-select list. */
export const Flat: Story = {
  name: "Flat (no nesting)",
  render: () => (
    <Tree aria-label="Pipelines" defaultSelectedId="fluorescence" className="max-w-xs">
      <TreeItem id="fluorescence">
        <TreeItemLabel icon={<FlaskConicalIcon />}>Fluorescence intensity</TreeItemLabel>
      </TreeItem>
      <TreeItem id="chromatography">
        <TreeItemLabel icon={<FlaskConicalIcon />}>Chromatography peak table</TreeItemLabel>
      </TreeItem>
      <TreeItem id="mass-spec">
        {/* The `icon` prop is optional — this row aligns with the others without one. */}
        <TreeItemLabel>Mass spec deconvolution</TreeItemLabel>
      </TreeItem>
    </Tree>
  ),
};

/**
 * Arbitrary depth with no level cap, driven from controlled `expandedIds` / `selectedId` state, and
 * rendered in a local dark scope so the accessibility check covers dark-mode contrast too.
 */
export const DeepNesting: Story = {
  name: "Deep nesting (controlled, dark)",
  render: function DeepTree() {
    const ids = ["org", "site", "lab", "instrument", "run", "result"];
    const labels = [
      "Acme Pharma",
      "Cambridge site",
      "Analytical lab",
      "Xevo G2-XS",
      "Run 2026-09-01",
      "peaks.ids.json",
    ];

    const [expandedIds, setExpandedIds] = React.useState(new Set(ids));
    const [selectedId, setSelectedId] = React.useState<string | null>(null);

    const build = (index: number): React.ReactNode => (
      <TreeItem id={ids[index]} hasChildren={index < ids.length - 1}>
        <TreeItemLabel icon={index < ids.length - 1 ? <FolderNodeIcon /> : <FileTextIcon />}>
          {labels[index]}
        </TreeItemLabel>
        {index < ids.length - 1 ? <TreeItemGroup>{build(index + 1)}</TreeItemGroup> : null}
      </TreeItem>
    );

    return (
      <div className="dark bg-background flex max-w-md flex-col gap-3 rounded-lg p-4">
        <Tree
          aria-label="Sample lineage"
          expandedIds={expandedIds}
          onExpandedChange={setExpandedIds}
          selectedId={selectedId}
          onSelectedChange={setSelectedId}
          className="max-w-xs"
        >
          {build(0)}
        </Tree>
        <p data-testid="state" className="text-muted-foreground text-xs">
          selected: {selectedId ?? "none"} · expanded: {expandedIds.size}
        </p>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Depth is unbounded and aria-level keeps counting", async () => {
      expect(canvas.getByRole("treeitem", { name: "peaks.ids.json" })).toHaveAttribute("aria-level", "6");
    });

    await step("Selection and expansion are driven from consumer state", async () => {
      await userEvent.click(canvas.getByText("Analytical lab"));
      const state = canvas.getByTestId("state");
      expect(state).toHaveTextContent("selected: lab");
      // Activating an expanded parent collapses it, so the controlled set shrinks.
      expect(state).toHaveTextContent("expanded: 5");
    });
  },
};
