import { Dropdown } from "@atoms/Dropdown";
import { Label } from "@atoms/Label";
import { SupportiveText } from "@atoms/SupportiveText";
import { forwardRef } from "react";
import styled from "styled-components";

import type { DropdownProps } from "@atoms/Dropdown";

export interface SelectFieldProps extends Omit<DropdownProps, "className"> {
  label: string;
  infoText?: string;
  supportiveText?: string;
  showSupportiveCheck?: boolean;
  className?: string;
}

const SelectFieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

const StyledLabel = styled(Label)`
  margin-bottom: 2px;
`;

export const SelectField = forwardRef<HTMLDivElement, SelectFieldProps>(
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
      <SelectFieldContainer className={className} ref={ref}>
        <StyledLabel infoText={infoText}>{label}</StyledLabel>
        <Dropdown {...dropdownProps} />
        {supportiveText && (
          <SupportiveText showCheck={showSupportiveCheck}>
            {supportiveText}
          </SupportiveText>
        )}
      </SelectFieldContainer>
    );
  }
);

SelectField.displayName = "SelectField";

export default SelectField;
