import type { Monaco } from "@monaco-editor/react";

/**
 * The kit's diff tokens (`src/index.tailwind.css`), keyed by the role each plays
 * in the diff. `added` / `removed` are the solid hues; `…Line` tints a whole
 * changed line and `…Text` the changed characters inside it.
 */
export const DIFF_COLOR_TOKENS = {
  added: "--diff-added",
  addedLine: "--diff-added-line",
  addedText: "--diff-added-text",
  removed: "--diff-removed",
  removedLine: "--diff-removed-line",
  removedText: "--diff-removed-text",
} as const;

export type DiffColorRole = keyof typeof DIFF_COLOR_TOKENS;

/** Diff colours as `#rrggbbaa`. A role is missing when its token could not be resolved. */
export type DiffColors = Partial<Record<DiffColorRole, string>>;

/** Which Monaco theme colours each diff role drives. */
const MONACO_COLOR_KEYS: Record<DiffColorRole, readonly string[]> = {
  added: ["diffEditorOverview.insertedForeground"],
  addedLine: ["diffEditor.insertedLineBackground", "diffEditorGutter.insertedLineBackground"],
  addedText: ["diffEditor.insertedTextBackground"],
  removed: ["diffEditorOverview.removedForeground"],
  removedLine: ["diffEditor.removedLineBackground", "diffEditorGutter.removedLineBackground"],
  removedText: ["diffEditor.removedTextBackground"],
};

const toHexByte = (channel: number) => Math.round(channel).toString(16).padStart(2, "0");

/** `[r, g, b, a]` bytes to the `#rrggbbaa` form Monaco themes require. */
export function rgbaToHex(rgba: ArrayLike<number>): string {
  return `#${toHexByte(rgba[0])}${toHexByte(rgba[1])}${toHexByte(rgba[2])}${toHexByte(rgba[3])}`;
}

/**
 * Convert any CSS colour the browser understands (`oklch(…)`, `color-mix(…)`,
 * `rgb(…)`) to `#rrggbbaa` by painting one pixel. Monaco themes accept hex
 * only, and the kit's tokens are oklch. Returns `undefined` where there is no
 * 2D canvas (jsdom, SSR).
 */
export function cssColorToHex(color: string, doc: Document = document): string | undefined {
  const context = doc.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!context) return undefined;
  context.canvas.width = 1;
  context.canvas.height = 1;
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  return rgbaToHex(context.getImageData(0, 0, 1, 1).data);
}

/**
 * Contrast boost for text. Code sits on the red and green tints as well as on the
 * plain background, so a colour that is only just AA on the background fails on
 * a tint. Mixing each one towards `--foreground` (darker in light mode, lighter
 * in dark) buys the headroom while keeping the hue.
 */
const boosted = (token: string) => `color-mix(in oklab, var(${token}) 30%, var(--foreground))`;

/** Monaco theme colours other than the diff roles: the editor surface, from kit tokens. */
const EDITOR_COLORS: Record<string, { requires: string; css: string }> = {
  "editor.background": { requires: "--card", css: "var(--card)" },
  "editor.foreground": { requires: "--foreground", css: "var(--foreground)" },
  "editorLineNumber.foreground": { requires: "--muted-foreground", css: boosted("--muted-foreground") },
  // Monaco dims the number of a trailing empty line to a colour that is not AA.
  "editorLineNumber.dimmedForeground": { requires: "--muted-foreground", css: boosted("--muted-foreground") },
  "editorLineNumber.activeForeground": { requires: "--foreground", css: "var(--foreground)" },
};

/**
 * Syntax colours, from the same `--shiki-*` tokens `CodeBlock` uses. Monaco
 * matches token scopes by prefix, so these few rules cover every language.
 */
const SYNTAX_TOKENS: Record<string, string> = {
  "": "--shiki-fg",
  comment: "--shiki-comment",
  string: "--shiki-string",
  "string.key": "--shiki-tag",
  keyword: "--shiki-keyword",
  number: "--shiki-constant",
  constant: "--shiki-constant",
  regexp: "--shiki-constant",
  type: "--shiki-entity",
  tag: "--shiki-entity",
  namespace: "--shiki-entity",
  annotation: "--shiki-entity",
  "attribute.name": "--shiki-tag",
  "attribute.value": "--shiki-string",
  variable: "--shiki-variable",
};

