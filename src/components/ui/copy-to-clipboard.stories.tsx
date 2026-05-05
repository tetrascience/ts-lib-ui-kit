import { CopyToClipboard } from "./copy-to-clipboard";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof CopyToClipboard> = {
  title: "UI/CopyToClipboard",
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
};

export const CurlExample: Story = {
  name: "cURL",
  args: {
    label: "cURL",
    value: `curl -X GET "https://api.tetrascience.com/v1/experiments" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
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
};

export const NoLabel: Story = {
  args: {
    value: "SELECT * FROM experiments WHERE status = 'completed';",
  },
};
