import { expect, userEvent, waitFor, within } from "storybook/test";

import { ChatbotExample } from "./ChatbotExample";

import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  createMockFetch,
  scriptReasoningResponse,
  scriptTextResponse,
} from "@/components/composed/AIAgent/AIAgent.mocks";


const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const meta: Meta<typeof ChatbotExample> = {
  title: "Composed/ChatbotExample",
  component: ChatbotExample,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Port of the Vercel AI SDK Elements `Chatbot` example (https://elements.ai-sdk.dev/examples/chatbot), composed from the AI Elements `Conversation`, `Message`, `Reasoning`, `Sources`, `PromptInput`, and `Loader` primitives. Backed by `useChat` and a mock fetch for story runs.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ChatbotExample>;

export const Default: Story = {
  args: {
    endpoint: "/api/agent",
    fetch: createMockFetch((text) =>
      scriptTextResponse(
        `Sure — here is a quick reply to **"${text || "your question"}"**.\n\n- Streams incrementally\n- Supports Markdown\n- Sticks to the bottom while streaming`,
      ),
    ),
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1710" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Empty state renders initially", async () => {
      expect(canvas.getByText(/how can i help/i)).toBeInTheDocument();
    });

    await step("Typing enables submit and streams a response", async () => {
      await sleep(400);
      const textarea = canvas.getByPlaceholderText(/ask me anything/i);
      await userEvent.type(textarea, "Hi there");
      await userEvent.click(canvas.getByRole("button", { name: /submit/i }));
      await waitFor(
        () => expect(canvas.getByText(/quick reply/i)).toBeInTheDocument(),
        { timeout: 5000 },
      );
    });
  },
};

export const WithReasoningAndSources: Story = {
  args: {
    endpoint: "/api/agent",
    fetch: createMockFetch(() =>
      scriptReasoningResponse({
        reasoning:
          "Let me think about this. I should search our internal docs first, then cite the results.",
        sources: [
          { url: "https://docs.tetrascience.com/lcms", title: "LCMS overview" },
          {
            url: "https://docs.tetrascience.com/datalake",
            title: "Datalake primer",
          },
        ],
        answer:
          "Based on the docs, I found **2 relevant sources** for your question.",
      }),
    ),
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1711" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await sleep(400);
    await step("Submit a message that triggers reasoning + sources", async () => {
      await userEvent.type(
        canvas.getByPlaceholderText(/ask me anything/i),
        "What do you know about LCMS?",
      );
      await userEvent.click(canvas.getByRole("button", { name: /submit/i }));
    });

    await step("Reasoning trigger and source list are rendered", async () => {
      await waitFor(
        () => {
          expect(canvas.getByText(/used 2 sources/i)).toBeInTheDocument();
          expect(canvas.getByText(/relevant sources/i)).toBeInTheDocument();
        },
        { timeout: 5000 },
      );
    });
  },
};
