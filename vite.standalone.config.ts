import path from "path";

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// Builds the self-contained standalone stylesheet (SW-1898). Kept as a separate
// Vite build from the main library so its Tailwind preflight + full utility set
// never leak into the lean `dist/index.css`. Runs through Vite (not the Tailwind
// CLI) so the Inter `@font-face` URL is emitted as a real relative asset rather
// than a bare `@fontsource-variable/...` npm specifier that only a bundler could
// resolve — that is what makes the file a true no-Tailwind drop-in.
export default defineConfig({
  plugins: [tailwindcss()],
  // Relative asset URLs (`./assets/…`) so the emitted font resolves whether the
  // file is bundled or dropped in via a plain <link> from node_modules.
  base: "./",
  build: {
    outDir: "dist",
    // Runs after the main build; must not wipe its output.
    emptyOutDir: false,
    cssMinify: true,
    rollupOptions: {
      input: { "index.standalone": path.resolve(__dirname, "src/index.standalone.css") },
      output: {
        assetFileNames: (info) =>
          info.names?.some((name) => name.endsWith(".css"))
            ? "index.standalone[extname]"
            : "assets/[name]-[hash][extname]",
      },
    },
  },
});
