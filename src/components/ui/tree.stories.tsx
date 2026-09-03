import { FileTextIcon, FolderIcon, FolderOpenIcon } from "lucide-react";
import * as React from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { Badge } from "./badge";
import { Spinner } from "./spinner";
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
          "",
          "**Clipped labels** reveal themselves in a tooltip on hover, and only when the text is actually cut off —",
          "the row is measured at the moment the tooltip would open.",
          "",
          "**Trailing slot:** `TreeItemLabel`'s `trailing` prop right-aligns per-node adornments — a count badge, a",
          "spinner, a status dot. Its text joins the node's accessible name, so hide purely decorative content yourself.",
          "",
          "**Guides:** `guides` draws curved connectors joining each row to its parent — `\"hover\"` (the default)",
          "reveals them while the pointer is over the tree, `\"always\"` pins them on, `\"none\"` turns them off. The",
          "trunk terminates in the curve at the last child rather than running past it.",
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
  /** Rendered in the label's `trailing` slot as a count badge. */
  count?: number;
  /** Rendered in the label's `trailing` slot as a spinner instead of a count. */
  loading?: boolean;
};

const LONG_LABEL = "a-very-long-file-name-that-will-not-fit-in-the-available-width-and-has-to-be-clipped.txt";

const FOLDERS: Node[] = [
  {
    id: "documents",
    label: "Documents",
    count: 14,
    children: [
      {
        id: "reports",
        label: "Reports",
        count: 2,
        children: [
          { id: "reports-summary", label: "summary.txt", icon: <FileTextIcon /> },
          {
            id: "reports-long",
            label: LONG_LABEL,
            icon: <FileTextIcon />,
          },
        ],
      },
      { id: "drafts", label: "Drafts", unloaded: true, loading: true },
      { id: "locked", label: "Locked folder", disabled: true, icon: <FolderIcon /> },
    ],
  },
  {
    id: "shared",
    label: "Shared",
    count: 2,
    children: [
      { id: "shared-notes", label: "notes.md", icon: <FileTextIcon />, count: 128 },
      { id: "shared-image", label: "diagram.svg", icon: <FileTextIcon /> },
    ],
  },
  { id: "archive", label: "Archive", icon: <FolderIcon /> },
];

function nodeTrailing(node: Node): React.ReactNode {
  // A spinner conveys nothing to a screen reader, so it is hidden; the count is left audible, and
  // reads as part of the node's name ("Processed 2").
  if (node.loading) {
    return <Spinner aria-hidden="true" className="text-muted-foreground" />;
  }
  if (node.count !== undefined) {
    return (
      <Badge variant="secondary" className="px-1.5 tabular-nums">
        {node.count}
      </Badge>
    );
  }
  return undefined;
}

function renderNodes(nodes: Node[]): React.ReactNode {
  return nodes.map((node) => {
    const hasChildren = Boolean(node.children?.length) || Boolean(node.unloaded);
    return (
      <TreeItem key={node.id} id={node.id} hasChildren={hasChildren} disabled={node.disabled}>
        <TreeItemLabel
          icon={node.icon ?? (hasChildren ? <FolderNodeIcon /> : undefined)}
          trailing={nodeTrailing(node)}
        >
          {node.label}
        </TreeItemLabel>
        {node.children ? <TreeItemGroup>{renderNodes(node.children)}</TreeItemGroup> : null}
      </TreeItem>
    );
  });
}

const DEEP_IDS = ["level-1", "level-2", "level-3", "level-4", "level-5", "level-6"];
const DEEP_LABELS = ["First level", "Second level", "Third level", "Fourth level", "Fifth level", "leaf.txt"];

function renderDeep(index: number): React.ReactNode {
  const isLeaf = index === DEEP_IDS.length - 1;
  return (
    <TreeItem id={DEEP_IDS[index]} hasChildren={!isLeaf}>
      <TreeItemLabel icon={isLeaf ? <FileTextIcon /> : <FolderNodeIcon />}>{DEEP_LABELS[index]}</TreeItemLabel>
      {isLeaf ? null : <TreeItemGroup>{renderDeep(index + 1)}</TreeItemGroup>}
    </TreeItem>
  );
}

