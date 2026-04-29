import { Check, Copy, Info } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { cn } from "../lib/utils"

import { Alert, AlertDescription } from "./ui/alert"

import type { Meta, StoryObj } from "@storybook/react-vite"


// ---------------------------------------------------------------------------
// Token definitions — names only; all colour values are read live from
// src/index.tailwind.css via getComputedStyle so the table can never drift
// from the source of truth.
// ---------------------------------------------------------------------------

interface TokenDef {
  name: string
  cssVar: string
  tailwind: string
  /** Name of the paired background token (for foreground tokens) */
  bgPair?: string
}

function t(name: string, tailwindPrefix = "bg", bgPair?: string): TokenDef {
  return {
    name,
    cssVar: `var(--${name})`,
    tailwind: `${tailwindPrefix}-${name}`,
    bgPair,
  }
}

// Pairs are kept adjacent; foreground tokens carry a reference to their bg pair
const CORE_TOKENS: TokenDef[] = [
  t("background"),
  t("foreground",           "bg", "background"),
  t("card"),
  t("card-foreground",      "bg", "card"),
  t("popover"),
  t("popover-foreground",   "bg", "popover"),
  t("primary"),
  t("primary-foreground",   "bg", "primary"),
  t("secondary"),
  t("secondary-foreground", "bg", "secondary"),
  t("muted"),
  t("muted-foreground",     "bg", "muted"),
  t("accent"),
  t("accent-foreground",    "bg", "accent"),
  t("tertiary"),
  t("tertiary-foreground",  "bg", "tertiary"),
  t("info"),
  t("destructive"),
  t("positive"),
  t("warning"),
  t("border"),
  t("input"),
  t("ring"),
]

// MD3 color role aliases — these reference existing tokens via var() but
// expose the Material Design 3 naming convention for consumers.
const MD3_ROLE_TOKENS: TokenDef[] = [
  t("outline"),
  t("outline-variant"),
  t("on-primary",                "text"),
  t("on-secondary",              "text"),
  t("on-surface",                "text"),
  t("on-error",                  "text"),
  t("surface"),
  t("surface-foreground",        "bg", "surface"),
  t("surface-tint"),
  t("surface-dim"),
  t("surface-bright"),
  t("surface-container"),
  t("surface-container-low"),
  t("surface-container-high"),
  t("surface-container-highest"),
]

const CHART_TOKENS: TokenDef[] = [
  t("chart-1"),
  t("chart-2"),
  t("chart-3"),
  t("chart-4"),
  t("chart-5"),
]

