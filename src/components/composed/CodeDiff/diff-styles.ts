import { cn } from "@/lib/utils";

/*
 * Text colours on a diff. Every colour keeps `--diff-ink` of itself and takes
 * the rest from `--foreground`. On the plain surface that is 100%: syntax
 * colours are used as they are. The tints lower contrast, so text gives up only
 * what each one costs: 88% on a changed line, 40% on changed characters, where
 * the line and character tints stack. Those are the highest steps at which every
 * `--shiki-*` colour stays WCAG AA (4.5:1) in both light and dark; the
 * `Token Contrast` story checks each combination.
 */

/** Set on every cell of a changed line. */
export const CHANGED_LINE_INK = "[--diff-ink:88%]";

/** Set on the span wrapping changed characters, which sits on both tints. */
const CHANGED_CHARS_INK = "[--diff-ink:40%]";

export const ADDED_LINE_TINT = cn("bg-diff-added-line", CHANGED_LINE_INK);
export const REMOVED_LINE_TINT = cn("bg-diff-removed-line", CHANGED_LINE_INK);
export const ADDED_CHARS_CLASS = cn("diff-chars rounded-xs bg-diff-added-text", CHANGED_CHARS_INK);
export const REMOVED_CHARS_CLASS = cn("diff-chars rounded-xs bg-diff-removed-text", CHANGED_CHARS_INK);

/** A row with no line on this side, the fold row, and an annotation's surround. */
export const QUIET_SURFACE = "bg-muted/40";

/** A syntax token. Shiki sets `--shiki-light` / `--shiki-dark` inline on each one. */
export const TOKEN_TEXT = cn(
  "[color:color-mix(in_oklab,var(--shiki-light)_var(--diff-ink,100%),var(--foreground))]",
  "dark:[color:color-mix(in_oklab,var(--shiki-dark)_var(--diff-ink,100%),var(--foreground))]",
  "[font-style:var(--shiki-light-font-style)] dark:[font-style:var(--shiki-dark-font-style)]",
);

/** Line numbers and the fold button. `--muted-foreground` alone is under AA on a dark tint. */
export const SUBTLE_TEXT = "[color:color-mix(in_oklab,var(--muted-foreground)_68%,var(--foreground))]";

/** The `+` and `-` markers, in the diff hue. */
export const ADDED_MARKER_TEXT = "[color:color-mix(in_oklab,var(--diff-added)_var(--diff-ink),var(--foreground))]";
export const REMOVED_MARKER_TEXT = "[color:color-mix(in_oklab,var(--diff-removed)_var(--diff-ink),var(--foreground))]";
