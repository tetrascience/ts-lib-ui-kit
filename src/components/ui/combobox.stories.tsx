import { useState } from "react"
import { expect, within } from "storybook/test"

import { Badge } from "./badge"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxValue,
  useComboboxAnchor,
} from "./combobox"

import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ComponentProps } from "react"

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const frameworks = ["Next.js", "SvelteKit", "Nuxt", "Remix", "Astro"] as const

const groupedFrameworks = [
  { label: "Frontend", items: ["Next.js", "Nuxt", "SvelteKit"] },
  { label: "Full-stack", items: ["Remix", "RedwoodJS"] },
  { label: "Static", items: ["Astro", "Eleventy"] },
] as const

interface Tool {
  value: string
  label: string
  status: "stable" | "beta" | "deprecated"
}

const tools: Tool[] = [
  { value: "vite", label: "Vite", status: "stable" },
  { value: "turbopack", label: "Turbopack", status: "beta" },
  { value: "webpack", label: "Webpack", status: "deprecated" },
  { value: "esbuild", label: "esbuild", status: "stable" },
  { value: "rollup", label: "Rollup", status: "stable" },
]

const statusVariant: Record<Tool["status"], "positive" | "info" | "warning"> = {
  stable: "positive",
  beta: "info",
  deprecated: "warning",
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof ComboboxInput> = {
  title: "Components/Combobox",
  component: ComboboxInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    showTrigger: {
      control: { type: "boolean" },
    },
    showClear: {
      control: { type: "boolean" },
    },
  },
  args: {
    showTrigger: true,
    showClear: false,
  },
}

export default meta

type Story = StoryObj<typeof ComboboxInput>

type ComboboxContentProps = ComponentProps<typeof ComboboxContent>

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderCombobox(
  args: Story["args"],
  contentProps?: Partial<ComboboxContentProps>,
) {
  return (
    <Combobox items={frameworks}>
      <ComboboxInput {...args} className="w-[240px]" placeholder="Choose a framework" />
      <ComboboxContent {...contentProps}>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

// ---------------------------------------------------------------------------
// Existing stories
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: (args) => renderCombobox(args),
  parameters: {
    zephyr: { testCaseId: "SW-T1221" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Combobox input and placeholder render", async () => {
      expect(canvas.getByPlaceholderText("Choose a framework")).toBeInTheDocument()
      expect(canvas.getByRole("combobox")).toBeInTheDocument()
    })

    await step("Combobox role is accessible", async () => {
      expect(canvas.getByRole("combobox")).toBeInTheDocument()
    })
  },
}

export const WithClearButton: Story = {
  args: {
    showClear: true,
  },
  render: (args) => renderCombobox(args),
  parameters: {
    zephyr: { testCaseId: "SW-T1222" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Combobox renders with placeholder", async () => {
      expect(canvas.getByPlaceholderText("Choose a framework")).toBeInTheDocument()
    })

    await step("Combobox role is accessible", async () => {
      expect(canvas.getByRole("combobox")).toBeInTheDocument()
    })
  },
}

export const WithoutTrigger: Story = {
  args: {
    showTrigger: false,
  },
  render: (args) => renderCombobox(args),
  parameters: {
    zephyr: { testCaseId: "SW-T1223" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Combobox input renders", async () => {
      expect(canvas.getByPlaceholderText("Choose a framework")).toBeInTheDocument()
      expect(canvas.getByRole("combobox")).toBeInTheDocument()
    })

    await step("Dropdown trigger hidden", async () => {
      expect(canvasElement.querySelector('[data-slot="combobox-trigger"]')).not.toBeInTheDocument()
    })
  },
}

export const TopAlignedEnd: Story = {
  render: (args) =>
    renderCombobox(args, {
      align: "end",
      side: "top",
    }),
  parameters: {
    zephyr: { testCaseId: "SW-T1224" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Combobox renders for top alignment", async () => {
      expect(canvas.getByPlaceholderText("Choose a framework")).toBeInTheDocument()
      expect(canvas.getByRole("combobox")).toBeInTheDocument()
    })
  },
}

