import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof Accordion> = {
  title: "Components/Accordion",
  component: Accordion,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof Accordion>

function AccordionExample(props: React.ComponentProps<typeof Accordion>) {
  return (
    <Accordion className="w-[420px]" {...props}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Can I use these components in Storybook?</AccordionTrigger>
        <AccordionContent>
          Yes. Each component can be composed into focused stories for docs and testing.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Do they support multiple open sections?</AccordionTrigger>
        <AccordionContent>
          The accordion root supports both single and multiple expansion modes.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Can content include links?</AccordionTrigger>
        <AccordionContent>
          Absolutely. You can include formatted content, actions, and <a href="./">inline links</a>.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export const Single: Story = {
  render: () => <AccordionExample type="single" collapsible defaultValue="item-1" />,
  parameters: {
    zephyr: { testCaseId: "SW-T1180" },
  },
}

export const Multiple: Story = {
  render: () => <AccordionExample type="multiple" defaultValue={["item-1", "item-2"]} />,
  parameters: {
    zephyr: { testCaseId: "SW-T1181" },
  },
}