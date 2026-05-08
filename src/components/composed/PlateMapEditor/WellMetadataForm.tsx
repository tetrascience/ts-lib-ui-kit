import * as React from "react";

import type { WellField, WellRecord } from "./types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface WellMetadataFormProps<T extends WellRecord = WellRecord> {
  fields: WellField<T>[];
  /** Staged values used to apply across the selection. */
  value: Partial<T>;
  onChange: (next: Partial<T>) => void;
  selectionSize: number;
  onApply: () => void;
  onClear: () => void;
  applyLabel?: string;
  clearLabel?: string;
  /** Optional extra slot rendered between fields and action row. */
  extras?: React.ReactNode;
  className?: string;
}

export function WellMetadataForm<T extends WellRecord = WellRecord>({
  fields,
  value,
  onChange,
  selectionSize,
  onApply,
  onClear,
  applyLabel = "Apply",
  clearLabel = "Clear wells",
  extras,
  className,
}: WellMetadataFormProps<T>) {
  const setField = (key: keyof T & string, next: unknown) => {
    onChange({ ...value, [key]: next } as Partial<T>);
  };

  const renderLabel = (field: WellField<T>) => (
    <Label htmlFor={`field-${field.key}`} className="gap-1.5">
      {field.icon ? <span className="inline-flex text-muted-foreground [&_svg]:size-3.5">{field.icon}</span> : null}
      {field.label}
    </Label>
  );

  return (
    <div data-slot="well-metadata-form" className={cn("flex flex-col gap-3", className)}>
      <div className="text-sm font-medium">
        {selectionSize > 0 ? `Apply to ${selectionSize} well${selectionSize === 1 ? "" : "s"}` : "Select wells to edit"}
      </div>

      {fields.map((field) => {
        const fieldValue = value[field.key];

        if (field.render) {
          return (
            <div key={field.key} className="flex flex-col gap-1.5">
              {renderLabel(field)}
              {field.render({
                value: fieldValue,
                onChange: (next) => setField(field.key, next),
                selectionSize,
              })}
            </div>
          );
        }

        if (field.kind === "select") {
          return (
            <div key={field.key} className="flex flex-col gap-1.5">
              {renderLabel(field)}
              <Select value={(fieldValue as string | undefined) ?? ""} onValueChange={(v) => setField(field.key, v)}>
                <SelectTrigger id={`field-${field.key}`} size="sm" className="w-full">
                  <SelectValue placeholder={field.placeholder ?? "Select…"} />
                </SelectTrigger>
                <SelectContent>
                  {(field.options ?? []).map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="inline-flex items-center gap-2">
                        {opt.swatch ? (
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-sm border border-foreground/20"
                            style={{ backgroundColor: opt.swatch }}
                            aria-hidden
                          />
                        ) : null}
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        return (
          <div key={field.key} className="flex flex-col gap-1.5">
            {renderLabel(field)}
            <Input
              id={`field-${field.key}`}
              type={field.kind === "number" ? "number" : "text"}
              placeholder={field.placeholder}
              value={(fieldValue as string | number | undefined) ?? ""}
              onChange={(e) => {
                const raw = e.target.value;
                if (field.kind === "number") {
                  const num = parseFloat(raw);
                  setField(field.key, raw === "" ? undefined : Number.isFinite(num) ? num : raw);
                } else {
                  setField(field.key, raw);
                }
              }}
            />
          </div>
        );
      })}

      {extras}

      <div className="mt-auto flex gap-2 pt-1">
        <Button variant="default" size="sm" disabled={selectionSize === 0} onClick={onApply}>
          {applyLabel}
        </Button>
        <Button variant="outline" size="sm" disabled={selectionSize === 0} onClick={onClear}>
          {clearLabel}
        </Button>
      </div>
    </div>
  );
}
