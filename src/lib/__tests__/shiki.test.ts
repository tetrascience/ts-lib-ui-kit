import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// getCodeBlockHighlighter dynamic-imports the shiki core, engine, and themes.
// Mock those so the highlighter can be built in jsdom without the real WASM /
// grammar payloads, and re-import the module per test to reset its caches.
const loadLanguage = vi.fn(async () => {});
const codeToTokens = vi.fn(() => ({ tokens: [], fg: "", bg: "" }));
const createHighlighterCore = vi.fn(async () => ({ loadLanguage, codeToTokens }));
const createJavaScriptRegexEngine = vi.fn(() => ({}));

vi.mock("shiki/core", () => ({ createHighlighterCore }));
vi.mock("shiki/engine/javascript", () => ({ createJavaScriptRegexEngine }));
vi.mock("@shikijs/themes/github-light", () => ({ default: { name: "github-light" } }));
vi.mock("@shikijs/themes/github-dark", () => ({ default: { name: "github-dark" } }));

describe("lib/shiki", () => {
  beforeEach(() => {
    vi.resetModules();
    loadLanguage.mockClear();
    codeToTokens.mockClear();
    createHighlighterCore.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolves canonical ids, aliases, and case/whitespace; returns null for unknown", async () => {
    const { resolveCodeBlockLanguage } = await import("../shiki");
    expect(resolveCodeBlockLanguage("python")).toBe("python");
    expect(resolveCodeBlockLanguage("py")).toBe("python");
    expect(resolveCodeBlockLanguage("JS")).toBe("javascript");
    expect(resolveCodeBlockLanguage("  Yml ")).toBe("yaml");
    expect(resolveCodeBlockLanguage("cobol")).toBeNull();
  });

  it("lists the default supported languages", async () => {
    const { getSupportedCodeBlockLanguages } = await import("../shiki");
    const langs = getSupportedCodeBlockLanguages();
    expect(langs).toEqual(
      expect.arrayContaining(["bash", "json", "python", "sql", "typescript", "yaml"]),
    );
  });

  it("registers an extra grammar with normalized aliases", async () => {
    const { registerCodeBlockLanguage, resolveCodeBlockLanguage } = await import("../shiki");
    registerCodeBlockLanguage("Rust", async () => ({ default: [] }), ["RS"]);
    expect(resolveCodeBlockLanguage("rust")).toBe("rust");
    expect(resolveCodeBlockLanguage("rs")).toBe("rust");
  });

  it("builds the core once and loads a supported grammar on demand", async () => {
    const { registerCodeBlockLanguage, getCodeBlockHighlighter } = await import("../shiki");
    const grammar = [{ name: "faketest" }];
    registerCodeBlockLanguage("faketest", async () => ({ default: grammar }));

    const first = await getCodeBlockHighlighter("faketest");
    expect(first.lang).toBe("faketest");
    expect(createHighlighterCore).toHaveBeenCalledTimes(1);
    expect(loadLanguage).toHaveBeenCalledWith(...grammar);

    // Second call reuses the cached core and the cached grammar load.
    const second = await getCodeBlockHighlighter("faketest");
    expect(second.lang).toBe("faketest");
    expect(createHighlighterCore).toHaveBeenCalledTimes(1);
    expect(loadLanguage).toHaveBeenCalledTimes(1);
  });

  it("falls back to plaintext (no grammar load) for an unsupported language", async () => {
    const { getCodeBlockHighlighter } = await import("../shiki");
    const { lang } = await getCodeBlockHighlighter("cobol");
    expect(lang).toBe("text");
    expect(loadLanguage).not.toHaveBeenCalled();
  });
});
