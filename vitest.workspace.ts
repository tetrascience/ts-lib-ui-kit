import { defineWorkspace } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

export default defineWorkspace([
  // Unit tests - use the vitest.config.ts
  "./vitest.config.ts",
  // Storybook component tests
  {
    extends: "./vite.config.ts",
    plugins: [
      storybookTest({
        configDir: ".storybook",
        storybookScript: "yarn storybook --ci",
      }),
    ],
    test: {
      name: "storybook",
      browser: {
        enabled: true,
        provider: "playwright",
        headless: true,
        name: "chromium",
        viewport: { width: 1920, height: 1080 },
      },
      setupFiles: [".storybook/vitest.setup.ts"],
    },
  },
]);
