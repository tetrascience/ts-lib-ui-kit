import { BellIcon, FolderIcon, HomeIcon, InboxIcon, PlusIcon, SettingsIcon, StarIcon, UsersIcon } from "lucide-react";
import React from "react";
import { expect, userEvent, within } from "storybook/test";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarInput,
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
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "./sidebar";

import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * SW-2304: the Sidebar's Storybook surface is deliberately three stories —
 * `Default`, `WithSubMenu`, `MultipleGroups`. Everything else the component can
 * do is an orthogonal prop axis or a composition toggle, so it lives on the
 * `Default` playground's controls panel instead of as a standalone story:
 *
 *   Enum axes        `variant` (sidebar · floating · inset), `side` (left · right),
 *                    `collapsible` (offcanvas · icon · none), menu-button
 *                    `variant` (default · outline) and `size` (sm · default · lg)
 *   Composition      open/collapsed start state, rail, badges + actions, footer,
 *                    skeleton loading group
 *
 * The only Sidebar behaviour that is *not* a point in that control space is the
 * controlled form (`open` / `onOpenChange` on `SidebarProvider`); it is called
 * out in the docs description and exercised by the hidden `ControlledSidebar`.
 *
 * The remaining stories at the bottom of this file are tagged `!dev` /
 * `!autodocs`: hidden from the sidebar and the docs page, but still run by
 * `yarn test:storybook` and still mapped to their Zephyr test cases.
 */
type SidebarStoryArgs = React.ComponentProps<typeof Sidebar> & {
  /** Starting open state of the `SidebarProvider` (uncontrolled). */
  defaultOpen?: boolean;
  /** `SidebarMenuButton` `variant` applied to every menu button. */
  menuButtonVariant?: "default" | "outline";
  /** `SidebarMenuButton` `size` applied to every menu button. */
  menuButtonSize?: "default" | "sm" | "lg";
  /** Render a `SidebarRail` (click-to-toggle edge strip). */
  showRail?: boolean;
  /** Render `SidebarMenuBadge` / `SidebarMenuAction` on menu items. */
  showBadges?: boolean;
  /** Render the `SidebarFooter` block. */
  showFooter?: boolean;
  /** Render a second group whose items are still loading (`SidebarMenuSkeleton`). */
  showSkeleton?: boolean;
};

const PLAYGROUND_ARG_KEYS = [
  "defaultOpen",
  "menuButtonVariant",
  "menuButtonSize",
  "showRail",
  "showBadges",
  "showFooter",
  "showSkeleton",
] as const satisfies ReadonlyArray<keyof SidebarStoryArgs>;

/**
 * Strip the playground-only controls so only real `Sidebar` props reach the DOM.
 * A destructure (rather than a `delete` loop) lets the return type prove it.
 */
function toSidebarProps(args: SidebarStoryArgs): React.ComponentProps<typeof Sidebar> {
  const {
    defaultOpen: _defaultOpen,
    menuButtonVariant: _menuButtonVariant,
    menuButtonSize: _menuButtonSize,
    showRail: _showRail,
    showBadges: _showBadges,
    showFooter: _showFooter,
    showSkeleton: _showSkeleton,
    ...sidebarProps
  } = args;
  return sidebarProps;
}

