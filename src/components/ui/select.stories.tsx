import { expect, userEvent, within } from "storybook/test"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select"

import type { Meta, StoryObj } from "@storybook/react-vite"


const meta: Meta<typeof SelectTrigger> = {
  title: "Components/Select",
  component: SelectTrigger,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["default", "sm"],
    },
  },
  args: {
    size: "default",
  },
}

export default meta

type Story = StoryObj<typeof SelectTrigger>

function renderSelect(args: Story["args"]) {
  return (
    <Select defaultValue="workspace">
      <SelectTrigger {...args} className="w-[220px]">
        <SelectValue placeholder="Choose a destination" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="workspace">Workspace</SelectItem>
        <SelectItem value="report">Report</SelectItem>
        <SelectItem value="archive">Archive</SelectItem>
      </SelectContent>
    </Select>
  )
}

export const Default: Story = {
  render: renderSelect,
  parameters: {
    zephyr: { testCaseId: "SW-T1280" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Select trigger renders", async () => {
      expect(canvas.getByRole("combobox")).toBeInTheDocument()
    })

    await step("Selected value is shown", async () => {
      expect(canvas.getByText("Workspace")).toBeInTheDocument()
    })
  },
}

export const Small: Story = {
  args: {
    size: "sm",
  },
  render: renderSelect,
  parameters: {
    zephyr: { testCaseId: "SW-T1281" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Select trigger renders", async () => {
      expect(canvas.getByRole("combobox")).toBeInTheDocument()
    })

    await step("Selected value is shown", async () => {
      expect(canvas.getByText("Workspace")).toBeInTheDocument()
    })
  },
}

function renderUncontrolledSelect(args: Story["args"]) {
  return (
    <Select>
      <SelectTrigger {...args} className="w-[220px]">
        <SelectValue placeholder="Choose a destination" />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value="workspace">Workspace</SelectItem>
        <SelectItem value="report">Report</SelectItem>
        <SelectItem value="archive">Archive</SelectItem>
      </SelectContent>
    </Select>
  )
}

export const OpenAndSelect: Story = {
  render: renderUncontrolledSelect,
  parameters: {
    zephyr: { testCaseId: "SW-T1282" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Shows placeholder before selection", async () => {
      expect(canvas.getByText("Choose a destination")).toBeInTheDocument()
    })

    await step("Opens dropdown on click", async () => {
      await userEvent.click(canvas.getByRole("combobox"))
      const listbox = await within(document.body).findByRole("listbox")
      expect(listbox).toBeInTheDocument()
    })

    await step("Displays all options", async () => {
      const body = within(document.body)
      expect(body.getByText("Workspace")).toBeInTheDocument()
      expect(body.getByText("Report")).toBeInTheDocument()
      expect(body.getByText("Archive")).toBeInTheDocument()
    })

    await step("Selects an item on click", async () => {
      const body = within(document.body)
      await userEvent.click(body.getByText("Report"))
      expect(canvas.getByText("Report")).toBeInTheDocument()
    })
  },
}

export const KeyboardNavigation: Story = {
  render: renderUncontrolledSelect,
  parameters: {
    zephyr: { testCaseId: "SW-T1283" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("combobox")

    await step("Trigger is focusable", async () => {
      trigger.focus()
      expect(document.activeElement).toBe(trigger)
    })

    await step("Opens with Space key and shows options", async () => {
      await userEvent.keyboard(" ")
      const listbox = await within(document.body).findByRole("listbox")
      expect(listbox).toBeInTheDocument()
      const options = within(document.body).getAllByRole("option")
      expect(options.length).toBe(3)
    })

    await step("Closes with Escape", async () => {
      await userEvent.keyboard("{Escape}")
      expect(within(document.body).queryByRole("listbox")).not.toBeInTheDocument()
    })
  },
}

function renderDisabledSelect(args: Story["args"]) {
  return (
    <Select disabled>
      <SelectTrigger {...args} className="w-[220px]">
        <SelectValue placeholder="Choose a destination" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="workspace">Workspace</SelectItem>
        <SelectItem value="report">Report</SelectItem>
      </SelectContent>
    </Select>
  )
}

export const Disabled: Story = {
  render: renderDisabledSelect,
  parameters: {
    zephyr: { testCaseId: "SW-T1284" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Trigger is disabled", async () => {
      const trigger = canvas.getByRole("combobox")
      expect(trigger).toBeDisabled()
    })
  },
}

