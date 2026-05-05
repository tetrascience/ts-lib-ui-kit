import { Search, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

export interface FilterBarValue {
  search: string;
  filters: Record<string, string>;
}

export interface FilterBarProps extends Omit<React.ComponentProps<"div">, "onChange"> {
  filters?: FilterConfig[];
  value: FilterBarValue;
  onChange: (value: FilterBarValue) => void;
  placeholder?: string;
}

function FilterBar({
  filters = [],
  value,
  onChange,
  placeholder = "Search...",
  className,
  ...props
}: FilterBarProps) {
  const activeFilters = Object.entries(value.filters).filter(([, v]) => Boolean(v));

  const handleSearch = (search: string) => {
    onChange({ ...value, search });
  };

  const handleFilterChange = (key: string, filterValue: string) => {
    onChange({
      ...value,
      filters: { ...value.filters, [key]: filterValue },
    });
  };

  const removeFilter = (key: string) => {
    const next = { ...value.filters };
    delete next[key];
    onChange({ ...value, filters: next });
  };

  const clearAll = () => {
    onChange({ search: "", filters: {} });
  };

  return (
    <div
      data-slot="filter-bar"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-40 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={value.search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={placeholder}
            className="pl-9"
          />
        </div>
        {filters.map((filter) => (
          <Select
            key={filter.key}
            value={value.filters[filter.key] || undefined}
            onValueChange={(v) => handleFilterChange(filter.key, v)}
          >
            <SelectTrigger className="w-auto min-w-32">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        {activeFilters.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Clear all
          </Button>
        )}
      </div>
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activeFilters.map(([key, filterValue]) => {
            const config = filters.find((f) => f.key === key);
            const label = config?.options.find((o) => o.value === filterValue)?.label ?? filterValue;
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                {config?.label}: {label}
                <button
                  type="button"
                  aria-label={`Remove ${config?.label ?? key} filter`}
                  className="ml-0.5 rounded-full hover:text-foreground transition-colors"
                  onClick={() => removeFilter(key)}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { FilterBar };
