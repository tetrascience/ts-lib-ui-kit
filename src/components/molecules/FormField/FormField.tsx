import { Input } from "@atoms/Input";
import { Label } from "@atoms/Label";
import { SupportiveText } from "@atoms/SupportiveText";
import { forwardRef } from "react";
import styled from "styled-components";

import type { InputProps } from "@atoms/Input";

export interface FormFieldProps extends Omit<InputProps, "className"> {
  label: string;
  infoText?: string;
  supportiveText?: string;
  showSupportiveCheck?: boolean;
  className?: string;
}

const FormFieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

const StyledLabel = styled(Label)`
  margin-bottom: 2px;
`;

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
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
      <FormFieldContainer className={className}>
        <StyledLabel infoText={infoText}>{label}</StyledLabel>
        <Input ref={ref} {...inputProps} />
        {supportiveText && (
          <SupportiveText showCheck={showSupportiveCheck}>
            {supportiveText}
          </SupportiveText>
        )}
      </FormFieldContainer>
    );
  }
);

FormField.displayName = "FormField";

export default FormField;
