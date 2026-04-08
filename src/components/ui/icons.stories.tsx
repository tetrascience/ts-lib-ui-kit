import { icons, RocketIcon, SearchIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { expect, within } from "storybook/test"

import type { Meta, StoryObj } from "@storybook/react-vite"

/**
 * This library uses [Lucide React](https://lucide.dev) for icons.
 * Lucide provides 1500+ open-source icons as individual React components.
 *
 * **Import pattern:**
 * ```tsx
 * import { SearchIcon, PlusIcon } from "lucide-react"
 * ```
 *
 * **Sizing convention:** Prefer Tailwind `size-*` classes over the `size` prop
 * for consistency with the rest of the codebase:
 * ```tsx
 * <SearchIcon className="size-4" />
 * ```
 */
function IconShowcase({
  size = 24,
  strokeWidth = 2,
  color = "currentColor",
}: {
  /** Icon size in pixels */
  size?: number
  /** Stroke width */
  strokeWidth?: number
  /** Icon color */
  color?: string
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <RocketIcon size={size} strokeWidth={strokeWidth} color={color} />
      <span className="text-muted-foreground text-sm">
        {size}px &middot; stroke {strokeWidth}
      </span>
    </div>
  )
}

const meta: Meta<typeof IconShowcase> = {
  title: "Foundations/Icons",
  component: IconShowcase,
  parameters: {
    layout: "centered",
  },
  tags: ["!autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: [16, 20, 24, 32, 48],
      description: "Icon size in pixels. In components, prefer Tailwind `size-*` classes.",
    },
    strokeWidth: {
      control: { type: "range", min: 0.5, max: 3, step: 0.25 },
      description: "SVG stroke width",
    },
    color: {
      control: { type: "color" },
      description: "Icon color (defaults to currentColor)",
    },
  },
  args: {
    size: 24,
    strokeWidth: 2,
    color: "currentColor",
  },
}

export default meta

type Story = StoryObj<typeof IconShowcase>

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Interactive demo — use the controls panel to adjust size, stroke width, and color. */
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step("Icon renders", async () => {
      expect(canvas.getByText(/px/)).toBeInTheDocument()
    })
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1414" },
  },
}

const ALL_ICON_ENTRIES = Object.entries(icons)
const MAX_VISIBLE = 120

/**
 * Search through all 1500+ Lucide icons. Type a name to filter.
 *
 * > **Note:** This story imports the entire icon set for browsing.
 * > In production code, always import individual icons to enable tree-shaking.
 */
export const AllIcons: Story = {
  parameters: {
    layout: "padded",
    zephyr: { testCaseId: "SW-T1415" },
  },
  render: function AllIconsRender({ size, strokeWidth, color }) {
    const [search, setSearch] = useState("")

    const filtered = useMemo(() => {
      if (!search) return ALL_ICON_ENTRIES.slice(0, MAX_VISIBLE)
      const lower = search.toLowerCase()
      return ALL_ICON_ENTRIES.filter(([name]) => name.toLowerCase().includes(lower)).slice(
        0,
        MAX_VISIBLE,
      )
    }, [search])

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-3">
          <SearchIcon className="text-muted-foreground size-4" />
          <input
            type="text"
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-input bg-background text-foreground placeholder:text-muted-foreground w-full max-w-sm rounded-md border px-3 py-2 text-sm"
          />
          <span className="text-muted-foreground text-xs">
            {filtered.length}
            {filtered.length >= MAX_VISIBLE ? "+" : ""} of{" "}
            {ALL_ICON_ENTRIES.length} icons
          </span>
        </div>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-12">
          {filtered.map(([name, Icon]) => (
            <div
              key={name}
              className="hover:bg-muted flex flex-col items-center gap-1.5 rounded-md p-2 transition-colors"
            >
              <Icon size={size} strokeWidth={strokeWidth} color={color} />
              <span className="text-muted-foreground max-w-full truncate text-[10px]">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  },
  play: async ({ canvasElement, step }) => {
    await step("Search input and icon grid render", async () => {
      const input = canvasElement.querySelector("input")
      expect(input).toBeInTheDocument()
      const svgs = canvasElement.querySelectorAll("svg")
      expect(svgs.length).toBeGreaterThan(10)
    })
  },
}

