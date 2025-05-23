import React, { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { Toast, ToastProps, ToastType } from "@atoms/Toast";

declare module "styled-components" {
  interface DefaultTheme {
    position: ToastPosition;
  }
}

export type ToastPosition = "top" | "bottom";

export interface ToastItem extends Omit<ToastProps, "className"> {
  id: string;
  duration?: number;
}

export interface ToastContainerProps {
  position: ToastPosition;
}

const ToastContainer = styled.div<ToastContainerProps>`
  position: fixed;
  ${(props) => (props.position === "top" ? "top: 16px;" : "bottom: 16px;")}
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
`;

const ToastWrapper = styled.div`
  opacity: 0;
  transform: translateY(
    ${(props) => (props.theme.position === "top" ? "-10px" : "10px")}
  );
  animation: ${(props) =>
      props.theme.position === "top" ? "slideDownFade" : "slideUpFade"}
    0.3s forwards;
  pointer-events: auto;

  @keyframes slideDownFade {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideUpFade {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

type ToastContextType = {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => string;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toasts: ToastItem[] = [];
let counter = 0;
let listeners: ((toasts: ToastItem[]) => void)[] = [];

const notifyListeners = () => {
  listeners.forEach((listener) => listener(toasts));
};

const addToast = (
  heading: string,
  description?: string,
  type: ToastType = "default",
  duration: number = 5000
): string => {
  const id = `toast-${counter++}`;
  const newToast: ToastItem = {
    id,
    heading,
    description,
    type,
    duration,
  };

  toasts = [...toasts, newToast];
  notifyListeners();

  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }

  return id;
};

const removeToast = (id: string): void => {
  toasts = toasts.filter((toast) => toast.id !== id);
  notifyListeners();
};

const subscribeToToasts = (
  callback: (toasts: ToastItem[]) => void
): (() => void) => {
  listeners.push(callback);
  callback(toasts);

  return () => {
    listeners = listeners.filter((listener) => listener !== callback);
  };
};

export const toast = {
  show: (
    heading: string,
    description?: string,
    type: ToastType = "default",
    duration: number = 5000
  ): string => {
    return addToast(heading, description, type, duration);
  },

  info: (heading: string, description?: string, duration?: number): string => {
    return addToast(heading, description, "info", duration);
  },

  success: (
    heading: string,
    description?: string,
    duration?: number
  ): string => {
    return addToast(heading, description, "success", duration);
  },

  warning: (
    heading: string,
    description?: string,
    duration?: number
  ): string => {
    return addToast(heading, description, "warning", duration);
  },

  danger: (
    heading: string,
    description?: string,
    duration?: number
  ): string => {
    return addToast(heading, description, "danger", duration);
  },

  default: (
    heading: string,
    description?: string,
    duration?: number
  ): string => {
    return addToast(heading, description, "default", duration);
  },

  dismiss: (id: string): void => {
    removeToast(id);
  },
};

export const useToasts = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToasts must be used within a ToastProvider");
  }
  return context;
};

export interface ToastManagerProps {
  position?: ToastPosition;
}

export const ToastManager: React.FC<ToastManagerProps> = ({
  position = "top",
}) => {
  const [currentToasts, setCurrentToasts] = useState<ToastItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = subscribeToToasts(setCurrentToasts);
    return () => {
      unsubscribe();
      setIsMounted(false);
    };
  }, []);

  if (!isMounted) return null;

  return createPortal(
    <ToastContainer position={position}>
      {currentToasts.map((toast) => (
        <ToastWrapper key={toast.id} theme={{ position }}>
          <Toast
            type={toast.type}
            heading={toast.heading}
            description={toast.description}
          />
        </ToastWrapper>
      ))}
    </ToastContainer>,
    document.body
  );
};

export default ToastManager;
