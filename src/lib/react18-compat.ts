/**
 * React 18 compatibility seam (UXT-77).
 *
 * The kit is written against React 19, but the TetraScience platform host and
 * its Module Federation apps share a React 18 singleton. Everything React 18
 * needs that React 19 does not lives in this one file, so dropping React 18
 * support is a change here rather than a sweep across every component:
 *
 * - `withRef`: make `withRef` return `render` unchanged, then optionally
 *   codemod the call sites back to plain function declarations.
 * - `inertProp`: return `{ inert }` unconditionally.
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

/** Any function component, including generic ones. `never` accepts every props type. */
type FunctionComponentLike = (props: never) => React.ReactNode

/**
 * Makes a React 19-style component (one that receives `ref` as an ordinary
 * prop) forward refs on React 18 as well.
 *
 * React 18 strips `ref` from a function component's props, so without this a
 * consumer's `ref` is silently dropped and Radix `asChild` triggers
 * (`<TooltipTrigger asChild><Button /></TooltipTrigger>`) cannot attach the
 * ref they need for positioning, focus and outside-click handling.
 *
 * The render function's body is unchanged: `ref` keeps arriving inside props,
 * exactly as React 19 delivers it. On React 19 `forwardRef` hands the ref over
 * separately and strips it from props, so this re-attaches it in both cases.
 *
 * The return type is the render function's own type, so the component's public
 * props (including generics) are identical to the unwrapped declaration.
 *
 * @param displayName The component name. Passed as a literal because the
 *   library build mangles function names, so `render.name` is not reliable.
 * @param render A named function expression. Name it so `rules-of-hooks`
 *   recognises it as a component.
 *
 * @example
 * const Button = withRef("Button", function Button({ className, ...props }: ButtonProps) {
 *   return <button className={cn(buttonVariants(), className)} {...props} />
 * })
 */
export function withRef<C extends FunctionComponentLike>(displayName: string, render: C): C {
  const renderWithProps = render as unknown as (props: object) => React.ReactNode
  const Forwarded = React.forwardRef<unknown, object>(function ForwardRefRender(props, ref) {
    return renderWithProps(ref == null ? props : { ...props, ref })
  })
  Forwarded.displayName = displayName
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