const meta: Meta<SidebarStoryArgs> = {
  title: "Components/Navigation & Menus/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Composable app-level navigation sidebar. Use the **Default** playground's controls to explore the " +
          "prop axes (`variant`, `side`, `collapsible`, menu-button `variant`/`size`) and composition toggles " +
          "(start state, rail, badges & actions, footer, skeleton loading group). **With Sub Menu** and " +
          "**Multiple Groups** show the two content-composition patterns that can't be expressed as a prop.\n\n" +
          "The playground is uncontrolled (`defaultOpen`). For a controlled sidebar pass `open` and " +
          "`onOpenChange` to `SidebarProvider` instead — the contract is the same as any controlled input.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    side: {
      control: { type: "select" },
      options: ["left", "right"],
      table: { category: "Sidebar" },
    },
    variant: {
      control: { type: "select" },
      options: ["sidebar", "floating", "inset"],
      table: { category: "Sidebar" },
    },
    collapsible: {
      control: { type: "select" },
      options: ["offcanvas", "icon", "none"],
      table: { category: "Sidebar" },
    },
    defaultOpen: {
      control: { type: "boolean" },
      table: { category: "Playground" },
    },
    menuButtonVariant: {
      control: { type: "select" },
      options: ["default", "outline"],
      table: { category: "Playground" },
    },
    menuButtonSize: {
      control: { type: "select" },
      options: ["sm", "default", "lg"],
      table: { category: "Playground" },
    },
    showRail: {
      control: { type: "boolean" },
      table: { category: "Playground" },
    },
    showBadges: {
      control: { type: "boolean" },
      table: { category: "Playground" },
    },
    showFooter: {
      control: { type: "boolean" },
      table: { category: "Playground" },
    },
    showSkeleton: {
      control: { type: "boolean" },
      table: { category: "Playground" },
    },
  },
  args: {
    side: "left",
    variant: "sidebar",
    collapsible: "offcanvas",
    defaultOpen: true,
    menuButtonVariant: "default",
    menuButtonSize: "default",
    showRail: false,
    showBadges: false,
    showFooter: true,
    showSkeleton: false,
  },
};

export default meta;

type Story = StoryObj<SidebarStoryArgs>;

function renderSidebar(args: SidebarStoryArgs) {
  // Defaults live in `meta.args` (merged into every story) — don't re-declare them here.
  const { defaultOpen, menuButtonVariant, menuButtonSize, showRail, showBadges, showFooter, showSkeleton } = args;
  const sidebarProps = toSidebarProps(args);

  return (
    <div className="min-h-[520px] bg-muted/30">
      {/* `key` remounts the provider when the uncontrolled start state changes via controls. */}
      <SidebarProvider key={String(defaultOpen)} defaultOpen={defaultOpen}>
        <Sidebar {...sidebarProps}>
          <SidebarHeader>
            <SidebarInput placeholder="Search navigation" />
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarGroupAction aria-label="Add workspace section">
                <PlusIcon />
              </SidebarGroupAction>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive size={menuButtonSize} tooltip="Overview" variant={menuButtonVariant}>
                      <HomeIcon />
                      <span>Overview</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton size={menuButtonSize} tooltip="Projects" variant={menuButtonVariant}>
                      <FolderIcon />
                      <span>Projects</span>
                    </SidebarMenuButton>
                    {showBadges && <SidebarMenuBadge>12</SidebarMenuBadge>}
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton size={menuButtonSize} tooltip="Team" variant={menuButtonVariant}>
                      <UsersIcon />
                      <span>Team</span>
                    </SidebarMenuButton>
                    {showBadges && (
                      <>
                        <SidebarMenuBadge>3</SidebarMenuBadge>
                        <SidebarMenuAction showOnHover aria-label="Invite teammate">
                          <PlusIcon />
                        </SidebarMenuAction>
                      </>
                    )}
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            {showSkeleton && (
              <SidebarGroup>
                <SidebarGroupLabel>Recent</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuSkeleton showIcon />
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuSkeleton showIcon />
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuSkeleton />
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>
          {showFooter && (
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size={menuButtonSize} variant={menuButtonVariant}>
                    <SettingsIcon />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          )}
          {showRail && <SidebarRail />}
        </Sidebar>
        <SidebarInset>
          <div className="flex items-center gap-2 border-b p-4">
            <SidebarTrigger />
            <div>
              <div className="font-medium">Dashboard</div>
              <div className="text-sm text-muted-foreground">Example layout using the sidebar primitives.</div>
            </div>
          </div>
          <div className="grid gap-4 p-4 md:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="rounded-xl border bg-background p-4 text-sm">
                Content panel {index + 1}
              </div>
            ))}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

const playSidebar: Story["play"] = async ({ args, canvasElement, step }) => {
  const canvas = within(canvasElement);

  await step("Layout renders", async () => {
    expect(canvas.getByText("Dashboard")).toBeInTheDocument();
    expect(canvas.getByRole("button", { name: /toggle sidebar/i })).toBeInTheDocument();
  });

  await step("Sidebar navigation", async () => {
    expect(canvas.getByPlaceholderText("Search navigation")).toBeInTheDocument();
    expect(canvas.getByText("Workspace")).toBeInTheDocument();
    expect(canvas.getByText("Overview")).toBeInTheDocument();
    expect(canvas.getByText("Projects")).toBeInTheDocument();
  });

  await step("Footer follows the showFooter control", async () => {
    if (args.showFooter) {
      expect(canvas.getByText("Settings")).toBeInTheDocument();
    } else {
      expect(canvas.queryByText("Settings")).not.toBeInTheDocument();
    }
  });
};

/**
 * The playground. Every enum axis and composition toggle is a control here —
 * see the file header for the mapping from the hidden stories to these args.
 */
export const Default: Story = {
  render: renderSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T1288" },
  },
  play: playSidebar,
};

