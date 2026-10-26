/**
 * UXT-77: fail when a component would break on React 18.
 *
 * The kit is written React 19-style. React 18 strips `ref` from a function
 * component's props, so any component whose props accept `ref` keeps its React 19
 * declaration untouched and is exported through a wrapper from
 * `src/lib/react18-compat.ts`: `const XWithRef = withRef("X", X)` and
 * `export { XWithRef as X }`. React 18 also drops a boolean `inert`, so JSX
 * must spread `inertProp(...)` instead of writing `inert={…}`.
 *
 * Rules, over every top-level PascalCase component in `src/components`:
 *
 * - "unwrapped-ref":       an exported component's props accept `ref` but no
 *                          `withRef` call wraps it. Fix: add
 *                          `const XWithRef = withRef("X", X)` and export it as `X`.
 * - "render-name":         `withRef` does not wrap the component named by its display
 *                          name (`X`, or `X.type` for a memoised one), e.g. an inline
 *                          function. The convention keeps the React 19 component intact.
 * - "wrapper-name":        the wrapper is not named `XWithRef`.
 * - "exported-unwrapped":  a wrapped component is exported as itself rather than
 *                          through its wrapper, so React 18 consumers get no ref.
 * - "same-file-unwrapped": a ref-accepting component is rendered in JSX inside its own
 *                          file as `X`, the plain component. Render `XWithRef`: refs can
 *                          reach a child implicitly (an `asChild` parent, a props spread,
 *                          Radix Presence), so every in-file use goes through the wrapper.
 * - "plain-reference":     the plain component is used as a value anywhere other than
 *                          its `withRef` call, `isElementOfType`, a `displayName`
 *                          assignment or a type position. Consumers hold the wrapper,
 *                          so `child.type === X`, `switch (child.type) { case X: }`,
 *                          `[X, Y].includes(child.type)` and `Object.is(child.type, X)`
 *                          all silently stop matching. Use `isElementOfType(child, X)`.
 * - "ref-clobbered":       an element sets `ref={internal}` and also spreads props that
 *                          carry `ref`. Whichever comes last wins, so either the
 *                          component's own ref or the consumer's is lost. Destructure
 *                          `ref` and pass `useComposedRefs(internal, ref)`.
 * - "missing-marker":      the wrapper's statement is not directly preceded by
 *                          `// React 18 compatibility: …`, so removing React 18 by
 *                          searching for the marker would miss it.
 * - "direct-forward-ref":  `React.forwardRef` used directly. Fix: use `withRef`, so
 *                          the React 18 layer stays separable. `FORWARD_REF_ALLOWED`
 *                          lists the components that predate this rule.
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
 * Run: `yarn check:react18-compat`. CI runs it as a step of the build job; the
 * unit test only exercises the rules against fixtures.
 */
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { Node, Project, SyntaxKind } from "ts-morph";

import type { CallExpression, Expression, SourceFile, Type } from "ts-morph";

export type ViolationKind =
  | "unwrapped-ref"
  | "render-name"
  | "wrapper-name"
  | "exported-unwrapped"
  | "same-file-unwrapped"
  | "plain-reference"
  | "ref-clobbered"
  | "missing-marker"
  | "direct-forward-ref"
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

/**
 * Components that call `React.forwardRef` themselves. They predate `withRef` and
 * already forward refs on React 18 and 19, so there is nothing to separate out.
 */
export const FORWARD_REF_ALLOWED: ReadonlySet<string> = new Set(["TetraScienceIcon", "TetraMoleculeIcon"]);

/** The comment that must sit directly above every wrapper, so React 18 can be removed by search. */
export const REACT18_MARKER = "// React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.";

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
  | { kind: "withRef"; render: Node; displayName: string | undefined; call: CallExpression }
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
    return second ? { kind: "withRef", render: second, displayName, call: expr } : { kind: "other" };
  }
  if (callee === "forwardRef") return { kind: "forwardRef" };
  if (callee === "memo" && first && Node.isExpression(first)) return classify(first);
  return { kind: "other" };
}

type Reporter = (node: Node, name: string, kind: ViolationKind, detail: string) => void;

