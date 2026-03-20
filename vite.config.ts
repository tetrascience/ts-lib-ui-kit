import fs from "fs";
import path from "path";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

import pkg from "./package.json" with { type: "json" };
import { generateZephyrMapping } from "./scripts/zephyr/storybook-zephyr-mapping";

const banner = `/*
 * tetrascience-react-ui
 * Copyright ${new Date().getFullYear()} TetraScience, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */`;

// App-only aliases — resolve the package to local src/ during dev/app build
const appAlias = {
  "@tetrascience-npm/tetrascience-react-ui/server": path.resolve(__dirname, "./src/server/index.ts"),
  "@tetrascience-npm/tetrascience-react-ui/index.css": path.resolve(__dirname, "./src/index.css"),
  "@tetrascience-npm/tetrascience-react-ui": path.resolve(__dirname, "./src/index.ts"),
};

// Shared short-path aliases — used in both app and lib modes
export const alias = {
  ...appAlias,
  "@": path.resolve(__dirname, "./src"),
};

const external: (string | RegExp)[] = [
  "react",
  "react/jsx-runtime",
  "react-dom",
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies),
];

const SCREENSHOT_DIR = path.resolve(process.cwd(), "test-results/screenshots");
const storybookZephyrMapping = generateZephyrMapping();

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      rollupTypes: true,
    }),
  ],
  resolve: { alias },
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, "src/index.ts"),
        server: path.resolve(__dirname, "src/server/index.ts"),
        "providers/athena": path.resolve(__dirname, "src/server/providers/entries/athena.ts"),
        "providers/snowflake": path.resolve(__dirname, "src/server/providers/entries/snowflake.ts"),
        "providers/databricks": path.resolve(__dirname, "src/server/providers/entries/databricks.ts"),
      },
      cssFileName: "index",
    },
    rollupOptions: {
      external,
      output: {
        banner,
        globals: { react: "React", "react-dom": "ReactDOM" },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  test: {
    projects: [
      // Unit tests — jsdom environment, with server tests overridden to node
      {
        resolve: { alias },
        test: {
          name: "unit",
          globals: true,
          environment: "jsdom",
          include: [
            "src/**/*.test.ts",
            "src/**/*.test.tsx",
            "src/**/*.spec.ts",
            "src/**/*.spec.tsx",
            "scripts/**/*.test.ts",
          ],
          exclude: ["node_modules", "dist", "examples"],
          environmentMatchGlobs: [["src/server/**/*.test.ts", "node"]],
          mockReset: true,
          restoreMocks: true,
        },
      },
      // Storybook component tests — Playwright browser runner
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: ".storybook",
            storybookScript: "yarn storybook --ci",
            // 👇 Use the environment variable you passed
            storybookUrl: process.env.SB_URL || "http://localhost:6006",
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            provider: "playwright",
            headless: true,
            instances: [
              {
                browser: "chromium",
              },
            ],
            viewport: { width: 1920, height: 1080 },
          },
          provide: {
            storybookZephyrMapping,
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      }
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "**/*.stories.ts",
        "**/*.stories.tsx",
        "**/index.ts",
        "**/index.tsx",     
      ],
    },
  },
});
