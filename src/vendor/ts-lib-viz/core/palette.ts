/**
 * The maps a chart draws with, and the ramps built from them.
 *
 * Chart-design rule 8 splits them. Magnitude takes magma and identity takes the house rainbow.
 */

import type {Palettes} from "./layers.js";
import {PALETTE_SETS} from "./palette-sets.js";
import {rgbOf, type Rgb} from "./tokens.js";

export type PaletteKind = "sequential" | "diverging" | "categorical";

/** The span of a map that stays legible against each surface, as a fraction of its length. */
export interface SafeSpan {
	light: readonly [number, number];
	dark: readonly [number, number];
}

export interface Palette {
	label: string;
	kind: PaletteKind;
	/** Anchors low to high for a sequential map, discrete entries for a categorical one. */
	stops: readonly string[];
	/**
	 * Where the map runs out against a surface.
	 *
	 * The perceptual maps run from near-black to near-white. Each states the portion worth
	 * sampling on either paper.
	 */
	safe?: SafeSpan;
	/** Whether a categorical map also draws a measure, as a sweep across its stops. */
	continuous?: boolean;
}

/**
 * The house rainbow, red to pink.
 *
 * Twelve stops in spectral order. A legend reads C0 to C11 as a sweep.
 */
const HOUSE = [
	"#ff6961",
	"#f69552",
	"#ffd347",
	"#b2cc00",
	"#4fd377",
	"#1cc38c",
	"#00bbd4",
	"#448aff",
	"#5a7ad3",
	"#966fd6",
	"#c173ff",
	"#f984e5",
] as const;

/** Okabe-Ito without black. Identity colors a color-vision-deficient reader can tell apart. */
const OKABE_ITO = ["#0072b2", "#e69f00", "#009e73", "#d55e00", "#cc79a7", "#56b4e9", "#f0e442"] as const;

/*
 * The diverging sets, eleven anchors each. The neutral lands on a stop.
 *
 * ColorBrewer marks all three as safe under color-vision deficiency.
 */
const DIVERGING_RDBU = [
	"#67001f",
	"#b1182b",
	"#d6604d",
	"#f3a481",
	"#fddbc7",
	"#f6f7f7",
	"#d1e5f0",
	"#90c4dd",
	"#4393c3",
	"#2065ab",
	"#053061",
] as const;

const DIVERGING_BRBG = [
	"#543005",
	"#8b500a",
	"#bf812d",
	"#dec17b",
	"#f6e8c3",
	"#f4f5f5",
	"#c7eae5",
	"#7fccc0",
	"#35978f",
	"#01655d",
	"#003c30",
] as const;

const DIVERGING_PUOR = [
	"#7f3b08",
	"#b25706",
	"#e08214",
	"#fcb761",
	"#fee0b6",
	"#f6f6f7",
	"#d8daeb",
	"#b1aad1",
	"#8073ac",
	"#532687",
	"#2d004b",
] as const;

/*
 * The UI kit's chart maps, copied from its `CHART_*` exports. The kit marks each as safe under
 * color-vision deficiency. A test holds the two equal.
 */
const KIT_BRAND = [
	"#2f45b5",
	"#fd972f",
	"#038599",
	"#e15759",
	"#8243ba",
	"#94c2ff",
	"#465364",
	"#f4d03f",
	"#cc79a7",
	"#117733",
	"#88ccee",
	"#882255",
] as const;

const KIT_BLUE = [
	"#f0f3fc",
	"#dce3f8",
	"#c5d1f2",
	"#a9bcec",
	"#8aa5e4",
	"#6c8ddb",
	"#5276d0",
	"#3d62c5",
	"#2f45b5",
	"#27399a",
	"#1f2d7e",
	"#172261",
] as const;

const KIT_PURPLE = [
	"#f8eefb",
	"#efd8f4",
	"#e3bceb",
	"#d49de0",
	"#c27cd2",
	"#ad5dc3",
	"#9544b0",
	"#8243ba",
	"#6e2fa0",
	"#5a2487",
	"#481b6e",
	"#371454",
] as const;

