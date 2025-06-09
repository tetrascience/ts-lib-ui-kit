import React, { forwardRef } from "react";
import "./Input.scss";

type InputSize = "xsmall" | "small";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: InputSize;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  error?: boolean;
  disabled?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = "small",
      iconLeft,
      iconRight,
      error = false,
      disabled = false,
      className,
      ...rest
    },
    ref
  ) => {
    const containerClassName = ["input-container", disabled && "disabled"]
      .filter(Boolean)
      .join(" ");

    const inputClassName = [
      "input-field",
      `size-${size}`,
      error && "error",
      iconLeft && "has-icon-left",
      iconRight && "has-icon-right",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const iconWrapperClassName = (position: "left" | "right") =>
      ["icon-wrapper", `position-${position}`, `size-${size}`].join(" ");

    return (
      <div className={containerClassName}>
        {iconLeft && (
          <div className={iconWrapperClassName("left")}>{iconLeft}</div>
        )}
        <input
          ref={ref}
          className={inputClassName}
          disabled={disabled}
          {...rest}
        />
        {iconRight && (
          <div className={iconWrapperClassName("right")}>{iconRight}</div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps, InputSize };
