import React from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface MainTabItem {
  id: string;
  label: string;
}

export interface MainTabBarProps {
  tabs: MainTabItem[];
  value: string;
  onChange: (tabId: string) => void;
}

export const MainTabBar: React.FC<MainTabBarProps> = ({ tabs, value, onChange }) => (
  <Tabs className="gap-0" value={value} onValueChange={onChange}>
    <TabsList variant="line" className="w-full justify-start gap-6 p-0">
      {tabs.map((tab) => (
        <TabsTrigger className="flex-none pb-3 px-0 pt-0" key={tab.id} value={tab.id}>
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
);
