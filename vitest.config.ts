import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.spec.ts", "src/**/*.test.tsx", "src/**/*.spec.tsx"],
    exclude: ["node_modules", "dist", "examples"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/server/**/*.ts", "src/components/**/*.tsx"],
      exclude: ["**/*.test.ts", "**/*.spec.ts", "**/*.test.tsx", "**/*.spec.tsx", "**/index.ts", "**/*.stories.tsx"],
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
