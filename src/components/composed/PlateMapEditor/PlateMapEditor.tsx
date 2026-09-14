import * as React from "react";

import { PlateMapActionsMenu } from "./PlateMapActionsMenu";
import { PlateMapForm } from "./PlateMapForm";
import { PlateMapGrid } from "./PlateMapGrid";
import { PlateMapManifest } from "./PlateMapManifest";
import { PlateMapPlateSelector } from "./PlateMapPlateSelector";
import { defaultColorForWell, getPlateMapScopedWellId, usePlateMapEditorState } from "./usePlateMapEditorState";


import type { PlateMapActionsMenuProps } from "./PlateMapActionsMenu";
import type { PlateMapPlateSelectorVariant } from "./PlateMapPlateSelector";
import type { WellShape } from "./PlatePaintGrid";
import type {
  PlateFormat,
  PlateMapEditorLabels,
  PlateMapGroupOption,
  PlateMapPlateOption,
  WellColumn,
  WellField,
  WellId,
  WellRecord,
} from "./types";
import type { PlateMapApplyScope } from "./usePlateMapEditorState";
import type { FilterColumnConfig } from "@/components/ui/data-table/data-table";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const DEFAULT_PLATE_BARCODE_FIELD = "plateBarcode";
const DEFAULT_PLATE_BARCODE_HEADER = "Plate Barcode";
const DEFAULT_MANIFEST_TITLE = "Sample manifest";
const DEFAULT_FORM_WIDTH = "360px";

/**
 * Width at which the form and plate stop stacking and sit side by side.
 *
 * These are **container** widths, not viewport widths — the editor measures the
 * space it is actually given, so it lays out correctly inside a narrow panel,
 * split pane, or drawer on a wide monitor, not just on a small device. Below
 * the chosen width both regions are full-width and stacked.
 *
 * `"sm"` 640px · `"md"` 768px (default) · `"lg"` 1024px · `"xl"` 1280px ·
 * `"never"` always stacked.
 */
export type PlateMapEditorStackAt = "sm" | "md" | "lg" | "xl" | "never";

/** Where the metadata form sits relative to the plate grid. */
export type PlateMapEditorFormPlacement = "start" | "end" | "top" | "bottom";

/**
 * Static container-query class maps. Tailwind scans source text, so these
 * cannot be built by interpolation — every class that ships must appear here
 * verbatim.
 */
const SIDE_BY_SIDE_AT: Record<PlateMapEditorStackAt, string> = {
  sm: "@min-[640px]:flex-row @min-[640px]:items-start",
  md: "@min-[768px]:flex-row @min-[768px]:items-start",
  lg: "@min-[1024px]:flex-row @min-[1024px]:items-start",
  xl: "@min-[1280px]:flex-row @min-[1280px]:items-start",
  never: "",
};

const FORM_WIDTH_AT: Record<PlateMapEditorStackAt, string> = {
  sm: "@min-[640px]:w-[var(--plate-map-form-width)] @min-[640px]:shrink-0",
  md: "@min-[768px]:w-[var(--plate-map-form-width)] @min-[768px]:shrink-0",
  lg: "@min-[1024px]:w-[var(--plate-map-form-width)] @min-[1024px]:shrink-0",
  xl: "@min-[1280px]:w-[var(--plate-map-form-width)] @min-[1280px]:shrink-0",
  never: "",
};

export { getPlateMapScopedWellId };

/**
 * Imperative handle for driving the editor's staged-edit state from outside —
 * the supported way to render the metadata form somewhere the editor can't
 * reach (a host sidebar, a drawer, a toolbar) while keeping the editor's
 * selection and apply behaviour.
 *
 * Pair with `hideForm` and your own form:
 *
 * ```tsx
 * const editor = React.useRef<PlateMapEditorHandle<MyWell>>(null);
 * <PlateMapEditor ref={editor} hideForm … />
 * <MySidebarForm
 *   onChange={(next) => editor.current?.setStaged(next)}
 *   onApply={() => editor.current?.apply()}
 *   onClear={() => editor.current?.clear()}
 * />
 * ```
 */
