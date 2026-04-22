import { useMemo } from "react";

import type { AIAgentProps } from "./AIAgent.types";

import { ChatInput } from "@/components/ai/ChatInput";
import { MessageList } from "@/components/ai/MessageList";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

/**
 * A self-contained chat UI for agentic experiences backed by the Vercel AI SDK.
 *
 * Consumers point it at a server endpoint that returns a UI-message stream
 * (see `ai`'s `toUIMessageStreamResponse`) and the component handles
 * streaming, tool-call rendering, error surfacing, and the input bar.
 *
 * @example
 * ```tsx
 * <AIAgent
 *   endpoint="/api/agent"
 *   systemPrompt="You are a lab-data analyst."
 *   model="claude-opus-4-7"
 *   headers={{ Authorization: `Bearer ${token}` }}
 * />
 * ```
 */
export function AIAgent({
  endpoint,
  systemPrompt,
  tools,
  model,
  headers,
  initialMessages,
  inputPlaceholder,
  showToolCalls = true,
  maxHeight = "600px",
  onMessageSubmit,
  onError,
  fetch: customFetch,
  className,
}: AIAgentProps) {
  const body = useMemo(() => {
    const extra: Record<string, unknown> = {};
    if (systemPrompt) extra.systemPrompt = systemPrompt;
    if (tools) extra.tools = tools;
    if (model) extra.model = model;
    return Object.keys(extra).length > 0 ? extra : undefined;
  }, [systemPrompt, tools, model]);

  const { messages, status, error, sendMessage, stop } = useChat({
    endpoint,
    headers,
    body,
    initialMessages,
    onError,
    fetch: customFetch,
  });

  const isStreaming = status === "streaming";
  const isSubmitted = status === "submitted";

  const handleSubmit = (value: string) => {
    onMessageSubmit?.(value);
    void sendMessage({ text: value });
  };

  return (
    <div
      data-slot="ai-agent"
      className={cn(
        "flex flex-col overflow-hidden rounded-shape-md border border-border bg-card text-card-foreground shadow-elevation-1",
        className,
      )}
    >
      <MessageList
        messages={messages}
        isStreaming={isStreaming}
        isSubmitted={isSubmitted}
        error={error}
        showToolCalls={showToolCalls}
        maxHeight={maxHeight}
        className="flex-1"
      />
      <ChatInput
        onSubmit={handleSubmit}
        onStop={() => void stop()}
        isStreaming={isStreaming || isSubmitted}
        placeholder={inputPlaceholder}
      />
    </div>
  );
}
