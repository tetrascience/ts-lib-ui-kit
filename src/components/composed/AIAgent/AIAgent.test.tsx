import { act } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AIAgent } from "./AIAgent";
import {
  createMockFetch,
  scriptErrorResponse,
  scriptTextResponse,
  scriptToolResponse,
} from "./AIAgent.mocks";

const flushAll = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(
  HTMLTextAreaElement.prototype,
  "value",
)!.set!;

function setTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  nativeTextareaValueSetter.call(textarea, value);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

describe("AIAgent", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    // jsdom doesn't implement scrollIntoView.
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    flushSync(() => root.unmount());
    container.remove();
  });

  const render = (node: React.ReactElement) => {
    flushSync(() => root.render(node));
  };

  it("renders the chat input and send button", () => {
    render(<AIAgent endpoint="/api/agent" fetch={createMockFetch(() => [])} />);
    expect(container.querySelector('[data-slot="ai-agent"]')).not.toBeNull();
    expect(
      container.querySelector<HTMLButtonElement>('button[aria-label="Send message"]'),
    ).not.toBeNull();
    expect(
      container.querySelector<HTMLTextAreaElement>("textarea"),
    ).not.toBeNull();
  });

  it("disables the send button when the textarea is empty", () => {
    render(<AIAgent endpoint="/api/agent" fetch={createMockFetch(() => [])} />);
    const button = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Send message"]',
    );
    expect(button?.disabled).toBe(true);
  });

  it("calls fetch with the configured endpoint when a message is sent", async () => {
    const fetch = vi.fn(
      createMockFetch((text) => scriptTextResponse(`echo: ${text}`)),
    );
    render(<AIAgent endpoint="/api/agent-custom" fetch={fetch} />);

    const textarea = container.querySelector<HTMLTextAreaElement>("textarea")!;
    const button = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Send message"]',
    )!;

    act(() => { setTextareaValue(textarea, "hello world"); });
    await flushAll();

    act(() => {
      button.click();
    });
    await flushAll();

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = fetch.mock.calls[0];
    expect(String(url)).toContain("/api/agent-custom");
    expect(init?.method).toBe("POST");
    const parsed = JSON.parse(String(init?.body ?? "{}")) as {
      messages: Array<{ role: string; parts: Array<{ text?: string }> }>;
    };
    const lastUser = [...parsed.messages].reverse().find((m) => m.role === "user");
    expect(lastUser?.parts[0]?.text).toBe("hello world");
  });

  it("forwards systemPrompt, tools, and model in the request body", async () => {
    const fetch = vi.fn(createMockFetch(() => scriptTextResponse("ok")));
    render(
      <AIAgent
        endpoint="/api/agent"
        systemPrompt="be concise"
        model="claude-opus-4-7"
        tools={{ search: { description: "datalake search" } }}
        fetch={fetch}
      />,
    );
    const textarea = container.querySelector<HTMLTextAreaElement>("textarea")!;
    act(() => { setTextareaValue(textarea, "hi"); });
    await flushAll();
    act(() => {
      container
        .querySelector<HTMLButtonElement>('button[aria-label="Send message"]')!
        .click();
    });
    await flushAll();

    const body = JSON.parse(String(fetch.mock.calls[0][1]?.body ?? "{}")) as {
      systemPrompt?: string;
      model?: string;
      tools?: unknown;
    };
    expect(body.systemPrompt).toBe("be concise");
    expect(body.model).toBe("claude-opus-4-7");
    expect(body.tools).toEqual({ search: { description: "datalake search" } });
  });

  it("forwards custom headers to the fetch call", async () => {
    const fetch = vi.fn(createMockFetch(() => scriptTextResponse("ok")));
    render(
      <AIAgent
        endpoint="/api/agent"
        headers={{ Authorization: "Bearer abc" }}
        fetch={fetch}
      />,
    );
    const textarea = container.querySelector<HTMLTextAreaElement>("textarea")!;
    act(() => { setTextareaValue(textarea, "hi"); });
    await flushAll();
    act(() => {
      container
        .querySelector<HTMLButtonElement>('button[aria-label="Send message"]')!
        .click();
    });
    await flushAll();

    const init = fetch.mock.calls[0][1];
    const headers = new Headers(init?.headers);
    expect(headers.get("Authorization")).toBe("Bearer abc");
  });

  it("hides tool call panels when showToolCalls is false", async () => {
    render(
      <AIAgent
        endpoint="/api/agent"
        showToolCalls={false}
        fetch={createMockFetch(() =>
          scriptToolResponse({
            toolName: "search",
            input: { q: "x" },
            output: { hits: 1 },
            answer: "done",
          }),
        )}
      />,
    );

    const textarea = container.querySelector<HTMLTextAreaElement>("textarea")!;
    act(() => { setTextareaValue(textarea, "go"); });
    await flushAll();
    act(() => {
      container
        .querySelector<HTMLButtonElement>('button[aria-label="Send message"]')!
        .click();
    });

    await vi.waitFor(
      () => {
        expect(container.textContent ?? "").toContain("done");
      },
      { timeout: 3000 },
    );

    expect(container.querySelector('[data-slot="ai-tool-call"]')).toBeNull();
  });

  it("renders tool call panels when showToolCalls is true (default)", async () => {
    render(
      <AIAgent
        endpoint="/api/agent"
        fetch={createMockFetch(() =>
          scriptToolResponse({
            toolName: "search_datalake",
            input: { q: "x" },
            output: { hits: 1 },
            answer: "done",
          }),
        )}
      />,
    );
    const textarea = container.querySelector<HTMLTextAreaElement>("textarea")!;
    act(() => { setTextareaValue(textarea, "go"); });
    await flushAll();
    act(() => {
      container
        .querySelector<HTMLButtonElement>('button[aria-label="Send message"]')!
        .click();
    });

    await vi.waitFor(
      () => {
        expect(container.querySelector('[data-slot="ai-tool-call"]')).not.toBeNull();
      },
      { timeout: 3000 },
    );
    expect(container.textContent ?? "").toContain("search_datalake");
  });

  it("renders the error message inline when the stream errors", async () => {
    const onError = vi.fn();
    render(
      <AIAgent
        endpoint="/api/agent"
        onError={onError}
        fetch={createMockFetch(() => scriptErrorResponse("Upstream 503"))}
      />,
    );
    const textarea = container.querySelector<HTMLTextAreaElement>("textarea")!;
    act(() => { setTextareaValue(textarea, "go"); });
    await flushAll();
    act(() => {
      container
        .querySelector<HTMLButtonElement>('button[aria-label="Send message"]')!
        .click();
    });

    await vi.waitFor(
      () => {
        expect(container.textContent ?? "").toContain("Upstream 503");
      },
      { timeout: 3000 },
    );
    expect(container.textContent ?? "").toContain("Something went wrong");
    expect(onError).toHaveBeenCalled();
  });
});
