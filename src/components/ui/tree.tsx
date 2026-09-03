import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronRightIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------------------------------
 * Contexts
 *
 * The tree is intentionally headless about *data*: it never fetches, never owns a node array, and
 * derives every ARIA attribute from where a `TreeItem` sits in the React tree. Four contexts carry
 * that positional information down:
 *
 *   TreeContext       — per-tree state (expansion, selection, roving focus) and the key handler
 *   TreeLevelContext  — the current depth; `Tree` seeds 1, each `TreeItemGroup` increments
 *   TreeIndexContext  — `aria-posinset` / `aria-setsize`, injected by whichever container renders
 *                       the item (`Tree` for roots, `TreeItemGroup` for children)
 *   TreeItemContext   — the nearest enclosing item, read by `TreeItemLabel` / `TreeItemGroup`
 * -----------------------------------------------------------------------------------------------*/

type TreeContextValue = {
  expandedIds: Set<string>;
  setExpanded: (id: string, expanded: boolean) => void;
  selectedId: string | null;
  /**
   * The one activation path: selection, optional expansion and `onActivate`, shared by `Enter` and
   * by clicking a node so the two never diverge.
   */
  activateItem: (id: string, hasChildren: boolean, expanded: boolean) => void;
  focusedId: string | null;
  setFocusedId: (id: string) => void;
  expandOnSelect: boolean;
  guides: TreeGuides;
  /** Attached to each `TreeItem` rather than to the tree root, so the node is its own key target. */
  onItemKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
};

const TreeContext = React.createContext<TreeContextValue | null>(null);

function useTreeContext(component: string) {
  const context = React.useContext(TreeContext);
  if (!context) {
    throw new Error(`\`${component}\` must be rendered inside a \`Tree\`.`);
  }
  return context;
}

const TreeLevelContext = React.createContext(1);

type TreeIndexContextValue = { posinset: number; setsize: number };

const TreeIndexContext = React.createContext<TreeIndexContextValue>({ posinset: 1, setsize: 1 });

type TreeItemContextValue = {
  id: string;
  labelId: string;
  level: number;
  expanded: boolean;
  hasChildren: boolean;
  selected: boolean;
  disabled: boolean;
  /** Last among its siblings — the connector elbow terminates instead of continuing down. */
  isLastChild: boolean;
  toggle: () => void;
  select: () => void;
};

const TreeItemContext = React.createContext<TreeItemContextValue | null>(null);

function useTreeItemContext(component: string) {
  const context = React.useContext(TreeItemContext);
  if (!context) {
    throw new Error(`\`${component}\` must be rendered inside a \`TreeItem\`.`);
  }
  return context;
}

/**
 * Reads the item's position among its siblings and whether it is currently expanded. Exposed for
 * consumers composing their own row content (badges, action buttons, counts) inside a `TreeItem`.
 */
function useTreeItem() {
  return useTreeItemContext("useTreeItem");
}

/* -------------------------------------------------------------------------------------------------
 * Sibling indexing
 *
 * `aria-setsize` / `aria-posinset` need sibling counts, which only the container knows. Rather than
 * a mount-order registry (two render passes, StrictMode-sensitive, wrong under conditional
 * rendering) each container walks its own children and wraps them in an index provider. Purely
 * positional, so it is correct on the first render and under SSR.
 *
 * Caveat: every valid element child occupies a set slot, so non-item children of a group (a "Load
 * more" control, for instance) would be counted. That placement question is deliberately deferred
 * to SW-2542.
 * -----------------------------------------------------------------------------------------------*/

function useIndexedTreeChildren(children: React.ReactNode) {
  return React.useMemo(() => {
    const array = React.Children.toArray(children);
    const setsize = array.filter(React.isValidElement).length;
    let posinset = 0;

    return array.map((child, index) => {
      if (!React.isValidElement(child)) return child;
      posinset += 1;
      return (
        <TreeIndexContext.Provider key={child.key ?? index} value={{ posinset, setsize }}>
          {child}
        </TreeIndexContext.Provider>
      );
    });
  }, [children]);
}

/* -------------------------------------------------------------------------------------------------
 * Keyboard navigation
 *
 * Visible-node order is read from the DOM instead of a JS registry: collapsed groups are not
 * rendered at all, so `querySelectorAll('[role="treeitem"]')` in document order *is* the visible
 * node sequence, and ancestor/descendant lookups are one `closest()` call. This keeps the traversal
 * correct for arbitrary consumer markup between the levels.
 * -----------------------------------------------------------------------------------------------*/

