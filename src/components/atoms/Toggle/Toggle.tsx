import React, { useState } from "react";
import styled from "styled-components";

/** Props for the Toggle component */
export interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

const ToggleContainer = styled.div<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
`;

const ToggleSwitch = styled.div<{ checked: boolean; disabled?: boolean }>`
  position: relative;
  width: 32px;
  height: 20px;
  background-color: ${({ checked }) =>
    checked ? "var(--blue-600)" : "var(--grey-500)"};
  border-radius: 100px;
  border: 2px solid var(--black-200);
  transition: all 0.2s ease;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  box-sizing: border-box;
`;

const ToggleKnob = styled.div<{ checked: boolean }>`
  position: absolute;
  top: 0px;
  left: ${({ checked }) => (checked ? "12px" : "0px")};
  width: 16px;
  height: 16px;
  background-color: var(--white-900);
  border-radius: 50%;
  box-shadow: 0 1px 3px var(--black-300);
  transition: all 0.2s ease;
`;

const LabelText = styled.span`
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
  user-select: none;
  pointer-events: none;
  color: var(--grey-500);
`;

/** A toggle switch with optional label and disabled state */
export const Toggle: React.FC<ToggleProps> = ({
  checked = false,
  onChange,
  disabled = false,
  label,
  className,
}) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleToggle = () => {
    if (disabled) return;

    const newState = !isChecked;
    setIsChecked(newState);
    onChange?.(newState);
  };

  return (
    <ToggleContainer
      disabled={disabled}
      className={className}
      onClick={handleToggle}
    >
      <ToggleSwitch checked={isChecked} disabled={disabled}>
        <ToggleKnob checked={isChecked} />
      </ToggleSwitch>
      {label && <LabelText>{label}</LabelText>}
    </ToggleContainer>
  );
};

export default Toggle;
