import React, { forwardRef } from "react";
import "./Textarea.scss";

type TextareaSize = "xsmall" | "small";

interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  size?: TextareaSize;
  error?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  rows?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = "small",
      error = false,
      disabled = false,
      fullWidth = false,
      rows,
      className = "",
      ...rest
    },
    ref
  ) => {
    const containerClassNames = [
      "textarea-container",
      fullWidth && "textarea-container--full-width",
    ]
      .filter(Boolean)
      .join(" ");

    const textareaClassNames = [
      "textarea",
      `textarea--${size}`,
      error && "textarea--error",
      disabled && "textarea--disabled",
      rows && "textarea--with-rows",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={containerClassNames}>
        <textarea
          ref={ref}
          className={textareaClassNames}
          disabled={disabled}
          rows={rows}
          {...rest}
        />
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
export type { TextareaProps, TextareaSize };
