import { ArrowDownFromLineIcon, ArrowUpFromLineIcon, UnfoldVerticalIcon } from "lucide-react";
import * as React from "react";

import {
  diffTexts,
  FOLD_EXPAND_STEP,
  foldUnchangedRows,
  hunkHeaderAfter,
  revealFoldedRows,
  toDiffRows,
} from "./diff-model";
import {
  ADDED_LINE_TINT,
  ADDED_MARKER_TEXT,
  FOLD_GUTTER,
  FOLD_SURFACE,
  QUIET_SURFACE,
  REMOVED_LINE_TINT,
  REMOVED_MARKER_TEXT,
  SUBTLE_TEXT,
  TOKEN_TEXT,
} from "./diff-styles";
import { classesOf, highlightDiff, lineKindOf } from "./highlight-diff";

import type { CodeDiffMode, DiffFold, DiffRow, FoldReveal, TextDiff } from "./diff-model";
import type { DiffLineNode, HighlightedDiff } from "./highlight-diff";

import { withRef } from "@/lib/react18-compat";
import { cn } from "@/lib/utils";

export interface CodeDiffProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** The "before" text, shown on the left in `split` mode. */
  original: string;
  /** The "after" text, shown on the right in `split` mode. */
  modified: string;
  /**
   * Language used to syntax-highlight both sides (`"json"`, `"python"`, …): any
   * language of the kit's Shiki highlighter, including those added with
   * `registerCodeBlockLanguage`. Anything else renders as plain text.
   */
  language?: string;
  /** Layout of the diff. `split` stays side by side at every width. */
  mode?: CodeDiffMode;
  /**
   * Tallest the viewer may grow. A number is pixels. By default it is as tall
   * as the diff; with a limit, a longer diff scrolls inside the viewer.
   */
  maxHeight?: number | string;
  /** Show line numbers. */
  lineNumbers?: boolean;
  /** Wrap long lines instead of scrolling horizontally. */
  wordWrap?: boolean;
  /** Fold runs of unchanged lines, leaving a few lines of context around each change. */
  collapseUnchanged?: boolean;
  /** Treat lines that differ only in leading or trailing whitespace as unchanged. */
  ignoreTrimWhitespace?: boolean;
  /** Screen-reader heading of the columns holding the `original` text and its line numbers. */
  originalLabel?: string;
  /** Screen-reader heading of the columns holding the `modified` text and its line numbers. */
  modifiedLabel?: string;
  /** Text shown while the highlighter loads. */
  loadingLabel?: string;
  /** Accessible name of the diff while it is large enough to scroll, when it becomes a tab stop. */
  scrollRegionLabel?: string;
  /** Accessible name and tooltip of the button that reveals a folded run of unchanged lines, given how many it hides. */
  expandUnchangedLabel?: (hiddenLineCount: number) => string;
  /**
   * Accessible name and tooltip of the button that reveals the next 20 hidden
   * lines above the code below a fold. Folds of more than 20 lines open in steps.
   */
  expandUpLabel?: string;
  /** As `expandUpLabel`, for the button that reveals the next 20 hidden lines below the code above a fold. */
  expandDownLabel?: string;
  /**
   * Controls for one line, such as an "add comment" button or a menu, rendered
   * in a gutter column beside the line's code. Called for every line shown;
   * return `null` for a line that has none. Declaring the prop adds the column.
   */
  renderLineActions?: (line: CodeDiffLine) => React.ReactNode;
  /**
   * When a line's actions show: `hover` (default) reveals them while the
   * pointer is over the line on that side, while focus is inside them, or
   * while one of them is expanded (`aria-expanded="true"`); on a device
   * without hover they always show.
   */
  lineActionsVisibility?: "hover" | "always";
  /**
   * Content attached to one line and rendered in a full-width row beneath it,
   * such as a comment thread or a lint message. Called for every line shown;
   * return `null` for a line that has none. In `split` mode it sits under its
   * own side of the diff.
   */
  renderLineAnnotation?: (line: CodeDiffLine) => React.ReactNode;
}

