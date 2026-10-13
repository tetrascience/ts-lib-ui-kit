import * as React from "react"

type PossibleRef<T> = React.Ref<T> | undefined

function setRef<T>(ref: PossibleRef<T>, node: T | null) {
  if (typeof ref === "function") ref(node)
  else if (ref) (ref as React.RefObject<T | null>).current = node
}

/**
 * Attach a component's own ref and a consumer's `ref` to the same element.
 *
 * `<div ref={internalRef} {...props}>` lets a consumer's `ref` (inside `props`)
 * replace the internal one, and `{...props} ref={internalRef}` drops the
 * consumer's. Destructure `ref` out of props and pass both here instead:
 *
 * @example
 * function Tree({ ref, ...props }: TreeProps) {
 *   const treeRef = React.useRef<HTMLDivElement>(null)
 *   return <div ref={useComposedRefs(treeRef, ref)} {...props} />
 * }
 *
 * The returned callback is stable across renders and always writes to the
 * refs passed on the latest render.
 */
export function useComposedRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  const latest = React.useRef(refs)
  latest.current = refs
  return React.useCallback((node: T | null) => {
    for (const ref of latest.current) setRef(ref, node)
  }, [])
}