const ITEM_SELECTOR = '[role="treeitem"]';

function getVisibleItems(root: HTMLElement | null) {
  if (!root) return [];
  return [...root.querySelectorAll<HTMLElement>(ITEM_SELECTOR)];
}

function moveFocus(element: HTMLElement | null | undefined, setFocusedId: (id: string) => void) {
  const id = element?.dataset.treeItemId;
  if (!element || !id) return;
  setFocusedId(id);
  element.focus();
}

type TreeKeyEvent = {
  event: React.KeyboardEvent<HTMLElement>;
  root: HTMLElement;
  /** The `role="treeitem"` element the key was pressed on. */
  current: HTMLElement;
  id: string;
  hasChildren: boolean;
  expanded: boolean;
  disabled: boolean;
  setExpanded: (id: string, expanded: boolean) => void;
  setFocusedId: (id: string) => void;
  activate: (id: string, hasChildren: boolean, expanded: boolean) => void;
};

/** Moves focus to `element`, if there is one, and claims the key press. */
function navigateTo({ event, setFocusedId }: TreeKeyEvent, element: HTMLElement | null | undefined) {
  event.preventDefault();
  moveFocus(element, setFocusedId);
}

function stepBy(context: TreeKeyEvent, offset: number) {
  const items = getVisibleItems(context.root);
  navigateTo(context, items[items.indexOf(context.current) + offset]);
}

/**
 * `Space` is deliberately unbound: the WAI-ARIA pattern reserves it for multi-select trees, which
 * are out of scope here but should not be precluded.
 */
const TREE_KEY_HANDLERS: Record<string, (context: TreeKeyEvent) => void> = {
  ArrowDown: (context) => stepBy(context, 1),
  ArrowUp: (context) => stepBy(context, -1),
  ArrowRight: (context) => {
    const { event, current, id, hasChildren, expanded, setExpanded } = context;
    if (hasChildren && !expanded) {
      event.preventDefault();
      setExpanded(id, true);
      return;
    }
    if (expanded) navigateTo(context, current.querySelector<HTMLElement>(ITEM_SELECTOR));
  },
  ArrowLeft: (context) => {
    const { event, current, id, expanded, setExpanded } = context;
    if (expanded) {
      event.preventDefault();
      setExpanded(id, false);
      return;
    }
    navigateTo(context, current.parentElement?.closest<HTMLElement>(ITEM_SELECTOR));
  },
  Home: (context) => navigateTo(context, getVisibleItems(context.root)[0]),
  End: (context) => {
    const items = getVisibleItems(context.root);
    navigateTo(context, items[items.length - 1]);
  },
  Enter: (context) => {
    if (context.disabled) return;
    context.event.preventDefault();
    context.activate(context.id, context.hasChildren, context.expanded);
  },
};

/* -------------------------------------------------------------------------------------------------
 * Tree
 * -----------------------------------------------------------------------------------------------*/

type TreeGuides = "none" | "hover" | "always";

type TreeProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  /** Expanded node ids (controlled). */
  expandedIds?: Set<string>;
  /** Initially expanded node ids (uncontrolled). */
  defaultExpandedIds?: Set<string>;
  onExpandedChange?: (expandedIds: Set<string>) => void;
  /** Selected node id (controlled). Pass `null` for "nothing selected". */
  selectedId?: string | null;
  /** Initially selected node id (uncontrolled). */
  defaultSelectedId?: string | null;
  onSelectedChange?: (selectedId: string) => void;
  /** Fired by `Enter` and by clicking a label — the node's default action. */
  onActivate?: (id: string) => void;
  /** Whether selecting a parent node also toggles its expansion. */
  expandOnSelect?: boolean;
  /**
   * Vertical indent guides joining each level to its parent. `"hover"` reveals them while the
   * pointer is anywhere over the tree, which keeps a dense tree quiet at rest but still lets you
   * trace a deep branch; `"always"` pins them on; `"none"` turns them off.
   */
  guides?: TreeGuides;
};