/** What {@link defineDiffTheme} hands to Monaco, resolved from the kit's tokens. */
export interface DiffThemeData {
  colors: Record<string, string>;
  rules: Array<{ token: string; foreground: string }>;
}

/**
 * Runs `read` with a resolver that turns a CSS colour expression into
 * `#rrggbbaa` as it computes at `scope`, so a token override on any ancestor of
 * the viewer is honoured. The resolver returns `undefined` when a token the
 * expression `requires` is not defined there, or where colours cannot be
 * computed (jsdom, SSR).
 */
function withColorResolver<T>(
  scope: HTMLElement,
  read: (resolve: (css: string, requires: string) => string | undefined) => T,
): T {
  const doc = scope.ownerDocument;
  const view = doc.defaultView;
  const scopeStyle = view?.getComputedStyle(scope);
  // A probe turns the expression into a computed colour: a custom property
  // itself computes to its source text (`color-mix(in oklab, oklch(…) 10%, transparent)`).
  const probe = doc.createElement("span");
  probe.style.display = "none";
  scope.appendChild(probe);
  try {
    return read((css, requires) => {
      if (!view || !scopeStyle?.getPropertyValue(requires).trim()) return;
      probe.style.color = css;
      return cssColorToHex(view.getComputedStyle(probe).color, doc);
    });
  } finally {
    probe.remove();
  }
}

/**
 * Read the diff tokens as they resolve at `scope`. A token that is not defined
 * there is left out, and Monaco keeps its own colour for that role.
 */
export function resolveDiffColors(scope: HTMLElement): DiffColors {
  return withColorResolver(scope, (resolve) => {
    const colors: DiffColors = {};
    for (const role of Object.keys(DIFF_COLOR_TOKENS) as DiffColorRole[]) {
      const hex = resolve(`var(${DIFF_COLOR_TOKENS[role]})`, DIFF_COLOR_TOKENS[role]);
      if (hex) colors[role] = hex;
    }
    return colors;
  });
}

/** Resolve everything the Monaco theme needs from the kit's tokens at `scope`. */
export function resolveDiffTheme(scope: HTMLElement): DiffThemeData {
  const diff = resolveDiffColors(scope);
  return withColorResolver(scope, (resolve) => {
    const colors: Record<string, string> = {};
    for (const role of Object.keys(diff) as DiffColorRole[]) {
      for (const key of MONACO_COLOR_KEYS[role]) colors[key] = diff[role] as string;
    }
    for (const [key, { requires, css }] of Object.entries(EDITOR_COLORS)) {
      const hex = resolve(css, requires);
      if (hex) colors[key] = hex;
    }

    const rules: DiffThemeData["rules"] = [];
    for (const [token, source] of Object.entries(SYNTAX_TOKENS)) {
      const hex = resolve(boosted(source), source);
      // Rules take `rrggbb`: drop the `#` and the (opaque) alpha byte.
      if (hex) rules.push({ token, foreground: hex.slice(1, 7) });
    }
    return { colors, rules };
  });
}

/** Name of the Monaco theme the viewer registers for the current colour scheme. */
export function diffThemeName(isDark: boolean): string {
  return isDark ? "ts-ui-kit-diff-dark" : "ts-ui-kit-diff-light";
}

/**
 * Register (or refresh) the viewer's Monaco theme from the kit's tokens: the
 * diff colours, the editor surface and the syntax colours. Where the tokens
 * cannot be resolved (`scope` is not mounted, or the kit's CSS is not loaded)
 * the theme is Monaco's stock light or dark theme under the viewer's name.
 */
export function defineDiffTheme(monaco: Monaco, isDark: boolean, scope: HTMLElement | null): string {
  const { colors, rules } = scope ? resolveDiffTheme(scope) : { colors: {}, rules: [] };
  const name = diffThemeName(isDark);
  monaco.editor.defineTheme(name, {
    base: isDark ? "vs-dark" : "vs",
    // The kit's syntax rules replace the stock ones outright; inheriting would
    // let a more specific stock rule (`string.value.json`) win over them.
    inherit: rules.length === 0,
    rules,
    colors,
  });
  return name;
}
