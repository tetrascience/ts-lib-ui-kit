import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "@atoms/Button";
import "./PopConfirm.scss";

type PopConfirmPlacement =
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

interface PopConfirmProps {
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

// Helper function to convert camelCase placement to kebab-case for CSS classes
const getPlacementClass = (placement: PopConfirmPlacement): string => {
  const placementMap: Record<PopConfirmPlacement, string> = {
    top: "placement-top",
    left: "placement-left",
    right: "placement-right",
    bottom: "placement-bottom",
    topLeft: "placement-top-left",
    topRight: "placement-top-right",
    bottomLeft: "placement-bottom-left",
    bottomRight: "placement-bottom-right",
    leftTop: "placement-left-top",
    leftBottom: "placement-left-bottom",
    rightTop: "placement-right-top",
    rightBottom: "placement-right-bottom",
  };
  return placementMap[placement];
};

const PopConfirm: React.FC<PopConfirmProps> = ({
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

  const popoverClasses = [
    "popover-container",
    getPlacementClass(placement),
    isVisible ? "visible" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const wrapperClasses = ["pop-confirm-wrapper", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={wrapperRef} className={wrapperClasses} {...rest}>
      <div onClick={handleToggle}>{children}</div>
      <div className={popoverClasses}>
        {title && <div className="popover-title">{title}</div>}
        {description && <div className="popover-content">{description}</div>}
        <div className="buttons-container">
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
        </div>
      </div>
    </div>
  );
};

PopConfirm.displayName = "PopConfirm";

export { PopConfirm };
export type { PopConfirmProps };
