import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// The plugin delegates highlighting to the shared slim highlighter in
// @/lib/shiki; mock it so tests control resolution, the async result, and the
// error path without pulling the real shiki core.
const codeToTokens = vi.fn(() => ({ tokens: [[{ content: "x" }]], fg: "#fff", bg: "#000" }));
const getCodeBlockHighlighter = vi.fn(async (lang: string) => ({
  highlighter: { codeToTokens },
  lang: lang === "cobol" ? "text" : lang,
}));
const resolveCodeBlockLanguage = vi.fn((lang: string) =>
  lang === "cobol" ? null : lang,
);

vi.mock("@/lib/shiki", () => ({
  getCodeBlockHighlighter,
  getSupportedCodeBlockLanguages: () => ["python", "sql"],
  resolveCodeBlockLanguage,
}));

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("streamdownCodePlugin", () => {
  beforeEach(() => {
    vi.resetModules();
    codeToTokens.mockClear();
    getCodeBlockHighlighter.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exposes the streamdown code-highlighter contract", async () => {
    const { streamdownCodePlugin } = await import("../streamdown-code-plugin");
    expect(streamdownCodePlugin.name).toBe("shiki");
    expect(streamdownCodePlugin.type).toBe("code-highlighter");
    expect(streamdownCodePlugin.getSupportedLanguages()).toEqual(["python", "sql"]);
    expect(streamdownCodePlugin.getThemes()).toEqual(["github-light", "github-dark"]);
    expect(streamdownCodePlugin.supportsLanguage("python")).toBe(true);
    expect(streamdownCodePlugin.supportsLanguage("cobol")).toBe(false);
  });

  it("returns null then delivers tokens via callback, and caches the result", async () => {
    const { streamdownCodePlugin } = await import("../streamdown-code-plugin");
    const callback = vi.fn();

    const immediate = streamdownCodePlugin.highlight(
      { code: "print(1)", language: "python", themes: ["github-light", "github-dark"] },
      callback,
    );
    expect(immediate).toBeNull();

    await flush();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(codeToTokens).toHaveBeenCalledWith(
      "print(1)",
      expect.objectContaining({ lang: "python" }),
    );

    // Same code+language now resolves synchronously from cache.
    const cached = streamdownCodePlugin.highlight(
      { code: "print(1)", language: "python", themes: ["github-light", "github-dark"] },
      callback,
    );
    expect(cached).not.toBeNull();
    expect(codeToTokens).toHaveBeenCalledTimes(1);
  });

  it("highlights unsupported languages as plaintext", async () => {
    const { streamdownCodePlugin } = await import("../streamdown-code-plugin");
    streamdownCodePlugin.highlight(
      { code: "unknown", language: "cobol", themes: ["github-light", "github-dark"] },
      vi.fn(),
    );
    await flush();
    expect(getCodeBlockHighlighter).toHaveBeenCalledWith("text");
  });

  it("logs and recovers when highlighting rejects", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    getCodeBlockHighlighter.mockRejectedValueOnce(new Error("boom"));

    const { streamdownCodePlugin } = await import("../streamdown-code-plugin");
    streamdownCodePlugin.highlight(
      { code: "boom()", language: "python", themes: ["github-light", "github-dark"] },
      vi.fn(),
    );
    await flush();
    expect(consoleError).toHaveBeenCalled();
  });
});
