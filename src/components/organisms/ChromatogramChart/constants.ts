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
} as const;