/* The kit's diverging maps put the neutral between the sixth and seventh stops. */
const KIT_BLUE_ORANGE = [
	"#1f3d9e",
	"#2f45b5",
	"#5276d0",
	"#7a95dd",
	"#a9bcec",
	"#dce3f8",
	"#fce6cc",
	"#facb99",
	"#f7ae63",
	"#fd972f",
	"#d87410",
	"#a6580a",
] as const;

const KIT_TEAL_MAGENTA = [
	"#055a66",
	"#099db3",
	"#34b9cc",
	"#88dae6",
	"#cff1f5",
	"#f0fafb",
	"#fbebf3",
	"#f0c8de",
	"#e29ec2",
	"#cc79a7",
	"#a85585",
	"#7e3b62",
] as const;

const KIT_PURPLE_YELLOWGREEN = [
	"#481b6e",
	"#8243ba",
	"#a767d0",
	"#c593e0",
	"#e3c5ee",
	"#f4e6f8",
	"#f2f7d9",
	"#dceb9f",
	"#b8d266",
	"#8fb939",
	"#6e9a1f",
	"#527516",
] as const;

const SHIPPED = {
	/*
    Giemsa staining, dark to light. The values are circlize's own `cytoband.col`.

    The safe span keeps the unstained end off light paper.
  */
	giemsa: {
		label: "Giemsa",
		kind: "sequential",
		safe: {light: [0, 0.92], dark: [0.08, 1]},
		stops: ["#000000", "#828282", "#a0a0a0", "#c8c8c8", "#d2d2d2", "#dcdcdc", "#ffffff"],
	},
	"tetra-rainbow": {label: "Tetra rainbow", kind: "categorical", continuous: true, stops: HOUSE},
	"okabe-ito": {label: "Okabe-Ito", kind: "categorical", stops: OKABE_ITO},
	"tetra-brand": {label: "Tetra brand", kind: "categorical", stops: KIT_BRAND},
	viridis: {
		label: "Viridis",
		kind: "sequential",
		safe: {light: [0, 0.92], dark: [0.12, 1]},
		stops: [
			"#440154",
			"#482878",
			"#3e4989",
			"#31688e",
			"#26828e",
			"#1f9e89",
			"#35b779",
			"#6ece58",
			"#b5de2b",
			"#fde725",
		],
	},
	mako: {
		label: "Mako",
		kind: "sequential",
		safe: {light: [0, 0.82], dark: [0.22, 1]},
		stops: [
			"#0b0405",
			"#28192e",
			"#3b2e5d",
			"#40498e",
			"#366a9f",
			"#348ba6",
			"#38aaac",
			"#55caad",
			"#a1dfb9",
			"#def5e5",
		],
	},
	rocket: {
		label: "Rocket",
		kind: "sequential",
		safe: {light: [0, 0.82], dark: [0.22, 1]},
		stops: [
			"#03051a",
			"#2a1636",
			"#541e4e",
			"#841e5a",
			"#b41658",
			"#dd2c45",
			"#f06043",
			"#f5946b",
			"#f6c19f",
			"#faebdd",
		],
	},
	magma: {
		label: "Magma",
		kind: "sequential",
		safe: {light: [0, 0.82], dark: [0.22, 1]},
		stops: [
			"#000004",
			"#180f3d",
			"#440f76",
			"#721f81",
			"#9e2f7f",
			"#cd4071",
			"#f1605d",
			"#fd9668",
			"#feca8d",
			"#fcfdbf",
		],
	},
	inferno: {
		label: "Inferno",
		kind: "sequential",
		safe: {light: [0, 0.82], dark: [0.22, 1]},
		stops: [
			"#000004",
			"#1b0c41",
			"#4a0c6b",
			"#781c6d",
			"#a52c60",
			"#cf4446",
			"#ed6925",
			"#fb9b06",
			"#f7d13d",
			"#fcffa4",
		],
	},
	plasma: {
		label: "Plasma",
		kind: "sequential",
		safe: {light: [0, 0.9], dark: [0.08, 1]},
		stops: [
			"#0d0887",
			"#46039f",
			"#7201a8",
			"#9c179e",
			"#bd3786",
			"#d8576b",
			"#ed7953",
			"#fb9f3a",
			"#fdca26",
			"#f0f921",
		],
	},
	cividis: {
		label: "Cividis",
		kind: "sequential",
		safe: {light: [0, 0.94], dark: [0.06, 1]},
		stops: [
			"#00224e",
			"#123570",
			"#3b496c",
			"#575d6d",
			"#707173",
			"#8a8678",
			"#a59c74",
			"#c3b369",
			"#e1cc55",
			"#fee838",
		],
	},
	/* Light to dark. Each span ends on the last stop clearing 1.5:1 against its paper. */
	"tetra-blue": {
		label: "Tetra blue",
		kind: "sequential",
		safe: {light: [2 / 11, 1], dark: [0, 10 / 11]},
		stops: KIT_BLUE,
	},
	"tetra-purple": {
		label: "Tetra purple",
		kind: "sequential",
		safe: {light: [2 / 11, 1], dark: [0, 10 / 11]},
		stops: KIT_PURPLE,
	},
	rdbu: {
		label: "Red-Blue",
		kind: "diverging",
		stops: DIVERGING_RDBU,
	},
	brbg: {
		label: "Brown-Teal",
		kind: "diverging",
		stops: DIVERGING_BRBG,
	},
	puor: {
		label: "Orange-Purple",
		kind: "diverging",
		stops: DIVERGING_PUOR,
	},
	"tetra-blue-orange": {label: "Tetra blue-orange", kind: "diverging", stops: KIT_BLUE_ORANGE},
	"tetra-teal-magenta": {label: "Tetra teal-magenta", kind: "diverging", stops: KIT_TEAL_MAGENTA},
	"tetra-purple-yellowgreen": {label: "Tetra purple-yellowgreen", kind: "diverging", stops: KIT_PURPLE_YELLOWGREEN},
	...PALETTE_SETS,
} satisfies Record<string, Palette>;

