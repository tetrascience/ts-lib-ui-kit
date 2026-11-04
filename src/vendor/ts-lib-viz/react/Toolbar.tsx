/**
 * The ghost toolbar: a figure's controls for its reader.
 *
 * Listed items draw in listed order. A choice stays with the reader and the spec stays as authored.
 */

import {useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode} from "react";

import {
	categoricalCss,
	categoricalSize,
	divergingCss,
	FACET_CAP,
	PALETTES,
	palettesOf,
	sequentialCss,
	stopsOf,
	type ChartSpec,
	type PaletteKind,
	type PaletteName,
	type Palettes,
	type PlotData,
	type PlotField,
} from "../core/internal.js";

export type ToolbarItem =
	"zoom" | "reset" | "pan" | "zoomBox" | "box" | "lasso" | "tooltip" | "palette" | "colorblind" | "facet" | "export";

type DragMode = Extract<ToolbarItem, "pan" | "zoomBox" | "box" | "lasso">;

/** What the reader chose. An absent field leaves the authored figure. */
export interface ToolbarView {
	drag?: DragMode;
	tooltip?: boolean;
	palette?: PaletteName;
	colorblind?: boolean;
	/** A null `by` draws one panel. */
	facet?: {by: string | null; columns?: number};
}

export interface ToolbarOptions {
	items: readonly ToolbarItem[];
	/** The maps the palette menu offers. Absent offers the registry's maps of the figure's color kind. */
	palette?: {options: readonly PaletteName[]};
	/** The colorblind-safe map per kind, over okabe-ito, cividis and puor. */
	colorblind?: Partial<Record<PaletteKind, PaletteName>>;
	/** Fields a facet may split by and the column counts offered. Absent offers text fields up to the panel cap, and one to four. */
	facet?: {by?: readonly string[]; columns?: readonly number[]};
	export?: {formats?: readonly ("png" | "svg")[]; ground?: boolean};
	onChange?: (view: ToolbarView) => void;
}

export const COLORBLIND: Readonly<Record<PaletteKind, PaletteName>> = {
	categorical: "okabe-ito",
	sequential: "cividis",
	diverging: "puor",
};

const DRAG_MODES: readonly ToolbarItem[] = ["pan", "zoomBox", "box", "lasso"];

/** The drag modes a list names, in its order. */
export const dragsOf = (items: readonly ToolbarItem[]): DragMode[] =>
	items.filter((item): item is DragMode => DRAG_MODES.includes(item));

/** A download name off the headline, or `figure` where it has none. */
export const fileName = (headline: string | undefined, format: string): string =>
	`${
		(headline ?? "")
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "")
			.slice(0, 60) || "figure"
	}.${format}`;

const KINDS: readonly PaletteKind[] = ["categorical", "sequential", "diverging"];

const kindOf = (name: string): PaletteKind | undefined => KINDS.find((kind) => palettesOf(kind).includes(name));

const labelOf = (name: string): string => PALETTES[name as keyof typeof PALETTES]?.label ?? name;

/**
 * The reader's choices the toolbar still offers.
 *
 * A choice needs its item listed. A picked map needs the host's list, and a facet field the menu.
 */
export function viewOf(
	view: ToolbarView,
	options: ToolbarOptions | undefined,
	facetBy: readonly {id: string}[],
): ToolbarView {
	if (!options) return {};
	const listed = (item: ToolbarItem) => options.items.includes(item);
	const {drag, tooltip, palette, colorblind, facet} = view;
	return {
		...(drag && listed(drag) ? {drag} : {}),
		...(tooltip !== undefined && listed("tooltip") ? {tooltip} : {}),
		...(colorblind !== undefined && listed("colorblind") ? {colorblind} : {}),
		...(palette && listed("palette") && (options.palette?.options.includes(palette) ?? true) ? {palette} : {}),
		...(facet && listed("facet") && (facet.by == null || facetBy.some((field) => field.id === facet.by))
			? {facet}
			: {}),
	};
}

/**
 * The spec the figure draws, with the reader's facet laid over.
 *
 * Colorblind moves each layer's named map to its kind's target. A pick drops the names of its own kind.
 */
