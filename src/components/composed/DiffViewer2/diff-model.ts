import { diffArrays, diffWordsWithSpace } from "diff";

/** `split` shows the two texts side by side; `unified` interleaves them in one column. */
export type DiffViewer2Mode = "split" | "unified";

/** A run of changed characters inside one line: `[start, end)` in UTF-16 units. */
export interface DiffCharRange {
  /** Zero-based line index. */
  line: number;
  start: number;
  end: number;
}

/** One side's share of a diff: which lines changed, and which characters inside them. */
export interface DiffSide {
  /** The text split into lines, the way Shiki splits it. */
  lines: string[];
  /** Zero-based indices of the lines that are removed (original) or added (modified). */
  changedLines: number[];
  /** Changed characters inside a changed line that has a counterpart on the other side. */
  charRanges: DiffCharRange[];
}

/** A block of the diff: a run of unchanged line pairs, or a run of removed and added lines. */
export interface DiffHunk {
  changed: boolean;
  /** Zero-based line indices on each side. Equal in length when the hunk is unchanged. */
  original: number[];
  modified: number[];
}

export interface TextDiff {
  original: DiffSide;
  modified: DiffSide;
  hunks: DiffHunk[];
}

/** One rendered line of the diff. A side is `undefined` where the row has no line there. */
export interface DiffRow {
  original?: number;
  modified?: number;
  changed: boolean;
}

/** A run of unchanged rows folded away by `collapseUnchanged`. */
export interface DiffFold {
  hidden: DiffRow[];
}

/** Unchanged lines kept visible around each change when folding. */
export const FOLD_CONTEXT_LINES = 3;
/** Runs shorter than this are not worth a fold row. */
export const FOLD_MIN_LINES = 3;

const splitLines = (text: string) => text.split(/\r?\n/);

/** Length of a string without its whitespace. */
const inkLength = (text: string) => text.replace(/\s+/g, "").length;

const range = (start: number, count: number) => Array.from({ length: count }, (_, i) => start + i);

/**
 * The characters that differ between a removed line and the added line it is
 * paired with. Returns nothing unless the two lines have at least half of the
 * longer one's text in common: below that the line was replaced, not edited,
 * and emphasising most of its characters would only repeat the line tint.
 */
function diffLineChars(original: string, modified: string) {
  const removed: Array<[number, number]> = [];
  const added: Array<[number, number]> = [];
  let originalAt = 0;
  let modifiedAt = 0;
  let shared = 0;
  for (const part of diffWordsWithSpace(original, modified)) {
    const length = part.value.length;
    if (part.removed) {
      removed.push([originalAt, originalAt + length]);
      originalAt += length;
    } else if (part.added) {
      added.push([modifiedAt, modifiedAt + length]);
      modifiedAt += length;
    } else {
      shared += inkLength(part.value);
      originalAt += length;
      modifiedAt += length;
    }
  }
  const edited = shared * 2 >= Math.max(inkLength(original), inkLength(modified));
  return edited && shared > 0 ? { removed, added } : { removed: [], added: [] };
}

/** Line diff of two texts, with character ranges for the lines that changed in place. */
export function diffTexts(original: string, modified: string, ignoreTrimWhitespace: boolean): TextDiff {
  const originalSide: DiffSide = { lines: splitLines(original), changedLines: [], charRanges: [] };
  const modifiedSide: DiffSide = { lines: splitLines(modified), changedLines: [], charRanges: [] };
  const hunks: DiffHunk[] = [];
  let originalAt = 0;
  let modifiedAt = 0;
  let pending: DiffHunk | undefined;

  const flush = () => {
    if (!pending) return;
    const { original: removed, modified: added } = pending;
    originalSide.changedLines.push(...removed);
    modifiedSide.changedLines.push(...added);
    // Removed and added lines pair up in order; the pair shows what changed inside the line.
    for (let i = 0; i < Math.min(removed.length, added.length); i++) {
      const chars = diffLineChars(originalSide.lines[removed[i]], modifiedSide.lines[added[i]]);
      for (const [start, end] of chars.removed) originalSide.charRanges.push({ line: removed[i], start, end });
      for (const [start, end] of chars.added) modifiedSide.charRanges.push({ line: added[i], start, end });
    }
    hunks.push(pending);
    pending = undefined;
  };

  const chunks = diffArrays(originalSide.lines, modifiedSide.lines, {
    comparator: ignoreTrimWhitespace ? (a, b) => a.trim() === b.trim() : undefined,
  });
  for (const chunk of chunks) {
    const count = chunk.value.length;
    if (chunk.removed) {
      pending ??= { changed: true, original: [], modified: [] };
      pending.original.push(...range(originalAt, count));
      originalAt += count;
    } else if (chunk.added) {
      pending ??= { changed: true, original: [], modified: [] };
      pending.modified.push(...range(modifiedAt, count));
      modifiedAt += count;
    } else {
      flush();
      hunks.push({ changed: false, original: range(originalAt, count), modified: range(modifiedAt, count) });
      originalAt += count;
      modifiedAt += count;
    }
  }
  flush();

  return { original: originalSide, modified: modifiedSide, hunks };
}

/**
 * Lay the hunks out as rows. `split` puts a removed line and the added line it
 * pairs with on one row; `unified` lists the removed lines, then the added ones.
 */
export function toDiffRows(hunks: DiffHunk[], mode: DiffViewer2Mode): DiffRow[] {
  return hunks.flatMap((hunk): DiffRow[] => {
    if (!hunk.changed) {
      return hunk.original.map((line, i) => ({ original: line, modified: hunk.modified[i], changed: false }));
    }
    if (mode === "unified") {
      return [
        ...hunk.original.map((line) => ({ original: line, changed: true })),
        ...hunk.modified.map((line) => ({ modified: line, changed: true })),
      ];
    }
    return range(0, Math.max(hunk.original.length, hunk.modified.length)).map((i) => ({
      original: hunk.original[i],
      modified: hunk.modified[i],
      changed: true,
    }));
  });
}

/**
 * Fold each run of unchanged rows, keeping {@link FOLD_CONTEXT_LINES} rows of
 * context next to a change. Runs that would hide fewer than
 * {@link FOLD_MIN_LINES} rows are left alone.
 */
export function foldUnchangedRows(rows: DiffRow[]): Array<DiffRow | DiffFold> {
  const folded: Array<DiffRow | DiffFold> = [];
  let start = 0;
  while (start < rows.length) {
    if (rows[start].changed) {
      folded.push(rows[start]);
      start += 1;
      continue;
    }
    let end = start;
    while (end < rows.length && !rows[end].changed) end += 1;
    // No context is owed at the very top or bottom of the diff.
    const hideFrom = start === 0 ? start : start + FOLD_CONTEXT_LINES;
    const hideTo = end === rows.length ? end : end - FOLD_CONTEXT_LINES;
    if (hideTo - hideFrom >= FOLD_MIN_LINES) {
      folded.push(...rows.slice(start, hideFrom), { hidden: rows.slice(hideFrom, hideTo) }, ...rows.slice(hideTo, end));
    } else {
      folded.push(...rows.slice(start, end));
    }
    start = end;
  }
  return folded;
}
