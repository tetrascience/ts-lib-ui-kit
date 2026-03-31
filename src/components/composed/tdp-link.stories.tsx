import { expect, fn, userEvent, within } from 'storybook/test';

import { TDPLink, TdpNavigationProvider } from './tdp-link';

import type { Meta, StoryObj } from '@storybook/react-vite';

const MOCK_TDP_BASE_URL = 'https://example.tetrascience.com/my-org';

const meta: Meta<typeof TDPLink> = {
  title: 'TetraData Platform/Link',
  component: TDPLink,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    path: { control: 'text' },
    navigationOptions: { control: 'object' },
  },
  decorators: [
    (Story) => (
      <TdpNavigationProvider tdpBaseUrl={MOCK_TDP_BASE_URL}>
        <Story />
      </TdpNavigationProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TDPLink>;

export const Default: Story = {
  name: 'Default',
  args: {
    path: '/file/abc-123',
    children: 'View File Details',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Link renders", async () => {
      await expect(canvas.getByRole('link', { name: /view file details/i })).toBeInTheDocument();
    });

    await step("Link has correct href", async () => {
      await expect(canvas.getByRole('link')).toHaveAttribute('href', `${MOCK_TDP_BASE_URL}/file/abc-123`);
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1127" },
  },
};

export const SameTab: Story = {
  name: 'Same Tab',
  args: {
    path: '/file/abc-123',
    children: 'Open in Same Tab',
    navigationOptions: { newTab: false },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Link renders", async () => {
      await expect(canvas.getByRole('link', { name: /open in same tab/i })).toBeInTheDocument();
    });

    await step("Link does not open in new tab", async () => {
      await expect(canvas.getByRole('link')).not.toHaveAttribute('target');
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1128" },
  },
};

export const NewTab: Story = {
  name: 'New Tab (default)',
  args: {
    path: '/file/abc-123',
    children: 'Open in New Tab',
    navigationOptions: { newTab: true },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Link renders", async () => {
      await expect(canvas.getByRole('link', { name: /open in new tab/i })).toBeInTheDocument();
    });

    await step("Link opens in new tab", async () => {
      await expect(canvas.getByRole('link')).toHaveAttribute('target', '_blank');
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1129" },
  },
};

export const SearchLink: Story = {
  name: 'Search Link',
  args: {
    path: '/search?q=experiment',
    children: 'Search for experiments',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Link renders", async () => {
      await expect(canvas.getByRole('link', { name: /search for experiments/i })).toBeInTheDocument();
    });

    await step("Link has correct search href", async () => {
      await expect(canvas.getByRole('link', { name: /search for experiments/i })).toHaveAttribute('href', `${MOCK_TDP_BASE_URL}/search%3Fq=experiment`);
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1130" },
  },
};

export const PipelineLink: Story = {
  name: 'Pipeline Link',
  args: {
    path: '/pipeline-details/pipeline-456',
    children: 'View Pipeline',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Link renders", async () => {
      await expect(canvas.getByRole('link', { name: /view pipeline/i })).toBeInTheDocument();
    });

    await step("Link has correct pipeline href", async () => {
      await expect(canvas.getByRole('link')).toHaveAttribute('href', `${MOCK_TDP_BASE_URL}/pipeline-details/pipeline-456`);
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1131" },
  },
};

export const DataWorkspaceLink: Story = {
  name: 'Data Workspace Link',
  args: {
    path: '/data-workspace',
    children: 'Go to Data Workspace',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Link renders", async () => {
      await expect(canvas.getByRole('link', { name: /go to data workspace/i })).toBeInTheDocument();
    });

    await step("Link has correct href", async () => {
      await expect(canvas.getByRole('link')).toHaveAttribute('href', `${MOCK_TDP_BASE_URL}/data-workspace`);
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1132" },
  },
};

export const CustomClassName: Story = {
  name: 'With Custom Class',
  args: {
    path: '/file/abc-123',
    children: 'Styled Link',
    className: 'custom-link-class',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Link renders", async () => {
      await expect(canvas.getByRole('link', { name: /styled link/i })).toBeInTheDocument();
    });

    await step("Link has custom class", async () => {
      await expect(canvas.getByRole('link')).toHaveClass('custom-link-class');
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1133" },
  },
};

export const InlineWithText: Story = {
  name: 'Inline with Text',
  render: (args) => (
    <p>
      Click here to <TDPLink {...args}>view the file details</TDPLink> for more information.
    </p>
  ),
  args: {
    path: '/file/abc-123',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Link renders inline with surrounding text", async () => {
      await expect(canvas.getByRole('link', { name: /view the file details/i })).toBeInTheDocument();
    });

    await step("Surrounding text is present", async () => {
      await expect(canvas.getByText(/click here to/i)).toBeInTheDocument();
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1134" },
  },
};

// ============================================================================
// Interactive Test Stories
// ============================================================================

export const ClickInteraction: Story = {
  name: 'Click Interaction',
  tags: ['!dev'],
  args: {
    path: '/file/abc-123',
    children: 'Click Me',
    onClick: fn(),
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /click me/i });

    await step("Link renders with correct href", async () => {
      await expect(link).toBeInTheDocument();
      await expect(link).toHaveAttribute('href', `${MOCK_TDP_BASE_URL}/file/abc-123`);
    });

    await step("Click triggers onClick handler", async () => {
      await userEvent.click(link);
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1135" },
  },
};

export const NewTabAttributes: Story = {
  name: 'New Tab Attributes',
  tags: ['!dev'],
  args: {
    path: '/file/abc-123',
    children: 'New Tab Link',
    navigationOptions: { newTab: true },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /new tab link/i });

    await step("Link opens in new tab", async () => {
      await expect(link).toHaveAttribute('target', '_blank');
    });

    await step("Link has noopener noreferrer", async () => {
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1136" },
  },
};

export const SameTabAttributes: Story = {
  name: 'Same Tab Attributes',
  tags: ['!dev'],
  args: {
    path: '/file/abc-123',
    children: 'Same Tab Link',
    navigationOptions: { newTab: false },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /same tab link/i });

    await step("Link has no target attribute", async () => {
      await expect(link).not.toHaveAttribute('target');
    });

    await step("Link has no rel attribute", async () => {
      await expect(link).not.toHaveAttribute('rel');
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1137" },
  },
};

export const KeyboardInteraction: Story = {
  name: 'Keyboard Interaction',
  tags: ['!dev'],
  args: {
    path: '/file/abc-123',
    children: 'Keyboard Link',
    onClick: fn(),
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /keyboard link/i });

    await step("Link receives focus via Tab", async () => {
      await userEvent.tab();
      await expect(link).toHaveFocus();
    });

    await step("Enter key triggers onClick", async () => {
      await userEvent.keyboard('{Enter}');
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1138" },
  },
};

export const HrefConstruction: Story = {
  name: 'Href Construction',
  tags: ['!dev'],
  args: {
    path: '/pipeline-details/pipeline-456',
    children: 'Pipeline Link',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /pipeline link/i });

    await step("Link href is constructed from base URL and path", async () => {
      await expect(link).toHaveAttribute('href', `${MOCK_TDP_BASE_URL}/pipeline-details/pipeline-456`);
    });
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1139" },
  },
};