export function viewSpec(
	spec: ChartSpec,
	view: ToolbarView,
	targets: Readonly<Record<PaletteKind, PaletteName>>,
): ChartSpec {
	const recolor = view.colorblind
		? (name: string) => targets[kindOf(name) ?? "categorical"]
		: view.palette
			? (name: string) => (kindOf(name) === kindOf(view.palette!) ? undefined : name)
			: null;
	const recolored = recolor != null && spec.layers.some((layer) => layer.palette != null);
	if (view.facet === undefined && !recolored) return spec;

	const layers = recolored
		? spec.layers.map((layer) => (layer.palette == null ? layer : {...layer, palette: recolor(layer.palette)}))
		: spec.layers;
	const facet =
		view.facet === undefined
			? spec.facet
			: view.facet.by == null
				? undefined
				: {by: view.facet.by, ...(view.facet.columns ? {columns: view.facet.columns} : {})};
	return {...spec, layers, facet};
}

/** The figure's maps with the reader's swap laid over. Returns the base where nothing swaps. */
export function viewPalettes(
	base: Palettes,
	view: ToolbarView,
	targets: Readonly<Record<PaletteKind, PaletteName>>,
	dark: boolean,
): Palettes {
	const pick = view.colorblind ? undefined : view.palette;
	const picked = pick ? kindOf(pick) : undefined;
	const categorical = view.colorblind ? targets.categorical : picked === "categorical" ? pick : undefined;
	const magnitude: {kind: PaletteKind; name: string} | undefined = view.colorblind
		? base.center === undefined
			? {kind: "sequential", name: targets.sequential}
			: {kind: "diverging", name: targets.diverging}
		: pick && picked && picked !== "categorical"
			? {kind: picked, name: pick}
			: undefined;
	if (!categorical && !magnitude) return base;

	const next: Palettes = {...base};
	if (categorical) {
		next.categorical = (index) => categoricalCss(index, categorical);
		next.categoricalSize = categoricalSize(categorical);
	}
	if (magnitude?.kind === "sequential") {
		next.sequential = (t) => sequentialCss(t, magnitude.name, dark);
		delete next.center;
	}
	if (magnitude?.kind === "diverging") {
		next.sequential = (t) => divergingCss(t, magnitude.name);
	}
	return next;
}

/**
 * The fields the facet menu offers, with their labels.
 *
 * The host's list, or each text field with at most `FACET_CAP` values. The authored facet field stays listed.
 */
export function facetFields(
	data: PlotData,
	listed: readonly string[] | undefined,
	authored: string | undefined,
): {id: string; label: string}[] {
	const fits = (field: PlotField) => {
		if (field.id === authored) return true;
		if (listed) return listed.includes(field.id);
		if (field.numeric) return false;
		const values = new Set<string | null>();
		for (let row = 0; row < data.rowCount && values.size <= FACET_CAP; row++) values.add(data.text(row, field.id));
		return values.size <= FACET_CAP;
	};
	return data.fields.filter(fits).map(({id, label}) => ({id, label}));
}

/**
 * The maps the palette menu offers: the host's list, or the registry's, narrowed to the kinds the figure draws.
 *
 * A diverging map needs a center.
 */
export function paletteOptions(
	listed: readonly PaletteName[] | undefined,
	figure: {magnitude: boolean; centered: boolean},
): PaletteName[] {
	const kinds: PaletteKind[] = !figure.magnitude
		? ["categorical"]
		: figure.centered
			? ["sequential", "diverging"]
			: ["sequential"];
	const fit = new Set(kinds.flatMap((kind) => palettesOf(kind)));
	return listed ? listed.filter((name) => fit.has(name)) : [...fit];
}

