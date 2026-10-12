import {
  FileQuestionMarkIcon,
  FileTextIcon,
  FolderIcon,
  FolderOpenIcon,
  RotateCwIcon,
  TriangleAlertIcon,
} from "lucide-react";
import * as React from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { Badge } from "./badge";
import { Button } from "./button";
import { Kbd } from "./kbd";
import { Skeleton } from "./skeleton";
import { Spinner } from "./spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { Tree, TreeEmpty, TreeItem, TreeItemGroup, TreeItemLabel, TreeLoadMore, useTreeItem } from "./tree";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Tree> = {
  title: "Components/Data Display/Tree",
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
          "**Keyboard:** the tree is a single tab stop; `Tab` lands on the selected node, or the first one. `↓`/`↑` move",
          "between visible nodes across levels · `→` expands, then moves to the first child · `←` collapses, then moves to",
          "the parent · `Home`/`End` jump to the first/last visible node · `Enter` activates · `*` expands every sibling",
          "at the current level · typing letters jumps to the next node whose label starts with them, and the typed prefix",
          "is highlighted on every matching label while the buffer is live. Collapsing a branch",
          "that contains the focused node moves focus to the branch, and focus survives a lazily loaded subtree swapping in.",
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
          '**Guides:** `guides` draws curved connectors joining each row to its parent — `"hover"` (the default)',
          'reveals them while the pointer is over the tree, `"always"` pins them on, `"none"` turns them off. The',
          "trunk terminates in the curve at the last child rather than running past it.",
          "",
          '**Empty, error, loading and "Load more" rows — where they sit in the tree (SW-2542):** `TreeEmpty` and',
          '`TreeLoadMore`. Both `role="tree"` and `role="group"` require treeitem/group children per WAI-ARIA\'s',
          "`aria-required-children`, so a placeholder has to render as a `treeitem` — a bare `<div>` would leave the",
          "container structurally invalid the moment it's the only child. Both components are that `treeitem`:",
          "excluded from sibling indexing (so they never steal a real sibling's `aria-setsize`/`aria-posinset`) and from",
          "arrow-key traversal (so the single-tab-stop model never stalls on one), while any button inside stays in",
          "ordinary Tab order — neither carries `aria-disabled`, which Chromium treats as inherited by descendants.",
          "Both draw as a leaf row at their depth: the same height, inset and chevron spacer as `TreeItemLabel`, so",
          "the icon and text land in the columns of the node they stand in for. Concretely: a folder that came back",
          "empty or failed to load, or an empty root, puts a `<TreeEmpty>` (icon plus a short message) in place of its",
          "children; a branch still loading swaps in a `Skeleton` pair as `TreeEmpty`'s content (with an `aria-label`,",
          'since it has no text); and "Load more" is `<TreeLoadMore>` appended as the *last* child of an',
          "otherwise-populated `TreeItemGroup` — a full-row button with a leaf's hover, focus and pressed states. It is",
          "never a sibling of the group (that would sit outside `aria-level`/`aria-setsize` for content that is",
          'conceptually still part of the branch) and never an indexed `TreeItem` (a click on "Load more" is not',
          "selecting or activating a node).",
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
        <TreeItemLabel icon={node.icon ?? (hasChildren ? <FolderNodeIcon /> : undefined)} trailing={nodeTrailing(node)}>
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
  parameters: {
    zephyr: { testCaseId: "SW-T5655" },
  },
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
  parameters: {
    zephyr: { testCaseId: "SW-T5656" },
  },
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
  parameters: {
    zephyr: { testCaseId: "SW-T5657" },
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
  parameters: {
    zephyr: { testCaseId: "SW-T5658" },
  },
};

/**
 * A skeleton pair standing in for an unloaded node's icon and label, matching `TreeItemLabel`'s own
 * icon slot and text sizing — rendered directly as `TreeEmpty`'s children, so it inherits the
 * placeholder row's height and depth-correct indent rather than carrying its own.
 */
