import React, { ChangeEvent, forwardRef } from "react";
import styled from "styled-components";
import { Icon, IconName } from "@atoms/Icon";

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  label?: React.ReactNode;
  noPadding?: boolean;
}

const CheckboxContainer = styled.label<{
  disabled?: boolean;
  noPadding?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
  padding: ${(props) => (props.noPadding ? "0" : "12px 16px")};
  width: 100%;
`;

const HiddenCheckbox = styled.input.attrs({ type: "checkbox" })`
  position: absolute;
  opacity: 0;
  height: 0;
  width: 0;
`;

const StyledCheckbox = styled.div<{ checked?: boolean; disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: ${(props) =>
    props.checked ? "var(--blue-600)" : "var(--white-900)"};
  border: 1px solid
    ${(props) => (props.checked ? "var(--blue-600)" : "var(--grey-300)")};
  border-radius: 3px;
  transition: all 0.2s;

  ${(props) =>
    !props.disabled &&
    `
		&:hover {
			border-color: var(--blue-600);
		}
	`}
`;

const CheckIcon = () => (
  <Icon name={IconName.CHECK_SQUARE} fill="var(--blue-600)" />
);

const StyledLabel = styled.span`
  margin-left: 10px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
`;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked = false,
      onChange,
      disabled = false,
      className,
      onClick,
      label,
      noPadding = false,
    },
    ref
  ) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (!disabled && onChange) {
        onChange(e.target.checked);
      }
    };

    const handleClick = (e: React.MouseEvent) => {
      if (onClick) {
        onClick(e);
      }
    };

    return (
      <CheckboxContainer
        className={className}
        disabled={disabled}
        noPadding={noPadding}
        onClick={handleClick}
      >
        <HiddenCheckbox
          ref={ref}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
        />
        <StyledCheckbox checked={checked} disabled={disabled}>
          {checked && <CheckIcon />}
        </StyledCheckbox>
        {label && <StyledLabel>{label}</StyledLabel>}
      </CheckboxContainer>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
