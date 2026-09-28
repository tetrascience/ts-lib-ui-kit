import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * `@streamdown/math` and `@streamdown/mermaid` are optional peer dependencies
 * (#190). These tests pin the contract that a consumer which omits either one
 * still gets a usable plugin set instead of a build or runtime failure.
 */

// A module factory that throws stands in for a package that isn't installed:
// the dynamic import rejects exactly as it would on a missing specifier.
function notInstalled(): never {
  throw new Error("Cannot find module");
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.doUnmock("@streamdown/math");
  vi.doUnmock("@streamdown/mermaid");
});

describe("getStreamdownPlugins", () => {
  it("includes math and mermaid when both optional peers are installed", async () => {
    const { getStreamdownPlugins } = await import("../streamdown-plugins");

    const plugins = await getStreamdownPlugins();

    expect(plugins.math).toBeDefined();
    expect(plugins.mermaid).toBeDefined();
  });

  it("always includes the plugins that are not optional", async () => {
    const { getStreamdownPlugins } = await import("../streamdown-plugins");

    const plugins = await getStreamdownPlugins();

    expect(plugins.cjk).toBeDefined();
    expect(plugins.code).toBeDefined();
  });

  it("omits math when @streamdown/math is not installed", async () => {
    vi.doMock("@streamdown/math", notInstalled);
    const { getStreamdownPlugins } = await import("../streamdown-plugins");

    const plugins = await getStreamdownPlugins();

    expect(plugins.math).toBeUndefined();
    expect(plugins.mermaid).toBeDefined();
  });

  it("omits mermaid when @streamdown/mermaid is not installed", async () => {
    vi.doMock("@streamdown/mermaid", notInstalled);
    const { getStreamdownPlugins } = await import("../streamdown-plugins");

    const plugins = await getStreamdownPlugins();

    expect(plugins.mermaid).toBeUndefined();
    expect(plugins.math).toBeDefined();
  });

  it("still resolves a usable plugin set when neither optional peer is installed", async () => {
    vi.doMock("@streamdown/math", notInstalled);
    vi.doMock("@streamdown/mermaid", notInstalled);
    const { getStreamdownPlugins } = await import("../streamdown-plugins");

    const plugins = await getStreamdownPlugins();

    expect(plugins.math).toBeUndefined();
    expect(plugins.mermaid).toBeUndefined();
    expect(plugins.cjk).toBeDefined();
    expect(plugins.code).toBeDefined();
  });
});
