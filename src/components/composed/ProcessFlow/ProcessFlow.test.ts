import { describe, expect, it } from "vitest";

import {
  PROCESS_FLOW_STEP_STATUSES,
  deriveConnectionStatus,
  getConnectionPath,
  getDescriptionVisibility,
  getStepAccessibleLabel,
  getStepStatus,
  hasCustomStepLayout,
  positionStep,
  resolveConnections,
  type ProcessFlowConnection,
  type ProcessFlowOrientation,
  type ProcessFlowStep,
  type ProcessFlowStepStatus,
} from "./ProcessFlow.utils";

function positionSteps(steps: ProcessFlowStep[], orientation: ProcessFlowOrientation = "horizontal") {
  return steps.map((step, index) => positionStep(step, index, orientation));
}

describe("ProcessFlow utilities", () => {
  it("exports the shared step status values", () => {
    expect(PROCESS_FLOW_STEP_STATUSES).toEqual(["pending", "active", "completed", "error", "disabled"]);
  });

  it("resolves description visibility from the public prop", () => {
    expect(getDescriptionVisibility()).toBe("visible");
    expect(getDescriptionVisibility(true)).toBe("visible");
    expect(getDescriptionVisibility(false)).toBe("hidden");
  });

  it("defaults step status to pending and lets disabled override the visual status", () => {
    expect(getStepStatus({ id: "pending", label: "Pending" })).toBe("pending");
    expect(getStepStatus({ id: "disabled", label: "Disabled", status: "completed", disabled: true })).toBe("disabled");
  });

  it("builds accessible labels from the explicit label, string label, or step number", () => {
    expect(getStepAccessibleLabel({ id: "a", label: "Upload" }, "completed", 1)).toBe("Upload, Completed");
    expect(getStepAccessibleLabel({ id: "b", label: "Validate", ariaLabel: "View validation" }, "active", 2)).toBe(
      "View validation",
    );
    expect(getStepAccessibleLabel({ id: "c", label: ["Icon"] }, "pending", 3)).toBe("Step 3, Pending");
  });

  it("positions linear steps from orientation defaults and normalizes custom grid indexes", () => {
    expect(positionStep({ id: "a", label: "A" }, 2, "horizontal")).toMatchObject({
      column: 2,
      row: 0,
      status: "pending",
      stepIndex: 2,
    });
    expect(positionStep({ id: "a", label: "A" }, 2, "vertical")).toMatchObject({
      column: 0,
      row: 2,
    });
    expect(
      positionStep({ id: "a", label: "A", position: { column: 2.8, row: -1 }, status: "active" }, 0, "horizontal"),
    ).toMatchObject({
      column: 2,
      row: 0,
      status: "active",
    });
  });

  it.each<[ProcessFlowStepStatus, ProcessFlowStepStatus, ProcessFlowStepStatus]>([
    ["error", "pending", "error"],
    ["completed", "error", "error"],
    ["completed", "disabled", "disabled"],
    ["completed", "completed", "completed"],
    ["completed", "active", "completed"],
    ["active", "pending", "active"],
    ["pending", "active", "active"],
    ["pending", "pending", "pending"],
  ])("derives connection status from %s to %s as %s", (fromStatus, toStatus, expected) => {
    expect(deriveConnectionStatus(fromStatus, toStatus)).toBe(expected);
  });

  it("derives linear connections from positioned steps", () => {
    const steps = positionSteps([
      { id: "upload", label: "Upload", status: "completed" },
      { id: "validate", label: "Validate", status: "active" },
      { id: "publish", label: "Publish", status: "pending" },
    ]);

    expect(
      resolveConnections(steps).map((connection) => ({
        from: connection.from,
        id: connection.id,
        status: connection.status,
        to: connection.to,
      })),
    ).toEqual([
      { from: "upload", id: "upload-validate-0", status: "completed", to: "validate" },
      { from: "validate", id: "validate-publish-1", status: "active", to: "publish" },
    ]);
  });

  it("keeps explicit connection status and skips connections with unknown steps", () => {
    const steps = positionSteps([
      { id: "a", label: "A" },
      { id: "b", label: "B" },
      { id: "c", label: "C" },
    ]);
    const connections: ProcessFlowConnection[] = [
      { id: "known", from: "a", to: "c", status: "disabled" },
      { from: "unknown", to: "b" },
      { from: "a", to: "unknown" },
    ];

    expect(
      resolveConnections(steps, connections).map((connection) => ({
        from: connection.from,
        id: connection.id,
        status: connection.status,
        to: connection.to,
      })),
    ).toEqual([{ from: "a", id: "known", status: "disabled", to: "c" }]);
  });

  it("generates straight and curved SVG paths from resolved branching connections", () => {
    const sameRowSteps = positionSteps([
      { id: "a", label: "A", position: { column: 0, row: 0 } },
      { id: "b", label: "B", position: { column: 1, row: 0 } },
    ]);
    const curvedSteps = positionSteps([
      { id: "a", label: "A", position: { column: 0, row: 0 } },
      { id: "b", label: "B", position: { column: 1, row: 1 } },
    ]);

    expect(getConnectionPath(resolveConnections(sameRowSteps, [{ from: "a", to: "b" }])[0], 1, 2)).toBe(
      "M 25 50 L 75 50",
    );
    expect(getConnectionPath(resolveConnections(curvedSteps, [{ from: "a", to: "b" }])[0], 2, 2)).toBe(
      "M 25 25 C 50 25, 50 75, 75 75",
    );
  });

  it("detects custom step layout positions", () => {
    expect(hasCustomStepLayout([{ id: "a", label: "A" }])).toBe(false);
    expect(hasCustomStepLayout([{ id: "a", label: "A", position: { column: 1 } }])).toBe(true);
  });
});
