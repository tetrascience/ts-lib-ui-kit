import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ReactNode } from "react"

// ---------------------------------------------------------------------------
// Typography reference — Inter Variable on the Tailwind font-size scale.
// The kit intentionally has NO custom type scale (see DESIGN.md); components
// compose Tailwind's `text-*` size + `font-*` weight utilities directly, plus
// the `text-2xs` (10px) extension for dense UI. SW-2254 retired the former
// (unused) MD3 typescale utilities.
// ---------------------------------------------------------------------------

const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog"

interface FontSize {
  cssClass: string
  size: string
  note: string
  tag?: "New" | "Default"
}

// Tailwind v4 built-in font sizes; only `text-2xs` is custom (src/index.tailwind.css).
const FONT_SIZES: FontSize[] = [
  { cssClass: "text-2xs", size: "10px", note: "Dense labels, chips, chart axis ticks, table metadata", tag: "New" },
  { cssClass: "text-xs", size: "12px", note: "Captions, badges, secondary metadata" },
  { cssClass: "text-sm", size: "14px", note: "Default body & UI text — the most common size", tag: "Default" },
  { cssClass: "text-base", size: "16px", note: "Inputs, emphasized body, small titles" },
  { cssClass: "text-lg", size: "18px", note: "Sub-headings" },
  { cssClass: "text-xl", size: "20px", note: "Section headings" },
  { cssClass: "text-2xl", size: "24px", note: "Page titles" },
  { cssClass: "text-3xl", size: "30px", note: "Display headings" },
  { cssClass: "text-4xl", size: "36px", note: "Largest — hero / marketing" },
]

interface FontWeight {
  cssClass: string
  weight: number
  note: string
}

// Inter Variable ships the full 100–900 range; these are the weights the kit uses.
const FONT_WEIGHTS: FontWeight[] = [
  { cssClass: "font-normal", weight: 400, note: "Body text" },
  { cssClass: "font-medium", weight: 500, note: "Labels, buttons, emphasis" },
  { cssClass: "font-semibold", weight: 600, note: "Section headings" },
  { cssClass: "font-bold", weight: 700, note: "Page titles" },
]

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function Code({ children }: { children: ReactNode }) {
  return <code className="rounded bg-muted px-1 py-0.5 text-xs">{children}</code>
}

function CopyButton({ text }: { text: string }) {
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(text)}
      className="inline-flex items-center whitespace-nowrap rounded-md border border-border bg-transparent px-2 py-0.5 text-xs font-mono text-muted-foreground hover:bg-muted cursor-pointer select-all transition-colors"
      title={`Copy: ${text}`}
    >
      {text}
    </button>
  )
}

function TagBadge({ tag }: { tag: "New" | "Default" }) {
  const cls = tag === "New" ? "bg-positive/10 text-positive" : "bg-info/10 text-info"
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{tag}</span>
}

const TH = "px-4 py-2.5 text-left font-medium text-muted-foreground"
const TD = "px-4 py-2.5"
const TR = "border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"

function TypographyPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-10 p-12">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Typography</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          The UI kit uses <span className="font-medium text-foreground">Inter Variable</span> on Tailwind's
          native font-size scale — there is no custom type scale. Compose size and weight utilities directly
          (e.g. <Code>text-sm font-medium</Code>). The one addition is <Code>text-2xs</Code> (10px) for dense UI.
        </p>
      </div>

      {/* Font family */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Font Family</h2>
        <div className="space-y-1 rounded-lg border border-border bg-card p-6">
          <p className="text-3xl text-foreground">Inter Variable</p>
          <p className="text-sm text-muted-foreground">
            Self-hosted variable font (weights 100–900), applied globally via <Code>--font-sans</Code> /{" "}
            <Code>font-sans</Code>.
          </p>
        </div>
      </section>

      {/* Font sizes */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Font Sizes</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Tailwind's built-in <Code>text-*</Code> scale, plus the kit's <Code>text-2xs</Code>. Sized for
          data-dense scientific UIs — <Code>text-sm</Code> is the de-facto body size.
        </p>
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className={TH}>Tailwind Class</th>
                <th className={TH}>Size</th>
                <th className={TH}>Sample</th>
                <th className={TH}>Usage</th>
              </tr>
            </thead>
            <tbody>
              {FONT_SIZES.map((s) => (
                <tr key={s.cssClass} className={TR}>
                  <td className={TD}>
                    <div className="flex items-center gap-2">
                      <CopyButton text={s.cssClass} />
                      {s.tag && <TagBadge tag={s.tag} />}
                    </div>
                  </td>
                  <td className={`${TD} font-mono text-xs text-muted-foreground`}>{s.size}</td>
                  <td className={TD}>
                    <span className={`${s.cssClass} text-foreground`}>{SAMPLE_TEXT}</span>
                  </td>
                  <td className={`${TD} text-xs text-muted-foreground`}>{s.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Font weights */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Font Weights</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Inter Variable supports 100–900; these are the weights the kit uses. Pair with any size.
        </p>
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className={TH}>Tailwind Class</th>
                <th className={TH}>Weight</th>
                <th className={TH}>Sample</th>
                <th className={TH}>Usage</th>
              </tr>
            </thead>
            <tbody>
              {FONT_WEIGHTS.map((w) => (
                <tr key={w.cssClass} className={TR}>
                  <td className={TD}>
                    <CopyButton text={w.cssClass} />
                  </td>
                  <td className={`${TD} font-mono text-xs text-muted-foreground`}>{w.weight}</td>
                  <td className={TD}>
                    <span className={`text-lg ${w.cssClass} text-foreground`}>{SAMPLE_TEXT}</span>
                  </td>
                  <td className={`${TD} text-xs text-muted-foreground`}>{w.note}</td>
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
