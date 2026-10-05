import * as React from "react"
import { act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { inertProp, isElementOfType, withRef } from "../react18-compat"

;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true

const FORWARD_REF = Symbol.for("react.forward_ref")
const REACT_MAJOR = Number.parseInt(React.version, 10)
const REACT_19 = 19

let container: HTMLDivElement
let root: ReturnType<typeof createRoot>

beforeEach(() => {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

const Box = withRef("Box", function Box({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-testid="box" className={className} {...props} />
})

describe("withRef", () => {
  it("returns a forwardRef component carrying the given display name", () => {
    const component = Box as unknown as { $$typeof: symbol; displayName?: string }
    expect(component.$$typeof).toBe(FORWARD_REF)
    expect(component.displayName).toBe("Box")
  })

  it("attaches an object ref to the rendered element", () => {
    const ref = React.createRef<HTMLDivElement>()
    act(() => root.render(<Box ref={ref} className="c" />))
    expect(ref.current).toBe(container.querySelector('[data-testid="box"]'))
    expect(ref.current?.className).toBe("c")
  })

  it("attaches a callback ref and detaches it on unmount", () => {
    const calls: Array<HTMLDivElement | null> = []
    act(() => root.render(<Box ref={(el) => void calls.push(el)} />))
    expect(calls).toHaveLength(1)
    expect(calls[0]).toBeInstanceOf(HTMLDivElement)
    act(() => root.render(<span />))
    expect(calls.at(-1)).toBeNull()
  })

  it("leaves ref out of props when none is passed", () => {
    const seen: Array<Record<string, unknown>> = []
    const Probe = withRef("Probe", function Probe(props: React.ComponentProps<"div">) {
      seen.push({ ...props })
      return <div {...props} />
    })
    act(() => root.render(<Probe id="p" />))
    expect(seen.at(-1)).toEqual({ id: "p" })
  })

  it("delivers ref as a prop so a body can read it directly", () => {
    const Handle = withRef("Handle", function Handle({ ref }: { ref?: React.Ref<{ ping: () => string }> }) {
      React.useImperativeHandle(ref, () => ({ ping: () => "pong" }))
      return null
    })
    const ref = React.createRef<{ ping: () => string }>()
    act(() => root.render(<Handle ref={ref} />))
    expect(ref.current?.ping()).toBe("pong")
  })

  it("preserves a generic render function's type parameters", () => {
    const List = withRef("List", function List<T>({ items, render }: { items: T[]; render: (item: T) => string }) {
      return <ul>{items.map((item) => <li key={render(item)}>{render(item)}</li>)}</ul>
    })
    act(() => root.render(<List items={[1, 2]} render={(n) => `n${n.toFixed(0)}`} />))
    expect(container.textContent).toBe("n1n2")
  })

  it("names the React 19 component it wraps, unless it already has a name", () => {
    function Unnamed(props: React.ComponentProps<"div">) {
      return <div {...props} />
    }
    withRef("Unnamed", Unnamed)
    expect((Unnamed as { displayName?: string }).displayName).toBe("Unnamed")

    const Named = Object.assign((props: React.ComponentProps<"div">) => <div {...props} />, { displayName: "Kept" })
    withRef("Named", Named)
    expect(Named.displayName).toBe("Kept")
  })

  it("exposes the React 19 component's docgen info on the export, even when attached later", () => {
    function Documented(props: React.ComponentProps<"div">) {
      return <div {...props} />
    }
    const DocumentedWithRef = withRef("Documented", Documented) as unknown as { __docgenInfo?: unknown }
    expect(DocumentedWithRef.__docgenInfo).toBeUndefined()
    // Storybook's react-docgen plugin appends this assignment at the end of the module.
    const info = { displayName: "Documented", description: "Docs", props: {} }
    Object.assign(Documented, { __docgenInfo: info })
    expect(DocumentedWithRef.__docgenInfo).toBe(info)
  })

  it("forwards refs through memo", () => {
    const Memo = React.memo(Box)
    const ref = React.createRef<HTMLDivElement>()
    act(() => root.render(<Memo ref={ref} />))
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

describe("isElementOfType", () => {
  function Plain(props: React.ComponentProps<"hr">) {
    return <hr {...props} />
  }
  const PlainWithRef = withRef("Plain", Plain)
  function Other(props: React.ComponentProps<"hr">) {
    return <hr {...props} />
  }

  it("matches the plain component and its wrapper, and nothing else", () => {
    expect(isElementOfType(<Plain />, Plain)).toBe(true)
    expect(isElementOfType(<PlainWithRef />, Plain)).toBe(true)
    expect(isElementOfType(<Other />, Plain)).toBe(false)
    expect(isElementOfType(<hr />, Plain)).toBe(false)
    expect(isElementOfType(<React.Fragment />, Plain)).toBe(false)
  })
})

describe("inertProp", () => {
  it.runIf(REACT_MAJOR >= REACT_19)("passes the boolean through on React 19", () => {
    expect(inertProp(true)).toEqual({ inert: true })
    expect(inertProp(false)).toEqual({ inert: false })
    expect(inertProp()).toEqual({ inert: undefined })
  })

  it("applies the attribute in the DOM on the running React version", () => {
    act(() => root.render(<nav {...inertProp(true)} />))
    expect(container.querySelector("nav")?.hasAttribute("inert")).toBe(true)
    act(() => root.render(<nav {...inertProp(false)} />))
    expect(container.querySelector("nav")?.hasAttribute("inert")).toBe(false)
  })

  describe("on React 18", () => {
    afterEach(() => {
      vi.doUnmock("react")
      vi.resetModules()
    })

    it("uses an empty string for present and omits the attribute for absent", async () => {
      vi.resetModules()
      vi.doMock("react", async (importOriginal) => ({ ...(await importOriginal<typeof import("react")>()), version: "18.3.1" }))
      const compat = await import("../react18-compat")
      expect(compat.inertProp(true)).toEqual({ inert: "" })
      expect(compat.inertProp(false)).toEqual({ inert: undefined })
      expect(compat.inertProp()).toEqual({ inert: undefined })
    })
  })
})
