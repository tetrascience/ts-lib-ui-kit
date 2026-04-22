import { GlobeIcon, MicIcon } from "lucide-react";
import { Fragment, useState } from "react";

import type { SourceUrlUIPart, UIMessage } from "ai";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import { useChat } from "@/hooks/useChat";

export interface ChatbotExampleProps {
  endpoint: string;
  fetch?: typeof globalThis.fetch;
  initialMessages?: UIMessage[];
  models?: ReadonlyArray<{ id: string; label: string }>;
}

const DEFAULT_MODELS: ReadonlyArray<{ id: string; label: string }> = [
  { id: "claude-opus-4-7", label: "Claude Opus 4.7" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
  { id: "gpt-5", label: "GPT-5" },
];

/**
 * Mirrors the Vercel AI SDK Elements "Chatbot" example, adapted to
 * TetraScience primitives. Uses the AI Elements Conversation, Message,
 * Reasoning, Sources, PromptInput, and Loader components and wires them
 * to the shared `useChat` hook.
 */
export function ChatbotExample({
  endpoint,
  fetch: customFetch,
  initialMessages,
  models = DEFAULT_MODELS,
}: ChatbotExampleProps) {
  const [selectedModel] = useState(models[0]?.id);
  const [webSearch, setWebSearch] = useState(false);

  const { messages, status, sendMessage } = useChat({
    endpoint,
    initialMessages,
    body: { model: selectedModel, webSearch },
    fetch: customFetch,
  });

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);
    if (!(hasText || hasAttachments)) return;

    void sendMessage({
      text: message.text ?? "Sent with attachments",
      files: message.files,
    });
  };

  return (
    <div className="relative flex size-full min-h-[560px] flex-col">
      <Conversation>
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              title="How can I help?"
              description="Start the conversation by sending a message below."
            />
          ) : (
            messages.map((message) => {
              const sourceParts = message.parts.filter(
                (part): part is SourceUrlUIPart => part.type === "source-url",
              );
              return (
                <Fragment key={message.id}>
                  {message.role === "assistant" && sourceParts.length > 0 && (
                    <Sources>
                      <SourcesTrigger count={sourceParts.length} />
                      <SourcesContent>
                        {sourceParts.map((part, index) => (
                          <Source
                            href={part.url}
                            key={`${message.id}-src-${index}`}
                            title={part.title ?? part.url}
                          />
                        ))}
                      </SourcesContent>
                    </Sources>
                  )}

                  {message.parts.map((part, partIndex) => {
                    const key = `${message.id}-${partIndex}`;
                    if (part.type === "text") {
                      return (
                        <Message from={message.role} key={key}>
                          <MessageContent>
                            <MessageResponse>{part.text}</MessageResponse>
                          </MessageContent>
                        </Message>
                      );
                    }
                    if (part.type === "reasoning") {
                      const isLastPart =
                        partIndex === message.parts.length - 1;
                      return (
                        <Reasoning
                          className="w-full"
                          isStreaming={
                            status === "streaming" &&
                            isLastPart &&
                            message.id === messages[messages.length - 1]?.id
                          }
                          key={key}
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    }
                    return null;
                  })}
                </Fragment>
              );
            })
          )}
          {status === "submitted" && <Loader />}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput
        accept="image/*"
        className="mt-sp-sm"
        globalDrop
        multiple
        onSubmit={handleSubmit}
      >
        <PromptInputBody>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
          <PromptInputTextarea placeholder="Ask me anything…" />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            <PromptInputButton
              aria-label="Toggle web search"
              onClick={() => setWebSearch((current) => !current)}
              variant={webSearch ? "default" : "ghost"}
            >
              <GlobeIcon size={16} />
              <span>Search</span>
            </PromptInputButton>
            <PromptInputButton aria-label="Voice input" variant="ghost">
              <MicIcon size={16} />
            </PromptInputButton>
          </PromptInputTools>
          <PromptInputSubmit
            status={
              status === "streaming"
                ? "streaming"
                : status === "submitted"
                  ? "submitted"
                  : undefined
            }
          />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
