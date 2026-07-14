import { ListFilterIcon, PlusIcon, XIcon } from "lucide-react";

import type { FilterColumnConfig, FilterCondition, FilterOperator } from "@/components/ui/data-table/data-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const OPERATOR_LABELS: Record<FilterOperator, string> = {
  contains: "contains",
  equals: "equals",
  not_equals: "not equals",
  starts_with: "starts with",
  ends_with: "ends with",
  is_empty: "is empty",
  is_not_empty: "is not empty",
};

const VALUE_FREE_OPERATORS: FilterOperator[] = ["is_empty", "is_not_empty"];

const DEFAULT_OPERATORS: FilterOperator[] = [
  "contains",
  "equals",
  "not_equals",
  "starts_with",
  "ends_with",
  "is_empty",
  "is_not_empty",
];

function makeCondition(columnId: string, allowedOperators?: FilterOperator[]): FilterCondition {
  const operator = allowedOperators?.[0] ?? "contains";
  return { id: crypto.randomUUID(), columnId, operator, value: "" };
}

export interface ManifestFilterPopoverProps {
  /** Filterable columns. Operator subsets can be specified per column. */
  columns: FilterColumnConfig[];
  /** Column id → display label resolver. */
  columnLabel?: (columnId: string) => string;
  filters: FilterCondition[];
  onFiltersChange: (next: FilterCondition[]) => void;
  triggerLabel?: string;
  className?: string;
}

export function ManifestFilterPopover({
  columns,
  columnLabel,
  filters,
  onFiltersChange,
  triggerLabel = "Filter",
  className,
}: ManifestFilterPopoverProps) {
  const labelFor = (columnId: string): string => columnLabel?.(columnId) ?? columnId;
  const firstColumn = columns[0];
  const firstColumnId = firstColumn?.columnId ?? "";

  const addFilter = () => onFiltersChange([...filters, makeCondition(firstColumnId, firstColumn?.operators)]);
  const removeFilter = (id: string) => onFiltersChange(filters.filter((cond) => cond.id !== id));
  const updateFilter = (id: string, patch: Partial<FilterCondition>) =>
    onFiltersChange(filters.map((cond) => (cond.id === id ? { ...cond, ...patch } : cond)));
  const clearAll = () => onFiltersChange([]);

  const activeCount = filters.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-slot="manifest-filter"
          className={cn(className)}
          aria-label={activeCount > 0 ? `${triggerLabel} (${activeCount} active)` : triggerLabel}
        >
          <ListFilterIcon className="size-3.5" />
          {triggerLabel}
          {activeCount > 0 ? (
            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {activeCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="min-w-80" aria-label="Filter conditions">
          <div className="flex flex-col gap-2">
            {filters.map((condition) => {
              const colConfig = columns.find((c) => c.columnId === condition.columnId);
              const operators = colConfig?.operators ?? DEFAULT_OPERATORS;
              const isValueFree = VALUE_FREE_OPERATORS.includes(condition.operator);
              return (
                <div key={condition.id} className="flex items-center gap-2">
                  <Select
                    value={condition.columnId}
                    onValueChange={(value) => {
                      const nextConfig = columns.find((c) => c.columnId === value);
                      const nextOperators = nextConfig?.operators ?? DEFAULT_OPERATORS;
                      const nextOperator = nextOperators.includes(condition.operator)
                        ? condition.operator
                        : (nextOperators[0] ?? "contains");
                      updateFilter(condition.id, { columnId: value, operator: nextOperator, value: "" });
                    }}
                  >
                    <SelectTrigger aria-label="Filter column" size="sm" className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((c) => (
                        <SelectItem key={c.columnId} value={c.columnId}>
                          {c.label ?? labelFor(c.columnId)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={condition.operator}
                    onValueChange={(value) =>
                      updateFilter(condition.id, { operator: value as FilterOperator, value: "" })
                    }
                  >
                    <SelectTrigger aria-label="Filter operator" size="sm" className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((op) => (
                        <SelectItem key={op} value={op}>
                          {OPERATOR_LABELS[op]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {isValueFree ? (
                    <div className="h-8 w-40" aria-hidden />
                  ) : (
                    <Input
                      className="w-40"
                      placeholder="Value…"
                      value={condition.value}
                      onChange={(event) => updateFilter(condition.id, { value: event.target.value })}
                    />
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => removeFilter(condition.id)}
                    aria-label="Remove filter"
                  >
                    <XIcon className="size-3.5" />
                  </Button>
                </div>
              );
            })}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFilter}
                disabled={columns.length === 0}
              >
                <PlusIcon className="size-3.5" />
                Add filter
              </Button>
              {filters.length > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={clearAll}
                >
                  Clear all
                </Button>
              ) : null}
            </div>
          </div>
      </PopoverContent>
    </Popover>
  );
}
