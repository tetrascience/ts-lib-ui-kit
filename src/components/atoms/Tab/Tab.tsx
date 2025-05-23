import React from "react";
import styled, { css } from "styled-components";

export type TabSize = "small" | "medium";

export interface TabProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  size?: TabSize;
  onClick?: () => void;
}

const sizeStyles = {
  small: css`
    font-family: "Inter", sans-serif;
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: 20px;
  `,
  medium: css`
    font-family: "Inter", sans-serif;
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: 24px;
  `,
};

const TabContainer = styled.button<{
  active?: boolean;
  disabled?: boolean;
  size: TabSize;
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  background: transparent;
  border: none;
  outline: none;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  ${(props) => sizeStyles[props.size]}
  color: ${(props) => {
    if (props.disabled) return "var(--grey-400)";
    return props.active ? "var(--blue-900)" : "var(--grey-500)";
  }};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    color: var(--blue-900);
  }

  &:after {
    content: "";
    position: absolute;
    width: 100%;
    height: 3px;
    background-color: ${(props) =>
      props.disabled ? "var(--grey-400)" : "var(--blue-900)"};
    bottom: 0;
    left: 0;
    opacity: ${(props) => (props.active ? 1 : 0)};
    transition: opacity 0.2s ease;
  }

  &:focus {
    outline: none;
    box-shadow: none;
  }
`;

export const Tab: React.FC<TabProps> = ({
  label,
  active = false,
  disabled = false,
  size = "medium",
  onClick,
}) => {
  return (
    <TabContainer
      active={active}
      disabled={disabled}
      size={size}
      onClick={onClick}
    >
      {label}
    </TabContainer>
  );
};

export default Tab;
