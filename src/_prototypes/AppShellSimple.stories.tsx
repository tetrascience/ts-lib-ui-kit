/**
 * AppShellSimple prototype (SW-2410) — Data App Shell stripped to two zones: a
 * full-width top bar (with the side-nav toggle + breadcrumb name) and a side
 * nav. The toggle cycles the nav: sidebar (labels) → rail (icons) → hidden.
 * Component lives in ./AppShellSimple.
 */
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
export const Sidebar: Story = {};

/** Icon-only rail (48px). Next toggle click hides the nav. */
export const IconRail: Story = {
  args: { defaultNav: "rail" },
};

/** Nav hidden — only the top bar. Next toggle click restores the sidebar. */
export const Hidden: Story = {
  args: { defaultNav: "hidden" },
};
