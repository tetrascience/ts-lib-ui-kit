import type { ChartSpec } from "@/vendor/ts-lib-viz/core";

import { plot } from "@/vendor/ts-lib-viz/core";

/**
 * A line drawn across the whole plot at a fixed value: a threshold, a target, a limit.
 *
 * `axis: "y"` draws a horizontal line at `value` on the y axis. `axis: "x"` draws a vertical
 * line at `value` on the x axis. The line does not change the axis range, so set `yRange` or
 * `xRange` if the value falls outside the data.
 */
export interface ReferenceLine {
  axis: "x" | "y";
  value: number;
  /** Text written beside the line. */
  label?: string;
  /** Any CSS colour. Absent takes the theme's foreground ink. */
  color?: string;
  linetype?: "solid" | "dashed" | "dotted";
  /** Stroke width in pixels. */
  linewidth?: number;
}

/**
 * A note written on the chart at a point in data coordinates. It moves with the data when the
 * chart is zoomed or rescaled.
 */
export interface ChartAnnotation {
  x: number | string;
  y: number | string;
  text: string;
}

/** The annotation props every line-based chart takes. */
export interface ChartAnnotationProps {
  /** Lines drawn across the plot, for thresholds, targets and limits. */
  referenceLines?: readonly ReferenceLine[];
  /** Notes written on the plot at data coordinates. */
  annotations?: readonly ChartAnnotation[];
}

/**
 * The spec with its reference lines and notes added. A chart with neither comes back unchanged,
 * so the common case builds exactly the spec it did before.
 */
export function withAnnotations(
  spec: ChartSpec,
  referenceLines: readonly ReferenceLine[] = [],
  annotations: readonly ChartAnnotation[] = [],
): ChartSpec {
  if (referenceLines.length === 0 && annotations.length === 0) return spec;

  // A plot with no rows of its own: each reference line brings the rows it draws from.
  let builder = plot([], {});
  for (const line of referenceLines) {
    const style = {
      ...(line.label === undefined ? {} : { label: line.label }),
      ...(line.color === undefined ? {} : { color: line.color }),
      ...(line.linetype === undefined ? {} : { linetype: line.linetype }),
      ...(line.linewidth === undefined ? {} : { linewidth: line.linewidth }),
    };
    builder =
      line.axis === "y"
        ? builder.annotate("hline", { yintercept: line.value, ...style })
        : builder.annotate("vline", { xintercept: line.value, ...style });
  }
  if (annotations.length > 0) {
    builder = builder.annotate(
      ...annotations.map((note) => ({
        kind: "note" as const,
        text: note.text,
        at: { x: note.x, y: note.y },
      })),
    );
  }
  const added = builder.spec();

  return {
    ...spec,
    layers: [...spec.layers, ...added.layers],
    annotations: [...(spec.annotations ?? []), ...(added.annotations ?? [])],
  };
}