/** One line of the diff, as handed to `renderLineActions` and `renderLineAnnotation`. */
export interface CodeDiffLine {
  /**
   * Which text the line belongs to. An unchanged line in `unified` mode is
   * shown once and reported as `modified`.
   */
  side: "original" | "modified";
  /** One-based line number within that text. */
  lineNumber: number;
  /** Whether the line was added, removed or left as it was. */
  kind: "added" | "removed" | "unchanged";
  /** The line's text, without its line break. */
  text: string;
}

type DiffSideName = CodeDiffLine["side"];
type CellKind = CodeDiffLine["kind"] | "filler";

const CELL_TINT: Record<CellKind, string | undefined> = {
  added: ADDED_LINE_TINT,
  removed: REMOVED_LINE_TINT,
  unchanged: undefined,
  // The other side has a line here and this one does not.
  filler: QUIET_SURFACE,
};

const MARKER: Record<CellKind, { sign: string; className?: string }> = {
  added: { sign: "+", className: ADDED_MARKER_TEXT },
  removed: { sign: "-", className: REMOVED_MARKER_TEXT },
  unchanged: { sign: "" },
  filler: { sign: "" },
};

// Spelled out per side: Tailwind reads class names from the source text.
const REVEAL_ON_HOVER: Record<DiffSideName, string> = {
  original: "in-[tr:has([data-side=original]:hover)]:opacity-100",
  modified: "in-[tr:has([data-side=modified]:hover)]:opacity-100",
};

/** Shiki writes inline styles as a `prop:value;…` string; React wants an object. */
function parseStyle(style: unknown): React.CSSProperties | undefined {
  if (typeof style !== "string" || !style) return undefined;
  const entries = style
    .split(";")
    .map((declaration) => declaration.split(/:(.*)/s))
    .filter(([property, value]) => property && value)
    .map(([property, value]) => [property.trim(), value.trim()]);
  return Object.fromEntries(entries) as React.CSSProperties;
}

/** Render what is inside a `.line` element: token spans, and the spans wrapping changed characters. */
function renderNode(node: DiffLineNode, key: number): React.ReactNode {
  if (node.type === "text") return node.value;
  const style = parseStyle(node.properties?.style);
  return (
    <span key={key} className={cn(classesOf(node), style && TOKEN_TEXT)} style={style}>
      {node.children?.map(renderNode)}
    </span>
  );
}

/** A line as it is drawn: what consumers are told about it, and its highlighted content. */
interface DrawnLine extends CodeDiffLine {
  node: DiffLineNode;
}

interface LineSlots {
  renderLineActions?: (line: CodeDiffLine) => React.ReactNode;
  lineActionsVisibility: "hover" | "always";
  renderLineAnnotation?: (line: CodeDiffLine) => React.ReactNode;
}

/** What a render prop is told about a line: everything but the viewer's own hast node. */
const describeLine = ({ side, lineNumber, kind, text }: DrawnLine): CodeDiffLine => ({
  side,
  lineNumber,
  kind,
  text,
});

interface LineCellsProps {
  /** The line to show, or `undefined` where this side has no line on the row. */
  line: DrawnLine | undefined;
  /** Which side's hover reveals the actions. */
  side: DiffSideName;
  /** Line numbers to print, one cell each. Pass none to hide the number column. */
  numbers: Array<number | undefined>;
  wordWrap: boolean;
  slots: LineSlots;
  className?: string;
}

