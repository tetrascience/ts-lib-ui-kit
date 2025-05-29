import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";
import { nord } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import styled from "styled-components";
import { Button } from "@atoms/Button";
import { Icon, IconName } from "@atoms/Icon";

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

export type MarkdownDisplayProps = {
  markdown: string;
  codeRenderer?: ({
    inline,
    className,
    children,
    ...props
  }: CodeProps) => React.ReactElement;
};

// Define type for code component props explicitly for clarity
// (react-markdown doesn't export its internal types easily)
export type CodeProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node?: any; // The AST node for the code element
  inline?: boolean; // True if it's an inline code span (`)
  className?: string; // Class name (e.g., "language-js")
  children?: React.ReactNode; // The content of the code element (optional)
  // Include other potential props passed down by react-markdown/rehype-raw
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export const BasicCodeRenderer = ({
  inline,
  className,
  children,
  ...props
}: CodeProps) => {
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
