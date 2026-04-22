import { Send, Square } from "lucide-react";
import { useState, type FormEvent, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface ChatInputProps {
  /** Called with the trimmed text when the user submits a message. */
  onSubmit: (value: string) => void;
  /** Called when the user clicks the stop button during a streaming response. */
  onStop?: () => void;
  /** Whether the model is currently producing a response. */
  isStreaming?: boolean;
  /** Whether the input should be disabled (e.g. no endpoint configured). */
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * Auto-sizing textarea + send button. Enter submits; Shift+Enter inserts a newline.
 */
export function ChatInput({
  onSubmit,
  onStop,
  isStreaming = false,
  disabled = false,
  placeholder = "Ask the agent anything…",
  className,
}: ChatInputProps) {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSubmit(trimmed);
    setValue("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  const canSend = value.trim().length > 0 && !isStreaming && !disabled;

  return (
    <form
      data-slot="ai-chat-input"
      onSubmit={handleSubmit}
      className={cn(
        "flex items-end gap-sp-xs border-t border-border bg-background p-sp-sm",
        className,
      )}
    >
      <Textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        aria-label="Message"
        className="min-h-9 max-h-40 resize-none"
      />
      {isStreaming && onStop ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Stop generating"
          onClick={onStop}
        >
          <Square className="size-3.5" aria-hidden />
        </Button>
      ) : (
        <Button
          type="submit"
          size="icon"
          aria-label="Send message"
          disabled={!canSend}
        >
          <Send className="size-3.5" aria-hidden />
        </Button>
      )}
    </form>
  );
}