/** Saves a blob under a file name through a transient link. */
export function download(blob: Blob, name: string): void {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = name;
	link.click();
	setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * Hover, focus and an open menu raise the strip. Touch rests it half lit. Reduced motion drops the fade.
 *
 * A browser drops a rule over one unknown selector.
 */
const GHOST = `
[data-viz-toolbar]{opacity:0;transition:opacity 150ms ease-out}
[data-viz-ghost]:hover [data-viz-toolbar],[data-viz-ghost]:focus-within [data-viz-toolbar]{opacity:1}
[data-viz-toolbar]:has(:popover-open){opacity:1}
[data-viz-toolbar] button:hover:not([aria-disabled="true"]),[data-viz-menu] button:hover{background:var(--viz-rule);color:var(--viz-ink)}
[data-viz-toolbar] button[aria-pressed="true"]{box-shadow:inset 0 0 0 1px var(--viz-ink-muted);color:var(--viz-ink)}
[data-viz-toolbar] button[aria-disabled="true"]{opacity:.35;cursor:default}
@media (hover:none){[data-viz-toolbar]{opacity:.6}}
@media (prefers-reduced-motion:reduce){[data-viz-toolbar]{transition:none}}
`;

const STRIP: React.CSSProperties = {
	position: "absolute",
	zIndex: 1,
	display: "flex",
	gap: 2,
	padding: 2,
	borderRadius: 6,
	background: "var(--viz-paper)",
	boxShadow: "inset 0 0 0 1px var(--viz-rule)",
};

const BUTTON: React.CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	width: 24,
	height: 24,
	padding: 0,
	border: "none",
	borderRadius: 4,
	background: "transparent",
	color: "var(--viz-ink-muted)",
	cursor: "pointer",
};

const MENU: React.CSSProperties = {
	position: "fixed",
	inset: "auto",
	margin: 0,
	minWidth: 160,
	maxHeight: 320,
	overflowY: "auto",
	padding: 4,
	border: "1px solid var(--viz-rule)",
	borderRadius: 8,
	background: "var(--viz-paper)",
	color: "var(--viz-ink)",
	fontSize: 12,
	boxShadow: "0 8px 24px color-mix(in srgb, var(--viz-ink) 12%, transparent)",
};

const ITEM: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
	gap: 8,
	width: "100%",
	padding: "4px 8px",
	border: "none",
	borderRadius: 4,
	background: "transparent",
	color: "inherit",
	font: "inherit",
	textAlign: "left",
	whiteSpace: "nowrap",
	cursor: "pointer",
};

const HEADING: React.CSSProperties = {padding: "6px 8px 2px", color: "var(--viz-ink-muted)", fontSize: 10};
const CHECK: React.CSSProperties = {width: 10, flexShrink: 0};
const SWATCH: React.CSSProperties = {width: 32, height: 8, flexShrink: 0, borderRadius: 2};
const HIDDEN: React.CSSProperties = {
	position: "absolute",
	width: 1,
	height: 1,
	overflow: "hidden",
	clipPath: "inset(50%)",
};

/** Whether the browser has the Popover API. */
const POPOVER = typeof HTMLElement !== "undefined" && "popover" in HTMLElement.prototype;

/** The next control in a row for a navigation key, wrapping at both ends. Null for any other key. */
function stepped<T>(items: readonly T[], at: number, key: string, back: string, ahead: string): T | null {
	const step = {
		Home: 0,
		End: items.length - 1,
		[ahead]: (at + 1) % items.length,
		[back]: (at - 1 + items.length) % items.length,
	}[key];
	return step === undefined ? null : (items[step] ?? null);
}

/** The first item past `at`, wrapping, with text starting on a typed letter. */
function typed(items: readonly HTMLElement[], at: number, key: string): HTMLElement | null {
	const text = (item: HTMLElement) => (item.textContent ?? "").replace("✓", "").trim().toLowerCase();
	const order = [...items.slice(at + 1), ...items.slice(0, at + 1)];
	return order.find((item) => text(item).startsWith(key.toLowerCase())) ?? null;
}

/**
 * A locked control's attributes and the hidden text naming why.
 *
 * The control keeps its focus. Its click does nothing.
 */
function useLock(disabled: string | undefined, onClick: (event: React.MouseEvent<HTMLButtonElement>) => void) {
	const id = useId();
	return {
		props: {
			"aria-disabled": disabled != null || undefined,
			"aria-describedby": disabled == null ? undefined : id,
			onClick: disabled == null ? onClick : undefined,
		},
		reason:
			disabled == null ? null : (
				<span id={id} style={HIDDEN}>
					{disabled}
				</span>
			),
	};
}