/** A map copied and frozen with its stops and its safe span. */
const frozen = ({safe, ...palette}: Palette): Readonly<Palette> =>
	Object.freeze({
		...palette,
		stops: Object.freeze([...palette.stops]),
		...(safe
			? {
					safe: Object.freeze({
						light: Object.freeze([safe.light[0], safe.light[1]] as const),
						dark: Object.freeze([safe.dark[0], safe.dark[1]] as const),
					}),
				}
			: {}),
	});

/**
 * The maps the package ships, by name. Frozen, each map with its stops and its safe span.
 *
 * A host adds its own through `registerPalette`. A name resolves against both.
 */
export const PALETTES: Readonly<Record<keyof typeof SHIPPED, Readonly<Palette>>> = Object.freeze(
	Object.fromEntries(Object.entries(SHIPPED).map(([name, palette]) => [name, frozen(palette)])) as Record<
		keyof typeof SHIPPED,
		Readonly<Palette>
	>,
);

/**
 * A map by name.
 *
 * The union names the shipped maps. The open arm takes a registered one. A name matching neither
 * resolves to the default for its kind.
 */
export type PaletteName = keyof typeof PALETTES | (string & {});

/** Each map a name resolves to: the shipped ones and those a host registered. */
const registry = new Map<string, Palette>(Object.entries(PALETTES));

/**
 * Adds a host's own map under a name, for a layer's `palette`, a track's or a `PaletteChoice`.
 *
 * A shipped name is refused. Registering a name again replaces its map.
 */
export function registerPalette(name: string, palette: Palette): void {
	if (Object.hasOwn(PALETTES, name)) throw new Error(`ts-lib-viz: ${name} is a shipped palette and keeps its map`);
	registry.set(name, frozen(palette));
}

export const DEFAULT_SEQUENTIAL = "magma";
export const DEFAULT_DIVERGING = "rdbu";
export const DEFAULT_CATEGORICAL = "tetra-rainbow";

