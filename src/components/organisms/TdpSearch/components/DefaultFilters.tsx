import { Dropdown } from "@atoms/Dropdown";
import React from "react";

import type { TdpFiltersRenderProps } from "../types";

export const DefaultFilters: React.FC<TdpFiltersRenderProps> = ({ filters, filterValues, onFilterChange }) => (
  <div className="tdp-search__filters-row">
    {filters.map((filter) => (
      <div key={filter.key} className="tdp-search__filter-wrapper">
        <label className="tdp-search__filter-label">{filter.label}</label>
        <Dropdown
          options={filter.options}
          value={filterValues[filter.key] || ""}
          onChange={(value) => onFilterChange(filter.key, value)}
        />
      </div>
    ))}
  </div>
);
