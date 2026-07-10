import * as React from "react"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu"

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

// Helper: renders an open dropdown menu so content is always in the DOM.
function Menu({ children }: { children?: React.ReactNode }) {
  return (
    <DropdownMenu open>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent>{children}</DropdownMenuContent>
    </DropdownMenu>
  )
}

// ---------------------------------------------------------------------------
// DropdownMenuShortcut
// ---------------------------------------------------------------------------

describe("DropdownMenuShortcut", () => {
  it("renders with data-slot attribute", () => {
    render(<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>)
    const el = document.querySelector("[data-slot='dropdown-menu-shortcut']")
    expect(el).toBeTruthy()
    expect(el!.textContent).toBe("⌘K")
  })

  it("merges custom className", () => {
    render(<DropdownMenuShortcut className="sc-cls">⌘X</DropdownMenuShortcut>)
    const el = document.querySelector("[data-slot='dropdown-menu-shortcut']")
    expect(el!.className).toContain("sc-cls")
  })
})

// ---------------------------------------------------------------------------
// DropdownMenuLabel
// ---------------------------------------------------------------------------

describe("DropdownMenuLabel", () => {
  it("renders with data-slot", () => {
    render(<DropdownMenuLabel>Section</DropdownMenuLabel>)
    expect(document.querySelector("[data-slot='dropdown-menu-label']")).toBeTruthy()
  })

  it("renders with inset prop", () => {
    render(<DropdownMenuLabel inset>Inset label</DropdownMenuLabel>)
    const el = document.querySelector("[data-slot='dropdown-menu-label']")
    expect(el!.getAttribute("data-inset")).toBeTruthy()
  })

  it("merges custom className", () => {
    render(<DropdownMenuLabel className="lbl-cls">L</DropdownMenuLabel>)
    const el = document.querySelector("[data-slot='dropdown-menu-label']")
    expect(el!.className).toContain("lbl-cls")
  })
})

// ---------------------------------------------------------------------------
// DropdownMenuSeparator
// ---------------------------------------------------------------------------

describe("DropdownMenuSeparator", () => {
  it("renders with data-slot", () => {
    render(<DropdownMenuSeparator />)
    expect(document.querySelector("[data-slot='dropdown-menu-separator']")).toBeTruthy()
  })

  it("merges custom className", () => {
    render(<DropdownMenuSeparator className="sep-cls" />)
    const el = document.querySelector("[data-slot='dropdown-menu-separator']")
    expect(el!.className).toContain("sep-cls")
  })
})

// ---------------------------------------------------------------------------
// DropdownMenu + DropdownMenuTrigger
// ---------------------------------------------------------------------------

