/**
 * The dark tooltip card.
 *
 * A chart carries the shape and a tooltip carries the number. Rows are dot, label, value with the
 * values right-aligned in tabular figures, so a stack of four reads as a small table instead of a
 * sentence. Dark in both themes on purpose: it has to separate from whatever geom sits under it,
 * and a light card over light geoms disappears.
 *
 * Colored from `--viz-tooltip-*` and sized from its own geometry, so the card carries no utility
 * class. It floats over geoms in whatever host mounts it, and a host running no Tailwind build used
 * to get a transparent box with the page showing through it. A host that wants the card to follow
 * its own design system points the four tokens at its surface colors.
 *
 * The style objects sit at module scope because a fresh object per render is a fresh prop identity,
 * and this card redraws on the pointer.
 */

import type {TooltipRow} from "../core/internal.js";

const CARD: React.CSSProperties = {
	pointerEvents: "none",
	display: "flex",
	flexDirection: "column",
	gap: 6,
	minWidth: 148,
	padding: "8px 10px",
	borderRadius: 8,
	background: "var(--viz-tooltip-bg)",
	color: "var(--viz-tooltip-ink)",
	/* The shadow mixes from the card's own ground, and a host re-pointing the tokens moves it too. */
	boxShadow:
		"0 8px 24px color-mix(in srgb, var(--viz-tooltip-bg) 35%, transparent), inset 0 0 0 1px var(--viz-tooltip-ring)",
};

const TITLE: React.CSSProperties = {fontSize: 16, fontWeight: 500};
const ROWS: React.CSSProperties = {display: "flex", flexDirection: "column", gap: 4};
const ROW: React.CSSProperties = {display: "flex", alignItems: "center", gap: 8};
const DOT: React.CSSProperties = {width: 8, height: 8, flexShrink: 0, borderRadius: "50%"};
const LABEL: React.CSSProperties = {flex: 1, fontSize: 12, color: "var(--viz-tooltip-ink-muted)"};

/** Tabular figures per the type scale, so a column of values lines up on the digit. */
const VALUE: React.CSSProperties = {fontSize: 12, fontWeight: 500, fontVariantNumeric: "tabular-nums"};
const NOTE: React.CSSProperties = {fontSize: 10, color: "var(--viz-tooltip-ink-muted)"};

export type {TooltipRow};

export interface TooltipCardProps {
	title?: string;
	rows: TooltipRow[];
	note?: string;
}

export function TooltipCard({title, rows, note}: TooltipCardProps) {
	/* One swatched row holds the label column for all of them. */
	const swatched = rows.some((row) => row.color);
	return (
		<div style={CARD} data-tooltip="card">
			{title && <span style={TITLE}>{title}</span>}
			<div style={ROWS}>
				{rows.map((row) => (
					<div key={row.label} style={ROW}>
						{swatched && <span style={{...DOT, background: row.color ?? "transparent"}} />}
						<span style={LABEL}>{row.label}</span>
						<span style={VALUE}>{row.value}</span>
					</div>
				))}
			</div>
			{note && <span style={NOTE}>{note}</span>}
		</div>
	);
}

export interface TooltipLayerProps {
	at: {x: number; y: number} | null;
	bounds: {width: number; height: number};
	children: React.ReactNode;
}

/** Width and height a card is assumed to take, for the edge tests. */
const CARD_W = 170;
const CARD_H = 90;

/**
 * Vertical placement against the point.
 *
 * A low point takes the card above, a high one below, and the rest center on it. A short plot
 * area takes the roomier side.
 */
function alignY(y: number, height: number): string {
	const low = y > height - CARD_H;
	const high = y < CARD_H / 2;
	if (low && (!high || y > height / 2)) return "calc(-100% - 10px)";
	if (high) return "0px";
	return "-50%";
}

/** Positions a card beside a point without letting it leave the container. */
export function TooltipLayer({at, bounds, children}: TooltipLayerProps) {
	if (!at) return null;
	/* A card goes left near the right edge, and a narrow panel keeps it on the wider side. */
	const flipX = at.x > bounds.width - CARD_W && at.x > bounds.width / 2;

	return (
		<div
			style={{
				position: "absolute",
				zIndex: 20,
				left: at.x,
				top: at.y,
				transform: `translate(${flipX ? "calc(-100% - 10px)" : "10px"}, ${alignY(at.y, bounds.height)})`,
			}}
		>
			{children}
		</div>
	);
}
