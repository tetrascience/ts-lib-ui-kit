import * as React from "react"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// Mock useIsMobile before importing sidebar components so that the hook never
// calls window.matchMedia (not implemented in jsdom).
const mockUseIsMobile = vi.hoisted(() => vi.fn<[], boolean>())

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: mockUseIsMobile,
}))

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "./sidebar"
import { TooltipProvider } from "./tooltip"

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

let container: HTMLDivElement
let root: ReturnType<typeof createRoot>

beforeEach(() => {
  // Default: desktop (non-mobile) environment for all tests
  mockUseIsMobile.mockReturnValue(false)
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

// Minimal wrapper that gives SidebarProvider all required siblings.
// TooltipProvider is included because SidebarMenuButton with tooltip prop uses Tooltip.
function WithSidebar({
  children,
  providerProps,
}: {
  children: React.ReactNode
  providerProps?: Partial<React.ComponentProps<typeof SidebarProvider>>
}) {
  return (
    <TooltipProvider>
      <SidebarProvider {...providerProps}>
        <Sidebar>{children}</Sidebar>
      </SidebarProvider>
    </TooltipProvider>
  )
}

// ---------------------------------------------------------------------------
// useSidebar — error when outside provider
// ---------------------------------------------------------------------------

describe("useSidebar", () => {
  it("throws when used outside a SidebarProvider", () => {
    let caughtError: Error | undefined

    function ThrowingComponent() {
      try {
        useSidebar()
      } catch (e) {
        caughtError = e as Error
      }
      return null
    }

    const c = document.createElement("div")
    const r = createRoot(c)
    flushSync(() => r.render(React.createElement(ThrowingComponent)))
    r.unmount()

    expect(caughtError).toBeDefined()
    expect(caughtError!.message).toContain("useSidebar must be used within a SidebarProvider")
  })
})

// ---------------------------------------------------------------------------
// SidebarProvider — keyboard shortcut toggles state
// ---------------------------------------------------------------------------

describe("SidebarProvider keyboard shortcut", () => {
  it("Ctrl+b toggles the sidebar state", () => {
    render(
      <SidebarProvider defaultOpen>
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>Item</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    )

    const sidebar = document.querySelector("[data-slot='sidebar']")
    expect(sidebar?.getAttribute("data-state")).toBe("expanded")

    // Fire the keyboard shortcut (Ctrl+b)
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "b",
        ctrlKey: true,
        bubbles: true,
      }),
    )
    flushSync(() => {}) // flush any pending state updates

    expect(document.querySelector("[data-slot='sidebar']")?.getAttribute("data-state")).toBe(
      "collapsed",
    )
  })
})

// ---------------------------------------------------------------------------
// Sidebar — collapsible="none" renders a static div
// ---------------------------------------------------------------------------

