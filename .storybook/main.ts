import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { withoutVitePlugins } from "@storybook/builder-vite";

import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  staticDirs: ["./public"],
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-vitest"),
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-themes"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  async viteFinal(config) {
    // To prevent vercel from failing to build storybook omit the 'vite:dts' plugin
    config.plugins = await withoutVitePlugins(config.plugins, [
      "vite:dts", // Omit the 'vite:dts' plugin
    ]);
    return config;
  },
};
export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