/** The declaration a `withRef` render argument names: `X`, or `X` from `X.type`. */
function renderTarget(render: Node): string | undefined {
  if (Node.isIdentifier(render)) return render.getText();
  if (Node.isPropertyAccessExpression(render) && render.getName() === "type" && Node.isIdentifier(render.getExpression()))
    return render.getExpression().getText();
  return undefined;
}

/** Names passed to `withRef` anywhere in the file: those declarations are wrapped. */
function withRefTargets(sourceFile: SourceFile): Set<string> {
  const targets = new Set<string>();
  for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    if (calleeName(call) !== "withRef") continue;
    const target = call.getArguments()[1] && renderTarget(call.getArguments()[1]);
    if (target) targets.add(target);
  }
  return targets;
}

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

/** Shared state for the per-file rules. */
interface FileContext {
  sourceFile: SourceFile;
  file: string;
  result: AuditResult;
  report: Reporter;
  /** Plain components a `withRef` call in this file wraps. */
  targets: Set<string>;
  exportedLocals: Set<string | undefined>;
  /** Plain components in this file whose props accept ref: targets plus internal ones. */
  refComponents: Set<string>;
  wrapHint: (name: string) => string;
}

/** Wrapping, naming, markers and DOM props, per top-level component. */
function checkDeclarations({ sourceFile, file, result, report, targets, exportedLocals, refComponents, wrapHint }: FileContext) {
  for (const statement of sourceFile.getStatements()) {
    if (Node.isFunctionDeclaration(statement)) {
      const name = statement.getName();
      if (!isComponentName(name) || !statement.hasBody() || targets.has(name)) continue;
      reportDomPropsWithoutRef(statement, name, result.excepted, report);
      if (!acceptsRef(statement)) continue;
      refComponents.add(name);
      if (exportedLocals.has(name)) report(statement, name, "unwrapped-ref", wrapHint(name));
      continue;
    }
    if (!Node.isVariableStatement(statement)) continue;
    for (const declaration of statement.getDeclarations()) {
      const name = declaration.getName();
      const initializer = declaration.getInitializer();
      if (!isComponentName(name) || !initializer || targets.has(name)) continue;
      const classified = classify(initializer);
      switch (classified.kind) {
        case "plain": {
          // Annotated consts (`const X: React.FC<P> = …`) carry their props on the declaration.
          const typed = declaration.getTypeNode() ? declaration : classified.fn;
          reportDomPropsWithoutRef(typed, name, result.excepted, report);
          if (acceptsRef(typed)) {
            refComponents.add(name);
            if (exportedLocals.has(name)) report(declaration, name, "unwrapped-ref", wrapHint(name));
          }
          break;
        }
        case "withRef": {
          const component = classified.displayName ?? name;
          const leading = statement.getLeadingCommentRanges().map((c) => c.getText().trim());
          if (leading.at(-1) !== REACT18_MARKER)
            report(declaration, name, "missing-marker", `put "${REACT18_MARKER}" on the line directly above the ${name} wrapper`);
          result.wrapped.push(`${file}:${component}`);
          // withRef keeps the render function's own props type, so wrapping a component
          // typed HTMLAttributes<T> still leaves `ref` out of its public props.
          reportDomPropsWithoutRef(classified.render, component, result.excepted, report);
          if (name !== `${component}WithRef`)
            report(declaration, name, "wrapper-name", `the wrapper for ${component} must be named ${component}WithRef`);
          if (renderTarget(classified.render) !== component)
            report(declaration, name, "render-name", `withRef("${component}", …) must wrap ${component} itself (or ${component}.type when it is memoised), not ${classified.render.getText().slice(0, 40)}`);
          break;
        }
        case "forwardRef":
          if (!FORWARD_REF_ALLOWED.has(name))
            report(declaration, name, "direct-forward-ref", `use withRef from @/lib/react18-compat instead of forwardRef: const ${name}WithRef = withRef("${name}", ${name})`);
          break;
        case "other":
          break;
      }
    }
  }
}