/* ---------------------------------------------------- hidden (test-only) stories
 *
 * SW-2304: each of these is a single point in the Default playground's control
 * space (or a collapse-driver variant of the same layout). `!dev` keeps them out
 * of the Storybook sidebar and `!autodocs` out of the docs page, while the
 * implicit `test` tag keeps them in `yarn test:storybook` and their Zephyr IDs
 * intact. Do NOT delete them — CI coverage depends on them.
 * ---------------------------------------------------------------------------- */

export const Floating: Story = {
  tags: ["!dev", "!autodocs"],
  args: {
    variant: "floating",
  },
  render: renderSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T1289" },
  },
  play: playSidebar,
};

export const Inset: Story = {
  tags: ["!dev", "!autodocs"],
  args: {
    variant: "inset",
  },
  render: renderSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T1290" },
  },
  play: playSidebar,
};

export const RightSide: Story = {
  tags: ["!dev", "!autodocs"],
  args: {
    side: "right",
  },
  render: renderSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T1291" },
  },
  play: playSidebar,
};

export const CollapsedIcon: Story = {
  tags: ["!dev", "!autodocs"],
  args: {
    collapsible: "icon",
    defaultOpen: false,
  },
  render: renderSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T1292" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Layout renders", async () => {
      expect(canvas.getByText("Dashboard")).toBeInTheDocument();
      expect(canvas.getByRole("button", { name: /toggle sidebar/i })).toBeInTheDocument();
    });

    await step("Collapsed sidebar shell", async () => {
      expect(canvasElement.querySelector('[data-sidebar="sidebar"]')).toBeTruthy();
      expect(canvas.getByPlaceholderText("Search navigation")).toBeInTheDocument();
    });
  },
};

export const NonCollapsible: Story = {
  tags: ["!dev", "!autodocs"],
  args: {
    collapsible: "none",
  },
  render: renderSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T1293" },
  },
  play: playSidebar,
};

export const OutlineMenuButtons: Story = {
  tags: ["!dev", "!autodocs"],
  args: {
    menuButtonVariant: "outline",
  },
  render: renderSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T1294" },
  },
  play: playSidebar,
};

export const LargeMenuButtons: Story = {
  tags: ["!dev", "!autodocs"],
  args: {
    menuButtonSize: "lg",
  },
  render: renderSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T1295" },
  },
  play: playSidebar,
};

export const ToggleSidebar: Story = {
  tags: ["!dev", "!autodocs"],
  args: {
    collapsible: "icon",
  },
  render: renderSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T4724" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Sidebar starts expanded", async () => {
      const sidebarSlot = canvasElement.querySelector('[data-slot="sidebar"]');
      expect(sidebarSlot).toBeTruthy();
      expect(sidebarSlot?.getAttribute("data-state")).toBe("expanded");
    });

    await step("Click trigger collapses sidebar", async () => {
      const trigger = canvas.getByRole("button", { name: /toggle sidebar/i });
      await userEvent.click(trigger);
      const sidebarSlot = canvasElement.querySelector('[data-slot="sidebar"]');
      expect(sidebarSlot?.getAttribute("data-state")).toBe("collapsed");
    });

    await step("Click trigger again expands sidebar", async () => {
      const trigger = canvas.getByRole("button", { name: /toggle sidebar/i });
      await userEvent.click(trigger);
      const sidebarSlot = canvasElement.querySelector('[data-slot="sidebar"]');
      expect(sidebarSlot?.getAttribute("data-state")).toBe("expanded");
    });
  },
};

