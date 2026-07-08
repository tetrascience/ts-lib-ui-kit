// Emits dist/index.tailwind.css — the raw Tailwind source shipped for Mode A.
// Inlines the shadcn base layer, which consumers can't resolve (dev-only dep).
import { readFileSync, writeFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("node_modules/shadcn/package.json", "utf8"));
const shadcnPath = pkg.exports["./tailwind.css"].style.replace(/^\.\//, "");
const shadcnCss = readFileSync(`node_modules/shadcn/${shadcnPath}`, "utf8");

const src = readFileSync("src/index.tailwind.css", "utf8");
const out = src.replace(/@import ["']shadcn\/tailwind\.css["'];/, shadcnCss.trimEnd());
writeFileSync("dist/index.tailwind.css", out);
