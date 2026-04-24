import { CopyIcon, GlobeIcon, RefreshCcwIcon } from "lucide-react"
import { useCallback, useId, useState } from "react"

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai/conversation"
import {
  Message,
  MessageAction,
  MessageActions,
  MessageBranch,
  MessageBranchContent,
  MessageBranchNext,
  MessageBranchPage,
  MessageBranchPrevious,
  MessageBranchSelector,
  MessageContent,
  MessageResponse,
  MessageToolbar,
} from "@/components/ai/message"
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai/prompt-input"
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai/reasoning"
import { Source, Sources, SourcesContent, SourcesTrigger } from "@/components/ai/sources"
import { StreamStatus } from "@/components/ai/stream-status"
import { Suggestion, Suggestions } from "@/components/ai/suggestion"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChatSource {
  href: string
  title: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  /** Displayed in a collapsible Reasoning panel above the message content. */
  reasoning?: string
  /** Web sources used to produce this message. */
  sources?: ChatSource[]
  /** Multiple alternative responses (for branching). When provided, the
   *  array should include `content` as one of its items. */
  branches?: string[]
}

export interface ChatModel {
  id: string
  name: string
}

export interface ChatProps {
  /** Initial messages to pre-populate the conversation. */
  initialMessages?: ChatMessage[]
  /** Available models shown in the model-selector dropdown. */
  models?: ChatModel[]
  /** Initial model id. Defaults to the first model in `models`. */
  defaultModel?: string
  /** Suggestion chips shown when the conversation is empty. */
  suggestions?: string[]
  /** Called when the user submits a message. The returned string (if any)
   *  will be appended as the assistant's reply. Defaults to a no-op. */
  onSend?: (message: string, model: string) => Promise<string | undefined> | string | undefined
  className?: string
}

// ---------------------------------------------------------------------------
// Default values
// ---------------------------------------------------------------------------

const DEFAULT_MODELS: ChatModel[] = [
  { id: "claude-sonnet-4-6", name: "Claude Sonnet" },
  { id: "claude-opus-4-7", name: "Claude Opus" },
]

const DEFAULT_SUGGESTIONS = [
  "Explain quantum entanglement simply",
  "Write a Python script to rename files",
  "Summarise the latest AI research trends",
  "What is the difference between TCP and UDP?",
]

let _idCounter = 0
const nextId = () => {
  _idCounter += 1
  return `chat-msg-${_idCounter}`
}

const STREAM_STATUS_LINGER_MS = 3000

// ---------------------------------------------------------------------------
// Chat component
// ---------------------------------------------------------------------------

