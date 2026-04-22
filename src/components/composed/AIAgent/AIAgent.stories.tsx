import { expect, userEvent, waitFor, within } from "storybook/test";

import { AIAgent } from "./AIAgent";
import {
  createMockFetch,
  scriptErrorResponse,
  scriptTextResponse,
  scriptToolResponse,
} from "./AIAgent.mocks";

import type { Meta, StoryObj } from "@storybook/react-vite";
import type { UIMessage } from "ai";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const meta: Meta<typeof AIAgent> = {
  title: "Composed/AIAgent",
  component: AIAgent,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A reusable agentic chat UI backed by the Vercel AI SDK. Point `endpoint` at a server route that returns a UI-message stream and the component handles streaming, tool-call rendering, and error surfacing. The `fetch` prop lets you inject a mock — used in these stories.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AIAgent>;

export const Default: Story = {
  args: {
    endpoint: "/api/agent",
    inputPlaceholder: "Ask the agent anything…",
    fetch: createMockFetch((text) =>
      scriptTextResponse(
        `Sure — here's a brief response to **"${text || "your question"}"**.\n\n- It renders Markdown.\n- It streams incrementally.\n- It auto-scrolls.`,
      ),
    ),
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1700" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Input and send button render", async () => {
      expect(canvas.getByRole("textbox", { name: /message/i })).toBeInTheDocument();
      expect(canvas.getByRole("button", { name: /send message/i })).toBeInTheDocument();
    });

    await step("Send button is disabled when input is empty", async () => {
      expect(canvas.getByRole("button", { name: /send message/i })).toBeDisabled();
    });

    await step("Typing a message enables the send button", async () => {
      await sleep(500);
      const input = canvas.getByRole("textbox", { name: /message/i });
      await userEvent.type(input, "Hello");
      expect(canvas.getByRole("button", { name: /send message/i })).toBeEnabled();
    });

    await step("Submitting streams a response", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /send message/i }));
      await waitFor(
        () => {
          expect(canvas.getByText(/brief response/i)).toBeInTheDocument();
        },
        { timeout: 5000 },
      );
    });
  },
};

export const WithTools: Story = {
  args: {
    endpoint: "/api/agent",
    showToolCalls: true,
    fetch: createMockFetch(() =>
      scriptToolResponse({
        toolName: "search_datalake",
        input: { query: "LCMS runs", limit: 5 },
        output: { hits: 3, ids: ["run-1", "run-2", "run-3"] },
        answer: "I found **3 runs** that match your query.",
      }),
    ),
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1701" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await sleep(500);
    await step("Submit a message that triggers a tool call", async () => {
      await userEvent.type(
        canvas.getByRole("textbox", { name: /message/i }),
        "Find LCMS runs",
      );
      await userEvent.click(canvas.getByRole("button", { name: /send message/i }));
    });

    await step("Tool call panel is rendered and collapsed by default", async () => {
      await waitFor(
        () => {
          expect(canvas.getByText("search_datalake")).toBeInTheDocument();
        },
        { timeout: 5000 },
      );
    });
  },
};

const seededHistory: UIMessage[] = [
  {
    id: "seed-user",
    role: "user",
    parts: [{ type: "text", text: "What tools do you have access to?" }],
  },
  {
    id: "seed-assistant",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "I have access to datalake search, file metadata lookup, and run-attribute querying. What would you like to explore?",
        state: "done",
      },
    ],
  },
];

export const WithSystemPrompt: Story = {
  args: {
    endpoint: "/api/agent",
    systemPrompt:
      "You are a TetraScience lab-data analyst. Be concise and cite run IDs when relevant.",
    initialMessages: seededHistory,
    fetch: createMockFetch(() =>
      scriptTextResponse(
        "Good question — I'll stay concise and cite run IDs like `run-42` when relevant.",
      ),
    ),
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1702" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Seeded history is rendered", async () => {
      expect(canvas.getByText(/what tools do you have/i)).toBeInTheDocument();
      expect(canvas.getByText(/datalake search/i)).toBeInTheDocument();
    });
  },
};

export const LoadingState: Story = {
  args: {
    endpoint: "/api/agent",
    fetch: createMockFetch((text) =>
      scriptTextResponse(`Thinking about "${text || "it"}"… here's the answer.`, {
        startDelayMs: 1500,
        chunkSize: 2,
      }),
    ),
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1703" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await sleep(500);
    await step("Submit a slow-responding message", async () => {
      await userEvent.type(
        canvas.getByRole("textbox", { name: /message/i }),
        "Slow please",
      );
      await userEvent.click(canvas.getByRole("button", { name: /send message/i }));
    });

    await step("Thinking indicator appears while waiting", async () => {
      await waitFor(
        () => {
          expect(canvas.getByRole("status")).toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    });
  },
};

export const ErrorState: Story = {
  args: {
    endpoint: "/api/agent",
    fetch: createMockFetch(() => scriptErrorResponse("Upstream model unavailable (503)")),
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1704" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await sleep(500);
    await step("Submit a message that errors mid-stream", async () => {
      await userEvent.type(
        canvas.getByRole("textbox", { name: /message/i }),
        "Break it",
      );
      await userEvent.click(canvas.getByRole("button", { name: /send message/i }));
    });

    await step("Error message renders inline", async () => {
      await waitFor(
        () => {
          expect(canvas.getByText(/something went wrong/i)).toBeInTheDocument();
          expect(canvas.getByText(/upstream model unavailable/i)).toBeInTheDocument();
        },
        { timeout: 5000 },
      );
    });
  },
};

export const CustomStyling: Story = {
  args: {
    endpoint: "/api/agent",
    className:
      "max-w-xl border-2 border-primary/40 bg-surface-container-high shadow-elevation-3",
    maxHeight: "400px",
    inputPlaceholder: "Custom-styled input…",
    fetch: createMockFetch(() =>
      scriptTextResponse("The container uses a thicker primary border and a raised shadow."),
    ),
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1705" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Custom className is applied to the root", async () => {
      const root = canvasElement.querySelector('[data-slot="ai-agent"]');
      expect(root).not.toBeNull();
      expect(root?.className).toContain("border-primary/40");
    });

    await step("Custom placeholder is visible", async () => {
      expect(canvas.getByPlaceholderText(/custom-styled input/i)).toBeInTheDocument();
    });
  },
};
