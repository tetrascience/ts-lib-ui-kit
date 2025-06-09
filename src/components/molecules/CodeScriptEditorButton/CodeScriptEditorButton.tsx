import { useCallback, useState } from "react";
import { Button } from "@atoms/Button";
import { CodeEditor } from "@atoms/CodeEditor";
import { IconName } from "@atoms/Icon";
import { Icon } from "@atoms/Icon";
import { Modal } from "@atoms/Modal";
import "./CodeScriptEditorButton.scss";

interface CodeScriptEditorButtonProps {
  initialCode?: string;
  onCodeSave?: (newCode: string) => void;
  language?: string;
  buttonText?: string;
  modalTitle?: string;
  buttonProps?: React.ComponentProps<typeof Button>;
  modalProps?: Omit<
    React.ComponentProps<typeof Modal>,
    "isOpen" | "onConfirm" | "onClose"
  >; // Update modal props
  disabled?: boolean;
  isEditMode?: boolean;
}

/**
 * Renders an 'Edit code' button that opens a modal with a Monaco code editor.
 */
const CodeScriptEditorButton = ({
  initialCode = "",
  onCodeSave,
  language = "python",
  buttonText = "Edit Code",
  modalTitle = "Edit Code",
  buttonProps,
  modalProps,
  disabled = false,
}: CodeScriptEditorButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCode, setCurrentCode] = useState<string>(initialCode);

  const lineCount = currentCode ? currentCode.split("\n").length : 0;
  const charCount = currentCode.length;

  const handleOpenModal = useCallback(() => {
    setCurrentCode(initialCode);
    setIsModalOpen(true);
  }, [initialCode]); // Depend on initialCode

  const handleSave = useCallback(() => {
    if (onCodeSave) {
      onCodeSave(currentCode);
    }
    setIsModalOpen(false);
  }, [onCodeSave, currentCode]);

  const handleCancel = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleCodeChange = useCallback((value: string | undefined) => {
    setCurrentCode(value || "");
  }, []);

  return (
    <>
      <div className="code-script-editor-button__container">
        <Button
          leftIcon={<Icon name={IconName.PENCIL} />}
          onClick={handleOpenModal}
          size="small"
          variant="tertiary"
          {...buttonProps}
          disabled={disabled}
          style={{ height: 38 }}
        >
          {buttonText}
        </Button>
        <span
          className="code-script-editor-button__status-text"
          title={`${lineCount} lines, ${charCount} characters`}
        >
          {lineCount} lines / {charCount} chars
        </span>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCancel}
        onConfirm={handleSave}
        onCloseLabel="Cancel"
        onConfirmLabel="Save Code"
        title={modalTitle}
        width="650px"
        {...modalProps}
      >
        <div className="code-script-editor-button__editor-container">
          <CodeEditor
            height="400px"
            language={language}
            value={currentCode}
            onChange={handleCodeChange}
            options={{
              minimap: { enabled: false },
            }}
          />
        </div>
      </Modal>
    </>
  );
};

export { CodeScriptEditorButton };
export type { CodeScriptEditorButtonProps };
