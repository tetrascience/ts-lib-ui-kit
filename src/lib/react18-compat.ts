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
 *
 * To deprecate React 18: export the plain components as well (for example from
 * a React 19 entry point) and mark the `WithRef` exports deprecated. To drop
 * it: delete each `withRef` line, export `X` itself, and make `inertProp`
 * return `{ inert }`.
 *
 * `yarn check:react18-compat` (scripts/build/audit-react18-compat.ts) fails CI
 * when a component that accepts `ref` is not wrapped, or when JSX writes a
 * boolean `inert`, so new components cannot regress React 18 support.
 */
import * as React from "react"

/** React major version, read once at module load. */
const REACT_MAJOR = Number.parseInt(React.version, 10)

/** First major that treats `inert` as a boolean attribute. */
const INERT_BOOLEAN_SINCE_MAJOR = 19

/**
 * Any function component, including generic ones and `React.FC` (whose React 19
 * return type admits a Promise). `never` accepts every props type.
 */
type FunctionComponentLike = (props: never) => React.ReactNode | Promise<React.ReactNode>

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
 * The return type is the React 19 component's own type, so the export's public
 * props (including generics) are identical to it.
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
  const renderWithProps = render as unknown as (props: object) => React.ReactNode
  const Forwarded = React.forwardRef<unknown, object>(function ForwardRefRender(props, ref) {
    return renderWithProps(ref == null ? props : { ...props, ref })
  })
  Forwarded.displayName = displayName
  const react19 = render as unknown as WithDocgen
  react19.displayName ??= displayName
  // Storybook's react-docgen plugin attaches the props table and description to
  // the declaration it parsed, the plain component, and appends that assignment
  // at the end of the module, after this call. Read it lazily so the exported component, which
  // is what stories pass as `component`, shows the same docs.
  Object.defineProperty(Forwarded, "__docgenInfo", {
    configurable: true,
    get: () => react19.__docgenInfo,
  })
  // The forwardRef object is callable from JSX exactly like `render`, and its
  // props are `render`'s props, so the original type is the accurate public type.
  return Forwarded as unknown as C
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
  if (REACT_MAJOR >= INERT_BOOLEAN_SINCE_MAJOR) return { inert }
  // React 18's attribute path needs a string; the type is React 19's boolean.
  return { inert: (inert ? "" : undefined) as unknown as boolean | undefined }
}