describe("Sidebar collapsible=none", () => {
  it("renders a plain sidebar div without the gap/container structure", () => {
    render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <span data-testid="content">Static</span>
        </Sidebar>
      </SidebarProvider>,
    )
    // collapsible="none" renders a plain div, not the two-panel desktop structure
    expect(container.querySelector("[data-slot='sidebar']")).toBeTruthy()
    expect(container.querySelector("[data-testid='content']")?.textContent).toBe("Static")
    // No sidebar-gap element in the none mode
    expect(container.querySelector("[data-slot='sidebar-gap']")).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Sidebar — mobile path (isMobile = true)
// ---------------------------------------------------------------------------

describe("Sidebar mobile mode", () => {
  it("renders Sheet component when isMobile is true", () => {
    mockUseIsMobile.mockReturnValue(true)

    render(
      <SidebarProvider>
        <Sidebar>
          <span data-testid="mobile-content">Mobile</span>
        </Sidebar>
        <SidebarTrigger />
      </SidebarProvider>,
    )

    // Click the trigger — in mobile mode this opens the Sheet (sets openMobile=true)
    const trigger = document.querySelector("[data-slot='sidebar-trigger']") as HTMLButtonElement
    flushSync(() => trigger.click())

    // SheetContent renders via portal with data-mobile="true" when open
    const mobileSidebar = document.querySelector("[data-mobile='true']")
    expect(mobileSidebar).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// SidebarTrigger
// ---------------------------------------------------------------------------

describe("SidebarTrigger", () => {
  it("renders with data-slot and toggles sidebar on click", () => {
    render(
      <SidebarProvider defaultOpen>
        <Sidebar collapsible="icon">
          <SidebarContent />
        </Sidebar>
        <SidebarTrigger />
      </SidebarProvider>,
    )

    const trigger = document.querySelector("[data-slot='sidebar-trigger']") as HTMLButtonElement
    expect(trigger).toBeTruthy()

    const sidebar = document.querySelector("[data-slot='sidebar']")
    expect(sidebar?.getAttribute("data-state")).toBe("expanded")

    flushSync(() => trigger.click())
    expect(document.querySelector("[data-slot='sidebar']")?.getAttribute("data-state")).toBe(
      "collapsed",
    )
  })
})

// ---------------------------------------------------------------------------
// SidebarMenuButton — tooltip variants
// ---------------------------------------------------------------------------

describe("SidebarMenuButton tooltip", () => {
  it("renders without tooltip", () => {
    render(
      <WithSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>No tooltip</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </WithSidebar>,
    )
    expect(document.querySelector("[data-slot='sidebar-menu-button']")).toBeTruthy()
  })

  it("renders with string tooltip", () => {
    render(
      <WithSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Click me">Button</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </WithSidebar>,
    )
    expect(document.querySelector("[data-slot='sidebar-menu-button']")).toBeTruthy()
  })

  it("renders with object tooltip", () => {
    render(
      <WithSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={{ children: "Object tooltip" }}>Button</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </WithSidebar>,
    )
    expect(document.querySelector("[data-slot='sidebar-menu-button']")).toBeTruthy()
  })

  it("renders isActive state", () => {
    render(
      <WithSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive>Active</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </WithSidebar>,
    )
    const el = document.querySelector("[data-slot='sidebar-menu-button']")
    expect(el?.getAttribute("data-active")).toBe("true")
  })
})

// ---------------------------------------------------------------------------
// SidebarMenuSkeleton
// ---------------------------------------------------------------------------

describe("SidebarMenuSkeleton", () => {
  it("renders without icon by default", () => {
    render(
      <WithSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuSkeleton />
          </SidebarMenuItem>
        </SidebarMenu>
      </WithSidebar>,
    )
    expect(document.querySelector("[data-slot='sidebar-menu-skeleton']")).toBeTruthy()
    expect(document.querySelector("[data-sidebar='menu-skeleton-icon']")).toBeNull()
  })

  it("renders with icon when showIcon=true", () => {
    render(
      <WithSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuSkeleton showIcon />
          </SidebarMenuItem>
        </SidebarMenu>
      </WithSidebar>,
    )
    expect(document.querySelector("[data-sidebar='menu-skeleton-icon']")).toBeTruthy()
    expect(document.querySelector("[data-sidebar='menu-skeleton-text']")).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// SidebarGroupLabel — asChild variant
// ---------------------------------------------------------------------------

describe("SidebarGroupLabel", () => {
  it("renders as div by default", () => {
    render(
      <WithSidebar>
        <SidebarGroup>
          <SidebarGroupLabel>Section</SidebarGroupLabel>
        </SidebarGroup>
      </WithSidebar>,
    )
    const el = document.querySelector("[data-slot='sidebar-group-label']")
    expect(el?.tagName.toLowerCase()).toBe("div")
  })

  it("renders as child element when asChild=true", () => {
    render(
      <WithSidebar>
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <span>Label as span</span>
          </SidebarGroupLabel>
        </SidebarGroup>
      </WithSidebar>,
    )
    const el = document.querySelector("[data-slot='sidebar-group-label']")
    expect(el?.tagName.toLowerCase()).toBe("span")
  })
})

// ---------------------------------------------------------------------------
// SidebarGroupAction — asChild variant
// ---------------------------------------------------------------------------

describe("SidebarGroupAction", () => {
  it("renders as button by default", () => {
    render(
      <WithSidebar>
        <SidebarGroup>
          <SidebarGroupAction aria-label="Add">+</SidebarGroupAction>
        </SidebarGroup>
      </WithSidebar>,
    )
    const el = document.querySelector("[data-slot='sidebar-group-action']")
    expect(el?.tagName.toLowerCase()).toBe("button")
  })

  it("renders as child element when asChild=true", () => {
    render(
      <WithSidebar>
        <SidebarGroup>
          <SidebarGroupAction asChild>
            <a href="#add">Add</a>
          </SidebarGroupAction>
        </SidebarGroup>
      </WithSidebar>,
    )
    const el = document.querySelector("[data-slot='sidebar-group-action']")
    expect(el?.tagName.toLowerCase()).toBe("a")
  })
})

// ---------------------------------------------------------------------------
// SidebarMenuAction — showOnHover variant
// ---------------------------------------------------------------------------

describe("SidebarMenuAction", () => {
  it("renders with data-slot", () => {
    render(
      <WithSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>Item</SidebarMenuButton>
            <SidebarMenuAction aria-label="Action">•</SidebarMenuAction>
          </SidebarMenuItem>
        </SidebarMenu>
      </WithSidebar>,
    )
    expect(document.querySelector("[data-slot='sidebar-menu-action']")).toBeTruthy()
  })

  it("renders with showOnHover=true", () => {
    render(
      <WithSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>Item</SidebarMenuButton>
            <SidebarMenuAction showOnHover aria-label="Action">
              •
            </SidebarMenuAction>
          </SidebarMenuItem>
        </SidebarMenu>
      </WithSidebar>,
    )
    const el = document.querySelector("[data-slot='sidebar-menu-action']")
    expect(el).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// SidebarMenuBadge
// ---------------------------------------------------------------------------

describe("SidebarMenuBadge", () => {
  it("renders with data-slot and badge text", () => {
    render(
      <WithSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>Item</SidebarMenuButton>
            <SidebarMenuBadge>5</SidebarMenuBadge>
          </SidebarMenuItem>
        </SidebarMenu>
      </WithSidebar>,
    )
    const el = document.querySelector("[data-slot='sidebar-menu-badge']")
    expect(el).toBeTruthy()
    expect(el!.textContent).toBe("5")
  })
})

// ---------------------------------------------------------------------------
// SidebarMenuSub + SidebarMenuSubItem + SidebarMenuSubButton
// ---------------------------------------------------------------------------

describe("SidebarMenu sub-components", () => {
  it("renders sub-menu structure", () => {
    render(
      <WithSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>Parent</SidebarMenuButton>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton>Sub item</SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </SidebarMenuItem>
        </SidebarMenu>
      </WithSidebar>,
    )
    expect(document.querySelector("[data-slot='sidebar-menu-sub']")).toBeTruthy()
    expect(document.querySelector("[data-slot='sidebar-menu-sub-item']")).toBeTruthy()
    expect(document.querySelector("[data-slot='sidebar-menu-sub-button']")).toBeTruthy()
  })

  it("sub-button renders with isActive and size props", () => {
    render(
      <WithSidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>Parent</SidebarMenuButton>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton isActive size="sm">
                  Active small
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </SidebarMenuItem>
        </SidebarMenu>
      </WithSidebar>,
    )
    const el = document.querySelector("[data-slot='sidebar-menu-sub-button']")
    expect(el?.getAttribute("data-active")).toBe("true")
    expect(el?.getAttribute("data-size")).toBe("sm")
  })
})

// ---------------------------------------------------------------------------
// SidebarGroupContent
// ---------------------------------------------------------------------------

describe("SidebarGroupContent", () => {
  it("renders with data-slot", () => {
    render(
      <WithSidebar>
        <SidebarGroup>
          <SidebarGroupContent>
            <span>Content</span>
          </SidebarGroupContent>
        </SidebarGroup>
      </WithSidebar>,
    )
    expect(document.querySelector("[data-slot='sidebar-group-content']")).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// SidebarProvider — controlled open prop
// ---------------------------------------------------------------------------

describe("SidebarProvider controlled mode", () => {
  it("uses controlled open prop", () => {
    const onOpenChange = vi.fn()
    render(
      <SidebarProvider open={false} onOpenChange={onOpenChange}>
        <Sidebar collapsible="icon">
          <SidebarContent />
        </Sidebar>
        <SidebarTrigger />
      </SidebarProvider>,
    )

    const sidebar = document.querySelector("[data-slot='sidebar']")
    expect(sidebar?.getAttribute("data-state")).toBe("collapsed")

    // Click the trigger — should call onOpenChange
    const trigger = document.querySelector("[data-slot='sidebar-trigger']") as HTMLButtonElement
    flushSync(() => trigger.click())
    expect(onOpenChange).toHaveBeenCalled()
  })
})
