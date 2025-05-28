import React from "react";
import { MenuItem, MenuItemProps } from "@atoms/MenuItem";
import "./Menu.less";

export interface MenuItemData
  extends Omit<MenuItemProps, "onClick" | "onCheckChange"> {
  id: string;
}

export interface MenuProps {
  title?: string;
  items: MenuItemData[];
  onItemClick?: (itemId: string) => void;
  onItemCheckChange?: (itemId: string, checked: boolean) => void;
  activeItemId?: string | null;
  className?: string;
}

export const Menu: React.FC<MenuProps> = ({
  title,
  items,
  onItemClick,
  onItemCheckChange,
  activeItemId = null,
  className,
}) => {
  const handleItemClick = (itemId: string) => {
    if (onItemClick) {
      onItemClick(itemId);
    }
  };

  const handleItemCheckChange = (itemId: string, checked: boolean) => {
    if (onItemCheckChange) {
      onItemCheckChange(itemId, checked);
    }
  };

  return (
    <div className={`menu-container ${className || ''}`}>
      {title && <div className="menu-title">{title}</div>}
      <div className="menu-items">
        {items.map((item) => (
          <MenuItem
            key={item.id}
            label={item.label}
            checked={item.checked}
            showCheckbox={item.showCheckbox}
            active={activeItemId === item.id || item.active}
            onClick={() => handleItemClick(item.id)}
            onCheckChange={(checked) => handleItemCheckChange(item.id, checked)}
          />
        ))}
      </div>
    </div>
  );
};

export default Menu;
