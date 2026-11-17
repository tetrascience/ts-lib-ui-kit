import * as React from "react";

import { diffTexts, foldUnchangedRows, toDiffRows } from "./diff-model";
import { classesOf, highlightDiff, lineKindOf } from "./highlight-diff";

import type { DiffFold, DiffRow, DiffViewer2Mode, TextDiff } from "./diff-model";
import type { DiffLineNode, HighlightedDiff } from "./highlight-diff";

import { withRef } from "@/lib/react18-compat";
import { cn } from "@/lib/utils";

export interface DiffViewer2Props extends Omit<React.ComponentProps<"div">, "children"> {
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
  mode?: DiffViewer2Mode;
  /** Height of the viewer. A number is pixels. Longer diffs scroll inside it. */
  height?: number | string;
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
  /** Text of the button that reveals a folded run of unchanged lines, given how many it hides. */
  expandUnchangedLabel?: (hiddenLineCount: number) => string;
}

/**
 * How much of its own colour text keeps, as `--diff-ink`; the rest is mixed
 * towards `--foreground`. On the plain surface every colour is used as it is.
 * The tints lower contrast, so text gives up only what each one costs: 88% on a
 * changed line, 40% on changed characters, where the line and character tints
 * stack. Those are the highest steps at which every `--shiki-*` colour stays AA
 * in both light and dark.
 */
const CHANGED_LINE_INK = "[--diff-ink:88%]";

/** Line numbers and the fold button. `--muted-foreground` alone is under AA on a dark tint. */
const SUBTLE_TEXT = "[color:color-mix(in_oklab,var(--muted-foreground)_68%,var(--foreground))]";
const TOKEN_TEXT = cn(
  "[color:color-mix(in_oklab,var(--shiki-light)_var(--diff-ink,100%),var(--foreground))]",
  "dark:[color:color-mix(in_oklab,var(--shiki-dark)_var(--diff-ink,100%),var(--foreground))]",
  "[font-style:var(--shiki-light-font-style)] dark:[font-style:var(--shiki-dark-font-style)]",
);

type CellKind = ReturnType<typeof lineKindOf> | "filler";

const CELL_TINT: Record<CellKind, string | undefined> = {
  added: cn("bg-diff-added-line", CHANGED_LINE_INK),
  removed: cn("bg-diff-removed-line", CHANGED_LINE_INK),
  unchanged: undefined,
  // The other side has a line here and this one does not.
  filler: "bg-muted/40",
};

