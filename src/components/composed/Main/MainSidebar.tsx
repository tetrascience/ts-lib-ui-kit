import React from "react";

import type { LucideIcon } from "lucide-react";

import { AppSidebar } from "@/components/composed/Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

type MainSidebarIcon = LucideIcon;

export interface MainSidebarItem {
  icon: MainSidebarIcon;
  label: string;
}

export interface MainSidebarProps {
  items: MainSidebarItem[];
  activeItem?: string;
  onItemClick?: (label: string) => void;
}

export const MainSidebar: React.FC<MainSidebarProps> = ({
  items,
  activeItem,
  onItemClick,
}) => (
  <ScrollArea>
    <AppSidebar items={items} activeItem={activeItem} onItemClick={onItemClick} />
  </ScrollArea>
);