/** The cells of one line: its number(s), its actions, its `+` / `-` marker and its code. */
function LineCells({ line, side, numbers, wordWrap, slots, className }: LineCellsProps) {
  const kind: CellKind = line?.kind ?? "filler";
  const tint = CELL_TINT[kind];
  const { renderLineActions } = slots;
  return (
    <>
      {numbers.map((number, index) => (
        <td
          // The cells of one line are positional and never reorder.
          key={index === 0 ? "first" : "second"}
          data-slot="code-diff-line-number"
          data-side={side}
          className={cn(
            "px-[1ch] text-right align-top whitespace-nowrap tabular-nums select-none",
            SUBTLE_TEXT,
            tint,
            index === 0 && className,
          )}
        >
          {number === undefined ? null : number + 1}
        </td>
      ))}
      {renderLineActions && (
        <td data-slot="code-diff-line-actions" data-side={side} className={cn("p-0 align-top font-sans", tint)}>
          {line && (
            <div
              className={cn(
                "flex h-5 items-center justify-center",
                slots.lineActionsVisibility === "hover" && [
                  "opacity-0 focus-within:opacity-100 has-[[aria-expanded=true]]:opacity-100",
                  "[@media(hover:none)]:opacity-100",
                  REVEAL_ON_HOVER[side],
                ],
              )}
            >
              {renderLineActions(describeLine(line))}
            </div>
          )}
        </td>
      )}
      <td
        data-slot="code-diff-marker"
        data-side={side}
        className={cn(
          "text-center align-top select-none",
          MARKER[kind].className,
          tint,
          numbers.length === 0 && !renderLineActions && className,
        )}
      >
        {MARKER[kind].sign}
      </td>
      <td
        data-slot="code-diff-line"
        data-side={side}
        data-diff={kind}
        className={cn(
          "pr-4 align-top",
          wordWrap ? "whitespace-pre-wrap [overflow-wrap:anywhere]" : "whitespace-pre",
          tint,
        )}
      >
        {line?.node.children?.map(renderNode)}
      </td>
    </>
  );
}

interface DiffContent extends HighlightedDiff {
  diff: TextDiff;
}

/** The line at `index` of one side, or `undefined` where a row has no line on that side. */
function drawnLine(content: DiffContent, side: DiffSideName, index: number | undefined): DrawnLine | undefined {
  const node = index === undefined ? undefined : content[side][index];
  if (index === undefined || !node) return undefined;
  return { side, lineNumber: index + 1, kind: lineKindOf(node), text: content.diff[side].lines[index], node };
}

const isFold = (row: DiffRow | DiffFold): row is DiffFold => "hidden" in row;

/** Where a fold sits in the diff. One that is both first and last has lines on neither side. */
function foldPosition(index: number, rowCount: number): "top" | "middle" | "bottom" {
  if (rowCount === 1) return "middle";
  if (index === 0) return "top";
  return index === rowCount - 1 ? "bottom" : "middle";
}

const defaultExpandUnchangedLabel = (hiddenLineCount: number) => `Show ${hiddenLineCount} unchanged lines`;

const NO_REVEALS: Readonly<Record<string, FoldReveal>> = {};

/** A fold's reveal after one press of an expand button. */
function expandFold(reveal: FoldReveal = { top: 0, bottom: 0 }, direction: FoldDirection): FoldReveal {
  if (direction === "all") return { top: Number.POSITIVE_INFINITY, bottom: 0 };
  // Expanding down continues the code above the fold; expanding up, the code below it.
  return direction === "down"
    ? { ...reveal, top: reveal.top + FOLD_EXPAND_STEP }
    : { ...reveal, bottom: reveal.bottom + FOLD_EXPAND_STEP };
}

/**
 * Whether the element behind the returned ref overflows. The diff scrolls
 * inside the viewer, so a keyboard user must be able to reach it; a diff that
 * fits is not worth a tab stop.
 */
function useIsScrollable(isMounted: boolean) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = React.useState(false);
  React.useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const measure = () =>
      setIsScrollable(
        scroller.scrollHeight > scroller.clientHeight + 1 || scroller.scrollWidth > scroller.clientWidth + 1,
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    if (scroller.firstElementChild) observer.observe(scroller.firstElementChild);
    return () => observer.disconnect();
  }, [isMounted]);
  return [scrollerRef, isScrollable] as const;
}

/** A column heading that only assistive technology reads. */
function ColumnHeading({ label, span }: { label: string; span: number }) {
  return (
    <th scope="col" colSpan={span} className="p-0 font-normal">
      <span className="sr-only">{label}</span>
    </th>
  );
}

interface DiffLineRowsProps {
  /** The line on each side of the row. `unified` rows carry one line, as `modified` when unchanged. */
  original: DrawnLine | undefined;
  modified: DrawnLine | undefined;
  row: DiffRow;
  isSplit: boolean;
  lineNumbers: boolean;
  wordWrap: boolean;
  /** Columns one side spans, for an annotation under it. */
  sideColumns: number;
  slots: LineSlots;
}

