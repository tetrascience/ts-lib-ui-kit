import { Meta, StoryObj } from "@storybook/react";
import LaunchContent from "./LaunchContent";

const meta: Meta<typeof LaunchContent> = {
  title: "Molecules/LaunchContent",
  component: LaunchContent,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof LaunchContent>;

export const Default: Story = {
  args: {
    initialCode: `protocolSchema: v3
name: v3
description: No description
config: {}
steps: []`,
    versions: ["v0.0.7", "v0.0.6", "v0.0.5"],
    currentVersion: "v0.0.7",
  },
};

export const WithCallbacks: Story = {
  args: {
    ...Default.args,
    onDeploy: () => console.log("Deploy clicked!"),
    onVersionChange: (version) => console.log(`Version changed to ${version}`),
  },
};

export const WithDeploymentFeedback: Story = {
  args: {
    ...Default.args,
    onDeploy: () => {
      console.log("Deploy complete!");
    },
  },
  play: async () => {},
  parameters: {
    docs: {
      description: {
        story:
          'Click the "Deploy" button to see toast notifications showing deployment status and success.',
      },
    },
  },
};

export const EmptyEditor: Story = {
  args: {
    initialCode: "",
    versions: ["v0.0.7", "v0.0.6", "v0.0.5"],
    currentVersion: "v0.0.7",
  },
};
