/**
 * Audit every story's docs "Show code" outcome.
 *
 * Mirrors Storybook's snippet decision (see .storybook/source-transform.ts):
 * args stories get an auto-generated JSX snippet; zero-arity `render`
 * stories fall back to the static story-object source, which the global
 * `docs.source.transform` rewrites to just the render body. This audit
 * classifies what each story's code panel will actually show, so CI can
 * fail when a story would print story plumbing or an opaque local wrapper
 * instead of component code.
 *
 * Verdicts:
 * - "component-code":    snippet shows real JSX (kit components / host
 *                        elements), or a stateful demo presented as a
 *                        function component.
 * - "explicit-override": the story (or its meta) sets docs.source.code —
 *                        hand-written usage code wins.
 * - "dynamic":           the story (or its meta) sets docs.source.type
 *                        "dynamic", or is an args story — Storybook
 *                        serializes the rendered JSX tree. Opaque only if
 *                        the rendered root is a file-local component, which
 *                        is checked separately.
 * - "helper-call":       snippet is a call to a file-local helper —
 *                        meaningless to a reader (needs remediation).
 * - "local-wrapper":     snippet renders only file-local components a
 *                        consumer cannot import (needs remediation).
 * - "story-object-dump": the transform could not parse the story object —
 *                        the raw story source (play/zephyr noise) would be
 *                        shown (needs remediation).
 */
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { Project, SyntaxKind } from "ts-morph";

import { transformStorySource } from "../../.storybook/source-transform";

import type {
  ArrowFunction,
  FunctionExpression,
  Node,
  ObjectLiteralExpression,
  SourceFile,
} from "ts-morph";

export type Verdict =
  | "component-code"
  | "explicit-override"
  | "dynamic"
  | "helper-call"
  | "local-wrapper"
  | "story-object-dump";

export interface StoryAuditResult {
  file: string;
  exportName: string;
  verdict: Verdict;
  detail: string;
}

const getProperty = (obj: ObjectLiteralExpression, name: string) => {
  const prop = obj.getProperty(name);
  return prop?.isKind(SyntaxKind.PropertyAssignment)
    ? prop.getInitializer()
    : undefined;
};

