import { useEffect, useRef } from "react";

import { MessageBubble } from "./MessageBubble";
import { StreamingText } from "./StreamingText";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { ToolCallDisplay, type ToolCallState } from "./ToolCallDisplay";

import type { UIMessage } from "ai";

import { cn } from "@/lib/utils";

export interface MessageListProps {
  messages: UIMessage[];
  /** Whether a response is currently streaming (used to flag the last assistant part). */
  isStreaming?: boolean;
  /** Error surfaced from the chat hook. Rendered inline as the last item. */
  error?: Error;
  /** Whether to render tool-call panels. */
  showToolCalls?: boolean;
  /** Whether to render an inline thinking indicator when submitted but no tokens yet. */
  isSubmitted?: boolean;
  /** Max height of the scrollable container. */
  maxHeight?: string;
  className?: string;
}

type ToolLikePart = {
  type: string;
  toolCallId?: string;
  toolName?: string;
  state?: ToolCallState;
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

function getToolNameFromPart(part: ToolLikePart): string {
  if (part.toolName) return part.toolName;
  if (part.type.startsWith("tool-")) return part.type.slice("tool-".length);
  return "tool";
}

function isToolPart(type: string): boolean {
  return type === "dynamic-tool" || type.startsWith("tool-");
}

/**
 * Scrollable chat history. Auto-scrolls to the bottom when new content
 * arrives. Handles text, reasoning, and tool parts from AI SDK UI messages.
 */
export function MessageList({
  messages,
  isStreaming = false,
  error,
  showToolCalls = true,
  isSubmitted = false,
  maxHeight = "600px",
  className,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isStreaming, isSubmitted, error]);

  const lastAssistantIndex = [...messages]
    .map((m) => m.role)
    .lastIndexOf("assistant");

  return (
    <div
      data-slot="ai-message-list"
      className={cn(
        "flex flex-col gap-sp-sm overflow-y-auto p-sp-md",
        className,
      )}
      style={{ maxHeight }}
    >
      {messages.map((message, messageIndex) => {
        const role = message.role === "system" ? "system" : message.role;
        const isLastAssistant =
          message.role === "assistant" && messageIndex === lastAssistantIndex;

        return (
          <MessageBubble key={message.id} messageRole={role}>
            {message.parts.map((part, partIndex) => {
              const key = `${message.id}-${partIndex}`;
              if (part.type === "text") {
                const isLastTextPart = partIndex === message.parts.length - 1;
                return (
                  <StreamingText
                    key={key}
                    text={part.text}
                    streaming={
                      isStreaming && isLastAssistant && isLastTextPart
                    }
                    markdown={message.role === "assistant"}
                  />
                );
              }
              if (part.type === "reasoning") {
                return (
                  <div
                    key={key}
                    className="rounded-shape-xs border border-border/60 bg-muted/60 px-sp-xs py-1 text-body-sm text-muted-foreground italic"
                  >
                    {part.text}
                  </div>
                );
              }
              if (isToolPart(part.type) && showToolCalls) {
                const toolPart = part as unknown as ToolLikePart;
                return (
                  <ToolCallDisplay
                    key={key}
                    name={getToolNameFromPart(toolPart)}
                    state={toolPart.state ?? "input-available"}
                    input={toolPart.input}
                    output={toolPart.output}
                    errorText={toolPart.errorText}
                  />
                );
              }
              return null;
            })}
          </MessageBubble>
        );
      })}

      {isSubmitted && !isStreaming && (
        <MessageBubble messageRole="assistant">
          <ThinkingIndicator />
        </MessageBubble>
      )}

      {error && (
        <MessageBubble messageRole="error">
          <div className="text-body-md">
            <div className="font-medium">Something went wrong</div>
            <div className="text-body-sm opacity-90">{error.message}</div>
          </div>
        </MessageBubble>
      )}

      <div ref={endRef} aria-hidden />
    </div>
  );
}