/* ------------------------------------------------------------ visible stories
 *
 * These deliberately have no `play` function: an autoplaying story flashes its
 * own automation at anyone browsing Storybook. The interaction coverage lives in
 * the `!dev`-tagged stories at the bottom, which the test runner still picks up
 * but the sidebar never shows.
 * -------------------------------------------------------------------------- */

/**
 * A realistic folder tree: leading icons, open/closed folder swapping, count badges and a spinner in
 * the `trailing` slot, a node whose children have not been fetched, and a disabled node. Hover
 * anywhere over the tree to reveal the indent guides, and hover the clipped `a-very-long-file-name…` label to
 * see its full text.
 */
export const Default: Story = {
  render: () => (
    <Tree
      aria-label="Files"
      defaultExpandedIds={new Set(["documents", "reports"])}
      defaultSelectedId="reports"
      className="max-w-xs"
    >
      {renderNodes(FOLDERS)}
    </Tree>
  ),
};

/** No nesting: the same primitive works as a flat single-select list. */
export const Flat: Story = {
  name: "Flat (no nesting)",
  render: () => (
    <Tree aria-label="Items" defaultSelectedId="first" className="max-w-xs">
      <TreeItem id="first">
        <TreeItemLabel icon={<FileTextIcon />}>First item</TreeItemLabel>
      </TreeItem>
      <TreeItem id="second">
        <TreeItemLabel icon={<FileTextIcon />}>Second item</TreeItemLabel>
      </TreeItem>
      <TreeItem id="third">
        {/* The `icon` prop is optional — this row aligns with the others without one. */}
        <TreeItemLabel>Third item, with no icon</TreeItemLabel>
      </TreeItem>
    </Tree>
  ),
};

/** Arbitrary depth with no level cap, driven from controlled `expandedIds` / `selectedId` state. */
export const DeepNesting: Story = {
  name: "Deep nesting (controlled)",
  render: function DeepTree() {
    const [expandedIds, setExpandedIds] = React.useState(new Set(DEEP_IDS));
    const [selectedId, setSelectedId] = React.useState<string | null>("level-3");

    return (
      <Tree
        aria-label="Nested folders"
        expandedIds={expandedIds}
        onExpandedChange={setExpandedIds}
        selectedId={selectedId}
        onSelectedChange={setSelectedId}
        className="max-w-xs"
      >
        {renderDeep(0)}
      </Tree>
    );
  },
};

/** The three `guides` modes side by side. Hover the middle tree to reveal its guides. */
export const Guides: Story = {
  name: "Indent guides",
  render: () => (
    <div className="flex flex-wrap gap-8">
      {(["none", "hover", "always"] as const).map((guides) => (
        <div key={guides} className="flex flex-col gap-2">
          <p className="text-muted-foreground font-mono text-xs">guides=&quot;{guides}&quot;</p>
          <Tree
            aria-label={`Nested folders, guides ${guides}`}
            guides={guides}
            defaultExpandedIds={new Set(DEEP_IDS)}
            className="w-[240px]"
          >
            {renderDeep(0)}
          </Tree>
        </div>
      ))}
    </div>
  ),
};

/* --------------------------------------------------------- test-only stories
 *
 * `!dev` keeps these out of the sidebar and `!autodocs` out of the docs page,
 * while the implicit `test` tag keeps them in `yarn test:storybook` — so the
 * behaviour stays covered without any visible story autoplaying at a human.
 * -------------------------------------------------------------------------- */

