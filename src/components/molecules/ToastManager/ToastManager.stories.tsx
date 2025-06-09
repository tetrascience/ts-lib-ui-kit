import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { ToastManager, ToastPosition, toast } from "./ToastManager";
import "./ToastManager.stories.scss";

interface ShowcaseProps {
  position: ToastPosition;
}

const meta: Meta<ShowcaseProps> = {
  title: "Molecules/ToastManager",
  component: ToastManager,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<ShowcaseProps>;

const Showcase = ({ position }: ShowcaseProps) => {
  const showInfoToast = () =>
    toast.info("Info Toast", "This is an information message");
  const showSuccessToast = () =>
    toast.success("Success Toast", "Operation completed successfully");
  const showWarningToast = () =>
    toast.warning("Warning Toast", "This action might have consequences");
  const showDangerToast = () =>
    toast.danger("Danger Toast", "An error has occurred");
  const showDefaultToast = () =>
    toast.default("Default Toast", "This is a default message");

  const showHeadingOnlyToast = () =>
    toast.info("This toast has no description");

  return (
    <div className="container">
      <h2>Toast Showcase</h2>
      <p>Position: {position}</p>

      <h3>Toast Types</h3>
      <div className="button-grid">
        <button className="button variant-default" onClick={showDefaultToast}>
          Default Toast
        </button>
        <button className="button variant-info" onClick={showInfoToast}>
          Info Toast
        </button>
        <button className="button variant-success" onClick={showSuccessToast}>
          Success Toast
        </button>
        <button className="button variant-warning" onClick={showWarningToast}>
          Warning Toast
        </button>
        <button className="button variant-danger" onClick={showDangerToast}>
          Danger Toast
        </button>
      </div>

      <button className="button variant-info" onClick={showHeadingOnlyToast}>
        Toast without description
      </button>

      <ToastManager position={position} />
    </div>
  );
};

export const TopPosition: Story = {
  render: () => <Showcase position="top" />,
};

export const BottomPosition: Story = {
  render: () => <Showcase position="bottom" />,
};
