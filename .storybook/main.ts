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
    getAbsolutePath("@storybook/addon-mcp"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  // Vercel's build metadata, for the Introduction page's version badge: on the
  // production deploy it shows the npm build published from this commit
  // (see ./deployed-version.ts). The SHA and environment are empty outside
  // Vercel.
  env: (config) => ({
    ...config,
    STORYBOOK_DEPLOY_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? "",
    STORYBOOK_DEPLOY_ENV: process.env.VERCEL_ENV ?? "",
    STORYBOOK_BUILD_TIME: String(Date.now()),
  }),
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
