import { FileText, Home, LayoutDashboard, Settings } from "lucide-react";
import { expect, within } from "storybook/test";

import { DataAppShell } from "./DataAppShell";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { TetraScienceIcon } from "@/components/ui/tetrascience-icon";

const meta: Meta<typeof DataAppShell> = {
  title: "Patterns/DataAppShell",
  component: DataAppShell,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof DataAppShell>;

export const Default: Story = {
  args: {
    appName: "My Data App",
    appIcon: <TetraScienceIcon />,
    onAppNameClick: () => console.log("App name clicked"),
    onHelpClick: () => console.log("Help clicked"),
    navGroups: [
      {
        label: "Section 1",
        pages: [
          { label: "Welcome", icon: Home, isActive: true },
          { label: "My second pg", icon: FileText },
          { label: "My third pg", icon: FileText },
        ],
      },
      {
        label: "Section 2",
        pages: [
          { label: "Dashboard", icon: LayoutDashboard },
          { label: "Settings", icon: Settings },
        ],
      },
      {
        pages: [{ label: "Reports", icon: FileText }],
      },
    ],
    version: "Version 1.0.0",
    breadcrumbs: [
      { label: "Home", href: "#" },
      { label: "Welcome" },
      { label: "Welcome" },{ label: "Welcome" },{ label: "Welcome" },{ label: "Welcome" },
    ],
    children: (
      <div className="flex h-64 bg-muted items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">Main content area</p>
      </div>
    ),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("App name renders in breadcrumb", async () => {
      expect(canvas.getByText("My Data App")).toBeInTheDocument();
    });

    await step("Breadcrumbs render", async () => {
      const nav = canvasElement.querySelector("nav[aria-label='breadcrumb']");
      expect(nav).toBeInTheDocument();
    });

    await step("Toggle sidebar button renders", async () => {
      expect(canvas.getByRole("button", { name: /toggle sidebar/i })).toBeInTheDocument();
    });

    await step("Main content area renders", async () => {
      expect(canvas.getByText("Main content area")).toBeInTheDocument();
    });
  },
};

export const WithContent: Story = {
  args: {
    ...Default.args,
    children: (
      <div className="space-y-4 bg-muted md:px-4 rounded-lg">
        <h1 className="text-2xl font-bold">Welcome</h1>
        <p className="text-muted-foreground">
          This is an example data app with real content inside the shell.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex h-32 items-center justify-center rounded-lg border bg-muted/50"
            >
              <span className="text-sm text-muted-foreground">
                Card {i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Content heading renders", async () => {
      expect(canvas.getByRole("heading", { name: "Welcome" })).toBeInTheDocument();
    });

    await step("Content description renders", async () => {
      expect(canvas.getByText(/example data app with real content/)).toBeInTheDocument();
    });

    await step("Content cards render", async () => {
      expect(canvas.getByText("Card 1")).toBeInTheDocument();
      expect(canvas.getByText("Card 6")).toBeInTheDocument();
    });
  },
};

export const MinimalSidebar: Story = {
  args: {
    ...Default.args,
    navGroups: [
      {
        label: "Pages",
        pages: [
          { label: "Overview", icon: Home, isActive: true },
          { label: "Details", icon: FileText },
        ],
      },
    ],
    version: undefined,
    breadcrumbs: undefined,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("App shell renders with sidebar toggle", async () => {
      expect(canvas.getByRole("button", { name: /toggle sidebar/i })).toBeInTheDocument();
    });

    await step("App name renders in breadcrumb", async () => {
      expect(canvas.getByText("My Data App")).toBeInTheDocument();
    });

    await step("Main content area renders", async () => {
      expect(canvas.getByText("Main content area")).toBeInTheDocument();
    });
  },
};
