import type { ComponentType } from "react";

/**
 * Describes a single user-tunable property of a visualization component.
 *
 * `tunableProps` lists the subset of a component's React props that are
 * intended to be exposed as user controls (color scale, height, precision,
 * etc.) — distinct from data-bound props (e.g. `data`, `layerConfigs`).
 */
export interface VisualizationParameter {
  /** Prop name on the component. */
  name: string;
  /** UI control type for the parameter. */
  type: "number" | "string" | "boolean" | "select";
  /** Short description shown next to the control. */
  description: string;
  /** Default value applied when no user override is set. */
  default?: unknown;
  /** When `type === "select"`, the allowed values. */
  options?: string[];
  /** Optional numeric bounds for `type === "number"`. */
  validation?: { min?: number; max?: number };
}

/**
 * Metadata attached to a visualization component so that consumers can
 * discover it, route calculation outputs to it, and render parameter
 * controls without per-component glue code.
 */
export interface VisualizationMeta {
  /** Stable identifier for this visualization (e.g., "plate-map"). */
  id: string;
  /**
   * The kind of data this visualization accepts. Consumers map a
   * calculation output type (or any equivalent) to this string to
   * locate compatible visualizations.
   */
  inputKind: string;
  /** Human-readable description for catalogs and tooltips. */
  description: string;
  /** User-tunable props this visualization exposes. */
  tunableProps: VisualizationParameter[];
}

/**
 * A React component that carries `VisualizationMeta`. Use
 * `withVisualization` to construct one.
 */
export type VisualizationComponent<P = Record<string, unknown>> = ComponentType<P> & {
  visualization: VisualizationMeta;
};

/**
 * Attaches `VisualizationMeta` to a component as a static `visualization`
 * property and returns a typed `VisualizationComponent`. Use this in
 * place of `export { Component }` when the component should be
 * discoverable as a visualization.
 *
 * @example
 * const PlateMap: React.FC<PlateMapProps> = (props) => {  };
 * export default withVisualization(PlateMap, {
 *   id: "plate-map",
 *   inputKind: "plate_map",
 *   description: "Heatmap of multi-well plate data.",
 *   tunableProps: [],
 * });
 */
export function withVisualization<P>(Component: ComponentType<P>, meta: VisualizationMeta): VisualizationComponent<P> {
  return Object.assign(Component, { visualization: meta }) as VisualizationComponent<P>;
}

/**
 * Type guard for a component that carries `VisualizationMeta`.
 */
export function isVisualizationComponent(value: unknown): value is VisualizationComponent {
  return (
    typeof value === "function" &&
    "visualization" in value &&
    typeof (value as { visualization?: unknown }).visualization === "object"
  );
}
