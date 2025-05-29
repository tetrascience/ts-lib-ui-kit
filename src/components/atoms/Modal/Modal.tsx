import { ReactNode, useEffect, useRef, useState } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import { Button } from "@atoms/Button";
import { Icon, IconName } from "@atoms/Icon";

export interface ModalProps {
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

// Global style for body when modal is open
const GlobalStyle = createGlobalStyle`
	body.stop-scrolling {
		overflow: hidden;
	}
`;

// Keyframes
const modalFadeIn = keyframes`
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
`;

const modalFadeOut = keyframes`
	from {
		opacity: 1;
	}
	to {
		opacity: 0;
	}
`;

const backdropFadeIn = keyframes`
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
`;

const backdropFadeOut = keyframes`
	from {
		opacity: 1;
	}
	to {
		opacity: 0;
	}
`;

// Styled Components
const ModalRoot = styled.div<{ isFadeOut: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10000;
  animation: ${(props) => (props.isFadeOut ? modalFadeOut : modalFadeIn)} 0.3s
    ease forwards;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Backdrop = styled.button<{ isFadeOut: boolean }>`
  background-color: var(--black-500);
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  backdrop-filter: blur(2px);
  box-shadow: none;
  border: none;
  height: 100%;
  animation: ${(props) => (props.isFadeOut ? backdropFadeOut : backdropFadeIn)}
    0.3s ease forwards;
`;

const ModalContainer = styled.div<{ isFadeOut: boolean; width?: string }>`
  position: relative;
  background: var(--white-900);
  border-radius: 16px;
  width: ${(props) => props.width || "480px"};
  max-width: 90vw;
  padding: 0;
  box-shadow: 0px 4px 12px 0px var(--black-100),
    0px 2px 4px -2px var(--black-100);
  z-index: 1;
  transform: ${(props) => (props.isFadeOut ? "scale(0.95)" : "scale(1)")};
  opacity: ${(props) => (props.isFadeOut ? 0 : 1)};
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
  max-height: 90vh;
  display: flex;
  flex-direction: column;

  @media (max-width: 767px) {
    width: calc(100% - 40px) !important;
  }
`;

const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  border-bottom: 1px solid var(--grey-100);
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-family: "Inter", sans-serif;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: 28px;
  color: var(--black-900);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--black-900);
  width: 24px;
  height: 24px;

  &:hover {
    color: var(--black-900);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Actions = styled.div`
  padding: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  @media (max-width: 767px) {
    justify-content: center !important;

    .button {
      display: flex !important;
      width: 100%;
    }
  }
`;

const ModalContent = styled.div`
  color: var(--grey-500);
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  margin: 0 24px;
  overflow-y: auto;
  flex: 1;
  max-height: calc(90vh - 140px); /* Account for header and footer */
`;

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

  return (
    isVisible && (
      <>
        <GlobalStyle />
        <ModalRoot isFadeOut={isFadeOut} className={className}>
          <Backdrop isFadeOut={isFadeOut} onClick={handleClose} />

          <ModalContainer isFadeOut={isFadeOut} width={width}>
            {title && (
              <HeaderWrapper>
                <ModalTitle>{title}</ModalTitle>
                <CloseButton onClick={handleClose}>
                  <Icon name={IconName.CLOSE} />
                </CloseButton>
              </HeaderWrapper>
            )}

            {!title && (
              <CloseButton
                onClick={handleClose}
                style={{ position: "absolute", top: "16px", right: "16px" }}
              >
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
              </CloseButton>
            )}

            <ModalContent>{children}</ModalContent>

            {!hideActions && (
              <Actions>
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
              </Actions>
            )}
          </ModalContainer>
        </ModalRoot>
      </>
    )
  );
};

export default Modal;
