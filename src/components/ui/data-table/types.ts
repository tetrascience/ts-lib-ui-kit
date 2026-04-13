import type { RowData } from "@tanstack/react-table"

export interface TableColumnMeta {
  /** Display label for column toggle/editor UI. Falls back to header string. */
  label?: string
  /** Whether column can be hidden via visibility toggle. @default true */
  canHide?: boolean
  /** Whether column can be reordered via drag-and-drop. @default true */
  canReorder?: boolean
  /** Whether column can be removed entirely. @default false */
  canRemove?: boolean
  /** Whether column can be renamed via the editor. @default false */
  canRename?: boolean
}

export interface ManagedColumn {
  id: string
  label: string
  isVisible: boolean
  canHide: boolean
  canReorder: boolean
  canRemove: boolean
  canRename: boolean
}

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue>
    extends TableColumnMeta {
    [key: string]: unknown
  }
}
