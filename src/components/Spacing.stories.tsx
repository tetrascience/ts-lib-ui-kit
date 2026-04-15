import type { Meta, StoryObj } from "@storybook/react-vite"

// ---------------------------------------------------------------------------
// Spacing token definitions
// ---------------------------------------------------------------------------

const SPACING_SCALE = [
  { name: "none", value: "0px",  cssVar: "--sp-none", gap: "gap-sp-none", pad: "p-sp-none", margin: "m-sp-none" },
  { name: "xxs",  value: "4px",  cssVar: "--sp-xxs",  gap: "gap-sp-xxs",  pad: "p-sp-xxs",  margin: "m-sp-xxs",  desc: "Tight inline gaps" },
  { name: "xs",   value: "8px",  cssVar: "--sp-xs",   gap: "gap-sp-xs",   pad: "p-sp-xs",   margin: "m-sp-xs",   desc: "Icon-to-label, badge padding" },
  { name: "sm",   value: "12px", cssVar: "--sp-sm",   gap: "gap-sp-sm",   pad: "p-sp-sm",   margin: "m-sp-sm",   desc: "Input padding, small card gap" },
  { name: "md",   value: "16px", cssVar: "--sp-md",   gap: "gap-sp-md",   pad: "p-sp-md",   margin: "m-sp-md",   desc: "Card padding, section gap" },
  { name: "lg",   value: "24px", cssVar: "--sp-lg",   gap: "gap-sp-lg",   pad: "p-sp-lg",   margin: "m-sp-lg",   desc: "Card-to-card, group spacing" },
  { name: "xl",   value: "32px", cssVar: "--sp-xl",   gap: "gap-sp-xl",   pad: "p-sp-xl",   margin: "m-sp-xl",   desc: "Section spacing" },
  { name: "2xl",  value: "48px", cssVar: "--sp-2xl",  gap: "gap-sp-2xl",  pad: "p-sp-2xl",  margin: "m-sp-2xl",  desc: "Page-level spacing" },
  { name: "3xl",  value: "64px", cssVar: "--sp-3xl",  gap: "gap-sp-3xl",  pad: "p-sp-3xl",  margin: "m-sp-3xl",  desc: "Hero/layout spacing" },
]

const COMPONENT_SPACING = [
  { name: "Button horizontal",  value: "24px", cssVar: "--spacing-button-x" },
  { name: "Button vertical",    value: "10px", cssVar: "--spacing-button-y" },
  { name: "Button gap",         value: "8px",  cssVar: "--spacing-button-gap" },
  { name: "Card padding",       value: "16px", cssVar: "--spacing-card-padding" },
  { name: "Card gap",           value: "16px", cssVar: "--spacing-card-gap" },
  { name: "Input horizontal",   value: "16px", cssVar: "--spacing-input-x" },
  { name: "Input vertical",     value: "8px",  cssVar: "--spacing-input-y" },
  { name: "Dialog padding",     value: "24px", cssVar: "--spacing-dialog-padding" },
  { name: "List item vertical", value: "12px", cssVar: "--spacing-list-item-y" },
  { name: "List item horizontal", value: "16px", cssVar: "--spacing-list-item-x" },
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

function SpacingPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-12 p-12">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Spacing</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Material Design 3 semantic spacing tokens on a strict 4px grid.
          Use these instead of raw Tailwind spacing values for consistent, theme-aware spacing.
          Available as utility classes (e.g.{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">p-sp-md</code>,{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">gap-sp-lg</code>)
          and CSS variables.
        </p>
      </div>

      {/* Visual scale */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Scale</h2>
        <div className="space-y-3">
          {SPACING_SCALE.map((token) => {
            const px = parseInt(token.value, 10)
            return (
              <div key={token.name} className="flex items-center gap-4">
                <span className="w-12 shrink-0 text-right text-sm font-medium text-foreground">
                  {token.name}
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-6 rounded-shape-xs bg-primary"
                    style={{ width: `${Math.max(2, px * 3)}px` }}
                  />
                  <span className="text-xs font-mono text-muted-foreground">{token.value}</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Reference table */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Semantic Scale Reference</h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Token</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Value</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Gap</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Padding</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">CSS Variable</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Use Case</th>
              </tr>
            </thead>
            <tbody>
              {SPACING_SCALE.map((token) => (
                <tr key={token.name} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-foreground">{token.name}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{token.value}</td>
                  <td className="px-4 py-2.5"><CopyButton text={token.gap} /></td>
                  <td className="px-4 py-2.5"><CopyButton text={token.pad} /></td>
                  <td className="px-4 py-2.5"><CopyButton text={`var(${token.cssVar})`} /></td>
                  <td className="px-4 py-2.5 text-muted-foreground">{token.desc ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Component-level spacing */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Component Spacing</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          MD3-recommended spacing for specific component types. Override these CSS variables to
          adjust component density globally.
        </p>
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Component</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Default</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">CSS Variable</th>
              </tr>
            </thead>
            <tbody>
              {COMPONENT_SPACING.map((token) => (
                <tr key={token.name} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-foreground">{token.name}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{token.value}</td>
                  <td className="px-4 py-2.5"><CopyButton text={`var(${token.cssVar})`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Live demo */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Live Demo</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Visual comparison of spacing tokens applied as padding.
        </p>
        <div className="flex flex-wrap gap-4">
          {SPACING_SCALE.filter((t) => t.name !== "none").map((token) => (
            <div key={token.name} className="flex flex-col items-center gap-2">
              <div
                className="rounded-shape-sm border-2 border-dashed border-primary/40 bg-primary/5"
              >
                <div
                  className="rounded-shape-xs bg-primary/20 text-xs font-medium text-primary flex items-center justify-center"
                  style={{ padding: token.value, minWidth: "32px", minHeight: "32px" }}
                >
                  {token.name}
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{token.value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Storybook meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: "Foundations/Spacing",
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
  render: () => <SpacingPage />,
}
