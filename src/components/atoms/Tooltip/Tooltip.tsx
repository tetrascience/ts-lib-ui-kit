import React, { ReactNode, useEffect, useRef, useState } from "react";
import "./Tooltip.scss";

type TooltipPlacement = "top" | "right" | "bottom" | "left";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: TooltipPlacement;
  className?: string;
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
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

  const tooltipContentClasses = [
    "tooltip-content",
    `placement-${placement}`,
    isVisible ? "visible" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`tooltip-container ${className || ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <div className={tooltipContentClasses}>{content}</div>
    </div>
  );
};

export { Tooltip };
export type { TooltipProps, TooltipPlacement };
