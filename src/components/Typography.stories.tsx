import type { Meta, StoryObj } from "@storybook/react-vite"

// ---------------------------------------------------------------------------
// Typescale definitions — sourced from src/index.tailwind.css
// ---------------------------------------------------------------------------

interface TypescaleLevel {
  name: string
  role: string
  size: string
  cssClass: string
  lineHeight: string
  weight: number
  tracking: string
}

const TYPESCALE_LEVELS: TypescaleLevel[] = [
  { name: "Display Large",   role: "display",  size: "57px", cssClass: "text-display-lg",   lineHeight: "64px", weight: 400, tracking: "-0.25px" },
  { name: "Display Medium",  role: "display",  size: "45px", cssClass: "text-display-md",   lineHeight: "52px", weight: 400, tracking: "0px" },
  { name: "Display Small",   role: "display",  size: "36px", cssClass: "text-display-sm",   lineHeight: "44px", weight: 400, tracking: "0px" },
  { name: "Headline Large",  role: "headline", size: "32px", cssClass: "text-headline-lg",  lineHeight: "40px", weight: 400, tracking: "0px" },
  { name: "Headline Medium", role: "headline", size: "28px", cssClass: "text-headline-md",  lineHeight: "36px", weight: 400, tracking: "0px" },
  { name: "Headline Small",  role: "headline", size: "24px", cssClass: "text-headline-sm",  lineHeight: "32px", weight: 400, tracking: "0px" },
  { name: "Title Large",     role: "title",    size: "22px", cssClass: "text-title-lg",     lineHeight: "28px", weight: 500, tracking: "0px" },
  { name: "Title Medium",    role: "title",    size: "16px", cssClass: "text-title-md",     lineHeight: "24px", weight: 500, tracking: "0.15px" },
  { name: "Title Small",     role: "title",    size: "14px", cssClass: "text-title-sm",     lineHeight: "20px", weight: 500, tracking: "0.1px" },
  { name: "Body Large",      role: "body",     size: "16px", cssClass: "text-body-lg",      lineHeight: "24px", weight: 400, tracking: "0.5px" },
  { name: "Body Medium",     role: "body",     size: "14px", cssClass: "text-body-md",      lineHeight: "20px", weight: 400, tracking: "0.25px" },
  { name: "Body Small",      role: "body",     size: "12px", cssClass: "text-body-sm",      lineHeight: "16px", weight: 400, tracking: "0.4px" },
  { name: "Label Large",     role: "label",    size: "14px", cssClass: "text-label-lg",     lineHeight: "20px", weight: 500, tracking: "0.1px" },
  { name: "Label Medium",    role: "label",    size: "12px", cssClass: "text-label-md",     lineHeight: "16px", weight: 500, tracking: "0.5px" },
  { name: "Label Small",     role: "label",    size: "11px", cssClass: "text-label-sm",     lineHeight: "16px", weight: 500, tracking: "0.5px" },
]

const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog"

const ROLE_COLORS: Record<string, string> = {
  display: "bg-primary/10 text-primary",
  headline: "bg-accent/10 text-accent",
  title: "bg-positive/10 text-positive",
  body: "bg-info/10 text-info",
  label: "bg-warning/10 text-warning",
}

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

function TypographyPage() {
  let lastRole = ""

  return (
    <div className="mx-auto max-w-7xl space-y-10 p-12">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Typography Scale</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Material Design 3 typescale with 15 levels across 5 roles (Display, Headline, Title, Body, Label),
          tuned for Inter Variable. Each level is available as a single Tailwind utility class that sets
          font-size, line-height, font-weight, and letter-spacing.
        </p>
      </div>

      {/* Quick reference table */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Reference</h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Level</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Tailwind Class</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Size</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Line Height</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Weight</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Tracking</th>
              </tr>
            </thead>
            <tbody>
              {TYPESCALE_LEVELS.map((level) => {
                const showRole = level.role !== lastRole
                lastRole = level.role
                return (
                  <tr key={level.cssClass} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5">
                      {showRole && (
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[level.role]}`}>
                          {level.role}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-foreground">{level.name}</td>
                    <td className="px-4 py-2.5"><CopyButton text={level.cssClass} /></td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{level.size}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{level.lineHeight}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{level.weight}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{level.tracking}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Visual samples */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Samples</h2>
        <div className="space-y-6">
          {TYPESCALE_LEVELS.map((level) => (
            <div key={level.cssClass} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[level.role]}`}>
                  {level.role}
                </span>
                <span className="text-xs text-muted-foreground">{level.name}</span>
                <CopyButton text={level.cssClass} />
              </div>
              <p className={`${level.cssClass} text-foreground`}>
                {SAMPLE_TEXT}
              </p>
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
  title: "Foundations/Typography",
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
  render: () => <TypographyPage />,
  parameters: {
    zephyr: { testCaseId: "SW-T1471" },
  },
}
