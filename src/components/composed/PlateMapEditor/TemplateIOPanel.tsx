import { Download, Upload } from "lucide-react";
import * as React from "react";

import type { ImportExportHandlers, TemplateOption } from "./types";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";


export interface TemplateIOPanelProps extends ImportExportHandlers {
  templates?: TemplateOption[];
  templateId?: string;
  onTemplateChange?: (id: string) => void;
  onClearTemplate?: () => void;
  /** Disable export buttons when there's nothing to export. */
  hasEntries?: boolean;
  className?: string;
  csvAccept?: string;
  templateAccept?: string;
}

interface FilePickerButtonProps {
  label: string;
  accept: string;
  onPick: (file: File) => void;
  disabled?: boolean;
}

function FilePickerButton({
  label,
  accept,
  onPick,
  disabled,
}: FilePickerButtonProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        <Upload aria-hidden /> {label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = "";
        }}
      />
    </>
  );
}

export function TemplateIOPanel({
  templates,
  templateId,
  onTemplateChange,
  onClearTemplate,
  hasEntries,
  onImportCsv,
  onExportCsv,
  onImportTemplate,
  onExportTemplate,
  className,
  csvAccept = ".csv,text/csv",
  templateAccept = "application/json",
}: TemplateIOPanelProps) {
  const groups = React.useMemo(() => {
    const map = new Map<string, TemplateOption[]>();
    (templates ?? []).forEach((t) => {
      const key = t.group ?? "";
      const list = map.get(key) ?? [];
      list.push(t);
      map.set(key, list);
    });
    return map;
  }, [templates]);

  return (
    <div
      data-slot="template-io-panel"
      className={cn("flex flex-col gap-3", className)}
    >
      <div className="text-sm font-medium">Template &amp; import / export</div>

      {templates && onTemplateChange ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="plate-template">Template</Label>
          <Select
            value={templateId ?? ""}
            onValueChange={(v) => onTemplateChange(v)}
          >
            <SelectTrigger id="plate-template" size="sm" className="w-full">
              <SelectValue placeholder="Select template…" />
            </SelectTrigger>
            <SelectContent>
              {[...groups.entries()].map(([group, opts]) => (
                <SelectGroup key={group || "_"}>
                  {group ? <SelectLabel>{group}</SelectLabel> : null}
                  {opts.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          {onClearTemplate ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearTemplate}
              disabled={!templateId && !hasEntries}
            >
              Clear template
            </Button>
          ) : null}
        </div>
      ) : null}

      {(onImportTemplate || onExportTemplate) ? (
        <>
          <Separator />
          <div className="text-xs font-medium text-muted-foreground">Template</div>
          <div className="flex flex-col gap-2">
            {onImportTemplate ? (
              <FilePickerButton
                label="Import template (JSON)"
                accept={templateAccept}
                onPick={onImportTemplate}
              />
            ) : null}
            {onExportTemplate ? (
              <Button
                variant="outline"
                size="sm"
                disabled={!hasEntries}
                onClick={onExportTemplate}
              >
                <Download aria-hidden /> Export template (JSON)
              </Button>
            ) : null}
          </div>
        </>
      ) : null}

      {(onImportCsv || onExportCsv) ? (
        <>
          <Separator />
          <div className="text-xs font-medium text-muted-foreground">Plate map</div>
          <div className="flex flex-col gap-2">
            {onImportCsv ? (
              <FilePickerButton
                label="Import plate map (CSV)"
                accept={csvAccept}
                onPick={onImportCsv}
              />
            ) : null}
            {onExportCsv ? (
              <Button
                variant="outline"
                size="sm"
                disabled={!hasEntries}
                onClick={onExportCsv}
              >
                <Download aria-hidden /> Export plate map (CSV)
              </Button>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