/** One row of the diff, and the row of annotations under it when a line has one. */
function DiffLineRows({
  original,
  modified,
  row,
  isSplit,
  lineNumbers,
  wordWrap,
  sideColumns,
  slots,
}: DiffLineRowsProps) {
  const annotate = (line: DrawnLine | undefined) => (line ? slots.renderLineAnnotation?.(describeLine(line)) : null);
  const annotations = [annotate(original), annotate(modified)];
  const hasAnnotation = annotations.some((annotation) => annotation != null && annotation !== false);
  const annotationCell = "border-y p-0 align-top font-sans whitespace-normal";

  return (
    <>
      <tr data-slot="code-diff-row" className="h-5">
        {isSplit ? (
          <>
            <LineCells
              line={original}
              side="original"
              numbers={lineNumbers ? [row.original] : []}
              wordWrap={wordWrap}
              slots={slots}
            />
            <LineCells
              line={modified}
              side="modified"
              numbers={lineNumbers ? [row.modified] : []}
              wordWrap={wordWrap}
              slots={slots}
              className="border-l"
            />
          </>
        ) : (
          <LineCells
            line={modified ?? original}
            side={modified ? "modified" : "original"}
            numbers={lineNumbers ? [row.original, row.modified] : []}
            wordWrap={wordWrap}
            slots={slots}
          />
        )}
      </tr>
      {hasAnnotation && (
        <tr data-slot="code-diff-annotation">
          {isSplit ? (
            <>
              <td colSpan={sideColumns} data-side="original" className={annotationCell}>
                {annotations[0]}
              </td>
              <td colSpan={sideColumns} data-side="modified" className={cn(annotationCell, "border-l")}>
                {annotations[1]}
              </td>
            </>
          ) : (
            <td colSpan={sideColumns} data-side={modified ? "modified" : "original"} className={annotationCell}>
              {annotations[1] ?? annotations[0]}
            </td>
          )}
        </tr>
      )}
    </>
  );
}

type FoldDirection = "up" | "down" | "all";

interface FoldLabels {
  expandUnchangedLabel: (hiddenLineCount: number) => string;
  expandUpLabel: string;
  expandDownLabel: string;
}

const FOLD_BUTTON = cn(
  "flex w-10 flex-1 items-center justify-center outline-none",
  SUBTLE_TEXT,
  "hover:bg-primary hover:[color:var(--primary-foreground)]",
  "focus-visible:bg-primary focus-visible:[color:var(--primary-foreground)]",
);

/**
 * The buttons a fold offers. A short run, or one with no lines on either side,
 * opens in one go. A longer one opens a step at a time towards the lines it
 * hides: up from the code below it, down from the code above it, or both when
 * it sits between two changes.
 */
function foldButtons(position: "top" | "middle" | "bottom", hiddenCount: number, labels: FoldLabels) {
  const up = { direction: "up", label: labels.expandUpLabel, Icon: ArrowUpFromLineIcon } as const;
  const down = { direction: "down", label: labels.expandDownLabel, Icon: ArrowDownFromLineIcon } as const;
  if (hiddenCount <= FOLD_EXPAND_STEP) {
    const all = {
      direction: "all",
      label: labels.expandUnchangedLabel(hiddenCount),
      Icon: UnfoldVerticalIcon,
    } as const;
    return [all];
  }
  if (position === "top") return [up];
  return position === "bottom" ? [down] : [down, up];
}

interface FoldRowProps {
  fold: DiffFold;
  /** Hunk header of the lines shown after the fold, if any follow. */
  header: string | undefined;
  position: "top" | "middle" | "bottom";
  columns: number;
  labels: FoldLabels;
  onExpand: (direction: FoldDirection) => void;
}

