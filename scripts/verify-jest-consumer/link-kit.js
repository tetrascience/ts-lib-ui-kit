#!/usr/bin/env node
/**
 * Extracts ui-kit.tgz directly into node_modules — bypassing `npm install`'s
 * normal dependency-graph processing of the kit's own package.json.
 *
 * If the kit were installed as a regular npm dependency, npm would also
 * install *its* declared dependencies, including the AWS SDK packages
 * `src/server/**` uses (this verification never touches server code — only
 * client components: ui/code-block, charts/AreaPlot, composed/MoleculeStructure).
 * Those AWS SDK packages transitively pull in `protobufjs` and a
 * `fast-xml-parser` version well past what the root project's own
 * yarn.lock pins, both flagged by dependency scanning — findings this
 * project has no way to fix, since it never calls that code at all. This
 * project's own `devDependencies` list is a deliberately explicit,
 * minimal set covering only what the compiled `.cjs` for the tested
 * subpaths actually `require()`s at runtime (verified via `grep -o
 * 'require("[^"]*")'` against the built dist) — everything else the kit
 * needs for *other* components stays uninstalled here, on purpose.
 */
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const tarballPath = path.join(__dirname, "ui-kit.tgz");
const targetDir = path.join(
  __dirname,
  "node_modules",
  "@tetrascience-npm",
  "tetrascience-react-ui",
);

if (!fs.existsSync(tarballPath)) {
  console.error(
    `[link-kit] ${tarballPath} not found. Run \`yarn verify:jest-consumer\` from the repo root ` +
      "(or `yarn pack --out scripts/verify-jest-consumer/ui-kit.tgz` from the repo root first).",
  );
  process.exit(1);
}

fs.rmSync(targetDir, { recursive: true, force: true });
fs.mkdirSync(targetDir, { recursive: true });
execFileSync("tar", ["-xzf", tarballPath, "-C", targetDir, "--strip-components=1"]);
console.log(`[link-kit] extracted ${tarballPath} -> ${targetDir}`);
