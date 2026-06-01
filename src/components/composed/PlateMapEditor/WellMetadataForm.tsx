import * as React from "react";

import type { WellField, WellRecord, WellSelectOption } from "./types";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

function MultiSelectControl({
  id,
  value,
  options,
  placeholder,
  onChange,
}: {
  id: string;
  value: string[];
  options: WellSelectOption[];
  placeholder?: string;
  onChange: (next: string[]) => void;
}) {
  const anchorRef = useComboboxAnchor();
  const labelByValue = React.useMemo(() => {
    const m = new Map<string, string>();
    options.forEach((o) => m.set(o.value, o.label));
    return m;
  }, [options]);

  return (
    <Combobox multiple items={options.map((o) => o.value)} value={value} onValueChange={onChange}>
      <ComboboxChips ref={anchorRef} className="min-h-9 w-full">
        <ComboboxValue>
          {(items: string[]) =>
            items.map((item) => <ComboboxChip key={item}>{labelByValue.get(item) ?? item}</ComboboxChip>)
          }
        </ComboboxValue>
        <ComboboxChipsInput id={id} placeholder={placeholder ?? "Select…"} />
      </ComboboxChips>
      <ComboboxContent anchor={anchorRef}>
        <ComboboxEmpty>No options.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              <span className="inline-flex items-center gap-2">
                {(() => {
                  const opt = options.find((o) => o.value === item);
                  return opt?.swatch ? (
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-sm border border-foreground/20"
                      style={{ backgroundColor: opt.swatch }}
                      aria-hidden
                    />
                  ) : null;
                })()}
                {labelByValue.get(item) ?? item}
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

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

const INPUT_TYPE_BY_KIND: Record<string, string> = {
  number: "number",
  integer: "number",
  date: "date",
  datetime: "datetime-local",
  time: "time",
};

function resolveInputType(kind: string): string {
  return INPUT_TYPE_BY_KIND[kind] ?? "text";
}

function parseInputValue(kind: string, raw: string): unknown {
  if (raw === "") return undefined;
  if (kind === "number") {
    const num = parseFloat(raw);
    return Number.isFinite(num) ? num : raw;
  }
  if (kind === "integer") {
    const num = parseInt(raw, 10);
    return Number.isFinite(num) ? num : raw;
  }
  return raw;
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

  const renderCustom = (field: WellField<T>, fieldValue: unknown) => (
    <div key={field.key} className="flex flex-col gap-1.5">
      {renderLabel(field)}
      {field.render!({
        value: fieldValue,
        onChange: (next) => setField(field.key, next),
        selectionSize,
      })}
    </div>
  );

  const renderSelect = (field: WellField<T>, fieldValue: unknown) => (
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

  const renderMultiSelect = (field: WellField<T>, fieldValue: unknown) => {
    const current = Array.isArray(fieldValue) ? (fieldValue as string[]) : [];
    return (
      <div key={field.key} className="flex flex-col gap-1.5">
        {renderLabel(field)}
        <MultiSelectControl
          id={`field-${field.key}`}
          value={current}
          options={field.options ?? []}
          placeholder={field.placeholder}
          onChange={(next) => setField(field.key, next.length === 0 ? undefined : next)}
        />
      </div>
    );
  };

  const renderBoolean = (field: WellField<T>, fieldValue: unknown) => {
    const checked = !!fieldValue;
    if (field.boolStyle === "switch") {
      return (
        <div key={field.key} className="flex items-center justify-between gap-2">
          {renderLabel(field)}
          <Switch
            id={`field-${field.key}`}
            checked={checked}
            onCheckedChange={(c) => setField(field.key, c)}
          />
        </div>
      );
    }
    return (
      <div key={field.key} className="flex items-center gap-2">
        <Checkbox
          id={`field-${field.key}`}
          checked={checked}
          onCheckedChange={(c) => setField(field.key, c === true)}
        />
        {renderLabel(field)}
      </div>
    );
  };

  const renderInput = (field: WellField<T>, fieldValue: unknown) => (
    <div key={field.key} className="flex flex-col gap-1.5">
      {renderLabel(field)}
      <Input
        id={`field-${field.key}`}
        type={resolveInputType(field.kind)}
        step={field.kind === "integer" ? 1 : undefined}
        placeholder={field.placeholder}
        value={(fieldValue as string | number | undefined) ?? ""}
        onChange={(e) => setField(field.key, parseInputValue(field.kind, e.target.value))}
      />
    </div>
  );

  const renderField = (field: WellField<T>) => {
    const fieldValue = value[field.key];
    if (field.render) return renderCustom(field, fieldValue);
    if (field.kind === "select") return renderSelect(field, fieldValue);
    if (field.kind === "multiselect") return renderMultiSelect(field, fieldValue);
    if (field.kind === "boolean") return renderBoolean(field, fieldValue);
    return renderInput(field, fieldValue);
  };

  return (
    <div data-slot="well-metadata-form" className={cn("flex flex-col gap-3", className)}>
      <div className="text-sm font-medium">
        {selectionSize > 0 ? `Apply to ${selectionSize} well${selectionSize === 1 ? "" : "s"}` : "Select wells to edit"}
      </div>

      {fields.map(renderField)}

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