const SIDEBAR_TOKENS: TokenDef[] = [
  t("sidebar"),
  t("sidebar-foreground",        "bg", "sidebar"),
  t("sidebar-primary"),
  t("sidebar-primary-foreground","bg", "sidebar-primary"),
  t("sidebar-accent"),
  t("sidebar-accent-foreground", "bg", "sidebar-accent"),
  t("sidebar-border"),
  t("sidebar-ring"),
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface ResolvedToken {
  /** Raw computed value of the CSS custom property (e.g. `oklch(...)`) */
  oklch: string
  rgba: string
  hex: string
}

/** Resolve a CSS color string to rgba + hex via an off-screen canvas. */
function colorToParts(color: string): { rgba: string; hex: string } {
  const canvas = document.createElement("canvas")
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext("2d")
  if (!ctx) return { rgba: color, hex: color }
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
  const rgba = a === 255
    ? `rgb(${r}, ${g}, ${b})`
    : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`
  const hex = `#${[r, g, b]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`
  return { rgba, hex }
}

/** Read the current computed value of a CSS custom property. */
function getTokenValue(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--${name}`)
    .trim()
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [text])

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-mono transition-colors",
        "hover:bg-muted cursor-pointer select-all",
        copied
          ? "border-positive/40 bg-positive/10 text-positive"
          : "border-border bg-transparent text-muted-foreground",
      )}
      title={`Copy: ${text}`}
    >
      {copied ? (
        <Check className="size-3 shrink-0" />
      ) : (
        <Copy className="size-3 shrink-0" />
      )}
      {text}
    </button>
  )
}

/**
 * Swatch cell.
 * - Foreground tokens: "Aa" text in fg color on the paired bg color.
 * - All others: solid color block.
 *
 * Uses `var(--token)` directly so the swatch never lags behind theme changes.
 */
function Swatch({ token }: { token: TokenDef }) {
  if (token.bgPair) {
    return (
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border shadow-sm text-xs font-bold"
        style={{
          backgroundColor: `var(--${token.bgPair})`,
          color: `var(--${token.name})`,
        }}
      >
        Aa
      </div>
    )
  }

  return (
    <div
      className="size-8 shrink-0 rounded-md border border-border shadow-sm"
      style={{ backgroundColor: `var(--${token.name})` }}
    />
  )
}

function TokenTable({
  title,
  tokens,
  resolvedValues,
}: {
  title: string
  tokens: TokenDef[]
  resolvedValues: Map<string, ResolvedToken>
}) {
  // Determine which tokens start a new visual group (bg token followed by fg pair)
  const groupStarters = new Set<string>()
  tokens.forEach((token, i) => {
    if (i > 0 && token.bgPair && tokens[i - 1].name === token.bgPair) {
      groupStarters.add(token.bgPair) // the bg token starts this group
    }
  })

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Swatch</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Token</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">CSS Variable</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Tailwind Class</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">oklch</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Hex</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">RGBA</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token, i) => {
              const resolved = resolvedValues.get(token.name)

              // Foreground tokens get a slightly indented, muted background to visually nest under their pair
              const isFgRow = !!token.bgPair && i > 0 && tokens[i - 1].name === token.bgPair
              // Add a top border separator before a new non-paired group
              const isGroupSeparator =
                i > 0 && !token.bgPair && !tokens[i - 1].bgPair &&
                (groupStarters.has(tokens[i - 1].name) === false)

              return (
                <tr
                  key={token.name}
                  className={cn(
                    "border-b border-border last:border-b-0 transition-colors",
                    isFgRow ? "bg-muted/20 hover:bg-muted/40" : "hover:bg-muted/30",
                    isGroupSeparator && "border-t-2",
                  )}
                >
                  {/* Swatch */}
                  <td className="px-4 py-2.5">
                    <Swatch token={token} />
                  </td>
                  {/* Token Name */}
                  <td className={cn("px-4 py-2.5 font-medium", isFgRow ? "text-muted-foreground" : "text-foreground")}>
                    {token.name}
                  </td>
                  {/* CSS Variable */}
                  <td className="px-4 py-2.5">
                    <CopyButton text={token.cssVar} />
                  </td>
                  {/* Tailwind Class */}
                  <td className="px-4 py-2.5">
                    <CopyButton text={token.tailwind} />
                  </td>
                  {/* oklch (live from getComputedStyle) */}
                  <td className="px-4 py-2.5">
                    {resolved?.oklch ? (
                      <CopyButton text={resolved.oklch} />
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  {/* Hex */}
                  <td className="px-4 py-2.5">
                    {resolved?.hex ? (
                      <CopyButton text={resolved.hex} />
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  {/* RGBA */}
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-xs text-muted-foreground">
                      {resolved?.rgba ?? "—"}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function DesignTokensPage() {
  const [resolvedValues, setResolvedValues] = useState<Map<string, ResolvedToken>>(
    new Map(),
  )
  const allTokens = useMemo(
    () => [...CORE_TOKENS, ...MD3_ROLE_TOKENS, ...CHART_TOKENS, ...SIDEBAR_TOKENS],
    [],
  )
  const rafRef = useRef(0)

  const resolve = useCallback(() => {
    const map = new Map<string, ResolvedToken>()
    for (const token of allTokens) {
      const oklch = getTokenValue(token.name)
      if (!oklch) {
        map.set(token.name, { oklch: "", rgba: "—", hex: "" })
        continue
      }
      const { rgba, hex } = colorToParts(oklch)
      map.set(token.name, { oklch, rgba, hex })
    }
    setResolvedValues(map)
  }, [allTokens])

  useEffect(() => {
    resolve()

    const mo = new MutationObserver(() => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(resolve)
    })
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => {
      mo.disconnect()
      cancelAnimationFrame(rafRef.current)
    }
  }, [resolve])

  return (
    <div className="mx-auto max-w-7xl space-y-10 p-12">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Design Tokens</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Semantic color tokens following{" "}
          <a href="https://ui.shadcn.com/docs/theming" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">
            shadcn/ui conventions
          </a>
          , defined in{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">src/index.tailwind.css</code>
          {" "}and automatically available as Tailwind utility classes.
          Light and dark values are set via CSS custom properties — no configuration required.
        </p>
        <Alert className="max-w-2xl">
          <Info className="size-4" />
          <AlertDescription>
            Prefer the <span className="font-medium text-foreground">Tailwind class</span> (e.g.{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">bg-primary</code>,{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">text-muted-foreground</code>)
            {" "}over raw CSS variables for better semantics and dark mode support. Click any value to copy. Toggle dark mode to see dark theme values.
          </AlertDescription>
        </Alert>
      </div>

      <TokenTable
        title="Core Colors"
        tokens={CORE_TOKENS}
        resolvedValues={resolvedValues}
      />
      <TokenTable
        title="MD3 Color Role Aliases"
        tokens={MD3_ROLE_TOKENS}
        resolvedValues={resolvedValues}
      />
      <TokenTable
        title="Chart Colors"
        tokens={CHART_TOKENS}
        resolvedValues={resolvedValues}
      />
      <TokenTable
        title="Sidebar Colors"
        tokens={SIDEBAR_TOKENS}
        resolvedValues={resolvedValues}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Storybook meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: "Foundations/Design Tokens",
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
  render: () => <DesignTokensPage />,
  parameters: {
    zephyr: { testCaseId: "SW-T1467" },
  },
}