export interface PlateMapEditorHandle<T extends WellRecord = WellRecord> {
  /** Applies the staged record across the current selection. */
  apply: (scope?: PlateMapApplyScope) => void;
  /** Clears the current selection's wells. */
  clear: (scope?: PlateMapApplyScope) => void;
  /** Replaces the staged record. */
  setStaged: (next: Partial<T>) => void;
  /** Reads the staged record. */
  getStaged: () => Partial<T>;
}

export interface PlateMapEditorProps<T extends WellRecord = WellRecord> extends Omit<
  PlateMapActionsMenuProps,
  "hasEntries" | "className"
> {
  format: PlateFormat;
  rows?: number;
  columns?: number;
  values: Map<WellId, T>;
  onChange: (next: Map<WellId, T>) => void;
  selection: Set<WellId>;
  onSelectionChange: (next: Set<WellId>) => void;

  fields: WellField<T>[];
  tableColumns: WellColumn<T>[];

  /**
   * Resolves the SVG fill color for a well. Optional — defaults to a filled
   * swatch for populated wells and the empty-well token for the rest, which is
   * enough for read-only or single-category views.
   */
  colorForWell?: (well: T | undefined, wellId: WellId) => string;
  /** Builds an empty record when a well is freshly created. Defaults to `{}`. */
  emptyEntry?: (wellId: WellId) => T;
  /**
   * Merges the staged form record onto an existing well record on Apply.
   * Defaults to a shallow merge (form keys overwrite existing keys when set).
   */
  mergeOnApply?: (existing: T | undefined, staged: Partial<T>, wellId: WellId) => T;
  /** Filter for the manifest's "hide empty" mode. */
  isPopulated?: (row: T) => boolean;
  /** Select field cycled when double-clicking a single well, e.g. role painting. */
  cycleFieldOnWellDoubleClick?: keyof T & string;

  /**
   * Controlled staged form record. Pair with `onStagedChange` to prefill the
   * form, read what's staged, or drive Apply from outside. When omitted the
   * editor owns staged state internally.
   */
  staged?: Partial<T>;
  onStagedChange?: (next: Partial<T>) => void;

  /** Optional header title (e.g. plate set name). */
  title?: string;
  /** Optional badges shown in the header next to the title. */
  badges?: React.ReactNode;
  /** Optional banner (e.g. import/error alert) shown above the whole layout. */
  banner?: React.ReactNode;
  /** Legend block. Position controlled by `legendPlacement`. */
  legend?: React.ReactNode;
  /**
   * Where `legend` renders. `"form"` (default) puts it under the form column,
   * separated by a divider. `"plate"` puts it under the grid inside the plate
   * card, stacked above anything in `plateFooter`. With `hideForm`, `"form"`
   * drops the legend entirely — use `"plate"` there.
   */
  legendPlacement?: "form" | "plate";
  /** Form helper slot rendered between fields and the action row. */
  formExtras?: React.ReactNode;
  /**
   * Fully replaces the left column. When set, the built-in `WellMetadataForm`
   * is omitted — use this for alternative workflows like a drag-and-drop
   * source palette. The legend slot still renders beneath the replacement.
   */
  formSlot?: React.ReactNode;
  /** Hides the form column entirely, leaving grid (+ manifest). */
  hideForm?: boolean;

  /* ---------------------------------------------------------------- Layout */

  /**
   * Where the metadata form sits relative to the plate grid. `"start"` /
   * `"end"` put it beside the grid (subject to `stackAt`); `"top"` / `"bottom"`
   * stack it full-width at every breakpoint. Defaults to `"start"`.
   */
  formPlacement?: PlateMapEditorFormPlacement;
  /**
   * Viewport width at which the form and grid sit side by side. Below it they
   * always stack full-width. Ignored when `formPlacement` is `"top"`/`"bottom"`.
   * Defaults to `"md"`.
   */
  stackAt?: PlateMapEditorStackAt;
  /**
   * Width of the form column at and above `stackAt`. Any CSS length (`"420px"`,
   * `"28rem"`, `"30%"`) or a number treated as px. Defaults to `"360px"`.
   * Below `stackAt` the form is always full-width regardless of this value.
   */
  formWidth?: number | string;
  /** Footer actions (e.g. Save, Back). Position controlled by `footerPlacement`. */
  footer?: React.ReactNode;
  /**
   * Where `footer` renders. `"editor"` (default) keeps it as a standalone row
   * at the very bottom, below the manifest. `"plate-card"` renders it as a real
   * `CardFooter` inside the plate card, which is what the card's
   * `has-data-[slot=card-footer]` styling is there for.
   */
  footerPlacement?: "editor" | "plate-card";
  /** Title for the plate grid panel. */
  plateTitle?: React.ReactNode;
  /** Optional controls shown above the grid, inside the plate card. */
  plateToolbar?: React.ReactNode;
  /** Slot rendered above the grid's toolbar, scoped to the plate card only. */
  plateBanner?: React.ReactNode;
  /** Slot rendered below the grid, inside the plate card. */
  plateFooter?: React.ReactNode;
  /** User-provided plates available for this editor. Barcodes are never generated by the editor. */
  plates?: PlateMapPlateOption[];
  activePlateId?: string;
  onPlateChange?: (plateId: string) => void;
  /** Opens the host app's manual barcode entry flow for creating a plate. */
  onAddPlate?: () => void;
  /** Removes a plate (typically when using `plateSelectorVariant="tabs"`). */
  onRemovePlate?: (plateId: string) => void;
  addPlateLabel?: string;
  removePlateLabel?: string;
  plateSelectorLabel?: string;
  /** Layout of the plate selector. Defaults to `"dropdown"`. */
  plateSelectorVariant?: PlateMapPlateSelectorVariant;
  /** Row field used to stamp the active user-provided barcode onto edited wells. Defaults to `plateBarcode`. */
  plateBarcodeField?: keyof T & string;
  /**
   * Which plates Apply/Clear write to. `"active-plate"` (default) touches only
   * the plate on screen; `"all-plates"` writes the same well positions on every
   * plate in `plates`, each row stamped with its own barcode.
   *
   * For a UI offering both side by side, use `usePlateMapEditorState` directly —
   * `applyStagedToSelection("all-plates")` takes a per-call override.
   */
  applyScope?: PlateMapApplyScope;
  /** Header for the automatic manifest barcode column. */
  plateBarcodeColumnHeader?: string;
  /** Hide the automatic manifest barcode column when plate-scoped editing is active. */
  hidePlateBarcodeColumn?: boolean;
  /** Optional grouped well shortcuts rendered under the grid. */
  groups?: PlateMapGroupOption[];
  activeGroupId?: string;
  onGroupClick?: (group: PlateMapGroupOption) => void;
  /** Custom hover summary for the strip above the grid. */
  renderHoverSummary?: (well: T | undefined, wellId: WellId) => React.ReactNode;
  /** Fixed well size. When unset, the grid grows with the available width. */
  cellSize?: number;
  /** Fill color for empty wells. Pass `null` to delegate empty wells to `colorForWell`. */
  emptyWellFillColor?: string | null;
  /** Well shape forwarded to `PlatePaintGrid`. Defaults to `"rect"`. */
  wellShape?: WellShape;
  /** When true, wraps the grid in a card-like plate frame (rounded + border + soft shadow). */
  framedPlate?: boolean;
  /**
   * Forwarded to `PlatePaintGrid`. Render-prop that places a node inside each
   * absolute-positioned well cell — used to wire drop targets without binding
   * the kit to a specific DnD library.
   */
  wrapWell?: (wellId: WellId, cellSize: number) => React.ReactNode;
  /** Wells to highlight (e.g. when hovering a legend item externally). */
  highlightedWellIds?: ReadonlySet<WellId>;
  /** Fires whenever the currently hovered well changes (null on leave). */
  onHoveredWellChange?: (wellId: WellId | null) => void;
  /** Hides the grid's built-in "Select all" / "Deselect all" links. */
  hideSelectionControls?: boolean;
  /**
   * Overrides every user-facing string the editor and its manifest render —
   * the single place to localise. Omitted keys fall back to English defaults.
   *
   * Does not cover `plateTitle` / `manifestTitle` (own props, `ReactNode`) or
   * the import/export menu's labels (`importCsvLabel` and friends, inherited
   * from `PlateMapActionsMenuProps`).
   */
  labels?: PlateMapEditorLabels;
  /** Hides the sample manifest panel entirely. */
  hideManifest?: boolean;
  /**
   * Fully replaces the manifest panel's body, keeping the card and heading.
   * Use for a bespoke summary table; pair with `hideManifest` to drop the
   * region altogether.
   */
  manifestSlot?: React.ReactNode;
  /** Adds the manifest's copy-first-value-downward column action. Defaults to true. */
  manifestEnableFillDown?: boolean;
  /** Heading for the manifest card. Defaults to `"Sample manifest"`. */
  manifestTitle?: React.ReactNode;
  /** Enables the filter popover on the manifest table. */
  manifestFilterable?: boolean;
  /** Overrides which manifest columns are filterable and how. */
  manifestFilterColumns?: FilterColumnConfig[];
  /** Enables the group-by selector on the manifest table. */
  manifestGroupable?: boolean;
  /** Field the manifest groups by on first render. Requires `manifestGroupable`. */
  manifestDefaultGroupBy?: string;
  manifestPageSize?: number;
  manifestPageSizeOptions?: number[];
  autoScaleGrid?: boolean;
  minCellSize?: number;
  maxCellSize?: number;

  className?: string;
  /** Inline styles for the editor root. */
  style?: React.CSSProperties;
  /**
   * Imperative handle for driving staged edits from outside the editor.
   * See {@link PlateMapEditorHandle}.
   */
  ref?: React.Ref<PlateMapEditorHandle<T>>;
  /** Applied to the row holding the form and plate columns. */
  layoutClassName?: string;
  /**
   * Applied to the form column `Card`. Merged after the default width clamp,
   * so `max-w-*` / `min-w-*` / `basis-*` utilities here win.
   */
  formCardClassName?: string;
  /** Applied to the plate column `Card`. */
  plateCardClassName?: string;
  /** Applied to the manifest `Card`. */
  manifestCardClassName?: string;
  /** Applied to the `PlateMapForm` panel inside the form card. */
  formClassName?: string;
  /** Applied to the `PlateMapGrid` panel inside the plate card. */
  gridClassName?: string;
  /** Applied to the `PlateMapManifest` panel inside the manifest card. */
  manifestClassName?: string;
}