function renderRailSidebar(args: SidebarStoryArgs) {
  const sidebarProps = toSidebarProps(args);
  return (
    <div className="min-h-[520px] bg-muted/30">
      <SidebarProvider defaultOpen>
        <Sidebar {...sidebarProps} collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive tooltip="Home">
                      <HomeIcon />
                      <span>Home</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Inbox">
                      <InboxIcon />
                      <span>Inbox</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <div className="flex items-center gap-2 border-b p-4">
            <SidebarTrigger />
            <span className="font-medium">Rail Example</span>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export const WithRail: Story = {
  tags: ["!dev", "!autodocs"],
  render: renderRailSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T4725" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Rail element renders", async () => {
      const rail = canvasElement.querySelector('[data-sidebar="rail"]');
      expect(rail).toBeTruthy();
      expect(rail?.getAttribute("aria-label")).toBe("Toggle Sidebar");
    });

    await step("Sidebar content renders with rail", async () => {
      expect(canvas.getByText("Home")).toBeInTheDocument();
      expect(canvas.getByText("Inbox")).toBeInTheDocument();
    });

    await step("Rail click collapses sidebar", async () => {
      const rail = canvasElement.querySelector('[data-sidebar="rail"]') as HTMLElement;
      await userEvent.click(rail);
      const sidebarSlot = canvasElement.querySelector('[data-slot="sidebar"]');
      expect(sidebarSlot?.getAttribute("data-state")).toBe("collapsed");
    });

    await step("Rail click expands sidebar again", async () => {
      const rail = canvasElement.querySelector('[data-sidebar="rail"]') as HTMLElement;
      await userEvent.click(rail);
      const sidebarSlot = canvasElement.querySelector('[data-slot="sidebar"]');
      expect(sidebarSlot?.getAttribute("data-state")).toBe("expanded");
    });
  },
};

