import React, { ChangeEvent, forwardRef } from "react";
import { Icon, IconName } from "@atoms/Icon";
import "./Checkbox.scss";

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  label?: React.ReactNode;
  noPadding?: boolean;
}

const CheckIcon = () => (
  <Icon name={IconName.CHECK_SQUARE} fill="var(--blue-600)" />
);

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
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

    const checkboxClasses = [
      "checkbox",
      disabled && "checkbox--disabled",
      noPadding && "checkbox--no-padding",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const boxClasses = ["checkbox__box", checked && "checkbox__box--checked"]
      .filter(Boolean)
      .join(" ");

    return (
      <label className={checkboxClasses} onClick={handleClick}>
        <input
          ref={ref}
          className="checkbox__input"
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
        />
        <div className={boxClasses}>{checked && <CheckIcon />}</div>
        {label && <span className="checkbox__label">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
export type { CheckboxProps };