export const CoreBehaviour: Story = {
  name: "Core behaviour (test only)",
  tags: ["!dev", "!autodocs"],
  args: {
    onActivate: fn(),
  },
  render: (args) => (
    <Tree
      {...args}
      aria-label="Files"
      defaultExpandedIds={new Set(["documents"])}
      defaultSelectedId="reports"
      className="max-w-xs"
    >
      {renderNodes(FOLDERS)}
    </Tree>
  ),
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    // Found via the label text rather than the accessible name: the `trailing` slot deliberately
    // contributes to the name (see the step below), and these lookups should not be coupled to it.
    const item = (label: string) => canvas.getByText(label).closest('[role="treeitem"]') as HTMLElement;

    await step("ARIA state is derived from position in the tree", async () => {
      expect(canvas.getByRole("tree", { name: "Files" })).toBeInTheDocument();

      const instrumentData = item("Documents");
      expect(instrumentData).toHaveAttribute("aria-level", "1");
      expect(instrumentData).toHaveAttribute("aria-posinset", "1");
      expect(instrumentData).toHaveAttribute("aria-setsize", "3");
      expect(instrumentData).toHaveAttribute("aria-expanded", "true");

      const lcms = item("Reports");
      expect(lcms).toHaveAttribute("aria-level", "2");
      expect(lcms).toHaveAttribute("aria-setsize", "3");
      expect(lcms).toHaveAttribute("aria-selected", "true");
    });

    await step("Leaves report no expanded state, and collapsed subtrees are absent entirely", async () => {
      expect(item("Archive")).not.toHaveAttribute("aria-expanded");
      expect(canvas.queryByRole("treeitem", { name: "notes.md" })).not.toBeInTheDocument();
      // Children exist but have not been fetched — still an expandable node.
      expect(item("Drafts")).toHaveAttribute("aria-expanded", "false");
    });

    await step("The trailing slot joins the accessible name, unless the consumer hides it", async () => {
      // A count is information a screen reader user wants; a spinner is not, so the story hides it.
      expect(canvas.getByRole("treeitem", { name: "Documents 14" })).toBe(item("Documents"));
      expect(canvas.getByRole("treeitem", { name: "Drafts" })).toBe(item("Drafts"));
      expect(item("Drafts").querySelector('[data-slot="tree-item-trailing"]')).toBeInTheDocument();
    });

    await step("Icons are decorative, so they stay out of every node's accessible name", async () => {
      // The `getByRole` lookups above match on exact accessible name, so an icon leaking into a name
      // would already have failed. Assert the mechanism directly too.
      expect(item("Archive").querySelector('[data-slot="tree-item-icon"]')).toHaveAttribute("aria-hidden", "true");
    });

    await step("Selecting a node washes the node and its contents, not each row", async () => {
      // The regression this guards: `group-*/tree-item` matches any ancestor, so a selected parent
      // used to style every descendant row too.
      const selectedBranch = item("Documents");
      expect(selectedBranch).toHaveAttribute("aria-selected", "false");
      expect(item("Reports")).toHaveAttribute("aria-selected", "true");
      expect(item("Drafts")).toHaveAttribute("aria-selected", "false");
    });

    // Ordering note: every step below moves focus, and the roving tab stop follows it — so the
    // single-tab-stop assertion has to come before the first interaction, and the disabled node
    // (which legitimately becomes the tab stop once focused) has to come last.
    await step("The tree is a single tab stop, entered at the first root node", async () => {
      await userEvent.tab();
      expect(item("Documents")).toHaveFocus();
      expect(item("Documents")).toHaveAttribute("tabindex", "0");
      expect(item("Shared")).toHaveAttribute("tabindex", "-1");
    });

    await step("Arrow keys expand, descend and cross depth levels", async () => {
      await userEvent.keyboard("{ArrowRight}");
      expect(item("Reports")).toHaveFocus();

      await userEvent.keyboard("{ArrowDown}");
      expect(item("Drafts")).toHaveFocus();

      // Expanding a node whose children are not rendered leaves it with no group.
      await userEvent.keyboard("{ArrowRight}");
      expect(item("Drafts")).toHaveAttribute("aria-expanded", "true");
      expect(item("Drafts").querySelector('[role="group"]')).toBeNull();

      await userEvent.keyboard("{ArrowLeft}");
      expect(item("Drafts")).toHaveAttribute("aria-expanded", "false");
      await userEvent.keyboard("{ArrowLeft}");
      expect(item("Documents")).toHaveFocus();
    });

    await step("Home and End jump to the first and last visible node", async () => {
      await userEvent.keyboard("{End}");
      expect(item("Archive")).toHaveFocus();
      await userEvent.keyboard("{Home}");
      expect(item("Documents")).toHaveFocus();
    });

    await step("Enter and click activate down the same path", async () => {
      await userEvent.keyboard("{Enter}");
      expect(args.onActivate).toHaveBeenCalledWith("documents");

      await userEvent.click(canvas.getByText("Shared"));
      expect(args.onActivate).toHaveBeenCalledWith("shared");
      expect(item("Shared")).toHaveAttribute("aria-selected", "true");
    });

    await step("The chevron toggles expansion without activating", async () => {
      const processed = item("Shared");
      const activationsSoFar = (args.onActivate as ReturnType<typeof fn>).mock.calls.length;
      await userEvent.click(processed.querySelector('[data-slot="tree-item-indicator"]') as Element);
      expect(processed).toHaveAttribute("aria-expanded", "false");
      expect(args.onActivate).toHaveBeenCalledTimes(activationsSoFar);
    });

    await step("A disabled node is focusable but neither selectable nor activatable", async () => {
      // Activating `Documents` above collapsed it, taking its children with it.
      const parent = item("Documents");
      expect(parent).toHaveAttribute("aria-expanded", "false");
      await userEvent.click(parent.querySelector('[data-slot="tree-item-indicator"]') as Element);

      const disabled = item("Locked folder");
      expect(disabled).toHaveAttribute("aria-disabled", "true");
      disabled.focus();
      expect(disabled).toHaveFocus();
      await userEvent.keyboard("{Enter}");
      expect(disabled).toHaveAttribute("aria-selected", "false");
      expect(args.onActivate).not.toHaveBeenCalledWith("locked");
    });

  },
};