function renderSubMenuSidebar(args: SidebarStoryArgs) {
  const sidebarProps = toSidebarProps(args);
  return (
    <div className="min-h-[520px] bg-muted/30">
      <SidebarProvider defaultOpen>
        <Sidebar {...sidebarProps}>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Platform</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>
                      <FolderIcon />
                      <span>Projects</span>
                    </SidebarMenuButton>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton isActive>
                          <span>Alpha</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton>
                          <span>Beta</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton size="sm">
                          <span>Gamma (small)</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <SettingsIcon />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="p-4 font-medium">Sub Menu Example</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export const WithSubMenu: Story = {
  render: renderSubMenuSidebar,
  parameters: {
    // Only the real Sidebar props pass through here; hide the inert playground toggles.
    controls: { exclude: [...PLAYGROUND_ARG_KEYS] },
    zephyr: { testCaseId: "SW-T4726" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Parent menu items render", async () => {
      expect(canvas.getByText("Projects")).toBeInTheDocument();
      expect(canvas.getByText("Settings")).toBeInTheDocument();
    });

    await step("Sub-menu items render", async () => {
      expect(canvas.getByText("Alpha")).toBeInTheDocument();
      expect(canvas.getByText("Beta")).toBeInTheDocument();
      expect(canvas.getByText("Gamma (small)")).toBeInTheDocument();
    });

    await step("Sub-menu structure uses correct slots", async () => {
      const subMenu = canvasElement.querySelector('[data-slot="sidebar-menu-sub"]');
      expect(subMenu).toBeTruthy();
      const subItems = canvasElement.querySelectorAll('[data-slot="sidebar-menu-sub-item"]');
      expect(subItems.length).toBe(3);
    });

    await step("Active sub-item has data-active attribute", async () => {
      const activeSubButton = canvasElement.querySelector('[data-slot="sidebar-menu-sub-button"][data-active="true"]');
      expect(activeSubButton).toBeTruthy();
    });
  },
};

function renderBadgesAndActionsSidebar(args: SidebarStoryArgs) {
  const sidebarProps = toSidebarProps(args);
  return (
    <div className="min-h-[520px] bg-muted/30">
      <SidebarProvider defaultOpen>
        <Sidebar {...sidebarProps}>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Inbox</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <InboxIcon />
                      <span>Messages</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>12</SidebarMenuBadge>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <BellIcon />
                      <span>Notifications</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>3</SidebarMenuBadge>
                    <SidebarMenuAction aria-label="Mark all read">
                      <StarIcon />
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="p-4 font-medium">Badges & Actions Example</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export const WithBadgesAndActions: Story = {
  tags: ["!dev", "!autodocs"],
  render: renderBadgesAndActionsSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T4727" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Badge counts render", async () => {
      expect(canvas.getByText("12")).toBeInTheDocument();
      expect(canvas.getByText("3")).toBeInTheDocument();
    });

    await step("Badge uses correct data slot", async () => {
      const badges = canvasElement.querySelectorAll('[data-slot="sidebar-menu-badge"]');
      expect(badges.length).toBe(2);
    });

    await step("Menu action renders", async () => {
      const action = canvas.getByRole("button", { name: "Mark all read" });
      expect(action).toBeInTheDocument();
    });

    await step("Menu action has correct data slot", async () => {
      const actions = canvasElement.querySelectorAll('[data-slot="sidebar-menu-action"]');
      expect(actions.length).toBe(1);
    });
  },
};

function renderSkeletonSidebar(args: SidebarStoryArgs) {
  const sidebarProps = toSidebarProps(args);
  return (
    <div className="min-h-[520px] bg-muted/30">
      <SidebarProvider defaultOpen>
        <Sidebar {...sidebarProps}>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Loading…</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSkeleton />
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="p-4 font-medium">Skeleton Example</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export const SkeletonLoading: Story = {
  tags: ["!dev", "!autodocs"],
  render: renderSkeletonSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T4728" },
  },
  play: async ({ canvasElement, step }) => {
    await step("Skeleton items render", async () => {
      const skeletons = canvasElement.querySelectorAll('[data-slot="sidebar-menu-skeleton"]');
      expect(skeletons.length).toBe(3);
    });

    await step("Icon skeletons render for showIcon items", async () => {
      const iconSkeletons = canvasElement.querySelectorAll('[data-sidebar="menu-skeleton-icon"]');
      expect(iconSkeletons.length).toBe(2);
    });

    await step("Text skeletons render for all items", async () => {
      const textSkeletons = canvasElement.querySelectorAll('[data-sidebar="menu-skeleton-text"]');
      expect(textSkeletons.length).toBe(3);
    });
  },
};

function renderMultiGroupSidebar(args: SidebarStoryArgs) {
  const sidebarProps = toSidebarProps(args);
  return (
    <div className="min-h-[520px] bg-muted/30">
      <SidebarProvider defaultOpen>
        <Sidebar {...sidebarProps}>
          <SidebarHeader>
            <SidebarInput placeholder="Quick search…" />
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>
                      <HomeIcon />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Resources</SidebarGroupLabel>
              <SidebarGroupAction aria-label="Add resource">
                <PlusIcon />
              </SidebarGroupAction>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <FolderIcon />
                      <span>Files</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarSeparator />
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <SettingsIcon />
                  <span>Preferences</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="flex items-center gap-2 border-b p-4">
            <SidebarTrigger />
            <span className="font-medium">Multi-Group Layout</span>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export const MultipleGroups: Story = {
  render: renderMultiGroupSidebar,
  parameters: {
    // Only the real Sidebar props pass through here; hide the inert playground toggles.
    controls: { exclude: [...PLAYGROUND_ARG_KEYS] },
    zephyr: { testCaseId: "SW-T4729" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Header with search input renders", async () => {
      expect(canvas.getByPlaceholderText("Quick search…")).toBeInTheDocument();
      const header = canvasElement.querySelector('[data-sidebar="header"]');
      expect(header).toBeTruthy();
    });

    await step("Multiple groups render", async () => {
      const groups = canvasElement.querySelectorAll('[data-sidebar="group"]');
      expect(groups.length).toBe(2);
      expect(canvas.getByText("Main")).toBeInTheDocument();
      expect(canvas.getByText("Resources")).toBeInTheDocument();
    });

    await step("Group action button renders", async () => {
      const addButton = canvas.getByRole("button", { name: "Add resource" });
      expect(addButton).toBeInTheDocument();
    });

    await step("Separators render between sections", async () => {
      const separators = canvasElement.querySelectorAll('[data-slot="sidebar-separator"]');
      expect(separators.length).toBeGreaterThanOrEqual(2);
    });

    await step("Footer renders", async () => {
      const footer = canvasElement.querySelector('[data-sidebar="footer"]');
      expect(footer).toBeTruthy();
      expect(canvas.getByText("Preferences")).toBeInTheDocument();
    });

    await step("Active item has data-active attribute", async () => {
      const activeButton = canvasElement.querySelector('[data-slot="sidebar-menu-button"][data-active="true"]');
      expect(activeButton).toBeTruthy();
    });
  },
};

export const SmallMenuButtons: Story = {
  tags: ["!dev", "!autodocs"],
  args: {
    menuButtonSize: "sm",
  },
  render: renderSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T4730" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Menu buttons render at small size", async () => {
      const buttons = canvasElement.querySelectorAll('[data-slot="sidebar-menu-button"]');
      expect(buttons.length).toBeGreaterThan(0);
      for (const btn of buttons) {
        expect(btn.getAttribute("data-size")).toBe("sm");
      }
    });

    await step("Sidebar content is intact", async () => {
      expect(canvas.getByText("Overview")).toBeInTheDocument();
      expect(canvas.getByText("Projects")).toBeInTheDocument();
      expect(canvas.getByText("Team")).toBeInTheDocument();
    });
  },
};

export const WithShowOnHover: Story = {
  tags: ["!dev", "!autodocs"],
  render: (args) => (
    <div className="min-h-[520px] bg-muted/30">
      <SidebarProvider defaultOpen>
        <Sidebar {...toSidebarProps(args)}>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Notifications</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <BellIcon />
                      <span>Alerts</span>
                    </SidebarMenuButton>
                    <SidebarMenuAction showOnHover aria-label="Mark all read">
                      <StarIcon />
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <InboxIcon />
                      <span>Inbox</span>
                    </SidebarMenuButton>
                    <SidebarMenuAction aria-label="View inbox">
                      <UsersIcon />
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="p-4 font-medium">Show on Hover Example</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  ),
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T5509" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Menu items render", async () => {
      expect(canvas.getByText("Alerts")).toBeInTheDocument();
      expect(canvas.getByText("Inbox")).toBeInTheDocument();
    });

    await step("showOnHover action has opacity-0 class on desktop", async () => {
      const hoverAction = canvas.getByRole("button", { name: "Mark all read" });
      expect(hoverAction).toBeInTheDocument();
      expect(hoverAction.className).toContain("md:opacity-0");
    });

    await step("Always-visible action does not have opacity-0 class", async () => {
      const visibleAction = canvas.getByRole("button", { name: "View inbox" });
      expect(visibleAction).toBeInTheDocument();
      expect(visibleAction.className).not.toContain("md:opacity-0");
    });
  },
};

