import { withThemeByClassName } from "@storybook/addon-themes";
import { createElement } from "react";

import { Toaster } from "../src/components/ui/sonner";
import { TooltipProvider } from "../src/components/ui/tooltip";

import type { Preview } from "@storybook/react-vite";
import "./theme/index.css";
import "../src/index.css";

const preview: Preview = {
  decorators: [
    withThemeByClassName({
      themes: {
        light: "",
        dark: "dark",
      },
      defaultTheme: "light",
    }),
    (Story) =>
      createElement(
        'div',
        {},
        createElement(TooltipProvider, null, Story()),
        createElement(Toaster, { richColors: true })
      ),
  ],
  parameters: {
    a11y: {
      test: 'todo',
    },
    backgrounds: {
      disable: true,
    },
    options: {
      storySort: {
        order: ["Patterns", "Components", "*", "Legacy"],
      },
    },
    // Use fullscreen layout for video recording - removes padding
    layout: "fullscreen",
  },
};

export default preview;
