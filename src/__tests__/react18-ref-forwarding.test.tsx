import * as React from "react"
import { act } from "react"
import { createRoot } from "react-dom/client"
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"

import * as kit from "@/index"

/*
 * UXT-77 runtime guard. `scripts/build/audit-react18-compat.ts` proves statically
 * that every component accepting `ref` goes through `withRef`; this proves the
 * ref actually lands on a DOM node at runtime. CI runs it on React 19 and on
 * React 18, where a plain function component drops `ref` without a trace.
 *
 * The sweep renders every `withRef` export from the public index on its own,
 * with no props. Compound parts that need a parent (DialogContent, SelectItem)
 * throw or render nothing in isolation; those are skipped, not failed, and the
 * Radix `asChild` triggers they belong to are covered explicitly below.
 */

;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true

const FORWARD_REF = Symbol.for("react.forward_ref")
const MEMO = Symbol.for("react.memo")
const MIN_SWEPT = 100

/**
 * Props for components whose ref targets an element that only renders in some state.
 * Without them the sweep would see the closed state, where there is nothing to attach to.
 */
const RENDER_PROPS: Record<string, Record<string, unknown>> = {
  DataAppShellRightPanel: { id: "ref-sweep", open: true, persist: false },
  // Renders nothing until a tool call asks for approval.
  Confirmation: { approval: { id: "ref-sweep" }, state: "approval-requested" },
}

type ExoticLike = { $$typeof?: symbol; displayName?: string; type?: ExoticLike }

function isWithRefComponent(value: unknown): value is React.ComponentType<{ ref?: React.Ref<Element> }> {
  if (!value || (typeof value !== "object" && typeof value !== "function")) return false
  const exotic = value as ExoticLike
  const inner = exotic.$$typeof === MEMO ? exotic.type : exotic
  return inner?.$$typeof === FORWARD_REF && typeof inner.displayName === "string"
}

class Boundary extends React.Component<{ children: React.ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

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
  document.body.innerHTML = ""
})

/** React's "Function components cannot be given refs" warning, on React 18. */
function captureRefWarnings() {
  const warnings: string[] = []
  const spy = vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    const message = args.map(String).join(" ")
    if (/cannot be given refs|Function components cannot/i.test(message)) warnings.push(message)
  })
  return { warnings, restore: () => spy.mockRestore() }
}

describe("every withRef export forwards its ref to a DOM node", () => {
  const exports = Object.entries(kit).filter(([, value]) => isWithRefComponent(value)) as Array<
    [string, React.ComponentType<{ ref?: React.Ref<Element> }>]
  >
  // Rendering a part without its parent throws by design; keep that noise out of the log
  // and out of jsdom's uncaught-error reporting.
  const swallow = (event: ErrorEvent) => event.preventDefault()
  let silence: ReturnType<typeof vi.spyOn> | undefined
  beforeAll(() => {
    window.addEventListener("error", swallow)
  })
  afterAll(() => {
    window.removeEventListener("error", swallow)
  })

  it("sees the public component surface", () => {
    expect(exports.length).toBeGreaterThan(300)
  })

  const swept: string[] = []
  const broken: string[] = []

  it.each(exports)("%s", (name, Component) => {
    silence = vi.spyOn(console, "error").mockImplementation(() => {})
    let threw = false
    const ref = React.createRef<Element>()
    try {
      act(() =>
        root.render(
          <Boundary onError={() => (threw = true)}>
            <Component ref={ref} {...RENDER_PROPS[name]} />
          </Boundary>,
        ),
      )
    } catch {
      threw = true
    } finally {
      silence.mockRestore()
    }
    // Rendered nothing, or needs a parent it does not have: not checkable in isolation.
    if (threw || document.body.querySelectorAll("*").length <= 1) return
    swept.push(name)
    if (!(ref.current instanceof Element)) broken.push(name)
    expect(ref.current, `${name} rendered DOM but its ref is ${String(ref.current)}`).toBeInstanceOf(Element)
  })

  it("checked a meaningful share of components in isolation", () => {
    expect(broken).toEqual([])
    expect(swept.length).toBeGreaterThan(MIN_SWEPT)
  })
})

describe("Radix asChild triggers compose a kit Button's ref", () => {
  const {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } = kit

  const cases: Array<[string, (ref: React.Ref<HTMLButtonElement>) => React.ReactElement]> = [
    [
      "TooltipTrigger",
      (ref) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button ref={ref}>Open</Button>
            </TooltipTrigger>
            <TooltipContent>Tip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    ],
    [
      "PopoverTrigger",
      (ref) => (
        <Popover>
          <PopoverTrigger asChild>
            <Button ref={ref}>Open</Button>
          </PopoverTrigger>
          <PopoverContent>Body</PopoverContent>
        </Popover>
      ),
    ],
    [
      "DropdownMenuTrigger",
      (ref) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button ref={ref}>Open</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    ],
    [
      "HoverCardTrigger",
      (ref) => (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button ref={ref}>Open</Button>
          </HoverCardTrigger>
          <HoverCardContent>Card</HoverCardContent>
        </HoverCard>
      ),
    ],
    [
      "DialogTrigger",
      (ref) => (
        <Dialog>
          <DialogTrigger asChild>
            <Button ref={ref}>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      ),
    ],
  ]

  it.each(cases)("%s asChild keeps the consumer's ref and raises no ref warning", (_name, render) => {
    const { warnings, restore } = captureRefWarnings()
    const ref = React.createRef<HTMLButtonElement>()
    try {
      act(() => root.render(render(ref)))
    } finally {
      restore()
    }
    expect(warnings).toEqual([])
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    expect(ref.current?.textContent).toBe("Open")
  })

  it("DropdownMenuTrigger asChild opens its menu from the keyboard", () => {
    const ref = React.createRef<HTMLButtonElement>()
    const [, render] = cases.find(([name]) => name === "DropdownMenuTrigger")!
    act(() => root.render(render(ref)))
    act(() => {
      ref.current?.focus()
      ref.current?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
    })
    expect(ref.current?.getAttribute("aria-expanded")).toBe("true")
    expect(document.querySelector('[role="menu"]')).not.toBeNull()
  })
})