function TreeItemSkeleton() {
  return (
    <>
      <Skeleton aria-hidden="true" className="size-4 shrink-0 rounded-sm" />
      <Skeleton aria-hidden="true" className="h-4 min-w-0 max-w-32 flex-1" />
    </>
  );
}

/**
 * A top-level folder that came back empty: `TreeEmpty` stands in for its children as a leaf row — a
 * file-question icon and "No files", in the same icon and text columns as the file it's missing.
 * Refresh sits in the folder's own `trailing` slot, like Retry in the error state: it's an action on
 * that node, not part of the placeholder. Click it to see the folder move through a loading skeleton
 * to its contents, for the case where an empty result just needs re-fetching.
 */
export const EmptyStateStory: Story = {
  name: "Empty state",
  render: function EmptyTree() {
    const [status, setStatus] = React.useState<"empty" | "loading" | "loaded">("empty");

    React.useEffect(() => {
      if (status !== "loading") return;
      const timer = setTimeout(() => setStatus("loaded"), 900);
      return () => clearTimeout(timer);
    }, [status]);

    return (
      <Tree aria-label="Files" defaultExpandedIds={new Set(["documents"])} className="w-[240px]">
        <TreeItem id="documents" hasChildren aria-busy={status === "loading" || undefined}>
          <TreeItemLabel
            icon={<FolderNodeIcon />}
            trailing={
              status === "empty" ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Refresh Documents"
                      // An unclaimed click bubbles to `TreeItem`'s handler and would collapse the folder.
                      onClick={(event) => {
                        event.stopPropagation();
                        setStatus("loading");
                      }}
                    >
                      <RotateCwIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh</TooltipContent>
                </Tooltip>
              ) : undefined
            }
          >
            Documents
          </TreeItemLabel>
          <TreeItemGroup>
            {status === "loaded" ? (
              <TreeItem id="reports">
                <TreeItemLabel icon={<FileTextIcon />}>reports.csv</TreeItemLabel>
              </TreeItem>
            ) : status === "loading" ? (
              <TreeEmpty aria-label="Loading Documents">
                <TreeItemSkeleton />
              </TreeEmpty>
            ) : (
              <TreeEmpty>
                <FileQuestionMarkIcon aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">No files</span>
              </TreeEmpty>
            )}
          </TreeItemGroup>
        </TreeItem>
        <TreeItem id="archive">
          <TreeItemLabel icon={<FolderIcon />}>Archive</TreeItemLabel>
        </TreeItem>
      </Tree>
    );
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5731" },
  },
};

/**
 * A branch whose children failed to load uses `TreeEmpty` in place of that branch's
 * `TreeItemGroup` children — the same leaf-row look as the empty state above, just a
 * destructive-toned icon and "Failed to load" in place of the muted one. Retry sits in
 * `TreeItemLabel`'s `trailing` slot as an icon button with a tooltip, not inside the error content
 * itself — it's an action on the "Shared" node, not part of the placeholder. Click it to see the
 * branch move through a loading skeleton to its real children.
 */
export const ErrorStateStory: Story = {
  name: "Error state",
  render: function ErrorTree() {
    const [status, setStatus] = React.useState<"error" | "loading" | "loaded">("error");

    React.useEffect(() => {
      if (status !== "loading") return;
      const timer = setTimeout(() => setStatus("loaded"), 900);
      return () => clearTimeout(timer);
    }, [status]);

    return (
      <Tree aria-label="Files" defaultExpandedIds={new Set(["shared"])} className="w-[240px]">
        <TreeItem id="documents">
          <TreeItemLabel icon={<FolderIcon />}>Documents</TreeItemLabel>
        </TreeItem>
        <TreeItem id="shared" hasChildren aria-busy={status === "loading" || undefined}>
          <TreeItemLabel
            icon={<FolderNodeIcon />}
            trailing={
              status === "error" ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Retry loading Shared"
                      // Stopped here, not left to bubble: `TreeItem`'s click handler walks up to the
                      // nearest treeitem and treats any unclaimed click inside it as a select/toggle,
                      // which would collapse "Shared" the instant the retry it just asked for lands.
                      onClick={(event) => {
                        event.stopPropagation();
                        setStatus("loading");
                      }}
                    >
                      <RotateCwIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Retry</TooltipContent>
                </Tooltip>
              ) : undefined
            }
          >
            Shared
          </TreeItemLabel>
          <TreeItemGroup>
            {status === "error" ? (
              <TreeEmpty>
                <TriangleAlertIcon aria-hidden="true" className="text-destructive" />
                <span className="text-destructive min-w-0 flex-1 truncate">Failed to load</span>
              </TreeEmpty>
            ) : status === "loading" ? (
              <>
                <TreeEmpty aria-label="Loading Shared">
                  <TreeItemSkeleton />
                </TreeEmpty>
                <TreeEmpty aria-hidden="true">
                  <TreeItemSkeleton />
                </TreeEmpty>
              </>
            ) : (
              <TreeItem id="shared-notes">
                <TreeItemLabel icon={<FileTextIcon />}>notes.md</TreeItemLabel>
              </TreeItem>
            )}
          </TreeItemGroup>
        </TreeItem>
        <TreeItem id="archive">
          <TreeItemLabel icon={<FolderIcon />}>Archive</TreeItemLabel>
        </TreeItem>
      </Tree>
    );
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5732" },
  },
};

