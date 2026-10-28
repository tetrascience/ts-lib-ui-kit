import { useEffect } from "react";

/**
 * Dev-mode deprecation notice for the in-kit chart components (UXT-251).
 *
 * Each chart logs its notice once per page load, and only outside production
 * builds, using the same `NODE_ENV` guard as the telemetry module.
 */

const warned = new Set<string>();

export function warnDeprecatedChart(component: string): void {
  if (typeof process !== "undefined" && process.env?.NODE_ENV === "production") return;
  if (warned.has(component)) return;
  warned.add(component);
  console.warn(
    `[@tetrascience-npm/tetrascience-react-ui] ${component} is deprecated and will be removed in 2.0. ` +
      "Use @tetrascience-npm/ts-lib-viz instead (see MIGRATION.md).",
  );
}

/** Call at the top of a deprecated chart component. */
export function useChartDeprecationWarning(component: string): void {
  useEffect(() => warnDeprecatedChart(component), [component]);
}
