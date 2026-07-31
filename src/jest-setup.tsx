/**
 * Single-file Jest support for consumers. Add one line to jest.config:
 *
 *   module.exports = {
 *     testEnvironment: "jsdom",
 *     setupFiles: ["@tetrascience-npm/tetrascience-react-ui/jest-setup"],
 *   };
 *
 * The kit ships dual ESM + CJS output, so Jest's CommonJS runtime loads every
 * kit module directly. What Jest cannot load are the few third-party deps
 * that publish ESM-only (streamdown, use-stick-to-bottom,
 * react-resizable-panels, shiki/@shikijs) and the optional peers a consumer
 * may not have installed (plotly.js-dist, @streamdown/math|mermaid). On
 * import this file registers lightweight functional stubs for exactly those
 * via `jest.mock(id, factory)` and installs the jsdom shims Radix-based
 * components need. Everything else in the kit runs for real.
 *
 * Registration strategy: non-virtual first — Jest then keys the mock by the
 * resolved module path, which matches what kit modules load because this
 * file ships inside the kit package (same dependency context under npm and
 * pnpm layouts alike). When resolution fails — the package publishes
 * `import`-only exports Jest's CJS resolver can't see (e.g. streamdown), or
 * it's an optional peer that isn't installed — fall back to
 * `{ virtual: true }`: virtual mocks of bare specifiers are keyed by the
 * specifier itself, so they intercept the kit's `require` without any
 * resolution.
 *
 * Overrides: a consumer's own `jest.mock("<id>", …)` — in a test file or a
 * later setup file — replaces any registration made here.
 *
 * Maintenance: when the kit gains a static import of a new ESM-only package
 * (`"type": "module"`, no `require` export condition), add a registration
 * here or Jest consumers regress to `ERR_REQUIRE_ESM`.
 */
import type { CSSProperties, ReactNode } from "react";

// ---------------------------------------------------------------------------
// Plotly stub — jsdom has no layout or WebGL, so chart tests assert on the
// calls the kit makes into Plotly rather than on rendered output. `newPlot`/
// `react` attach the plot-event API to the target element (kit code registers
// hover/click handlers on it) and resolve it; tests can fire those handlers
// through the element's `emit`.
// ---------------------------------------------------------------------------

type PlotHandler = (payload: unknown) => void;

export interface MockPlotElement extends HTMLElement {
  on: (event: string, handler: PlotHandler) => void;
  once: (event: string, handler: PlotHandler) => void;
  removeListener: (event: string, handler: PlotHandler) => void;
  removeAllListeners: (event?: string) => void;
  emit: (event: string, payload?: unknown) => void;
}

function attachPlotEvents(el: HTMLElement): MockPlotElement {
  const plotEl = el as MockPlotElement;
  const listeners = new Map<string, Set<PlotHandler>>();

  plotEl.on = (event, handler) => {
    const set = listeners.get(event) ?? new Set<PlotHandler>();
    set.add(handler);
    listeners.set(event, set);
  };
  plotEl.once = (event, handler) => {
    const onceHandler: PlotHandler = (payload) => {
      plotEl.removeListener(event, onceHandler);
      handler(payload);
    };
    plotEl.on(event, onceHandler);
  };
  plotEl.removeListener = (event, handler) => {
    listeners.get(event)?.delete(handler);
  };
  plotEl.removeAllListeners = (event) => {
    if (event) {
      listeners.delete(event);
    } else {
      listeners.clear();
    }
  };
  plotEl.emit = (event, payload) => {
    for (const handler of listeners.get(event) ?? []) {
      handler(payload);
    }
  };
  return plotEl;
}

export const plotlyStub = {
  newPlot: (el: HTMLElement): Promise<MockPlotElement> =>
    Promise.resolve(attachPlotEvents(el)),
  react: (el: HTMLElement): Promise<MockPlotElement> =>
    Promise.resolve(attachPlotEvents(el)),
  relayout: (el: HTMLElement): Promise<HTMLElement> => Promise.resolve(el),
  restyle: (el: HTMLElement): Promise<HTMLElement> => Promise.resolve(el),
  update: (el: HTMLElement): Promise<HTMLElement> => Promise.resolve(el),
  addTraces: (el: HTMLElement): Promise<HTMLElement> => Promise.resolve(el),
  deleteTraces: (el: HTMLElement): Promise<HTMLElement> => Promise.resolve(el),
  extendTraces: (el: HTMLElement): Promise<HTMLElement> => Promise.resolve(el),
  purge: (): void => {},
  setPlotConfig: (): void => {},
  toImage: (): Promise<string> => Promise.resolve("data:image/png;base64,"),
  downloadImage: (): Promise<string> => Promise.resolve("mock-download"),
  Plots: {
    resize: (): Promise<void> => Promise.resolve(),
  },
};

