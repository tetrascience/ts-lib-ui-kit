import React from "react";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export interface SidebarProps {
  items: SidebarItemProps[];
  activeItem?: string;
  onItemClick?: (label: string) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: SidebarIcon,
  label,
  active,
  onClick,
}) => {
  return (
    <div
      className={cn(
        "w-full inline-flex flex-col rounded items-center py-3 cursor-pointer transition-colors duration-200 ease-in-out hover:bg-primary/50",
        active ? "bg-primary" : "bg-transparent"
      )}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
            onClick?.();
        }
      }}
      onClick={onClick}
    >
      <div className="flex justify-center items-center mb-[10px]">
        <SidebarIcon size={20} />
      </div>
      <div className="text-center text-xs font-medium leading-4 px-2">
        {label}
      </div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  items,
  activeItem,
  onItemClick,
}) => {
  const handleItemClick = (label: string) => {
    if (onItemClick) {
      onItemClick(label);
    }
  };

  return (
    <div className="w-[104px] h-full flex flex-col items-center pl-2 pr-2 gap-1">
      {items.map((item) => (
        <SidebarItem
          key={item.label}
          icon={item.icon}
          label={item.label}
          active={activeItem === item.label}
          onClick={() => handleItemClick(item.label)}
        />
      ))}
    </div>
  );
};

export default Sidebar;
