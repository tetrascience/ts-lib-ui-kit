/**
 * A single data point in the scatter plot
 */
export interface ScatterPoint {
  /** Unique identifier for the point */
  id: string | number;
  /** X-axis value */
  x: number;
  /** Y-axis value */
  y: number;
  /** Optional label for the point */
  label?: string;
  /** Additional metadata for tooltips and styling */
  metadata?: Record<string, unknown>;
}

/**
 * Scale type for axes
 */
export type ScaleType = "linear" | "log";

/**
 * Marker shape for scatter points
 */
export type MarkerShape = "circle" | "square" | "diamond" | "cross" | "x" | "triangle-up" | "triangle-down" | "star";

/**
 * Selection mode for interactive selection
 */
export type SelectionMode =
  | "replace" // Default: Replace existing selection
  | "add" // Shift: Add to selection
  | "remove" // Ctrl: Remove from selection
  | "toggle"; // Shift+Ctrl: Toggle selection

/**
 * Color mapping configuration
 */
export interface ColorMapping {
  /** Type of mapping: data-driven or static */
  type: "static" | "continuous" | "categorical";
  /** Static color value (for type: "static") */
  value?: string;
  /** Data field to map (for type: "continuous" | "categorical") */
  field?: string;
  /** Color scale for continuous mapping */
  colorScale?: string | Array<[number, string]>;
  /** Discrete colors for categorical mapping */
  categoryColors?: Record<string, string>;
  /** Min/max values for continuous mapping (auto-calculated if not provided) */
  min?: number;
  max?: number;
}

/**
 * Shape mapping configuration
 */
export interface ShapeMapping {
  /** Type of mapping: data-driven or static */
  type: "static" | "categorical";
  /** Static shape value (for type: "static") */
  value?: MarkerShape;
  /** Data field to map (for type: "categorical") */
  field?: string;
  /** Shape mapping for categorical values */
  categoryShapes?: Record<string, MarkerShape>;
}

/**
 * Size mapping configuration
 */
export interface SizeMapping {
  /** Type of mapping: data-driven or static */
  type: "static" | "continuous" | "categorical";
  /** Static size value (for type: "static") */
  value?: number;
  /** Data field to map (for type: "continuous" | "categorical") */
  field?: string;
  /** Size range for continuous mapping */
  sizeRange?: [number, number];
  /** Discrete sizes for categorical mapping */
  categorySizes?: Record<string, number>;
  /** Min/max values for continuous mapping (auto-calculated if not provided) */
  min?: number;
  max?: number;
}

/**
 * Axis configuration
 */
export interface AxisConfig {
  /** Axis label */
  title?: string;
  /** Scale type (linear or log) */
  scale?: ScaleType;
  /** Fixed axis range [min, max] */
  range?: [number, number];
  /** Auto-range with optional padding percentage (0-1) */
  autoRange?: boolean;
  /** Padding percentage for auto-range (default: 0.1 = 10%) */
  autoRangePadding?: number;
}

/**
 * Tooltip configuration
 */
export interface TooltipConfig {
  /** Enable/disable tooltips */
  enabled?: boolean;
  /** Delay before showing tooltip in milliseconds */
  delay?: number;
  /** Custom tooltip content function */
  content?: (point: ScatterPoint) => string | HTMLElement;
  /** Fields to display in default tooltip */
  fields?: string[];
}

/**
 * Selection state
 */
export interface SelectionState {
  /** Array of selected point IDs */
  selectedIds: Set<string | number>;
}

/**
 * Downsampling configuration for performance optimization
 */
export interface DownsamplingConfig {
  /** Enable downsampling */
  enabled: boolean;
  /** Target number of points to display */
  maxPoints?: number;
  /** Downsampling strategy */
  strategy?: "lttb"; // LTTB = Largest Triangle Three Buckets
}

/**
 * Props for InteractiveScatter component
 */
export interface InteractiveScatterProps {
  /**
   * Array of data points to plot
   */
  data: ScatterPoint[];

  /**
   * Chart title
   */
  title?: string;

  /**
   * X-axis configuration
   */
  xAxis?: AxisConfig;

  /**
   * Y-axis configuration
   */
  yAxis?: AxisConfig;

  /**
   * Color mapping configuration
   */
  colorMapping?: ColorMapping;

  /**
   * Shape mapping configuration
   */
  shapeMapping?: ShapeMapping;

  /**
   * Size mapping configuration
   */
  sizeMapping?: SizeMapping;

  /**
   * Tooltip configuration
   */
  tooltip?: TooltipConfig;

  /**
   * Enable click selection
   * @default true
   */
  enableClickSelection?: boolean;

  /**
   * Enable box selection (drag to select rectangular region)
   * @default true
   */
  enableBoxSelection?: boolean;

  /**
   * Enable lasso selection (freeform selection)
   * @default true
   */
  enableLassoSelection?: boolean;

  /**
   * Controlled selection state.
   * If provided, component operates in controlled mode.
   */
  selectedIds?: Set<string | number>;

  /**
   * Callback when selection changes
   */
  onSelectionChange?: (selectedIds: Set<string | number>, mode: SelectionMode) => void;

  /**
   * Callback when a point is clicked
   */
  onPointClick?: (point: ScatterPoint, event: MouseEvent) => void;

  /**
   * Downsampling configuration for large datasets
   */
  downsampling?: DownsamplingConfig;

  /**
   * Chart width in pixels
   * @default 800
   */
  width?: number;

  /**
   * Chart height in pixels
   * @default 600
   */
  height?: number;

  /**
   * Show legend
   * @default true
   */
  showLegend?: boolean;

  /**
   * Custom CSS class name
   */
  className?: string;
}

/**
 * Data format for selection propagation between components
 */
export interface SelectionEvent {
  /** Array of selected point IDs */
  selectedIds: Set<string | number>;
  /** Selection mode used */
  mode: SelectionMode;
  /** Source component identifier (optional) */
  source?: string;
}
