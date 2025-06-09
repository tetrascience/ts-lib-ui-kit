import React from "react";
import { Icon, IconName } from "@atoms/Icon";
import "./Sidebar.scss";

interface SidebarItemProps {
  icon: IconName;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

interface SidebarProps {
  items: SidebarItemProps[];
  activeItem?: string;
  onItemClick?: (label: string) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  active,
  onClick,
}) => {
  return (
    <div
      className={`sidebar-item-container ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <div className="icon-wrapper">
        <Icon name={icon} fill="var(--white-900)" width="20" height="20" />
      </div>
      <div className="label">{label}</div>
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
    <div className="sidebar-container">
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

export { Sidebar };
export type { SidebarProps };
