import type { Meta, StoryObj } from "@storybook/react-vite"

// ---------------------------------------------------------------------------
// Elevation levels
// ---------------------------------------------------------------------------

const ELEVATION_LEVELS = [
  { level: 0, cssClass: "shadow-elevation-0", cssVar: "--elevation-0", description: "Flat / no shadow" },
  { level: 1, cssClass: "shadow-elevation-1", cssVar: "--elevation-1", description: "Cards, buttons at rest" },
  { level: 2, cssClass: "shadow-elevation-2", cssVar: "--elevation-2", description: "Raised cards, menus" },
  { level: 3, cssClass: "shadow-elevation-3", cssVar: "--elevation-3", description: "Navigation drawers, FABs" },
  { level: 4, cssClass: "shadow-elevation-4", cssVar: "--elevation-4", description: "App bars, elevated navigation" },
  { level: 5, cssClass: "shadow-elevation-5", cssVar: "--elevation-5", description: "Dialogs, modals" },
]

// ---------------------------------------------------------------------------
// Shape scale
// ---------------------------------------------------------------------------

const SHAPE_LEVELS = [
  { name: "Extra Small", size: "4px",    cssClass: "rounded-shape-xs",   cssVar: "--shape-xs" },
  { name: "Small",       size: "8px",    cssClass: "rounded-shape-sm",   cssVar: "--shape-sm" },
  { name: "Medium",      size: "12px",   cssClass: "rounded-shape-md",   cssVar: "--shape-md" },
  { name: "Large",       size: "16px",   cssClass: "rounded-shape-lg",   cssVar: "--shape-lg" },
  { name: "Extra Large", size: "28px",   cssClass: "rounded-shape-xl",   cssVar: "--shape-xl" },
  { name: "Full",        size: "9999px", cssClass: "rounded-shape-full", cssVar: "--shape-full" },
]

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function CopyButton({ text }: { text: string }) {
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(text)}
      className="inline-flex items-center rounded-md border border-border bg-transparent px-2 py-0.5 text-xs font-mono text-muted-foreground hover:bg-muted cursor-pointer select-all transition-colors"
      title={`Copy: ${text}`}
    >
      {text}
    </button>
  )
}

function ElevationAndShapePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-12 p-12">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Elevation & Shape</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Material Design 3 elevation (shadow) and shape (border-radius) tokens.
          Each is available as a single Tailwind utility class.
        </p>
      </div>

      {/* Elevation */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Elevation</h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {ELEVATION_LEVELS.map(({ level, cssClass, description }) => (
            <div key={level} className="flex flex-col items-center gap-3">
              <div
                className={`flex h-24 w-full items-center justify-center rounded-shape-md bg-card text-foreground ${cssClass}`}
              >
                <span className="text-lg font-medium">{level}</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <CopyButton text={cssClass} />
                <span className="text-xs text-muted-foreground">{description}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Elevation reference table */}
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Level</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Tailwind Class</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">CSS Variable</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Use Case</th>
              </tr>
            </thead>
            <tbody>
              {ELEVATION_LEVELS.map(({ level, cssClass, cssVar, description }) => (
                <tr key={level} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-foreground">Elevation {level}</td>
                  <td className="px-4 py-2.5"><CopyButton text={cssClass} /></td>
                  <td className="px-4 py-2.5"><CopyButton text={`var(${cssVar})`} /></td>
                  <td className="px-4 py-2.5 text-muted-foreground">{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Shape */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Shape</h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {SHAPE_LEVELS.map(({ name, size, cssClass }) => (
            <div key={name} className="flex flex-col items-center gap-3">
              <div
                className={`flex h-24 w-full items-center justify-center border-2 border-primary bg-primary/10 text-primary ${cssClass}`}
              >
                <span className="text-xs font-medium">{size}</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <CopyButton text={cssClass} />
                <span className="text-xs text-muted-foreground">{name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Shape reference table */}
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Value</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Tailwind Class</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">CSS Variable</th>
              </tr>
            </thead>
            <tbody>
              {SHAPE_LEVELS.map(({ name, size, cssClass, cssVar }) => (
                <tr key={name} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-foreground">{name}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{size}</td>
                  <td className="px-4 py-2.5"><CopyButton text={cssClass} /></td>
                  <td className="px-4 py-2.5"><CopyButton text={`var(${cssVar})`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Storybook meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: "Foundations/Elevation & Shape",
  tags: [],
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    actions: { disable: true },
  },
}

export default meta

type Story = StoryObj

export const Overview: Story = {
  render: () => <ElevationAndShapePage />,
  parameters: {
    zephyr: { testCaseId: "SW-T1468" },
  },
}
