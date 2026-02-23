import { Button } from "@atoms/Button";
import React from "react";
import styled, { css } from "styled-components";

export type CardSidebarStatus = "default" | "active" | "hover" | "disabled";

export interface CardSidebarProps {
  title: string;
  description?: string;
  buttonText?: string;
  linkText?: string;
  status?: CardSidebarStatus;
  onButtonClick?: () => void;
  onLinkClick?: () => void;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

interface CardContainerProps {
  status: CardSidebarStatus;
}

const getBackgroundColor = (status: CardSidebarStatus) => {
  switch (status) {
    case "active":
      return "var(--blue-100)";
    case "hover":
      return "var(--grey-100)";
    case "disabled":
      return "transparent";
    default:
      return "transparent";
  }
};

const getTitleColor = (status: CardSidebarStatus) => {
  switch (status) {
    case "disabled":
      return "var(--grey-400)";
    default:
      return "var(--black-900)";
  }
};

const getDescriptionColor = (status: CardSidebarStatus) => {
  switch (status) {
    case "disabled":
      return "var(--grey-400)";
    default:
      return "var(--grey-400)";
  }
};

const getLinkColor = (status: CardSidebarStatus) => {
  switch (status) {
    case "disabled":
      return "var(--grey-400)";
    default:
      return "var(--blue-600)";
  }
};

const CardContainer = styled.div<CardContainerProps>`
  padding: 20px 16px;
  border-radius: 8px;
  background-color: ${(props) => getBackgroundColor(props.status)};
  cursor: ${(props) =>
    props.status === "disabled" ? "not-allowed" : "pointer"};
  transition: background-color 0.2s ease;

  ${(props) =>
    props.status === "default" &&
    css`
      &:hover {
        background-color: var(--grey-100);
      }
    `}
`;

const Title = styled.h3<{ status: CardSidebarStatus }>`
  margin: 0 0 4px 0;
  font-family: "Inter", sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: ${(props) => getTitleColor(props.status)};
`;

const Description = styled.p<{ status: CardSidebarStatus }>`
  margin: 0 0 16px 0;
  font-family: "Inter", sans-serif;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
  line-height: 20px;
  color: ${(props) => getDescriptionColor(props.status)};
`;

const ActionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StyledButton = styled(Button)`
  flex-shrink: 0;
`;

const Link = styled.a<{ status: CardSidebarStatus }>`
  font-family: "Inter", sans-serif;
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
  line-height: 18px;
  color: ${(props) => getLinkColor(props.status)};
  text-decoration: none;
  cursor: ${(props) =>
    props.status === "disabled" ? "not-allowed" : "pointer"};

  &:hover {
    text-decoration: ${(props) =>
      props.status === "disabled" ? "none" : "underline"};
  }
`;

export const CardSidebar = ({
  title,
  description,
  buttonText,
  linkText,
  status = "default",
  onButtonClick,
  onLinkClick,
  className,
  ref,
}: CardSidebarProps) => {
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status !== "disabled" && onButtonClick) {
      onButtonClick();
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status !== "disabled" && onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <CardContainer ref={ref} status={status} className={className}>
      <Title status={status}>{title}</Title>
      {description && (
        <Description status={status}>{description}</Description>
      )}
      <ActionContainer>
        {buttonText && (
          <StyledButton
            variant="secondary"
            size="small"
            disabled={status === "disabled"}
            onClick={handleButtonClick}
            leftIcon={
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="3"
                  y="3"
                  width="10"
                  height="10"
                  rx="2"
                  fill="currentColor"
                />
              </svg>
            }
          >
            {buttonText}
          </StyledButton>
        )}
        {linkText && (
          <Link
            status={status}
            onClick={handleLinkClick}
            href={status === "disabled" ? undefined : "#"}
          >
            {linkText}
          </Link>
        )}
      </ActionContainer>
    </CardContainer>
  );
};

export default CardSidebar;