/** Chase parameters.docs.{source,canvas} through nested object literals. */
const getDocsSourceOverride = (
  storyOrMeta: ObjectLiteralExpression | undefined,
): { code: boolean; dynamic: boolean; hidden: boolean } => {
  const empty = { code: false, dynamic: false, hidden: false };
  if (!storyOrMeta) return empty;
  const parameters = getProperty(storyOrMeta, "parameters");
  if (!parameters?.isKind(SyntaxKind.ObjectLiteralExpression)) return empty;
  const docs = getProperty(parameters, "docs");
  if (!docs?.isKind(SyntaxKind.ObjectLiteralExpression)) return empty;
  const canvas = getProperty(docs, "canvas");
  const sourceState =
    canvas?.isKind(SyntaxKind.ObjectLiteralExpression) &&
    getProperty(canvas, "sourceState")?.getText().replace(/["']/g, "");
  const hidden = sourceState === "none";
  const source = getProperty(docs, "source");
  if (!source?.isKind(SyntaxKind.ObjectLiteralExpression)) {
    return { ...empty, hidden };
  }
  const type = getProperty(source, "type");
  return {
    code: getProperty(source, "code") !== undefined,
    dynamic: type?.getText().replace(/["']/g, "") === "dynamic",
    hidden,
  };
};

/** Names of components/functions declared in the story file itself. */
const collectLocalDeclarations = (sourceFile: SourceFile): Set<string> => {
  const names = new Set<string>();
  for (const fn of sourceFile.getFunctions()) {
    const name = fn.getName();
    if (name) names.add(name);
  }
  for (const variable of sourceFile.getVariableDeclarations()) {
    const initializer = variable.getInitializer();
    if (
      initializer &&
      (initializer.isKind(SyntaxKind.ArrowFunction) ||
        initializer.isKind(SyntaxKind.FunctionExpression) ||
        initializer.isKind(SyntaxKind.CallExpression))
    ) {
      names.add(variable.getName());
    }
  }
  return names;
};

/** All JSX tag roots used inside a node (e.g. "Accordion" of Accordion.Item). */
const collectJsxTags = (node: Node): Set<string> => {
  const tags = new Set<string>();
  const record = (tagText: string) => {
    tags.add(tagText.split(".")[0]);
  };
  for (const el of node.getDescendantsOfKind(SyntaxKind.JsxOpeningElement)) {
    record(el.getTagNameNode().getText());
  }
  for (const el of node.getDescendantsOfKind(
    SyntaxKind.JsxSelfClosingElement,
  )) {
    record(el.getTagNameNode().getText());
  }
  return tags;
};

const isHostTag = (tag: string) => /^[a-z]/.test(tag);

const classifyRenderContents = (
  render: ArrowFunction | FunctionExpression,
  localNames: Set<string>,
): { verdict: Verdict; detail: string } => {
  const tags = collectJsxTags(render);

  if (tags.size === 0) {
    // No JSX at all — the body is a call like `renderTabs("line")`.
    const calls = render
      .getDescendantsOfKind(SyntaxKind.CallExpression)
      .map((call) => call.getExpression().getText());
    const localCall = calls.find((name) => localNames.has(name.split(".")[0]));
    return {
      verdict: "helper-call",
      detail: `snippet is a call to ${localCall ?? calls[0] ?? "an expression"}(), not component JSX`,
    };
  }

  // Host elements don't make a snippet meaningful on their own — a
  // `<div><LocalWrapper /></div>` snippet is still opaque. Require at least
  // one imported (kit) component unless the snippet has no local wrappers
  // at all.
  const importedTags = [...tags].filter(
    (tag) => !isHostTag(tag) && !localNames.has(tag),
  );
  const localTags = [...tags].filter(
    (tag) => !isHostTag(tag) && localNames.has(tag),
  );
  if (importedTags.length === 0 && localTags.length > 0) {
    return {
      verdict: "local-wrapper",
      detail: `snippet only renders file-local component(s): ${localTags.join(", ")}`,
    };
  }
  return { verdict: "component-code", detail: "" };
};

export const auditStoryFile = (sourceFile: SourceFile): StoryAuditResult[] => {
  const results: StoryAuditResult[] = [];
  const file = path.relative(process.cwd(), sourceFile.getFilePath());
  const localNames = collectLocalDeclarations(sourceFile);

  const metaDeclaration = sourceFile.getVariableDeclaration("meta");
  const metaObject = metaDeclaration
    ?.getInitializer()
    ?.asKind(SyntaxKind.ObjectLiteralExpression);
  const metaOverride = getDocsSourceOverride(metaObject);

  for (const variable of sourceFile.getVariableDeclarations()) {
    if (!variable.isExported() || variable.getName() === "meta") continue;
    const initializer = variable.getInitializer();
    if (!initializer) continue;
    const exportName = variable.getName();

    const finish = (verdict: Verdict, detail = "") => {
      results.push({ file, exportName, verdict, detail });
    };

    // CSF2 function story.
    if (
      initializer.isKind(SyntaxKind.ArrowFunction) ||
      initializer.isKind(SyntaxKind.FunctionExpression)
    ) {
      if (initializer.getParameters().length > 0) {
        finish("dynamic");
        continue;
      }
      const csf2 = classifyRenderContents(initializer, localNames);
      finish(csf2.verdict, csf2.detail);
      continue;
    }

    if (!initializer.isKind(SyntaxKind.ObjectLiteralExpression)) continue;
    // Stories excluded from autodocs never get a docs code panel.
    const tags = getProperty(initializer, "tags");
    if (tags?.getText().includes('"!autodocs"')) {
      continue;
    }

    // Only treat it as a story when typed/shaped like one (has render/args/
    // play/parameters or an empty object with meta component).
    const storyOverride = getDocsSourceOverride(initializer);
    if (storyOverride.code || metaOverride.code) {
      finish("explicit-override");
      continue;
    }
    if (storyOverride.hidden || metaOverride.hidden) {
      finish("explicit-override", "code panel hidden (sourceState none)");
      continue;
    }

    const renderValue = getProperty(initializer, "render");
    const render =
      renderValue?.asKind(SyntaxKind.ArrowFunction) ??
      renderValue?.asKind(SyntaxKind.FunctionExpression);

    if (!renderValue) {
      // Args story (or pure-args variant): Storybook auto-generates
      // `<Component {...args} />` from the meta component.
      finish("dynamic", "args story");
      continue;
    }

    if (render && render.getParameters().length > 0) {
      finish("dynamic", "args-based render");
      continue;
    }

    if (storyOverride.dynamic || metaOverride.dynamic) {
      // Dynamic snippet serializes the rendered tree: opaque only when the
      // tree's root is a local component (the serializer stops there).
      if (render) {
        const tags = collectJsxTags(render);
        const opaqueRoot =
          tags.size > 0 &&
          [...tags].every((tag) => !isHostTag(tag) && localNames.has(tag));
        if (opaqueRoot) {
          finish(
            "local-wrapper",
            `dynamic snippet stops at file-local component(s): ${[...tags].join(", ")}`,
          );
          continue;
        }
      }
      finish("dynamic", "explicit dynamic type");
      continue;
    }

    if (!render) {
      // `render: OtherStory.render` — reuses another story's render; resolve
      // the referenced story's render arity.
      if (renderValue.isKind(SyntaxKind.PropertyAccessExpression)) {
        const objectName = renderValue.getExpression().getText();
        const propName = renderValue.getName();
        const referenced = sourceFile
          .getVariableDeclaration(objectName)
          ?.getInitializer()
          ?.asKind(SyntaxKind.ObjectLiteralExpression);
        const referencedRender =
          referenced && propName === "render"
            ? getProperty(referenced, "render")?.asKind(SyntaxKind.ArrowFunction)
            : undefined;
        if (referencedRender && referencedRender.getParameters().length > 0) {
          finish("dynamic", `args-based render via ${renderValue.getText()}`);
          continue;
        }
        finish(
          "story-object-dump",
          `render references ${renderValue.getText()} (arity 0 or unresolved) — static story source shown`,
        );
        continue;
      }

      // `render: someSharedFn` — Storybook resolves __isArgsStory from the
      // actual function's arity at runtime, so resolve the reference here.
      if (renderValue.isKind(SyntaxKind.Identifier)) {
        const name = renderValue.getText();
        const declared =
          sourceFile.getFunction(name)?.getParameters().length ??
          sourceFile
            .getVariableDeclaration(name)
            ?.getInitializer()
            ?.asKind(SyntaxKind.ArrowFunction)
            ?.getParameters().length ??
          sourceFile
            .getVariableDeclaration(name)
            ?.getInitializer()
            ?.asKind(SyntaxKind.FunctionExpression)
            ?.getParameters().length;
        if (declared !== undefined && declared > 0) {
          finish("dynamic", `args-based render via ${name}()`);
          continue;
        }
        finish(
          "story-object-dump",
          `render references ${name} (arity 0 or unresolved) — static story source shown`,
        );
        continue;
      }
      finish("story-object-dump", "render is not an inline function");
      continue;
    }

    // Static path: simulate the global transform on the story source.
    const snippet = transformStorySource(initializer.getText());
    if (snippet.trim() === initializer.getText().trim()) {
      finish("story-object-dump", "docs.source.transform could not parse this story");
      continue;
    }
    const { verdict, detail } = classifyRenderContents(render, localNames);
    finish(verdict, detail);
  }

  return results;
};

export const auditAllStories = (): StoryAuditResult[] => {
  const project = new Project({
    tsConfigFilePath: path.resolve(process.cwd(), "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
  });
  project.addSourceFilesAtPaths("src/**/*.stories.tsx");
  return project
    .getSourceFiles()
    .sort((a, b) => a.getFilePath().localeCompare(b.getFilePath()))
    .flatMap((sourceFile) => auditStoryFile(sourceFile));
};

const BAD_VERDICTS: Verdict[] = [
  "helper-call",
  "local-wrapper",
  "story-object-dump",
];

export const findViolations = (
  results: StoryAuditResult[],
): StoryAuditResult[] =>
  results.filter((result) => BAD_VERDICTS.includes(result.verdict));

// CLI: `yarn tsx scripts/storybook-docs/audit-story-sources.ts`
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const results = auditAllStories();
  const violations = findViolations(results);
  const byVerdict = new Map<Verdict, number>();
  for (const result of results) {
    byVerdict.set(result.verdict, (byVerdict.get(result.verdict) ?? 0) + 1);
  }
  console.log("Story docs-source audit:");
  for (const [verdict, count] of [...byVerdict.entries()].sort()) {
    console.log(`  ${verdict}: ${count}`);
  }
  if (violations.length > 0) {
    console.log(`\n${violations.length} stories need attention:`);
    for (const violation of violations) {
      console.log(
        `  ${violation.file} › ${violation.exportName}: [${violation.verdict}] ${violation.detail}`,
      );
    }
    process.exitCode = 1;
  }
}
