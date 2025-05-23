import React, { forwardRef } from "react";
import styled, { css } from "styled-components";

export type TextareaSize = "xsmall" | "small";

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  size?: TextareaSize;
  error?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  rows?: number;
}

interface StyleProps {
  size: TextareaSize;
  rows?: number;
}

const sizeStyles = {
  xsmall: css<StyleProps>`
    min-height: ${(props) => (props.rows ? "auto" : "80px")};
    padding: 10px;
  `,
  small: css<StyleProps>`
    min-height: ${(props) => (props.rows ? "auto" : "100px")};
    padding: 12px;
  `,
};

const TextareaContainer = styled.div<{
  fullWidth?: boolean;
  disabled?: boolean;
  error?: boolean;
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  width: ${(props) => (props.fullWidth ? "100%" : "auto")};
  gap: 8px;
`;

const StyledTextarea = styled.textarea<TextareaProps & StyleProps>`
  width: 100%;
  border-radius: 6px;
  font-family: "Inter", sans-serif;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  border: 1px solid
    ${(props) =>
      props.error
        ? "var(--red-error)"
        : props.disabled
        ? "var(--grey-300)"
        : "var(--grey-300)"};
  background-color: ${(props) =>
    props.disabled ? "var(--grey-200)" : "var(--white-900)"};
  color: ${(props) =>
    props.disabled ? "var(--grey-400)" : "var(--black-900)"};
  transition: all 0.2s;
  resize: vertical;
  font-size: 14px;

  ${(props) => sizeStyles[props.size || "small"]}

  &:hover:not(:disabled):not(:focus) {
    border-color: ${(props) =>
      props.error ? "var(--red-error)" : "var(--blue-600)"};
  }

  &:focus {
    outline: none;
    box-shadow: 0px 0px 0px 1px var(--white-900),
      0px 0px 0px 3px var(--blue-600);
    border-color: ${(props) =>
      props.error ? "var(--red-error)" : "var(--blue-600)"};
  }

  &:active {
    outline: none;
    box-shadow: 0px 0px 0px 2px var(--blue-200);
    border-color: ${(props) =>
      props.error ? "var(--red-error)" : "var(--blue-600)"};
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

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = "small",
      error = false,
      disabled = false,
      fullWidth = false,
      rows,
      ...rest
    },
    ref
  ) => {
    return (
      <TextareaContainer
        fullWidth={fullWidth}
        disabled={disabled}
        error={error}
      >
        <StyledTextarea
          ref={ref}
          size={size}
          error={error}
          disabled={disabled}
          rows={rows}
          {...rest}
        />
      </TextareaContainer>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
