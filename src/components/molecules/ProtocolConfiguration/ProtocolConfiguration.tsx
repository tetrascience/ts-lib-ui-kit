import React, { useState } from "react";
import { Button } from "@atoms/Button";
import { Icon, IconName } from "@atoms/Icon";
import { Toggle } from "@atoms/Toggle";
import "./ProtocolConfiguration.scss";

interface ProtocolConfigurationProps {
  className?: string;
}

const ProtocolConfiguration: React.FC<ProtocolConfigurationProps> = ({
  className,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <div className={className}>
      <div className="protocol-configuration__header">
        <h2 className="protocol-configuration__title">
          Protocol Configuration
        </h2>
        <div className="protocol-configuration__edit-mode-wrapper">
          <Toggle
            label="Edit Mode"
            checked={isEditMode}
            onChange={() => setIsEditMode((prev) => !prev)}
          />
        </div>
      </div>
      <div className="protocol-configuration__container">
        <div className="protocol-configuration__config-header">
          <h3 className="protocol-configuration__config-title">
            Configuration
          </h3>
        </div>
        <div className="protocol-configuration__config-content">
          {!isEditMode ? (
            <div className="protocol-configuration__empty-state">
              <div className="protocol-configuration__empty-state-text">
                No values, Use the 'edit' button to add values
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export { ProtocolConfiguration };
export type { ProtocolConfigurationProps };
