import path from "path";

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// Builds dist/index.standalone.css from the full stylesheet, separate from the
// main build. Runs through Vite (not the Tailwind CLI) so the Inter font URL is
// emitted as a relative asset, making the file a true no-Tailwind drop-in.
export default defineConfig({
  plugins: [tailwindcss()],
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: false,
    cssMinify: true,
    rollupOptions: {
      input: { "index.standalone": path.resolve(__dirname, "src/index.css") },
      output: {
        assetFileNames: (info) =>
          info.names?.some((name) => name.endsWith(".css"))
            ? "index.standalone[extname]"
            : "assets/[name]-[hash][extname]",
      },
    },
  },
});
