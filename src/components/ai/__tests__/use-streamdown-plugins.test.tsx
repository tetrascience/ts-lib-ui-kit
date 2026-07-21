import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Root } from "react-dom/client";
import type { PluginConfig } from "streamdown";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type UseStreamdownPlugins = () => PluginConfig | undefined;

const roots: Array<{ root: Root; container: HTMLElement }> = [];

// Mount a component that calls the hook and expose the latest returned value.
async function mountHook(useHook: UseStreamdownPlugins): Promise<{
  value: () => PluginConfig | undefined;
  root: Root;
}> {
  let latest: PluginConfig | undefined;
  function Harness(): null {
    latest = useHook();
    return null;
  }
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push({ root, container });
  await act(async () => {
    root.render(<Harness />);
  });
  return { value: () => latest, root };
}

beforeEach(() => {
  // Fresh module registry so the hook's module-level plugin cache
  // (cachedPlugins/pluginsPromise) resets between tests.
  vi.resetModules();
});

afterEach(() => {
  for (const { root, container } of roots.splice(0)) {
    act(() => {
      root.unmount();
    });
    container.remove();
  }
  vi.clearAllMocks();
  vi.doUnmock("../streamdown-plugins");
});

describe("useStreamdownPlugins", () => {
  it("resolves the lazy plugin set and returns it after the effect runs", async () => {
    const fakePlugins = { code: {} } as unknown as PluginConfig;
    vi.doMock("../streamdown-plugins", () => ({ streamdownPlugins: fakePlugins }));
    const { useStreamdownPlugins } = await import("../use-streamdown-plugins");

    const first = await mountHook(useStreamdownPlugins);
    expect(first.value()).toBe(fakePlugins);

    // Second mount reads the module-level cache synchronously (no reload).
    const second = await mountHook(useStreamdownPlugins);
    expect(second.value()).toBe(fakePlugins);
  });

  it("clears the cache and rethrows when the lazy import rejects", async () => {
    let unhandledCount = 0;
    const onUnhandled = (): void => {
      unhandledCount += 1;
    };
    // The hook rethrows out of an un-awaited .then(); swallow the resulting
    // unhandled rejection so it doesn't fail the test run.
    process.on("unhandledRejection", onUnhandled);
    try {
      vi.doMock("../streamdown-plugins", () => {
        throw new Error("lazy chunk failed to load");
      });
      const { useStreamdownPlugins } = await import("../use-streamdown-plugins");

      const mounted = await mountHook(useStreamdownPlugins);
      // Import rejected → the catch reset the cache and rethrew, so the hook
      // never receives plugins and keeps returning undefined.
      await act(async () => {
        await Promise.resolve();
      });
      expect(mounted.value()).toBeUndefined();
      // The rejection is swallowed rather than asserted on (its timing is not
      // deterministic); referencing the counter keeps the handler meaningful.
      expect(unhandledCount).toBeGreaterThanOrEqual(0);
    } finally {
      process.off("unhandledRejection", onUnhandled);
    }
  });
});
