/**
 * The theming contract -- which custom properties a chart paints with.
 *
 * Names, shipped values and the parse to a shader triple. A token appears here when the package
 * reads it, and `theme/default.css` declares the same set.
 */

/**
 * Custom properties a chart reads.
 *
 * `--viz-paper` is the page color. A chart draws on a transparent background per chart-design
 * rule 3 and a panel tone would read as a border.
 */
export const VIZ_TOKENS = [
	"--viz-paper",
	"--viz-ink",
	"--viz-ink-muted",
	"--viz-rule",
	"--viz-annotation",
	"--viz-leader",
	"--viz-status-fail",
	"--viz-status-warn",
	"--viz-tooltip-bg",
	"--viz-tooltip-ink",
	"--viz-tooltip-ink-muted",
	"--viz-tooltip-ring",
] as const;

export type VizToken = (typeof VIZ_TOKENS)[number];

/** What each token paints, for a host deciding what to override. Frozen. */
export const TOKEN_MEANING: Readonly<Record<VizToken, string>> = Object.freeze({
	"--viz-paper": "The page the chart sits on. Segment gaps and point hairlines take it.",
	"--viz-ink": "Geoms and the text on them.",
	"--viz-ink-muted": "Secondary strokes: whiskers, medians, joined runs.",
	"--viz-rule": "The axis rule, its ticks, and the rail behind an unselected category.",
	"--viz-annotation": "Annotation text written on the plot.",
	"--viz-leader": "Leader lines from an annotation to the geom it names.",
	"--viz-status-fail": "A threshold breach. Fixed, so it means one thing whichever palette is picked.",
	"--viz-status-warn": "A warning band, on the same terms.",
	"--viz-tooltip-bg": "The hover card's fill, the one surface the package paints. Dark under both schemes.",
	"--viz-tooltip-ink": "Values on the hover card.",
	"--viz-tooltip-ink-muted": "Labels and notes on the hover card.",
	"--viz-tooltip-ring": "The hover card's hairline edge.",
});

/** A resolved set, as color strings. What the SVG path already gets for free. */
export type ThemeSnapshot = Record<VizToken, string>;

/**
 * Values the package ships. Frozen.
 *
 * Neutral grays and two semantic tones. A host overrides any of them further up the tree. The
 * two status tones lighten in dark mode.
 */
export const LIGHT_THEME: Readonly<Record<VizToken, string>> = Object.freeze({
	"--viz-paper": "#ffffff",
	"--viz-ink": "#171717",
	"--viz-ink-muted": "#737373",
	"--viz-rule": "#e5e5e5",
	"--viz-annotation": "#404040",
	"--viz-leader": "#a3a3a3",
	"--viz-status-fail": "#dc2626",
	"--viz-status-warn": "#d97706",
	"--viz-tooltip-bg": "#171717",
	"--viz-tooltip-ink": "#ffffff",
	"--viz-tooltip-ink-muted": "#d4d4d4",
	"--viz-tooltip-ring": "#ffffff1a",
});

export const DARK_THEME: Readonly<Record<VizToken, string>> = Object.freeze({
	"--viz-paper": "#0a0a0a",
	"--viz-ink": "#fafafa",
	"--viz-ink-muted": "#a3a3a3",
	"--viz-rule": "#262626",
	"--viz-annotation": "#d4d4d4",
	"--viz-leader": "#525252",
	"--viz-status-fail": "#f87171",
	"--viz-status-warn": "#fbbf24",
	"--viz-tooltip-bg": "#262626",
	"--viz-tooltip-ink": "#ffffff",
	"--viz-tooltip-ink-muted": "#d4d4d4",
	"--viz-tooltip-ring": "#ffffff1a",
});

/** Channels in the range 0 to 1. A shader uniform and `packColors` both take these. */
export type Rgb = readonly [number, number, number];

const HEX = /^#([0-9a-f]{3,8})$/i;
/* Both separator styles -- `rgb(17, 24, 39)` and `rgb(17 24 39 / 0.5)`. */
const RGB = /^rgba?\(([^)]+)\)$/i;

const byte = (value: number) => Math.min(1, Math.max(0, value / 255));

/**
 * A color string as three channels.
 *
 * Hex and `rgb()` only. `oklch()` and `hsl()` return null. `resolveTheme` pushes a value through
 * a probe element and reads back computed `rgb()`.
 */
export function rgbOf(css: string): Rgb | null {
	const text = css.trim();

	const hex = HEX.exec(text);
	if (hex) {
		const digits = hex[1]!;
		if (digits.length === 3 || digits.length === 4) {
			const [r, g, b] = [...digits.slice(0, 3)].map((d) => Number.parseInt(d + d, 16));
			return [byte(r!), byte(g!), byte(b!)];
		}
		if (digits.length === 6 || digits.length === 8) {
			const pair = (at: number) => Number.parseInt(digits.slice(at, at + 2), 16);
			return [byte(pair(0)), byte(pair(2)), byte(pair(4))];
		}
		return null;
	}

	const rgb = RGB.exec(text);
	if (!rgb) return null;

	/* An alpha follows a slash in the space-separated form and a comma in the older one. */
	const channels = rgb[1]!
		.split("/")[0]!
		.split(/[\s,]+/)
		.filter((part) => part.length > 0)
		.slice(0, 3)
		.map((part) => (part.endsWith("%") ? (Number.parseFloat(part) / 100) * 255 : Number.parseFloat(part)));

	if (channels.length < 3 || channels.some((channel) => Number.isNaN(channel))) return null;
	return [byte(channels[0]!), byte(channels[1]!), byte(channels[2]!)];
}

/**
 * A snapshot as channels, for the buffers the renderer packs.
 *
 * A token that is absent or did not parse falls back to the shipped value for that theme.
 */
export function rgbSnapshot(
	snapshot: Partial<ThemeSnapshot>,
	fallback: ThemeSnapshot = LIGHT_THEME,
): Record<VizToken, Rgb> {
	const out = {} as Record<VizToken, Rgb>;
	for (const token of VIZ_TOKENS) {
		out[token] = rgbOf(snapshot[token] ?? "") ?? rgbOf(fallback[token]) ?? [0, 0, 0];
	}
	return out;
}

/**
 * Whether the paper behind the geoms is dark.
 *
 * Read off the token. A host installs its own values and the package sees colors.
 */
export function onDarkPaper(snapshot: ThemeSnapshot): boolean {
	const paper = rgbOf(snapshot["--viz-paper"]);
	if (!paper) return false;
	const [r, g, b] = paper;
	return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.5;
}
