import React from "react";
import styled from "styled-components";
import { Checkbox } from "@atoms/Checkbox";

export interface MenuItemProps {
  label: string;
  checked?: boolean;
  showCheckbox?: boolean;
  onClick?: () => void;
  onCheckChange?: (checked: boolean) => void;
  active?: boolean;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

const StyledMenuItem = styled.div<{ active?: boolean; showCheckbox?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  gap: 10px;
  color: ${(props) => (props.active ? "var(--blue-900)" : "var(--grey-600)")};
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  border-bottom: 1px solid var(--grey-200);
  background-color: ${(props) =>
    props.active ? "var(--grey-100)" : "var(--white-900)"};
  padding: ${(props) => (props.showCheckbox ? "0" : "12px 16px")};

  &:hover {
    background-color: ${(props) =>
      props.active ? "var(--grey-100)" : "var(--grey-50)"};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  width: 100%;
`;

export const MenuItem = ({
  label,
  checked = false,
  showCheckbox = false,
  onClick,
  onCheckChange,
  active = false,
  className,
  ref,
}: MenuItemProps) => {
  const handleClick = () => {
    console.log("MenuItem clicked!");
    if (onClick) {
      onClick();
    }
  };

  const handleCheckboxChange = (isChecked: boolean) => {
    console.log("Checkbox changed:", isChecked);
    if (onCheckChange) {
      onCheckChange(isChecked);
    }
  };

  // This stops the event from propagating to the parent (StyledMenuItem)
  const handleCheckboxClick = (e: React.MouseEvent) => {
    console.log("Checkbox clicked!");
    e.stopPropagation();
  };

  return (
    <StyledMenuItem
      ref={ref}
      active={active}
      showCheckbox={showCheckbox}
      className={className}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      {!showCheckbox && <ItemContent>{label}</ItemContent>}
      {showCheckbox && (
        <CheckboxContainer onClick={handleCheckboxClick}>
          <Checkbox
            checked={checked}
            onChange={handleCheckboxChange}
            onClick={handleCheckboxClick}
            label={label}
          />
        </CheckboxContainer>
      )}
    </StyledMenuItem>
  );
};

export default MenuItem;
