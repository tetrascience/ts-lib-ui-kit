import * as React from "react"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "./context-menu"

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

let container: HTMLDivElement
let root: ReturnType<typeof createRoot>

beforeEach(() => {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  flushSync(() => root.unmount())
  container.remove()
})

function render(ui: React.ReactElement) {
  flushSync(() => root.render(ui))
  return container
}

// Helper: renders a complete context-menu tree. Content renders via a Portal
// once the menu is open — call openMenu() after render() to open it.
function Menu({ children }: { children?: React.ReactNode }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>Right click</ContextMenuTrigger>
      <ContextMenuContent>{children}</ContextMenuContent>
    </ContextMenu>
  )
}

// Open the context menu by dispatching a contextmenu event on the trigger.
// Wrapped in flushSync so all resulting React state updates are flushed.
function openMenu() {
  const trigger = document.querySelector("[data-slot='context-menu-trigger']") as HTMLElement
  flushSync(() => {
    trigger.dispatchEvent(
      new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 1, clientY: 1 }),
    )
  })
}

// ---------------------------------------------------------------------------
// ContextMenuShortcut
// ---------------------------------------------------------------------------

describe("ContextMenuShortcut", () => {
  it("renders with data-slot attribute", () => {
    render(<ContextMenuShortcut>⌘K</ContextMenuShortcut>)
    const el = document.querySelector("[data-slot='context-menu-shortcut']")
    expect(el).toBeTruthy()
    expect(el!.textContent).toBe("⌘K")
  })

  it("merges custom className", () => {
    render(<ContextMenuShortcut className="extra">⌘X</ContextMenuShortcut>)
    const el = document.querySelector("[data-slot='context-menu-shortcut']")
    expect(el!.className).toContain("extra")
  })
})

// ---------------------------------------------------------------------------
// ContextMenuLabel
// ---------------------------------------------------------------------------

describe("ContextMenuLabel", () => {
  it("renders with data-slot", () => {
    render(<ContextMenuLabel>Section</ContextMenuLabel>)
    expect(document.querySelector("[data-slot='context-menu-label']")).toBeTruthy()
  })

  it("renders with inset prop", () => {
    render(<ContextMenuLabel inset>Inset label</ContextMenuLabel>)
    const el = document.querySelector("[data-slot='context-menu-label']")
    expect(el).toBeTruthy()
    expect(el!.getAttribute("data-inset")).toBeTruthy()
  })

  it("merges custom className", () => {
    render(<ContextMenuLabel className="my-label">L</ContextMenuLabel>)
    const el = document.querySelector("[data-slot='context-menu-label']")
    expect(el!.className).toContain("my-label")
  })
})

// ---------------------------------------------------------------------------
// ContextMenuSeparator
// ---------------------------------------------------------------------------

describe("ContextMenuSeparator", () => {
  it("renders with data-slot", () => {
    render(<ContextMenuSeparator />)
    expect(document.querySelector("[data-slot='context-menu-separator']")).toBeTruthy()
  })

  it("merges custom className", () => {
    render(<ContextMenuSeparator className="sep-cls" />)
    const el = document.querySelector("[data-slot='context-menu-separator']")
    expect(el!.className).toContain("sep-cls")
  })
})

// ---------------------------------------------------------------------------
// ContextMenu + ContextMenuTrigger
// ---------------------------------------------------------------------------

describe("ContextMenu and ContextMenuTrigger", () => {
  it("trigger renders with data-slot", () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click</ContextMenuTrigger>
      </ContextMenu>,
    )
    expect(document.querySelector("[data-slot='context-menu-trigger']")).toBeTruthy()
  })

  it("trigger applies select-none by default", () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click</ContextMenuTrigger>
      </ContextMenu>,
    )
    const el = document.querySelector("[data-slot='context-menu-trigger']")
    expect(el!.className).toContain("select-none")
  })

  it("trigger merges custom className", () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger className="trigger-cls">t</ContextMenuTrigger>
      </ContextMenu>,
    )
    const el = document.querySelector("[data-slot='context-menu-trigger']")
    expect(el!.className).toContain("trigger-cls")
  })
})

// ---------------------------------------------------------------------------
// ContextMenuContent (opened via contextmenu event → portal renders)
// ---------------------------------------------------------------------------

