import React, { useState } from "react";
import styled from "styled-components";
import { CodeEditor } from "@atoms/CodeEditor";
import { Modal } from "@atoms/Modal";

export interface PythonEditorModalProps {
  open: boolean;
  initialValue?: string;
  title?: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}

const EditorWrapper = styled.div`
  padding: 12px 0;
  flex: 1;
`;

const PythonEditorModal: React.FC<PythonEditorModalProps> = ({
  open,
  initialValue = "",
  title = "",
  onSave,
  onCancel,
}) => {
  const [code, setCode] = useState<string>(initialValue);

  const handleConfirm = () => {
    onSave(code);
  };

  return (
    <Modal
      isOpen={open}
      onClose={onCancel}
      onCloseLabel="Cancel"
      onConfirm={handleConfirm}
      onConfirmLabel="Save Code"
      title={title}
      width="600px"
    >
      <EditorWrapper>
        <CodeEditor
          value={code}
          onChange={(v) => setCode(v ?? "")}
          language="python"
          height={300}
          theme="dark"
          onCopy={() => {}}
          onLaunch={() => {}}
        />
      </EditorWrapper>
    </Modal>
  );
};

export default PythonEditorModal;