function shouldShowPlateSelector(plateCount: number, onAddPlate: PlateMapEditorProps["onAddPlate"]): boolean {
  return plateCount > 0 || !!onAddPlate;
}

function PlateMapEditorTitleBar({ title, badges }: { title?: string; badges?: React.ReactNode }) {
  if (!title && !badges) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      {title ? <h2 className="text-lg font-semibold">{title}</h2> : <span />}
      {badges ? <div className="flex flex-wrap gap-2">{badges}</div> : null}
    </div>
  );
}

function resolvePlateGridFooter(plateLegend: React.ReactNode, plateFooter: React.ReactNode): React.ReactNode {
  if (!plateLegend && !plateFooter) return undefined;
  return (
    <>
      {plateLegend ? <div className="mt-3 border-t pt-3">{plateLegend}</div> : null}
      {plateFooter}
    </>
  );
}

function PlateMapEditorFooterRow({
  footer,
  placement,
}: {
  footer: React.ReactNode;
  placement: "editor" | "plate-card";
}) {
  if (!footer || placement !== "editor") return null;
  return <div className="flex flex-wrap justify-end gap-2 pt-2">{footer}</div>;
}

function PlateMapEditorPlateSelectorSlot({
  visible,
  ...selectorProps
}: { visible: boolean } & React.ComponentProps<typeof PlateMapPlateSelector>) {
  if (!visible) return null;
  return <PlateMapPlateSelector {...selectorProps} />;
}