function renderDisabledItemSelect(args: Story["args"]) {
  return (
    <Select>
      <SelectTrigger {...args} className="w-[220px]">
        <SelectValue placeholder="Choose a destination" />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value="workspace">Workspace</SelectItem>
        <SelectItem value="report" disabled>
          Report (unavailable)
        </SelectItem>
        <SelectItem value="archive">Archive</SelectItem>
      </SelectContent>
    </Select>
  )
}

export const DisabledItem: Story = {
  render: renderDisabledItemSelect,
  parameters: {
    zephyr: { testCaseId: "SW-T1285" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Opens dropdown", async () => {
      await userEvent.click(canvas.getByRole("combobox"))
      const listbox = await within(document.body).findByRole("listbox")
      expect(listbox).toBeInTheDocument()
    })

    await step("Disabled item has correct attribute", async () => {
      const body = within(document.body)
      const disabledOption = body.getByRole("option", { name: "Report (unavailable)" })
      expect(disabledOption).toHaveAttribute("data-disabled")
    })
  },
}

function renderGroupedSelect(args: Story["args"]) {
  return (
    <Select>
      <SelectTrigger {...args} className="w-[220px]">
        <SelectValue placeholder="Choose a destination" />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectGroup>
          <SelectLabel>Data Targets</SelectLabel>
          <SelectItem value="workspace">Workspace</SelectItem>
          <SelectItem value="report">Report</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Storage</SelectLabel>
          <SelectItem value="archive">Archive</SelectItem>
          <SelectItem value="cold-storage">Cold Storage</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export const Grouped: Story = {
  render: renderGroupedSelect,
  parameters: {
    zephyr: { testCaseId: "SW-T1286" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Opens and shows groups with labels", async () => {
      await userEvent.click(canvas.getByRole("combobox"))
      const body = within(document.body)
      await body.findByRole("listbox")
      expect(body.getByText("Data Targets")).toBeInTheDocument()
      expect(body.getByText("Storage")).toBeInTheDocument()
    })

    await step("Shows items in each group", async () => {
      const body = within(document.body)
      expect(body.getByText("Workspace")).toBeInTheDocument()
      expect(body.getByText("Cold Storage")).toBeInTheDocument()
    })

    await step("Separator exists between groups", async () => {
      const separator = document.body.querySelector('[data-slot="select-separator"]')
      expect(separator).toBeTruthy()
    })

    await step("Can select from second group", async () => {
      const body = within(document.body)
      await userEvent.click(body.getByText("Cold Storage"))
      expect(canvas.getByText("Cold Storage")).toBeInTheDocument()
    })
  },
}

function renderManyItemsSelect(args: Story["args"]) {
  const items = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`)
  return (
    <Select>
      <SelectTrigger {...args} className="w-[220px]">
        <SelectValue placeholder="Select an item" />
      </SelectTrigger>
      <SelectContent position="popper">
        {items.map((item) => (
          <SelectItem key={item} value={item.toLowerCase().replace(/\s/g, "-")}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export const ManyItems: Story = {
  render: renderManyItemsSelect,
  parameters: {
    zephyr: { testCaseId: "SW-T1287" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step("Opens with many items", async () => {
      await userEvent.click(canvas.getByRole("combobox"))
      const listbox = await within(document.body).findByRole("listbox")
      expect(listbox).toBeInTheDocument()
    })

    await step("First and last items are present", async () => {
      const body = within(document.body)
      expect(body.getByText("Item 1")).toBeInTheDocument()
      expect(body.getByText("Item 20")).toBeInTheDocument()
    })

    await step("Can select an item from the list", async () => {
      const body = within(document.body)
      await userEvent.click(body.getByText("Item 15"))
      expect(canvas.getByText("Item 15")).toBeInTheDocument()
    })
  },
}
