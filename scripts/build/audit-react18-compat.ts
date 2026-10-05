/**
 * UXT-77: fail when a component would break on React 18.
 *
 * The kit is written React 19-style. React 18 strips `ref` from a function
 * component's props, so any component whose props accept `ref` must go through
 * `withRef` from `src/lib/react18-compat.ts`. React 18 also drops a boolean
 * `inert`, so JSX must spread `inertProp(...)` instead of writing `inert={…}`.
 *
 * Rules, over every top-level PascalCase component in `src/components`:
 *
 * - "unwrapped-ref":       the props type has `ref` but the component is a plain
 *                          function or arrow. Fix: `const X = withRef("X", function X(…) {…})`.
 * - "direct-forward-ref":  `React.forwardRef` used directly. Fix: use `withRef`, so
 *                          dropping React 18 stays a one-file change.
 * - "display-name":        `withRef`'s name literal differs from the variable name.
 * - "boolean-inert":       a JSX `inert={…}` attribute. Fix: `{...inertProp(…)}`.
 * - "dom-props-without-ref": the props carry DOM attributes (they reach the DOM, so the
 *                        component can sit under a Radix `asChild`) but have no `ref`, as
 *                        with `HTMLAttributes<T>`. Fix: type them `ComponentProps<"tag">`
 *                        and wrap in `withRef`, or list the component in
 *                        `REF_EXCEPTIONS` with the reason it cannot take a ref.
 * - "stale-exception":     a `REF_EXCEPTIONS` entry no longer matches a component that
 *                        lacks a ref. Remove it so the documented list stays true.
 *
 * The props check uses the type checker, not the annotation text, so a props
 * type that reaches `ref` through `ComponentProps<"div">`, a Radix primitive or
 * an interface `extends` chain is caught the same way.
 *
 * Run: `yarn check:react18-compat`. A unit test runs the same audit in CI.
 */
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { Node, Project, SyntaxKind } from "ts-morph";

import type { CallExpression, Expression, SourceFile, Type } from "ts-morph";

export type ViolationKind =
  | "unwrapped-ref"
  | "direct-forward-ref"
  | "display-name"
  | "boolean-inert"
  | "dom-props-without-ref"
  | "stale-exception";

/**
 * Components whose props carry DOM attributes but that cannot forward `ref`, and why.
 * This is the source for the "Components without a ref" table in README.md; keep the
 * two in step. Every other component that spreads DOM props must accept and forward
 * `ref`, which the "dom-props-without-ref" rule enforces.
 */
export const REF_EXCEPTIONS: Readonly<Record<string, string>> = {
  Conversation:
    "Root is use-stick-to-bottom's StickToBottom, whose props omit ref. Use contextRef: its scrollRef and contentRef hold the DOM nodes.",
  ConversationContent:
    "Root is StickToBottom.Content, whose props omit ref. Use Conversation's contextRef (contentRef).",
  ResizablePanelGroup:
    "Root is react-resizable-panels' Group, which takes elementRef for the DOM node and groupRef for the imperative handle, not ref.",
  ResizablePanel:
    "Root is react-resizable-panels' Panel, which takes elementRef for the DOM node and panelRef for the imperative handle, not ref.",
  ResizableHandle: "Root is react-resizable-panels' Separator, which takes elementRef for the DOM node, not ref.",
  CalendarDayButton:
    "Rendered by react-day-picker through Calendar's components prop with DayPicker's DayButton props, which carry no ref; it keeps its own ref to move focus.",
};

/** A DOM-only handler: present on every `HTMLAttributes`, absent from data-style props. */
const DOM_PROP_PROBE = "onPointerDown";

export interface Violation {
  file: string;
  line: number;
  name: string;
  kind: ViolationKind;
  detail: string;
}