/** Where a diverging map's neutral stop falls when the caller names no other value. */
export const DEFAULT_CENTER = 0;

/** Names of the maps of one kind, for a switcher to offer. */
export const palettesOf = (kind: PaletteKind): string[] =>
	[...registry].filter(([, palette]) => palette.kind === kind).map(([name]) => name);

const paletteFor = (name: string, fallback: string): Palette => registry.get(name) ?? registry.get(fallback)!;

/** A map's stops, for a legend swatch or a caller building its own sampler. */
export const stopsOf = (name: string): readonly string[] => paletteFor(name, DEFAULT_CATEGORICAL).stops;

const channel = (value: number) => Math.round(value * 255);

/* Parsed once per map, keyed on the map a name resolved to. Two kinds asking for one
   unregistered name reach two maps. */
const parsed = new WeakMap<Palette, Rgb[]>();

/** A map's stops as numbers. A stop the parser cannot read drops out. */
function rgbStops(palette: Palette): Rgb[] {
	const held = parsed.get(palette);
	if (held) return held;
	const rgb = palette.stops.flatMap((stop) => {
		const one = rgbOf(stop);
		return one ? [one] : [];
	});
	parsed.set(palette, rgb);
	return rgb;
}

/** A map sampled at `t`, with the span applied where the map declares one. */
function sample(palette: Palette, t: number, dark: boolean): string {
	const rgb = rgbStops(palette);
	/* Black where no stop parsed, matching `inkOn`. */
	if (rgb.length === 0) return "#000000";
	const span = palette.safe?.[dark ? "dark" : "light"];
	const held = Math.min(1, Math.max(0, t));
	const placed = span ? span[0] + (span[1] - span[0]) * held : held;
	const scaled = placed * (rgb.length - 1);
	/* A single stop leaves no pair to interpolate. Both ends read it. */
	const at = Math.max(0, Math.min(rgb.length - 2, Math.floor(scaled)));
	const between = scaled - at;
	const [r0, g0, b0] = rgb[at]!;
	const [r1, g1, b1] = rgb[at + 1] ?? rgb[at]!;
	return `rgb(${channel(r0 + (r1 - r0) * between)}, ${channel(g0 + (g1 - g0) * between)}, ${channel(
		b0 + (b1 - b0) * between,
	)})`;
}

/**
 * A sequential map over 0..1, as a CSS color. Input outside the range clamps to the ends.
 *
 * `dark` maps the request into the span that survives dark paper.
 */
export function sequentialCss(t: number, name: string = DEFAULT_SEQUENTIAL, dark = false): string {
	return sample(paletteFor(name, DEFAULT_SEQUENTIAL), t, dark);
}

/**
 * A diverging map over 0..1, with its neutral stop at the middle.
 *
 * No safe span applies. Clipping one end would move the neutral off center.
 */
export function divergingCss(t: number, name: string = DEFAULT_DIVERGING): string {
	return sample(paletteFor(name, DEFAULT_DIVERGING), t, false);
}

/**
 * Where each Giemsa level falls along the stain map, from fully stained to unstained.
 *
 * circlize gives gpos25 and gpos50 one gray, and gpos33 a lighter one than either.
 */
const STAIN_AT: Record<string, number> = {
	gpos100: 0,
	gpos: 0,
	gpos75: 1 / 6,
	gpos66: 2 / 6,
	gpos50: 3 / 6,
	gpos25: 3 / 6,
	gpos33: 4 / 6,
	gvar: 5 / 6,
	gneg: 1,
};

/**
 * The two cytoband levels that name a structure, not a staining intensity.
 *
 * A centromere and a stalk take a fixed color under any palette.
 */
const STAIN_FIXED: Record<string, string> = {
	acen: "#d92f27",
	stalk: "#647fa4",
};

/**
 * The color one cytogenetic band draws with. An unknown level answers undefined.
 *
 * A caller falls back to its own map where this declines.
 */
