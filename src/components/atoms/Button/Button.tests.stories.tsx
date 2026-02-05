import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { Button } from "./Button";

/**
 * Interactive test stories for the Button component.
 * These are excluded from the Storybook UI but run as part of the test suite.
 */
const meta: Meta<typeof Button> = {
  title: "Tests/Atoms/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const ClickInteraction: Story = {
  args: {
    children: "Click Me",
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Find the button by its text
    const button = canvas.getByRole("button", { name: /click me/i });

    // Verify button is rendered
    await expect(button).toBeInTheDocument();

    // Click the button
    await userEvent.click(button);

    // Verify the onClick handler was called
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const DisabledButtonInteraction: Story = {
  args: {
    children: "Disabled Button",
    disabled: true,
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const button = canvas.getByRole("button", { name: /disabled button/i });

    // Verify button is disabled
    await expect(button).toBeDisabled();

    // Attempt to click - should not trigger onClick
    // Note: userEvent.click respects disabled state and won't fire events
    await userEvent.click(button).catch(() => {
      // Expected to fail on disabled button
    });

    // Verify onClick was NOT called
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const HoverInteraction: Story = {
  args: {
    children: "Hover Over Me",
    variant: "primary",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const button = canvas.getByRole("button", { name: /hover over me/i });

    // Verify initial state
    await expect(button).toBeInTheDocument();

    // Hover over the button
    await userEvent.hover(button);

    // Button should still be visible after hover
    await expect(button).toBeVisible();

    // Unhover
    await userEvent.unhover(button);
  },
};

export const KeyboardInteraction: Story = {
  args: {
    children: "Press Enter",
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const button = canvas.getByRole("button", { name: /press enter/i });

    // Focus the button using tab
    await userEvent.tab();

    // Verify button has focus
    await expect(button).toHaveFocus();

    // Press Enter to activate the button
    await userEvent.keyboard("{Enter}");

    // Verify onClick was called
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

