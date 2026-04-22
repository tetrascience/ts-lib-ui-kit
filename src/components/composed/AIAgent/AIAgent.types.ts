import type { UIMessage } from "ai";

/**
 * A minimal tool shape used purely for display metadata.
 * The real execution happens on the server — the component only needs
 * to know the tool's name and optional description/schema to render it.
 */
export interface AgentToolDefinition {
  description?: string;
  inputSchema?: unknown;
}

export interface AIAgentProps {
  /** API endpoint that accepts POST with `{ messages }` and returns an AI SDK UI-message stream. */
  endpoint: string;

  /** Optional initial system prompt. Forwarded to the server in the request body. */
  systemPrompt?: string;

  /** Tool definitions available to the agent. Forwarded to the server in the request body. */
  tools?: Record<string, AgentToolDefinition>;

  /** Model identifier override (e.g. `claude-opus-4-7`, `gpt-4o`). Forwarded in the request body. */
  model?: string;

  /** Optional credential/auth headers injected into every fetch call. */
  headers?: Record<string, string>;

  /** Messages to seed the chat history with. */
  initialMessages?: UIMessage[];

  /** Placeholder text for the input bar. */
  inputPlaceholder?: string;

  /** Whether to show tool call details in the UI. */
  showToolCalls?: boolean;

  /** Max height of the message list before scrolling. */
  maxHeight?: string;

  /** Callback fired when a user message is submitted. */
  onMessageSubmit?: (message: string) => void;

  /** Callback fired when an error occurs. */
  onError?: (error: Error) => void;

  /**
   * Optional custom fetch implementation — mainly for tests and Storybook.
   * When provided, it is used by the AI SDK transport instead of the global `fetch`.
   */
  fetch?: typeof globalThis.fetch;

  /** Additional className for the root container. */
  className?: string;
}

export type AgentMessage = UIMessage;
