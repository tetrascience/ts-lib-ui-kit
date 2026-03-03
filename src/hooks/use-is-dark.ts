import { useState, useEffect } from "react";

/**
 * Generic hook that observes the `.dark` class on the document root element
 * and returns whether dark mode is currently active.
 *
 * Uses a MutationObserver to detect theme changes in real time.
 *
 * @example
 * ```tsx
 * const isDark = useIsDark();
 * ```
 */
export function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === "class") {
          setIsDark(root.classList.contains("dark"));
        }
      }
    });

    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  return isDark;
}