describe("ContextMenuContent", () => {
  it("renders with data-slot when menu is open", () => {
    render(<Menu><ContextMenuItem>Item</ContextMenuItem></Menu>)
    openMenu()
    expect(document.querySelector("[data-slot='context-menu-content']")).toBeTruthy()
  })

  it("renders with custom className on content", () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click</ContextMenuTrigger>
        <ContextMenuContent className="content-cls">
          <ContextMenuItem>Item</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    )
    openMenu()
    const el = document.querySelector("[data-slot='context-menu-content']")
    expect(el!.className).toContain("content-cls")
  })
})

// ---------------------------------------------------------------------------
// ContextMenuGroup
// ---------------------------------------------------------------------------

describe("ContextMenuGroup", () => {
  it("renders with data-slot", () => {
    render(
      <Menu>
        <ContextMenuGroup>
          <ContextMenuItem>Grouped item</ContextMenuItem>
        </ContextMenuGroup>
      </Menu>,
    )
    openMenu()
    expect(document.querySelector("[data-slot='context-menu-group']")).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// ContextMenuItem
// ---------------------------------------------------------------------------

describe("ContextMenuItem", () => {
  it("renders with data-slot", () => {
    render(<Menu><ContextMenuItem>Item</ContextMenuItem></Menu>)
    openMenu()
    expect(document.querySelector("[data-slot='context-menu-item']")).toBeTruthy()
  })

  it("renders with inset prop", () => {
    render(<Menu><ContextMenuItem inset>Inset item</ContextMenuItem></Menu>)
    openMenu()
    const el = document.querySelector("[data-slot='context-menu-item']")
    expect(el!.getAttribute("data-inset")).toBeTruthy()
  })

  it("renders with destructive variant", () => {
    render(<Menu><ContextMenuItem variant="destructive">Delete</ContextMenuItem></Menu>)
    openMenu()
    const el = document.querySelector("[data-slot='context-menu-item']")
    expect(el!.getAttribute("data-variant")).toBe("destructive")
  })

  it("default variant is 'default'", () => {
    render(<Menu><ContextMenuItem>Default</ContextMenuItem></Menu>)
    openMenu()
    const el = document.querySelector("[data-slot='context-menu-item']")
    expect(el!.getAttribute("data-variant")).toBe("default")
  })

  it("merges custom className", () => {
    render(<Menu><ContextMenuItem className="my-item">I</ContextMenuItem></Menu>)
    openMenu()
    const el = document.querySelector("[data-slot='context-menu-item']")
    expect(el!.className).toContain("my-item")
  })
})

// ---------------------------------------------------------------------------
// ContextMenuCheckboxItem
// ---------------------------------------------------------------------------

describe("ContextMenuCheckboxItem", () => {
  it("renders with data-slot", () => {
    render(<Menu><ContextMenuCheckboxItem>Option</ContextMenuCheckboxItem></Menu>)
    openMenu()
    expect(document.querySelector("[data-slot='context-menu-checkbox-item']")).toBeTruthy()
  })

  it("renders checked state", () => {
    render(<Menu><ContextMenuCheckboxItem checked>Checked</ContextMenuCheckboxItem></Menu>)
    openMenu()
    expect(document.querySelector("[data-slot='context-menu-checkbox-item']")).toBeTruthy()
  })

  it("renders with inset prop", () => {
    render(<Menu><ContextMenuCheckboxItem inset>Inset</ContextMenuCheckboxItem></Menu>)
    openMenu()
    const el = document.querySelector("[data-slot='context-menu-checkbox-item']")
    expect(el!.getAttribute("data-inset")).toBeTruthy()
  })

  it("renders children text", () => {
    render(<Menu><ContextMenuCheckboxItem>My Option</ContextMenuCheckboxItem></Menu>)
    openMenu()
    const el = document.querySelector("[data-slot='context-menu-checkbox-item']")
    expect(el!.textContent).toContain("My Option")
  })
})

// ---------------------------------------------------------------------------
// ContextMenuRadioGroup + ContextMenuRadioItem
// ---------------------------------------------------------------------------

describe("ContextMenuRadioGroup and ContextMenuRadioItem", () => {
  it("renders radio group with data-slot", () => {
    render(
      <Menu>
        <ContextMenuRadioGroup value="a">
          <ContextMenuRadioItem value="a">Option A</ContextMenuRadioItem>
          <ContextMenuRadioItem value="b">Option B</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </Menu>,
    )
    openMenu()
    expect(document.querySelector("[data-slot='context-menu-radio-group']")).toBeTruthy()
    expect(document.querySelectorAll("[data-slot='context-menu-radio-item']").length).toBe(2)
  })

  it("radio item renders with inset prop", () => {
    render(
      <Menu>
        <ContextMenuRadioGroup value="a">
          <ContextMenuRadioItem value="a" inset>Inset</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </Menu>,
    )
    openMenu()
    const el = document.querySelector("[data-slot='context-menu-radio-item']")
    expect(el!.getAttribute("data-inset")).toBeTruthy()
  })

  it("radio item renders children text", () => {
    render(
      <Menu>
        <ContextMenuRadioGroup value="x">
          <ContextMenuRadioItem value="x">Radio label</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </Menu>,
    )
    openMenu()
    const el = document.querySelector("[data-slot='context-menu-radio-item']")
    expect(el!.textContent).toContain("Radio label")
  })
})

// ---------------------------------------------------------------------------
// ContextMenuSub + ContextMenuSubTrigger + ContextMenuSubContent
// ---------------------------------------------------------------------------

describe("ContextMenuSub components", () => {
  it("renders sub-trigger with data-slot", () => {
    render(
      <Menu>
        <ContextMenuSub>
          <ContextMenuSubTrigger>More options</ContextMenuSubTrigger>
          <ContextMenuSubContent forceMount>
            <ContextMenuItem>Sub item</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </Menu>,
    )
    openMenu()
    expect(document.querySelector("[data-slot='context-menu-sub-trigger']")).toBeTruthy()
  })

  it("renders sub-content with data-slot when forceMount", () => {
    render(
      <Menu>
        <ContextMenuSub>
          <ContextMenuSubTrigger>More</ContextMenuSubTrigger>
          <ContextMenuSubContent forceMount>
            <ContextMenuItem>Sub</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </Menu>,
    )
    openMenu()
    expect(document.querySelector("[data-slot='context-menu-sub-content']")).toBeTruthy()
  })

  it("sub-trigger includes chevron icon", () => {
    render(
      <Menu>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Sub menu</ContextMenuSubTrigger>
        </ContextMenuSub>
      </Menu>,
    )
    openMenu()
    const trigger = document.querySelector("[data-slot='context-menu-sub-trigger']")
    // The ChevronRightIcon svg should be inside the trigger
    expect(trigger!.querySelector("svg")).toBeTruthy()
  })

  it("sub-trigger renders with inset prop", () => {
    render(
      <Menu>
        <ContextMenuSub>
          <ContextMenuSubTrigger inset>Inset sub</ContextMenuSubTrigger>
        </ContextMenuSub>
      </Menu>,
    )
    openMenu()
    const el = document.querySelector("[data-slot='context-menu-sub-trigger']")
    expect(el!.getAttribute("data-inset")).toBeTruthy()
  })

  it("sub-trigger merges custom className", () => {
    render(
      <Menu>
        <ContextMenuSub>
          <ContextMenuSubTrigger className="my-sub">Sub</ContextMenuSubTrigger>
        </ContextMenuSub>
      </Menu>,
    )
    openMenu()
    const el = document.querySelector("[data-slot='context-menu-sub-trigger']")
    expect(el!.className).toContain("my-sub")
  })

  it("sub-content merges custom className", () => {
    render(
      <Menu>
        <ContextMenuSub>
          <ContextMenuSubTrigger>S</ContextMenuSubTrigger>
          <ContextMenuSubContent forceMount className="sub-content-cls">
            <ContextMenuItem>Item</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </Menu>,
    )
    openMenu()
    const el = document.querySelector("[data-slot='context-menu-sub-content']")
    expect(el!.className).toContain("sub-content-cls")
  })
})

// ---------------------------------------------------------------------------
// ContextMenuPortal
// ---------------------------------------------------------------------------

describe("ContextMenuPortal", () => {
  it("renders children via portal", () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>trigger</ContextMenuTrigger>
        <ContextMenuPortal forceMount>
          <div data-testid="portal-child">portal content</div>
        </ContextMenuPortal>
      </ContextMenu>,
    )
    expect(document.body.querySelector("[data-testid='portal-child']")).toBeTruthy()
  })
})
