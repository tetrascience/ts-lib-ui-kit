import React from "react";
import styled, { css } from "styled-components";

export type InputSize = "xsmall" | "small";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: InputSize;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  error?: boolean;
  disabled?: boolean;
  ref?: React.Ref<HTMLInputElement>;
}

interface StyleProps {
  $hasIconLeft?: boolean;
  $hasIconRight?: boolean;
  size: InputSize;
}

const sizeStyles = {
  xsmall: css<StyleProps>`
    height: 32px;
    padding: ${(props) =>
      props.$hasIconLeft && props.$hasIconRight
        ? "0 32px 0 32px"
        : props.$hasIconLeft
        ? "0 10px 0 32px"
        : props.$hasIconRight
        ? "0 32px 0 10px"
        : "0 10px"};
  `,
  small: css<StyleProps>`
    height: 36px;
    padding: ${(props) =>
      props.$hasIconLeft && props.$hasIconRight
        ? "0 38px 0 38px"
        : props.$hasIconLeft
        ? "0 12px 0 38px"
        : props.$hasIconRight
        ? "0 38px 0 12px"
        : "0 12px"};
  `,
};

const InputContainer = styled.div<{
  size: InputSize;
  disabled?: boolean;
  $error?: boolean;
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
  gap: 8px;
`;

interface StyledInputProps extends StyleProps {
  $error?: boolean;
}

const StyledInput = styled.input<StyledInputProps>`
  width: 100%;
  border-radius: 6px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  border: 1px solid
    ${(props) =>
      props.$error
        ? "var(--red-error)"
        : props.disabled
        ? "var(--grey-300)"
        : "var(--grey-300)"};
  background-color: ${(props) =>
    props.disabled ? "var(--grey-200)" : "var(--white-900)"};
  color: ${(props) =>
    props.disabled ? "var(--grey-400)" : "var(--black-900)"};
  transition: all 0.2s;

  ${(props) => sizeStyles[props.size || "small"]}

  &:hover:not(:disabled):not(:focus) {
    border-color: ${(props) =>
      props.$error ? "var(--red-error)" : "var(--blue-600)"};
  }

  &:focus {
    outline: none;
    box-shadow: 0px 0px 0px 1px var(--white-900),
      0px 0px 0px 3px var(--blue-600);
    border-color: ${(props) =>
      props.$error ? "var(--red-error)" : "var(--blue-600)"};
  }

  &:active {
    outline: none;
    box-shadow: 0px 0px 0px 2px var(--blue-200);
    border-color: ${(props) =>
      props.$error ? "var(--red-error)" : "var(--blue-600)"};
  }

  &:disabled {
    cursor: not-allowed;
    user-select: none;
    pointer-events: none;
  }

  &::placeholder {
    color: var(--grey-400);
  }
`;

const IconWrapper = styled.div<{ position: "left" | "right"; size: InputSize }>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  color: var(--grey-400);
  ${(props) => (props.position === "left" ? "left: 10px;" : "right: 10px;")}
  ${(props) =>
    props.size === "xsmall"
      ? "width: 16px; height: 16px;"
      : "width: 20px; height: 20px;"}
`;

export const Input = ({
  size = "small",
  iconLeft,
  iconRight,
  error = false,
  disabled = false,
  ref,
  ...rest
}: InputProps) => {
  return (
    <InputContainer size={size} disabled={disabled} $error={error}>
      {iconLeft && (
        <IconWrapper position="left" size={size}>
          {iconLeft}
        </IconWrapper>
      )}
      <StyledInput
        ref={ref}
        size={size}
        $hasIconLeft={!!iconLeft}
        $hasIconRight={!!iconRight}
        $error={error}
        disabled={disabled}
        {...rest}
      />
      {iconRight && (
        <IconWrapper position="right" size={size}>
          {iconRight}
        </IconWrapper>
      )}
    </InputContainer>
  );
};

export default Input;
