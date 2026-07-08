import path from "path";

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// Builds the published dist/index.css — the full, self-contained bundle
// (preflight + utilities + tokens) for consumers with no Tailwind. Kept separate
// from the main library build, which emits no CSS. Runs through Vite (not the
// Tailwind CLI) so the Inter font URL is emitted as a relative asset.
export default defineConfig({
  plugins: [tailwindcss()],
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: false,
    cssMinify: true,
    rollupOptions: {
      input: { index: path.resolve(__dirname, "src/index.css") },
      output: {
        assetFileNames: (info) =>
          info.names?.some((name) => name.endsWith(".css"))
            ? "index[extname]"
            : "assets/[name]-[hash][extname]",
      },
    },
  },
});
