import { Button } from "@atoms/Button";
import { CodeEditor } from "@atoms/CodeEditor";
import { Icon, IconName } from "@atoms/Icon";
import { Input } from "@atoms/Input";
import React, { useState } from "react";
import styled from "styled-components";

/** Props for the AssistantModal component */
export interface AssistantModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Title displayed in the modal header */
  title: string;
  /** Prompt text displayed above the query area */
  prompt: string;
  /** Initial code to populate the code editor with */
  initialCode?: string;
  /** The user's current query text */
  userQuery?: string;
  /** Callback fired when the user query text changes */
  onUserQueryChange?: (value: string) => void;
  /** Callback fired when the user copies code from the editor */
  onCopy: (code: string) => void;
  /** Callback fired when the user launches the code */
  onLaunch: (code: string) => void;
  /** Callback fired when the user sends a message */
  onSend: (input: string) => void;
  /** Callback fired when the modal is cancelled or closed */
  onCancel: () => void;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--black-100);
  z-index: 1300;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContainer = styled.div`
  background: var(--white-900);
  border-radius: 20px;
  box-shadow: 0 2px 16px var(--black-100);
  min-width: 600px;
  max-width: 90vw;
  min-height: 500px;
  padding: 0;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0 24px;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Title = styled.span`
  font-weight: 600;
  font-size: 20px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
`;

const PromptText = styled.div`
  padding: 24px;

  color: var(--black-900);
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
`;

const QueryContainer = styled.div`
  margin: 0 24px;
  background: var(--blue-900);
  color: var(--white-900);
  border-radius: 12px;
  padding: 0;
  font-size: 16px;
  font-weight: 500;
  word-break: break-word;
  box-shadow: 0 1px 4px var(--black-50);
`;

const QueryTextarea = styled.textarea`
  width: 100%;
  min-height: 48px;
  background: transparent;
  color: var(--white-900);
  border: none;
  outline: none;
  resize: vertical;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  padding: 16px 20px;
  border-radius: 12px;
  box-sizing: border-box;
`;

const EditorContainer = styled.div`
  padding: 24px;
  padding-bottom: 0;
  flex: 1;
`;

const EditorWrapper = styled.div`
  border-radius: 20px;
  overflow: hidden;
  background: var(--blue-900);
  min-height: 200px;
  position: relative;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px;
  padding-top: 16px;
  background: var(--white-900);
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`;

const SendButton = styled(Button)`
  min-width: 100px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

/** A modal dialog providing an AI assistant interface with code editing and query support */
export const AssistantModal: React.FC<AssistantModalProps> = ({
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

  if (!open) return null;

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <TitleWrapper>
            <Icon name={IconName.TETRASCIENCE_ICON} fill="var(--blue-600)" />
            <Title>{title}</Title>
          </TitleWrapper>
          <CloseButton onClick={onCancel}>
            <Icon
              name={IconName.CLOSE}
              width="20"
              height="20"
              fill="var(--black-900)"
            />
          </CloseButton>
        </ModalHeader>
        <PromptText>{prompt}</PromptText>
        <QueryContainer>
          <QueryTextarea
            value={localUserQuery}
            onChange={(e) => {
              setLocalUserQuery(e.target.value);
              if (onUserQueryChange) onUserQueryChange(e.target.value);
            }}
            rows={2}
            placeholder="Type your question here..."
          />
        </QueryContainer>
        <EditorContainer>
          <EditorWrapper>
            <CodeEditor
              value={code}
              onChange={(v) => setCode(v ?? "")}
              language="python"
              theme="dark"
              height={200}
              onCopy={onCopy}
              onLaunch={onLaunch}
            />
          </EditorWrapper>
        </EditorContainer>
        <InputContainer>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask us anything related to your work..."
            size="small"
            onKeyDown={(e) => {
              if (e.key === "Enter") onSend(input);
            }}
          />
          <SendButton variant="primary" onClick={() => onSend(input)}>
            <Icon name={IconName.PAPER_PLANE} />
            Send
          </SendButton>
        </InputContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default AssistantModal;
