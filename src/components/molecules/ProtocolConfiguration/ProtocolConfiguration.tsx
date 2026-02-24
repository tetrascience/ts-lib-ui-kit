import { Button } from "@atoms/Button";
import { Icon, IconName } from "@atoms/Icon";
import { Toggle } from "@atoms/Toggle";
import React, { useState } from "react";
import styled from "styled-components";

/** Props for the ProtocolConfiguration component */
export interface ProtocolConfigurationProps {
  className?: string;
}

const ProtocolConfigHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--grey-100);
  padding: 0 0 24px;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
`;

const ProtocolConfigTitle = styled.h2`
  color: var(--blue-900);
  font-family: "Inter", sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  margin: 0;
`;

const EditModeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--grey-600);
  font-size: 15px;
  font-weight: 500;
`;

const ConfigurationContainer = styled.div`
  background-color: var(--white-900);
  border-radius: 24px;
  border: 1px solid var(--grey-200);
  width: 100%;
`;

const ConfigurationHeader = styled.div`
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--grey-200);
  padding-bottom: 16px;
  padding: 12px 24px;
`;

const ConfigurationTitle = styled.h3`
  color: var(--blue-900);
  font-family: "Inter", sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  margin: 0;
`;

const ConfigurationContent = styled.div`
  padding: 20px 24px 36px 24px;
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
`;

const EmptyStateText = styled.div`
  color: var(--grey-400);
  font-size: 14px;
  font-weight: 500;
`;

/** A panel for viewing and editing protocol YAML configuration */
export const ProtocolConfiguration: React.FC<ProtocolConfigurationProps> = ({
  className,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <div className={className}>
      <ProtocolConfigHeader>
        <ProtocolConfigTitle>Protocol Configuration</ProtocolConfigTitle>
        <EditModeWrapper>
          <Toggle
            label="Edit Mode"
            checked={isEditMode}
            onChange={() => setIsEditMode((prev) => !prev)}
          />
        </EditModeWrapper>
      </ProtocolConfigHeader>
      <ConfigurationContainer>
        <ConfigurationHeader>
          <ConfigurationTitle>Configuration</ConfigurationTitle>
        </ConfigurationHeader>
        <ConfigurationContent>
          {isEditMode ? (
            <Button
              variant="secondary"
              size="medium"
              leftIcon={
                <Icon
                  name={IconName.PLUS}
                  width="20"
                  height="20"
                  fill="var(--blue-600)"
                />
              }
            >
              Add Input
            </Button>
          ) : (
            <EmptyStateContainer>
              <EmptyStateText>
                No values, Use the 'edit' button to add values
              </EmptyStateText>
            </EmptyStateContainer>
          )}
        </ConfigurationContent>
      </ConfigurationContainer>
    </div>
  );
};

export default ProtocolConfiguration;