/** Stroke paths on a 24-unit grid, drawn at 16 pixels. */
const GLYPHS: Record<string, string> = {
	zoomIn: "M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14M20 20l-4-4M11 8v6M8 11h6",
	zoomOut: "M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14M20 20l-4-4M8 11h6",
	reset: "M4 12a8 8 0 1 0 2.5-5.8L4 8.5M4 4v4.5h4.5",
	pan: "M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3",
	zoomBox: "M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5M12 9v6M9 12h6",
	box: "M4 7V4h3M10 4h4M17 4h3v3M20 10v4M20 17v3h-3M14 20h-4M7 20H4v-3M4 14v-4",
	lasso: "M12 4c4.4 0 8 2.2 8 5s-3.6 5-8 5-8-2.2-8-5 3.6-5 8-5M7 13c-1.5 1.5-1.5 4 1 5.5M8 18.5l-1 2.5",
	tooltip: "M4 5h16v11H10l-4 4v-4H4z",
	palette:
		"M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 0 0 4-4c0-4.4-4-8-9-8M7.5 11h.01M10 7h.01M15 7.5h.01",
	colorblind: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6",
	facet: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
	export: "M12 4v11M7 10l5 5 5-5M5 20h14",
};

function Glyph({name}: {name: string}) {
	return (
		<svg
			aria-hidden
			width={16}
			height={16}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d={GLYPHS[name]} />
		</svg>
	);
}

function Tool({
	name,
	label,
	pressed,
	disabled,
	onClick,
}: {
	name: string;
	label: string;
	pressed?: boolean;
	disabled?: string;
	onClick: () => void;
}) {
	const lock = useLock(disabled, onClick);
	return (
		<>
			<button
				type="button"
				data-tool={name}
				style={BUTTON}
				aria-label={label}
				title={disabled ?? label}
				aria-pressed={pressed}
				{...lock.props}
			>
				<Glyph name={name} />
			</button>
			{lock.reason}
		</>
	);
}

/**
 * A trigger and its popover, placed under the trigger's right edge.
 *
 * Opening focuses the checked item. Escape and a pick refocus the trigger. Without the Popover API, state opens it.
 */
function Menu({
	name,
	label,
	disabled,
	children,
}: {
	name: string;
	label: string;
	disabled?: string;
	children: ReactNode;
}) {
	const menu = useRef<HTMLDivElement>(null);
	const trigger = useRef<HTMLButtonElement>(null);
	const id = useId();
	const [open, setOpen] = useState(false);

	/* The popover's own state, light dismiss included. */
	useEffect(() => {
		const panel = menu.current;
		if (!POPOVER || !panel) return;
		const sync = () => setOpen(panel.matches(":popover-open"));
		panel.addEventListener("toggle", sync);
		return () => panel.removeEventListener("toggle", sync);
	}, []);

	const items = () => [...(menu.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]') ?? [])];
	const enter = () => {
		const all = items();
		(all.find((item) => item.getAttribute("aria-checked") === "true") ?? all[0])?.focus();
	};
	/* The fallback panel takes focus once it renders shown. */
	useEffect(() => {
		if (open && !POPOVER) enter();
	}, [open]);

	const toggle = (event: React.MouseEvent<HTMLButtonElement>) => {
		const panel = menu.current;
		if (!panel) return;
		const box = event.currentTarget.getBoundingClientRect();
		panel.style.top = `${box.bottom + 4}px`;
		panel.style.right = `${document.documentElement.clientWidth - box.right}px`;
		if (!POPOVER) {
			setOpen(!open);
			return;
		}
		panel.togglePopover();
		const shown = panel.matches(":popover-open");
		setOpen(shown);
		if (shown) enter();
	};
	const close = (refocus: boolean) => {
		const panel = menu.current;
		if (POPOVER) {
			if (panel?.matches(":popover-open")) panel.hidePopover();
		} else setOpen(false);
		if (refocus) trigger.current?.focus();
	};
	const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "Escape") {
			event.preventDefault();
			event.stopPropagation();
			close(true);
			return;
		}
		if (event.key === "Tab") {
			close(false);
			return;
		}
		const all = items();
		const at = all.indexOf(document.activeElement as HTMLElement);
		const next =
			stepped(all, at, event.key, "ArrowUp", "ArrowDown") ??
			(event.key.length === 1 && event.key.trim() ? typed(all, at, event.key) : null);
		if (!next) return;
		event.preventDefault();
		event.stopPropagation();
		next.focus();
	};
	const lock = useLock(disabled, toggle);
	return (
		<>
			<button
				ref={trigger}
				type="button"
				data-tool={name}
				style={BUTTON}
				aria-label={label}
				title={disabled ?? label}
				aria-haspopup="menu"
				aria-expanded={open}
				aria-controls={id}
				{...lock.props}
			>
				<Glyph name={name} />
			</button>
			{lock.reason}
			<div
				ref={menu}
				id={id}
				popover={POPOVER ? "auto" : undefined}
				role="menu"
				aria-label={label}
				data-viz-menu={name}
				style={POPOVER ? MENU : {...MENU, display: open ? "block" : "none"}}
				onClick={() => close(true)}
				onKeyDown={onKeyDown}
			>
				{children}
			</div>
		</>
	);
}