export const ControlledSidebar: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => {
    const [open, setOpen] = React.useState(true);

    return (
      <div className="min-h-[520px] bg-muted/30">
        <SidebarProvider open={open} onOpenChange={setOpen}>
          <Sidebar>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive>
                        <HomeIcon />
                        <span>Home</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <div className="flex items-center gap-2 border-b p-4">
              <SidebarTrigger />
              <span className="font-medium">Controlled Sidebar</span>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
  },
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T5510" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Sidebar starts open via controlled prop", async () => {
      const sidebarSlot = canvasElement.querySelector('[data-slot="sidebar"]');
      expect(sidebarSlot?.getAttribute("data-state")).toBe("expanded");
    });

    await step("Toggle button collapses the sidebar", async () => {
      const trigger = canvas.getByRole("button", { name: /toggle sidebar/i });
      await userEvent.click(trigger);
      const sidebarSlot = canvasElement.querySelector('[data-slot="sidebar"]');
      expect(sidebarSlot?.getAttribute("data-state")).toBe("collapsed");
    });

    await step("Toggle button re-expands the sidebar", async () => {
      const trigger = canvas.getByRole("button", { name: /toggle sidebar/i });
      await userEvent.click(trigger);
      const sidebarSlot = canvasElement.querySelector('[data-slot="sidebar"]');
      expect(sidebarSlot?.getAttribute("data-state")).toBe("expanded");
    });
  },
};

