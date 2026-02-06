import React from "react";
import styled from "styled-components";
import { Dropdown, DropdownProps } from "@atoms/Dropdown";
import { Label } from "@atoms/Label";
import { SupportiveText } from "@atoms/SupportiveText";

export interface SelectFieldProps extends Omit<DropdownProps, "className"> {
  label: string;
  infoText?: string;
  supportiveText?: string;
  showSupportiveCheck?: boolean;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
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

export const SelectField = ({
  label,
  infoText,
  supportiveText,
  showSupportiveCheck = false,
  className,
  ref,
  ...dropdownProps
}: SelectFieldProps) => {
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
};

export default SelectField;
