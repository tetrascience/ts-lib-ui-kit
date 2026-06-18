#!/usr/bin/env tsx
/**
 * Build the machine-readable component metadata consumed by the deployed MCP
 * server (`api/mcp.ts`).
 *
 * The official `@storybook/addon-mcp` only serves `/mcp` from a running
 * `storybook dev` process, so it is unavailable on the static Storybook we
 * deploy to Vercel. Instead, this script runs right after `storybook build`
 * and emits `storybook-static/mcp/components.json`, a compact catalog the
 * serverless `/mcp` function reads at request time.
 *
 * Data sources:
 *   - `storybook-static/index.json` — the authoritative inventory of what was
 *     actually published (one entry per story / docs page, with importPath and
 *     tags). Used as the spine so the catalog never drifts from the deploy.
 *   - The `*.stories.tsx` sources — parsed with ts-morph to recover the authored
 *     `argTypes` (variant/size enumerations), default `args`, and per-story
 *     `args` (concrete, copy-pasteable usage examples). These are the metadata
 *     that most reduce hallucinated component APIs.
 *
 * Usage: tsx scripts/mcp/build-metadata.ts [storybookStaticDir]
 */
import fs from "node:fs";
import path from "node:path";

import {
  Node,
  Project,
  SyntaxKind,
  type ObjectLiteralExpression,
  type SourceFile,
} from "ts-morph";

const ROOT = process.cwd();
const STATIC_DIR = path.resolve(ROOT, process.argv[2] ?? "storybook-static");
const INDEX_JSON = path.join(STATIC_DIR, "index.json");
const OUT_DIR = path.join(STATIC_DIR, "mcp");
// Read at runtime by the serverless function (api/mcp.ts), which Vercel bundles
// into the function via `functions.includeFiles` in vercel.json.
const OUT_FILE = path.join(OUT_DIR, "components.json");

/** A single entry in Storybook's generated `index.json`. */
interface StorybookIndexEntry {
  type: "story" | "docs";
  id: string;
  name: string;
  title: string;
  importPath: string;
  tags?: string[];
}

interface StorybookIndex {
  v: number;
  entries: Record<string, StorybookIndexEntry>;
}

interface ArgType {
  control?: string;
  options?: unknown[];
  description?: string;
}

interface StoryMeta {
  name: string;
  args?: Record<string, unknown>;
  hasPlayTest: boolean;
}

interface ComponentMeta {
  title: string;
  name: string;
  importPath: string;
  tags: string[];
  hasDocsPage: boolean;
  argTypes: Record<string, ArgType>;
  defaultArgs: Record<string, unknown>;
  stories: StoryMeta[];
}

interface Catalog {
  generatedAt: string;
  packageName: string;
  packageVersion: string;
  componentCount: number;
  components: ComponentMeta[];
}

/**
 * Convert a ts-morph expression node into a plain JSON value. Handles the
 * literal shapes that appear in story `args` / `argTypes`; anything richer
 * (JSX, function, identifier reference) is preserved as its trimmed source
 * text so the agent still sees *something* concrete rather than nothing.
 */
function literalValue(node: Node | undefined): unknown {
  if (!node) return undefined;
  if (Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)) {
    return node.getLiteralValue();
  }
  if (Node.isNumericLiteral(node)) return node.getLiteralValue();
  if (Node.isTrueLiteral(node)) return true;
  if (Node.isFalseLiteral(node)) return false;
  if (Node.isNullLiteral(node)) return null;
  if (Node.isPrefixUnaryExpression(node)) {
    const operand = literalValue(node.getOperand());
    if (typeof operand === "number") {
      const op = node.getOperatorToken();
      if (op === SyntaxKind.MinusToken) return -operand;
      if (op === SyntaxKind.PlusToken) return operand; // unary plus is a no-op
    }
    return node.getText();
  }
  if (Node.isArrayLiteralExpression(node)) {
    return node.getElements().map((el) => literalValue(el));
  }
  if (Node.isObjectLiteralExpression(node)) {
    return objectToRecord(node);
  }
  // JSX, arrow functions, identifiers, calls, etc. — keep the source as a hint.
  return node.getText().replace(/\s+/g, " ").trim();
}

function objectToRecord(obj: ObjectLiteralExpression): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const prop of obj.getProperties()) {
    if (Node.isPropertyAssignment(prop)) {
      out[prop.getName()] = literalValue(prop.getInitializer());
    } else if (Node.isShorthandPropertyAssignment(prop)) {
      out[prop.getName()] = prop.getName();
    }
    // Spread / method assignments are skipped — not representable as plain data.
  }
  return out;
}

/** Find the object literal initializer of a named/default declaration. */
function getObjectInitializer(node: Node | undefined): ObjectLiteralExpression | undefined {
  if (!node) return undefined;
  const init = Node.isVariableDeclaration(node)
    ? node.getInitializer()
    : node;
  if (init && Node.isObjectLiteralExpression(init)) return init;
  return undefined;
}