/** A wrapped component reaches consumers only through its wrapper. */
function checkExports({ sourceFile, report, targets }: FileContext) {
  // A wrapped component must reach consumers only through its wrapper.
  for (const [exportedName, declarations] of sourceFile.getExportedDeclarations()) {
    for (const exported of declarations) {
      const localName = Node.isFunctionDeclaration(exported) || Node.isVariableDeclaration(exported) ? exported.getName() : undefined;
      if (localName && targets.has(localName))
        report(exported, exportedName, "exported-unwrapped", `${localName} is exported without its wrapper; export { ${localName}WithRef as ${exportedName} } instead`);
    }
  }
}

/** Every in-file JSX use of a ref-accepting component renders its wrapper. */
function checkSameFileJsx({ sourceFile, report, targets, refComponents }: FileContext) {
  // Inside the file, X is the plain component, so every JSX use renders XWithRef.
  // "Only where a ref reaches it" is not checkable: libraries hand refs to children
  // implicitly (Radix Presence inside a Portal clones its child with one).
  for (const element of [...sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement), ...sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)]) {
    const tag = element.getTagNameNode().getText();
    if (!refComponents.has(tag)) continue;
    const addWrapper = targets.has(tag) ? "" : `, adding const ${tag}WithRef = withRef("${tag}", ${tag})`;
    report(element, tag, "same-file-unwrapped", `inside this file ${tag} is the plain component, which drops refs on React 18; render <${tag}WithRef>${addWrapper}`);
  }
}

/** No value use of a wrapped plain component (identity checks in any form). */
function checkPlainReferences({ sourceFile, report, targets }: FileContext) {
  // Consumers hold the wrapper, so any value use of the plain component (identity
  // checks in every form: ===, switch/case, .includes(), Object.is) silently stops
  // matching. Allowed: its own declaration, withRef's argument, isElementOfType's
  // component argument, displayName assignments, JSX tags (checked above) and types.
  // Resolve by symbol, not text: `Toggle` in `import { Toggle as TogglePrimitive }` or
  // `Primitive.CollapsibleTrigger` shares a name with a target but is a different thing.
  const targetDeclarations = new Map<string, Node>();
  for (const statement of sourceFile.getStatements()) {
    if (Node.isFunctionDeclaration(statement) && statement.getName() && targets.has(statement.getName()!)) targetDeclarations.set(statement.getName()!, statement);
    if (Node.isVariableStatement(statement))
      for (const d of statement.getDeclarations()) if (targets.has(d.getName())) targetDeclarations.set(d.getName(), d);
  }
  for (const identifier of sourceFile.getDescendantsOfKind(SyntaxKind.Identifier)) {
    const name = identifier.getText();
    const declaration = targetDeclarations.get(name);
    if (!declaration) continue;
    if (!(identifier.getSymbol()?.getDeclarations() ?? []).includes(declaration)) continue;
    const parent = identifier.getParent();
    if (!parent) continue;
    // Declarations and export specifiers (exported-unwrapped covers the latter).
    if ((Node.isFunctionDeclaration(parent) || Node.isVariableDeclaration(parent)) && parent.getNameNode() === identifier) continue;
    if (Node.isExportSpecifier(parent)) continue;
    // JSX tags are the same-file rule's job.
    if (Node.isJsxOpeningElement(parent) || Node.isJsxSelfClosingElement(parent) || Node.isJsxClosingElement(parent)) continue;
    // Doc comments: {@link X} pointers on the wrappers.
    if (identifier.getFirstAncestor((a) => Node.isJSDoc(a))) continue;
    // Type positions: ComponentProps<typeof X>, X in a type annotation.
    if (identifier.getFirstAncestor((a) => Node.isTypeNode(a) && !Node.isExpressionWithTypeArguments(a))) continue;
    // withRef("X", X) / withRef("X", X.type), isElementOfType(child, X), X.displayName = …
    const call = parent.getParentIfKind(SyntaxKind.CallExpression) ?? (Node.isCallExpression(parent) ? parent : undefined);
    const callee = Node.isCallExpression(parent) ? calleeName(parent) : call ? calleeName(call) : undefined;
    if (Node.isCallExpression(parent) && (callee === "withRef" || callee === "isElementOfType")) continue;
    if (Node.isPropertyAccessExpression(parent) && parent.getExpression() === identifier) {
      const member = parent.getName();
      if (member === "displayName") continue;
      if (member === "type" && call && calleeName(call) === "withRef") continue;
    }
    report(identifier, name, "plain-reference", `${name} is used as a value here, but consumers hold ${name}WithRef; compare elements with isElementOfType(child, ${name}) or use ${name}WithRef`);
  }
}

