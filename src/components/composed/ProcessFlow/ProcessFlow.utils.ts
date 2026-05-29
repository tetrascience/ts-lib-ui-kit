import type { ReactNode } from "react";

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

export type ProcessFlowDescriptionVisibility = "auto" | "hidden" | "visible";

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

export interface PositionedStep {
  step: ProcessFlowStep;
  stepIndex: number;
  status: ProcessFlowStepStatus;
  row: number;
  column: number;
}

export interface ResolvedConnection extends ProcessFlowConnection {
  id: string;
  fromStep: PositionedStep;
  toStep: PositionedStep;
  status: ProcessFlowStepStatus;
}

export interface Point {
  x: number;
  y: number;
}

export const STATUS_LABELS: Record<ProcessFlowStepStatus, string> = {
  pending: "Pending",
  active: "Active",
  completed: "Completed",
  error: "Error",
  disabled: "Disabled",
};

export function getDescriptionVisibility(showDescriptions?: boolean): ProcessFlowDescriptionVisibility {
  if (showDescriptions === true) {
    return "visible";
  }

  if (showDescriptions === false) {
    return "hidden";
  }

  return "visible";
}

export function normalizeGridIndex(value: number | undefined, fallback: number) {
  return Math.max(Math.floor(value ?? fallback), 0);
}

export function getStepStatus(step: ProcessFlowStep): ProcessFlowStepStatus {
  if (step.disabled) {
    return "disabled";
  }

  return step.status ?? "pending";
}

export function getStepAccessibleLabel(step: ProcessFlowStep, status: ProcessFlowStepStatus, stepNumber: number) {
  if (step.ariaLabel) {
    return step.ariaLabel;
  }

  const label = typeof step.label === "string" ? step.label : `Step ${stepNumber}`;

  return `${label}, ${STATUS_LABELS[status]}`;
}

export function positionStep(
  step: ProcessFlowStep,
  index: number,
  orientation: ProcessFlowOrientation,
): PositionedStep {
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

export function deriveConnectionStatus(
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

export function resolveConnections(steps: PositionedStep[], connections?: ProcessFlowConnection[]) {
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

export function getPoint(step: PositionedStep, rowCount: number, columnCount: number): Point {
  return {
    x: ((step.column + 0.5) / columnCount) * 100,
    y: ((step.row + 0.5) / rowCount) * 100,
  };
}

export function getConnectionPath(connection: ResolvedConnection, rowCount: number, columnCount: number) {
  const start = getPoint(connection.fromStep, rowCount, columnCount);
  const end = getPoint(connection.toStep, rowCount, columnCount);

  if (connection.fromStep.row === connection.toStep.row || connection.fromStep.column === connection.toStep.column) {
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }

  const midX = (start.x + end.x) / 2;

  return `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;
}

export function hasCustomStepLayout(steps: ProcessFlowStep[]) {
  return steps.some((step) => step.position);
}