// ---------------------------------------------------------------------------
// streamdown stub — renders the markdown source as plain text so
// text-content assertions on `MessageResponse` / `Reasoning` keep working
// without transpiling the unified markdown ecosystem.
// ---------------------------------------------------------------------------

export interface StreamdownStubProps {
  children?: ReactNode;
  className?: string;
  [prop: string]: unknown;
}

export function StreamdownStub({ children, className }: StreamdownStubProps) {
  return (
    <div data-slot="streamdown-mock" className={className}>
      {children}
    </div>
  );
}

/** Inert factory for `@streamdown/*` plugin packages (cjk, math, mermaid). */
export const streamdownPluginStub = (): Record<string, never> => ({});

// ---------------------------------------------------------------------------
// use-stick-to-bottom stub — used by `Conversation`. jsdom has no scrolling
// to pin, so containers render plainly and report the view as at the bottom.
// ---------------------------------------------------------------------------

interface ContainerStubProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  role?: string;
  [prop: string]: unknown;
}

function StickToBottomRoot({ children, className, style, role }: ContainerStubProps) {
  return (
    <div data-slot="stick-to-bottom-mock" className={className} style={style} role={role}>
      {children}
    </div>
  );
}

function StickToBottomContent({ children, className, style }: ContainerStubProps) {
  return (
    <div data-slot="stick-to-bottom-content-mock" className={className} style={style}>
      {children}
    </div>
  );
}

export const StickToBottomStub = Object.assign(StickToBottomRoot, {
  Content: StickToBottomContent,
});

const stickToBottomContext = {
  isAtBottom: true,
  scrollToBottom: (): void => {},
  stopScroll: (): void => {},
};

export function useStickToBottomContextStub(): typeof stickToBottomContext {
  return stickToBottomContext;
}

export function useStickToBottomStub(): typeof stickToBottomContext & {
  scrollRef: (node: HTMLElement | null) => void;
  contentRef: (node: HTMLElement | null) => void;
} {
  return { ...stickToBottomContext, scrollRef: () => {}, contentRef: () => {} };
}

// ---------------------------------------------------------------------------
// react-resizable-panels stub — used by `Resizable*`. jsdom has no layout,
// so panels render as plain containers; drag/resize is not simulated.
// ---------------------------------------------------------------------------

export function ResizableGroupStub({ children, className, style }: ContainerStubProps) {
  return (
    <div data-slot="resizable-group-mock" className={className} style={style}>
      {children}
    </div>
  );
}

export function ResizablePanelStub({ children, className, style }: ContainerStubProps) {
  return (
    <div data-slot="resizable-panel-mock" className={className} style={style}>
      {children}
    </div>
  );
}

