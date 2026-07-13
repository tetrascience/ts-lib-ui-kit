import { Clock, FlaskConical, History, Sparkles } from "lucide-react";
import * as React from "react";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";

import { DataAppShellRightPanel } from "./RightPanel";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { Chat } from "@/components/composed/Chat";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const meta: Meta<typeof DataAppShellRightPanel> = {
  title: "Design Patterns/Data App Shell/Right Panel",
  component: DataAppShellRightPanel,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Docked right-hand panel for the Data App Shell (SW-2117). Sits in normal flow beside the main " +
          "content, so opening and resizing **push main narrower**. Width is drag-resizable (pointer or " +
          "keyboard on the left-edge handle) and persisted to `localStorage` per `id`. While closed, a " +
          "floating FAB trigger re-opens it. The panel body is a plain slot — a chat, a history list, an " +
          "inspector, anything. For the overlay case (slides **over** content with a scrim, no reflow), " +
          "reuse the existing `Sheet` with `side=\"right\"` — see the *Drawer Overlay* story.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// Story-local helpers
// =============================================================================

/** Bounded demo frame: relative flex row the panel docks into. */
function DemoFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-[480px] w-full overflow-hidden rounded-lg border border-border bg-background">
      {children}
    </div>
  );
}

/** Placeholder main content that visibly reflows when the panel pushes it. */
function DemoMain() {
  return (
    <main className="flex min-w-0 flex-1 flex-col gap-3 overflow-auto p-4">
      <div className="h-8 w-1/3 rounded-md bg-muted" />
      <div className="flex-1 rounded-lg border border-border bg-card" />
      <div className="h-24 rounded-lg border border-border bg-card" />
    </main>
  );
}

/** Generic example panel body — the slot could hold anything. */
function DemoPanelBody() {
  return (
    <div className="flex flex-col gap-2 p-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="h-10 rounded-md bg-muted" />
      ))}
    </div>
  );
}

function DockedDemo({
  id,
  resizable = true,
  defaultOpen = true,
  children,
}: {
  id: string;
  resizable?: boolean;
  defaultOpen?: boolean;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <DemoFrame>
      <DemoMain />
      <DataAppShellRightPanel
        id={id}
        open={open}
        onOpenChange={setOpen}
        resizable={resizable}
        title="Assistant"
        icon={<Sparkles className="size-4 text-primary" />}
        triggerLabel="Open assistant panel"
      >
        {children ?? <DemoPanelBody />}
      </DataAppShellRightPanel>
    </DemoFrame>
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// =============================================================================
// Stories
// =============================================================================

/**
 * Docked panel beside the main content. Closing collapses it to a floating
 * FAB; opening pushes main narrower again. Esc (with focus inside the panel)
 * also closes it, and focus follows: into the panel on open, back to the FAB
 * on close.
 */
export const Docked: Story = {
  render: () => <DockedDemo id="sb-docked" />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Panel is docked and labelled", async () => {
      const panel = await canvas.findByRole("complementary", { name: "Assistant" });
      expect(panel).toBeVisible();
    });

    await step("Close button collapses the panel to the FAB and moves focus to it", async () => {
      await sleep(400);
      await userEvent.click(canvas.getByRole("button", { name: "Close panel" }));
      expect(canvas.queryByRole("complementary", { name: "Assistant" })).not.toBeInTheDocument();
      const fab = canvas.getByRole("button", { name: "Open assistant panel" });
      expect(fab).toHaveAttribute("aria-expanded", "false");
      await waitFor(() => expect(fab).toHaveFocus());
    });

    await step("FAB re-opens the panel and moves focus inside", async () => {
      await sleep(400);
      await userEvent.click(canvas.getByRole("button", { name: "Open assistant panel" }));
      expect(await canvas.findByRole("complementary", { name: "Assistant" })).toBeVisible();
      await waitFor(() => expect(canvas.getByRole("button", { name: "Close panel" })).toHaveFocus());
    });

    await step("Esc inside the panel closes it", async () => {
      await sleep(400);
      await userEvent.keyboard("{Escape}");
      expect(canvas.queryByRole("complementary", { name: "Assistant" })).not.toBeInTheDocument();
    });

    await step("Re-open so the story ends in the docked state", async () => {
      await sleep(400);
      await userEvent.click(canvas.getByRole("button", { name: "Open assistant panel" }));
      expect(await canvas.findByRole("complementary", { name: "Assistant" })).toBeVisible();
    });
  },
};

/**
 * Drag the left-edge handle to resize; the width is persisted to
 * `localStorage` under the panel's `id` and restored on the next mount.
 * The handle is an ARIA separator: arrow keys resize, Home/End jump to
 * min/max.
 */
