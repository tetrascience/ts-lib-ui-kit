/**
 * Constants for ChromatogramChart component
 */

/**
 * Layout constants for chart margins and spacing
 */
export const CHROMATOGRAM_LAYOUT = {
  /** Left margin in pixels */
  MARGIN_LEFT: 70,
  /** Right margin in pixels */
  MARGIN_RIGHT: 30,
  /** Bottom margin in pixels */
  MARGIN_BOTTOM: 60,
  /** Top margin with title in pixels */
  MARGIN_TOP_WITH_TITLE: 50,
  /** Top margin without title in pixels */
  MARGIN_TOP_NO_TITLE: 30,
  /** Padding around plot area */
  MARGIN_PAD: 5,
} as const;

/**
 * Annotation constants for peak labels and markers
 */
export const CHROMATOGRAM_ANNOTATION = {
  /** Default vertical offset for annotation arrows (negative = above point) */
  DEFAULT_ARROW_OFFSET_Y: -30,
  /** Font size for user-defined annotations */
  USER_ANNOTATION_FONT_SIZE: 11,
  /** Font size for auto-detected peak annotations */
  AUTO_ANNOTATION_FONT_SIZE: 10,
  /** Pixel offset above the data point for inline-style annotations (no arrow) */
  INLINE_YSHIFT: 4,
} as const;

/**
 * Trace rendering constants
 */
export const CHROMATOGRAM_TRACE = {
  /** Base line width in pixels for all series traces */
  BASE_LINE_WIDTH: 1.5,
} as const;

/**
 * Constants for range (fraction/region) annotations
 */
export const RANGE_ANNOTATION = {
  /** Default fill opacity for the colored bar */
  DEFAULT_OPACITY: 0.5,
  /** Default label font size */
  DEFAULT_FONT_SIZE: 11,
  /** Bar height in paper coordinates (fraction of plot height) for "top" and "auto" anchors */
  BAR_HEIGHT_PAPER: 0.04,
  /** Gap between stacked lanes in paper coordinates */
  LANE_GAP_PAPER: 0.01,
  /** Multiplier on barHeight to compute the per-lane vertical stride in data coordinates */
  LANE_DATA_STRIDE_FACTOR: 1.5,
  /**
   * Plotly's typical autorange extension factor (Plotly renders data up to ~1/margin_factor
   * of the plot height). Used to convert a data-y value to an approximate paper-y position
   * when yAnchor is "auto".
   */
  AUTO_YRANGE_MARGIN: 1.1,
  /** Paper-space clearance added above the estimated peak paper-y for "auto" bars */
  AUTO_PAPER_CLEARANCE: 0.06,
  /** Default bar height as a fraction of the global data max for number yAnchor */
  DATA_BAR_HEIGHT_FACTOR: 0.04,
} as const;