export function ResizableSeparatorStub({ children, className, style }: ContainerStubProps) {
  return (
    <div
      data-slot="resizable-separator-mock"
      role="separator"
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// shiki stub — serves the subpaths the kit's slim highlighter
// (`src/lib/shiki.ts`) dynamic-imports. The stub highlighter tokenizes each
// line as one unstyled token, so `CodeBlock` renders the raw code.
// ---------------------------------------------------------------------------

interface StubToken {
  content: string;
  color: string;
}

export interface StubHighlighterCore {
  codeToTokens: (
    code: string,
    options?: unknown,
  ) => { bg: string; fg: string; tokens: StubToken[][] };
  codeToHtml: (code: string, options?: unknown) => string;
  loadLanguage: (...grammars: unknown[]) => Promise<void>;
  getLoadedLanguages: () => string[];
  dispose: () => void;
}

function escapeHtml(code: string): string {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function createHighlighterCoreStub(): Promise<StubHighlighterCore> {
  return Promise.resolve({
    codeToTokens: (code: string) => ({
      bg: "transparent",
      fg: "inherit",
      tokens: code
        .split("\n")
        .map((line) => [{ content: line, color: "inherit" }]),
    }),
    codeToHtml: (code: string) => `<pre><code>${escapeHtml(code)}</code></pre>`,
    loadLanguage: () => Promise.resolve(),
    getLoadedLanguages: () => [],
    dispose: () => {},
  });
}

/** Languages the kit's `CodeBlock` highlighter loads by id (src/lib/shiki.ts). */
export const KIT_SHIKI_LANGUAGES = [
  "bash",
  "javascript",
  "json",
  "markdown",
  "python",
  "sql",
  "tsx",
  "typescript",
  "yaml",
] as const;

// ---------------------------------------------------------------------------
// Registration + jsdom shims
// ---------------------------------------------------------------------------

/** Structural subset of Jest's `jest` object — avoids @types/jest. */
export interface JestMockApi {
  mock: (
    moduleName: string,
    factory?: () => unknown,
    options?: { virtual?: boolean },
  ) => unknown;
}

/**
 * Register stubs for every ESM-only / optional-peer module the kit reaches.
 * Non-virtual when the module resolves, virtual fallback when it doesn't —
 * see the module docblock.
 */
export function installUiKitJestMocks(jestApi: JestMockApi): void {
  const tryMock = (moduleName: string, factory: () => unknown): void => {
    try {
      jestApi.mock(moduleName, factory);
    } catch {
      jestApi.mock(moduleName, factory, { virtual: true });
    }
  };
  const streamdownPlugins = {
    cjk: streamdownPluginStub,
    code: streamdownPluginStub,
    math: streamdownPluginStub,
    mermaid: streamdownPluginStub,
  };

  tryMock("plotly.js-dist", () => plotlyStub);
  tryMock("streamdown", () => ({
    Streamdown: StreamdownStub,
    default: StreamdownStub,
  }));
  tryMock("use-stick-to-bottom", () => ({
    StickToBottom: StickToBottomStub,
    useStickToBottomContext: useStickToBottomContextStub,
    useStickToBottom: useStickToBottomStub,
  }));
  tryMock("react-resizable-panels", () => ({
    Group: ResizableGroupStub,
    Panel: ResizablePanelStub,
    Separator: ResizableSeparatorStub,
    // Pre-v4 API names, for consumer code using the library directly.
    PanelGroup: ResizableGroupStub,
    PanelResizeHandle: ResizableSeparatorStub,
  }));
  tryMock("@streamdown/cjk", () => streamdownPlugins);
  tryMock("@streamdown/math", () => streamdownPlugins);
  tryMock("@streamdown/mermaid", () => streamdownPlugins);
  tryMock("shiki/core", () => ({
    createHighlighterCore: createHighlighterCoreStub,
  }));
  tryMock("shiki/engine/javascript", () => ({
    createJavaScriptRegexEngine: () => ({}),
  }));
  tryMock("@shikijs/themes/github-light", () => ({ default: {} }));
  tryMock("@shikijs/themes/github-dark", () => ({ default: {} }));
  for (const lang of KIT_SHIKI_LANGUAGES) {
    // Grammars are spread into `loadLanguage(...grammar.default)` — an empty
    // array is inert there.
    tryMock(`@shikijs/langs/${lang}`, () => ({ default: [] }));
  }
}

type MutableGlobal = Record<string, unknown>;

class ResizeObserverShim {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

class IntersectionObserverShim {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): unknown[] {
    return [];
  }
}

/**
 * Install the browser APIs jsdom lacks but the kit's components touch —
 * ResizeObserver (charts, sidebar), matchMedia (sonner, hooks),
 * IntersectionObserver, pointer capture and scrollIntoView (Radix menus and
 * selects). Install-if-missing, so a consumer's own polyfills always win.
 */
export function installUiKitDomShims(): void {
  const globalRef = globalThis as unknown as MutableGlobal;

  if (typeof globalRef.ResizeObserver === "undefined") {
    globalRef.ResizeObserver = ResizeObserverShim;
  }
  if (typeof globalRef.IntersectionObserver === "undefined") {
    globalRef.IntersectionObserver = IntersectionObserverShim;
  }

  if (typeof window === "undefined") {
    return;
  }

  if (typeof window.matchMedia === "undefined") {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList;
  }

  const elementProto = window.Element.prototype as unknown as MutableGlobal;
  if (typeof elementProto.scrollIntoView === "undefined") {
    elementProto.scrollIntoView = () => {};
  }
  if (typeof elementProto.scrollTo === "undefined") {
    elementProto.scrollTo = () => {};
  }
  if (typeof elementProto.hasPointerCapture === "undefined") {
    elementProto.hasPointerCapture = () => false;
  }
  if (typeof elementProto.setPointerCapture === "undefined") {
    elementProto.setPointerCapture = () => {};
  }
  if (typeof elementProto.releasePointerCapture === "undefined") {
    elementProto.releasePointerCapture = () => {};
  }
}

// Side effect on import: active only under Jest. The `jest` object is not a
// true global — Jest injects it into every module as a wrapper parameter —
// so it must be read as a free variable behind a `typeof` guard, which also
// keeps this module inert everywhere else (bundlers, Vitest, tooling).
declare const jest: JestMockApi | undefined;

const jestObject =
  typeof jest !== "undefined" && jest && typeof jest.mock === "function"
    ? jest
    : undefined;
if (jestObject) {
  installUiKitDomShims();
  installUiKitJestMocks(jestObject);
}
