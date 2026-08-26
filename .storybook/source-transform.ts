/**
 * SW-audit: docs "Show code" must show component code, not story plumbing.
 *
 * Storybook only auto-generates a JSX snippet for *args stories*. A story
 * whose `render` takes no arguments (`render: () => …`) is classified as
 * "not an args story", so the docs Source block falls back to printing the
 * raw story-object source — `play` function, `parameters.zephyr`, and all.
 * Most stories in this kit use zero-arity renders, so their docs pages
 * printed test plumbing instead of usage code.
 *
 * This transform (wired globally via `parameters.docs.source.transform` in
 * preview.ts) rewrites that fallback: given the story-object source, it
 * extracts just the `render` value — the code a consumer would actually
 * write. Dynamic JSX snippets, hand-written `docs.source.code` overrides,
 * and anything it cannot confidently parse pass through unchanged
 * (explicit `code` even bypasses the transform entirely inside Storybook).
 *
 * It is deliberately line-based rather than a real parser: story sources are
 * Prettier-formatted, so top-level story-object properties always sit at a
 * 2-space indent, which raw JSX text (commas, apostrophes, parentheses in
 * prose) can't fake at that column. The only multi-line constructs that
 * could fake it — template literals — are tracked explicitly. A real parser
 * in the preview bundle (typescript/babel) would cost megabytes in the
 * deployed static Storybook for the same result.
 */

const PROP_LINE = /^(\s*)(?:async\s+)?([A-Za-z_$][\w$]*)\s*[:(]/;

/** Count unescaped backticks so template literals can span lines safely. */
const countUnescapedBackticks = (line: string): number => {
  let count = 0;
  for (let i = 0; i < line.length; i += 1) {
    if (line[i] === "`") {
      let backslashes = 0;
      for (let j = i - 1; j >= 0 && line[j] === "\\"; j -= 1) backslashes += 1;
      if (backslashes % 2 === 0) count += 1;
    }
  }
  return count;
};

/**
 * Remove the common leading indentation shared by all non-empty lines.
 * Lines that begin inside a template literal are literal content — they
 * neither contribute to the common indent nor get re-indented.
 */
const dedent = (lines: string[]): string[] => {
  let inTemplate = false;
  const startsInTemplate = lines.map((line) => {
    const state = inTemplate;
    if (countUnescapedBackticks(line) % 2 === 1) inTemplate = !inTemplate;
    return state;
  });
  const indents = lines
    .filter((line, i) => !startsInTemplate[i] && line.trim() !== "")
    .map((line) => line.match(/^ */)?.[0].length ?? 0);
  if (indents.length === 0) return lines;
  const common = Math.min(...indents);
  return lines.map((line, i) => {
    if (startsInTemplate[i]) return line;
    return line.trim() === "" ? "" : line.slice(common);
  });
};

const stripTrailingComma = (text: string): string =>
  text.replace(/,\s*$/, "");

/**
 * If the expression is the Prettier arrow wrapper `() => (\n <Jsx />\n)`,
 * unwrap the parentheses. Prettier always puts the wrapper's "(" and ")"
 * on their own lines, so no character-level parsing (which raw JSX text —
 * apostrophes, stray parens — would defeat) is needed. When the shape is
 * anything else, the (purely cosmetic) parens are kept.
 */
const unwrapSingleLineParens = (text: string): string => {
  if (!text.startsWith("(") || !text.endsWith(")")) return text;
  let depth = 0;
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === "(") depth += 1;
    if (text[i] === ")") {
      depth -= 1;
      if (depth === 0) return i === text.length - 1 ? text.slice(1, -1).trim() : text;
    }
  }
  return text;
};

const unwrapParens = (text: string): string => {
  const lines = text.split("\n");
  if (lines.length === 1) return unwrapSingleLineParens(text);
  if (lines[0].trim() === "(" && lines[lines.length - 1].trim() === ")") {
    return dedent(lines.slice(1, -1))
      .join("\n")
      .replace(/^\n+|\n+$/g, "");
  }
  return text;
};

/**
 * Normalize an extracted zero-arity arrow function into presentable code:
 * expression bodies become the bare expression; block bodies (stateful
 * demos using hooks) are presented as a `function Example()` component,
 * which is how a consumer would actually write them.
 */
