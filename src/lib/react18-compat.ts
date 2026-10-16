/**
 * React 18 compatibility seam (UXT-77).
 *
 * The kit is written against React 19, but the TetraScience platform host and
 * its Module Federation apps share a React 18 singleton. React 18 support is
 * temporary, so it is kept out of the components themselves:
 *
 * - Every component that forwards a ref keeps its React 19 declaration, name
 *   and body untouched. A wrapper is added after it and exported under the
 *   component's name:
 *
 *     const XWithRef = withRef("X", X)
 *     export { XWithRef as X }
 *
 *   Inside the file, `X` is still the plain React 19 component.
 * - `inertProp` spells the `inert` attribute so React 18 applies it.
 * - `isElementOfType` replaces `element.type === X`, which no longer matches once
 *   consumers render the wrapper.
 *
 * To deprecate React 18: export the plain components as well (for example from
 * a React 19 entry point) and mark the `WithRef` exports deprecated. To drop
 * it: delete each `withRef` line, export `X` itself, make `inertProp` return
 * `{ inert }`, and make `isElementOfType` a plain `element.type === component`.
 *
 * `yarn check:react18-compat` (scripts/build/audit-react18-compat.ts) fails CI
 * when a component that accepts `ref` is not wrapped, or when JSX writes a
 * boolean `inert`, so new components cannot regress React 18 support.
 */
import * as React from "react"

/**
 * Whether the running React is 18, read once at module load. Checked as "18.x"
 * rather than "major below 19" because React 19 prereleases report versions such
 * as `0.0.0-experimental-…`, which would otherwise parse as 0 and get the React
 * 18 behaviour. The peer range is `^18.2.0 || ^19.0.0`, so nothing older runs.
 */
const IS_REACT_18 = React.version.startsWith("18.")

/**
 * Any function component, including generic ones and `React.FC` (whose React 19
 * return type admits a Promise). `never` accepts every props type.
 */
type FunctionComponentLike = (props: never) => React.ReactNode | Promise<React.ReactNode>

/** Each wrapper's plain component, for `isElementOfType`. */
const plainComponentOf = new WeakMap<object, unknown>()

/** Every component `withRef` returned, for tests that sweep the exports. */
const withRefResults = new WeakSet<object>()

/** What Storybook's react-docgen plugin attaches to a component definition. */
type WithDocgen = { displayName?: string; __docgenInfo?: unknown }

/**
 * Makes a React 19-style component (one that receives `ref` as an ordinary
 * prop) forward refs on React 18 as well.
 *
 * React 18 strips `ref` from a function component's props, so without this a
 * consumer's `ref` is silently dropped and Radix `asChild` triggers
 * (`<TooltipTrigger asChild><Button /></TooltipTrigger>`) cannot attach the
 * ref they need for positioning, focus and outside-click handling.
 *
 * The React 19 component is untouched: `ref` keeps arriving inside props,
 * exactly as React 19 delivers it. On React 19 `forwardRef` hands the ref over
 * separately and strips it from props, so this re-attaches it in both cases.
 *
 * On React 19 and later it returns `render` itself: React 19 already delivers
 * `ref` as a prop, so there is nothing to forward and no extra component layer.
 * The declared return type is therefore exact on React 19. On React 18 the
 * runtime value is a `forwardRef` object typed as `render`'s function type: it
 * renders identically from JSX, but it is not callable as a plain function, so
 * kit code never calls components directly (`items.map(Item)`, `Badge({…})`).
 *
 * @param displayName The component name. Passed as a literal because the library
 *   build mangles function names. It is also set on the React 19 component, so
 *   that one keeps its public name too.
 * @param render The React 19 component, unchanged.
 *
 * @example
 * function Button({ className, ...props }: ButtonProps) {
 *   return <button className={cn(buttonVariants(), className)} {...props} />
 * }
 *
 * // React 18 compatibility: forwards `ref` on React 18. Deprecated in a future release.
 * const ButtonWithRef = withRef("Button", Button)
 *
 * export { ButtonWithRef as Button }
 */
export function withRef<C extends FunctionComponentLike>(displayName: string, render: C): C {
  const react19 = render as unknown as WithDocgen
  react19.displayName ??= displayName
  if (!IS_REACT_18) {
    withRefResults.add(render)
    return render
  }
  const renderWithProps = render as unknown as (props: object) => React.ReactNode
  const Forwarded = React.forwardRef<unknown, object>(function ForwardRefRender(props, ref) {
    return renderWithProps(ref == null ? props : { ...props, ref })
  })
  Forwarded.displayName = displayName
  plainComponentOf.set(Forwarded, render)
  withRefResults.add(Forwarded)
  // Storybook's react-docgen plugin attaches the props table and description to
  // the declaration it parsed, the plain component, and appends that assignment
  // at the end of the module, after this call. Read it lazily so the exported
  // component, which is what stories pass as `component`, shows the same docs.
  Object.defineProperty(Forwarded, "__docgenInfo", {
    configurable: true,
    get: () => react19.__docgenInfo,
  })
  // The forwardRef object is callable from JSX exactly like `render`, and its
  // props are `render`'s props, so the original type is the accurate public type.
  return Forwarded as unknown as C
}

/** Whether `component` came from `withRef`. For tests that sweep the kit's exports. */
export function isWithRefComponent(component: unknown): boolean {
  return (typeof component === "object" || typeof component === "function") && component !== null && withRefResults.has(component)
}

/**
 * Whether `element` renders `component`, directly or through its `withRef` wrapper.
 *
 * Replaces `element.type === component` for components that compare their
 * children by identity (`Tree` skipping its placeholders, `ItemGroup` skipping
 * separators). On React 18 consumers render the exported wrapper, whose `type`
 * is the forwardRef object rather than the plain component.
 *
 * @example
 * React.Children.map(children, (child) =>
 *   React.isValidElement(child) && isElementOfType(child, ItemSeparator) ? child : wrap(child))
 */
export function isElementOfType(element: React.ReactElement, component: unknown): boolean {
  if (element.type === component) return true
  return typeof element.type === "object" && element.type !== null && plainComponentOf.get(element.type) === component
}

/**
 * Spreads the `inert` attribute in a form both React versions apply.
 *
 * React 19 knows `inert` as a boolean attribute. React 18 does not: it drops a
 * boolean value with a warning, which leaves "inert" content focusable. React 18
 * passes unknown attributes through only as strings, so it gets `""` (present)
 * or nothing (absent).
 *
 * @example
 * <nav {...inertProp(isCollapsed)} />
 */
export function inertProp(inert: boolean | undefined): Pick<React.HTMLAttributes<HTMLElement>, "inert"> {
  if (!IS_REACT_18) return { inert }
  // React 18's attribute path needs a string; the type is React 19's boolean.
  return { inert: (inert ? "" : undefined) as unknown as boolean | undefined }
}