/**
 * The truncation tooltip, both directions. Its own story rather than more steps on
 * `CoreBehaviour`: the open delay makes these slow, and a play function long enough to outlast the
 * story's own mount asserts against a torn-down DOM.
 */
export const TruncationBehaviour: Story = {
  name: "Truncation tooltip (test only)",
  tags: ["!dev", "!autodocs"],
  render: () => (
    <Tree aria-label="Files" className="w-[220px]">
      <TreeItem id="long">
        <TreeItemLabel icon={<FileTextIcon />}>{LONG_LABEL}</TreeItemLabel>
      </TreeItem>
      <TreeItem id="short">
        <TreeItemLabel icon={<FileTextIcon />}>short-name.txt</TreeItemLabel>
      </TreeItem>
    </Tree>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    // The content is portalled out of the canvas, so it is queried from the document.
    const body = within(document.body);

    await step("A clipped label reveals its full text on hover", async () => {
      await userEvent.hover(canvas.getByText(LONG_LABEL));
      await waitFor(() => expect(body.getByRole("tooltip")).toHaveTextContent(LONG_LABEL), { timeout: 2000 });

      await userEvent.unhover(canvas.getByText(LONG_LABEL));
      await waitFor(() => expect(body.queryByRole("tooltip")).not.toBeInTheDocument(), { timeout: 2000 });
    });

    await step("A label that fits gets no tooltip", async () => {
      await userEvent.hover(canvas.getByText("short-name.txt"));
      // Comfortably past the provider's open delay, so this is a real negative rather than a race.
      await new Promise((resolve) => setTimeout(resolve, 900));
      expect(body.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  },
};

/**
 * Controlled expansion and selection at depth, in a local `.dark` scope so the accessibility check
 * covers dark-mode contrast on the same run. Test-only: the theme toolbar is how a human should
 * look at dark mode, so no visible story hard-codes it.
 */
export const ControlledBehaviour: Story = {
  name: "Controlled and dark contrast (test only)",
  tags: ["!dev", "!autodocs"],
  render: function ControlledDeepTree() {
    const [expandedIds, setExpandedIds] = React.useState(new Set(DEEP_IDS));
    const [selectedId, setSelectedId] = React.useState<string | null>(null);

    return (
      <div className="dark bg-background rounded-lg p-4">
        <Tree
          aria-label="Nested folders"
          expandedIds={expandedIds}
          onExpandedChange={setExpandedIds}
          selectedId={selectedId}
          onSelectedChange={setSelectedId}
          className="max-w-xs"
        >
          {renderDeep(0)}
        </Tree>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Depth is unbounded and aria-level keeps counting", async () => {
      expect(canvas.getByRole("treeitem", { name: "leaf.txt" })).toHaveAttribute("aria-level", "6");
    });

    await step("Selection and expansion round-trip through consumer state", async () => {
      const lab = canvas.getByRole("treeitem", { name: "Third level" });
      expect(lab).toHaveAttribute("aria-selected", "false");

      await userEvent.click(canvas.getByText("Third level"));
      expect(lab).toHaveAttribute("aria-selected", "true");
      // Activating an expanded parent collapses it, and the controlled set drops the id.
      expect(lab).toHaveAttribute("aria-expanded", "false");
      expect(canvas.queryByRole("treeitem", { name: "Fourth level" })).not.toBeInTheDocument();
    });
  },
};
