import { expect, fn, userEvent, within } from 'storybook/test';

import { TDPLink, TdpNavigationProvider } from './TDPLink';

import type { Meta, StoryObj } from '@storybook/react-vite';

const MOCK_TDP_BASE_URL = 'https://example.tetrascience.com/my-org';

const meta: Meta<typeof TDPLink> = {
  title: 'Atoms/TDPLink',
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
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /click me/i });

    await expect(link).toBeInTheDocument();
    await expect(link).toHaveAttribute('href', `${MOCK_TDP_BASE_URL}/file/abc-123`);
    await userEvent.click(link);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /new tab link/i });

    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /same tab link/i });

    await expect(link).not.toHaveAttribute('target');
    await expect(link).not.toHaveAttribute('rel');
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
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /keyboard link/i });

    await userEvent.tab();
    await expect(link).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /pipeline link/i });

    await expect(link).toHaveAttribute('href', `${MOCK_TDP_BASE_URL}/pipeline-details/pipeline-456`);
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1139" },
  },
};
