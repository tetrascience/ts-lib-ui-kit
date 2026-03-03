import { Search } from "lucide-react";
import React from "react";

import type { TdpSearchBarRenderProps } from "../types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


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
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-muted-foreground">
            <Search />
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pl-9"
          />
        </div>
      </div>
      <Button variant="default" onClick={onSearch} disabled={!query.trim() || isLoading}>
        {isLoading ? "Searching..." : "Search"}
      </Button>
    </div>
  );
};