function Tree({
  className,
  children,
  expandedIds: expandedIdsProp,
  defaultExpandedIds,
  onExpandedChange,
  selectedId: selectedIdProp,
  defaultSelectedId = null,
  onSelectedChange,
  onActivate,
  expandOnSelect = true,
  guides = "hover",
  ...props
}: TreeProps) {
  const treeRef = React.useRef<HTMLDivElement>(null);

  const [expandedIds, setExpandedIds] = useControllableState<Set<string>>({
    prop: expandedIdsProp,
    defaultProp: defaultExpandedIds ?? new Set<string>(),
    onChange: onExpandedChange,
  });
  const [selectedId, setSelectedId] = useControllableState<string | null>({
    prop: selectedIdProp,
    defaultProp: defaultSelectedId,
    onChange: (id) => {
      if (id != null) onSelectedChange?.(id);
    },
  });
  const [focusedId, setFocusedId] = React.useState<string | null>(null);

  const setExpanded = React.useCallback(
    (id: string, expanded: boolean) => {
      setExpandedIds((current) => {
        const next = new Set(current);
        if (expanded) next.add(id);
        else next.delete(id);
        return next;
      });
    },
    [setExpandedIds],
  );

  const activateItem = React.useCallback(
    (activatedId: string, hasChildren: boolean, expanded: boolean) => {
      setSelectedId(activatedId);
      if (expandOnSelect && hasChildren) setExpanded(activatedId, !expanded);
      onActivate?.(activatedId);
    },
    [setSelectedId, expandOnSelect, setExpanded, onActivate],
  );

  const handleItemKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      const root = treeRef.current;
      const current = (event.target as HTMLElement | null)?.closest<HTMLElement>(ITEM_SELECTOR);
      const id = current?.dataset.treeItemId;
      if (!root || !current || !id || !root.contains(current)) return;

      const handler = TREE_KEY_HANDLERS[event.key];
      if (!handler) return;

      handler({
        event,
        root,
        current,
        id,
        hasChildren: current.dataset.treeHasChildren === "true",
        expanded: current.getAttribute("aria-expanded") === "true",
        disabled: current.getAttribute("aria-disabled") === "true",
        setExpanded,
        setFocusedId,
        activate: activateItem,
      });
    },
    [setExpanded, activateItem],
  );

  const context = React.useMemo<TreeContextValue>(
    () => ({
      expandedIds: expandedIds ?? new Set<string>(),
      setExpanded,
      selectedId: selectedId ?? null,
      activateItem,
      focusedId,
      setFocusedId,
      expandOnSelect,
      guides,
      onItemKeyDown: handleItemKeyDown,
    }),
    [expandedIds, setExpanded, selectedId, activateItem, focusedId, expandOnSelect, guides, handleItemKeyDown],
  );

  return (
    <TreeContext.Provider value={context}>
      <TreeLevelContext.Provider value={1}>
        <div
          ref={treeRef}
          data-slot="tree"
          data-guides={guides}
          role="tree"
          tabIndex={-1}
          // `group/tree` is what the `"hover"` guide mode hangs off: hovering anywhere in the tree
          // reveals every guide at once, so you can trace a branch without hunting row by row.
          className={cn("group/tree text-foreground flex w-full flex-col text-sm [--tree-indent:1rem]", className)}
          {...props}
        >
          <TreeItemsContainer>{children}</TreeItemsContainer>
        </div>
      </TreeLevelContext.Provider>
    </TreeContext.Provider>
  );
}

function TreeItemsContainer({ children }: { children: React.ReactNode }) {
  return useIndexedTreeChildren(children);
}

/* -------------------------------------------------------------------------------------------------
 * TreeItem
 * -----------------------------------------------------------------------------------------------*/

type TreeItemProps = React.ComponentProps<"div"> & {
  id: string;
  /**
   * Whether the node can be expanded. Kept explicit rather than inferred from rendered children so
   * a node whose children have not been fetched yet still reports `aria-expanded="false"`.
   */
  hasChildren?: boolean;
  disabled?: boolean;
};

