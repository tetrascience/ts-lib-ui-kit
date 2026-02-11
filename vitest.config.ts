import { defineConfig } from "vitest/config";
import path from "path";

// Base config - unit tests only
// Storybook tests are configured in vitest.workspace.ts
export default defineConfig({
  test: {
    name: "unit",
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/*.spec.ts", "src/**/*.spec.tsx", "scripts/**/*.test.ts"],
    exclude: ["node_modules", "dist", "examples"],
    environmentMatchGlobs: [
      // Server tests should use node environment
      ["src/server/**/*.test.ts", "node"],
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
    mockReset: true,
    restoreMocks: true,
  },
  resolve: {
    alias: {
      "@atoms": path.resolve(__dirname, "./src/components/atoms"),
      "@molecules": path.resolve(__dirname, "./src/components/molecules"),
      "@organisms": path.resolve(__dirname, "./src/components/organisms"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@server": path.resolve(__dirname, "./src/server"),
      "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },
});
