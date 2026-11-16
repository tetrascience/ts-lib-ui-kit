import { afterEach, describe, expect, it, vi } from "vitest";

import {
  cssColorToHex,
  defineDiffTheme,
  diffThemeName,
  resolveDiffColors,
  resolveDiffTheme,
  rgbaToHex,
} from "../diff-theme";

import type { Monaco } from "@monaco-editor/react";

/** jsdom has no 2D canvas; this one "paints" every colour as the same pixel. */
function stubCanvas(pixel: number[]) {
  const context = {
    canvas: { width: 0, height: 0 },
    fillStyle: "",
    fillRect: vi.fn(),
    getImageData: () => ({ data: pixel }),
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as unknown as RenderingContext);
}

function mountScope(tokens: Record<string, string>) {
  const scope = document.createElement("div");
  for (const [name, value] of Object.entries(tokens)) scope.style.setProperty(name, value);
  document.body.appendChild(scope);
  return scope;
}

function fakeMonaco() {
  const defineTheme = vi.fn();
  return { monaco: { editor: { defineTheme } } as unknown as Monaco, defineTheme };
}

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("rgbaToHex", () => {
  it("writes four zero-padded bytes", () => {
    expect(rgbaToHex([255, 0, 10, 128])).toBe("#ff000a80");
  });
});

describe("cssColorToHex", () => {
  it("returns undefined where there is no 2D canvas", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    expect(cssColorToHex("red")).toBeUndefined();
  });

  it("reads back the painted pixel", () => {
    stubCanvas([25, 128, 56, 255]);
    expect(cssColorToHex("oklch(0.5272 0.1408 148.3)")).toBe("#198038ff");
  });
});

describe("resolveDiffColors", () => {
  it("resolves only the tokens defined at the scope", () => {
    stubCanvas([1, 2, 3, 255]);
    const scope = mountScope({ "--diff-added": "green", "--diff-removed-line": "pink" });
    expect(resolveDiffColors(scope)).toEqual({ added: "#010203ff", removedLine: "#010203ff" });
    expect(scope.childElementCount).toBe(0);
  });

  it("resolves nothing when colours cannot be computed", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    expect(resolveDiffColors(mountScope({ "--diff-added": "green" }))).toEqual({});
  });

  it("resolves nothing for an element outside a window", () => {
    const detached = document.implementation.createHTMLDocument().createElement("div");
    expect(resolveDiffColors(detached)).toEqual({});
  });
});

describe("resolveDiffTheme", () => {
  it("maps diff, surface and syntax tokens onto Monaco's theme", () => {
    stubCanvas([10, 20, 30, 255]);
    const scope = mountScope({
      "--diff-added-line": "green",
      "--card": "white",
      "--foreground": "black",
      "--shiki-keyword": "red",
    });
    const theme = resolveDiffTheme(scope);
    expect(theme.colors).toEqual({
      "diffEditor.insertedLineBackground": "#0a141eff",
      "diffEditorGutter.insertedLineBackground": "#0a141eff",
      "editor.background": "#0a141eff",
      "editor.foreground": "#0a141eff",
      "editorLineNumber.activeForeground": "#0a141eff",
    });
    expect(theme.rules).toEqual([{ token: "keyword", foreground: "0a141e" }]);
  });
});

describe("defineDiffTheme", () => {
  it("falls back to Monaco's stock theme when there is no scope", () => {
    const { monaco, defineTheme } = fakeMonaco();
    expect(defineDiffTheme(monaco, false, null)).toBe(diffThemeName(false));
    expect(defineTheme).toHaveBeenCalledWith("ts-ui-kit-diff-light", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {},
    });
  });

  it("replaces the stock syntax rules once the kit's resolve", () => {
    stubCanvas([10, 20, 30, 255]);
    const { monaco, defineTheme } = fakeMonaco();
    const scope = mountScope({ "--shiki-comment": "gray" });
    expect(defineDiffTheme(monaco, true, scope)).toBe("ts-ui-kit-diff-dark");
    expect(defineTheme).toHaveBeenCalledWith("ts-ui-kit-diff-dark", {
      base: "vs-dark",
      inherit: false,
      rules: [{ token: "comment", foreground: "0a141e" }],
      colors: {},
    });
  });
});
