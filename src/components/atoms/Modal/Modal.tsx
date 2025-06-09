import { ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "@atoms/Button";
import { Icon, IconName } from "@atoms/Icon";
import "./Modal.scss";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCloseLabel?: string;
  onConfirm: () => void;
  onConfirmLabel?: string;
  children: ReactNode;
  width?: string;
  className?: string;
  hideActions?: boolean;
  title?: string;
}

const Modal = ({
  isOpen,
  onClose,
  onCloseLabel,
  onConfirm,
  onConfirmLabel,
  children,
  width = "400px",
  className = "",
  hideActions = false,
  title,
}: ModalProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadeOut, setIsFadeOut] = useState(false);
  const animationTimeout = useRef<NodeJS.Timeout | null>(null);

  // Handle opening and closing animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsFadeOut(false);
    } else {
      // If it's already closed, nothing to do
      if (!isVisible) return;

      // Start fade out animation
      setIsFadeOut(true);

      // Wait for animation to complete before hiding
      animationTimeout.current = setTimeout(() => {
        setIsVisible(false);
      }, 300); // Animation duration
    }

    // Cleanup on unmount
    return () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
    };
  }, [isOpen, isVisible]);

  // Handle body scrolling
  useEffect(() => {
    if (isVisible) {
      if (typeof document !== "undefined") {
        document.body.classList.add("stop-scrolling");
      }
    } else {
      if (typeof document !== "undefined") {
        document.body.classList.remove("stop-scrolling");
      }
    }

    // Cleanup function to remove the class when the component unmounts
    return () => {
      if (typeof document !== "undefined") {
        document.body.classList.remove("stop-scrolling");
      }
    };
  }, [isVisible]);

  // Handle the close button click
  const handleClose = () => {
    setIsFadeOut(true);

    // Wait for animation to complete before calling onClose
    animationTimeout.current = setTimeout(() => {
      onClose();
    }, 300); // Animation duration
  };

  const modalContainerStyle =
    width !== "400px"
      ? ({ "--modal-width": width } as React.CSSProperties)
      : {};

  return (
    isVisible && (
      <div className={`modal-root ${isFadeOut ? "fade-out" : ""} ${className}`}>
        <button
          className={`backdrop ${isFadeOut ? "fade-out" : ""}`}
          onClick={handleClose}
        />

        <div
          className={`modal-container ${isFadeOut ? "fade-out" : ""} ${
            width !== "480px" ? "custom-width" : ""
          }`}
          style={modalContainerStyle}
        >
          {title && (
            <div className="header-wrapper">
              <h3 className="modal-title">{title}</h3>
              <button className="close-button" onClick={handleClose}>
                <Icon name={IconName.CLOSE} />
              </button>
            </div>
          )}

          {!title && (
            <button className="close-button absolute" onClick={handleClose}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}

          <div className="modal-content">{children}</div>

          {!hideActions && (
            <div className="actions">
              <Button
                variant="tertiary"
                onClick={handleClose}
                className="button"
                size="medium"
                fullWidth
              >
                {onCloseLabel || "Cancel"}
              </Button>
              <Button
                variant="primary"
                onClick={onConfirm}
                className="button"
                size="medium"
                fullWidth
              >
                {onConfirmLabel || "Confirm"}
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  );
};

export { Modal };
export type { ModalProps };
