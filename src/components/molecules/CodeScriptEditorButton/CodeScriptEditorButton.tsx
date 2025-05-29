import { useCallback, useState } from "react";
import styled from "styled-components";
import { Button } from "@atoms/Button";
import { CodeEditor } from "@atoms/CodeEditor";
import { IconName } from "@atoms/Icon";
import { Icon } from "@atoms/Icon";
import { Modal } from "@atoms/Modal";

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 16px;
  flex-wrap: wrap;
  width: 100%;
`;

const EditorContainer = styled.div`
  margin: 16px 0;
`;

const StatusText = styled.span`
  font-size: 12px;
  color: var(--grey-400);
`;

export interface CodeScriptEditorButtonProps {
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
export const CodeScriptEditorButton = ({
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
      <ButtonContainer>
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
        <StatusText title={`${lineCount} lines, ${charCount} characters`}>
          {lineCount} lines / {charCount} chars
        </StatusText>
      </ButtonContainer>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCancel}
        onConfirm={handleSave}
        onCloseLabel="Cancel"
        onConfirmLabel="Save Code"
        title={modalTitle}
        width="80%"
        {...modalProps}
      >
        <EditorContainer>
          <CodeEditor
            height="400px"
            language={language}
            value={currentCode}
            onChange={handleCodeChange}
            options={{
              minimap: { enabled: false },
            }}
          />
        </EditorContainer>
      </Modal>
    </>
  );
};

export default CodeScriptEditorButton;
