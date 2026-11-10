/**
 * The `/core` surface: author a chart, load a saved one, check it, and hand it to a drawing surface.
 *
 * No DOM and no React. Each name here is semver surface. The package's own entry points read the
 * modules through `internal.ts`, which the exports map leaves out.
 */

export {
	plot,
	type AnnotateValue,
	type AnnotateValues,
	type AnyLayerOptions,
	type FitOptions,
	type Labs,
	type LayerAes,
	type LayerArgs,
	type LayerCall,
	type LayerOptions,
	type PlotBuilder,
	type RuleOptions,
	type RuleValue,
	type SmoothOptions,
} from "./build.js";

export {
	SPEC_VERSION,
	type Aes,
	type Anchor,
	type Annotation,
	type BandOrder,
	type CellNumbers,
	type ChartScales,
	type ChartSpec,
	type ColorScale,
	type FitSpec,
	type GuideScale,
	type LabelRule,
	type LabelWhen,
	type LayerSpec,
	type LayerStyle,
	type Leader,
	type LegendOptions,
	type Linetype,
	type PlotKind,
	type PlotSource,
	type Position,
	type PositionKind,
	type PositionScale,
	type SideContent,
	type SidePanel,
	type SmoothMethod,
	type SmoothSpec,
	type StatParams,
	type StoredSpec,
	type TickFormat,
} from "./spec.js";
export {loadSpec} from "./load.js";
export {KINDS} from "./grammar.js";
export type {Aesthetic, Parts} from "./geom-table.js";
export type {Aggregate} from "./aggregate.js";
export type {AxisTransform} from "./transform.js";
export type {PointShape} from "./geom-types.js";
export type {PlotSourceOption} from "./spec-edit.js";
export type {BinClosed, BinDrop, PerAxis} from "./binning.js";
export type {Bandwidth, Kernel, QuantileType} from "./stats.js";
export type {ClusterDistance, DepthScale, Linkage} from "./cluster.js";
export type {RingContent, RingPanel} from "./rings.js";
export type {LinkFields} from "./circular.js";

export {
	fromArrow,
	fromColumns,
	fromRows,
	toPlotData,
	type AdapterOptions,
	type Arrayish,
	type ArrowLike,
	type FieldOverride,
	type VizData,
} from "./adapters.js";
export type {PlotData, PlotField, PlotFieldRole} from "./plot-data.js";

export {
	blocking,
	critiqueSet,
	critiqueSpec as critique,
	type CritiqueOptions,
	type Finding,
	type FindingCode,
	type Severity,
	type UnwaivableCode,
	type WaivableCode,
} from "./critique.js";
export {
	OPEN_PROFILE,
	validate,
	type CapabilityProfile,
	type Failure,
	type SettingGroup,
	type Verdict,
} from "./profile.js";

export {fitSignature, type FitGroup, type FitRequest, type Fitter} from "./fitter.js";
export type {Fit, LayerFits} from "./fit-types.js";

export {
	DEFAULT_CATEGORICAL,
	DEFAULT_DIVERGING,
	DEFAULT_PALETTES,
	DEFAULT_SEQUENTIAL,
	PALETTES,
	palettesFor,
	registerPalette,
	type Palette,
	type PaletteChoice,
	type PaletteName,
} from "./palette.js";
export type {Palettes} from "./layers.js";
export {DARK_THEME, LIGHT_THEME, TOKEN_MEANING, VIZ_TOKENS, type ThemeSnapshot, type VizToken} from "./tokens.js";
export {assign, type FigureSet} from "./figure-set.js";

export type {Selected} from "./select.js";
export type {BrushShape, Brushed} from "./region.js";
export {leaves, type Predicate} from "./predicate.js";
