import type { DiffSide, TextDiff } from "./diff-model";

import { getCodeBlockHighlighter } from "@/lib/shiki";
import { SHIKI_COLOR_REPLACEMENTS } from "@/lib/shiki-colors";

/** The slice of a hast node the viewer reads: Shiki's `.line` elements and what is inside them. */
export interface DiffLineNode {
  type: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: DiffLineNode[];
}

/** Both texts as one hast `.line` element per line, in line order. */
export interface HighlightedDiff {
  original: DiffLineNode[];
  modified: DiffLineNode[];
}

// Line classes follow `transformerNotationDiff`'s convention (`diff add` /
// `diff remove`), so the markup matches what Shiki users already style.
const REMOVED_LINE_CLASSES = ["diff", "remove"];
const ADDED_LINE_CLASSES = ["diff", "add"];
// `--diff-ink` is the viewer's contrast step for text on the stacked line and character tints.
const REMOVED_CHARS_CLASS = "diff-chars rounded-xs bg-diff-removed-text [--diff-ink:40%]";
const ADDED_CHARS_CLASS = "diff-chars rounded-xs bg-diff-added-text [--diff-ink:40%]";

/** A node's classes. Shiki writes `class` as a string or as a list, depending on who set it. */
export function classesOf(node: DiffLineNode): string[] {
  const value = node.properties?.class;
  if (Array.isArray(value)) return value.map(String);
  return typeof value === "string" ? value.split(/\s+/).filter(Boolean) : [];
}

/** Whether a `.line` element is an added line, a removed line, or neither. */
export function lineKindOf(node: DiffLineNode): "added" | "removed" | "unchanged" {
  const classes = classesOf(node);
  if (!classes.includes("diff")) return "unchanged";
  return classes.includes("add") ? "added" : "removed";
}

/** The `.line` elements of a `codeToHast` result: `root > pre > code > .line`. */
function linesOf(root: DiffLineNode): DiffLineNode[] {
  const code = root.children?.[0]?.children?.[0];
  return (code?.children ?? []).filter((node) => node.type === "element");
}

/** The same shape `codeToHast` gives, without syntax colours or character ranges. */
function plainLines(side: DiffSide, lineClasses: string[]): DiffLineNode[] {
  const changed = new Set(side.changedLines);
  return side.lines.map((line, index) => ({
    type: "element",
    properties: { class: changed.has(index) ? ["line", ...lineClasses] : ["line"] },
    children: line ? [{ type: "text", value: line }] : [],
  }));
}

/**
 * Highlight both sides of a diff with the kit's shared Shiki highlighter.
 * Changed lines are stamped by `transformerCompactLineOptions` and changed
 * characters wrapped by Shiki decorations, so the diff state travels in the
 * hast itself. If Shiki cannot load or highlight, the result is the same
 * structure with plain text: still a complete diff, without syntax colours or
 * character emphasis.
 */
export async function highlightDiff(diff: TextDiff, language: string): Promise<HighlightedDiff> {
  try {
    const [{ highlighter, lang }, { transformerCompactLineOptions }] = await Promise.all([
      getCodeBlockHighlighter(language),
      import("@shikijs/transformers"),
    ]);
    const highlight = (side: DiffSide, lineClasses: string[], charsClass: string) =>
      linesOf(
        highlighter.codeToHast(side.lines.join("\n"), {
          lang,
          themes: { light: "github-light", dark: "github-dark" },
          // Colours arrive as `--shiki-light` / `--shiki-dark` only; the viewer's CSS picks one.
          defaultColor: false,
          colorReplacements: SHIKI_COLOR_REPLACEMENTS,
          transformers: [
            transformerCompactLineOptions(side.changedLines.map((line) => ({ line: line + 1, classes: lineClasses }))),
          ],
          decorations: side.charRanges.map(({ line, start, end }) => ({
            start: { line, character: start },
            end: { line, character: end },
            properties: { class: charsClass },
          })),
        }) as DiffLineNode,
      );
    return {
      original: highlight(diff.original, REMOVED_LINE_CLASSES, REMOVED_CHARS_CLASS),
      modified: highlight(diff.modified, ADDED_LINE_CLASSES, ADDED_CHARS_CLASS),
    };
  } catch {
    return {
      original: plainLines(diff.original, REMOVED_LINE_CLASSES),
      modified: plainLines(diff.modified, ADDED_LINE_CLASSES),
    };
  }
}