/**
 * SW-2542's "Load more" answer, made concrete: `TreeLoadMore` appended as the *last* child of an
 * otherwise-populated `TreeItemGroup` — a `treeitem` excluded from sibling indexing (it never claims
 * a set slot from the real files around it) and from arrow-key traversal, wrapping a real button in
 * ordinary Tab order. It spans the full row and shares a leaf node's hover, focus and pressed
 * states. Click it a few times to exhaust the list.
 */
export const LoadMoreStory: Story = {
  name: "Load more",
  render: function LoadMoreTree() {
    const [count, setCount] = React.useState(2);
    const total = 5;

    return (
      <Tree aria-label="Files" defaultExpandedIds={new Set(["documents"])} className="w-[240px]">
        <TreeItem id="documents" hasChildren>
          <TreeItemLabel icon={<FolderNodeIcon />}>Documents</TreeItemLabel>
          <TreeItemGroup>
            {Array.from({ length: count }, (_, index) => (
              <TreeItem key={index} id={`file-${index}`}>
                <TreeItemLabel icon={<FileTextIcon />}>{`file-${index + 1}.txt`}</TreeItemLabel>
              </TreeItem>
            ))}
            {count < total ? (
              <TreeLoadMore
                icon={<RotateCwIcon />}
                onClick={() => setCount((current) => Math.min(current + 2, total))}
              />
            ) : null}
          </TreeItemGroup>
        </TreeItem>
      </Tree>
    );
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5733" },
  },
};

const KEY_MAP: [key: string, action: string][] = [
  ["Tab", "Enter the tree at the selected node, or the first"],
  ["↓ / ↑", "Next / previous visible node, across levels"],
  ["→", "Expand; if already expanded, move to the first child"],
  ["←", "Collapse; if already collapsed, move to the parent"],
  ["Home / End", "First / last visible node"],
  ["Enter", "Activate: select, toggle expansion, fire onActivate"],
  ["*", "Expand every sibling at the current level"],
  ["a–z", "Typeahead: next node whose label starts with what you type"],
];