function PlateMapEditorManifestCard({
  hidden,
  title,
  cardClassName,
  slot,
  manifest,
}: {
  hidden: boolean;
  title: React.ReactNode;
  cardClassName?: string;
  slot?: React.ReactNode;
  manifest: React.ReactNode;
}) {
  if (hidden) return null;

  return (
    <Card size="sm" data-plate-map-region="manifest" className={cn("w-full min-w-0", cardClassName)}>
      {title ? (
        <CardHeader className="border-b">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      ) : null}
      <CardContent className="min-w-0">{slot ?? manifest}</CardContent>
    </Card>
  );
}

/**
 * Turnkey plate-map editing surface: a metadata form, an interactive plate
 * grid, and a sample manifest, wired together with the staged-edit controller
 * in {@link usePlateMapEditorState}.
 *
 * ## Choosing a level
 *
 * | You need | Use |
 * | --- | --- |
 * | The standard surface, tuned by props | `PlateMapEditor` (this) |
 * | A layout these props can't express | {@link usePlateMapEditorState} + `PlateMapForm` / `PlateMapGrid` / `PlateMapManifest` |
 * | One region only, wired yourself | The primitives directly |
 *
 * Dropping to the hook keeps the apply/clear semantics, plate scoping, and
 * barcode stamping — you only take over layout.
 *
 * ## Customization map
 *
 * - **Layout** — `formPlacement` (`start`/`end`/`top`/`bottom`), `stackAt`,
 *   `formWidth`, `hideForm`, `hideManifest`.
 * - **Slots** — `title`, `badges`, `banner` (whole editor), `plateBanner`
 *   (plate card only), `plateToolbar` (above grid), `plateFooter` (below
 *   grid), `footer` + `footerPlacement`, `legend` + `legendPlacement`,
 *   `formExtras`, `formSlot` (replaces the form), `manifestSlot` (replaces the
 *   manifest body).
 * - **Edit semantics** — `mergeOnApply`, `emptyEntry`, `isPopulated`,
 *   `cycleFieldOnWellDoubleClick`, and `staged` / `onStagedChange` to make the
 *   staged record controlled.
 * - **Labels** — one `labels` object covers every string the editor and its
 *   manifest render. `plateTitle` / `manifestTitle` and the import/export menu
 *   labels stay separate (they are `ReactNode` slots, not plain text).
 * - **Styling** — `className`, `layoutClassName`, and per-region
 *   `formCardClassName` / `plateCardClassName` / `manifestCardClassName` plus
 *   `formClassName` / `gridClassName` / `manifestClassName`. Each card also
 *   carries `data-plate-map-region="form|plate|manifest"` for CSS targeting.
 *
 * ## Responsiveness
 *
 * The editor responds to **its container's** width, not the viewport's, so it
 * lays out correctly inside a narrow panel, split pane, or drawer on a wide
 * screen. `stackAt` names a container width (`sm` 640 / `md` 768 / `lg` 1024 /
 * `xl` 1280 / `never`); below it the form and grid stack full-width. A plate
 * too dense to fit scrolls inside its own container rather than widening the
 * page.
 *
 * @example Default surface
 * ```tsx
 * <PlateMapEditor
 *   format="96"
 *   values={values}
 *   onChange={setValues}
 *   selection={selection}
 *   onSelectionChange={setSelection}
 *   fields={FIELDS}
 *   tableColumns={COLUMNS}
 * />
 * ```
 *
 * @example Grid-only, form on the right, localised
 * ```tsx
 * <PlateMapEditor
 *   {...base}
 *   formPlacement="end"
 *   stackAt="lg"
 *   formWidth="22rem"
 *   hideManifest
 *   labels={{ apply: "Appliquer", clearWells: "Vider les puits" }}
 * />
 * ```
 */
