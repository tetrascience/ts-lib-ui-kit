import { Check, ChevronDown, Download, LayoutTemplate, SaveAll, Trash2, Upload } from "lucide-react";
import * as React from "react";

import { triagePlateMapCsvFile } from "./csvPlateTriage";
import { groupTemplateOptions } from "./helpers";

import type { ImportExportHandlers, PlateMapCsvTriage, TemplateOption } from "./types";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface PlateMapActionsMenuProps extends ImportExportHandlers {
  templates?: TemplateOption[];
  templateId?: string;
  onTemplateChange?: (id: string) => void;
  onClearTemplate?: () => void;
  /** Disable export/save actions when there is nothing to export. */
  hasEntries?: boolean;
  label?: React.ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  csvAccept?: string;
  templateAccept?: string;
  importTemplateLabel?: string;
  exportTemplateLabel?: string;
  importCsvLabel?: string;
  exportCsvLabel?: string;
  clearLabel?: string;
  className?: string;
}

function HiddenFileInput({
  inputRef,
  accept,
  onPick,
  triageCsv,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  accept: string;
  onPick?: (file: File, triage?: PlateMapCsvTriage) => void | Promise<void>;
  triageCsv?: boolean;
}) {
  return (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      hidden
      onChange={(event) => {
        const input = event.currentTarget;
        const file = event.target.files?.[0];
        if (!file) {
          input.value = "";
          return;
        }

        void (async () => {
          const triage = triageCsv ? await triagePlateMapCsvFile(file) : undefined;
          await (triage ? onPick?.(file, triage) : onPick?.(file));
          input.value = "";
        })();
      }}
    />
  );
}

export function PlateMapActionsMenu({
  templates,
  templateId,
  onTemplateChange,
  onClearTemplate,
  hasEntries,
  onImportCsv,
  onExportCsv,
  onImportTemplate,
  onExportTemplate,
  label = "Actions",
  align = "start",
  side = "bottom",
  csvAccept = ".csv,text/csv",
  templateAccept = "application/json",
  importTemplateLabel = "Import template (JSON)",
  exportTemplateLabel = "Save template",
  importCsvLabel = "Import plate map (CSV)",
  exportCsvLabel = "Export plate map (CSV)",
  clearLabel = "Clear template",
  className,
}: PlateMapActionsMenuProps) {
  const templateInputRef = React.useRef<HTMLInputElement>(null);
  const csvInputRef = React.useRef<HTMLInputElement>(null);
  const templateGroups = React.useMemo(() => groupTemplateOptions(templates), [templates]);
  const disableEntryExport = hasEntries === false;

  const hasMenuItems =
    templateGroups.length > 0 ||
    !!onImportTemplate ||
    !!onExportTemplate ||
    !!onImportCsv ||
    !!onExportCsv ||
    !!onClearTemplate;

  if (!hasMenuItems) return null;

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm" className={cn("min-w-24 justify-between", className)}>
            <span>{label}</span>
            <ChevronDown aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} side={side} className="w-64">
          {templateGroups.map(([group, options]) => (
            <DropdownMenuGroup key={group || "templates"}>
              {group ? <DropdownMenuLabel>{group}</DropdownMenuLabel> : null}
              {options.map((template) => (
                <DropdownMenuItem
                  key={template.id}
                  disabled={template.disabled}
                  onClick={() => onTemplateChange?.(template.id)}
                >
                  {template.id === templateId ? <Check aria-hidden /> : <span className="size-4" aria-hidden />}
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{template.label}</span>
                    {template.description ? (
                      <span className="truncate text-xs text-muted-foreground">{template.description}</span>
                    ) : null}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          ))}

          {templateGroups.length > 0 &&
          (onImportTemplate || onExportTemplate || onImportCsv || onExportCsv || onClearTemplate) ? (
            <DropdownMenuSeparator />
          ) : null}

          {onImportTemplate ? (
            <DropdownMenuItem onClick={() => templateInputRef.current?.click()}>
              <LayoutTemplate aria-hidden />
              {importTemplateLabel}
            </DropdownMenuItem>
          ) : null}
          {onExportTemplate ? (
            <DropdownMenuItem disabled={disableEntryExport} onClick={() => onExportTemplate()}>
              <SaveAll aria-hidden />
              {exportTemplateLabel}
            </DropdownMenuItem>
          ) : null}

          {(onImportTemplate || onExportTemplate) && (onImportCsv || onExportCsv) ? <DropdownMenuSeparator /> : null}

          {onImportCsv ? (
            <DropdownMenuItem onClick={() => csvInputRef.current?.click()}>
              <Upload aria-hidden />
              {importCsvLabel}
            </DropdownMenuItem>
          ) : null}
          {onExportCsv ? (
            <DropdownMenuItem disabled={disableEntryExport} onClick={() => onExportCsv()}>
              <Download aria-hidden />
              {exportCsvLabel}
            </DropdownMenuItem>
          ) : null}

          {onClearTemplate ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                disabled={!templateId && !hasEntries}
                onClick={() => onClearTemplate()}
              >
                <Trash2 aria-hidden />
                {clearLabel}
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <HiddenFileInput inputRef={templateInputRef} accept={templateAccept} onPick={onImportTemplate} />
      <HiddenFileInput inputRef={csvInputRef} accept={csvAccept} onPick={onImportCsv} triageCsv />
    </>
  );
}