function Choice({checked, onPick, children}: {checked: boolean; onPick: () => void; children: ReactNode}) {
	return (
		<button type="button" role="menuitemradio" aria-checked={checked} tabIndex={-1} style={ITEM} onClick={onPick}>
			<span aria-hidden style={CHECK}>
				{checked ? "✓" : ""}
			</span>
			{children}
		</button>
	);
}

export interface ToolbarProps {
	/** Where the strip's corner falls inside the panel holder. */
	at: React.CSSProperties;
	options: ToolbarOptions;
	view: ToolbarView;
	onView: (next: ToolbarView) => void;
	/** The drag mode in force. */
	drag?: DragMode;
	palettes: readonly PaletteName[];
	/** Fields the facet menu offers, with their labels. */
	facetBy: readonly {id: string; label: string}[];
	/** The facet the figure draws now. */
	facet: {by: string | null; columns?: number};
	/** Why the view tools are off, where they are. */
	viewLocked?: string;
	/** Why the facet menu is off, where it is. */
	facetLocked?: string;
	onZoom: (factor: number) => void;
	onReset: () => void;
	onExport: (format: "png" | "svg") => void;
}

const LABELS: Record<ToolbarItem, string> = {
	zoom: "Zoom",
	reset: "Reset view",
	pan: "Pan",
	zoomBox: "Zoom to box",
	box: "Box select",
	lasso: "Lasso select",
	tooltip: "Tooltip",
	palette: "Palette",
	colorblind: "Colorblind-safe colors",
	facet: "Facet",
	export: "Export",
};

