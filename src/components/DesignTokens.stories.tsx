import { Check, Copy, Info } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { expect } from "storybook/test";

import { cn } from "../lib/utils";

import { Alert, AlertDescription } from "./ui/alert";

import type { Meta, StoryObj } from "@storybook/react-vite";

// ---------------------------------------------------------------------------
// Token definitions — names only; all colour values are read live from
// src/index.tailwind.css via getComputedStyle so the table can never drift
// from the source of truth.
// ---------------------------------------------------------------------------

interface TokenDef {
  name: string;
  cssVar: string;
  tailwind: string;
  /** Name of the paired background token (for foreground tokens) */
  bgPair?: string;
}

function t(name: string, tailwindPrefix = "bg", bgPair?: string): TokenDef {
  return {
    name,
    cssVar: `var(--${name})`,
    tailwind: `${tailwindPrefix}-${name}`,
    bgPair,
  };
}

// Pairs are kept adjacent; foreground tokens carry a reference to their bg pair
const CORE_TOKENS: TokenDef[] = [
  t("background"),
  t("foreground", "bg", "background"),
  t("card"),
  t("card-foreground", "bg", "card"),
  t("popover"),
  t("popover-foreground", "bg", "popover"),
  t("primary"),
  t("primary-foreground", "bg", "primary"),
  t("secondary"),
  t("secondary-foreground", "bg", "secondary"),
  t("muted"),
  t("muted-foreground", "bg", "muted"),
  t("accent"),
  t("accent-foreground", "bg", "accent"),
  t("tertiary"),
  t("tertiary-foreground", "bg", "tertiary"),
  t("info"),
  t("destructive"),
  t("positive"),
  t("warning"),
  t("border"),
  t("input"),
  t("ring"),
];

// MD3 color role aliases — these reference existing tokens via var() but
// expose the Material Design 3 naming convention for consumers.
const MD3_ROLE_TOKENS: TokenDef[] = [
  t("outline"),
  t("outline-variant"),
  t("on-primary", "text"),
  t("on-secondary", "text"),
  t("on-surface", "text"),
  t("on-error", "text"),
  t("surface"),
  t("surface-foreground", "bg", "surface"),
  t("surface-tint"),
  t("surface-dim"),
  t("surface-bright"),
  t("surface-container"),
  t("surface-container-low"),
  t("surface-container-high"),
  t("surface-container-highest"),
];

const CHART_TOKENS: TokenDef[] = [
  t("chart-1"),
  t("chart-2"),
  t("chart-3"),
  t("chart-4"),
  t("chart-5"),
  t("chart-6"),
  t("chart-7"),
  t("chart-8"),
  t("chart-9"),
  t("chart-10"),
  t("chart-11"),
  t("chart-12"),
];