export const Chat = ({
  initialMessages = [],
  models = DEFAULT_MODELS,
  defaultModel,
  suggestions = DEFAULT_SUGGESTIONS,
  onSend,
  className,
}: ChatProps) => {
  const labelId = useId()
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [text, setText] = useState("")
  const [model, setModel] = useState(defaultModel ?? models[0]?.id ?? "")
  const [webSearch, setWebSearch] = useState(false)
  const [status, setStatus] = useState<"ready" | "streaming">("ready")
  const [streamStart, setStreamStart] = useState<Date | undefined>()

  const handleSubmit = useCallback(
    async (_msg: PromptInputMessage) => {
      const trimmed = text.trim()
      if (!trimmed || status === "streaming") return

      const userMsg: ChatMessage = { id: nextId(), role: "user", content: trimmed }
      setMessages((prev) => [...prev, userMsg])
      setText("")
      setStatus("streaming")
      setStreamStart(new Date())

      try {
        const reply = await onSend?.(trimmed, model)
        const assistantMsg: ChatMessage = {
          id: nextId(),
          role: "assistant",
          content: reply ?? "I received your message.",
        }
        setMessages((prev) => [...prev, assistantMsg])
      } finally {
        setStatus("ready")
        // Keep streamStart briefly so the bubble-confirm ripple can play out
        setTimeout(() => setStreamStart(undefined), STREAM_STATUS_LINGER_MS)
      }
    },
    [text, status, model, onSend]
  )

  const handleSuggestion = useCallback((suggestion: string) => {
    setText(suggestion)
  }, [])

  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content).catch(() => {})
  }, [])

  const handleRetry = useCallback((id: string) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === id)
      if (idx === -1) return prev
      return prev.slice(0, idx)
    })
  }, [])

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Conversation */}
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              description="Send a message or pick a suggestion below to start."
              title="Start a conversation"
            />
          ) : null}

          {messages.map((msg) => (
            <div className="space-y-1" key={msg.id}>
              {/* Branch wrapper — renders alt responses side-by-side when branches exist */}
              {msg.role === "assistant" && msg.branches && msg.branches.length > 1 ? (
                <MessageBranch>
                  <MessageBranchContent>
                    {msg.branches.map((branch, i) => (
                      <AssistantMessage
                        key={i}
                        content={branch}
                        id={msg.id}
                        onCopy={handleCopy}
                        onRetry={handleRetry}
                        reasoning={i === 0 ? msg.reasoning : undefined}
                        sources={i === 0 ? msg.sources : undefined}
                      />
                    ))}
                  </MessageBranchContent>
                  <MessageToolbar>
                    <MessageBranchSelector>
                      <MessageBranchPrevious />
                      <MessageBranchPage />
                      <MessageBranchNext />
                    </MessageBranchSelector>
                  </MessageToolbar>
                </MessageBranch>
              ) : msg.role === "assistant" ? (
                <>
                  <AssistantMessage
                    content={msg.content}
                    id={msg.id}
                    onCopy={handleCopy}
                    onRetry={handleRetry}
                    reasoning={msg.reasoning}
                    sources={msg.sources}
                  />
                </>
              ) : (
                <Message from="user">
                  <MessageContent>
                    <MessageResponse>{msg.content}</MessageResponse>
                  </MessageContent>
                </Message>
              )}
            </div>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Suggestions — only shown when conversation is empty */}
      {messages.length === 0 && suggestions.length > 0 && (
        <div className="px-4 pb-2">
          <Suggestions>
            {suggestions.map((s) => (
              <Suggestion key={s} onClick={handleSuggestion} suggestion={s} />
            ))}
          </Suggestions>
        </div>
      )}

      {/* Stream status — visible while generating (and briefly after for the confirm ripple) */}
      {streamStart && (
        <div className="px-4 pb-1">
          <StreamStatus
            iconVariant="loader-circle"
            isStreaming={status === "streaming"}
            startTime={streamStart}
          />
        </div>
      )}

      {/* Prompt input */}
      <div className="border-t px-4 pt-3 pb-4">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              aria-labelledby={labelId}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask anything..."
              value={text}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              {/* Model selector */}
              {models.length > 1 && (
                <PromptInputSelect onValueChange={setModel} value={model}>
                  <PromptInputSelectTrigger>
                    <PromptInputSelectValue />
                  </PromptInputSelectTrigger>
                  <PromptInputSelectContent>
                    {models.map((m) => (
                      <PromptInputSelectItem key={m.id} value={m.id}>
                        {m.name}
                      </PromptInputSelectItem>
                    ))}
                  </PromptInputSelectContent>
                </PromptInputSelect>
              )}

              {/* Web search toggle */}
              <PromptInputButton
                onClick={() => setWebSearch((v) => !v)}
                tooltip={{ content: "Search the web" }}
                variant={webSearch ? "default" : "ghost"}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
            </PromptInputTools>

            <PromptInputSubmit disabled={!text.trim()} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Internal sub-component for assistant messages
// ---------------------------------------------------------------------------

interface AssistantMessageProps {
  id: string
  content: string
  reasoning?: string
  sources?: ChatSource[]
  onCopy: (content: string) => void
  onRetry: (id: string) => void
}

const AssistantMessage = ({
  id,
  content,
  reasoning,
  sources,
  onCopy,
  onRetry,
}: AssistantMessageProps) => (
  <div className="space-y-2">
    {reasoning && (
      <Reasoning>
        <ReasoningTrigger />
        <ReasoningContent>{reasoning}</ReasoningContent>
      </Reasoning>
    )}

    {sources && sources.length > 0 && (
      <Sources>
        <SourcesTrigger count={sources.length} />
        <SourcesContent>
          {sources.map((s) => (
            <Source href={s.href} key={s.href} title={s.title} />
          ))}
        </SourcesContent>
      </Sources>
    )}

    <Message from="assistant">
      <MessageContent>
        <MessageResponse>{content}</MessageResponse>
      </MessageContent>
    </Message>

    <MessageActions>
      <MessageAction label="Copy" onClick={() => onCopy(content)}>
        <CopyIcon className="size-3" />
      </MessageAction>
      <MessageAction label="Retry" onClick={() => onRetry(id)}>
        <RefreshCcwIcon className="size-3" />
      </MessageAction>
    </MessageActions>
  </div>
)
