import React, { useState, HTMLAttributes, ClassAttributes } from "react";
import ReactMarkdown, { ExtraProps } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";
import { nord } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import styled from "styled-components";
import { Button } from "@atoms/Button";
import { Icon, IconName } from "@atoms/Icon";

// Type for code component props from react-markdown
type CodeComponentProps = ClassAttributes<HTMLElement> &
  HTMLAttributes<HTMLElement> &
  ExtraProps & {
    inline?: boolean;
  };

// Styled components to replace Ant Design components
const StyledSpace = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const CodeText = styled.code`
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
  font-family: "Courier New", Courier, monospace;
  padding: 0.2em 0.4em;
  font-size: 85%;
`;

// Export CodeProps as an alias for backwards compatibility
export type CodeProps = CodeComponentProps;

export type MarkdownDisplayProps = {
  markdown: string;
  codeRenderer?: (props: CodeComponentProps) => React.ReactElement;
};

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
      // Reset the "Copied!" state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      // Log error and show error message
      console.error("Failed to copy code: ", err);
      // Reset state even on error
      setIsCopied(false);
    }
  };

  return !inline && match ? (
    <div style={{ position: "relative", marginBottom: "1em" }}>
      <StyledSpace
        style={{
          position: "absolute",
          top: 8, // Pixels from top
          right: 8,
          zIndex: 1, // Ensure button is above highlighter background
        }}
      >
        <Button
          size="small" // Use a small button
          leftIcon={<Icon name={IconName.COPY} />}
          onClick={handleCopy} // Attach the copy handler
          style={{
            opacity: 0.7, // Slightly transparent until hover
            transition: "opacity 0.2s ease-in-out", // Smooth opacity transition
          }}
          // Increase opacity on hover using inline event handlers
          // (Could also be done with CSS and parent hover state)
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
          aria-label="Copy code to clipboard" // Accessibility label
        >
          {isCopied ? "Copied!" : "Copy"} {/* Conditional button text */}
        </Button>
      </StyledSpace>

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

const MarkdownDisplay = ({ markdown, codeRenderer }: MarkdownDisplayProps) => {
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
