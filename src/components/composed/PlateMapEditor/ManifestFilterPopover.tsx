import { Popover } from "@base-ui/react";
import { Filter, Plus, Trash2, X } from "lucide-react";

import {
  EMPTY_FILTER_STATE,
  OPERATOR_LABELS,
  defaultOperatorFor,
  makeFilterCondition,
  operatorsForType,
  valueInputRequired,
} from "./manifestFilter";

import type { FilterColumn, FilterCondition, FilterOperator, FilterState } from "./manifestFilter";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface ManifestFilterPopoverProps {
  columns: FilterColumn[];
  state: FilterState;
  onStateChange: (next: FilterState) => void;
  triggerLabel?: string;
  className?: string;
}

function updateCondition(
  state: FilterState,
  id: string,
  patch: Partial<FilterCondition>,
): FilterState {
  return {
    ...state,
    conditions: state.conditions.map((cond) => (cond.id === id ? { ...cond, ...patch } : cond)),
  };
}

function removeCondition(state: FilterState, id: string): FilterState {
  return { ...state, conditions: state.conditions.filter((cond) => cond.id !== id) };
}

function addCondition(state: FilterState, columns: FilterColumn[]): FilterState {
  const first = columns[0];
  if (!first) return state;
  return {
    ...state,
    conditions: [...state.conditions, makeFilterCondition(first.field, first.type ?? "string")],
  };
}

export function ManifestFilterPopover({
  columns,
  state,
  onStateChange,
  triggerLabel = "Filter",
  className,
}: ManifestFilterPopoverProps) {
  const activeCount = state.conditions.length;
  const hasConditions = activeCount > 0;

  return (
    <Popover.Root>
      <Popover.Trigger
        render={
          <Button type="button" variant="outline" size="sm" className={cn("h-7", className)}>
            <Filter aria-hidden />
            <span>{triggerLabel}</span>
            {activeCount > 0 ? (
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-[0.65rem]">
                {activeCount}
              </Badge>
            ) : null}
          </Button>
        }
      />
      <Popover.Portal>
        <Popover.Positioner align="start" sideOffset={4}>
          <Popover.Popup className="z-50 w-[480px] rounded-md border bg-popover p-3 text-popover-foreground shadow-md outline-none">
            {hasConditions ? null : (
              <p className="px-1 pb-2 text-xs text-muted-foreground">
                No filters applied. Click &quot;Add condition&quot; to begin.
              </p>
            )}

            {hasConditions ? (
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>Show records where</span>
                {state.conditions.length > 1 ? (
                  <Select
                    value={state.conjunction}
                    onValueChange={(v) => onStateChange({ ...state, conjunction: v as "and" | "or" })}
                  >
                    <SelectTrigger size="sm" className="h-7 w-[72px]" aria-label="Conjunction">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="and">And</SelectItem>
                      <SelectItem value="or">Or</SelectItem>
                    </SelectContent>
                  </Select>
                ) : null}
                <span>conditions match.</span>
              </div>
            ) : null}

            <div className="flex flex-col gap-1.5">
              {state.conditions.map((cond, idx) => {
                const colDef = columns.find((c) => c.field === cond.field) ?? columns[0];
                const colType = colDef?.type ?? "string";
                const ops = operatorsForType(colType);
                const needsValue = valueInputRequired(cond.operator);

                return (
                  <div key={cond.id} className="flex items-center gap-1.5">
                    <span className="w-12 shrink-0 text-right text-xs text-muted-foreground">
                      {idx === 0 ? "Where" : state.conjunction === "or" ? "Or" : "And"}
                    </span>
                    <Select
                      value={cond.field}
                      onValueChange={(field) => {
                        const next = columns.find((c) => c.field === field) ?? columns[0];
                        const nextType = next?.type ?? "string";
                        onStateChange(
                          updateCondition(state, cond.id, {
                            field,
                            operator: defaultOperatorFor(nextType),
                            value: "",
                          }),
                        );
                      }}
                    >
                      <SelectTrigger size="sm" className="h-7 w-[140px]" aria-label="Field">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map((c) => (
                          <SelectItem key={c.field} value={c.field}>
                            {c.headerName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={cond.operator}
                      onValueChange={(op) =>
                        onStateChange(updateCondition(state, cond.id, { operator: op as FilterOperator }))
                      }
                    >
                      <SelectTrigger size="sm" className="h-7 w-[140px]" aria-label="Operator">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ops.map((op) => (
                          <SelectItem key={op} value={op}>
                            {OPERATOR_LABELS[op]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {needsValue ? (
                      <Input
                        className="h-7 flex-1"
                        type={colType === "number" ? "number" : "text"}
                        placeholder="Value"
                        value={cond.value}
                        onChange={(e) => onStateChange(updateCondition(state, cond.id, { value: e.target.value }))}
                      />
                    ) : (
                      <span className="flex-1" />
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Remove condition"
                      onClick={() => onStateChange(removeCondition(state, cond.id))}
                    >
                      <X aria-hidden />
                    </Button>
                  </div>
                );
              })}
            </div>

            <div
              className={cn(
                "mt-2 flex items-center gap-2 pt-2 text-xs",
                hasConditions ? "border-t" : "",
              )}
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7"
                onClick={() => onStateChange(addCondition(state, columns))}
                disabled={columns.length === 0}
              >
                <Plus aria-hidden />
                Add condition
              </Button>
              {hasConditions ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-7 text-destructive hover:text-destructive"
                  onClick={() => onStateChange(EMPTY_FILTER_STATE)}
                >
                  <Trash2 aria-hidden />
                  Clear all
                </Button>
              ) : null}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