const SIDEBAR_TOKENS: TokenDef[] = [
  t("sidebar"),
  t("sidebar-foreground", "bg", "sidebar"),
  t("sidebar-primary"),
  t("sidebar-primary-foreground", "bg", "sidebar-primary"),
  t("sidebar-accent"),
  t("sidebar-accent-foreground", "bg", "sidebar-accent"),
  t("sidebar-border"),
  t("sidebar-ring"),
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface ResolvedToken {
  /** Raw computed value of the CSS custom property (e.g. `oklch(...)`) */
  oklch: string;
  rgba: string;
  hex: string;
}

/** Resolve a CSS color string to rgba + hex via an off-screen canvas. */
function colorToParts(color: string): { rgba: string; hex: string } {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { rgba: color, hex: "" };
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  const rgba = a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
  const hex = `#${[r, g, b]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
  return { rgba, hex };
}

/**
 * Read the current computed value of a CSS custom property.
 *
 * Reads from a probe element rather than assuming the theme class is applied
 * to `document.documentElement`. This ensures the lookup happens inside
 * whatever element receives `.dark`, so the computed custom properties
 * reflect the active theme via normal inheritance.
 */
function getTokenValue(el: Element, name: string): string {
  return getComputedStyle(el).getPropertyValue(`--${name}`).trim();
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

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
      {copied ? <Check className="size-3 shrink-0" /> : <Copy className="size-3 shrink-0" />}
      {text}
    </button>
  );
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
    );
  }

  return (
    <div
      className="size-8 shrink-0 rounded-md border border-border shadow-sm"
      style={{ backgroundColor: `var(--${token.name})` }}
    />
  );
}

function TokenTable({
  title,
  tokens,
  resolvedValues,
}: {
  title: string;
  tokens: TokenDef[];
  resolvedValues: Map<string, ResolvedToken>;
}) {
  // Determine which tokens start a new visual group (bg token followed by fg pair)
  const groupStarters = new Set<string>();
  tokens.forEach((token, i) => {
    if (i > 0 && token.bgPair && tokens[i - 1].name === token.bgPair) {
      groupStarters.add(token.bgPair); // the bg token starts this group
    }
  });

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
              const resolved = resolvedValues.get(token.name);

              // Foreground tokens get a slightly indented, muted background to visually nest under their pair
              const isFgRow = !!token.bgPair && i > 0 && tokens[i - 1].name === token.bgPair;
              // Add a top border separator before a new non-paired group
              const isGroupSeparator =
                i > 0 && !token.bgPair && !tokens[i - 1].bgPair && groupStarters.has(tokens[i - 1].name) === false;

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
                    <span className="font-mono text-xs text-muted-foreground">{resolved?.rgba ?? "—"}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const CHART_RAMPS: { label: string; prefix: string }[] = [
  { label: "Sequential — Blue", prefix: "chart-seq-blue" },
  { label: "Sequential — Teal", prefix: "chart-seq-teal" },
  { label: "Sequential — Purple", prefix: "chart-seq-purple" },
  { label: "Diverging — Blue → Orange", prefix: "chart-div-blue-orange" },
  { label: "Diverging — Teal → Magenta", prefix: "chart-div-teal-magenta" },
  { label: "Diverging — Purple → Yellow-Green", prefix: "chart-div-purple-yellowgreen" },
];

// Sequential & diverging ramps rendered as 12-step strips (a 72-row table would
// be unwieldy). Each segment is driven directly by its --chart-{prefix}-NN var.
function ChartRamps() {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Chart Ramps</h2>
      <p className="max-w-2xl text-sm text-muted-foreground">
        CVD-friendly continuous palettes for heatmaps and gradients. Tuned for white / Light Gray backgrounds; on dark
        surfaces lift the bottom 2–3 steps. Available as{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">var(--chart-seq-blue-01)</code> … and as{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">CHART_SEQUENTIAL</code> /{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">CHART_DIVERGING</code> arrays for chart colorscales.
      </p>
      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        {CHART_RAMPS.map((r) => (
          <div key={r.prefix} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{r.label}</span>
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">--{r.prefix}-01 … 12</code>
            </div>
            <div className="flex h-8 overflow-hidden rounded-md border border-border">
              {Array.from({ length: 12 }, (_, i) => {
                const v = `--${r.prefix}-${String(i + 1).padStart(2, "0")}`;
                return <div key={v} className="flex-1" style={{ backgroundColor: `var(${v})` }} title={v} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DesignTokensPage() {
  const [resolvedValues, setResolvedValues] = useState<Map<string, ResolvedToken>>(new Map());
  const probeRef = useRef<HTMLDivElement>(null);
  const allTokens = useMemo(() => [...CORE_TOKENS, ...MD3_ROLE_TOKENS, ...CHART_TOKENS, ...SIDEBAR_TOKENS], []);
  const rafRef = useRef(0);

  const resolve = useCallback(() => {
    const probe = probeRef.current;
    if (!probe) return;
    const map = new Map<string, ResolvedToken>();
    for (const token of allTokens) {
      const oklch = getTokenValue(probe, token.name);
      if (!oklch) {
        map.set(token.name, { oklch: "", rgba: "—", hex: "" });
        continue;
      }
      const { rgba, hex } = colorToParts(oklch);
      map.set(token.name, { oklch, rgba, hex });
    }
    setResolvedValues(map);
  }, [allTokens]);

  useEffect(() => {
    resolve();

    const mo = new MutationObserver(() => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(resolve);
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      mo.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [resolve]);

  return (
    <div className="mx-auto max-w-7xl space-y-10 p-12">
      {/* Hidden probe element used to read computed CSS variable values.
          Must be a descendant of `.dark` for dark-mode values to resolve. */}
      <div ref={probeRef} className="hidden" aria-hidden="true" />
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Design Tokens</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Semantic color tokens following{" "}
          <a
            href="https://ui.shadcn.com/docs/theming"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4"
          >
            shadcn/ui conventions
          </a>
          , defined in <code className="rounded bg-muted px-1.5 py-0.5 text-xs">src/index.tailwind.css</code> and
          automatically available as Tailwind utility classes. Light and dark values are set via CSS custom properties —
          no configuration required.
        </p>
        <Alert className="max-w-2xl">
          <Info className="size-4" />
          <AlertDescription>
            Prefer the <span className="font-medium text-foreground">Tailwind class</span> (e.g.{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">bg-primary</code>,{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">text-muted-foreground</code>) over raw CSS
            variables for better semantics and dark mode support. Click any value to copy. Toggle dark mode to see dark
            theme values.
          </AlertDescription>
        </Alert>
      </div>

      <TokenTable title="Core Colors" tokens={CORE_TOKENS} resolvedValues={resolvedValues} />
      <TokenTable title="MD3 Color Role Aliases" tokens={MD3_ROLE_TOKENS} resolvedValues={resolvedValues} />
      <TokenTable title="Chart Colors" tokens={CHART_TOKENS} resolvedValues={resolvedValues} />
      <ChartRamps />
      <TokenTable title="Sidebar Colors" tokens={SIDEBAR_TOKENS} resolvedValues={resolvedValues} />
    </div>
  );
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
};

export default meta;

type Story = StoryObj;

export const Overview: Story = {
  render: () => <DesignTokensPage />,
  parameters: {
    // Full-page foundations showcase — a code snippet is meaningless here.
    docs: { canvas: { sourceState: "none" } },
    zephyr: { testCaseId: "SW-T1467" },
  },
};

// ---------------------------------------------------------------------------
// Contrast audit (UXT-297)
// ---------------------------------------------------------------------------

/**
 * Foreground/surface pairings the kit actually renders text on. Each must clear
 * WCAG AA for normal text (4.5:1) in both themes.
 *
 * This is deliberately wider than the `bgPair` column above, which pairs each
 * `*-foreground` with its own surface. The dark-theme regression UXT-297 fixed
 * was `muted-foreground` on the *lifted* surfaces — card, popover, accent,
 * secondary — none of which is any token's declared pair, so a by-pair check
 * could not have caught it.
 */
const CONTRAST_PAIRS: { fg: string; bg: string }[] = [
  { fg: "foreground", bg: "background" },
  { fg: "foreground", bg: "card" },
  { fg: "foreground", bg: "popover" },
  { fg: "card-foreground", bg: "card" },
  { fg: "popover-foreground", bg: "popover" },
  { fg: "muted-foreground", bg: "background" },
  { fg: "muted-foreground", bg: "card" },
  { fg: "muted-foreground", bg: "popover" },
  { fg: "muted-foreground", bg: "muted" },
  { fg: "muted-foreground", bg: "accent" },
  { fg: "muted-foreground", bg: "secondary" },
  { fg: "primary-foreground", bg: "primary" },
  { fg: "secondary-foreground", bg: "secondary" },
  { fg: "accent-foreground", bg: "accent" },
  { fg: "tertiary-foreground", bg: "tertiary" },
  { fg: "destructive-foreground", bg: "destructive" },
  { fg: "positive-foreground", bg: "positive" },
  { fg: "warning-foreground", bg: "warning" },
  { fg: "info-foreground", bg: "info" },
  { fg: "primary", bg: "background" },
  { fg: "primary", bg: "card" },
  { fg: "selected-foreground", bg: "card" },
  { fg: "selected-foreground", bg: "background" },
];

const AA_NORMAL = 4.5;

/**
 * Resolve a stack of CSS colours to sRGB by painting them, so `oklch()`,
 * `color-mix()` and alpha all composite exactly as the browser renders them —
 * `getComputedStyle` alone would hand back an unparsed `oklch()` string.
 */
function paint(ctx: CanvasRenderingContext2D, layers: string[]): [number, number, number] {
  ctx.clearRect(0, 0, 1, 1);
  for (const layer of layers) {
    ctx.fillStyle = layer;
    ctx.fillRect(0, 0, 1, 1);
  }
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

interface AuditRow {
  fg: string;
  bg: string;
  ratio: number;
  passes: boolean;
}

function auditContrast(): AuditRow[] {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  const read = getComputedStyle(document.documentElement);
  const token = (name: string) => read.getPropertyValue(`--${name}`).trim();
  // Surfaces may be translucent, so every stack starts from the page background.
  const page = token("background");

  return CONTRAST_PAIRS.map(({ fg, bg }) => {
    const background = paint(ctx, [page, token(bg)]);
    const foreground = paint(ctx, [page, token(bg), token(fg)]);
    const ratio = contrastRatio(foreground, background);
    return { fg, bg, ratio, passes: ratio >= AA_NORMAL };
  });
}

function ContrastAuditTable() {
  const [rows, setRows] = useState<AuditRow[]>([]);

  useEffect(() => {
    const run = () => setRows(auditContrast());
    run();
    // The theme toolbar toggles `.dark` on <html>; re-measure when it does.
    const observer = new MutationObserver(run);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold">Contrast audit</h2>
      <p className="mt-1 mb-4 text-sm text-muted-foreground">
        Every foreground/surface pairing the kit renders text on, measured live in the current theme. Each must clear
        WCAG AA for normal text ({AA_NORMAL}:1). Switch the theme toolbar to re-measure.
      </p>
      <table className="w-full max-w-2xl text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="py-1.5 font-medium">Foreground</th>
            <th className="py-1.5 font-medium">Surface</th>
            <th className="py-1.5 text-right font-medium">Ratio</th>
            <th className="py-1.5 pl-4 font-medium">AA</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ fg, bg, ratio, passes }) => (
            <tr key={`${fg}-on-${bg}`} className="border-b border-border/50">
              <td className="py-1 font-mono text-xs">--{fg}</td>
              <td className="py-1 font-mono text-xs">--{bg}</td>
              <td className="py-1 text-right tabular-nums">{ratio.toFixed(2)}</td>
              <td className={cn("py-1 pl-4 font-medium", passes ? "text-positive" : "text-destructive")}>
                {passes ? "pass" : "FAIL"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Guards the token table against contrast regressions in both themes.
 *
 * The play function measures light and dark itself rather than relying on the
 * theme toolbar, so one run covers both — a story fixed to one theme would let
 * the other rot, which is exactly how UXT-297 survived: light was corrected
 * under SW-1925 and dark was never revisited.
 */
export const ContrastAudit: Story = {
  render: () => <ContrastAuditTable />,
  parameters: {
    docs: { canvas: { sourceState: "none" } },
    zephyr: { testCaseId: "" },
  },
  play: async () => {
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");

    try {
      for (const theme of ["light", "dark"] as const) {
        root.classList.toggle("dark", theme === "dark");
        const failures = auditContrast()
          .filter((row) => !row.passes)
          .map((row) => `--${row.fg} on --${row.bg} = ${row.ratio.toFixed(2)}:1`);

        await expect(
          failures,
          `${theme} theme: these pairings fall below WCAG AA (${AA_NORMAL}:1) for normal text`,
        ).toEqual([]);
      }
    } finally {
      root.classList.toggle("dark", hadDark);
    }
  },
};
