import { expect, within } from "storybook/test";

import { BuildInfoFooter } from "./BuildInfoFooter";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Design Patterns/Build Info Footer",
  component: BuildInfoFooter,
  parameters: {
    layout: "fullscreen",
    zephyr: { testCaseId: "" },
  },
  tags: ["autodocs"],
  args: {
    version: "1.4.2",
    commitSha: "a1b2c3d",
  },
} satisfies Meta<typeof BuildInfoFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** App version + commit SHA. */
export const Default: Story = {
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("renders the version and commit", async () => {
      expect(canvasElement.querySelector('[data-slot="build-info-footer"]')).toBeInTheDocument();
      expect(canvas.getByText("v1.4.2")).toBeVisible();
      expect(canvas.getByText("a1b2c3d")).toBeVisible();
    });
  },
};

/** Only what you pass renders — here just the version. */
export const VersionOnly: Story = {
  args: {
    commitSha: undefined,
  },
  parameters: {
    zephyr: { testCaseId: "" },
  },
};
