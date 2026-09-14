/**
 * Emits `dist/index.scoped.css` from the freshly built `dist/index.css`
 * (SW-2596). See `scope-kit-css.ts` for what is rewritten and why.
 *
 * Run as part of `yarn build` (after Vite, before the leak audit):
 * `yarn tsx scripts/build/build-scoped-css.ts [distDir]`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SCOPE_ATTRIBUTE, scopeCss } from "./scope-kit-css";

export const SCOPED_CSS_BANNER = `/* tetrascience-react-ui — scoped entry (SW-2596).
 * Every kit-authored rule is confined to an element carrying \`${SCOPE_ATTRIBUTE}\`.
 * Mark your app shell — and any surface the kit portals to <body> — with it.
 * Generated from index.css by scripts/build/build-scoped-css.ts; do not edit. */
`;

export function buildScopedCss(distDir: string): string {
  const source = fs.readFileSync(path.join(distDir, "index.css"), "utf8");
  const target = path.join(distDir, "index.scoped.css");
  fs.writeFileSync(target, SCOPED_CSS_BANNER + scopeCss(source));
  return target;
}

// CLI
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const target = buildScopedCss(path.resolve(process.argv[2] ?? "dist"));
  console.log(`wrote ${path.relative(process.cwd(), target)} (${fs.statSync(target).size} bytes)`);
}
