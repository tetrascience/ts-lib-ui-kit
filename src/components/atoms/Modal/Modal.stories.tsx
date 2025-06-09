import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import { Modal } from "./Modal";

const meta: Meta<typeof Modal> = {
  title: "Atoms/Modal",
  component: Modal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Modal>;

// Base story
export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Modal closed"),
    onConfirm: () => console.log("Modal confirmed"),
    title: "Title",
    children: (
      <p>
        Are you sure you want to reset this view? you will need to input all the
        settings and load all the graph from the start
      </p>
    ),
  },
};

// Modal with hidden actions
export const HiddenActions: Story = {
  args: {
    ...Default.args,
    hideActions: true,
  },
};

// Modal with custom width
export const CustomWidth: Story = {
  args: {
    ...Default.args,
    width: "800px",
  },
};

// Modal with long scrollable content
export const LongContent: Story = {
  args: {
    ...Default.args,
    children: (
      <>
        {Array(10)
          .fill(0)
          .map((_, i) => (
            <p key={i}>
              This is paragraph {i + 1}. Lorem ipsum dolor sit amet, consectetur
              adipiscing elit. Nullam eu justo eu nisi ultrices facilisis. Donec
              vestibulum metus at sem faucibus, a commodo nunc ultricies.
            </p>
          ))}
      </>
    ),
  },
};

// Interactive example
export const Interactive: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleConfirm = () => {
    console.log("Reset confirmed");
    setIsOpen(false);
  };

  return (
    <div>
      <Button onClick={handleOpen} variant="primary">
        Open Modal
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Title"
      >
        <p>
          Are you sure you want to reset this view? you will need to input all
          the settings and load all the graph from the start
        </p>
      </Modal>
    </div>
  );
};

// Modal with custom content
export const CustomContent: Story = {
  args: {
    ...Default.args,
    title: "Custom Form",
    children: (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <input
          type="text"
          placeholder="Enter your name"
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid var(--grey-200)",
          }}
        />
        <textarea
          placeholder="Enter your message"
          rows={4}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid var(--grey-200)",
          }}
        />
      </div>
    ),
  },
};
