import React, { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Toast, ToastProps, ToastType } from "@atoms/Toast";
import "./ToastManager.scss";

export type ToastPosition = "top" | "bottom";

export interface ToastItem extends Omit<ToastProps, "className"> {
  id: string;
  duration?: number;
}

export interface ToastContainerProps {
  position: ToastPosition;
}

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
    <div className={`toast-container position-${position}`}>
      {currentToasts.map((toast) => (
        <div key={toast.id} className={`toast-wrapper position-${position}`}>
          <Toast
            type={toast.type}
            heading={toast.heading}
            description={toast.description}
          />
        </div>
      ))}
    </div>,
    document.body
  );
};

export default ToastManager;