export interface AuditResult {
  /** Components that accept `ref` and are wrapped in `withRef`. */
  wrapped: string[];
  /** `REF_EXCEPTIONS` entries that matched a component with DOM props and no ref. */
  excepted: string[];
  violations: Violation[];
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const isComponentName = (name: string | undefined): name is string => !!name && /^[A-Z]/.test(name);

function calleeName(call: CallExpression): string {
  const expr = call.getExpression();
  if (Node.isPropertyAccessExpression(expr)) return expr.getName();
  return expr.getText();
}

function typeHas(type: Type, property: string): boolean {
  if (type.getProperty(property)) return true;
  return type.isUnion() && type.getUnionTypes().some((member) => !!member.getProperty(property));
}

/** The type of the first parameter of the component's call signature. */
function propsType(node: Node): Type | undefined {
  const props = node.getType().getCallSignatures()[0]?.getParameters()[0];
  return props?.getTypeAtLocation(node);
}

/** Whether the component's props accept `ref`. */
function acceptsRef(node: Node): boolean {
  const props = propsType(node);
  return !!props && typeHas(props, "ref");
}

/** Whether the component's props carry DOM attributes without `ref`. */
function hasDomPropsWithoutRef(node: Node): boolean {
  const props = propsType(node);
  return !!props && typeHas(props, DOM_PROP_PROBE) && !typeHas(props, "ref");
}

type Classified =
  | { kind: "plain"; fn: Node }
  | { kind: "withRef"; render: Node; displayName: string | undefined }
  | { kind: "forwardRef" }
  | { kind: "other" };

/** Peel `memo(...)` and classify what is inside. */
function classify(expr: Expression): Classified {
  if (Node.isArrowFunction(expr) || Node.isFunctionExpression(expr)) return { kind: "plain", fn: expr };
  if (!Node.isCallExpression(expr)) return { kind: "other" };
  const callee = calleeName(expr);
  const [first, second] = expr.getArguments();
  if (callee === "withRef") {
    const displayName = first && Node.isStringLiteral(first) ? first.getLiteralValue() : undefined;
    return second ? { kind: "withRef", render: second, displayName } : { kind: "other" };
  }
  if (callee === "forwardRef") return { kind: "forwardRef" };
  if (callee === "memo" && first && Node.isExpression(first)) return classify(first);
  return { kind: "other" };
}

type Reporter = (node: Node, name: string, kind: ViolationKind, detail: string) => void;

function reportDomPropsWithoutRef(node: Node, name: string, excepted: string[], report: Reporter) {
  if (!hasDomPropsWithoutRef(node)) return;
  if (Object.hasOwn(REF_EXCEPTIONS, name)) {
    excepted.push(name);
    return;
  }
  report(
    node,
    name,
    "dom-props-without-ref",
    `props carry DOM attributes but no \`ref\`, so it breaks under a Radix asChild on React 18. Type them ComponentProps<"tag"> and wrap in withRef, or add ${name} to REF_EXCEPTIONS with the reason`,
  );
}

export function auditSourceFile(sourceFile: SourceFile, root = repoRoot): AuditResult {
  const result: AuditResult = { wrapped: [], excepted: [], violations: [] };
  const file = path.relative(root, sourceFile.getFilePath());
  const report: Reporter = (node, name, kind, detail) =>
    result.violations.push({ file, line: node.getStartLineNumber(), name, kind, detail });

  for (const statement of sourceFile.getStatements()) {
    if (Node.isFunctionDeclaration(statement)) {
      const name = statement.getName();
      if (!isComponentName(name) || !statement.hasBody()) continue;
      reportDomPropsWithoutRef(statement, name, result.excepted, report);
      if (!acceptsRef(statement)) continue;
      report(statement, name, "unwrapped-ref", `props accept \`ref\`; wrap it: const ${name} = withRef("${name}", function ${name}(…) {…})`);
      continue;
    }
    if (!Node.isVariableStatement(statement)) continue;
    for (const declaration of statement.getDeclarations()) {
      const name = declaration.getName();
      const initializer = declaration.getInitializer();
      if (!isComponentName(name) || !initializer) continue;
      const classified = classify(initializer);
      switch (classified.kind) {
        case "plain": {
          // Annotated consts (`const X: React.FC<P> = …`) carry their props on the declaration.
          const typed = declaration.getTypeNode() ? declaration : classified.fn;
          reportDomPropsWithoutRef(typed, name, result.excepted, report);
          if (acceptsRef(typed))
            report(declaration, name, "unwrapped-ref", `props accept \`ref\`; wrap it: const ${name} = withRef("${name}", function ${name}(…) {…})`);
          break;
        }
        case "withRef":
          result.wrapped.push(`${file}:${name}`);
          // withRef keeps the render function's own props type, so wrapping a component
          // typed HTMLAttributes<T> still leaves `ref` out of its public props.
          reportDomPropsWithoutRef(classified.render, name, result.excepted, report);
          if (classified.displayName !== name)
            report(declaration, name, "display-name", `withRef display name is ${JSON.stringify(classified.displayName)}; expected "${name}"`);
          break;
        case "forwardRef":
          report(declaration, name, "direct-forward-ref", "use withRef from @/lib/react18-compat instead of forwardRef");
          break;
        case "other":
          break;
      }
    }
  }

  for (const attribute of sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute)) {
    if (attribute.getNameNode().getText() !== "inert") continue;
    report(attribute, "inert", "boolean-inert", "React 18 drops a boolean inert; spread {...inertProp(value)} instead");
  }

  return result;
}

const isComponentSource = (filePath: string) =>
  !/\.(stories|test|spec)\.tsx?$/.test(filePath) && !filePath.includes(`${path.sep}__tests__${path.sep}`);

export function auditReact18Compat(root = repoRoot): AuditResult {
  const project = new Project({ tsConfigFilePath: path.join(root, "tsconfig.json") });
  const result: AuditResult = { wrapped: [], excepted: [], violations: [] };
  for (const sourceFile of project.getSourceFiles(path.join(root, "src/components/**/*.tsx"))) {
    if (!isComponentSource(sourceFile.getFilePath())) continue;
    const fileResult = auditSourceFile(sourceFile, root);
    result.wrapped.push(...fileResult.wrapped);
    result.excepted.push(...fileResult.excepted);
    result.violations.push(...fileResult.violations);
  }
  for (const name of Object.keys(REF_EXCEPTIONS)) {
    if (result.excepted.includes(name)) continue;
    result.violations.push({
      file: "scripts/build/audit-react18-compat.ts",
      line: 0,
      name,
      kind: "stale-exception",
      detail: "listed in REF_EXCEPTIONS but no component by that name has DOM props without ref; remove the entry and its README row",
    });
  }
  return result;
}

export function formatViolations(violations: Violation[]): string {
  return violations.map((v) => `${v.file}:${v.line} ${v.name} [${v.kind}] ${v.detail}`).join("\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { wrapped, violations } = auditReact18Compat();
  if (violations.length > 0) {
    console.error(`React 18 compatibility audit failed (${violations.length}):\n${formatViolations(violations)}`);
    process.exit(1);
  }
  console.log(`React 18 compatibility audit passed: ${wrapped.length} ref-forwarding components, no violations.`);
}