/** An element's own ref and a ref-carrying spread must not collide. */
function checkRefClobbering({ sourceFile, report }: FileContext) {
  // ref={internal} next to a spread that carries the consumer's ref: one of them is lost.
  for (const element of [...sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement), ...sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)]) {
    const attributes = element.getAttributes();
    const explicit = attributes.find((a) => Node.isJsxAttribute(a) && a.getNameNode().getText() === "ref");
    if (!explicit) continue;
    const spread = attributes.find((a) => Node.isJsxSpreadAttribute(a) && typeHas(a.getExpression().getType(), "ref"));
    if (!spread || !Node.isJsxSpreadAttribute(spread)) continue;
    const lost = explicit.getStart() < spread.getStart() ? "the component's own ref" : "the consumer's ref";
    report(element, element.getTagNameNode().getText(), "ref-clobbered", `${explicit.getText()} and {...${spread.getExpression().getText()}} both set ref, so ${lost} is lost; destructure ref and pass useComposedRefs(...)`);
  }
}

/** No boolean inert: React 18 drops it. */
function checkInert({ sourceFile, report }: FileContext) {
  for (const attribute of sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute)) {
    if (attribute.getNameNode().getText() !== "inert") continue;
    report(attribute, "inert", "boolean-inert", "React 18 drops a boolean inert; spread {...inertProp(value)} instead");
  }
}

export function auditSourceFile(sourceFile: SourceFile, root = repoRoot): AuditResult {
  const result: AuditResult = { wrapped: [], excepted: [], violations: [] };
  const file = path.relative(root, sourceFile.getFilePath());
  const report: Reporter = (node, name, kind, detail) =>
    result.violations.push({ file, line: node.getStartLineNumber(), name, kind, detail });
  // A React 19 declaration wrapped by withRef is checked at its withRef call.
  const targets = withRefTargets(sourceFile);
  const exportedLocals = new Set(
    [...sourceFile.getExportedDeclarations().values()].flat().map((d) =>
      Node.isFunctionDeclaration(d) || Node.isVariableDeclaration(d) ? d.getName() : undefined),
  );
  /** Plain components in this file whose props accept ref: wrapped targets and internal ones. */
  const refComponents = new Set(targets);
  const wrapHint = (name: string) =>
    `props accept \`ref\`; add const ${name}WithRef = withRef("${name}", ${name}) and export { ${name}WithRef as ${name} }`;
  const context: FileContext = { sourceFile, file, result, report, targets, exportedLocals, refComponents, wrapHint };
  // Order matters: checkDeclarations adds internal ref-accepting components to refComponents.
  checkDeclarations(context);
  checkExports(context);
  checkSameFileJsx(context);
  checkPlainReferences(context);
  checkRefClobbering(context);
  checkInert(context);
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

/** Fewer wrapped components than this means the audit did not see the component tree. */
const MIN_WRAPPED_COMPONENTS = 350;

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { wrapped, violations } = auditReact18Compat();
  if (wrapped.length < MIN_WRAPPED_COMPONENTS) {
    console.error(`React 18 compatibility audit saw only ${wrapped.length} wrapped components; expected at least ${MIN_WRAPPED_COMPONENTS}. Is the tsconfig include still src?`);
    process.exit(1);
  }
  if (violations.length > 0) {
    console.error(`React 18 compatibility audit failed (${violations.length}):\n${formatViolations(violations)}`);
    process.exit(1);
  }
  console.log(`React 18 compatibility audit passed: ${wrapped.length} ref-forwarding components, no violations.`);
}