export const DragResize: Story = {
  loaders: [
    () => {
      // Deterministic start — drop any width persisted by a previous run.
      window.localStorage.removeItem("ts-ui.right-panel.sb-resize.width");
    },
  ],
  render: () => <DockedDemo id="sb-resize" />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const panel = await canvas.findByRole("complementary", { name: "Assistant" });
    const handle = canvas.getByRole("separator", { name: "Resize panel" });

    await step("Pointer drag on the handle resizes the panel", async () => {
      await sleep(400);
      expect(panel.style.width).toBe("320px");
      fireEvent.pointerDown(handle, { button: 0, pointerId: 1, clientX: 600 });
      fireEvent.pointerMove(handle, { pointerId: 1, clientX: 500 });
      expect(panel.style.width).toBe("420px");
      fireEvent.pointerUp(handle, { pointerId: 1, clientX: 500 });
    });

    await step("Final width is persisted per panel id", async () => {
      expect(window.localStorage.getItem("ts-ui.right-panel.sb-resize.width")).toBe("420");
    });

    await step("Arrow keys resize from the keyboard", async () => {
      await sleep(400);
      handle.focus();
      await userEvent.keyboard("{ArrowLeft}");
      expect(panel.style.width).toBe("436px");
      expect(handle).toHaveAttribute("aria-valuenow", "436");
      await userEvent.keyboard("{ArrowRight}{ArrowRight}");
      expect(panel.style.width).toBe("404px");
      expect(window.localStorage.getItem("ts-ui.right-panel.sb-resize.width")).toBe("404");
    });

    await step("Home / End jump to min / max width", async () => {
      await sleep(400);
      await userEvent.keyboard("{End}");
      expect(panel.style.width).toBe("560px");
      await userEvent.keyboard("{Home}");
      expect(panel.style.width).toBe("240px");
      expect(handle).toHaveAttribute("aria-valuemin", "240");
      expect(handle).toHaveAttribute("aria-valuemax", "560");
    });
  },
};

/** `resizable={false}` removes the drag handle; the width stays fixed. */
export const NonResizable: Story = {
  render: () => <DockedDemo id="sb-fixed" resizable={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole("complementary", { name: "Assistant" });
    expect(canvas.queryByRole("separator", { name: "Resize panel" })).not.toBeInTheDocument();
  },
};

/** Starts closed — only the floating FAB trigger is rendered. */
export const ClosedWithFab: Story = {
  render: () => <DockedDemo id="sb-closed" defaultOpen={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByRole("complementary")).not.toBeInTheDocument();
    // waitFor — the FAB's fade-in entry animation starts at opacity 0
    await waitFor(() => expect(canvas.getByRole("button", { name: "Open assistant panel" })).toBeVisible());
  },
};

/**
 * Example content: the panel body is a plain slot — here it hosts the
 * design-system `Chat`, but a history list or inspector works the same way.
 */
export const WithChatContent: Story = {
  render: function WithChatContentStory() {
    const [open, setOpen] = React.useState(true);
    return (
      <DemoFrame>
        <DemoMain />
        <DataAppShellRightPanel
          id="sb-chat"
          open={open}
          onOpenChange={setOpen}
          title="TetraAgent"
          icon={<Sparkles className="size-4 text-primary" />}
          triggerLabel="Open TetraAgent chat"
        >
          <Chat
            className="flex-1"
            suggestions={["Summarise this run", "Flag outlier wells", "Compare to last batch"]}
            onSend={() => "This is a demo assistant reply."}
          />
        </DataAppShellRightPanel>
      </DemoFrame>
    );
  },
};

/**
 * The overlay case **reuses the existing `Sheet`** (`side="right"`): it slides
 * in over the content with a scrim and does not reflow main. Esc or clicking
 * the scrim closes it.
 */
export const DrawerOverlay: Story = {
  render: () => (
    <DemoFrame>
      <DemoMain />
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="absolute right-4 top-4">
            <History data-icon="inline-start" />
            History
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 gap-0 sm:max-w-80">
          <SheetHeader className="border-b border-border">
            <SheetTitle>History</SheetTitle>
            <SheetDescription>Recent activity — overlays the content without reflowing it.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-1 overflow-auto p-2">
            {[
              { icon: FlaskConical, label: "Run 2481 completed", time: "2 min ago" },
              { icon: Clock, label: "Plate P-88 queued", time: "14 min ago" },
              { icon: FlaskConical, label: "Run 2480 completed", time: "1 h ago" },
              { icon: Clock, label: "Calibration scheduled", time: "3 h ago" },
            ].map(({ icon: Icon, label, time }) => (
              <div key={label} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted">
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-sm">{label}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{time}</span>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </DemoFrame>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await step("Trigger opens the overlay drawer with a scrim", async () => {
      await sleep(400);
      await userEvent.click(canvas.getByRole("button", { name: "History" }));
      const drawer = await body.findByRole("dialog", { name: "History" });
      // waitFor — the sheet's slide/fade entry animation starts at opacity 0
      await waitFor(() => expect(drawer).toBeVisible());
      expect(canvasElement.ownerDocument.querySelector('[data-slot="sheet-overlay"]')).not.toBeNull();
    });

    await step("Esc closes the drawer", async () => {
      await sleep(400);
      await userEvent.keyboard("{Escape}");
      await waitFor(() =>
        expect(body.queryByRole("dialog", { name: "History" })).not.toBeInTheDocument(),
      );
    });
  },
};
