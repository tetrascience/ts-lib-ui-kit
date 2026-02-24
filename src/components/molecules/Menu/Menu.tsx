import { MenuItem } from "@atoms/MenuItem";
import React from "react";
import styled from "styled-components";

import type { MenuItemProps } from "@atoms/MenuItem";

/** Data shape for an individual item in the Menu component */
export interface MenuItemData
  extends Omit<MenuItemProps, "onClick" | "onCheckChange"> {
  id: string;
}

/** Props for the Menu component */
export interface MenuProps {
  title?: string;
  items: MenuItemData[];
  onItemClick?: (itemId: string) => void;
  onItemCheckChange?: (itemId: string, checked: boolean) => void;
  activeItemId?: string | null;
  className?: string;
}

const MenuContainer = styled.div`
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0px 4px 12px 0px var(--black-100),
    0px 2px 4px -2px var(--black-100);
  background-color: var(--white-900);
  border: 1px solid var(--grey-200);
`;

const MenuTitle = styled.div`
  padding: 8px 16px;
  font-family: "Inter", sans-serif;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
  color: var(--grey-600);
  border-bottom: 1px solid var(--grey-200);
`;

const MenuItems = styled.div`
  display: flex;
  flex-direction: column;
`;

/** A dropdown-style menu with optional title and selectable items */
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
    <MenuContainer className={className}>
      {title && <MenuTitle>{title}</MenuTitle>}
      <MenuItems>
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
      </MenuItems>
    </MenuContainer>
  );
};

export default Menu;
