import { CheckIcon, DotIcon, LockIcon, TriangleAlertIcon } from "lucide-react";

import type { ComponentPropsWithoutRef, CSSProperties, MouseEvent, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Runtime list of the visual states supported by ProcessFlow steps.
 * Use this for controls, schemas, and forms that need to present the same status values the component understands.
 */
export const PROCESS_FLOW_STEP_STATUSES = ["pending", "active", "completed", "error", "disabled"] as const;

/**
 * Visual state for a ProcessFlow step.
 *
 * The parent application owns this state. ProcessFlow renders the provided status and does not run workflow side effects.
 */
export type ProcessFlowStepStatus = (typeof PROCESS_FLOW_STEP_STATUSES)[number];
export type ProcessStepStatus = ProcessFlowStepStatus;

/** Direction for linear process flows. Branching flows are configured with step positions and connections. */
export type ProcessFlowOrientation = "horizontal" | "vertical";

/** Visual density of the process flow. */
export type ProcessFlowSize = "default" | "compact";

type ProcessFlowLayout = "linear" | "branching";
type ProcessFlowStepContentLayout = "stacked" | "inline" | "anchored";
type ProcessFlowDescriptionVisibility = "auto" | "hidden" | "visible";

export interface ProcessFlowStepPosition {
  /** Zero-based row used when rendering a simple branching/configurable flow. */
  row?: number;
  /** Zero-based column used when rendering a simple branching/configurable flow. */
  column?: number;
}

/**
 * Configurable step rendered by ProcessFlow.
 *
 * Keep workflow-specific behavior in the parent. A step config should describe what to render, not what to do when a
 * workflow completes or errors.
 */
export interface ProcessFlowStep {
  /** Stable identifier used for selection and connections. */
  id: string;
  /** Visible step label. */
  label: ReactNode;
  /** Optional secondary text shown under or beside the label. */
  description?: ReactNode;
  /** Parent-controlled visual state. Defaults to "pending". */
  status?: ProcessFlowStepStatus;
  /** Accessible label for selectable steps. */
  ariaLabel?: string;
  /** Forces the step into the disabled visual/non-interactive state. */
  disabled?: boolean;
  /** Set to false when the step should render as non-navigable even when onStepSelect is provided. */
  selectable?: boolean;
  /** Optional grid position for simple branching/configurable layouts. */
  position?: ProcessFlowStepPosition;
}

export type ProcessFlowStepConfig = ProcessFlowStep;
export type ProcessStep = ProcessFlowStep;

/** Connection between two steps in a branching/configurable flow. Linear flows derive connections automatically. */
export interface ProcessFlowConnection {
  id?: string;
  from: string;
  to: string;
  status?: ProcessFlowStepStatus;
  ariaLabel?: string;
}

export interface ProcessFlowStepSelectDetails {
  /** Zero-based index of the selected step in the steps prop. */
  stepIndex: number;
  /** Current visual status of the selected step. */
  status: ProcessFlowStepStatus;
  nativeEvent: MouseEvent<HTMLButtonElement>;
}

/**
 * Presentational process flow.
 *
 * ProcessFlow is fully controlled by props. It visualizes parent-owned workflow state and emits user selection through
 * onStepSelect. It intentionally does not own status transitions or fire completion/error side effects.
 */
export interface ProcessFlowProps extends Omit<ComponentPropsWithoutRef<"nav">, "onSelect"> {
  /** Ordered list of steps to render. Each step controls its own visual status. */
  steps: ProcessFlowStep[];
  /** Optional explicit connections for branching/configurable flows. */
  connections?: ProcessFlowConnection[];
  /** Selected/viewed step id. This is separate from the active workflow status. */
  selectedStepId?: string;
  /** Called when a selectable step is clicked. Disabled and non-selectable steps do not call this. */
  onStepSelect?: (step: ProcessFlowStep, details: ProcessFlowStepSelectDetails) => void;
  orientation?: ProcessFlowOrientation;
  size?: ProcessFlowSize;
  /** Defaults to true. Set to false to hide step descriptions. */
  showDescriptions?: boolean;
}

interface PositionedStep {
  step: ProcessFlowStep;
  stepIndex: number;
  status: ProcessFlowStepStatus;
  row: number;
  column: number;
}

interface ResolvedConnection extends ProcessFlowConnection {
  id: string;
  fromStep: PositionedStep;
  toStep: PositionedStep;
  status: ProcessFlowStepStatus;
}

interface Point {
  x: number;
  y: number;
}

interface StepControlClassOptions {
  layout: ProcessFlowLayout;
  contentLayout: ProcessFlowStepContentLayout;
  onStepSelect?: ProcessFlowProps["onStepSelect"];
  isDisabled: boolean;
  isSelected: boolean;
  size: ProcessFlowSize;
  status: ProcessFlowStepStatus;
}

const STATUS_LABELS: Record<ProcessFlowStepStatus, string> = {
  pending: "Pending",
  active: "Active",
  completed: "Completed",
  error: "Error",
  disabled: "Disabled",
};

const LINEAR_STEP_STATUS_CLASSES: Record<ProcessFlowStepStatus, string> = {
  pending: "text-muted-foreground",
  active: "text-foreground",
  completed: "text-foreground",
  error: "text-destructive",
  disabled: "text-muted-foreground",
};

const MARKER_STATUS_CLASSES: Record<ProcessFlowStepStatus, string> = {
  pending: "border-border bg-background text-muted-foreground",
  active: "border-primary bg-primary text-primary-foreground",
  completed: "border-positive bg-positive text-background",
  error: "border-destructive bg-destructive text-background",
  disabled: "border-border bg-muted text-muted-foreground",
};

const CONNECTION_STATUS_CLASSES: Record<ProcessFlowStepStatus, string> = {
  pending: "stroke-muted-foreground/35",
  active: "stroke-primary",
  completed: "stroke-positive",
  error: "stroke-destructive",
  disabled: "stroke-border",
};

const STEP_MIN_WIDTH: Record<ProcessFlowSize, string> = {
  default: "11rem",
  compact: "8.5rem",
};

const RESPONSIVE_STEP_MIN_WIDTH: Record<ProcessFlowSize, string> = {
  default: "8rem",
  compact: "7rem",
};

const SQUEEZED_STEP_MIN_WIDTH: Record<ProcessFlowSize, string> = {
  default: "5.5rem",
  compact: "4.75rem",
};

const MINI_STEP_MIN_WIDTH: Record<ProcessFlowSize, string> = {
  default: "2.75rem",
  compact: "2.5rem",
};

const ROW_MIN_HEIGHT: Record<ProcessFlowSize, string> = {
  default: "7.5rem",
  compact: "5.75rem",
};

const RESPONSIVE_ROW_MIN_HEIGHT: Record<ProcessFlowSize, string> = {
  default: "6.5rem",
  compact: "5rem",
};

const SQUEEZED_ROW_MIN_HEIGHT: Record<ProcessFlowSize, string> = {
  default: "4.5rem",
  compact: "3.75rem",
};

const MINI_ROW_MIN_HEIGHT: Record<ProcessFlowSize, string> = {
  default: "3.5rem",
  compact: "3rem",
};

const GRID_GAP: Record<ProcessFlowSize, string> = {
  default: "1.25rem",
  compact: "0.75rem",
};

const RESPONSIVE_GRID_GAP: Record<ProcessFlowSize, string> = {
  default: "0.875rem",
  compact: "0.625rem",
};

const SQUEEZED_GRID_GAP: Record<ProcessFlowSize, string> = {
  default: "0.5rem",
  compact: "0.375rem",
};

const MINI_GRID_GAP: Record<ProcessFlowSize, string> = {
  default: "0.375rem",
  compact: "0.25rem",
};

const LINEAR_MARKER_SIZE: Record<ProcessFlowSize, string> = {
  default: "2.5rem",
  compact: "1.75rem",
};

const RESPONSIVE_LINEAR_MARKER_SIZE: Record<ProcessFlowSize, string> = {
  default: "2rem",
  compact: "1.5rem",
};

const SQUEEZED_LINEAR_MARKER_SIZE: Record<ProcessFlowSize, string> = {
  default: "1.5rem",
  compact: "1.25rem",
};

const MINI_LINEAR_MARKER_SIZE: Record<ProcessFlowSize, string> = {
  default: "1.25rem",
  compact: "1.125rem",
};

function getDescriptionVisibility(showDescriptions: boolean | undefined): ProcessFlowDescriptionVisibility {
  if (showDescriptions === true) {
    return "visible";
  }

  if (showDescriptions === false) {
    return "hidden";
  }

  return "visible";
}

function normalizeGridIndex(value: number | undefined, fallback: number) {
  return Math.max(Math.floor(value ?? fallback), 0);
}

function getStepStatus(step: ProcessFlowStep): ProcessFlowStepStatus {
  if (step.disabled) {
    return "disabled";
  }

  return step.status ?? "pending";
}

function getStepAccessibleLabel(step: ProcessFlowStep, status: ProcessFlowStepStatus, stepNumber: number) {
  if (step.ariaLabel) {
    return step.ariaLabel;
  }

  const label = typeof step.label === "string" ? step.label : `Step ${stepNumber}`;

  return `${label}, ${STATUS_LABELS[status]}`;
}

function positionStep(step: ProcessFlowStep, index: number, orientation: ProcessFlowOrientation): PositionedStep {
  const rowFallback = orientation === "vertical" ? index : 0;
  const columnFallback = orientation === "vertical" ? 0 : index;

  return {
    step,
    stepIndex: index,
    status: getStepStatus(step),
    row: normalizeGridIndex(step.position?.row, rowFallback),
    column: normalizeGridIndex(step.position?.column, columnFallback),
  };
}

function deriveConnectionStatus(
  fromStatus: ProcessFlowStepStatus,
  toStatus: ProcessFlowStepStatus,
): ProcessFlowStepStatus {
  if (fromStatus === "error" || toStatus === "error") {
    return "error";
  }

  if (fromStatus === "disabled" || toStatus === "disabled") {
    return "disabled";
  }

  if (fromStatus === "completed" && (toStatus === "completed" || toStatus === "active")) {
    return "completed";
  }

  if (fromStatus === "active" || toStatus === "active") {
    return "active";
  }

  return "pending";
}

function getLinearConnections(steps: PositionedStep[]): ProcessFlowConnection[] {
  return steps.slice(0, -1).map((step, index) => ({
    from: step.step.id,
    to: steps[index + 1].step.id,
  }));
}

function resolveConnections(steps: PositionedStep[], connections?: ProcessFlowConnection[]) {
  const stepMap = new Map(steps.map((step) => [step.step.id, step]));

  return (connections ?? getLinearConnections(steps)).flatMap((connection, index): ResolvedConnection[] => {
    const fromStep = stepMap.get(connection.from);
    const toStep = stepMap.get(connection.to);

    if (!fromStep || !toStep) {
      return [];
    }

    return [
      {
        ...connection,
        id: connection.id ?? `${connection.from}-${connection.to}-${index}`,
        fromStep,
        toStep,
        status: connection.status ?? deriveConnectionStatus(fromStep.status, toStep.status),
      },
    ];
  });
}

function getPoint(step: PositionedStep, rowCount: number, columnCount: number): Point {
  return {
    x: ((step.column + 0.5) / columnCount) * 100,
    y: ((step.row + 0.5) / rowCount) * 100,
  };
}

function getConnectionPath(connection: ResolvedConnection, rowCount: number, columnCount: number) {
  const start = getPoint(connection.fromStep, rowCount, columnCount);
  const end = getPoint(connection.toStep, rowCount, columnCount);

  if (connection.fromStep.row === connection.toStep.row || connection.fromStep.column === connection.toStep.column) {
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }

  const midX = (start.x + end.x) / 2;

  return `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;
}

function getMarkerContent(status: ProcessFlowStepStatus, stepNumber: number) {
  if (status === "completed") {
    return <CheckIcon aria-hidden="true" />;
  }

  if (status === "error") {
    return <TriangleAlertIcon aria-hidden="true" />;
  }

  if (status === "disabled") {
    return <LockIcon aria-hidden="true" />;
  }

  if (status === "active") {
    return <DotIcon aria-hidden="true" />;
  }

  return stepNumber;
}

function hasCustomStepLayout(steps: ProcessFlowStep[]) {
  return steps.some((step) => step.position);
}

function getLinearSegmentStyle(index: number, count: number): CSSProperties {
  return {
    left: `calc(${((index + 0.5) / count) * 100}% + (var(--process-flow-marker-size) / 2))`,
    width: `calc(${(1 / count) * 100}% - var(--process-flow-marker-size))`,
  };
}

function getVerticalSegmentStyle(index: number, count: number): CSSProperties {
  return {
    height: `calc(${(1 / count) * 100}% - var(--process-flow-marker-size))`,
    top: `calc(${((index + 0.5) / count) * 100}% + (var(--process-flow-marker-size) / 2))`,
  };
}

function getHorizontalRailStyle(): CSSProperties {
  const inset = "calc(((100% / var(--process-flow-count)) / 2) + (var(--process-flow-marker-size) / 2))";

  return {
    left: inset,
    right: inset,
  };
}

function getVerticalRailStyle(): CSSProperties {
  const inset = "calc(((100% / var(--process-flow-count)) / 2) + (var(--process-flow-marker-size) / 2))";

  return {
    bottom: inset,
    top: inset,
  };
}

function getStepControlClassName({ contentLayout, onStepSelect, isDisabled, size, status }: StepControlClassOptions) {
  return cn(
    "flex w-full min-w-0 border-0 bg-transparent p-0 text-sm outline-none transition-all focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    contentLayout === "inline" && "flex-row items-center gap-3 text-left",
    contentLayout === "stacked" && "flex-col items-center gap-2 text-center",
    contentLayout === "anchored" && "relative h-full flex-col items-center justify-center text-center",
    size === "compact" && (contentLayout === "inline" ? "gap-2" : "gap-1.5"),
    onStepSelect &&
      !isDisabled &&
      cn("cursor-pointer hover:text-foreground", contentLayout !== "anchored" && "hover:-translate-y-px"),
    onStepSelect && isDisabled && "cursor-not-allowed",
    LINEAR_STEP_STATUS_CLASSES[status],
  );
}

function getMarkerClassName({
  isSelected,
  size,
  status,
}: Pick<StepControlClassOptions, "isSelected" | "size" | "status">) {
  return cn(
    "flex size-[var(--process-flow-marker-size)] shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums transition-colors [&_svg]:size-4",
    size === "compact" && "text-[0.7rem] [&_svg]:size-3",
    "shadow-[0_0_0_0.25rem_var(--background)]",
    isSelected && "ring-4 ring-primary/20",
    MARKER_STATUS_CLASSES[status],
  );
}

function getLabelClassName({
  layout,
  isSelected,
  status,
}: Pick<StepControlClassOptions, "layout" | "isSelected" | "status">) {
  return cn(
    "block max-w-full truncate font-medium text-current",
    layout === "linear" && isSelected && status === "completed" && "text-positive",
    layout === "linear" && isSelected && status !== "completed" && status !== "error" && "text-primary",
  );
}

function ProcessFlowStepControl({
  item,
  isSelected,
  onStepSelect,
  descriptionVisibility,
  size,
  layout,
  contentLayout,
}: {
  item: PositionedStep;
  isSelected: boolean;
  onStepSelect?: ProcessFlowProps["onStepSelect"];
  descriptionVisibility: ProcessFlowDescriptionVisibility;
  size: ProcessFlowSize;
  layout: ProcessFlowLayout;
  contentLayout: ProcessFlowStepContentLayout;
}) {
  const { step, stepIndex, status } = item;
  const isDisabled = status === "disabled" || step.selectable === false;
  const accessibleLabel = getStepAccessibleLabel(step, status, stepIndex + 1);
  const textVisibility = descriptionVisibility === "visible" ? "visible" : "auto";
  const controlClassName = getStepControlClassName({
    layout,
    contentLayout,
    onStepSelect,
    isDisabled,
    isSelected,
    size,
    status,
  });
  const markerContent = (
    <span
      aria-hidden="true"
      className={getMarkerClassName({
        isSelected,
        size,
        status,
      })}
      data-slot="process-flow-marker"
    >
      {getMarkerContent(status, stepIndex + 1)}
    </span>
  );
  const textContent = (
    <span
      data-slot="process-flow-text"
      data-text-visibility={textVisibility}
      className={cn(
        "flex min-w-0 flex-col gap-0.5",
        contentLayout === "stacked" && "w-full items-center",
        contentLayout === "anchored" &&
          "pointer-events-none absolute left-1/2 top-[calc(50%+var(--process-flow-marker-size)/2+0.375rem)] w-max max-w-[calc(var(--process-flow-step-min-width)-0.5rem)] -translate-x-1/2 items-center px-1",
      )}
    >
      <span className={getLabelClassName({ layout, isSelected, status })} data-slot="process-flow-label">
        {step.label}
      </span>
      {descriptionVisibility !== "hidden" && step.description ? (
        <span
          className="line-clamp-2 text-xs leading-snug text-muted-foreground"
          data-description-visibility={descriptionVisibility}
          data-slot="process-flow-description"
        >
          {step.description}
        </span>
      ) : null}
      <span className="sr-only">Status: {STATUS_LABELS[status]}</span>
    </span>
  );
  const content = (
    <>
      {markerContent}
      {textContent}
    </>
  );

  if (!onStepSelect) {
    return (
      <div
        aria-current={status === "active" ? "step" : undefined}
        aria-disabled={isDisabled || undefined}
        aria-invalid={status === "error" || undefined}
        aria-label={accessibleLabel}
        className={controlClassName}
        data-selected={isSelected || undefined}
        data-status={status}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-current={status === "active" ? "step" : undefined}
      aria-invalid={status === "error" || undefined}
      aria-label={accessibleLabel}
      aria-pressed={isSelected}
      className={controlClassName}
      data-selected={isSelected || undefined}
      data-status={status}
      disabled={isDisabled}
      onClick={(nativeEvent) =>
        onStepSelect(step, {
          nativeEvent,
          status,
          stepIndex,
        })
      }
    >
      {content}
    </button>
  );
}

function HorizontalProcessFlow({
  steps,
  selectedStepId,
  onStepSelect,
  size,
  showDescriptions,
}: Pick<ProcessFlowProps, "steps" | "selectedStepId" | "onStepSelect" | "showDescriptions"> & {
  size: ProcessFlowSize;
}) {
  const positionedSteps = steps.map((step, index) => positionStep(step, index, "horizontal"));
  const resolvedConnections = resolveConnections(positionedSteps);
  const descriptionVisibility = getDescriptionVisibility(showDescriptions);
  const flowStyle = {
    "--process-flow-count": steps.length,
    "--process-flow-step-min-width-base": STEP_MIN_WIDTH[size],
    "--process-flow-step-min-width-responsive": RESPONSIVE_STEP_MIN_WIDTH[size],
    "--process-flow-step-min-width-squeezed": SQUEEZED_STEP_MIN_WIDTH[size],
    "--process-flow-step-min-width-mini": MINI_STEP_MIN_WIDTH[size],
    "--process-flow-row-min-height-base": ROW_MIN_HEIGHT[size],
    "--process-flow-row-min-height-responsive": RESPONSIVE_ROW_MIN_HEIGHT[size],
    "--process-flow-row-min-height-squeezed": SQUEEZED_ROW_MIN_HEIGHT[size],
    "--process-flow-row-min-height-mini": MINI_ROW_MIN_HEIGHT[size],
    "--process-flow-marker-size-base": LINEAR_MARKER_SIZE[size],
    "--process-flow-marker-size-responsive": RESPONSIVE_LINEAR_MARKER_SIZE[size],
    "--process-flow-marker-size-squeezed": SQUEEZED_LINEAR_MARKER_SIZE[size],
    "--process-flow-marker-size-mini": MINI_LINEAR_MARKER_SIZE[size],
  } as CSSProperties;

  return (
    <div className="overflow-hidden px-3 py-4" data-slot="process-flow-viewport" style={flowStyle}>
      <ol
        className="relative grid min-w-0 min-h-[var(--process-flow-row-min-height)] list-none p-0"
        data-slot="process-flow-list"
        style={{
          gridTemplateColumns: "repeat(var(--process-flow-count), minmax(0, 1fr))",
        }}
      >
        {steps.length > 1 ? (
          <li
            aria-hidden="true"
            className="absolute top-[calc(var(--process-flow-marker-size)/2)] h-0.5 -translate-y-1/2 rounded-full bg-muted"
            style={getHorizontalRailStyle()}
          />
        ) : null}
        {resolvedConnections.map((connection, index) => (
          <li
            key={connection.id}
            aria-hidden="true"
            className={cn(
              "absolute top-[calc(var(--process-flow-marker-size)/2)] h-0.5 -translate-y-1/2 rounded-full transition-colors",
              connection.status === "completed" && "bg-positive",
              connection.status === "active" && "bg-primary",
              connection.status === "error" && "bg-destructive",
              connection.status === "pending" && "bg-muted",
              connection.status === "disabled" && "bg-border",
            )}
            style={getLinearSegmentStyle(index, steps.length)}
          />
        ))}
        {positionedSteps.map((item) => (
          <li
            key={item.step.id}
            className="relative z-[1] flex min-w-0 items-start justify-center"
            data-slot="process-flow-item"
          >
            <ProcessFlowStepControl
              item={item}
              contentLayout="stacked"
              descriptionVisibility={descriptionVisibility}
              isSelected={selectedStepId === item.step.id}
              layout="linear"
              onStepSelect={onStepSelect}
              size={size}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}

function VerticalProcessFlow({
  steps,
  selectedStepId,
  onStepSelect,
  size,
  showDescriptions,
}: Pick<ProcessFlowProps, "steps" | "selectedStepId" | "onStepSelect" | "showDescriptions"> & {
  size: ProcessFlowSize;
}) {
  const positionedSteps = steps.map((step, index) => positionStep(step, index, "vertical"));
  const resolvedConnections = resolveConnections(positionedSteps);
  const descriptionVisibility = getDescriptionVisibility(showDescriptions);
  const flowStyle = {
    "--process-flow-count": steps.length,
    "--process-flow-row-min-height-base": ROW_MIN_HEIGHT[size],
    "--process-flow-row-min-height-responsive": RESPONSIVE_ROW_MIN_HEIGHT[size],
    "--process-flow-row-min-height-squeezed": SQUEEZED_ROW_MIN_HEIGHT[size],
    "--process-flow-row-min-height-mini": MINI_ROW_MIN_HEIGHT[size],
    "--process-flow-marker-size-base": LINEAR_MARKER_SIZE[size],
    "--process-flow-marker-size-responsive": RESPONSIVE_LINEAR_MARKER_SIZE[size],
    "--process-flow-marker-size-squeezed": SQUEEZED_LINEAR_MARKER_SIZE[size],
    "--process-flow-marker-size-mini": MINI_LINEAR_MARKER_SIZE[size],
  } as CSSProperties;

  return (
    <div className="overflow-x-auto px-3 py-3" data-slot="process-flow-viewport" style={flowStyle}>
      <ol
        className="relative grid min-h-[calc(var(--process-flow-count)*var(--process-flow-row-min-height))] min-w-72 list-none p-0"
        data-slot="process-flow-list"
        style={{
          gridTemplateRows: "repeat(var(--process-flow-count), minmax(var(--process-flow-row-min-height), auto))",
        }}
      >
        {steps.length > 1 ? (
          <li
            aria-hidden="true"
            className="absolute left-[calc(var(--process-flow-marker-size)/2)] w-0.5 -translate-x-1/2 rounded-full bg-muted"
            style={getVerticalRailStyle()}
          />
        ) : null}
        {resolvedConnections.map((connection, index) => (
          <li
            key={connection.id}
            aria-hidden="true"
            className={cn(
              "absolute left-[calc(var(--process-flow-marker-size)/2)] w-0.5 -translate-x-1/2 rounded-full transition-colors",
              connection.status === "completed" && "bg-positive",
              connection.status === "active" && "bg-primary",
              connection.status === "error" && "bg-destructive",
              connection.status === "pending" && "bg-muted",
              connection.status === "disabled" && "bg-border",
            )}
            style={getVerticalSegmentStyle(index, steps.length)}
          />
        ))}
        {positionedSteps.map((item) => (
          <li key={item.step.id} className="relative z-[1] flex min-w-0 items-center" data-slot="process-flow-item">
            <ProcessFlowStepControl
              item={item}
              contentLayout="inline"
              descriptionVisibility={descriptionVisibility}
              isSelected={selectedStepId === item.step.id}
              layout="linear"
              onStepSelect={onStepSelect}
              size={size}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ProcessFlow({
  steps,
  connections,
  selectedStepId,
  onStepSelect,
  orientation = "horizontal",
  size = "default",
  showDescriptions,
  className,
  style,
  "aria-label": ariaLabel = "Process flow",
  ...props
}: ProcessFlowProps) {
  if (steps.length === 0) {
    return null;
  }

  const layout: ProcessFlowLayout = connections || hasCustomStepLayout(steps) ? "branching" : "linear";

  if (layout === "linear" && orientation === "horizontal") {
    return (
      <nav
        aria-label={ariaLabel}
        className={cn("w-full min-w-0", className)}
        data-orientation={orientation}
        data-slot="process-flow"
        data-size={size}
        style={style}
        {...props}
      >
        <HorizontalProcessFlow
          steps={steps}
          selectedStepId={selectedStepId}
          onStepSelect={onStepSelect}
          showDescriptions={showDescriptions}
          size={size}
        />
      </nav>
    );
  }

  if (layout === "linear" && orientation === "vertical") {
    return (
      <nav
        aria-label={ariaLabel}
        className={cn("w-full min-w-0", className)}
        data-orientation={orientation}
        data-slot="process-flow"
        data-size={size}
        style={style}
        {...props}
      >
        <VerticalProcessFlow
          steps={steps}
          selectedStepId={selectedStepId}
          onStepSelect={onStepSelect}
          showDescriptions={showDescriptions}
          size={size}
        />
      </nav>
    );
  }

  const positionedSteps = steps.map((step, index) => positionStep(step, index, orientation));
  const rowCount = Math.max(...positionedSteps.map((step) => step.row + 1), 1);
  const columnCount = Math.max(...positionedSteps.map((step) => step.column + 1), 1);
  const resolvedConnections = resolveConnections(positionedSteps, connections);
  const descriptionVisibility = getDescriptionVisibility(showDescriptions);
  const flowStyle = {
    "--process-flow-columns": columnCount,
    "--process-flow-rows": rowCount,
    "--process-flow-step-min-width-base": STEP_MIN_WIDTH[size],
    "--process-flow-step-min-width-responsive": RESPONSIVE_STEP_MIN_WIDTH[size],
    "--process-flow-step-min-width-squeezed": SQUEEZED_STEP_MIN_WIDTH[size],
    "--process-flow-step-min-width-mini": MINI_STEP_MIN_WIDTH[size],
    "--process-flow-row-min-height-base": ROW_MIN_HEIGHT[size],
    "--process-flow-row-min-height-responsive": RESPONSIVE_ROW_MIN_HEIGHT[size],
    "--process-flow-row-min-height-squeezed": SQUEEZED_ROW_MIN_HEIGHT[size],
    "--process-flow-row-min-height-mini": MINI_ROW_MIN_HEIGHT[size],
    "--process-flow-gap-base": GRID_GAP[size],
    "--process-flow-gap-responsive": RESPONSIVE_GRID_GAP[size],
    "--process-flow-gap-squeezed": SQUEEZED_GRID_GAP[size],
    "--process-flow-gap-mini": MINI_GRID_GAP[size],
    "--process-flow-marker-size-base": LINEAR_MARKER_SIZE[size],
    "--process-flow-marker-size-responsive": RESPONSIVE_LINEAR_MARKER_SIZE[size],
    "--process-flow-marker-size-squeezed": SQUEEZED_LINEAR_MARKER_SIZE[size],
    "--process-flow-marker-size-mini": MINI_LINEAR_MARKER_SIZE[size],
  } as CSSProperties;

  return (
    <nav
      aria-label={ariaLabel}
      className={cn("w-full min-w-0", className)}
      data-orientation={orientation}
      data-slot="process-flow"
      data-size={size}
      style={style}
      {...props}
    >
      <div className="overflow-x-auto py-2" data-slot="process-flow-viewport" style={flowStyle}>
        <div
          className="relative min-w-[calc(var(--process-flow-columns)*var(--process-flow-step-min-width))] min-h-[calc(var(--process-flow-rows)*var(--process-flow-row-min-height))]"
          data-slot="process-flow-canvas"
        >
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 size-full overflow-visible"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            {resolvedConnections.map((connection) => (
              <path
                key={connection.id}
                className={cn(
                  "fill-none stroke-2 transition-colors",
                  CONNECTION_STATUS_CLASSES[connection.status],
                  connection.status === "disabled" && "opacity-60",
                )}
                d={getConnectionPath(connection, rowCount, columnCount)}
                data-status={connection.status}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          <ol
            className="relative z-[1] grid min-h-[inherit] list-none p-0"
            data-slot="process-flow-list"
            style={{
              gap: "var(--process-flow-gap)",
              gridTemplateColumns:
                "repeat(var(--process-flow-columns), minmax(var(--process-flow-step-min-width), 1fr))",
              gridTemplateRows: "repeat(var(--process-flow-rows), minmax(var(--process-flow-row-min-height), auto))",
            }}
          >
            {positionedSteps.map((item) => (
              <li
                key={item.step.id}
                className="flex min-w-0 items-center justify-center"
                data-slot="process-flow-item"
                style={{
                  gridColumn: item.column + 1,
                  gridRow: item.row + 1,
                }}
              >
                <ProcessFlowStepControl
                  item={item}
                  contentLayout="anchored"
                  descriptionVisibility={descriptionVisibility}
                  isSelected={selectedStepId === item.step.id}
                  layout="branching"
                  onStepSelect={onStepSelect}
                  size={size}
                />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </nav>
  );
}
