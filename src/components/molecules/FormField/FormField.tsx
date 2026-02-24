import { Input } from "@atoms/Input";
import { Label } from "@atoms/Label";
import { SupportiveText } from "@atoms/SupportiveText";
import React from "react";
import styled from "styled-components";

import type { InputProps } from "@atoms/Input";

/** Props for the FormField component */
export interface FormFieldProps extends Omit<InputProps, "className"> {
  /** Label text displayed above the input */
  label: string;
  /** Informational tooltip text displayed next to the label */
  infoText?: string;
  /** Helper text displayed below the input */
  supportiveText?: string;
  /** Whether to show a check icon alongside the supportive text */
  showSupportiveCheck?: boolean;
  className?: string;
  ref?: React.Ref<HTMLInputElement>;
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

/** A labeled form field wrapper with optional info tooltip and supportive text */
export const FormField = ({
  label,
  infoText,
  supportiveText,
  showSupportiveCheck = false,
  className,
  ref,
  ...inputProps
}: FormFieldProps) => {
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
};

export default FormField;
