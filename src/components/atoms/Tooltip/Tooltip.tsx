import React, { ReactNode, useEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";

export type TooltipPlacement = "top" | "right" | "bottom" | "left";

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: TooltipPlacement;
  className?: string;
  delay?: number;
}

interface TooltipContentProps {
  placement: TooltipPlacement;
  isVisible: boolean;
}

const TooltipContainer = styled.div`
  position: relative;
  display: inline-flex;
  width: fit-content;
`;

const TooltipContent = styled.div<TooltipContentProps>`
  position: absolute;
  background-color: var(--black);
  color: var(--white);
  padding: 8px 12px;
  border-radius: 6px;
  font-family: "Inter", sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 18px;
  max-width: 250px;
  min-width: min-content;
  width: max-content;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  white-space: normal;
  word-wrap: break-word;
  box-sizing: border-box;
  text-align: left;

  ${(props) =>
    props.isVisible &&
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
          transform: translateX(-50%) translateY(-8px);

          &::after {
            content: "";
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -6px;
            border-width: 6px;
            border-style: solid;
            border-color: var(--black) transparent transparent transparent;
          }
        `;
      case "right":
        return css`
          top: 50%;
          left: 100%;
          transform: translateY(-50%) translateX(8px);

          &::after {
            content: "";
            position: absolute;
            top: 50%;
            right: 100%;
            margin-top: -6px;
            border-width: 6px;
            border-style: solid;
            border-color: transparent var(--black) transparent transparent;
          }
        `;
      case "bottom":
        return css`
          top: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(8px);

          &::after {
            content: "";
            position: absolute;
            bottom: 100%;
            left: 50%;
            margin-left: -6px;
            border-width: 6px;
            border-style: solid;
            border-color: transparent transparent var(--black) transparent;
          }
        `;
      case "left":
        return css`
          top: 50%;
          right: 100%;
          transform: translateY(-50%) translateX(-8px);

          &::after {
            content: "";
            position: absolute;
            top: 50%;
            left: 100%;
            margin-top: -6px;
            border-width: 6px;
            border-style: solid;
            border-color: transparent transparent transparent var(--black);
          }
        `;
      default:
        return "";
    }
  }}
`;

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = "top",
  className,
  delay = 100,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <TooltipContainer
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <TooltipContent placement={placement} isVisible={isVisible}>
        {content}
      </TooltipContent>
    </TooltipContainer>
  );
};

export default Tooltip;