export function Toolbar({
	at,
	options,
	view,
	onView,
	drag,
	palettes,
	facetBy,
	facet,
	viewLocked,
	facetLocked,
	onZoom,
	onReset,
	onExport,
}: ToolbarProps) {
	const set = (patch: Partial<ToolbarView>) => onView({...view, ...patch});
	const columns = options.facet?.columns ?? [1, 2, 3, 4];

	/* One tab stop across the strip, on the tool last focused. Arrows, Home and End move it. */
	const strip = useRef<HTMLDivElement>(null);
	const active = useRef<string | null>(null);
	const tools = () => [...(strip.current?.querySelectorAll<HTMLElement>("[data-tool]") ?? [])];
	const rove = () => {
		const all = tools();
		const stop = all.find((tool) => tool.dataset.tool === active.current) ?? all[0];
		for (const tool of all) tool.tabIndex = tool === stop ? 0 : -1;
	};
	useLayoutEffect(rove);
	const onFocus = (event: React.FocusEvent<HTMLDivElement>) => {
		const name = (event.target as HTMLElement).dataset.tool;
		if (name == null) return;
		active.current = name;
		rove();
	};
	const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		const all = tools();
		const at = all.indexOf(event.target as HTMLElement);
		if (at < 0) return;
		const next = stepped(all, at, event.key, "ArrowLeft", "ArrowRight");
		if (!next) return;
		event.preventDefault();
		next.focus();
	};

	const draw = (item: ToolbarItem): ReactNode => {
		switch (item) {
			case "zoom":
				return [
					<Tool key="in" name="zoomIn" label="Zoom in" disabled={viewLocked} onClick={() => onZoom(1.5)} />,
					<Tool key="out" name="zoomOut" label="Zoom out" disabled={viewLocked} onClick={() => onZoom(1 / 1.5)} />,
				];
			case "reset":
				return <Tool name="reset" label={LABELS.reset} disabled={viewLocked} onClick={onReset} />;
			case "pan":
			case "zoomBox":
			case "box":
			case "lasso":
				return (
					<Tool
						name={item}
						label={LABELS[item]}
						pressed={drag === item}
						disabled={viewLocked}
						onClick={() => set({drag: item})}
					/>
				);
			case "tooltip":
				return (
					<Tool
						name="tooltip"
						label={LABELS.tooltip}
						pressed={view.tooltip !== false}
						onClick={() => set({tooltip: view.tooltip === false})}
					/>
				);
			case "colorblind":
				return (
					<Tool
						name="colorblind"
						label={LABELS.colorblind}
						pressed={view.colorblind === true}
						onClick={() => set({colorblind: !view.colorblind})}
					/>
				);
			case "palette":
				return palettes.length === 0 ? null : (
					<Menu
						name="palette"
						label={LABELS.palette}
						disabled={view.colorblind ? "Colorblind colors are on" : undefined}
					>
						<Choice checked={view.palette == null} onPick={() => set({palette: undefined})}>
							Default
						</Choice>
						{palettes.map((name) => (
							<Choice key={name} checked={view.palette === name} onPick={() => set({palette: name})}>
								<span style={{...SWATCH, background: `linear-gradient(90deg, ${stopsOf(name).join(", ")})`}} />
								{labelOf(name)}
							</Choice>
						))}
					</Menu>
				);
			case "facet":
				return (
					<Menu name="facet" label={LABELS.facet} disabled={facetLocked}>
						<Choice checked={view.facet === undefined && facet.by == null} onPick={() => set({facet: undefined})}>
							Default
						</Choice>
						<Choice checked={view.facet !== undefined && facet.by == null} onPick={() => set({facet: {by: null}})}>
							None
						</Choice>
						{facetBy.map((field) => (
							<Choice
								key={field.id}
								checked={facet.by === field.id}
								onPick={() => set({facet: {by: field.id, columns: facet.columns}})}
							>
								{field.label}
							</Choice>
						))}
						{facet.by != null && (
							<>
								<div style={HEADING}>Columns</div>
								<Choice checked={facet.columns == null} onPick={() => set({facet: {by: facet.by, columns: undefined}})}>
									Auto
								</Choice>
								{columns.map((count) => (
									<Choice
										key={count}
										checked={facet.columns === count}
										onPick={() => set({facet: {by: facet.by, columns: count}})}
									>
										{count}
									</Choice>
								))}
							</>
						)}
					</Menu>
				);
			case "export":
				return (
					<Menu name="export" label={LABELS.export}>
						{(options.export?.formats ?? ["png", "svg"]).map((format) => (
							<button
								key={format}
								type="button"
								role="menuitem"
								tabIndex={-1}
								style={ITEM}
								onClick={() => onExport(format)}
							>
								<span style={CHECK} />
								{format.toUpperCase()}
							</button>
						))}
					</Menu>
				);
		}
	};

	return (
		<div
			ref={strip}
			role="toolbar"
			aria-label="Chart tools"
			data-viz-toolbar=""
			style={{...STRIP, ...at}}
			onClick={(event) => event.stopPropagation()}
			onFocus={onFocus}
			onKeyDown={onKeyDown}
		>
			<style>{GHOST}</style>
			{options.items.map((item) => (
				<span key={item} style={{display: "contents"}}>
					{draw(item)}
				</span>
			))}
		</div>
	);
}
