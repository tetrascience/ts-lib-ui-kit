import { forwardRef } from "react";
import { Input, InputProps } from "@atoms/Input";
import { Label } from "@atoms/Label";
import { SupportiveText } from "@atoms/SupportiveText";
import "./FormField.scss";

interface FormFieldProps extends Omit<InputProps, "className"> {
  label: string;
  infoText?: string;
  supportiveText?: string;
  showSupportiveCheck?: boolean;
  className?: string;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      infoText,
      supportiveText,
      showSupportiveCheck = false,
      className,
      ...inputProps
    },
    ref
  ) => {
    return (
      <div className={`form-field__container ${className || ""}`}>
        <Label className="form-field__label" infoText={infoText}>
          {label}
        </Label>
        <Input ref={ref} {...inputProps} />
        {supportiveText && (
          <SupportiveText showCheck={showSupportiveCheck}>
            {supportiveText}
          </SupportiveText>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export { FormField };
export type { FormFieldProps };
