import { expect, within } from "storybook/test"
import { css } from "storybook/theming"

import {
  Attachment,
  AttachmentHoverCard,
  AttachmentHoverCardContent,
  AttachmentHoverCardTrigger,
  AttachmentInfo,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "./attachments"

import type { AttachmentData } from "./attachments"
import type { Meta, StoryObj } from "@storybook/react-vite"

const mockImageFile: AttachmentData = {
  type: "file",
  id: "img-1",
  name: "screenshot.png",
  filename: "screenshot.png",
  mediaType: "image/png",
  url: "./sample_image2.png",
}

const mockDocFile: AttachmentData = {
  type: "file",
  id: "doc-1",
  name: "report.pdf",
  filename: "report.pdf",
  mediaType: "application/pdf",
}

const mockAudioFile: AttachmentData = {
  type: "file",
  id: "audio-1",
  name: "recording.mp3",
  filename: "recording.mp3",
  mediaType: "audio/mpeg",
}

const mockSource: AttachmentData = {
  type: "source-document",
  id: "src-1",
  title: "AI Research Paper",
  filename: "ai-research.pdf",
  mediaType: "application/pdf",
  sourceType: "file",
}

const meta: Meta = {
  title: "AI Elements/Attachments",
  parameters: {
    layout: "padded",
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#F8F8F8' },
        { name: 'dark', value: '#333333' },
        { name: 'brand', value: '#0070f3' }, // Your custom color
      ],
    },
    css: css`body {
        background-color: blue);
      }
    `,
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj

export const Grid: Story = {
  render: () => (
    <Attachments variant="grid">
      <Attachment data={mockImageFile} onRemove={() => {}}>
        <AttachmentPreview />
        <AttachmentRemove />
      </Attachment>
      <Attachment data={mockDocFile} onRemove={() => {}}>
        <AttachmentPreview />
        <AttachmentRemove />
      </Attachment>
      <Attachment data={mockAudioFile} onRemove={() => {}}>
        <AttachmentPreview />
        <AttachmentRemove />
      </Attachment>
    </Attachments>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Grid attachments render", async () => {
      const removeButtons = canvas.getAllByRole("button", { name: /remove/i })
      await expect(removeButtons.length).toBeGreaterThan(0)
    })
  },
}

export const Inline: Story = {
  render: () => (
    <Attachments variant="inline">
      <Attachment data={mockImageFile}>
        <AttachmentPreview />
        <AttachmentInfo />
        <AttachmentRemove />
      </Attachment>
      <Attachment data={mockDocFile}>
        <AttachmentPreview />
        <AttachmentInfo />
        <AttachmentRemove />
      </Attachment>
      <Attachment data={mockSource}>
        <AttachmentPreview />
        <AttachmentInfo />
      </Attachment>
    </Attachments>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Inline attachments render with filenames", async () => {
      await expect(canvas.getByText("screenshot.png")).toBeInTheDocument()
      await expect(canvas.getByText("report.pdf")).toBeInTheDocument()
      await expect(canvas.getByText("AI Research Paper")).toBeInTheDocument()
    })
  },
}

export const List: Story = {
  render: () => (
    <Attachments variant="list">
      <Attachment data={mockImageFile}>
        <AttachmentPreview />
        <AttachmentInfo showMediaType />
        <AttachmentRemove />
      </Attachment>
      <Attachment data={mockDocFile}>
        <AttachmentPreview />
        <AttachmentInfo showMediaType />
        <AttachmentRemove />
      </Attachment>
      <Attachment data={mockAudioFile}>
        <AttachmentPreview />
        <AttachmentInfo showMediaType />
        <AttachmentRemove />
      </Attachment>
    </Attachments>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("List attachments render with media types", async () => {
      await expect(canvas.getByText("image/png")).toBeInTheDocument()
      await expect(canvas.getByText("application/pdf")).toBeInTheDocument()
    })
  },
}

export const WithHoverCard: Story = {
  render: () => (
    <Attachments variant="inline">
      <AttachmentHoverCard>
        <AttachmentHoverCardTrigger asChild>
          <Attachment data={mockImageFile}>
            <AttachmentPreview />
            <AttachmentInfo />
          </Attachment>
        </AttachmentHoverCardTrigger>
        <AttachmentHoverCardContent>
          <img
            alt="screenshot.png"
            className="w-48 rounded object-cover"
            src="https://placehold.co/192x128/e2e8f0/64748b?text=Preview"
          />
        </AttachmentHoverCardContent>
      </AttachmentHoverCard>
    </Attachments>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Attachment with hover card renders", async () => {
      await expect(canvas.getByText("screenshot.png")).toBeInTheDocument()
    })
  },
}
