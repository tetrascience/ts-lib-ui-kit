import React, { useState } from "react";
import { Button } from "@atoms/Button";
import { CodeEditor } from "@atoms/CodeEditor";
import { Icon, IconName } from "@atoms/Icon";
import { Input } from "@atoms/Input";
import { Modal } from "@atoms/Modal";
import "./AssistantModal.scss";

interface AssistantModalProps {
  open: boolean;
  title: string;
  prompt: string;
  initialCode?: string;
  userQuery?: string;
  onUserQueryChange?: (value: string) => void;
  onCopy: (code: string) => void;
  onLaunch: (code: string) => void;
  onSend: (input: string) => void;
  onCancel: () => void;
}

const AssistantModal: React.FC<AssistantModalProps> = ({
  open,
  title,
  prompt,
  initialCode = "",
  userQuery = "",
  onUserQueryChange,
  onCopy,
  onLaunch,
  onSend,
  onCancel,
}) => {
  const [code, setCode] = useState<string>(initialCode);
  const [input, setInput] = useState<string>("");
  const [localUserQuery, setLocalUserQuery] = useState<string>(userQuery);

  React.useEffect(() => {
    setLocalUserQuery(userQuery);
  }, [userQuery]);

  const handleSend = () => {
    onSend(input);
    setInput("");
  };

  return (
    <Modal
      isOpen={open}
      onClose={onCancel}
      onConfirm={handleSend}
      onConfirmLabel="Send"
      onCloseLabel="Cancel"
      title={title}
      width="650px"
      className="assistant-modal"
    >
      <div className="assistant-modal__content">
        <div className="assistant-modal__prompt-text">{prompt}</div>
        <div className="assistant-modal__query-container">
          <textarea
            className="assistant-modal__query-textarea"
            value={localUserQuery}
            onChange={(e) => {
              setLocalUserQuery(e.target.value);
              if (onUserQueryChange) onUserQueryChange(e.target.value);
            }}
            rows={2}
            placeholder="Type your question here..."
          />
        </div>
        <div className="assistant-modal__editor-container">
          <div className="assistant-modal__editor-wrapper">
            <CodeEditor
              value={code}
              onChange={(v) => setCode(v ?? "")}
              language="python"
              theme="dark"
              height={200}
              onCopy={onCopy}
              onLaunch={onLaunch}
            />
          </div>
        </div>
        <div className="assistant-modal__input-container">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask us anything related to your work..."
            size="small"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <Button
            variant="primary"
            onClick={handleSend}
            className="assistant-modal__send-button"
          >
            <Icon name={IconName.PAPER_PLANE} />
            Send
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export { AssistantModal };
export type { AssistantModalProps };
