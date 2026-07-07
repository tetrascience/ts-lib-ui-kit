import { ChevronDown, HelpCircle } from "lucide-react";
import { expect, userEvent, within } from "storybook/test";

import { TopBar } from "./TopBar";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { UserMenu } from "@/components/composed/UserMenu";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";


const meta: Meta<typeof TopBar> = {
  title: "Composed/TopBar",
  component: TopBar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Sticky application header with three slots — **left** / **center** / **right**. " +
          "The left slot is typically a breadcrumb (slot in any node); the center is an " +
          "optional 'context' slot (e.g. a version / status selector); the right holds " +
          "actions, a help affordance, or a `UserMenu`.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

const breadcrumbSlot = (
  <Breadcrumb className="min-w-0">
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="#">CRO Connect</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator>/</BreadcrumbSeparator>
      <BreadcrumbItem>
        <BreadcrumbLink href="#">Study 402</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator>/</BreadcrumbSeparator>
      <BreadcrumbItem>
        <BreadcrumbPage>Review</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
);

/** Default: breadcrumb slotted into the left slot via `TopBarBreadcrumb`. */
export const Default: Story = {
  args: { left: breadcrumbSlot },
  parameters: { zephyr: { testCaseId: "" } },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Breadcrumb trail renders with a current page", async () => {
      expect(canvas.getByText("CRO Connect")).toBeInTheDocument();
      const current = canvas.getByText("Review");
      expect(current).toHaveAttribute("aria-current", "page");
    });
  },
};

/** Center "context" slot — the version / status selector the shell previously lacked. */
export const WithContextSelector: Story = {
  args: {
    left: breadcrumbSlot,
    center: (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1">
          Version 3 <ChevronDown className="w-3.5 h-3.5" />
        </Button>
        <Badge variant="secondary">Awaiting Review</Badge>
      </div>
    ),
  },
  parameters: { zephyr: { testCaseId: "" } },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Center context slot renders", async () => {
      expect(canvas.getByText("Version 3")).toBeInTheDocument();
      expect(canvas.getByText("Awaiting Review")).toBeInTheDocument();
    });
  },
};

/** All three slots populated: breadcrumb + context selector + actions and UserMenu. */
export const AllSlots: Story = {
  args: {
    left: breadcrumbSlot,
    center: (
      <Button variant="outline" size="sm" className="gap-1">
        Version 3 <ChevronDown className="w-3.5 h-3.5" />
      </Button>
    ),
    right: (
      <>
        <Button size="sm">Next</Button>
        <Button variant="ghost" size="icon" className="w-7 h-7" aria-label="Help">
          <HelpCircle className="w-4 h-4" />
        </Button>
        <UserMenu
          name="Emily Liu"
          subtitle="emily.liu@acme.com"
          groups={[
            {
              items: [
                { id: "profile", label: "Profile" },
                { id: "settings", label: "Settings" },
              ],
            },
            {
              items: [
                { id: "logout", label: "Log out", variant: "destructive" },
              ],
            },
          ]}
        />
      </>
    ),
  },
  parameters: { zephyr: { testCaseId: "" } },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("All three slots render their content", async () => {
      expect(canvas.getByText("Study 402")).toBeInTheDocument();
      expect(canvas.getByText("Version 3")).toBeInTheDocument();
      expect(canvas.getByRole("button", { name: "Next" })).toBeInTheDocument();
    });

    await step("UserMenu opens from the right slot", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: /account menu/i })
      );
      const menu = within(document.body);
      expect(await menu.findByText("Settings")).toBeInTheDocument();
    });
  },
};

/** Non-sticky variant — useful when embedding the bar in a non-scrolling panel. */
export const NonSticky: Story = {
  args: { left: breadcrumbSlot, sticky: false },
  parameters: { zephyr: { testCaseId: "" } },
};