/** A folded run of unchanged lines: expand buttons in the gutter and the next hunk's header. */
function FoldRow({ fold, header, position, columns, labels, onExpand }: FoldRowProps) {
  return (
    <tr data-slot="code-diff-fold">
      <td colSpan={columns} className={cn("p-0", FOLD_SURFACE)}>
        <div className="flex items-stretch">
          <div className={cn("flex shrink-0 flex-col", FOLD_GUTTER)}>
            {foldButtons(position, fold.hidden.length, labels).map(({ direction, label, Icon }) => (
              <button
                key={direction}
                type="button"
                aria-label={label}
                title={label}
                className={cn(FOLD_BUTTON, "min-h-5")}
                onClick={() => onExpand(direction)}
              >
                <Icon aria-hidden className="size-3.5" />
              </button>
            ))}
          </div>
          {header && (
            <span
              data-slot="code-diff-hunk-header"
              className={cn("flex min-h-6 items-center px-3 select-none", SUBTLE_TEXT)}
            >
              {header}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

interface DiffTableProps {
  content: DiffContent;
  rows: Array<DiffRow | DiffFold>;
  isSplit: boolean;
  lineNumbers: boolean;
  wordWrap: boolean;
  originalLabel: string;
  modifiedLabel: string;
  foldLabels: FoldLabels;
  onExpandFold: (key: string, direction: FoldDirection) => void;
  slots: LineSlots;
}

/** The diff itself: one table row per line, or per pair of lines in `split` mode. */
function DiffTable({
  content,
  rows,
  isSplit,
  lineNumbers,
  wordWrap,
  originalLabel,
  modifiedLabel,
  foldLabels,
  onExpandFold,
  slots,
}: DiffTableProps) {
  const numberColumns = isSplit ? 1 : 2;
  const hasActions = slots.renderLineActions !== undefined;
  const sideColumns = (lineNumbers ? numberColumns : 0) + (hasActions ? 1 : 0) + 2;
  const lineCount = Math.max(content.diff.original.lines.length, content.diff.modified.lines.length);
  const numberWidth = `${String(lineCount).length + 2}ch`;
  // Without wrapping, the code columns take the room that is left and grow with their longest line.
  const codeWidth = isSplit ? "50%" : "100%";

  const sideCols = (
    <>
      {lineNumbers && <col style={{ width: numberWidth }} />}
      {lineNumbers && !isSplit && <col style={{ width: numberWidth }} />}
      {hasActions && <col style={{ width: "1.75rem" }} />}
      <col style={{ width: "3ch" }} />
      <col style={wordWrap ? undefined : { width: codeWidth }} />
    </>
  );

  return (
    <table
      className={cn(
        "w-full border-separate border-spacing-0 font-mono text-xs leading-5 text-[var(--shiki-fg)]",
        wordWrap && "table-fixed",
      )}
    >
      <colgroup>
        {sideCols}
        {isSplit && sideCols}
      </colgroup>
      {isSplit && (
        <thead>
          <tr>
            <ColumnHeading label={originalLabel} span={sideColumns} />
            <ColumnHeading label={modifiedLabel} span={sideColumns} />
          </tr>
        </thead>
      )}
      {!isSplit && lineNumbers && (
        // Unified text is a mix of both sides; the labels say which numbering is which.
        <thead>
          <tr>
            <ColumnHeading label={originalLabel} span={1} />
            <ColumnHeading label={modifiedLabel} span={1} />
            <td colSpan={sideColumns - 2} className="p-0" />
          </tr>
        </thead>
      )}
      <tbody>
        {rows.map((row, index) =>
          isFold(row) ? (
            <FoldRow
              key={`fold-${row.key}`}
              fold={row}
              header={hunkHeaderAfter(rows, index)}
              position={foldPosition(index, rows.length)}
              columns={isSplit ? sideColumns * 2 : sideColumns}
              labels={foldLabels}
              onExpand={(direction) => onExpandFold(row.key, direction)}
            />
          ) : (
            <DiffLineRows
              key={`${row.original ?? ""}:${row.modified ?? ""}`}
              // In `unified` an unchanged row is drawn once, from the modified text.
              original={isSplit || row.changed ? drawnLine(content, "original", row.original) : undefined}
              modified={drawnLine(content, "modified", row.modified)}
              row={row}
              isSplit={isSplit}
              lineNumbers={lineNumbers}
              wordWrap={wordWrap}
              sideColumns={sideColumns}
              slots={slots}
            />
          ),
        )}
      </tbody>
    </table>
  );
}

/**
 * Read-only diff of two texts, highlighted with Shiki: side-by-side or unified,
 * with line numbers, `+` / `-` markers, changed characters emphasised inside a
 * changed line, and optional folding of unchanged regions.
 *
 * The diff is plain DOM, a table, styled from the kit's tokens in CSS:
 * `--diff-added*` / `--diff-removed*` for the tints, `--card` and
 * `--foreground` for the surface and the `--shiki-*` tokens for syntax. Dark
 * mode and token overrides on any ancestor therefore apply without JavaScript,
 * and each viewer on a page can be themed on its own.
 *
 * `renderLineActions` and `renderLineAnnotation` put your own components on a
 * line: controls in its gutter, and content in a row beneath it. The viewer
 * keeps no state for them; which lines have a comment box open is yours.
 *
 * The viewer has no editor behind it: no find widget or minimap, every line is
 * in the DOM, and in `split` mode the two sides scroll together.
 */
function CodeDiff({
  original,
  modified,
  language = "plaintext",
  mode = "split",
  maxHeight,
  lineNumbers = true,
  wordWrap = false,
  collapseUnchanged = false,
  ignoreTrimWhitespace = true,
  originalLabel = "Original",
  modifiedLabel = "Modified",
  loadingLabel = "Loading diff…",
  scrollRegionLabel = "Diff, scrollable",
  expandUnchangedLabel = defaultExpandUnchangedLabel,
  expandUpLabel = "Expand up",
  expandDownLabel = "Expand down",
  renderLineActions,
  lineActionsVisibility = "hover",
  renderLineAnnotation,
  className,
  style,
  ...props
}: CodeDiffProps) {
  const [content, setContent] = React.useState<DiffContent | null>(null);
  const [revealedFolds, setRevealedFolds] = React.useState(NO_REVEALS);

  React.useEffect(() => {
    let stale = false;
    const diff = diffTexts(original, modified, ignoreTrimWhitespace);
    const load = async () => {
      const highlighted = await highlightDiff(diff, language);
      if (stale) return;
      setContent({ diff, ...highlighted });
      setRevealedFolds(NO_REVEALS);
    };
    void load();
    return () => {
      stale = true;
    };
  }, [original, modified, ignoreTrimWhitespace, language]);

  const rows = React.useMemo(() => {
    if (!content) return [];
    const all = toDiffRows(content.diff.hunks, mode);
    return collapseUnchanged ? revealFoldedRows(foldUnchangedRows(all), revealedFolds) : all;
  }, [content, mode, collapseUnchanged, revealedFolds]);

  const [scrollerRef, isScrollable] = useIsScrollable(content !== null);
  // `group`, not `region`: `region` is a landmark, and two viewers on a page would share its name.
  const scrollRegionProps = isScrollable ? { tabIndex: 0, role: "group", "aria-label": scrollRegionLabel } : undefined;

  return (
    <div
      data-slot="code-diff"
      data-mode={mode}
      data-state={content ? "ready" : "loading"}
      aria-busy={!content}
      className={cn("flex flex-col overflow-hidden rounded-lg border bg-card text-sm", className)}
      style={{ maxHeight, ...style }}
      {...props}
    >
      {content ? (
        <div
          ref={scrollerRef}
          data-slot="code-diff-scroller"
          className={cn(
            "relative min-h-0 flex-1 overflow-auto",
            isScrollable && "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          )}
          {...scrollRegionProps}
        >
          <DiffTable
            content={content}
            rows={rows}
            isSplit={mode === "split"}
            lineNumbers={lineNumbers}
            wordWrap={wordWrap}
            originalLabel={originalLabel}
            modifiedLabel={modifiedLabel}
            foldLabels={{ expandUnchangedLabel, expandUpLabel, expandDownLabel }}
            onExpandFold={(key, direction) =>
              setRevealedFolds((revealed) => ({ ...revealed, [key]: expandFold(revealed[key], direction) }))
            }
            slots={{ renderLineActions, lineActionsVisibility, renderLineAnnotation }}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center px-3 py-6 text-muted-foreground">{loadingLabel}</div>
      )}
    </div>
  );
}

/** React 18 wrapper for {@link CodeDiff}; see its documentation. */
// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const CodeDiffWithRef = withRef("CodeDiff", CodeDiff);

export { CodeDiffWithRef as CodeDiff };