/** Every key the tree binds, next to a tree to try them on. Click a node first, or `Tab` into it. */
export const Keyboard: Story = {
  name: "Keyboard walkthrough",
  render: () => (
    <div className="flex flex-wrap items-start gap-8">
      <Tree
        aria-label="Files"
        defaultExpandedIds={new Set(["documents"])}
        defaultSelectedId="reports"
        className="max-w-xs"
      >
        {renderNodes(FOLDERS)}
      </Tree>
      <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-sm">
        {KEY_MAP.map(([key, action]) => (
          <React.Fragment key={key}>
            <dt>
              <Kbd>{key}</Kbd>
            </dt>
            <dd className="text-muted-foreground">{action}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T5715" },
  },
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
    // Matched on the text slot's full content, not `getByText`, because a live typeahead highlight
    // splits the text across two spans.
    const item = (label: string) => {
      const text = [...canvasElement.querySelectorAll<HTMLElement>('[data-slot="tree-item-text"]')].find(
        (element) => element.textContent === label,
      );
      return text?.closest('[role="treeitem"]') as HTMLElement;
    };

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
    await step("The tree is a single tab stop, entered at the selected node", async () => {
      await userEvent.tab();
      expect(item("Reports")).toHaveFocus();
      expect(item("Reports")).toHaveAttribute("tabindex", "0");
      expect(item("Documents")).toHaveAttribute("tabindex", "-1");
      expect(item("Shared")).toHaveAttribute("tabindex", "-1");

      await userEvent.keyboard("{Home}");
      expect(item("Documents")).toHaveFocus();
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

    await step("Typeahead, * and focus retention (covered in depth by tree.test.tsx)", async () => {
      await userEvent.keyboard("s");
      expect(item("Shared")).toHaveFocus();
      expect(item("Shared").querySelector('[data-slot="tree-item-typeahead-match"]')).toHaveTextContent("S");

      await userEvent.keyboard("*");
      expect(item("Shared")).toHaveAttribute("aria-expanded", "true");
      expect(item("Documents")).toHaveAttribute("aria-expanded", "true");

      // Collapsing the parent of the focused node from the pointer lands focus on the parent.
      await userEvent.keyboard("{ArrowRight}");
      expect(item("notes.md")).toHaveFocus();
      await userEvent.click(item("Shared").querySelector('[data-slot="tree-item-indicator"]') as Element);
      expect(item("Shared")).toHaveFocus();
      expect(item("Shared")).toHaveAttribute("tabindex", "0");

      await userEvent.keyboard("{Home}");
      expect(item("Documents")).toHaveFocus();
    });

    await step("Enter and click activate down the same path", async () => {
      await userEvent.keyboard("{Enter}");
      expect(args.onActivate).toHaveBeenCalledWith("documents");

      await userEvent.click(item("Shared"));
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
  parameters: {
    zephyr: { testCaseId: "SW-T5659" },
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
  parameters: {
    zephyr: { testCaseId: "SW-T5660" },
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
  parameters: {
    zephyr: { testCaseId: "SW-T5661" },
  },
};

/**
 * Every placeholder shape against the real row it stands in for, at the root and one level down,
 * plus `TreeLoadMore`'s hit area and states against a leaf's. The placeholders reproduce
 * `TreeItemLabel`'s inset, border and chevron spacer by hand, so a row drifting a chevron's width off
 * its siblings — or a Load more that hovers or focuses differently — is easy to reintroduce and hard
 * to spot in review. Measured here in a real browser rather than eyeballed.
 */
export const PlaceholderAlignmentBehaviour: Story = {
  name: "Placeholder alignment (test only)",
  tags: ["!dev", "!autodocs"],
  render: () => (
    <Tree aria-label="Files" defaultExpandedIds={new Set(["folder"])} className="w-[240px]">
      <TreeItem id="root-file">
        <TreeItemLabel icon={<FileTextIcon />}>root.txt</TreeItemLabel>
      </TreeItem>
      <TreeEmpty data-testid="root-empty">
        <FileQuestionMarkIcon aria-hidden="true" />
        <span>No files</span>
      </TreeEmpty>
      <TreeItem id="folder" hasChildren>
        <TreeItemLabel icon={<FolderNodeIcon />}>Folder</TreeItemLabel>
        <TreeItemGroup>
          <TreeItem id="child-file">
            <TreeItemLabel icon={<FileTextIcon />}>child.txt</TreeItemLabel>
          </TreeItem>
          <TreeEmpty data-testid="child-error">
            <TriangleAlertIcon aria-hidden="true" className="text-destructive" />
            <span className="text-destructive">Failed to load</span>
          </TreeEmpty>
          <TreeEmpty data-testid="child-loading" aria-label="Loading">
            <TreeItemSkeleton />
          </TreeEmpty>
          <TreeLoadMore icon={<RotateCwIcon />} />
        </TreeItemGroup>
      </TreeItem>
    </Tree>
  ),
  play: async ({ canvasElement, step }) => {
    const query = (selector: string) => canvasElement.querySelector<HTMLElement>(selector)!;
    const left = (element: Element) => element.getBoundingClientRect().left;
    // Where the glyphs start, not the element box: the real label's text span carries `-mx-1 px-1`.
    const textLeft = (element: Element) => {
      const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT, (node) =>
        node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP,
      );
      const range = element.ownerDocument.createRange();
      range.selectNodeContents(walker.nextNode()!);
      return range.getBoundingClientRect().left;
    };
    const realLabel = (id: string) => query(`[data-tree-item-id="${id}"] > [data-slot="tree-item-label"]`);
    const realIcon = (id: string) => left(query(`[data-tree-item-id="${id}"] [data-slot="tree-item-icon"]`));
    const realText = (id: string) => textLeft(query(`[data-tree-item-id="${id}"] [data-slot="tree-item-text"]`));
    // The placeholder's leading icon or icon-sized skeleton — found by what it is, not by where it
    // sits relative to the spacer, so a missing spacer shows up as a measured offset.
    const placeholderIcon = (testId: string) =>
      left(query(`[data-testid="${testId}"] svg, [data-testid="${testId}"] [data-slot="skeleton"]`));
    const placeholderTextHost = (testId: string) => query(`[data-testid="${testId}"]`);
    const loadMore = () => query('[data-slot="tree-load-more"] button');
    const style = (element: Element) => getComputedStyle(element);

    await step("A root-level placeholder lines up with a root item", async () => {
      expect(placeholderIcon("root-empty")).toBeCloseTo(realIcon("root-file"), 0);
      expect(textLeft(placeholderTextHost("root-empty"))).toBeCloseTo(realText("root-file"), 0);
    });

    await step("Error, loading and Load more placeholders line up with the child they stand in for", async () => {
      for (const testId of ["child-error", "child-loading"]) {
        expect(placeholderIcon(testId)).toBeCloseTo(realIcon("child-file"), 0);
      }
      expect(textLeft(placeholderTextHost("child-error"))).toBeCloseTo(realText("child-file"), 0);
      expect(left(loadMore().querySelector("svg")!)).toBeCloseTo(realIcon("child-file"), 0);
      expect(textLeft(loadMore())).toBeCloseTo(realText("child-file"), 0);
    });

    await step("Load more spans the full row, like a leaf label", async () => {
      const row = realLabel("child-file").getBoundingClientRect();
      const button = loadMore().getBoundingClientRect();
      expect(button.left).toBeCloseTo(row.left, 0);
      expect(button.width).toBeCloseTo(row.width, 0);
      expect(button.height).toBeCloseTo(row.height, 0);
    });

    await step("Load more carries a leaf row's hover and pressed styles", async () => {
      // Compared as rules, not computed colours: `userEvent.hover` dispatches synthetic pointer
      // events, which never put an element into CSS `:hover`, so a computed-style comparison here
      // would pass vacuously (verified: it did, with the hover class deleted). The focus ring below
      // *can* be driven for real, so it is compared computed.
      expect(realLabel("child-file")).toHaveClass("hover:bg-muted");
      expect(loadMore()).toHaveClass("hover:bg-muted", "active:bg-accent", "active:text-accent-foreground");
    });

    await step("Load more takes the same keyboard focus ring as a leaf", async () => {
      // `Tab` enters the tree at its first node; the next `Tab` leaves the single-tab-stop tree for
      // the next tabbable element, which is Load more's button.
      await userEvent.tab();
      expect(query('[data-tree-item-id="root-file"]')).toHaveFocus();
      await new Promise((resolve) => setTimeout(resolve, 300));
      const leafRing = style(realLabel("root-file"));
      const [ringShadow, ringBorder] = [leafRing.boxShadow, leafRing.borderColor];

      await userEvent.tab();
      expect(loadMore()).toHaveFocus();
      await waitFor(() => {
        expect(style(loadMore()).boxShadow).toBe(ringShadow);
        expect(style(loadMore()).borderColor).toBe(ringBorder);
      });
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T5734" },
  },
};
