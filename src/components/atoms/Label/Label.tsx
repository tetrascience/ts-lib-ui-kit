import React from "react";
import styled from "styled-components";
import { Icon } from "@atoms/Icon";
import { IconName } from "@atoms/Icon";
import { Tooltip } from "@atoms/Tooltip";

export interface LabelProps {
  children: React.ReactNode;
  infoText?: string;
  className?: string;
}

const LabelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const LabelHeader = styled.div`
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

const InfoIcon = () => (
  <Icon name={IconName.INFORMATION_CIRCLE_MICRO} fill="var(--grey-600)" />
);

const InfoIconWrapper = styled.span`
  display: inline-flex;
  cursor: help;
`;

export const Label: React.FC<LabelProps> = ({
  children,
  infoText,
  className,
}) => {
  return (
    <LabelContainer className={className}>
      <LabelHeader>
        {children}
        {infoText && (
          <Tooltip content={infoText} placement="bottom">
            <InfoIconWrapper>
              <InfoIcon />
            </InfoIconWrapper>
          </Tooltip>
        )}
      </LabelHeader>
    </LabelContainer>
  );
};

export default Label;
