import { Check, Copy, Info } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { cn } from "../lib/utils"

import { Alert, AlertDescription } from "./ui/alert"

import type { Meta, StoryObj } from "@storybook/react-vite"


// ---------------------------------------------------------------------------
// Token definitions — sourced from src/index.tailwind.css
// ---------------------------------------------------------------------------

interface TokenDef {
  name: string
  cssVar: string
  tailwind: string
  oklch: { light: string; dark: string }
  /** Name of the paired background token (for foreground tokens) */
  bgPair?: string
}

function t(
  name: string,
  lightOklch: string,
  darkOklch: string,
  tailwindPrefix = "bg",
  bgPair?: string,
): TokenDef {
  return {
    name,
    cssVar: `var(--${name})`,
    tailwind: `${tailwindPrefix}-${name}`,
    oklch: { light: lightOklch, dark: darkOklch },
    bgPair,
  }
}

// Pairs are kept adjacent; foreground tokens carry a reference to their bg pair
const CORE_TOKENS: TokenDef[] = [
  t("background",           "oklch(0.9665 0.0045 258.32)", "oklch(0.1909 0.0567 271.01)"),
  t("foreground",           "oklch(0.145 0 0)",            "oklch(0.985 0 0)",            "bg", "background"),
  t("card",                 "oklch(1 0 0)",                "oklch(0.2909 0.0567 271.01)"),
  t("card-foreground",      "rgba(11, 17, 45, 1)",         "oklch(0.985 0 0)",            "bg", "card"),
  t("popover",              "oklch(1 0 0)",                "oklch(0.3909 0.0567 271.01)"),
  t("popover-foreground",   "oklch(0.145 0 0)",            "oklch(0.985 0 0)",            "bg", "popover"),
  t("primary",              "oklch(0.6945 0.1622 256.49)", "oklch(0.6945 0.1622 256.49)"),
  t("primary-foreground",   "oklch(0.1909 0.0567 271.01)", "oklch(0.205 0 0)",            "bg", "primary"),
  t("secondary",            "oklch(0.4465 0.1784 269.18)", "oklch(0.5645 0.0863 251.12)"),
  t("secondary-foreground", "oklch(1 0 0)",                "oklch(0.985 0 0)",            "bg", "secondary"),
  t("muted",                "oklch(0.97 0 0)",             "oklch(0.0909 0.0567 271.01)"),
  t("muted-foreground",     "oklch(0.556 0 0)",            "oklch(0.708 0 0)",            "bg", "muted"),
  t("accent",               "oklch(0.5187 0.182 305.25)",  "oklch(0.5187 0.182 305.25)"),
  t("accent-foreground",    "oklch(1 0 0)",                "oklch(0.985 0 0)",            "bg", "accent"),
  t("info",                 "oklch(0.5645 0.0863 251.12)", "oklch(0.5645 0.0863 251.12)"),
  t("destructive",          "oklch(0.685 0.203959 23.6393)","oklch(0.704 0.191 22.216)"),
  t("positive",             "oklch(0.7 0.2787 145.59)",    "oklch(0.7 0.2787 145.59)"),
  t("warning",              "oklch(0.7676 0.1635 60.41)",  "oklch(0.7676 0.1635 60.41)"),
  t("border",               "oklch(0.922 0 0)",            "oklch(1 0 0 / 10%)"),
  t("input",                "oklch(0.922 0 0)",            "oklch(1 0 0 / 15%)"),
  t("ring",                 "oklch(0.6945 0.1622 256.49)", "oklch(0.6945 0.1622 256.49)"),
]

const CHART_TOKENS: TokenDef[] = [
  t("chart-1", "oklch(0.809 0.105 251.813)", "oklch(0.809 0.105 251.813)"),
  t("chart-2", "oklch(0.623 0.214 259.815)", "oklch(0.623 0.214 259.815)"),
  t("chart-3", "oklch(0.546 0.245 262.881)", "oklch(0.546 0.245 262.881)"),
  t("chart-4", "oklch(0.488 0.243 264.376)", "oklch(0.488 0.243 264.376)"),
  t("chart-5", "oklch(0.424 0.199 265.638)", "oklch(0.424 0.199 265.638)"),
]

