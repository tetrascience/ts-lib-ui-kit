import { Button } from "@atoms/Button";
import React, { useEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";

import type { ReactNode} from "react";

export type PopConfirmPlacement =
  | "top"
  | "left"
  | "right"
  | "bottom"
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight"
  | "leftTop"
  | "leftBottom"
  | "rightTop"
  | "rightBottom";

export interface PopConfirmProps {
  title?: ReactNode;
  description?: ReactNode;
  onConfirm?: (e?: React.MouseEvent<HTMLElement>) => void;
  onCancel?: (e?: React.MouseEvent<HTMLElement>) => void;
  okText?: string;
  cancelText?: string;
  placement?: PopConfirmPlacement;
  children: ReactNode;
  className?: string;
  okButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  cancelButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

interface PopoverContainerProps {
  placement: PopConfirmPlacement;
  $isVisible: boolean;
}

const PopoverContainer = styled.div<PopoverContainerProps>`
  position: absolute;
  background-color: var(--white-900);
  border-radius: 8px;
  box-shadow: 0 3px 6px -4px var(--black-200), 0 6px 16px 0 var(--black-100),
    0 9px 28px 8px var(--black-50);
  z-index: 1000;
  max-width: 450px;
  min-width: 400px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  user-select: none;
  padding: 0;
  font-family: "Inter", sans-serif;

  ${(props) =>
    props.$isVisible &&
    css`
      opacity: 1;
      visibility: visible;
    `}

  ${(props) => {
    switch (props.placement) {
      case "top":
        return css`
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-15px);

          &::after {
            content: "";
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -6px;
            border-width: 6px;
            border-style: solid;
            border-color: var(--white-900) transparent transparent transparent;
          }
        `;
      case "topLeft":
        return css`
          bottom: 100%;
          left: 0;
          transform: translateY(-15px);

          &::after {
            content: "";
            position: absolute;
            top: 100%;
            left: 12px;
            border-width: 6px;
            border-style: solid;
            border-color: var(--white-900) transparent transparent transparent;
          }
        `;
      case "topRight":
        return css`
          bottom: 100%;
          right: 0;
          transform: translateY(-15px);

          &::after {
            content: "";
            position: absolute;
            top: 100%;
            right: 12px;
            border-width: 6px;
            border-style: solid;
            border-color: var(--white-900) transparent transparent transparent;
          }
        `;
      case "left":
        return css`
          top: 50%;
          right: 100%;
          transform: translateY(-50%) translateX(-15px);

          &::after {
            content: "";
            position: absolute;
            top: 50%;
            left: 100%;
            margin-top: -6px;
            border-width: 6px;
            border-style: solid;
            border-color: transparent transparent transparent var(--white-900);
          }
        `;
      case "leftTop":
        return css`
          top: 0;
          right: 100%;
          transform: translateX(-15px);

          &::after {
            content: "";
            position: absolute;
            top: 12px;
            left: 100%;
            border-width: 6px;
            border-style: solid;
            border-color: transparent transparent transparent var(--white-900);
          }
        `;
      case "leftBottom":
        return css`
          bottom: 0;
          right: 100%;
          transform: translateX(-15px);

          &::after {
            content: "";
            position: absolute;
            bottom: 12px;
            left: 100%;
            border-width: 6px;
            border-style: solid;
            border-color: transparent transparent transparent var(--white-900);
          }
        `;
      case "right":
        return css`
          top: 50%;
          left: 100%;
          transform: translateY(-50%) translateX(15px);

          &::after {
            content: "";
            position: absolute;
            top: 50%;
            right: 100%;
            margin-top: -6px;
            border-width: 6px;
            border-style: solid;
            border-color: transparent var(--white-900) transparent transparent;
          }
        `;
      case "rightTop":
        return css`
          top: 0;
          left: 100%;
          transform: translateX(15px);

          &::after {
            content: "";
            position: absolute;
            top: 12px;
            right: 100%;
            border-width: 6px;
            border-style: solid;
            border-color: transparent var(--white-900) transparent transparent;
          }
        `;
      case "rightBottom":
        return css`
          bottom: 0;
          left: 100%;
          transform: translateX(15px);

          &::after {
            content: "";
            position: absolute;
            bottom: 12px;
            right: 100%;
            border-width: 6px;
            border-style: solid;
            border-color: transparent var(--white-900) transparent transparent;
          }
        `;
      case "bottom":
        return css`
          top: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(15px);

          &::after {
            content: "";
            position: absolute;
            bottom: 100%;
            left: 50%;
            margin-left: -6px;
            border-width: 6px;
            border-style: solid;
            border-color: transparent transparent var(--white-900) transparent;
          }
        `;
      case "bottomLeft":
        return css`
          top: 100%;
          left: 0;
          transform: translateY(15px);

          &::after {
            content: "";
            position: absolute;
            bottom: 100%;
            left: 12px;
            border-width: 6px;
            border-style: solid;
            border-color: transparent transparent var(--white-900) transparent;
          }
        `;
      case "bottomRight":
        return css`
          top: 100%;
          right: 0;
          transform: translateY(15px);

          &::after {
            content: "";
            position: absolute;
            bottom: 100%;
            right: 12px;
            border-width: 6px;
            border-style: solid;
            border-color: transparent transparent var(--white-900) transparent;
          }
        `;
      default:
        return "";
    }
  }}
`;

const PopoverTitle = styled.div`
  padding: 12px 16px;
  color: var(--black-800);
  font-weight: 600;
  font-size: 14px;
  border-bottom: 1px solid var(--grey-100);
`;

const PopoverContent = styled.div`
  padding: 12px 16px;
  color: var(--grey-600);
  font-size: 14px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 16px 12px;
`;

const PopConfirmWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

export const PopConfirm: React.FC<PopConfirmProps> = ({
  title,
  description,
  onConfirm,
  onCancel,
  okText = "OK",
  cancelText = "Cancel",
  placement = "top",
  children,
  className,
  okButtonProps,
  cancelButtonProps,
  ...rest
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside to close the popconfirm
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible]);

  const handleConfirm = (e: React.MouseEvent<HTMLElement>) => {
    setIsVisible(false);
    onConfirm?.(e);
  };

  const handleCancel = (e: React.MouseEvent<HTMLElement>) => {
    setIsVisible(false);
    onCancel?.(e);
  };

  const handleToggle = () => {
    setIsVisible(!isVisible);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <PopConfirmWrapper ref={wrapperRef} className={className} {...rest}>
      <div
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
      >
        {children}
      </div>
      <PopoverContainer placement={placement} $isVisible={isVisible}>
        {title && <PopoverTitle>{title}</PopoverTitle>}
        {description && <PopoverContent>{description}</PopoverContent>}
        <ButtonsContainer>
          <Button
            variant="tertiary"
            size="small"
            onClick={handleCancel}
            {...cancelButtonProps}
          >
            {cancelText}
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={handleConfirm}
            {...okButtonProps}
          >
            {okText}
          </Button>
        </ButtonsContainer>
      </PopoverContainer>
    </PopConfirmWrapper>
  );
};

PopConfirm.displayName = "PopConfirm";

export default PopConfirm;
