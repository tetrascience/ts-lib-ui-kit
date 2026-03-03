import { Pencil } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

export interface CodeScriptEditorButtonProps {
  initialCode?: string;
  onCodeSave?: (newCode: string) => void;
  language?: string;
  buttonText?: string;
  modalTitle?: string;
  buttonProps?: React.ComponentProps<typeof Button>;
  modalProps?: Omit<React.ComponentProps<typeof Dialog>, "open" | "defaultOpen" | "onOpenChange">;
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
      <div className="flex items-center flex-row gap-4 flex-wrap w-full">
        <div className="[&>button]:h-[38px]">
          <Button onClick={handleOpenModal} size="sm" variant="secondary" {...buttonProps} disabled={disabled}>
            <Pencil />
            {buttonText}
          </Button>
        </div>
        <span className="text-xs text-muted-foreground" title={`${lineCount} lines, ${charCount} characters`}>
          {lineCount} lines / {charCount} chars
        </span>
      </div>

      <Dialog
        {...modalProps}
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            handleCancel();
          }
        }}
      >
        <DialogContent className="min-w-[80%]">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          <CodeEditor
            height="400px"
            language={language}
            value={currentCode}
            onChange={handleCodeChange}
            options={{
              minimap: { enabled: false },
            }}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={handleCancel}>Close</Button>
            </DialogClose>
            <Button onClick={handleSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CodeScriptEditorButton;
