import React from "react";
import styled from "styled-components";
import { ButtonControl, ButtonControlProps } from "@atoms/ButtonControl";

export interface ButtonControlItem extends ButtonControlProps {
  id: string;
}

export interface ButtonControlGroupProps {
  controls: ButtonControlItem[];
  selectedId?: string;
  onChange?: (id: string) => void;
  vertical?: boolean;
  disabled?: boolean;
}

const GroupContainer = styled.div<{ vertical?: boolean }>`
  display: flex;
  flex-direction: ${(props) => (props.vertical ? "column" : "row")};
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--grey-200);

  & > *:not(:last-child) {
    ${(props) =>
      props.vertical
        ? "border-bottom: 1px solid var(--grey-200);"
        : "border-right: 1px solid var(--grey-200);"}
  }

  ${(props) =>
    props.vertical &&
    `
    width: 40px;
  `}
`;

const ButtonWrapper = styled.div<{ vertical?: boolean }>`
  &:first-child {
    button {
      ${(props) =>
        props.vertical
          ? "border-top-right-radius: 6px;border-top-left-radius: 6px;"
          : "border-top-left-radius: 6px;border-bottom-left-radius: 6px;"}
    }
  }

  &:last-child {
    button {
      ${(props) =>
        props.vertical
          ? "border-bottom-right-radius: 6px;border-bottom-left-radius: 6px;"
          : "border-top-right-radius: 6px;border-bottom-right-radius: 6px;"}
    }
  }
`;

export const ButtonControlGroup: React.FC<ButtonControlGroupProps> = ({
  controls,
  selectedId,
  onChange,
  vertical = true,
  disabled = false,
}) => {
  const handleClick = (id: string) => {
    if (disabled) return;
    onChange?.(id);
  };

  return (
    <GroupContainer vertical={vertical}>
      {controls.map((control) => (
        <ButtonWrapper key={control.id} vertical={vertical}>
          <ButtonControl
            icon={control.icon}
            selected={selectedId === control.id}
            disabled={disabled || control.disabled}
            onClick={() => handleClick(control.id)}
          />
        </ButtonWrapper>
      ))}
    </GroupContainer>
  );
};

export default ButtonControlGroup;