function parseArgTypes(meta: ObjectLiteralExpression | undefined): Record<string, ArgType> {
  const argTypes: Record<string, ArgType> = {};
  const prop = meta?.getProperty("argTypes");
  if (!prop || !Node.isPropertyAssignment(prop)) return argTypes;
  const obj = prop.getInitializer();
  if (!obj || !Node.isObjectLiteralExpression(obj)) return argTypes;
  for (const argProp of obj.getProperties()) {
    if (!Node.isPropertyAssignment(argProp)) continue;
    const value = literalValue(argProp.getInitializer());
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const record = value as Record<string, unknown>;
      const control = record.control;
      const entry: ArgType = {};
      if (typeof control === "string") entry.control = control;
      else if (control && typeof control === "object") {
        const c = (control as Record<string, unknown>).type;
        if (typeof c === "string") entry.control = c;
      }
      if (Array.isArray(record.options)) entry.options = record.options;
      if (typeof record.description === "string") entry.description = record.description;
      argTypes[argProp.getName()] = entry;
    }
  }
  return argTypes;
}

function parseArgs(container: ObjectLiteralExpression | undefined): Record<string, unknown> {
  const prop = container?.getProperty("args");
  if (!prop || !Node.isPropertyAssignment(prop)) return {};
  const obj = prop.getInitializer();
  if (!obj || !Node.isObjectLiteralExpression(obj)) return {};
  return objectToRecord(obj);
}

/** Pull the per-component metadata out of a single story source file. */
function parseStoryFile(
  sourceFile: SourceFile,
): { argTypes: Record<string, ArgType>; defaultArgs: Record<string, unknown>; stories: StoryMeta[] } {
  const metaObj = getObjectInitializer(sourceFile.getDefaultExportSymbol()
    ?.getDeclarations()
    .map((d) => (Node.isExportAssignment(d) ? d.getExpression() : d))
    .find((n) => Node.isObjectLiteralExpression(n) || Node.isIdentifier(n)));

  // `export default meta` (identifier) vs `export default { ... }` (literal).
  let meta = metaObj;
  if (!meta) {
    const metaVar = sourceFile.getVariableDeclaration("meta");
    meta = getObjectInitializer(metaVar);
  }

  const argTypes = parseArgTypes(meta);
  const defaultArgs = parseArgs(meta);

  const stories: StoryMeta[] = [];
  for (const decl of sourceFile.getVariableDeclarations()) {
    if (!decl.isExported() || decl.getName() === "meta") continue;
    const obj = getObjectInitializer(decl);
    if (!obj) continue;
    stories.push({
      name: decl.getName(),
      args: parseArgs(obj),
      hasPlayTest: Boolean(obj.getProperty("play")),
    });
  }

  return { argTypes, defaultArgs, stories };
}

function main(): void {
  if (!fs.existsSync(INDEX_JSON)) {
    console.error(
      `[mcp] ${INDEX_JSON} not found. Run \`storybook build\` before this script.`,
    );
    process.exit(1);
  }

  const index = JSON.parse(fs.readFileSync(INDEX_JSON, "utf8")) as StorybookIndex;
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8")) as {
    name: string;
    version: string;
  };

  // Group index entries by component title.
  const byTitle = new Map<string, StorybookIndexEntry[]>();
  for (const entry of Object.values(index.entries)) {
    if (entry.title === "Configure your project") continue; // Storybook starter page
    const list = byTitle.get(entry.title) ?? [];
    list.push(entry);
    byTitle.set(entry.title, list);
  }

  const project = new Project({
    tsConfigFilePath: fs.existsSync(path.join(ROOT, "tsconfig.json"))
      ? path.join(ROOT, "tsconfig.json")
      : undefined,
    skipAddingFilesFromTsConfig: true,
  });

  const components: ComponentMeta[] = [];
  for (const [title, entries] of byTitle) {
    const storyEntry = entries.find((e) => e.type === "story") ?? entries[0];
    const importPath = storyEntry.importPath;
    const absPath = path.resolve(ROOT, importPath);

    let parsed: ReturnType<typeof parseStoryFile> = {
      argTypes: {},
      defaultArgs: {},
      stories: [],
    };
    if (fs.existsSync(absPath)) {
      const sourceFile = project.addSourceFileAtPath(absPath);
      parsed = parseStoryFile(sourceFile);
    } else {
      console.warn(`[mcp] story source not found for "${title}" at ${importPath}`);
    }

    const tags = [...new Set(entries.flatMap((e) => e.tags ?? []))];
    components.push({
      title,
      name: title.split("/").pop() ?? title,
      importPath,
      tags,
      hasDocsPage: entries.some((e) => e.type === "docs") || tags.includes("autodocs"),
      argTypes: parsed.argTypes,
      defaultArgs: parsed.defaultArgs,
      stories: parsed.stories.length
        ? parsed.stories
        : entries
            .filter((e) => e.type === "story")
            .map((e) => ({ name: e.name, hasPlayTest: false })),
    });
  }

  components.sort((a, b) => a.title.localeCompare(b.title));

  const catalog: Catalog = {
    generatedAt: new Date().toISOString(),
    packageName: pkg.name,
    packageVersion: pkg.version,
    componentCount: components.length,
    components,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

  console.log(
    `[mcp] wrote ${components.length} components to ${path.relative(ROOT, OUT_FILE)}`,
  );
}

main();
