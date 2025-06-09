import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import styled from "styled-components";
import { Button } from "./../../atoms/Button";
import { PythonEditorModal } from "./PythonEditorModal";

const meta: Meta<typeof PythonEditorModal> = {
  title: "Molecules/PythonEditorModal",
  component: PythonEditorModal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof PythonEditorModal>;

const StoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 800px;
`;

const CodePreview = styled.pre`
  background: var(--grey-100);
  padding: 12px;
  border-radius: 8px;
  overflow: auto;
  max-height: 200px;
  font-family: monospace;
  font-size: 14px;
  margin-top: 8px;
`;

const Preview = styled.div`
  margin-top: 16px;
`;

export const Interactive = () => {
  const [open, setOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState("");
  const initialCode =
    "def add(a, b):\n  return a + b\n\nresult = add(5, 3)\nprint(result)";

  return (
    <StoryContainer>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open Python Editor Modal
      </Button>

      <PythonEditorModal
        open={open}
        title="Edit Python Code"
        initialValue={lastSaved || initialCode}
        onSave={(value) => {
          setLastSaved(value);
          setOpen(false);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />

      {lastSaved && (
        <Preview>
          <strong>Last Saved Code:</strong>
          <CodePreview>{lastSaved}</CodePreview>
        </Preview>
      )}
    </StoryContainer>
  );
};

export const DefaultStory: Story = {
  name: "Default",
  args: {
    open: true,
    title: "Python Editor",
    initialValue:
      "def hello_world():\n  print('Hello, World!')\n\nhello_world()",
    onSave: (value) => console.log("Saving code:", value),
    onCancel: () => console.log("Modal closed"),
  },
};
