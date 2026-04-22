import { useChat as useAiSdkChat, type UseChatHelpers } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useMemo } from "react";

export interface UseChatOptions {
  /** API endpoint that accepts POST with `{ messages }` and returns a UI-message stream. */
  endpoint: string;
  /** Extra headers sent with every request. */
  headers?: Record<string, string>;
  /** Extra body fields merged into every request (system prompt, tools, model, etc.). */
  body?: Record<string, unknown>;
  /** Messages to seed the chat history with. */
  initialMessages?: UIMessage[];
  /** Callback fired when the stream finishes cleanly. */
  onFinish?: () => void;
  /** Callback fired when an error occurs. */
  onError?: (error: Error) => void;
  /** Optional custom fetch — mainly for tests and Storybook mocks. */
  fetch?: typeof globalThis.fetch;
}

export type UseChatReturn = UseChatHelpers<UIMessage>;

/**
 * TetraScience-flavoured wrapper around `@ai-sdk/react`'s `useChat`.
 *
 * It wires up a `DefaultChatTransport` with the caller's endpoint, headers,
 * and body — which is what downstream data-apps need 99% of the time. Drop
 * down to the raw AI SDK hook if you need more control.
 */
export function useChat({
  endpoint,
  headers,
  body,
  initialMessages,
  onFinish,
  onError,
  fetch: customFetch,
}: UseChatOptions): UseChatReturn {
  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: endpoint,
        headers,
        body,
        fetch: customFetch,
      }),
    [endpoint, headers, body, customFetch],
  );

  return useAiSdkChat<UIMessage>({
    transport,
    messages: initialMessages,
    onFinish: onFinish ? () => onFinish() : undefined,
    onError,
  });
}
