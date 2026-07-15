import { DocsContainer } from "@storybook/addon-docs/blocks";
import { DecoratorHelpers } from "@storybook/addon-themes";
import { createElement } from "react";
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
let currentTheme = "light";
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
      // SW-2124: prefer inline autodocs rendering (story rendered in the docs
      // document, inheriting its `.dark`). Note the global `layout: "fullscreen"`
      // below currently keeps autodocs stories in isolated iframes anyway — the
      // parent-theme inheritance in the channel sync above is what actually
      // themes those; this stays as the correct intent if fullscreen is lifted.
      story: { inline: true },
      // SW-2124: sync the Docs *chrome* theme (argstable, category rows, the
      // Controls widgets, code blocks) to dark. These are emotion-styled from
      // Storybook's docs theme object — not the design tokens — so the `.dark`
      // class + token CSS can't reach them; a hovered `table.category` row or a
      // <select>/<textarea> control stays a white band otherwise. Selecting the
      // container theme from the same `currentTheme` the channel sync tracks.
      container: (props: ComponentProps<typeof DocsContainer>) =>
        createElement(DocsContainer, {
          ...props,
          theme: currentTheme === "dark" ? tetrascienceDark : tetrascienceLight,
        }),
    },
    a11y: {
      test: 'todo',
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
