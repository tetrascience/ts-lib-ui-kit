import Search from "@assets/icon/Search";
import { Button } from "@atoms/Button";
import { Input } from "@atoms/Input";
import React from "react";

import type { TdpSearchBarRenderProps } from "../types";

export const DefaultSearchBar: React.FC<TdpSearchBarRenderProps> = ({
  query,
  setQuery,
  onSearch,
  isLoading,
  placeholder,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="tdp-search__search-bar">
      <div className="tdp-search__search-input-wrapper">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          iconLeft={<Search />}
          size="small"
        />
      </div>
      <Button variant="primary" onClick={onSearch} disabled={!query.trim() || isLoading}>
        {isLoading ? "Searching..." : "Search"}
      </Button>
    </div>
  );
};