const SIDEBAR_TOKENS: TokenDef[] = [
  t("sidebar",                      "oklch(0.985 0 0)",            "oklch(0.205 0 0)"),
  t("sidebar-foreground",           "oklch(0.145 0 0)",            "oklch(0.985 0 0)",            "bg", "sidebar"),
  t("sidebar-accent",               "oklch(0.97 0 0)",             "oklch(0.269 0 0)"),
  t("sidebar-accent-foreground",    "oklch(0.205 0 0)",            "oklch(0.985 0 0)",            "bg", "sidebar-accent"),
  t("sidebar-border",               "oklch(0.922 0 0)",            "oklch(1 0 0 / 10%)"),
  t("sidebar-ring",                 "oklch(0.708 0 0)",            "oklch(0.556 0 0)"),
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve a CSS color string to an rgba() string via an off-screen canvas. */
function colorToRgba(color: string): string {
  const canvas = document.createElement("canvas")
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext("2d")
  if (!ctx) return color
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
  return a === 255
    ? `rgb(${r}, ${g}, ${b})`
    : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`
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
 */
function Swatch({
  token,
  resolvedValues,
  isDark,
  allTokens,
}: {
  token: TokenDef
  resolvedValues: Map<string, { computed: string; rgba: string }>
  isDark: boolean
  allTokens: TokenDef[]
}) {
  const fgComputed = resolvedValues.get(token.name)?.computed
  const fgColor = fgComputed ?? (isDark ? token.oklch.dark : token.oklch.light)

  if (token.bgPair) {
    const bgToken = allTokens.find((t) => t.name === token.bgPair)
    const bgComputed = resolvedValues.get(token.bgPair)?.computed
    const bgColor =
      bgComputed ?? (bgToken ? (isDark ? bgToken.oklch.dark : bgToken.oklch.light) : "transparent")

    return (
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border shadow-sm text-xs font-bold"
        style={{ backgroundColor: bgColor, color: fgColor }}
      >
        Aa
      </div>
    )
  }

  return (
    <div
      className="size-8 shrink-0 rounded-md border border-border shadow-sm"
      style={{ backgroundColor: fgColor }}
    />
  )
}

function TokenTable({
  title,
  tokens,
  resolvedValues,
  allTokens,
}: {
  title: string
  tokens: TokenDef[]
  resolvedValues: Map<string, { computed: string; rgba: string }>
  allTokens: TokenDef[]
}) {
  const isDark = document.documentElement.classList.contains("dark")

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
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">RGBA</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token, i) => {
              const resolved = resolvedValues.get(token.name)
              const oklchValue = isDark ? token.oklch.dark : token.oklch.light

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
                    <Swatch
                      token={token}
                      resolvedValues={resolvedValues}
                      isDark={isDark}
                      allTokens={allTokens}
                    />
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
                  {/* oklch */}
                  <td className="px-4 py-2.5">
                    <CopyButton text={oklchValue} />
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
  const [resolvedValues, setResolvedValues] = useState<
    Map<string, { computed: string; rgba: string }>
  >(new Map())
  const [, setTick] = useState(0)
  const allTokens = useMemo(
    () => [...CORE_TOKENS, ...CHART_TOKENS, ...SIDEBAR_TOKENS],
    [],
  )
  const rafRef = useRef(0)

  const resolve = useCallback(() => {
    const map = new Map<string, { computed: string; rgba: string }>()
    for (const token of allTokens) {
      const computed = getTokenValue(token.name)
      const rgba = computed ? colorToRgba(computed) : "—"
      map.set(token.name, { computed, rgba })
    }
    setResolvedValues(map)
  }, [allTokens])

  useEffect(() => {
    resolve()

    const mo = new MutationObserver(() => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        resolve()
        setTick((n) => n + 1)
      })
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
        allTokens={allTokens}
      />
      <TokenTable
        title="Chart Colors"
        tokens={CHART_TOKENS}
        resolvedValues={resolvedValues}
        allTokens={allTokens}
      />
      <TokenTable
        title="Sidebar Colors"
        tokens={SIDEBAR_TOKENS}
        resolvedValues={resolvedValues}
        allTokens={allTokens}
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
}
