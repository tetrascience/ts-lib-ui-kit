import { useState } from "react"
import { expect, userEvent, within } from "storybook/test"

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

/** Returns true when running inside the Vitest test runner (not the Storybook UI). */
const isTestRunner = () =>
  typeof import.meta !== "undefined" && !!(import.meta as Record<string, any>).env?.VITEST

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
// Stories
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: (args) => renderCombobox(args),
  parameters: {
    zephyr: { testCaseId: "SW-T1221" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("combobox")

    await step("Combobox input and placeholder render", async () => {
      expect(input).toBeInTheDocument()
      expect(canvas.getByPlaceholderText("Choose a framework")).toBeInTheDocument()
    })

    if (!isTestRunner()) return

    await step("Opens dropdown on click and shows all items", async () => {
      await userEvent.click(input)
      const listbox = await canvas.findByRole("listbox")
      expect(listbox).toBeInTheDocument()

      const options = within(listbox).getAllByRole("option")
      expect(options).toHaveLength(5)
      expect(options.map((o) => o.textContent)).toEqual([
        "Next.js",
        "SvelteKit",
        "Nuxt",
        "Remix",
        "Astro",
      ])
    })

    await step("Selects an item on click", async () => {
      const listbox = canvas.getByRole("listbox")
      const option = within(listbox).getByRole("option", { name: "Remix" })
      await userEvent.click(option)
      expect(input).toHaveValue("Remix")
    })

    await step("Dropdown closes after selection", async () => {
      expect(canvas.queryByRole("listbox")).not.toBeInTheDocument()
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
    const input = canvas.getByRole("combobox")

    await step("Combobox renders with placeholder", async () => {
      expect(canvas.getByPlaceholderText("Choose a framework")).toBeInTheDocument()
    })

    if (!isTestRunner()) return

    await step("Select an item then clear it", async () => {
      await userEvent.click(input)
      const listbox = await canvas.findByRole("listbox")
      await userEvent.click(
        within(listbox).getByRole("option", { name: "Astro" })
      )
      expect(input).toHaveValue("Astro")

      const clearButton = canvasElement.querySelector(
        '[data-slot="combobox-clear"]'
      ) as HTMLElement
      await userEvent.click(clearButton)
      expect(input).toHaveValue("")
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
    const input = canvas.getByRole("combobox")

    await step("Combobox input renders", async () => {
      expect(canvas.getByPlaceholderText("Choose a framework")).toBeInTheDocument()
      expect(input).toBeInTheDocument()
    })

    await step("Dropdown trigger is hidden", async () => {
      expect(
        canvasElement.querySelector('[data-slot="combobox-trigger"]')
      ).not.toBeInTheDocument()
    })

    if (!isTestRunner()) return

    await step("Still opens on typing", async () => {
      await userEvent.type(input, "Nu")
      const listbox = await canvas.findByRole("listbox")
      const options = within(listbox).getAllByRole("option")
      expect(options).toHaveLength(1)
      expect(options[0]).toHaveTextContent("Nuxt")
    })

    await step("Selects filtered item", async () => {
      const listbox = canvas.getByRole("listbox")
      await userEvent.click(within(listbox).getByRole("option", { name: "Nuxt" }))
      expect(input).toHaveValue("Nuxt")
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
    const input = canvas.getByRole("combobox")

    await step("Combobox renders for top alignment", async () => {
      expect(canvas.getByPlaceholderText("Choose a framework")).toBeInTheDocument()
      expect(input).toBeInTheDocument()
    })

    if (!isTestRunner()) return

    await step("Opens dropdown and positioner has side=top", async () => {
      await userEvent.click(input)
      await canvas.findByRole("listbox")
      const positioner = document.querySelector(
        '[data-side="top"]'
      )
      expect(positioner).toBeInTheDocument()
    })

    await step("Cleanup — close dropdown", async () => {
      await userEvent.keyboard("{Escape}")
    })
  },
}

// ---------------------------------------------------------------------------
// New stories
// ---------------------------------------------------------------------------

function MultipleSelectionExample() {
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
        <ComboboxChipsInput placeholder="Select frameworks..." />
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
  render: () => <MultipleSelectionExample />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("combobox")

    await step("Chips container and input render", async () => {
      expect(canvas.getByPlaceholderText("Select frameworks...")).toBeInTheDocument()
      expect(input).toBeInTheDocument()
      expect(
        canvasElement.querySelector('[data-slot="combobox-chips"]')
      ).toBeInTheDocument()
    })

    if (!isTestRunner()) return

    await step("Select multiple items", async () => {
      await userEvent.click(input)
      const listbox = await canvas.findByRole("listbox")

      await userEvent.click(
        within(listbox).getByRole("option", { name: "Next.js" })
      )
      await userEvent.click(
        within(listbox).getByRole("option", { name: "Remix" })
      )
    })

    await step("Chips appear for selected items", async () => {
      const chips = canvasElement.querySelectorAll('[data-slot="combobox-chip"]')
      expect(chips).toHaveLength(2)
      expect(chips[0]).toHaveTextContent("Next.js")
      expect(chips[1]).toHaveTextContent("Remix")
    })

    await step("Remove chip via remove button", async () => {
      const removeButtons = canvasElement.querySelectorAll(
        '[data-slot="combobox-chip-remove"]'
      )
      expect(removeButtons.length).toBeGreaterThan(0)
      await userEvent.click(removeButtons[0] as HTMLElement)

      const chips = canvasElement.querySelectorAll('[data-slot="combobox-chip"]')
      expect(chips).toHaveLength(1)
      expect(chips[0]).toHaveTextContent("Remix")
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
    const input = canvas.getByRole("combobox")

    await step("Combobox with groups renders", async () => {
      expect(canvas.getByPlaceholderText("Choose a framework")).toBeInTheDocument()
      expect(input).toBeInTheDocument()
    })

    if (!isTestRunner()) return

    await step("Opens dropdown and shows group labels", async () => {
      await userEvent.click(input)
      const listbox = await canvas.findByRole("listbox")
      expect(listbox).toBeInTheDocument()

      const labels = listbox.querySelectorAll('[data-slot="combobox-label"]')
      expect(labels).toHaveLength(3)
      expect(labels[0]).toHaveTextContent("Frontend")
      expect(labels[1]).toHaveTextContent("Full-stack")
      expect(labels[2]).toHaveTextContent("Static")
    })

    await step("Shows separators between groups", async () => {
      const listbox = canvas.getByRole("listbox")
      const separators = listbox.querySelectorAll('[data-slot="combobox-separator"]')
      expect(separators).toHaveLength(2)
    })

    await step("All items across groups are present", async () => {
      const listbox = canvas.getByRole("listbox")
      const options = within(listbox).getAllByRole("option")
      expect(options).toHaveLength(8)
    })

    await step("Select item from a group", async () => {
      const listbox = canvas.getByRole("listbox")
      await userEvent.click(
        within(listbox).getByRole("option", { name: "Eleventy" })
      )
      expect(input).toHaveValue("Eleventy")
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
    const input = canvas.getByRole("combobox")

    await step("Combobox renders with custom items placeholder", async () => {
      expect(canvas.getByPlaceholderText("Pick a build tool")).toBeInTheDocument()
      expect(input).toBeInTheDocument()
    })

    if (!isTestRunner()) return

    await step("Opens dropdown with custom rendered items", async () => {
      await userEvent.click(input)
      const listbox = await canvas.findByRole("listbox")
      const options = within(listbox).getAllByRole("option")
      expect(options).toHaveLength(5)
    })

    await step("Items display status badges", async () => {
      const listbox = canvas.getByRole("listbox")
      const badges = listbox.querySelectorAll("[data-slot='badge']")
      expect(badges).toHaveLength(5)
      expect(badges[0]).toHaveTextContent("stable")
      expect(badges[1]).toHaveTextContent("beta")
      expect(badges[2]).toHaveTextContent("deprecated")
    })

    await step("Selecting a custom item populates the input", async () => {
      const listbox = canvas.getByRole("listbox")
      await userEvent.click(
        within(listbox).getByRole("option", { name: /Turbopack/i })
      )
      expect(input).toHaveValue("Turbopack")
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
    const input = canvas.getByRole("combobox")

    await step("Input has aria-invalid attribute", async () => {
      expect(input).toHaveAttribute("aria-invalid", "true")
    })

    await step("Input group has invalid styling cue", async () => {
      const inputGroup = canvasElement.querySelector('[data-slot="input-group"]')
      expect(inputGroup).toBeInTheDocument()
      expect(input).toHaveAttribute("aria-invalid", "true")
    })

    if (!isTestRunner()) return

    await step("Still functions — can open and select", async () => {
      await userEvent.click(input)
      const listbox = await canvas.findByRole("listbox")
      await userEvent.click(
        within(listbox).getByRole("option", { name: "SvelteKit" })
      )
      expect(input).toHaveValue("SvelteKit")
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
    const input = canvas.getByRole("combobox")

    await step("Input is disabled", async () => {
      expect(input).toBeDisabled()
    })

    await step("Click does not open dropdown", async () => {
      await userEvent.click(input, { pointerEventsCheck: 0 })
      expect(canvas.queryByRole("listbox")).not.toBeInTheDocument()
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
    const input = canvas.getByRole("combobox")

    await step("Combobox with autoHighlight renders", async () => {
      expect(canvas.getByPlaceholderText("Start typing...")).toBeInTheDocument()
      expect(input).toBeInTheDocument()
    })

    if (!isTestRunner()) return

    await step("Typing opens dropdown with first item highlighted", async () => {
      await userEvent.type(input, "a")
      const listbox = await canvas.findByRole("listbox")
      expect(listbox).toBeInTheDocument()

      const highlighted = listbox.querySelector("[data-highlighted]")
      expect(highlighted).toBeInTheDocument()
    })

    await step("Enter selects the highlighted item", async () => {
      await userEvent.keyboard("{Enter}")
      expect(input).toHaveValue("Astro")
    })
  },
}

export const KeyboardNavigation: Story = {
  render: (args) => renderCombobox(args),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("combobox")

    if (!isTestRunner()) return

    await step("Focus input and open with ArrowDown", async () => {
      await userEvent.click(input)
      await userEvent.keyboard("{ArrowDown}")
      const listbox = await canvas.findByRole("listbox")
      expect(listbox).toBeInTheDocument()
    })

    await step("Navigate down with arrow keys", async () => {
      await userEvent.keyboard("{ArrowDown}")
      const listbox = canvas.getByRole("listbox")
      const highlighted = listbox.querySelector("[data-highlighted]")
      expect(highlighted).toBeInTheDocument()
    })

    await step("Select with Enter", async () => {
      await userEvent.keyboard("{Enter}")
      expect(input.getAttribute("value")).toBeTruthy()
    })

    await step("Escape closes dropdown", async () => {
      await userEvent.click(input)
      await canvas.findByRole("listbox")
      await userEvent.keyboard("{Escape}")
      expect(canvas.queryByRole("listbox")).not.toBeInTheDocument()
    })
  },
}

export const TypeToFilter: Story = {
  render: (args) => renderCombobox(args),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole("combobox")

    if (!isTestRunner()) return

    await step("Type partial text to filter items", async () => {
      await userEvent.type(input, "Sv")
      const listbox = await canvas.findByRole("listbox")
      const options = within(listbox).getAllByRole("option")
      expect(options).toHaveLength(1)
      expect(options[0]).toHaveTextContent("SvelteKit")
    })

    await step("Clear input to show all items again", async () => {
      await userEvent.clear(input)
      await userEvent.click(input)
      const listbox = await canvas.findByRole("listbox")
      const options = within(listbox).getAllByRole("option")
      expect(options).toHaveLength(5)
    })

    await step("Type non-matching text shows empty state", async () => {
      await userEvent.type(input, "zzz")
      const listbox = await canvas.findByRole("listbox")
      const options = within(listbox).queryAllByRole("option")
      expect(options).toHaveLength(0)

      const empty = document.querySelector('[data-slot="combobox-empty"]')
      expect(empty).toBeInTheDocument()
    })
  },
}
