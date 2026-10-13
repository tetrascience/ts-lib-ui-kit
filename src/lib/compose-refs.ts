import * as React from "react"

type PossibleRef<T> = React.Ref<T> | undefined

/** Writes `node` to a ref, returning a callback ref's cleanup if it gave one (React 19). */
function setRef<T>(ref: PossibleRef<T>, node: T | null): void | (() => void) {
  if (typeof ref === "function") return ref(node)
  if (ref) (ref as React.RefObject<T | null>).current = node
}

/** One ref callback that writes the node to every ref given. */
function composeRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  return (node) => {
    const cleanups = refs.map((ref) => setRef(ref, node))
    // Return a cleanup only when some ref gave one. React 19 then calls the cleanup
    // on detach instead of calling this callback with null, so a callback ref that
    // returns a cleanup never sees null. React 18 ignores the return value and
    // calls with null, which writes null to every ref as before.
    if (!cleanups.some((cleanup) => typeof cleanup === "function")) return
    return () => {
      cleanups.forEach((cleanup, i) => {
        if (typeof cleanup === "function") cleanup()
        else setRef(refs[i], null)
      })
    }
  }
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
 * The callback changes whenever either ref changes, so React detaches the old
 * refs and attaches the new ones (a swapped or conditional consumer ref works).
 * Callback refs that return a cleanup, a React 19 feature, get it called.
 */
export function useComposedRefs<T>(own: PossibleRef<T>, consumer: PossibleRef<T>): React.RefCallback<T> {
  return React.useMemo(() => composeRefs(own, consumer), [own, consumer])
}
