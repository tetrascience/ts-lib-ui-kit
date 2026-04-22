import { describe, expect, it } from "vitest";

import {
  createMockFetch,
  scriptErrorResponse,
  scriptTextResponse,
  scriptToolResponse,
} from "./AIAgent.mocks";

async function readAllText(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let out = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    out += decoder.decode(value, { stream: true });
  }
  out += decoder.decode();
  return out;
}

describe("scriptTextResponse", () => {
  it("emits start / text-delta / finish chunks in order", () => {
    const chunks = scriptTextResponse("hello", { chunkSize: 2 }).filter(
      (c): c is Exclude<typeof c, { __delayMs: number }> => !("__delayMs" in c),
    );
    expect(chunks[0].type).toBe("start");
    expect(chunks[1].type).toBe("start-step");
    expect(chunks[2].type).toBe("text-start");
    expect(chunks.at(-1)?.type).toBe("finish");

    const deltas = chunks.filter((c) => c.type === "text-delta") as Array<{
      type: "text-delta";
      delta: string;
    }>;
    expect(deltas.map((d) => d.delta).join("")).toBe("hello");
  });
});

describe("scriptToolResponse", () => {
  it("emits tool-input-available followed by tool-output-available", () => {
    const chunks = scriptToolResponse({
      toolName: "search",
      input: { q: "x" },
      output: { hits: 1 },
      answer: "done",
    });
    const types = chunks
      .filter((c): c is Exclude<typeof c, { __delayMs: number }> => !("__delayMs" in c))
      .map((c) => c.type);
    expect(types).toContain("tool-input-available");
    expect(types.indexOf("tool-input-available")).toBeLessThan(
      types.indexOf("tool-output-available"),
    );
  });
});

describe("scriptErrorResponse", () => {
  it("ends with an error chunk carrying the message", () => {
    const chunks = scriptErrorResponse("boom").filter(
      (c): c is Exclude<typeof c, { __delayMs: number }> => !("__delayMs" in c),
    );
    const last = chunks.at(-1);
    expect(last?.type).toBe("error");
    if (last?.type === "error") {
      expect(last.errorText).toBe("boom");
    }
  });
});

describe("createMockFetch", () => {
  it("writes scripted chunks to the response stream in SSE format", async () => {
    const fetch = createMockFetch(() =>
      scriptTextResponse("hi", { chunkSize: 1 }),
    );
    const res = await fetch("/api/agent", {
      method: "POST",
      body: JSON.stringify({ messages: [] }),
    });
    expect(res.headers.get("Content-Type")).toContain("text/event-stream");
    const body = await readAllText(res.body!);
    expect(body).toContain("data: ");
    expect(body).toContain('"type":"text-delta"');
    expect(body).toContain('"delta":"h"');
    expect(body).toContain("[DONE]");
  });

  it("surfaces the latest user message text to the script builder", async () => {
    const seen: string[] = [];
    const fetch = createMockFetch((text) => {
      seen.push(text);
      return scriptTextResponse("ok");
    });
    await fetch("/api/agent", {
      method: "POST",
      body: JSON.stringify({
        messages: [
          { role: "user", parts: [{ type: "text", text: "first" }] },
          {
            role: "assistant",
            parts: [{ type: "text", text: "intermediate" }],
          },
          { role: "user", parts: [{ type: "text", text: "second" }] },
        ],
      }),
    });
    expect(seen).toEqual(["second"]);
  });
});