export function cytobandCss(stain: string, dark = false): string | undefined {
	const fixed = Object.hasOwn(STAIN_FIXED, stain) ? STAIN_FIXED[stain] : undefined;
	if (fixed) return fixed;
	const at = Object.hasOwn(STAIN_AT, stain) ? STAIN_AT[stain] : undefined;
	return at === undefined ? undefined : sequentialCss(at, "giemsa", dark);
}

/** Distinct colors a categorical map offers before it repeats. */
export const categoricalSize = (name: string = DEFAULT_CATEGORICAL): number =>
	paletteFor(name, DEFAULT_CATEGORICAL).stops.length;

/** A categorical map by index, cycling past its end the way a palette switcher's would. */
export function categoricalCss(index: number, name: string = DEFAULT_CATEGORICAL): string {
	const {stops} = paletteFor(name, DEFAULT_CATEGORICAL);
	return stops[((index % stops.length) + stops.length) % stops.length]!;
}

/* sRGB's own transfer function, undone. The weighted sum below is then a luminance. */
const linear = (value: number) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);

/** Where black and white swap places over a background, in relative luminance. */
const CROSSOVER = 0.179;

/**
 * Ink that reads against a given fill, as black or white.
 *
 * A translucent fill blends over the paper first. A syntax the parser cannot read falls back to
 * black.
 */
export function inkOn(fill: string, over?: {paper: string; opacity: number}): string {
	const rgb = rgbOf(fill);
	if (!rgb) return "#000000";
	const paper = over ? rgbOf(over.paper) : null;
	const seen = (at: 0 | 1 | 2) => (paper ? paper[at] + (rgb[at] - paper[at]) * over!.opacity : rgb[at]);
	const light = 0.2126 * linear(seen(0)) + 0.7152 * linear(seen(1)) + 0.0722 * linear(seen(2));
	return light > CROSSOVER ? "#000000" : "#ffffff";
}

export interface PaletteChoice {
	/** Sequential map for magnitude. */
	sequential?: PaletteName;
	/**
	 * Diverging map for a measure read against a neutral value. Takes magnitude when given.
	 *
	 * The reader asks which side of the middle a value falls, and how far.
	 */
	diverging?: PaletteName;
	/** Where the diverging map's neutral sits, in the units of the measure. Defaults to zero. */
	center?: number;
	/** Categorical map for identity. */
	categorical?: PaletteName;
	/** Whether the paper behind the geoms is dark, which decides the span of a sequential map. */
	dark?: boolean;
}

/**
 * The pair of ramps a frame draws with.
 *
 * A diverging choice puts its center onto the result. The layer build reads `center` when it
 * normalizes a value.
 */
export function palettesFor({sequential, diverging, center, categorical, dark}: PaletteChoice = {}): Palettes {
	const magnitude = diverging
		? (t: number) => divergingCss(t, diverging)
		: (t: number) => sequentialCss(t, sequential ?? DEFAULT_SEQUENTIAL, dark ?? false);

	/* A two-armed map has a middle. A one-armed one takes one where the caller states it. */
	const middle = diverging ? (center ?? DEFAULT_CENTER) : center;

	return {
		sequential: magnitude,
		/*
	    A second magnitude map, for a series that named one of its own. The trim span depends on
	    the paper behind it and `dark` belongs to the caller.
	  */
		sequentialFor: (name: string) => (t: number) => sequentialCss(t, name, dark ?? false),
		categoricalFor: (name: string) =>
			registry.get(name)?.kind === "categorical"
				? {categorical: (index: number) => categoricalCss(index, name), categoricalSize: categoricalSize(name)}
				: undefined,
		categorical: (index) => categoricalCss(index, categorical ?? DEFAULT_CATEGORICAL),
		categoricalSize: categoricalSize(categorical ?? DEFAULT_CATEGORICAL),
		stain: (stain: string) => cytobandCss(stain, dark ?? false),
		...(middle === undefined ? {} : {center: middle}),
	};
}

/** What a `Viz` component colors with when the caller hands it nothing. Frozen. */
export const DEFAULT_PALETTES: Readonly<Palettes> = Object.freeze(palettesFor());
