import * as React from "react";

import { defaultEmptyEntry } from "./usePlateMapEditorState";
import { WellManifestTable } from "./WellManifestTable";

import type { WellColumn, WellField, WellId, WellManifestTableLabels, WellRecord } from "./types";
import type { FilterColumnConfig } from "@/components/ui/data-table/data-table";

import { cn } from "@/lib/utils";

export interface PlateMapManifestProps<T extends WellRecord = WellRecord> {
  values: Map<WellId, T>;
  onChange: (next: Map<WellId, T>) => void;
  columns: WellColumn<T>[];
  fields?: WellField<T>[];
  selection?: Set<WellId>;
  onSelectionChange?: (next: Set<WellId>) => void;
  /** Builds an empty record when a manifest row is freshly created. Defaults to `{}`. */
  emptyEntry?: (id: WellId) => T;
  /** Filter for the manifest's "hide empty" mode. */
  isPopulated?: (row: T) => boolean;
  /** Enables the filter popover on the manifest table. */
  filterable?: boolean;
  /** Overrides which columns are filterable and how. */
  filterColumns?: FilterColumnConfig[];
  /** Enables the group-by selector on the manifest table. */
  groupable?: boolean;
  /** Field grouped by on first render. Requires `groupable`. */
  defaultGroupBy?: string;
  /** Adds the copy-first-value-downward column action. Defaults to true. */
  enableFillDown?: boolean;
  /** Overrides any user-facing string in the table. */
  labels?: WellManifestTableLabels;
  pageSize?: number;
  pageSizeOptions?: number[];
  /** Optional heading rendered above the table. Omit for a bare table. */
  title?: React.ReactNode;
  className?: string;
}

/**
 * Card-agnostic sample-manifest panel. A thin wrapper over `WellManifestTable`
 * with an optional heading and no width constraint of its own, so it can span
 * the full screen width or sit inside any container the caller chooses.
 */
export function PlateMapManifest<T extends WellRecord = WellRecord>({
  values,
  onChange,
  columns,
  fields,
  selection,
  onSelectionChange,
  emptyEntry = defaultEmptyEntry,
  isPopulated,
  filterable,
  filterColumns,
  groupable,
  defaultGroupBy,
  enableFillDown,
  labels,
  pageSize,
  pageSizeOptions,
  title,
  className,
}: PlateMapManifestProps<T>) {
  return (
    <div data-slot="plate-map-manifest" className={cn("flex flex-col gap-3", className)}>
      {title ? <div className="text-base leading-snug font-medium">{title}</div> : null}
      <WellManifestTable<T>
        values={values}
        onChange={onChange}
        columns={columns}
        fields={fields}
        selection={selection}
        onSelectionChange={onSelectionChange}
        emptyEntry={emptyEntry}
        isPopulated={isPopulated}
        filterable={filterable}
        filterColumns={filterColumns}
        groupable={groupable}
        defaultGroupBy={defaultGroupBy}
        enableFillDown={enableFillDown}
        labels={labels}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
      />
    </div>
  );
}