const presentArrowFunction = (source: string): string | null => {
  const match = source.match(/^(?:async\s+)?\(\)\s*=>\s*/);
  if (!match) return null;
  const body = source.slice(match[0].length).trim();
  if (body === "") return null;
  if (body.startsWith("{") && body.endsWith("}")) {
    const inner = dedent(body.slice(1, -1).split("\n"))
      .join("\n")
      .replace(/^\n+|\n+$/g, "");
    if (inner.trim() === "") return null;
    const indented = inner
      .split("\n")
      .map((line) => (line === "" ? "" : `  ${line}`))
      .join("\n");
    return `function Example() {\n${indented}\n}`;
  }
  return unwrapParens(dedent(body.split("\n")).join("\n").trim());
};

/**
 * Extract the `render` property's value from Prettier-formatted story-object
 * source. Returns null when there is no top-level `render` or the shape is
 * not recognized.
 */
const extractRenderValue = (objectSource: string): string | null => {
  const lines = objectSource.split("\n");

  // Single-line story object, e.g. `{ render: () => <Skeleton /> }`.
  if (lines.length === 1) {
    const single = objectSource.match(/^\{\s*render:\s*(.*?),?\s*\}$/);
    return single ? single[1] : null;
  }

  const firstLine = lines[0]?.trim() ?? "";
  if (!firstLine.startsWith("{")) return null;

  // The story object may open with a property on the same line as the
  // brace (`{ render: () => <Demo />,`) — treat the remainder as line one.
  const firstLineRest = firstLine.slice(1).trim();
  const initialRest = firstLineRest.startsWith("render:")
    ? firstLineRest.slice("render:".length).trim()
    : null;

  const { renderRest, valueLines } = scanForRenderValue(
    lines.slice(1),
    initialRest,
  );

  if (renderRest === null) return null;
  const value = [renderRest, ...valueLines]
    .filter((line, index) => !(index === 0 && line === ""))
    .join("\n");
  const trimmed = stripTrailingComma(value.trimEnd());
  return trimmed.trim() === "" ? null : trimmed;
};

/** The story object's own closing brace sits below the property indent. */
const isObjectClosingBrace = (line: string, baseIndent: number | null) =>
  line.trim() === "}" &&
  (line.match(/^\s*/)?.[0].length ?? 0) < (baseIndent ?? 1);

interface ScanState {
  inTemplate: boolean;
  baseIndent: number | null;
  renderRest: string | null;
  valueLines: string[];
  done: boolean;
}

const scanLine = (line: string, state: ScanState): void => {
  const prop = state.inTemplate ? null : line.match(PROP_LINE);

  // The first property line establishes the object's property indent —
  // sources aren't guaranteed to be Prettier-formatted, so detect it.
  if (prop && state.baseIndent === null) state.baseIndent = prop[1].length;
  const isTopLevelProp = prop !== null && prop[1].length === state.baseIndent;

  if (state.renderRest === null) {
    if (isTopLevelProp && line.trimStart().startsWith("render:")) {
      state.renderRest = line.slice(line.indexOf(":") + 1).trim();
    }
  } else if (
    !state.inTemplate &&
    (isTopLevelProp || isObjectClosingBrace(line, state.baseIndent))
  ) {
    // Reached the next top-level property or the object's closing brace —
    // a render block body's own closing brace sits at property indent and
    // stays part of the value.
    state.done = true;
  } else {
    state.valueLines.push(line);
  }

  if (countUnescapedBackticks(line) % 2 === 1) {
    state.inTemplate = !state.inTemplate;
  }
};

const scanForRenderValue = (
  lines: string[],
  initialRest: string | null,
): { renderRest: string | null; valueLines: string[] } => {
  const state: ScanState = {
    inTemplate: false,
    baseIndent: null,
    renderRest: initialRest,
    valueLines: [],
    done: false,
  };
  for (const line of lines) {
    scanLine(line, state);
    if (state.done) break;
  }
  return state;
};

/**
 * Global `parameters.docs.source.transform`. Receives whatever the Source
 * block resolved: a dynamic JSX snippet (args stories — passed through), an
 * explicit `docs.source.code` (never reaches here; Storybook short-circuits
 * it), or the static story-object source (zero-arity renders — rewritten).
 */
export const transformStorySource = (code: string): string => {
  const trimmed = code.trim();

  // CSF2 function story (`export const X = () => …`).
  if (/^(?:async\s+)?\(\)\s*=>/.test(trimmed)) {
    return presentArrowFunction(trimmed) ?? code;
  }

  if (!trimmed.startsWith("{")) return code;

  const renderValue = extractRenderValue(trimmed);
  if (renderValue === null) return code;
  return presentArrowFunction(renderValue) ?? code;
};
