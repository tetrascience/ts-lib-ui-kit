import { Button } from "@atoms/Button";
import { Icon, IconName } from "@atoms/Icon";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nord } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import styled from "styled-components";

import type { HTMLAttributes, ClassAttributes } from "react";
import type { ExtraProps } from "react-markdown";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";

/** Copy feedback reset delay in milliseconds */
const COPY_FEEDBACK_DELAY_MS = 2000;

/** Props for the code component provided by react-markdown */
type CodeComponentProps = ClassAttributes<HTMLElement> &
  HTMLAttributes<HTMLElement> &
  ExtraProps & {
    inline?: boolean;
  };

const CodeText = styled.code`
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
  font-family: "Courier New", Courier, monospace;
  padding: 0.2em 0.4em;
  font-size: 85%;
`;

/** Alias for CodeComponentProps, exported for backwards compatibility */
export type CodeProps = CodeComponentProps;

/** Props for the MarkdownDisplay component */
export type MarkdownDisplayProps = {
  markdown: string;
  codeRenderer?: (props: CodeComponentProps) => React.ReactElement;
};

/** Default code block renderer used in MarkdownDisplay for inline and block code */
export const BasicCodeRenderer = ({
  inline,
  className,
  children,
  ...props
}: CodeComponentProps) => {
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : undefined;
  const codeString = String(children).replace(/\n$/, "");
  const [isCopied, setIsCopied] = useState(false);

  // Custom notification implementation without Ant Design
  const showMessage = (msg: string) => {
    console.log(msg);
    // In a real implementation, you would add a custom toast/notification here
  };

  // --- Async Function to Handle Copying ---
  const handleCopy = async () => {
    // Check if clipboard API is available
    if (!navigator.clipboard) {
      console.error("Clipboard API not available.");
      showMessage("Clipboard access not available or denied.");
      return;
    }
    try {
      // Write the code string to the clipboard
      await navigator.clipboard.writeText(codeString);
      // Update state to show feedback
      setIsCopied(true);
      showMessage("Code copied to clipboard!");
      // Reset the "Copied!" state after delay
      setTimeout(() => setIsCopied(false), COPY_FEEDBACK_DELAY_MS);
    } catch (err) {
      // Log error and show error message
      console.error("Failed to copy code: ", err);
      // Reset state even on error
      setIsCopied(false);
    }
  };

  return !inline && match ? (
    <div className="code-block-container">
      <div className="copy-button-wrapper">
        <Button
          size="small"
          leftIcon={<Icon name={IconName.COPY} />}
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
        >
          {isCopied ? "Copied!" : "Copy"}
        </Button>
      </div>

      {/* Using type assertion to avoid TypeScript errors */}
      {React.createElement(
        SyntaxHighlighter as unknown as React.ComponentType<SyntaxHighlighterProps>,
        {
          style: nord,
          language,
          PreTag: "div",
          children: codeString,
        }
      )}
    </div>
  ) : (
    <CodeText {...props}>{children}</CodeText>
  );
};

/** Renders a markdown string as formatted HTML with optional custom code block rendering */
export const MarkdownDisplay = ({ markdown, codeRenderer }: MarkdownDisplayProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        code: codeRenderer || BasicCodeRenderer, // Use the custom code renderer or the default one
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
};

export default MarkdownDisplay;