describe("DropdownMenu and DropdownMenuTrigger", () => {
  it("trigger renders with data-slot", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      </DropdownMenu>,
    )
    expect(document.querySelector("[data-slot='dropdown-menu-trigger']")).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// DropdownMenuContent (open=true means content is always rendered)
// ---------------------------------------------------------------------------

describe("DropdownMenuContent", () => {
  it("renders with data-slot when menu is open", () => {
    render(<Menu><DropdownMenuItem>Item</DropdownMenuItem></Menu>)
    expect(document.querySelector("[data-slot='dropdown-menu-content']")).toBeTruthy()
  })

  it("renders with custom className", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent className="content-cls">
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    const el = document.querySelector("[data-slot='dropdown-menu-content']")
    expect(el!.className).toContain("content-cls")
  })
})

// ---------------------------------------------------------------------------
// DropdownMenuGroup
// ---------------------------------------------------------------------------

describe("DropdownMenuGroup", () => {
  it("renders with data-slot", () => {
    render(
      <Menu>
        <DropdownMenuGroup>
          <DropdownMenuItem>Grouped item</DropdownMenuItem>
        </DropdownMenuGroup>
      </Menu>,
    )
    expect(document.querySelector("[data-slot='dropdown-menu-group']")).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// DropdownMenuItem
// ---------------------------------------------------------------------------

describe("DropdownMenuItem", () => {
  it("renders with data-slot", () => {
    render(<Menu><DropdownMenuItem>Item</DropdownMenuItem></Menu>)
    expect(document.querySelector("[data-slot='dropdown-menu-item']")).toBeTruthy()
  })

  it("renders with inset prop", () => {
    render(<Menu><DropdownMenuItem inset>Inset item</DropdownMenuItem></Menu>)
    const el = document.querySelector("[data-slot='dropdown-menu-item']")
    expect(el!.getAttribute("data-inset")).toBeTruthy()
  })

  it("renders with destructive variant", () => {
    render(<Menu><DropdownMenuItem variant="destructive">Delete</DropdownMenuItem></Menu>)
    const el = document.querySelector("[data-slot='dropdown-menu-item']")
    expect(el!.getAttribute("data-variant")).toBe("destructive")
  })

  it("default variant is 'default'", () => {
    render(<Menu><DropdownMenuItem>Default</DropdownMenuItem></Menu>)
    const el = document.querySelector("[data-slot='dropdown-menu-item']")
    expect(el!.getAttribute("data-variant")).toBe("default")
  })

  it("merges custom className", () => {
    render(<Menu><DropdownMenuItem className="my-item">I</DropdownMenuItem></Menu>)
    const el = document.querySelector("[data-slot='dropdown-menu-item']")
    expect(el!.className).toContain("my-item")
  })
})

// ---------------------------------------------------------------------------
// DropdownMenuCheckboxItem
// ---------------------------------------------------------------------------

describe("DropdownMenuCheckboxItem", () => {
  it("renders with data-slot", () => {
    render(<Menu><DropdownMenuCheckboxItem>Option</DropdownMenuCheckboxItem></Menu>)
    expect(document.querySelector("[data-slot='dropdown-menu-checkbox-item']")).toBeTruthy()
  })

  it("renders checked state", () => {
    render(<Menu><DropdownMenuCheckboxItem checked>Checked</DropdownMenuCheckboxItem></Menu>)
    expect(document.querySelector("[data-slot='dropdown-menu-checkbox-item']")).toBeTruthy()
  })

  it("renders with inset prop", () => {
    render(<Menu><DropdownMenuCheckboxItem inset>Inset</DropdownMenuCheckboxItem></Menu>)
    const el = document.querySelector("[data-slot='dropdown-menu-checkbox-item']")
    expect(el!.getAttribute("data-inset")).toBeTruthy()
  })

  it("renders children text", () => {
    render(<Menu><DropdownMenuCheckboxItem>My Option</DropdownMenuCheckboxItem></Menu>)
    const el = document.querySelector("[data-slot='dropdown-menu-checkbox-item']")
    expect(el!.textContent).toContain("My Option")
  })
})

// ---------------------------------------------------------------------------
// DropdownMenuRadioGroup + DropdownMenuRadioItem
// ---------------------------------------------------------------------------

describe("DropdownMenuRadioGroup and DropdownMenuRadioItem", () => {
  it("renders radio group with data-slot", () => {
    render(
      <Menu>
        <DropdownMenuRadioGroup value="a">
          <DropdownMenuRadioItem value="a">Option A</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="b">Option B</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </Menu>,
    )
    expect(document.querySelector("[data-slot='dropdown-menu-radio-group']")).toBeTruthy()
    expect(document.querySelectorAll("[data-slot='dropdown-menu-radio-item']").length).toBe(2)
  })

  it("radio item renders with inset prop", () => {
    render(
      <Menu>
        <DropdownMenuRadioGroup value="a">
          <DropdownMenuRadioItem value="a" inset>Inset</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </Menu>,
    )
    const el = document.querySelector("[data-slot='dropdown-menu-radio-item']")
    expect(el!.getAttribute("data-inset")).toBeTruthy()
  })

  it("radio item renders children text", () => {
    render(
      <Menu>
        <DropdownMenuRadioGroup value="x">
          <DropdownMenuRadioItem value="x">Radio label</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </Menu>,
    )
    const el = document.querySelector("[data-slot='dropdown-menu-radio-item']")
    expect(el!.textContent).toContain("Radio label")
  })
})

// ---------------------------------------------------------------------------
// DropdownMenuSub + DropdownMenuSubTrigger + DropdownMenuSubContent
// ---------------------------------------------------------------------------

describe("DropdownMenuSub components", () => {
  it("renders sub-trigger with data-slot", () => {
    render(
      <Menu>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>More options</DropdownMenuSubTrigger>
          <DropdownMenuSubContent forceMount>
            <DropdownMenuItem>Sub item</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </Menu>,
    )
    expect(document.querySelector("[data-slot='dropdown-menu-sub-trigger']")).toBeTruthy()
  })

  it("renders sub-content with data-slot when forceMount", () => {
    render(
      <Menu>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
          <DropdownMenuSubContent forceMount>
            <DropdownMenuItem>Sub</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </Menu>,
    )
    expect(document.querySelector("[data-slot='dropdown-menu-sub-content']")).toBeTruthy()
  })

  it("sub-trigger includes chevron icon", () => {
    render(
      <Menu>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Sub menu</DropdownMenuSubTrigger>
        </DropdownMenuSub>
      </Menu>,
    )
    const trigger = document.querySelector("[data-slot='dropdown-menu-sub-trigger']")
    expect(trigger!.querySelector("svg")).toBeTruthy()
  })

  it("sub-trigger renders with inset prop", () => {
    render(
      <Menu>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger inset>Inset sub</DropdownMenuSubTrigger>
        </DropdownMenuSub>
      </Menu>,
    )
    const el = document.querySelector("[data-slot='dropdown-menu-sub-trigger']")
    expect(el!.getAttribute("data-inset")).toBeTruthy()
  })

  it("sub-trigger merges custom className", () => {
    render(
      <Menu>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="my-sub">Sub</DropdownMenuSubTrigger>
        </DropdownMenuSub>
      </Menu>,
    )
    const el = document.querySelector("[data-slot='dropdown-menu-sub-trigger']")
    expect(el!.className).toContain("my-sub")
  })

  it("sub-content merges custom className", () => {
    render(
      <Menu>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>S</DropdownMenuSubTrigger>
          <DropdownMenuSubContent forceMount className="sub-content-cls">
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </Menu>,
    )
    const el = document.querySelector("[data-slot='dropdown-menu-sub-content']")
    expect(el!.className).toContain("sub-content-cls")
  })
})

// ---------------------------------------------------------------------------
// DropdownMenuPortal
// ---------------------------------------------------------------------------

describe("DropdownMenuPortal", () => {
  it("renders children via portal into document.body", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuItem>Portal item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>,
    )
    // When open, portal content is rendered into document.body
    expect(document.body.querySelector("[data-slot='dropdown-menu-content']")).toBeTruthy()
  })
})
