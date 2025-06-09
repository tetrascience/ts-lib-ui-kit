import React from "react";
import { Icon, IconName } from "@atoms/Icon";
import "./SupportiveText.scss";

interface SupportiveTextProps {
  children: React.ReactNode;
  showCheck?: boolean;
  className?: string;
}

const CheckIcon = () => (
  <Icon name={IconName.CHECK_CIRCLE} fill="var(--grey-600)" />
);

const SupportiveText: React.FC<SupportiveTextProps> = ({
  children,
  showCheck = false,
  className,
}) => {
  return (
    <div className={`supportive-text ${className || ""}`}>
      {showCheck && <CheckIcon />}
      {children}
    </div>
  );
};

export { SupportiveText };
export type { SupportiveTextProps };
