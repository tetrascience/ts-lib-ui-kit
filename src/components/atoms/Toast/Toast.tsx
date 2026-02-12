import { Icon, IconName } from "@atoms/Icon";
import React from "react";
import styled from "styled-components";

import type { ReactNode } from "react";

export type ToastType = "info" | "success" | "warning" | "danger" | "default";

export interface ToastProps {
  type?: ToastType;
  heading: string;
  description?: string;
  className?: string;
}

interface ToastContainerProps {
  type: ToastType;
}

const typeStyles = {
  info: {
    backgroundColor: "var(--blue-100)",
    borderColor: "var(--blue-600)",
    iconColor: "var(--blue-600)",
  },
  success: {
    backgroundColor: "var(--green-bg)",
    borderColor: "var(--green-success)",
    iconColor: "var(--green-success)",
  },
  warning: {
    backgroundColor: "var(--orange-bg)",
    borderColor: "var(--orange-caution)",
    iconColor: "var(--orange-caution)",
  },
  danger: {
    backgroundColor: "var(--red-bg)",
    borderColor: "var(--red-error)",
    iconColor: "var(--red-error)",
  },
  default: {
    backgroundColor: "var(--white-900)",
    borderColor: "var(--grey-300)",
    iconColor: "var(--grey-600)",
  },
};

const ToastContainer = styled.div<ToastContainerProps>`
  display: flex;
  padding: 8px;
  gap: 8px;
  align-items: flex-start;
  border-radius: 8px;
  background-color: ${(props) => typeStyles[props.type].backgroundColor};
  border: 1px solid ${(props) => typeStyles[props.type].borderColor};
  width: 100%;
  box-sizing: border-box;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const Heading = styled.h3`
  margin: 0;
  color: var(--black-900);
  font-family: "Inter", sans-serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
`;

const Description = styled.p`
  margin: 0;
  color: var(--grey-500);
  text-overflow: ellipsis;
  font-family: "Inter", sans-serif;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
`;

const InfoIcon = ({ color }: { color: string }) => (
  <Icon name={IconName.INFORMATION_CIRCLE} fill={color} />
);

const SuccessIcon = ({ color }: { color: string }) => (
  <Icon name={IconName.CHECK_CIRCLE} fill={color} />
);

const WarningIcon = ({ color }: { color: string }) => (
  <Icon name={IconName.EXCLAMATION_TRIANGLE} fill={color} />
);

const ErrorIcon = ({ color }: { color: string }) => (
  <Icon name={IconName.EXCLAMATION_CIRCLE} fill={color} />
);

const NeutralIcon = ({ color }: { color: string }) => (
  <Icon name={IconName.EXCLAMATION_TRIANGLE} fill={color} />
);

const getIcon = (type: ToastType, color: string): ReactNode => {
  switch (type) {
    case "info":
      return <InfoIcon color={color} />;
    case "success":
      return <SuccessIcon color={color} />;
    case "warning":
      return <WarningIcon color={color} />;
    case "danger":
      return <ErrorIcon color={color} />;
    default:
      return <NeutralIcon color={color} />;
  }
};

export const Toast: React.FC<ToastProps> = ({
  type = "default",
  heading,
  description,
  className,
}) => {
  return (
    <ToastContainer type={type} className={className}>
      {getIcon(type, typeStyles[type].iconColor)}
      <ContentContainer>
        <Heading>{heading}</Heading>
        {description && <Description>{description}</Description>}
      </ContentContainer>
    </ToastContainer>
  );
};

export default Toast;
