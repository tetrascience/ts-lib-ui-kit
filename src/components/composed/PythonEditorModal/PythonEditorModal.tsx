import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import { Dialog, DialogTitle, DialogContent, DialogHeader, DialogFooter, DialogDescription } from "@/components/ui/dialog";

export interface PythonEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue?: string;
  title?: string;
  description?: string;
  onSave: (value: string) => void;
  onCancel?: () => void;
}

const PythonEditorModal: React.FC<PythonEditorModalProps> = ({
  open,
  onOpenChange,
  initialValue = "",
  title = "",
  description = "",
  onSave,
  onCancel,
}) => {
  const [code, setCode] = useState<string>(initialValue);

  const handleConfirm = () => {
    onSave(code);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="min-w-[600px]"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">{description}</DialogDescription>
        <div className="py-3 flex-1">
          <CodeEditor
            value={code}
            onChange={(v) => setCode(v ?? "")}
            language="python"
            height={300}

            onCopy={() => {}}
            onLaunch={() => {}}
          />
        </div>
        <DialogFooter>
          {/* Footer can be used for additional buttons or information if needed */}
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Save Code</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PythonEditorModal;
