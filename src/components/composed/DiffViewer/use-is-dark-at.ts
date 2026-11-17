import * as React from "react";

/**
 * Whether dark mode is active where `scopeRef`'s element is mounted: `.dark` on
 * the element itself or on any ancestor, so a dark panel nested in a light page
 * (or a themed shell that is not `<html>`) is seen. Re-evaluates when the class
 * of the element or of an ancestor changes.
 */
export function useIsDarkAt(scopeRef: React.RefObject<HTMLElement | null>): boolean {
  const [isDark, setIsDark] = React.useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );

  React.useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    const read = () => setIsDark(scope.closest(".dark") !== null);
    read();

    // Observe the ancestor chain only: a subtree observer on the document would
    // fire for every class Monaco toggles while it renders.
    const observer = new MutationObserver(read);
    for (let element: HTMLElement | null = scope; element; element = element.parentElement) {
      observer.observe(element, { attributes: true, attributeFilter: ["class"] });
    }
    return () => observer.disconnect();
  }, [scopeRef]);

  return isDark;
}
