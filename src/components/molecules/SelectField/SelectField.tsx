import { forwardRef } from "react";
import { Dropdown, DropdownProps } from "@atoms/Dropdown";
import { Label } from "@atoms/Label";
import { SupportiveText } from "@atoms/SupportiveText";
import "./SelectField.scss";

interface SelectFieldProps extends Omit<DropdownProps, "className"> {
  label: string;
  infoText?: string;
  supportiveText?: string;
  showSupportiveCheck?: boolean;
  className?: string;
}

const SelectField = forwardRef<HTMLDivElement, SelectFieldProps>(
  (
    {
      label,
      infoText,
      supportiveText,
      showSupportiveCheck = false,
      className,
      ...dropdownProps
    },
    ref
  ) => {
    return (
      <div className={`select-field__container ${className || ""}`} ref={ref}>
        <Label className="select-field__label" infoText={infoText}>
          {label}
        </Label>
        <Dropdown {...dropdownProps} />
        {supportiveText && (
          <SupportiveText showCheck={showSupportiveCheck}>
            {supportiveText}
          </SupportiveText>
        )}
      </div>
    );
  }
);

SelectField.displayName = "SelectField";

export { SelectField };
export type { SelectFieldProps };
