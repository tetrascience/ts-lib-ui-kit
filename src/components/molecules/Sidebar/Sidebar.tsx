import React from "react";
import styled from "styled-components";
import { Icon, IconName } from "@atoms/Icon";

interface SidebarItemProps {
  icon: IconName;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export interface SidebarProps {
  items: SidebarItemProps[];
  activeItem?: string;
  onItemClick?: (label: string) => void;
}

const SidebarContainer = styled.div`
  width: 104px;
  height: 100%;
  background-color: var(--blue-900);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
`;

const SidebarItemContainer = styled.div<{ $active?: boolean }>`
  width: 100%;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  cursor: pointer;
  transition: background-color 0.2s ease;
  background-color: ${(props) =>
    props.$active ? "var(--white-100)" : "transparent"};

  &:hover {
    background-color: var(--white-50);
  }
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  color: var(--white-900);
`;

const Label = styled.div`
  color: var(--white-900);
  text-align: center;
  font-family: "Inter", sans-serif;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
  text-align: center;
  padding: 0 8px;
`;

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  active,
  onClick,
}) => {
  return (
    <SidebarItemContainer $active={active} onClick={onClick}>
      <IconWrapper>
        <Icon name={icon} fill="var(--white-900)" width="20" height="20" />
      </IconWrapper>
      <Label>{label}</Label>
    </SidebarItemContainer>
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
    <SidebarContainer>
      {items.map((item) => (
        <SidebarItem
          key={item.label}
          icon={item.icon}
          label={item.label}
          active={activeItem === item.label}
          onClick={() => handleItemClick(item.label)}
        />
      ))}
    </SidebarContainer>
  );
};

export default Sidebar;
