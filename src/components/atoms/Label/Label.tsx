import React from "react";
import "./Label.scss";
import { Icon } from "@atoms/Icon";
import { IconName } from "@atoms/Icon";
import { Tooltip } from "@atoms/Tooltip";

interface LabelProps {
  children: React.ReactNode;
  infoText?: string;
  className?: string;
}

const InfoIcon = () => (
  <Icon name={IconName.INFORMATION_CIRCLE_MICRO} fill="var(--grey-600)" />
);

const Label: React.FC<LabelProps> = ({ children, infoText, className }) => {
  const containerClassName = ["label-container", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClassName}>
      <div className="label-header">
        {children}
        {infoText && (
          <Tooltip content={infoText} placement="bottom">
            <span className="info-icon-wrapper">
              <InfoIcon />
            </span>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export { Label };
export type { LabelProps };
