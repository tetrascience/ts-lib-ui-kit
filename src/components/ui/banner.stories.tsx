import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Banner } from "./banner";
import { Button } from "./button";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Banner> = {
  title: "Components/Banner",
  component: Banner,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="p-0">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["info", "positive", "warning", "destructive"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function DismissibleBannerStory() {
  const [visible, setVisible] = React.useState(true);

  return visible ? (
    <Banner
      variant="info"
      title="New features available"
      description="Check out the redesigned workflow builder in the Data App Studio."
      dismissible
      onDismiss={() => setVisible(false)}
    />
  ) : (
    <div className="p-4 text-sm text-muted-foreground">Banner dismissed.</div>
  );
}

export const Info: Story = {
  args: {
    variant: "info",
    title: "System maintenance scheduled",
    description: "The platform will be unavailable on Sunday from 2–4 AM UTC.",
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4681" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Banner has role and title", async () => {
      expect(canvas.getByRole("status")).toBeInTheDocument();
      expect(canvas.getByText("System maintenance scheduled")).toBeInTheDocument();
    });

    await step("Description renders", async () => {
      expect(
        canvas.getByText("The platform will be unavailable on Sunday from 2–4 AM UTC.")
      ).toBeInTheDocument();
    });

    await step("Icon is present", async () => {
      expect(canvas.getByRole("status").querySelector("svg")).toBeInTheDocument();
    });
  },
};

export const Positive: Story = {
  args: {
    variant: "positive",
    title: "Deployment successful",
    description: "Version 3.2.1 is now live in production.",
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4682" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Positive banner has role and title", async () => {
      expect(canvas.getByRole("status")).toBeInTheDocument();
      expect(canvas.getByText("Deployment successful")).toBeInTheDocument();
    });

    await step("Description renders", async () => {
      expect(
        canvas.getByText("Version 3.2.1 is now live in production.")
      ).toBeInTheDocument();
    });
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    title: "Storage nearing capacity",
    description:
      "Your organization is at 87% storage capacity. Upgrade your plan to avoid interruptions.",
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4683" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Warning banner has alert role", async () => {
      expect(canvas.getByRole("alert")).toBeInTheDocument();
      expect(canvas.getByText("Storage nearing capacity")).toBeInTheDocument();
    });

    await step("Description renders", async () => {
      expect(
        canvas.getByText(
          "Your organization is at 87% storage capacity. Upgrade your plan to avoid interruptions."
        )
      ).toBeInTheDocument();
    });
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    title: "Pipeline failed",
    description:
      "The ingestion pipeline stopped due to a schema mismatch. Review the error log.",
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4684" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Destructive banner has alert role", async () => {
      expect(canvas.getByRole("alert")).toBeInTheDocument();
      expect(canvas.getByText("Pipeline failed")).toBeInTheDocument();
    });

    await step("Description renders", async () => {
      expect(
        canvas.getByText(
          "The ingestion pipeline stopped due to a schema mismatch. Review the error log."
        )
      ).toBeInTheDocument();
    });
  },
};

export const WithAction: Story = {
  args: {
    variant: "warning",
    title: "Storage nearing capacity",
    description: "Your organization is at 87% storage capacity.",
    action: (
      <Button size="sm" variant="outline">
        Upgrade plan
      </Button>
    ),
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4685" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Banner with action renders", async () => {
      expect(canvas.getByRole("alert")).toBeInTheDocument();
      expect(canvas.getByText("Storage nearing capacity")).toBeInTheDocument();
    });

    await step("Action button renders", async () => {
      expect(
        canvas.getByRole("button", { name: "Upgrade plan" })
      ).toBeInTheDocument();
    });
  },
};

export const Dismissible: Story = {
  render: () => <DismissibleBannerStory />,
  parameters: {
    zephyr: { testCaseId: "SW-T4686" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Dismissible banner renders with close button", async () => {
      expect(canvas.getByRole("status")).toBeInTheDocument();
      expect(canvas.getByText("New features available")).toBeInTheDocument();
      expect(
        canvas.getByRole("button", { name: "Dismiss" })
      ).toBeInTheDocument();
    });

  },
};

export const DismissibleInteraction: Story = {
  name: "Dismissible Interaction",
  tags: ["!dev"],
  render: () => <DismissibleBannerStory />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Dismissible banner renders with close button", async () => {
      expect(canvas.getByRole("status")).toBeInTheDocument();
      expect(canvas.getByText("New features available")).toBeInTheDocument();
      expect(
        canvas.getByRole("button", { name: "Dismiss" })
      ).toBeInTheDocument();
    });

    await step("Clicking dismiss button hides banner", async () => {
      const dismissButton = canvas.getByRole("button", { name: "Dismiss" });
      await sleep(1000);
      await userEvent.click(dismissButton);

      await waitFor(() => {
        expect(canvas.queryByRole("status")).not.toBeInTheDocument();
      });
      expect(canvas.getByText("Banner dismissed.")).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4687" },
  },
};

export const TitleOnly: Story = {
  args: {
    variant: "destructive",
    title: "Authentication error — please sign in again.",
  },
  parameters: {
    zephyr: { testCaseId: "SW-T4688" },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-0">
      <Banner
        variant="info"
        title="Info"
        description="Informational system message."
      />
      <Banner
        variant="positive"
        title="Success"
        description="Operation completed successfully."
      />
      <Banner
        variant="warning"
        title="Warning"
        description="Action required before proceeding."
      />
      <Banner
        variant="destructive"
        title="Error"
        description="Something went wrong."
      />
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "SW-T4689" },
  },
};
