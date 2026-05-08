import type { PlateFormat } from "@/components/charts/PlateMap";
import type * as React from "react";

export type { PlateFormat };

export type WellId = string;

/**
 * Generic per-well record. Callers supply concrete shape via the `T` generic
 * on `PlateMapEditor`. Permissive base accepts both interfaces and indexable
 * record types.
 */
export type WellRecord = NonNullable<unknown>;

/**
 * Field kinds rendered by `WellMetadataForm` and (in column mode) by
 * `WellManifestTable`.
 */
export type WellFieldKind = "text" | "number" | "select" | "custom";

export interface WellSelectOption {
  value: string;
  label: string;
  /** Optional swatch color shown next to the label. */
  swatch?: string;
}

export interface WellField<T extends WellRecord = WellRecord> {
  /** Key in the well record this field reads/writes. */
  key: keyof T & string;
  label: string;
  /** Optional leading icon shown in form labels and matching table headers. */
  icon?: React.ReactNode;
  kind: WellFieldKind;
  placeholder?: string;
  /** Required for `kind: "select"`. */
  options?: WellSelectOption[];
  /**
   * Custom renderer for the form input. Receives current value and a setter
   * that patches the field on the staged form record.
   */
  render?: (ctx: { value: unknown; onChange: (next: unknown) => void; selectionSize: number }) => React.ReactNode;
}

export interface WellColumn<T extends WellRecord = WellRecord> {
  /** Stable id; falls back to `field` if omitted. */
  id?: string;
  header: string;
  /** Optional leading icon in the table header. */
  icon?: React.ReactNode;
  /** Read direct property when `field` is set. */
  field?: keyof T & string;
  /** Min width in px (applied via inline style). */
  minWidth?: number;
  /**
   * Cell renderer. If omitted, the cell renders as a kit `Input` (or a
   * `Select` when `field` matches a `select` field on the editor schema).
   */
  render?: (ctx: { row: T; wellId: WellId; update: (patch: Partial<T>) => void }) => React.ReactNode;
}

export interface TemplateOption {
  id: string;
  label: string;
  /** Optional group header in the dropdown (e.g. "Built-in", "User"). */
  group?: string;
  /** Optional supporting text for richer chooser menus. */
  description?: string;
  disabled?: boolean;
}

export interface ImportExportHandlers {
  onImportCsv?: (file: File) => void | Promise<void>;
  onExportCsv?: () => void;
  onImportTemplate?: (file: File) => void | Promise<void>;
  onExportTemplate?: () => void;
}

export interface PlateDimensions {
  rows: number;
  columns: number;
}

export interface PlateMapGroupOption {
  id: string;
  label: string;
  /** Well ids in the group; callers can use this to select the group. */
  wellIds?: WellId[];
  /** Optional explicit count; defaults to `wellIds.length` when present. */
  count?: number;
  color?: string;
  borderColor?: string;
  disabled?: boolean;
}
