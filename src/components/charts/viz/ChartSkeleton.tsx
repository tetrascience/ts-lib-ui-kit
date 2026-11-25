import { useLayoutEffect, useRef, useState } from "react";

/**
 * The placeholder a chart draws while ts-lib-viz loads: the outline of the chart to come, at the
 * chart's own size, so the page does not shift and a reader can tell what is arriving.
 *
 * It carries no text. `aria-busy` tells assistive technology the region is still loading.
 */

/** The outline to draw. Each chart type names the one closest to what it draws. */
export type ChartSkeletonShape = "line" | "area" | "bar" | "histogram" | "box" | "scatter" | "pie" | "plate" | "trace";

export interface ChartSkeletonProps {
  shape: ChartSkeletonShape;
  /** The chart's width in pixels. Absent fills the parent, as the chart does. */
  width?: number;
  /** The chart's height in pixels. Absent fills the parent, or the chart's default height. */
  height?: number;
}

/** The height ts-lib-viz draws at when neither the chart nor its parent states one. */
const DEFAULT_HEIGHT = 320;

/** Every outline is drawn in one 100 by 60 box and scaled to the chart's size. */
const VIEW_BOX = "0 0 100 60";
const AXES = "M8 4V54H96";

interface Outline {
  /** Filled marks: bars, bands, points, wells. */
  fill?: string;
  /** Stroked marks: lines, traces, whiskers. */
  stroke?: string;
  /** Whether the outline sits on a pair of axes. A pie and a plate do not. */
  axes: boolean;
  /** Round outlines keep their proportions. The others stretch to the chart's box, as its plot does. */
  keepsProportions: boolean;
}

const framed = (marks: Pick<Outline, "fill" | "stroke">): Outline => ({
  ...marks,
  axes: true,
  keepsProportions: false,
});
const round = (fill: string): Outline => ({ fill, axes: false, keepsProportions: true });

const OUTLINES: Record<ChartSkeletonShape, Outline> = {
  line: framed({ stroke: "M12 44L26 34L40 38L54 22L68 28L82 12L94 18" }),
  area: framed({ fill: "M12 54V40L26 30L40 34L54 20L68 26L82 12L94 18V54Z" }),
  bar: framed({
    fill: "M12 32h10v22h-10zM26 18h10v36h-10zM40 26h10v28h-10zM54 10h10v44h-10zM68 36h10v18h-10zM82 22h10v32h-10z",
  }),
  histogram: framed({
    fill: "M12 48h7.8v6h-7.8zM20.4 42h7.8v12h-7.8zM28.8 32h7.8v22h-7.8zM37.2 20h7.8v34h-7.8zM45.6 10h7.8v44h-7.8zM54 14h7.8v40h-7.8zM62.4 26h7.8v28h-7.8zM70.8 38h7.8v16h-7.8zM79.2 45h7.8v9h-7.8zM87.6 50h7.8v4h-7.8z",
  }),
  box: framed({
    fill: "M18 22h16v16h-16zM44 28h16v12h-16zM70 16h16v16h-16z",
    stroke: "M26 12V22M26 38V46M52 18V28M52 40V50M78 8V16M78 32V42",
  }),
  scatter: framed({
    fill: "M14.4 44a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0zM22.4 36a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0zM28.4 42a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0zM36.4 28a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0zM44.4 34a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0zM50.4 22a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0zM58.4 26a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0zM66.4 16a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0zM74.4 20a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0zM84.4 10a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z",
  }),
  pie: round("M26 30a24 24 0 1 0 48 0a24 24 0 1 0 -48 0z"),
  plate: round(
    "M9.4 5.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM16.4 5.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM23.4 5.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM30.4 5.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM37.4 5.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM44.4 5.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM51.4 5.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM58.4 5.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM65.4 5.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM72.4 5.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM79.4 5.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM86.4 5.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM9.4 12.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM16.4 12.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM23.4 12.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM30.4 12.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM37.4 12.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM44.4 12.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM51.4 12.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM58.4 12.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM65.4 12.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM72.4 12.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM79.4 12.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM86.4 12.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM9.4 19.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM16.4 19.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM23.4 19.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM30.4 19.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM37.4 19.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM44.4 19.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM51.4 19.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM58.4 19.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM65.4 19.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM72.4 19.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM79.4 19.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM86.4 19.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM9.4 26.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM16.4 26.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM23.4 26.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM30.4 26.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM37.4 26.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM44.4 26.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM51.4 26.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM58.4 26.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM65.4 26.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM72.4 26.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM79.4 26.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM86.4 26.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM9.4 33.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM16.4 33.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM23.4 33.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM30.4 33.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM37.4 33.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM44.4 33.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM51.4 33.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM58.4 33.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM65.4 33.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM72.4 33.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM79.4 33.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM86.4 33.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM9.4 40.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM16.4 40.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM23.4 40.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM30.4 40.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM37.4 40.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM44.4 40.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM51.4 40.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM58.4 40.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM65.4 40.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM72.4 40.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM79.4 40.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM86.4 40.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM9.4 47.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM16.4 47.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM23.4 47.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM30.4 47.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM37.4 47.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM44.4 47.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM51.4 47.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM58.4 47.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM65.4 47.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM72.4 47.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM79.4 47.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM86.4 47.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM9.4 54.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM16.4 54.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM23.4 54.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM30.4 54.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM37.4 54.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM44.4 54.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM51.4 54.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM58.4 54.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM65.4 54.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM72.4 54.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM79.4 54.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0zM86.4 54.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z",
  ),
  trace: framed({
    stroke:
      "M12 52H22C25 52 25 30 28 30S31 52 34 52H44C47 52 47 10 50 10S53 52 56 52H66C69 52 69 38 72 38S75 52 78 52H94",
  }),
};

const FILLED = "fill-black/15 dark:fill-white/15";
const STROKED = "fill-none stroke-black/15 dark:stroke-white/15";

export function ChartSkeleton({ shape, width, height }: ChartSkeletonProps) {
  const box = useRef<HTMLDivElement>(null);
  // With no height of its own the chart fills its parent, and draws at the default height when the
  // parent has none to give. The outline is out of flow, so the box measures the parent alone.
  const [parentHasHeight, setParentHasHeight] = useState(true);
  useLayoutEffect(() => {
    if (height === undefined && box.current) setParentHasHeight(box.current.clientHeight > 0);
  }, [height]);

  const outline = OUTLINES[shape];

  return (
    <div
      ref={box}
      data-ts-chart-loading={shape}
      aria-busy="true"
      className="relative min-h-0 min-w-0"
      style={{ width: width ?? "100%", height: height ?? (parentHasHeight ? "100%" : DEFAULT_HEIGHT) }}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 size-full animate-pulse"
        viewBox={VIEW_BOX}
        preserveAspectRatio={outline.keepsProportions ? "xMidYMid meet" : "none"}
      >
        {outline.axes && <path className={STROKED} strokeWidth="1" d={AXES} vectorEffect="non-scaling-stroke" />}
        {outline.fill && <path className={FILLED} d={outline.fill} />}
        {outline.stroke && (
          <path
            className={STROKED}
            strokeWidth="2"
            strokeLinejoin="round"
            d={outline.stroke}
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    </div>
  );
}
