import { expect, screen, userEvent, within } from "storybook/test"

import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationCardTrigger,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselItem,
  InlineCitationCarouselNext,
  InlineCitationCarouselPrev,
  InlineCitationQuote,
  InlineCitationSource,
  InlineCitationText,
} from "./inline-citation"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta = {
  title: "AI Elements/Inline Citation",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj

const WikiSource = {
  title: "Photosynthesis — Wikipedia",
  url: "https://en.wikipedia.org/wiki/Photosynthesis",
  description: "The free encyclopedia covering all aspects of photosynthesis.",
  quote:
    "Photosynthesis is a process used by plants and other organisms to convert light energy into chemical energy.",
}

const NatureSource = {
  title: "Chlorophyll and Light Absorption — Nature",
  url: "https://www.nature.com/articles/photosynthesis",
  description: "Peer-reviewed research on chlorophyll's role in photosynthesis.",
  quote: "Chlorophyll absorbs light most strongly in the blue and red portions of the spectrum.",
}

export const Single: Story = {
  render: () => (
    <p className="max-w-xl leading-relaxed">
      Plants convert sunlight into chemical energy through photosynthesis{" "}
      <InlineCitation>
        <InlineCitationCard>
          <InlineCitationCardTrigger sources={[WikiSource.url]} />
          <InlineCitationCardBody>
            <InlineCitationCarousel>
              <InlineCitationCarouselContent>
                <InlineCitationCarouselItem>
                  <InlineCitationSource
                    title={WikiSource.title}
                    url={WikiSource.url}
                    description={WikiSource.description}
                  />
                  <InlineCitationQuote>{WikiSource.quote}</InlineCitationQuote>
                </InlineCitationCarouselItem>
              </InlineCitationCarouselContent>
            </InlineCitationCarousel>
          </InlineCitationCardBody>
        </InlineCitationCard>
      </InlineCitation>
      , a process fundamental to life on Earth.
    </p>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Inline citation renders in text", async () => {
      await expect(canvas.getByText(/Plants convert sunlight/)).toBeInTheDocument()
    })
  },
}

export const MultipleInText: Story = {
  render: () => (
    <p className="max-w-2xl leading-relaxed">
      Photosynthesis{" "}
      <InlineCitation>
        <InlineCitationCard>
          <InlineCitationCardTrigger sources={[WikiSource.url]} />
          <InlineCitationCardBody>
            <InlineCitationCarousel>
              <InlineCitationCarouselContent>
                <InlineCitationCarouselItem>
                  <InlineCitationSource
                    title={WikiSource.title}
                    url={WikiSource.url}
                    description={WikiSource.description}
                  />
                  <InlineCitationQuote>{WikiSource.quote}</InlineCitationQuote>
                </InlineCitationCarouselItem>
              </InlineCitationCarouselContent>
            </InlineCitationCarousel>
          </InlineCitationCardBody>
        </InlineCitationCard>
      </InlineCitation>{" "}
      relies on chlorophyll{" "}
      <InlineCitation>
        <InlineCitationCard>
          <InlineCitationCardTrigger sources={[NatureSource.url]} />
          <InlineCitationCardBody>
            <InlineCitationCarousel>
              <InlineCitationCarouselContent>
                <InlineCitationCarouselItem>
                  <InlineCitationSource
                    title={NatureSource.title}
                    url={NatureSource.url}
                    description={NatureSource.description}
                  />
                  <InlineCitationQuote>{NatureSource.quote}</InlineCitationQuote>
                </InlineCitationCarouselItem>
              </InlineCitationCarouselContent>
            </InlineCitationCarousel>
          </InlineCitationCardBody>
        </InlineCitationCard>
      </InlineCitation>{" "}
      to absorb light energy from the sun.
    </p>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Multiple citations render in text", async () => {
      await expect(canvas.getByText(/relies on chlorophyll/)).toBeInTheDocument()
    })
  },
}

