import { SendHorizontal } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TetraScienceIcon as TetrascienceIcon } from "@/components/ui/tetrascience-icon";
import { Textarea } from "@/components/ui/textarea";

export interface AssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  prompt: string;
  initialCode?: string;
  userQuery?: string;
  onUserQueryChange?: (value: string) => void;
  onCopy: (code: string) => void;
  onLaunch: (code: string) => void;
  onSend: (input: string) => void;
  onCancel?: () => void;
}

const AssistantModal: React.FC<AssistantModalProps> = ({
  open,
  onOpenChange,
  title,
  prompt,
  initialCode = "",
  userQuery = "",
  onUserQueryChange,
  onCopy,
  onLaunch,
  onSend,
}) => {
  const [code, setCode] = useState<string>(initialCode);
  const [input, setInput] = useState<string>("");
  const [localUserQuery, setLocalUserQuery] = useState<string>(userQuery);

  React.useEffect(() => {
    setLocalUserQuery(userQuery);
  }, [userQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TetrascienceIcon fill="var(--primary)" />
              <span className="font-semibold text-xl">{title}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 py-6 text-sm font-normal leading-5">{prompt}</div>
          <div className="mx-6 shadow-sm rounded-lg">
            <Textarea
              value={localUserQuery}
              onChange={(e) => {
                setLocalUserQuery(e.target.value);
                if (onUserQueryChange) onUserQueryChange(e.target.value);
              }}
              rows={2}
              placeholder="Type your question here..."
            />
          </div>
          <div className="px-6 pt-6 pb-0 flex-1">
            <div className="rounded-[20px] overflow-hidden bg-[var(--primary)] min-h-[200px] relative">
              <CodeEditor
                value={code}
                onChange={(v) => setCode(v ?? "")}
                language="python"

                height={200}
                onCopy={onCopy}
                onLaunch={onLaunch}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 pt-4 pb-6 rounded-bl-[20px] rounded-br-[20px]">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask us anything related to your work..."
              onKeyDown={(e) => {
                if (e.key === "Enter") onSend(input);
              }}
            />
            <Button className="min-w-[100px] flex items-center gap-[6px]" variant="default" onClick={() => onSend(input)}>
              <SendHorizontal />
              Send
            </Button>
          </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssistantModal;