const MARKER: Record<CellKind, { sign: string; className?: string }> = {
  added: { sign: "+", className: "[color:color-mix(in_oklab,var(--diff-added)_var(--diff-ink),var(--foreground))]" },
  removed: {
    sign: "-",
    className: "[color:color-mix(in_oklab,var(--diff-removed)_var(--diff-ink),var(--foreground))]",
  },
  unchanged: { sign: "" },
  filler: { sign: "" },
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

interface LineCellsProps {
  /** The `.line` element to show, or `undefined` where this side has no line on the row. */
  node: DiffLineNode | undefined;
  /** Line numbers to print, one cell each. Pass none to hide the number column. */
  numbers: Array<number | undefined>;
  wordWrap: boolean;
  className?: string;
}

/** The cells of one line: its number(s), its `+` / `-` marker and its code. */
function LineCells({ node, numbers, wordWrap, className }: LineCellsProps) {
  const kind: CellKind = node ? lineKindOf(node) : "filler";
  const tint = CELL_TINT[kind];
  return (
    <>
      {numbers.map((number, index) => (
        <td
          // The cells of one line are positional and never reorder.
          key={index === 0 ? "first" : "second"}
          data-slot="diff-viewer-2-line-number"
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
      <td
        data-slot="diff-viewer-2-marker"
        className={cn(
          "text-center align-top select-none",
          MARKER[kind].className,
          tint,
          numbers.length === 0 && className,
        )}
      >
        {MARKER[kind].sign}
      </td>
      <td
        data-slot="diff-viewer-2-line"
        data-diff={kind}
        className={cn(
          "pr-4 align-top",
          wordWrap ? "whitespace-pre-wrap [overflow-wrap:anywhere]" : "whitespace-pre",
          tint,
        )}
      >
        {node?.children?.map(renderNode)}
      </td>
    </>
  );
}

interface DiffContent extends HighlightedDiff {
  diff: TextDiff;
}

const lineAt = (lines: DiffLineNode[], index: number | undefined) => (index === undefined ? undefined : lines[index]);

const isFold = (row: DiffRow | DiffFold): row is DiffFold => "hidden" in row;

const foldKey = (fold: DiffFold) => `${fold.hidden[0].original}`;

const defaultExpandUnchangedLabel = (hiddenLineCount: number) => `Show ${hiddenLineCount} unchanged lines`;

const NO_FOLDS: ReadonlySet<string> = new Set();

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

interface DiffTableProps {
  content: DiffContent;
  rows: Array<DiffRow | DiffFold>;
  isSplit: boolean;
  lineNumbers: boolean;
  wordWrap: boolean;
  originalLabel: string;
  modifiedLabel: string;
  expandUnchangedLabel: (hiddenLineCount: number) => string;
  onExpandFold: (key: string) => void;
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
  expandUnchangedLabel,
  onExpandFold,
}: DiffTableProps) {
  const numberColumns = isSplit ? 1 : 2;
  const sideColumns = (lineNumbers ? numberColumns : 0) + 2;
  const lineCount = Math.max(content.diff.original.lines.length, content.diff.modified.lines.length);
  const numberWidth = `${String(lineCount).length + 2}ch`;
  // Without wrapping, the code columns take the room that is left and grow with their longest line.
  const codeWidth = isSplit ? "50%" : "100%";

  const sideCols = (
    <>
      {lineNumbers && <col style={{ width: numberWidth }} />}
      {lineNumbers && !isSplit && <col style={{ width: numberWidth }} />}
      <col style={{ width: "3ch" }} />
      <col style={wordWrap ? undefined : { width: codeWidth }} />
    </>
  );

  const renderLine = (row: DiffRow) => {
    const originalLine = lineAt(content.original, row.original);
    const modifiedLine = lineAt(content.modified, row.modified);
    if (!isSplit) {
      // An unchanged row shows the modified text; a changed row has one side only.
      const numbers = lineNumbers ? [row.original, row.modified] : [];
      return <LineCells node={modifiedLine ?? originalLine} numbers={numbers} wordWrap={wordWrap} />;
    }
    return (
      <>
        <LineCells node={originalLine} numbers={lineNumbers ? [row.original] : []} wordWrap={wordWrap} />
        <LineCells
          node={modifiedLine}
          numbers={lineNumbers ? [row.modified] : []}
          wordWrap={wordWrap}
          className="border-l"
        />
      </>
    );
  };

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
            <td colSpan={2} className="p-0" />
          </tr>
        </thead>
      )}
      <tbody>
        {rows.map((row) =>
          isFold(row) ? (
            <tr key={`fold-${foldKey(row)}`} data-slot="diff-viewer-2-fold">
              <td colSpan={isSplit ? sideColumns * 2 : sideColumns} className="border-y bg-muted/40 p-0">
                <button
                  type="button"
                  className={cn(
                    "block w-full px-3 py-1 text-left font-sans text-xs outline-none hover:bg-muted",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    SUBTLE_TEXT,
                  )}
                  onClick={() => onExpandFold(foldKey(row))}
                >
                  {expandUnchangedLabel(row.hidden.length)}
                </button>
              </td>
            </tr>
          ) : (
            <tr key={`${row.original ?? ""}:${row.modified ?? ""}`} data-slot="diff-viewer-2-row" className="h-5">
              {renderLine(row)}
            </tr>
          ),
        )}
      </tbody>
    </table>
  );
}