function TreeItem({
  className,
  children,
  id,
  hasChildren = false,
  disabled = false,
  onClick,
  onFocus,
  onKeyDown,
  ...props
}: TreeItemProps) {
  const { expandedIds, setExpanded, selectedId, activateItem, focusedId, setFocusedId, onItemKeyDown } =
    useTreeContext("TreeItem");
  const level = React.useContext(TreeLevelContext);
  const { posinset, setsize } = React.useContext(TreeIndexContext);
  const labelId = `${React.useId()}-label`;

  const expanded = hasChildren && expandedIds.has(id);
  const selected = selectedId === id;

  const toggle = React.useCallback(() => {
    if (hasChildren) setExpanded(id, !expanded);
  }, [hasChildren, setExpanded, id, expanded]);

  // Routed through the tree's `activateItem` so a click and `Enter` are the same code path —
  // notably, both fire `onActivate`.
  const select = React.useCallback(() => {
    if (disabled) return;
    setFocusedId(id);
    activateItem(id, hasChildren, expanded);
  }, [disabled, setFocusedId, id, activateItem, hasChildren, expanded]);

  // Roving tabindex, minimal form: the focused node is the single tab stop, falling back to the
  // first root node before the tree has been entered. SW-2541 extends this (selection-aware entry
  // point, focus retention across collapse and lazy load).
  const tabbable = focusedId ? focusedId === id : level === 1 && posinset === 1;

  const itemContext = React.useMemo<TreeItemContextValue>(
    () => ({
      id,
      labelId,
      level,
      expanded,
      hasChildren,
      selected,
      disabled,
      isLastChild: posinset === setsize,
      toggle,
      select,
    }),
    [id, labelId, level, expanded, hasChildren, selected, disabled, posinset, setsize, toggle, select],
  );

  return (
    <TreeItemContext.Provider value={itemContext}>
      <div
        // Spread first, for the same reason as `TreeItemLabel`: every ARIA attribute below is
        // maintained by the tree and must not be overridable from props.
        {...props}
        data-slot="tree-item"
        data-tree-item-id={id}
        data-tree-has-children={hasChildren}
        data-state={expanded ? "expanded" : "collapsed"}
        role="treeitem"
        // The accessible name comes from the label alone. Without this, name-from-content would
        // sweep in every descendant node's text once a branch is expanded.
        aria-labelledby={labelId}
        aria-expanded={hasChildren ? expanded : undefined}
        aria-level={level}
        aria-posinset={posinset}
        aria-setsize={setsize}
        aria-selected={selected}
        aria-disabled={disabled || undefined}
        tabIndex={tabbable ? 0 : -1}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          onItemKeyDown(event);
        }}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          // Clicks on a descendant node are that node's business — every treeitem in the ancestor
          // chain sees the bubbled event.
          if ((event.target as HTMLElement).closest(ITEM_SELECTOR) !== event.currentTarget) return;
          select();
        }}
        onFocus={(event) => {
          onFocus?.(event);
          if (event.target === event.currentTarget) setFocusedId(id);
        }}
        className={cn(
          "outline-none",
          // Direct-child selectors, deliberately not `group-*/tree-item`: tree items nest, and a
          // group variant matches *any* ancestor, so a focused or selected parent painted its focus
          // ring onto every descendant row. Backgrounds live on the label for the same reason —
          // anything painted here would spread behind the whole subtree.
          "focus-visible:[&>[data-slot=tree-item-label]]:border-ring focus-visible:[&>[data-slot=tree-item-label]]:shadow-focus",
          className,
        )}
      >
        {children}
      </div>
    </TreeItemContext.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * TreeItemLabel
 * -----------------------------------------------------------------------------------------------*/

