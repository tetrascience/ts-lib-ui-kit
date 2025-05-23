import React from "react";
import styled from "styled-components";

export interface ButtonControlProps {
  icon?: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const ButtonContainer = styled.button<{
  selected?: boolean;
  disabled?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: ${(props) =>
    props.selected ? "var(--grey-100)" : "var(--white-900)"};
  border: none;
  border-radius: 0;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  outline: none;
  transition: all 0.2s ease;
  padding: 0;

  &:hover:not(:disabled) {
    background-color: var(--grey-100);
  }

  &:active:not(:disabled) {
    background-color: var(--grey-100);
    outline: none;
  }

  &:focus,
  &:focus-visible {
    outline-color: var(--blue-600) !important;
  }

  &:disabled {
    opacity: 0.5;
    background-color: var(--grey-50);
    border-color: var(--grey-200);
  }

  svg {
    width: 20px;
    height: 20px;
    color: ${(props) =>
      props.disabled ? "var(--grey-400)" : "var(--blue-900)"};
  }
`;

export const ButtonControl: React.FC<ButtonControlProps> = ({
  icon,
  selected = false,
  disabled = false,
  onClick,
}) => {
  return (
    <ButtonContainer
      selected={selected}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
    >
      {icon}
    </ButtonContainer>
  );
};

export default ButtonControl;