/**
 * Read-only diff of two texts, highlighted with Shiki: side-by-side or unified,
 * with line numbers, `+` / `-` markers, changed characters emphasised inside a
 * changed line, and optional folding of unchanged regions. An experimental
 * counterpart to the Monaco-based `DiffViewer`, with the same props, kept so
 * the two can be compared.
 *
 * The diff is plain DOM, a table, styled from the kit's tokens in CSS:
 * `--diff-added*` / `--diff-removed*` for the tints, `--card` and
 * `--foreground` for the surface and the `--shiki-*` tokens for syntax. Dark
 * mode and token overrides on any ancestor therefore apply without JavaScript,
 * and each viewer on a page can be themed on its own.
 *
 * `DiffViewer`'s `options` and `onMount` are Monaco's and have no equivalent
 * here. The viewer has no editor behind it: no find widget, minimap or overview
 * ruler, and in `split` mode the two sides scroll together.
 */
function DiffViewer2({
  original,
  modified,
  language = "plaintext",
  mode = "split",
  height = 400,
  lineNumbers = true,
  wordWrap = false,
  collapseUnchanged = false,
  ignoreTrimWhitespace = true,
  originalLabel = "Original",
  modifiedLabel = "Modified",
  loadingLabel = "Loading diff…",
  scrollRegionLabel = "Diff, scrollable",
  expandUnchangedLabel = defaultExpandUnchangedLabel,
  className,
  style,
  ...props
}: DiffViewer2Props) {
  const [content, setContent] = React.useState<DiffContent | null>(null);
  const [expandedFolds, setExpandedFolds] = React.useState(NO_FOLDS);

  React.useEffect(() => {
    let stale = false;
    const diff = diffTexts(original, modified, ignoreTrimWhitespace);
    const load = async () => {
      const highlighted = await highlightDiff(diff, language);
      if (stale) return;
      setContent({ diff, ...highlighted });
      setExpandedFolds(NO_FOLDS);
    };
    void load();
    return () => {
      stale = true;
    };
  }, [original, modified, ignoreTrimWhitespace, language]);

  const rows = React.useMemo(() => {
    if (!content) return [];
    const all = toDiffRows(content.diff.hunks, mode);
    if (!collapseUnchanged) return all;
    return foldUnchangedRows(all).flatMap((row) => (isFold(row) && expandedFolds.has(foldKey(row)) ? row.hidden : row));
  }, [content, mode, collapseUnchanged, expandedFolds]);

  const [scrollerRef, isScrollable] = useIsScrollable(content !== null);
  // `group`, not `region`: `region` is a landmark, and two viewers on a page would share its name.
  const scrollRegionProps = isScrollable ? { tabIndex: 0, role: "group", "aria-label": scrollRegionLabel } : undefined;

  return (
    <div
      data-slot="diff-viewer-2"
      data-mode={mode}
      data-state={content ? "ready" : "loading"}
      aria-busy={!content}
      className={cn("overflow-hidden rounded-lg border bg-card text-sm", className)}
      style={{ height, ...style }}
      {...props}
    >
      {content ? (
        <div
          ref={scrollerRef}
          data-slot="diff-viewer-2-scroller"
          className={cn(
            "relative size-full overflow-auto",
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
            expandUnchangedLabel={expandUnchangedLabel}
            onExpandFold={(key) => setExpandedFolds((expanded) => new Set(expanded).add(key))}
          />
        </div>
      ) : (
        <div className="flex size-full items-center justify-center text-muted-foreground">{loadingLabel}</div>
      )}
    </div>
  );
}

/** React 18 wrapper for {@link DiffViewer2}; see its documentation. */
// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
const DiffViewer2WithRef = withRef("DiffViewer2", DiffViewer2);

export { DiffViewer2WithRef as DiffViewer2 };