// ---------------------------------------------------------------------------
// New stories
// ---------------------------------------------------------------------------

function MultipleSelectionExample({ args }: { args: Story["args"] }) {
  const anchorRef = useComboboxAnchor()
  const [value, setValue] = useState<string[]>([])

  return (
    <Combobox multiple items={frameworks} value={value} onValueChange={setValue}>
      <ComboboxChips ref={anchorRef} className="w-[280px]">
        <ComboboxValue>
          {(items: string[]) =>
            items.map((item) => (
              <ComboboxChip key={item}>{item}</ComboboxChip>
            ))
          }
        </ComboboxValue>
        <ComboboxChipsInput {...args} placeholder="Select frameworks..." />
      </ComboboxChips>
      <ComboboxContent anchor={anchorRef}>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export const MultipleSelection: Story = {
  render: (args) => <MultipleSelectionExample args={args} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Chips container and input render", async () => {
      expect(canvas.getByPlaceholderText("Select frameworks...")).toBeInTheDocument()
      expect(canvas.getByRole("combobox")).toBeInTheDocument()
    })

    await step("Chips container is present", async () => {
      expect(canvasElement.querySelector('[data-slot="combobox-chips"]')).toBeInTheDocument()
    })
  },
}

export const Grouped: Story = {
  render: (args) => (
    <Combobox items={groupedFrameworks}>
      <ComboboxInput {...args} className="w-[240px]" placeholder="Choose a framework" />
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {groupedFrameworks.map((group, gi) => (
            <ComboboxGroup key={group.label} items={group.items}>
              {gi > 0 && <ComboboxSeparator />}
              <ComboboxLabel>{group.label}</ComboboxLabel>
              <ComboboxCollection>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Combobox with groups renders", async () => {
      expect(canvas.getByPlaceholderText("Choose a framework")).toBeInTheDocument()
      expect(canvas.getByRole("combobox")).toBeInTheDocument()
    })
  },
}

export const CustomItems: Story = {
  render: (args) => (
    <Combobox
      items={tools}
      itemToStringValue={(item: Tool) => item.value}
      itemToStringLabel={(item: Tool) => item.label}
    >
      <ComboboxInput {...args} className="w-[260px]" placeholder="Pick a build tool" />
      <ComboboxContent>
        <ComboboxEmpty>No tools found.</ComboboxEmpty>
        <ComboboxList>
          {(item: Tool) => (
            <ComboboxItem key={item.value} value={item}>
              <span className="flex-1">{item.label}</span>
              <Badge variant={statusVariant[item.status]} className="ml-auto text-[10px]">
                {item.status}
              </Badge>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Combobox renders with custom items placeholder", async () => {
      expect(canvas.getByPlaceholderText("Pick a build tool")).toBeInTheDocument()
      expect(canvas.getByRole("combobox")).toBeInTheDocument()
    })
  },
}

export const InvalidState: Story = {
  render: (args) => (
    <Combobox items={frameworks}>
      <ComboboxInput
        {...args}
        className="w-[240px]"
        placeholder="Choose a framework"
        aria-invalid
      />
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Input has aria-invalid attribute", async () => {
      const input = canvas.getByRole("combobox")
      expect(input).toHaveAttribute("aria-invalid", "true")
    })
  },
}

export const Disabled: Story = {
  render: (args) => (
    <Combobox items={frameworks}>
      <ComboboxInput
        {...args}
        className="w-[240px]"
        placeholder="Choose a framework"
        disabled
      />
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Input is disabled", async () => {
      expect(canvas.getByRole("combobox")).toBeDisabled()
    })
  },
}

export const AutoHighlight: Story = {
  render: (args) => (
    <Combobox items={frameworks} autoHighlight>
      <ComboboxInput {...args} className="w-[240px]" placeholder="Start typing..." />
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Combobox with autoHighlight renders", async () => {
      expect(canvas.getByPlaceholderText("Start typing...")).toBeInTheDocument()
      expect(canvas.getByRole("combobox")).toBeInTheDocument()
    })
  },
}