export const KeyboardShortcutToggle: Story = {
  tags: ["!dev", "!autodocs"],
  render: renderSidebar,
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T5511" },
  },
  play: async ({ canvasElement, step }) => {
    await step("Sidebar starts expanded", async () => {
      const sidebarSlot = canvasElement.querySelector('[data-slot="sidebar"]');
      expect(sidebarSlot?.getAttribute("data-state")).toBe("expanded");
    });

    await step("Ctrl+B collapses sidebar via keyboard shortcut", async () => {
      await userEvent.keyboard("{Control>}b{/Control}");
      const sidebarSlot = canvasElement.querySelector('[data-slot="sidebar"]');
      expect(sidebarSlot?.getAttribute("data-state")).toBe("collapsed");
    });

    await step("Ctrl+B again expands sidebar", async () => {
      await userEvent.keyboard("{Control>}b{/Control}");
      const sidebarSlot = canvasElement.querySelector('[data-slot="sidebar"]');
      expect(sidebarSlot?.getAttribute("data-state")).toBe("expanded");
    });
  },
};

/**
 * Exercises every composition toggle the playground adds (`showRail`,
 * `showBadges`, `showSkeleton`, `showFooter: false`) so a regression in those
 * branches can't hide behind the meta defaults `Default` runs with.
 */
export const PlaygroundToggles: Story = {
  tags: ["!dev", "!autodocs"],
  args: {
    showRail: true,
    showBadges: true,
    showSkeleton: true,
    showFooter: false,
  },
  render: renderSidebar,
  parameters: {
    zephyr: { testCaseId: "SW-T5714" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    // Not `playSidebar`: with a rail there are two "Toggle Sidebar" buttons
    // (trigger + rail), so its single-button lookup is ambiguous here.
    await step("Layout and navigation render", async () => {
      expect(canvas.getByText("Dashboard")).toBeInTheDocument();
      expect(canvas.getAllByRole("button", { name: /toggle sidebar/i }).length).toBe(2);
      expect(canvas.getByText("Overview")).toBeInTheDocument();
      expect(canvas.getByText("Projects")).toBeInTheDocument();
    });

    await step("Rail renders and toggles", async () => {
      const rail = canvasElement.querySelector('[data-sidebar="rail"]') as HTMLElement;
      expect(rail).toBeTruthy();
      await userEvent.click(rail);
      expect(canvasElement.querySelector('[data-slot="sidebar"]')?.getAttribute("data-state")).toBe("collapsed");
      await userEvent.click(rail);
      expect(canvasElement.querySelector('[data-slot="sidebar"]')?.getAttribute("data-state")).toBe("expanded");
    });

    await step("Badges and hover action render", async () => {
      expect(canvasElement.querySelectorAll('[data-slot="sidebar-menu-badge"]').length).toBe(2);
      const action = canvas.getByRole("button", { name: "Invite teammate" });
      expect(action.className).toContain("md:opacity-0");
    });

    await step("Skeleton loading group renders", async () => {
      expect(canvas.getByText("Recent")).toBeInTheDocument();
      expect(canvasElement.querySelectorAll('[data-slot="sidebar-menu-skeleton"]').length).toBe(3);
    });

    await step("Footer is omitted", async () => {
      expect(canvasElement.querySelector('[data-sidebar="footer"]')).toBeNull();
    });
  },
};
