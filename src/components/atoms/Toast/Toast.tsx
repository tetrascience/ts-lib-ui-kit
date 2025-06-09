import React, { ReactNode } from "react";
import { Icon, IconName } from "@atoms/Icon";
import "./Toast.scss";

type ToastType = "info" | "success" | "warning" | "danger" | "default";

interface ToastProps {
  type?: ToastType;
  heading: string;
  description?: string;
  className?: string;
}

const typeIconMapping = {
  info: IconName.INFORMATION_CIRCLE,
  success: IconName.CHECK_CIRCLE,
  warning: IconName.EXCLAMATION_TRIANGLE,
  danger: IconName.EXCLAMATION_CIRCLE,
  default: IconName.EXCLAMATION_TRIANGLE,
};

const getIcon = (type: ToastType): ReactNode => {
  const iconName = typeIconMapping[type];
  return (
    <div className={`toast__icon toast__icon--${type}`}>
      <Icon name={iconName} />
    </div>
  );
};

const Toast: React.FC<ToastProps> = ({
  type = "default",
  heading,
  description,
  className,
}) => {
  const toastClasses = `toast toast--${type} ${className || ""}`.trim();

  return (
    <div className={toastClasses}>
      {getIcon(type)}
      <div className="toast__content">
        <h3 className="toast__heading">{heading}</h3>
        {description && <p className="toast__description">{description}</p>}
      </div>
    </div>
  );
};

export { Toast };
export type { ToastProps, ToastType };
