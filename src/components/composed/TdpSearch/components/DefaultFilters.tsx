import React from "react";

import type { TdpFiltersRenderProps } from "../types";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMPTY_OPTION_SENTINEL_PREFIX = "__tdp-search-empty__";

const getEmptyOptionValue = (filterKey: string) => `${EMPTY_OPTION_SENTINEL_PREFIX}:${filterKey}`;

export const DefaultFilters: React.FC<TdpFiltersRenderProps> = ({ filters, filterValues, onFilterChange }) => (
  <div className="tdp-search__filters-row">
    {filters.map((filter) => {
      const emptyOptionValue = getEmptyOptionValue(filter.key);
      const hasEmptyOption = filter.options.some((option) => option.value === "");
      const selectedValue = filterValues[filter.key] ?? "";
      const hasSelectedOption = filter.options.some((option) => option.value === selectedValue);
      const selectValue =
        selectedValue === ""
          ? hasEmptyOption
            ? emptyOptionValue
            : undefined
          : hasSelectedOption
            ? selectedValue
            : undefined;

      return (
        <div key={filter.key} className="tdp-search__filter-wrapper">
          <label className="tdp-search__filter-label">{filter.label}</label>
          <Select
            value={selectValue}
            onValueChange={(value) => onFilterChange(filter.key, value === emptyOptionValue ? "" : value)}
          >
            <SelectTrigger className="h-[38px] w-full justify-between rounded-md">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((option) => (
                <SelectItem
                  key={`${filter.key}-${option.value || emptyOptionValue}`}
                  value={option.value === "" ? emptyOptionValue : option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    })}
  </div>
);
