import React, { useState } from "react";
import { CodeEditor } from "@atoms/CodeEditor";
import { Modal } from "@atoms/Modal";
import "./PythonEditorModal.scss";

interface PythonEditorModalProps {
  open: boolean;
  initialValue?: string;
  title?: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}

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
      <div className="python-editor-modal__editor-wrapper">
        <CodeEditor
          value={code}
          onChange={(v) => setCode(v ?? "")}
          language="python"
          height={300}
          theme="dark"
          onCopy={() => {}}
          onLaunch={() => {}}
        />
      </div>
    </Modal>
  );
};

export { PythonEditorModal };
export type { PythonEditorModalProps };