export function PlateMapEditor<T extends WellRecord = WellRecord>({
  format,
  rows,
  columns,
  values,
  onChange,
  selection,
  onSelectionChange,
  fields,
  tableColumns,
  colorForWell = defaultColorForWell,
  emptyEntry,
  mergeOnApply,
  isPopulated,
  cycleFieldOnWellDoubleClick,
  staged: controlledStaged,
  onStagedChange,
  title,
  badges,
  banner,
  legend,
  legendPlacement = "form",
  formExtras,
  formSlot,
  hideForm = false,
  formPlacement = "start",
  stackAt = "md",
  formWidth = DEFAULT_FORM_WIDTH,
  footer,
  footerPlacement = "editor",
  plateTitle = "Plate",
  plateToolbar,
  plateBanner,
  plateFooter,
  plates,
  activePlateId,
  onPlateChange,
  onAddPlate,
  onRemovePlate,
  addPlateLabel,
  removePlateLabel,
  plateSelectorLabel,
  plateSelectorVariant,
  plateBarcodeField,
  applyScope,
  plateBarcodeColumnHeader = DEFAULT_PLATE_BARCODE_HEADER,
  hidePlateBarcodeColumn = false,
  groups,
  activeGroupId,
  onGroupClick,
  renderHoverSummary,
  cellSize,
  emptyWellFillColor,
  wellShape,
  framedPlate,
  wrapWell,
  highlightedWellIds,
  onHoveredWellChange,
  hideSelectionControls,
  labels,
  hideManifest = false,
  manifestSlot,
  manifestEnableFillDown,
  manifestTitle = DEFAULT_MANIFEST_TITLE,
  manifestFilterable,
  manifestFilterColumns,
  manifestGroupable,
  manifestDefaultGroupBy,
  manifestPageSize,
  manifestPageSizeOptions,
  autoScaleGrid,
  minCellSize,
  maxCellSize,
  className,
  style,
  ref,
  layoutClassName,
  formCardClassName,
  plateCardClassName,
  manifestCardClassName,
  formClassName,
  gridClassName,
  manifestClassName,
  templates,
  templateId,
  onTemplateChange,
  onClearTemplate,
  onImportCsv,
  onExportCsv,
  onImportTemplate,
  onExportTemplate,
  csvAccept,
  templateAccept,
  label,
  align,
  side,
  importTemplateLabel,
  exportTemplateLabel,
  importCsvLabel,
  exportCsvLabel,
  clearLabel,
}: PlateMapEditorProps<T>) {
  const state = usePlateMapEditorState<T>({
    values,
    onChange,
    selection,
    onSelectionChange,
    emptyEntry,
    mergeOnApply,
    staged: controlledStaged,
    onStagedChange,
    fields,
    cycleFieldOnWellDoubleClick,
    plates,
    activePlateId,
    onPlateChange,
    plateBarcodeField,
    applyScope,
    onImportCsv,
  });

  React.useImperativeHandle(
    ref,
    () => ({
      apply: (scope?: PlateMapApplyScope) => state.applyStagedToSelection(scope),
      clear: (scope?: PlateMapApplyScope) => state.clearWells(scope),
      setStaged: (next: Partial<T>) => state.setStaged(next),
      getStaged: () => state.staged,
    }),
    [state],
  );

  const barcodeField = (plateBarcodeField ?? DEFAULT_PLATE_BARCODE_FIELD) as keyof T & string;
  const activePlateBarcode = state.activePlate?.barcode;

  const manifestColumns = React.useMemo(() => {
    if (!state.isPlateScoped || !activePlateBarcode || hidePlateBarcodeColumn) return tableColumns;
    const alreadyHasBarcodeColumn = tableColumns.some(
      (column) => column.field === barcodeField || column.id === barcodeField,
    );
    if (alreadyHasBarcodeColumn) return tableColumns;

    const barcodeColumn: WellColumn<T> = {
      id: barcodeField,
      header: plateBarcodeColumnHeader,
      minWidth: 150,
      render: ({ row }) => {
        const barcode = row[barcodeField] ?? activePlateBarcode;
        return <Badge variant="outline">{String(barcode)}</Badge>;
      },
    };
    return [barcodeColumn, ...tableColumns];
  }, [
    activePlateBarcode,
    barcodeField,
    hidePlateBarcodeColumn,
    state.isPlateScoped,
    plateBarcodeColumnHeader,
    tableColumns,
  ]);

  const showPlateSelector = shouldShowPlateSelector(state.availablePlates.length, onAddPlate);

  // The legend rides with the grid when `legendPlacement="plate"`, stacked
  // above whatever the caller put in `plateFooter`.
  const plateGridFooter = resolvePlateGridFooter(legendPlacement === "plate" ? legend : null, plateFooter);
  const showPlateCardFooter = footerPlacement === "plate-card" && !!footer;

  const isStackedPlacement = formPlacement === "top" || formPlacement === "bottom";
  const isFormFirst = formPlacement === "start" || formPlacement === "top";
  const resolvedFormWidth = typeof formWidth === "number" ? `${formWidth}px` : formWidth;

  const formColumn = hideForm ? null : (
    <Card
      key="form"
      data-plate-map-region="form"
      className={cn(
        // Full-width and free to shrink by default; the fixed column width only
        // applies from `stackAt` up, which is what keeps narrow viewports clean.
        "flex w-full min-w-0 flex-col",
        !isStackedPlacement && FORM_WIDTH_AT[stackAt],
        formCardClassName,
      )}
      size="sm"
    >
      <CardContent className="flex h-full flex-1 flex-col gap-3">
        <PlateMapForm
          fields={fields}
          value={state.staged}
          onChange={state.setStaged}
          selectionSize={selection.size}
          onApply={state.applyStagedToSelection}
          onClear={state.clearWells}
          applyLabel={labels?.apply}
          clearLabel={labels?.clearWells}
          selectionEmptyLabel={labels?.selectionEmpty}
          selectionCountLabel={labels?.selectionCount}
          extras={formExtras}
          legend={legendPlacement === "form" ? legend : undefined}
          formSlot={formSlot}
          className={formClassName}
        />
      </CardContent>
    </Card>
  );

  const plateColumn = (
    <Card
      key="plate"
      data-plate-map-region="plate"
      // `min-w-0` rather than a px floor: this flex child must be allowed to
      // shrink below its content width so the grid's own horizontal scroller
      // absorbs the overflow instead of the page doing it.
      className={cn("flex w-full min-w-0 flex-1 flex-col", plateCardClassName)}
      size="sm"
    >
      <CardHeader className="border-b">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <CardTitle className="min-w-0">{plateTitle}</CardTitle>
          <PlateMapEditorPlateSelectorSlot
            visible={showPlateSelector}
            plates={state.availablePlates}
            activePlateId={state.activePlate?.id}
            onPlateChange={state.canChangePlate ? state.handlePlateChange : undefined}
            onAddPlate={onAddPlate}
            onRemovePlate={onRemovePlate}
            addPlateLabel={addPlateLabel}
            removePlateLabel={removePlateLabel}
            label={plateSelectorLabel}
            variant={plateSelectorVariant}
          />
        </div>
        <CardAction className="flex flex-wrap items-center gap-2">
          <PlateMapActionsMenu
            templates={templates}
            templateId={templateId}
            onTemplateChange={onTemplateChange}
            onClearTemplate={onClearTemplate}
            hasEntries={values.size > 0}
            onImportCsv={onImportCsv ? state.handleImportCsv : undefined}
            onExportCsv={onExportCsv}
            onImportTemplate={onImportTemplate}
            onExportTemplate={onExportTemplate}
            csvAccept={csvAccept}
            templateAccept={templateAccept}
            label={label}
            align={align}
            side={side}
            importTemplateLabel={importTemplateLabel}
            exportTemplateLabel={exportTemplateLabel}
            importCsvLabel={importCsvLabel}
            exportCsvLabel={exportCsvLabel}
            clearLabel={clearLabel}
          />
        </CardAction>
      </CardHeader>
      <CardContent className="min-w-0">
        <PlateMapGrid
          format={format}
          rows={rows}
          columns={columns}
          values={state.scopedValues}
          selection={selection}
          onSelectionChange={onSelectionChange}
          colorForWell={colorForWell}
          fields={fields}
          renderHoverSummary={renderHoverSummary}
          hoveredWellId={state.hoveredWellId}
          onHoveredWellChange={(wellId) => {
            state.setHoveredWellId(wellId);
            onHoveredWellChange?.(wellId);
          }}
          banner={plateBanner}
          toolbar={plateToolbar}
          footer={plateGridFooter}
          hideSelectionControls={hideSelectionControls}
          selectAllLabel={labels?.selectAll}
          deselectAllLabel={labels?.deselectAll}
          emptyWellFillColor={emptyWellFillColor}
          wellShape={wellShape}
          framed={framedPlate}
          wrapWell={wrapWell}
          highlightedWellIds={highlightedWellIds}
          onWellDoubleClick={state.cycleWellField}
          selectionFillMode={state.cycleWellField ? "well" : "selection"}
          flashWellId={state.flashWell?.wellId}
          flashWellKey={state.flashWell?.key}
          cellSize={cellSize}
          autoScale={autoScaleGrid}
          minCellSize={minCellSize}
          maxCellSize={maxCellSize}
          groups={groups}
          activeGroupId={activeGroupId}
          onGroupClick={onGroupClick}
          className={gridClassName}
        />
      </CardContent>
      {showPlateCardFooter ? (
        <CardFooter className="flex flex-wrap justify-end gap-2 border-t">{footer}</CardFooter>
      ) : null}
    </Card>
  );

  const columnsInOrder = isFormFirst ? [formColumn, plateColumn] : [plateColumn, formColumn];

  return (
    <div data-slot="plate-map-editor" className={cn("flex w-full min-w-0 flex-col gap-4", className)} style={style}>
      <PlateMapEditorTitleBar title={title} badges={badges} />

      {banner}

      {/*
       * `container-type` establishes a query context for DESCENDANTS — an
       * element cannot query its own width — so the `@container` marker and the
       * `@min-[…]` variants it drives must live on different elements. Querying
       * the container rather than the viewport is what lets the editor lay out
       * correctly inside a narrow panel on a wide screen.
       */}
      <div
        data-slot="plate-map-editor-container"
        className="@container w-full min-w-0"
        style={{ "--plate-map-form-width": resolvedFormWidth } as React.CSSProperties}
      >
        <div
          data-slot="plate-map-editor-layout"
          // Mobile-first: a plain stacked column, promoted to a row only once
          // the container is wide enough (never, for top/bottom placement).
          className={cn(
            "flex w-full min-w-0 flex-col gap-3",
            !isStackedPlacement && SIDE_BY_SIDE_AT[stackAt],
            layoutClassName,
          )}
        >
          {columnsInOrder}
        </div>
      </div>

      <PlateMapEditorManifestCard
        hidden={hideManifest}
        title={manifestTitle}
        cardClassName={manifestCardClassName}
        slot={manifestSlot}
        manifest={
          <PlateMapManifest
            values={state.scopedValues}
            onChange={state.commitScopedValues}
            columns={manifestColumns}
            fields={fields}
            selection={selection}
            onSelectionChange={onSelectionChange}
            emptyEntry={emptyEntry}
            isPopulated={isPopulated}
            filterable={manifestFilterable}
            filterColumns={manifestFilterColumns}
            groupable={manifestGroupable}
            defaultGroupBy={manifestDefaultGroupBy}
            pageSize={manifestPageSize}
            pageSizeOptions={manifestPageSizeOptions}
            enableFillDown={manifestEnableFillDown}
            labels={labels}
            className={manifestClassName}
          />
        }
      />

      <PlateMapEditorFooterRow footer={footer} placement={footerPlacement} />
    </div>
  );
}

export { Badge as PlateBadge };
