import { DocsContainer } from "@storybook/addon-docs/blocks";
import { DecoratorHelpers } from "@storybook/addon-themes";
import { createElement, useEffect, useState } from "react";
import { addons } from "storybook/preview-api";

import { Toaster } from "../src/components/ui/sonner";
import { TooltipProvider } from "../src/components/ui/tooltip";

import { tetrascienceDark } from "./theme/tetra-science.dark.theme";
import { tetrascienceLight } from "./theme/tetra-science.light.theme";

import type { Preview } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import "./theme/index.css";
import "../src/index.css";

// SW-2124: keep the preview <html> `.dark` class in sync with the theme global
// for BOTH the canvas and the autodocs pages. `withThemeByClassName` only
// toggles the class from a per-story decorator, which does not run for the
// autodocs page container — so Docs pages render light regardless of the
// toggle. The theme CSS (./theme/index.css) already styles `.sbdocs` via the
// library's design tokens, so once `.dark` reaches the preview root the whole
// Docs page (chrome + component previews) follows. We re-apply on both globals
// changes and render events (mirrors the chrome sync in .storybook/manager.ts).
//
// Autodocs also renders each story block in its own isolated <iframe>, which
// loads with the default (light) globals and never sees the toolbar's dark
// selection. Since this preview module also runs inside those child iframes,
// we additionally inherit the parent preview document's theme (same-origin) so
// the embedded story previews match the surrounding Docs page.
//
// We deliberately do NOT use addon-themes' `withThemeByClassName` decorator:
// its per-story `useEffect` re-derives the theme from each story's own globals,
// which in the docs iframes is the default (light) — so it fought this sync and
// stripped the class back off. Instead we register the theme toolbar via the
// addon's helper and own the `.dark` class ourselves here.
DecoratorHelpers.initializeThemeState(["light", "dark"], "light");

const previewChannel = addons.getChannel();

/**
 * Read the theme synchronously from the URL's `globals` param (e.g.
 * `?globals=theme:dark`) so the very first paint is already themed, instead of
 * flashing light until the first `setGlobals` event lands.
 */
const readInitialTheme = (): string => {
  try {
    const globalsParam =
      new URLSearchParams(window.location.search).get("globals") ?? "";
    const entry = globalsParam.split(";").find((p) => p.startsWith("theme:"));
    if (entry) return entry.slice("theme:".length);
  } catch {
    /* window.location unavailable — fall back to the default */
  }
  return "light";
};

let currentTheme = readInitialTheme();

/**
 * Autodocs story iframes load with the default (light) globals and never see
 * the toolbar selection, so fall back to the parent preview document's `.dark`
 * class (same-origin). Guarded for the non-iframe / cross-origin case.
 */
const parentIsDark = () => {
  try {
    return (
      window.parent !== window &&
      window.parent.document.documentElement.classList.contains("dark")
    );
  } catch {
    return false;
  }
};

const applyPreviewTheme = () => {
  const dark = currentTheme === "dark" || parentIsDark();
  document.documentElement.classList.toggle("dark", dark);
};

const onGlobals = ({ globals }: { globals?: { theme?: string } }) => {
  if (globals?.theme) {
    currentTheme = globals.theme;
  }
  applyPreviewTheme();
};

previewChannel.on("setGlobals", onGlobals);
previewChannel.on("globalsUpdated", onGlobals);
previewChannel.on("docsRendered", applyPreviewTheme);
previewChannel.on("storyRendered", applyPreviewTheme);

// Theme the very first paint (esp. dark story iframes) before any event fires.
applyPreviewTheme();

// HMR re-evaluates this module against the same persistent channel; without
// cleanup the listeners (and their closures) accumulate across hot updates.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    previewChannel.off("setGlobals", onGlobals);
    previewChannel.off("globalsUpdated", onGlobals);
    previewChannel.off("docsRendered", applyPreviewTheme);
    previewChannel.off("storyRendered", applyPreviewTheme);
  });
}

/**
 * SW-2124: theme the Docs *chrome* (argstable, `table.category` rows, Controls
 * widgets, code blocks). These are emotion-styled from Storybook's docs theme
 * object — not the design tokens — so the `.dark` class + token CSS can't reach
 * them; a `table.category` row or a `<select>`/`<textarea>` control would stay
 * a white band otherwise.
 *
 * This subscribes to theme changes itself (rather than reading a module value
 * once at render) so the chrome re-themes on toggle even if Storybook does not
 * re-render the container, and always reflects the latest theme on mount.
 */
function ThemedDocsContainer(props: ComponentProps<typeof DocsContainer>) {
  const [theme, setTheme] = useState(currentTheme);
  useEffect(() => {
    const sync = ({ globals }: { globals?: { theme?: string } }) => {
      if (globals?.theme) setTheme(globals.theme);
    };
    previewChannel.on("setGlobals", sync);
    previewChannel.on("globalsUpdated", sync);
    return () => {
      previewChannel.off("setGlobals", sync);
      previewChannel.off("globalsUpdated", sync);
    };
  }, []);
  return createElement(DocsContainer, {
    ...props,
    theme: theme === "dark" ? tetrascienceDark : tetrascienceLight,
  });
}

const preview: Preview = {
  decorators: [
    (Story) =>
      createElement(
        'div',
        {},
        createElement(TooltipProvider, null, Story()),
        createElement(Toaster, { richColors: true })
      ),
  ],
  parameters: {
    docs: {
      container: ThemedDocsContainer,
    },
    a11y: {
      test: 'error',
    },
    backgrounds: {
      disable: true,
    },
    options: {
      storySort: {
        order: [
          "Introduction",
          "Foundations",
          "Design Patterns",
          "Components",
          "AI Elements",
          ["Chat", "*"],
          "*",
          "Legacy",
        ],
      },
    },
    // Use fullscreen layout for video recording - removes padding
    layout: "fullscreen",
  },
};

export default preview;
