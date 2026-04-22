import type { UIMessageChunk } from "ai";

/**
 * Builds a `fetch`-compatible stub that responds with an AI SDK UI-message
 * stream assembled from a scripted sequence of chunks. Used by stories and
 * tests to exercise the AIAgent component without a real server.
 */
export function createMockFetch(
  buildChunks: (userText: string) => Array<UIMessageChunk | { __delayMs: number }>,
): typeof globalThis.fetch {
  return (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const body = typeof init?.body === "string" ? init.body : "";
    let userText = "";
    try {
      const parsed = JSON.parse(body) as {
        messages?: Array<{
          role: string;
          parts?: Array<{ type: string; text?: string }>;
        }>;
      };
      const lastUser = [...(parsed.messages ?? [])]
        .reverse()
        .find((m) => m.role === "user");
      userText =
        lastUser?.parts
          ?.filter((p) => p.type === "text")
          .map((p) => p.text ?? "")
          .join(" ") ?? "";
    } catch {
      userText = "";
    }

    const script = buildChunks(userText);
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        for (const step of script) {
          if ("__delayMs" in step) {
            await new Promise((resolve) => setTimeout(resolve, step.__delayMs));
            continue;
          }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(step)}\n\n`),
          );
          // Small gap so the consumer sees incremental deltas.
          await new Promise((resolve) => setTimeout(resolve, 16));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "x-vercel-ai-ui-message-stream": "v1",
      },
    });
  }) as typeof globalThis.fetch;
}

/** Text-only streaming response split into small deltas. */
export function scriptTextResponse(
  text: string,
  options: { chunkSize?: number; startDelayMs?: number } = {},
): Array<UIMessageChunk | { __delayMs: number }> {
  const { chunkSize = 3, startDelayMs = 0 } = options;
  const id = "text-1";
  const chunks: Array<UIMessageChunk | { __delayMs: number }> = [
    { type: "start", messageId: "assistant-1" },
    { type: "start-step" },
    { type: "text-start", id },
  ];
  if (startDelayMs > 0) chunks.push({ __delayMs: startDelayMs });
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push({
      type: "text-delta",
      id,
      delta: text.slice(i, i + chunkSize),
    });
  }
  chunks.push(
    { type: "text-end", id },
    { type: "finish-step" },
    { type: "finish" },
  );
  return chunks;
}

/** Response that invokes a tool, returns its output, and then a final answer. */
export function scriptToolResponse(opts: {
  toolName: string;
  input: unknown;
  output: unknown;
  answer: string;
}): Array<UIMessageChunk | { __delayMs: number }> {
  const toolCallId = "tool-1";
  const textId = "text-1";
  return [
    { type: "start", messageId: "assistant-1" },
    { type: "start-step" },
    {
      type: "tool-input-available",
      toolCallId,
      toolName: opts.toolName,
      input: opts.input,
    },
    { __delayMs: 200 },
    {
      type: "tool-output-available",
      toolCallId,
      output: opts.output,
    },
    { type: "finish-step" },
    { type: "start-step" },
    { type: "text-start", id: textId },
    { type: "text-delta", id: textId, delta: opts.answer },
    { type: "text-end", id: textId },
    { type: "finish-step" },
    { type: "finish" },
  ];
}

/**
 * Response that streams a reasoning block, cites a handful of sources, and
 * finally answers. Useful for exercising the AI Elements `Reasoning` and
 * `Sources` primitives.
 */
export function scriptReasoningResponse(opts: {
  reasoning: string;
  sources?: Array<{ url: string; title?: string }>;
  answer: string;
  chunkSize?: number;
}): Array<UIMessageChunk | { __delayMs: number }> {
  const { reasoning, sources = [], answer, chunkSize = 6 } = opts;
  const reasoningId = "reasoning-1";
  const textId = "text-1";
  const chunks: Array<UIMessageChunk | { __delayMs: number }> = [
    { type: "start", messageId: "assistant-1" },
    { type: "start-step" },
    { type: "reasoning-start", id: reasoningId },
  ];
  for (let i = 0; i < reasoning.length; i += chunkSize) {
    chunks.push({
      type: "reasoning-delta",
      id: reasoningId,
      delta: reasoning.slice(i, i + chunkSize),
    });
  }
  chunks.push({ type: "reasoning-end", id: reasoningId });
  sources.forEach((source, index) => {
    chunks.push({
      type: "source-url",
      sourceId: `source-${index + 1}`,
      url: source.url,
      title: source.title,
    });
  });
  chunks.push({ type: "text-start", id: textId });
  for (let i = 0; i < answer.length; i += chunkSize) {
    chunks.push({
      type: "text-delta",
      id: textId,
      delta: answer.slice(i, i + chunkSize),
    });
  }
  chunks.push(
    { type: "text-end", id: textId },
    { type: "finish-step" },
    { type: "finish" },
  );
  return chunks;
}

/** Response that errors mid-stream. */
export function scriptErrorResponse(errorText: string): Array<UIMessageChunk | { __delayMs: number }> {
  const id = "text-1";
  return [
    { type: "start", messageId: "assistant-1" },
    { type: "start-step" },
    { type: "text-start", id },
    { type: "text-delta", id, delta: "Let me look into that" },
    { __delayMs: 100 },
    { type: "error", errorText },
  ];
}
