import { expect, within } from "storybook/test"

import { Source, Sources, SourcesContent, SourcesTrigger } from "./sources"

import type { Meta, StoryObj } from "@storybook/react-vite"


const mockSources = [
  { href: "https://en.wikipedia.org/wiki/Photosynthesis", title: "Photosynthesis — Wikipedia" },
  { href: "https://www.khanacademy.org/science/photosynthesis", title: "Photosynthesis — Khan Academy" },
  { href: "https://www.nature.com/articles/photosynthesis", title: "The role of chlorophyll — Nature" },
]

const meta: Meta = {
  title: "AI Elements/Sources",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj

export const Default: Story = {
  render: () => (
    <div className="max-w-md">
      <Sources>
        <SourcesTrigger count={mockSources.length} />
        <SourcesContent>
          {mockSources.map((s) => (
            <Source key={s.href} href={s.href} title={s.title} />
          ))}
        </SourcesContent>
      </Sources>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Sources trigger renders with count", async () => {
      await expect(canvas.getByText(/3 sources/i)).toBeInTheDocument()
    })
  },
}

export const Expanded: Story = {
  render: () => (
    <div className="max-w-md">
      <Sources defaultOpen>
        <SourcesTrigger count={mockSources.length} />
        <SourcesContent>
          {mockSources.map((s) => (
            <Source key={s.href} href={s.href} title={s.title} />
          ))}
        </SourcesContent>
      </Sources>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("All sources visible when expanded", async () => {
      await expect(canvas.getByText("Photosynthesis — Wikipedia")).toBeInTheDocument()
      await expect(canvas.getByText("The role of chlorophyll — Nature")).toBeInTheDocument()
    })
  },
}

export const SingleSource: Story = {
  render: () => (
    <div className="max-w-md">
      <Sources defaultOpen>
        <SourcesTrigger count={1} />
        <SourcesContent>
          <Source
            href="https://arxiv.org/abs/2301.00001"
            title="Large Language Models: A Survey — arXiv"
          />
        </SourcesContent>
      </Sources>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Single source renders", async () => {
      await expect(canvas.getByText(/1 source/i)).toBeInTheDocument()
    })
  },
}