const treeItemLabelVariants = cva(
  "flex w-full min-w-0 cursor-default items-center gap-1.5 rounded-md pr-2 text-left transition-colors select-none",
  {
    variants: {
      size: {
        sm: "h-6 text-xs",
        default: "h-7 text-sm",
        lg: "h-9 text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

type TreeItemLabelProps = React.ComponentProps<"div"> &
  VariantProps<typeof treeItemLabelVariants> & {
    /**
     * Decorative leading icon, rendered between the chevron and the label text. Hidden from
     * assistive tech — the node's accessible name comes from the label text alone, so anything a
     * screen reader must convey belongs in the text, not here. Swap it on expansion (open/closed
     * folders) by reading `expanded` from `useTreeItem()` inside your own icon component.
     */
    icon?: React.ReactNode;
    /**
     * Right-aligned slot for per-node adornments — a count `Badge`, a `Spinner`, a status dot. It
     * sits inside the label, so its text joins the node's accessible name: a count reads as
     * "Onboarding 3", which is usually what you want. Wrap it in `aria-hidden` yourself for purely
     * decorative content such as a spinner.
     */
    trailing?: React.ReactNode;
  };

function TreeItemLabel({ className, children, size, style, icon, trailing, ...props }: TreeItemLabelProps) {
  const { labelId, level, expanded, hasChildren, selected, disabled, isLastChild, toggle } =
    useTreeItemContext("TreeItemLabel");
  const { guides } = useTreeContext("TreeItemLabel");

  // Connectors are drawn per row rather than per group: the label element *is* the row, so the
  // elbow can be sized in halves of it. A group box also wraps its descendants' rows, which makes
  // percentage heights meaningless there.
  const showGuides = guides !== "none" && level > 1;

  return (
    <div
      // Spread first: the derived ARIA wiring below is authoritative. A consumer-supplied `id` would
      // otherwise break the `TreeItem` → `aria-labelledby` link that names the node.
      {...props}
      id={labelId}
      data-slot="tree-item-label"
      // The row is a passive label, not a control: the parent `role="treeitem"` owns focus, click
      // handling, keyboard handling and the accessible name, so a nested control would fight it.
      style={
        {
          paddingInlineStart: `calc(var(--tree-indent) * ${level - 1} + 0.25rem)`,
          // Aligned to the parent's chevron centre, one indent step to the left of this row's own.
          "--tree-guide-left": `calc(var(--tree-indent) * ${level - 2} + 0.6875rem)`,
          ...style,
        } as React.CSSProperties
      }
      className={cn(
        treeItemLabelVariants({ size }),
        "relative border border-transparent",
        // Only selection paints a background — an open folder is already marked by its rotated
        // chevron, open-folder icon and the connectors running down from it.
        selected ? "bg-accent text-accent-foreground font-medium" : "hover:bg-muted",
        // From this node's own state, not an ancestor selector: `aria-disabled` is per-node, so a
        // disabled folder must not dim the contents underneath it.
        disabled && "pointer-events-none opacity-50",
        // `::before` is the elbow: down the row's top half at the guide line, then a rounded turn
        // to the right, pointing into this row. `::after` continues the trunk through the bottom
        // half — omitted on the last child, so the line terminates in the curve rather than running
        // past it. Consecutive rows chain into one continuous trunk.
        showGuides && [
          "before:border-muted-foreground/40 before:absolute before:top-0 before:left-[var(--tree-guide-left)]",
          "before:pointer-events-none before:h-1/2 before:w-2 before:rounded-bl-[0.5rem] before:border-b before:border-l before:content-['']",
          !isLastChild && [
            "after:bg-muted-foreground/40 after:absolute after:top-1/2 after:bottom-0",
            "after:left-[var(--tree-guide-left)] after:pointer-events-none after:w-px after:content-['']",
          ],
          guides === "hover" && [
            "before:opacity-0 before:transition-opacity group-hover/tree:before:opacity-100",
            "after:opacity-0 after:transition-opacity group-hover/tree:after:opacity-100",
            "motion-reduce:before:transition-none motion-reduce:after:transition-none",
          ],
        ],
        className,
      )}
    >
      {hasChildren ? (
        // A pointer-only affordance, deliberately not a `<button>`: expansion is reachable from the
        // keyboard through the parent treeitem's arrow keys, so this stays non-focusable. A focusable
        // element hidden from assistive tech is a contradiction, and inside a single-tab-stop widget
        // it would also be a second focus stop reachable by pointer.
        <span
          data-slot="tree-item-indicator"
          aria-hidden="true"
          onClick={(event) => {
            // Toggle from the chevron alone, without changing the selection.
            event.stopPropagation();
            toggle();
          }}
          className="flex size-3.5 shrink-0 items-center justify-center text-muted-foreground"
        >
          <ChevronRightIcon className={cn("size-3.5 transition-transform", expanded && "rotate-90")} />
        </span>
      ) : (
        <span data-slot="tree-item-indicator-spacer" aria-hidden="true" className="size-3.5 shrink-0" />
      )}
      {icon ? (
        <span
          data-slot="tree-item-icon"
          aria-hidden="true"
          className={cn(
            "flex size-4 shrink-0 items-center justify-center [&_svg]:size-4 [&_svg]:shrink-0",
            selected ? "text-accent-foreground" : "text-muted-foreground",
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {trailing ? (
        <span
          data-slot="tree-item-trailing"
          className="ml-auto flex shrink-0 items-center gap-1 [&_svg]:size-3.5"
        >
          {trailing}
        </span>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * TreeItemGroup
 * -----------------------------------------------------------------------------------------------*/

function TreeItemGroup({ className, children, ...props }: React.ComponentProps<"div">) {
  const { expanded, level } = useTreeItemContext("TreeItemGroup");

  // Not rendered while collapsed: keeps collapsed subtrees out of the accessibility tree entirely,
  // and makes DOM order equal visible order for keyboard traversal.
  if (!expanded) return null;

  return (
    <TreeLevelContext.Provider value={level + 1}>
      <div {...props} data-slot="tree-item-group" role="group" className={cn("flex flex-col", className)}>
        <TreeItemsContainer>{children}</TreeItemsContainer>
      </div>
    </TreeLevelContext.Provider>
  );
}

export {
  Tree,
  TreeItem,
  TreeItemGroup,
  TreeItemLabel,
  treeItemLabelVariants,
  useTreeItem,
  type TreeGuides,
  type TreeItemLabelProps,
  type TreeItemProps,
  type TreeProps,
};