export const WithCarousel: Story = {
  render: () => (
    <p className="max-w-xl leading-relaxed">
      This claim is supported by multiple studies{" "}
      <InlineCitation>
        <InlineCitationCard>
          <InlineCitationCardTrigger sources={[WikiSource.url, NatureSource.url]} />
          <InlineCitationCardBody>
            <InlineCitationCarousel>
              <InlineCitationCarouselHeader>
                <InlineCitationCarouselPrev />
                <InlineCitationCarouselNext />
                <InlineCitationCarouselIndex />
              </InlineCitationCarouselHeader>
              <InlineCitationCarouselContent>
                <InlineCitationCarouselItem>
                  <InlineCitationSource
                    title={WikiSource.title}
                    url={WikiSource.url}
                    description={WikiSource.description}
                  />
                  <InlineCitationQuote>{WikiSource.quote}</InlineCitationQuote>
                </InlineCitationCarouselItem>
                <InlineCitationCarouselItem>
                  <InlineCitationSource
                    title={NatureSource.title}
                    url={NatureSource.url}
                    description={NatureSource.description}
                  />
                  <InlineCitationQuote>{NatureSource.quote}</InlineCitationQuote>
                </InlineCitationCarouselItem>
              </InlineCitationCarouselContent>
            </InlineCitationCarousel>
          </InlineCitationCardBody>
        </InlineCitationCard>
      </InlineCitation>
      .
    </p>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Citation with carousel renders", async () => {
      await expect(canvas.getByText(/supported by multiple studies/)).toBeInTheDocument()
    })
  },
}

export const OpenCardWithCarouselControls: Story = {
  render: () => (
    <p className="max-w-xl leading-relaxed">
      Open card with controls{" "}
      <InlineCitation>
        <InlineCitationCard open>
          <InlineCitationCardTrigger sources={[WikiSource.url, NatureSource.url]} />
          <InlineCitationCardBody>
            <InlineCitationCarousel>
              <InlineCitationCarouselHeader>
                <InlineCitationCarouselPrev />
                <InlineCitationCarouselNext />
                <InlineCitationCarouselIndex />
              </InlineCitationCarouselHeader>
              <InlineCitationCarouselContent>
                <InlineCitationCarouselItem>
                  <InlineCitationSource
                    title={WikiSource.title}
                    url={WikiSource.url}
                    description={WikiSource.description}
                  />
                  <InlineCitationQuote>{WikiSource.quote}</InlineCitationQuote>
                </InlineCitationCarouselItem>
                <InlineCitationCarouselItem>
                  <InlineCitationSource
                    title={NatureSource.title}
                    url={NatureSource.url}
                    description={NatureSource.description}
                  />
                  <InlineCitationQuote>{NatureSource.quote}</InlineCitationQuote>
                </InlineCitationCarouselItem>
              </InlineCitationCarouselContent>
            </InlineCitationCarousel>
          </InlineCitationCardBody>
        </InlineCitationCard>
      </InlineCitation>
    </p>
  ),
  play: async ({ step }) => {
    await step("Carousel contents are visible", async () => {
      await expect(await screen.findByText(WikiSource.title)).toBeInTheDocument()
    })
    await step("Next/Prev buttons scroll the carousel", async () => {
      const next = screen.getByRole("button", { name: "Next" })
      const prev = screen.getByRole("button", { name: "Previous" })
      await userEvent.click(next)
      await userEvent.click(prev)
    })
  },
}

export const CustomIndexChildren: Story = {
  render: () => (
    <p>
      <InlineCitation>
        <InlineCitationCard open>
          <InlineCitationCardTrigger sources={[WikiSource.url]} />
          <InlineCitationCardBody>
            <InlineCitationCarousel>
              <InlineCitationCarouselHeader>
                <InlineCitationCarouselIndex>Custom index</InlineCitationCarouselIndex>
              </InlineCitationCarouselHeader>
              <InlineCitationCarouselContent>
                <InlineCitationCarouselItem>
                  <InlineCitationSource title={WikiSource.title} url={WikiSource.url} />
                </InlineCitationCarouselItem>
              </InlineCitationCarouselContent>
            </InlineCitationCarousel>
          </InlineCitationCardBody>
        </InlineCitationCard>
      </InlineCitation>
    </p>
  ),
  play: async ({ step }) => {
    await step("Custom index renders", async () => {
      await expect(await screen.findByText("Custom index")).toBeInTheDocument()
    })
  },
}

export const EmptySourcesTrigger: Story = {
  render: () => (
    <p>
      Missing sources{" "}
      <InlineCitation>
        <InlineCitationText>highlighted text</InlineCitationText>{" "}
        <InlineCitationCard>
          <InlineCitationCardTrigger sources={[]} />
          <InlineCitationCardBody>
            <InlineCitationCarousel>
              <InlineCitationCarouselContent>
                <InlineCitationCarouselItem>
                  <InlineCitationSource>
                    <div>Source with only children</div>
                  </InlineCitationSource>
                </InlineCitationCarouselItem>
              </InlineCitationCarouselContent>
            </InlineCitationCarousel>
          </InlineCitationCardBody>
        </InlineCitationCard>
      </InlineCitation>
    </p>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Empty sources renders 'unknown' label", async () => {
      await expect(canvas.getByText("unknown")).toBeInTheDocument()
      await expect(canvas.getByText("highlighted text")).toBeInTheDocument()
    })
  },
}
