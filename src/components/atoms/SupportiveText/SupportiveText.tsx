import { Icon, IconName } from "@atoms/Icon";
import React from "react";
import styled from "styled-components";

/** Props for the SupportiveText component */
export interface SupportiveTextProps {
  children: React.ReactNode;
  showCheck?: boolean;
  className?: string;
}

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--grey-600);
  text-overflow: ellipsis;
  font-family: "Inter", sans-serif;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
`;

/** Check icon displayed alongside supportive text when showCheck is true */
const CheckIcon = () => (
  <Icon name={IconName.CHECK_CIRCLE} fill="var(--grey-600)" />
);

/** Helper text displayed below a form field with an optional check icon */
export const SupportiveText: React.FC<SupportiveTextProps> = ({
  children,
  showCheck = false,
  className,
}) => {
  return (
    <Container className={className}>
      {showCheck && <CheckIcon />}
      {children}
    </Container>
  );
};

export default SupportiveText;
