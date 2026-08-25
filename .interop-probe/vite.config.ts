import path from "path";
import { defineConfig } from "vite";
export default defineConfig({
  build: {
    outDir: path.resolve(__dirname, "out"),
    lib: { entry: { entry: path.resolve(__dirname, "src/entry.ts") }, formats: ["es", "cjs"] },
    rollupOptions: {
      external: (id: string) => id.startsWith("@shikijs") || id.startsWith("shiki") || id.startsWith("plotly"),
      output: { dynamicImportInCjs: false, preserveModules: true, preserveModulesRoot: path.resolve(__dirname, "src") },
    },
    emptyOutDir: true,
    minify: false,
  },
});
