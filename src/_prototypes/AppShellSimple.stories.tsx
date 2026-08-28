/**
 * AppShellSimple prototype (SW-2410) — Data App Shell stripped to two zones: a
 * full-width top bar (with the side-nav toggle + breadcrumb name) and a side
 * nav. The toggle cycles the nav: sidebar (labels) → rail (icons) → hidden.
 * Component lives in ./AppShellSimple.
 */
import { expect, userEvent, within } from "storybook/test";

import { AppShellSimpleDemo } from "./AppShellSimple";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Prototypes/App Shell - Simple",
  component: AppShellSimpleDemo,
  parameters: {
    layout: "fullscreen",
    zephyr: { testCaseId: "" },
  },
} satisfies Meta<typeof AppShellSimpleDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Sidebar with labels. Clicking the toggle cycles: labels → icons → hidden. */
export const Sidebar: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const shell = canvasElement.querySelector('[data-slot="app-shell-simple"]');
    const toggle = canvasElement.querySelector('[data-slot="app-shell-simple-nav-toggle"]');
    if (!(shell instanceof HTMLElement) || !(toggle instanceof HTMLElement)) {
      throw new Error("shell or nav toggle not found");
    }

    await step("starts in the labelled sidebar", async () => {
      expect(shell).toHaveAttribute("data-nav-state", "sidebar");
      expect(canvas.getByRole("button", { name: "Overview" })).toBeVisible();
    });

    await step("toggle collapses to the icon rail", async () => {
      await userEvent.click(toggle);
      expect(shell).toHaveAttribute("data-nav-state", "rail");
    });

    await step("toggle hides the nav entirely", async () => {
      await userEvent.click(toggle);
      expect(shell).toHaveAttribute("data-nav-state", "hidden");
    });

    await step("ping-pongs back to the icon rail (does not wrap to sidebar)", async () => {
      await userEvent.click(toggle);
      expect(shell).toHaveAttribute("data-nav-state", "rail");
    });
  },
};

/** Icon-only rail (48px). Next toggle click hides the nav. */
export const IconRail: Story = {
  args: { defaultNav: "rail" },
};

/** Nav hidden — only the top bar. Next toggle click restores the sidebar. */
export const Hidden: Story = {
  args: { defaultNav: "hidden" },
};
