import * as React from "react";

import { Banner } from "./banner";
import { Button } from "./button";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Banner> = {
  title: "UI/Banner",
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

export const Info: Story = {
  args: {
    variant: "info",
    title: "System maintenance scheduled",
    description: "The platform will be unavailable on Sunday from 2–4 AM UTC.",
  },
};

export const Positive: Story = {
  args: {
    variant: "positive",
    title: "Deployment successful",
    description: "Version 3.2.1 is now live in production.",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    title: "Storage nearing capacity",
    description:
      "Your organization is at 87% storage capacity. Upgrade your plan to avoid interruptions.",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    title: "Pipeline failed",
    description:
      "The ingestion pipeline stopped due to a schema mismatch. Review the error log.",
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
};

export const Dismissible: Story = {
  render: () => {
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
  },
};

export const TitleOnly: Story = {
  args: {
    variant: "destructive",
    title: "Authentication error — please sign in again.",
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
};
