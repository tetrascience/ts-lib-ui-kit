import { expect, userEvent, within } from "storybook/test";

import { CopyToClipboard } from "./copy-to-clipboard";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof CopyToClipboard> = {
  title: "Design Patterns/CopyToClipboard",
  component: CopyToClipboard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[520px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Python: Story = {
  args: {
    language: "Python",
    value: `import tetrascience as ts

client = ts.Client(api_key="YOUR_API_KEY")

# Fetch experiment results
results = client.experiments.list(
    pipeline_id="pipe-abc123",
    status="completed",
    limit=50,
)`,
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1485" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Copy button and language label render", async () => {
      expect(canvas.getByRole("button", { name: "Copy" })).toBeInTheDocument();
      expect(canvas.getByText("Python")).toBeInTheDocument();
    });

    await step("Clicking copy button shows confirmation state", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Copy" }));
      expect(canvas.getByRole("button", { name: "Copied" })).toBeInTheDocument();
    });
  },
};

export const CurlExample: Story = {
  name: "cURL",
  args: {
    label: "cURL",
    value: `curl -X GET "https://api.tetrascience.com/v1/experiments" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1486" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Copy button and cURL label render", async () => {
      expect(canvas.getByRole("button", { name: "Copy" })).toBeInTheDocument();
      expect(canvas.getByText("cURL")).toBeInTheDocument();
    });

    await step("Clicking copy button shows confirmation state", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Copy" }));
      expect(canvas.getByRole("button", { name: "Copied" })).toBeInTheDocument();
    });
  },
};

export const JsonPayload: Story = {
  name: "JSON Payload",
  args: {
    language: "JSON",
    value: `{
  "pipeline_id": "pipe-abc123",
  "config": {
    "threshold": 0.95,
    "max_iterations": 1000
  }
}`,
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1487" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Copy button and JSON label render", async () => {
      expect(canvas.getByRole("button", { name: "Copy" })).toBeInTheDocument();
      expect(canvas.getByText("JSON")).toBeInTheDocument();
    });

    await step("Clicking copy button shows confirmation state", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Copy" }));
      expect(canvas.getByRole("button", { name: "Copied" })).toBeInTheDocument();
    });
  },
};

export const NoLabel: Story = {
  args: {
    value: "SELECT * FROM experiments WHERE status = 'completed';",
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1488" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Copy button renders with no label", async () => {
      expect(canvas.getByRole("button", { name: "Copy" })).toBeInTheDocument();
    });

    await step("Clicking copy button shows confirmation state", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Copy" }));
      expect(canvas.getByRole("button", { name: "Copied" })).toBeInTheDocument();
    });
  },
};
