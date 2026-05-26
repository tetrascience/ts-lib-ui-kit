import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  PROCESS_FLOW_STEP_STATUSES,
  ProcessFlow,
  type ProcessFlowConnection,
  type ProcessFlowStep,
} from "./ProcessFlow";

import type { ReactElement } from "react";

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  flushSync(() => root.unmount());
  container.remove();
});

function render(ui: ReactElement) {
  flushSync(() => root.render(ui));
  return container;
}

function getButtonByText(text: string) {
  const button = [...container.querySelectorAll("button")].find((element) => element.textContent?.includes(text));

  expect(button).toBeDefined();

  return button as HTMLButtonElement;
}

const steps: ProcessFlowStep[] = [
  {
    id: "upload",
    label: "Upload",
    description: "Receive data",
    status: "completed",
  },
  {
    id: "validate",
    label: "Validate",
    description: "Check schema",
    status: "active",
  },
  {
    id: "publish",
    label: "Publish",
    description: "Write records",
    status: "disabled",
  },
];

describe("ProcessFlow", () => {
  it("exports the shared step status values", () => {
    expect(PROCESS_FLOW_STEP_STATUSES).toEqual(["pending", "active", "completed", "error", "disabled"]);
  });

  it("renders steps with externally provided statuses", () => {
    render(<ProcessFlow steps={steps} selectedStepId="validate" />);

    expect(container.querySelector("[data-slot='process-flow']")).toBeTruthy();
    expect(container.textContent).toContain("Upload");
    expect(container.textContent).toContain("Validate");
    expect(container.textContent).toContain("Publish");
    expect(container.querySelector("[data-status='completed']")).toBeTruthy();
    expect(container.querySelector("[data-status='active']")).toBeTruthy();
    expect(container.querySelector("[data-status='disabled']")).toBeTruthy();
    expect(container.querySelector("[aria-current='step']")?.textContent).toContain("Validate");
    expect(container.querySelector("[data-selected='true']")?.textContent).toContain("Validate");
  });

  it("keeps disabled step markers opaque so rails do not show through", () => {
    render(<ProcessFlow steps={steps} />);

    const disabledStep = container.querySelector("[data-status='disabled']");

    expect(disabledStep?.className).not.toContain("opacity-");
  });

  it("reflects parent-owned state changes on rerender", () => {
    render(<ProcessFlow steps={steps} />);
    expect(container.querySelector("[aria-current='step']")?.textContent).toContain("Validate");

    const updatedSteps: ProcessFlowStep[] = steps.map((step) => {
      if (step.id === "validate") {
        return { ...step, status: "completed" };
      }

      if (step.id === "publish") {
        return { ...step, status: "active", disabled: false };
      }

      return step;
    });

    render(<ProcessFlow steps={updatedSteps} selectedStepId="publish" />);

    expect(container.querySelector("[aria-current='step']")?.textContent).toContain("Publish");
    expect(container.querySelector("[data-selected='true']")?.textContent).toContain("Publish");
  });

  it("uses responsive density defaults for horizontal flows", () => {
    render(<ProcessFlow steps={steps} />);

    const viewport = container.querySelector("[data-slot='process-flow-viewport']") as HTMLElement;
    const description = container.querySelector("[data-slot='process-flow-description']");

    expect(viewport.style.getPropertyValue("--process-flow-step-min-width-base")).toBe("11rem");
    expect(viewport.style.getPropertyValue("--process-flow-step-min-width-responsive")).toBe("8rem");
    expect(viewport.style.getPropertyValue("--process-flow-step-min-width-squeezed")).toBe("5.5rem");
    expect(viewport.style.getPropertyValue("--process-flow-step-min-width-mini")).toBe("2.75rem");
    expect(viewport.style.getPropertyValue("--process-flow-marker-size-base")).toBe("2.5rem");
    expect(viewport.style.getPropertyValue("--process-flow-marker-size-responsive")).toBe("2rem");
    expect(viewport.style.getPropertyValue("--process-flow-marker-size-squeezed")).toBe("1.5rem");
    expect(viewport.style.getPropertyValue("--process-flow-marker-size-mini")).toBe("1.25rem");
    expect(description?.getAttribute("data-description-visibility")).toBe("auto");
  });

  it("respects explicit description visibility", () => {
    render(<ProcessFlow steps={steps} showDescriptions={true} />);

    expect(
      container.querySelector("[data-slot='process-flow-description']")?.getAttribute("data-description-visibility"),
    ).toBe("visible");

    render(<ProcessFlow steps={steps} showDescriptions={false} />);

    expect(container.querySelector("[data-slot='process-flow-description']")).toBeNull();
  });

  it("calls onStepSelect for selectable steps", () => {
    const onStepSelect = vi.fn();

    render(<ProcessFlow steps={steps} onStepSelect={onStepSelect} />);

    getButtonByText("Upload").click();

    expect(onStepSelect).toHaveBeenCalledTimes(1);
    expect(onStepSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "upload" }),
      expect.objectContaining({ status: "completed", stepIndex: 0 }),
    );
  });

  it("does not call onStepSelect for disabled steps", () => {
    const onStepSelect = vi.fn();

    render(<ProcessFlow steps={steps} onStepSelect={onStepSelect} />);

    getButtonByText("Publish").click();

    expect(onStepSelect).not.toHaveBeenCalled();
  });

  it("treats a step with disabled:true as disabled regardless of status", () => {
    const disabledPropSteps: ProcessFlowStep[] = [
      { id: "a", label: "A", status: "completed" },
      { id: "b", label: "B", disabled: true },
    ];
    render(<ProcessFlow steps={disabledPropSteps} />);
    expect(container.querySelectorAll("[data-status='disabled']")).toHaveLength(1);
  });

  it("renders no connection rail for a single-step horizontal flow", () => {
    render(<ProcessFlow steps={[{ id: "only", label: "Only" }]} />);
    expect(container.querySelector("[data-slot='process-flow-list'] > li[aria-hidden='true']")).toBeNull();
  });

  it("renders no connection rail for a single-step vertical flow", () => {
    render(<ProcessFlow steps={[{ id: "only", label: "Only" }]} orientation="vertical" />);
    expect(container.querySelector("[data-slot='process-flow-list'] > li[aria-hidden='true']")).toBeNull();
  });

  it("renders configured branching connections", () => {
    const branchSteps: ProcessFlowStep[] = [
      {
        id: "ingest",
        label: "Ingest",
        status: "completed",
        position: { row: 1, column: 0 },
      },
      {
        id: "metadata",
        label: "Metadata",
        status: "completed",
        position: { row: 0, column: 1 },
      },
      {
        id: "assay",
        label: "Assay",
        status: "active",
        position: { row: 2, column: 1 },
      },
    ];
    const branchConnections: ProcessFlowConnection[] = [
      { from: "ingest", to: "metadata", status: "completed" },
      { from: "ingest", to: "assay", status: "active" },
    ];

    render(<ProcessFlow steps={branchSteps} connections={branchConnections} />);

    const paths = container.querySelectorAll("[data-slot='process-flow-canvas'] > svg > path[data-status]");

    expect(paths).toHaveLength(branchConnections.length);
    expect(paths[0].getAttribute("data-status")).toBe("completed");
    expect(paths[1].getAttribute("data-status")).toBe("active");
  });

  it("returns null for an empty steps array", () => {
    render(<ProcessFlow steps={[]} />);
    expect(container.querySelector("[data-slot='process-flow']")).toBeNull();
  });

  it("renders vertical orientation", () => {
    render(<ProcessFlow steps={steps} orientation="vertical" />);
    expect(container.querySelector("[data-orientation='vertical']")).toBeTruthy();
    expect(container.querySelector("[data-slot='process-flow-list']")).toBeTruthy();
    expect(container.textContent).toContain("Upload");
    expect(container.textContent).toContain("Validate");
  });

  it("applies compact size CSS variables", () => {
    render(<ProcessFlow steps={steps} size="compact" />);
    const viewport = container.querySelector("[data-slot='process-flow-viewport']") as HTMLElement;
    expect(viewport.style.getPropertyValue("--process-flow-step-min-width-base")).toBe("8.5rem");
    expect(viewport.style.getPropertyValue("--process-flow-step-min-width-responsive")).toBe("7rem");
    expect(viewport.style.getPropertyValue("--process-flow-step-min-width-squeezed")).toBe("4.75rem");
    expect(viewport.style.getPropertyValue("--process-flow-step-min-width-mini")).toBe("2.5rem");
    expect(viewport.style.getPropertyValue("--process-flow-marker-size-base")).toBe("1.75rem");
  });

  it("hides descriptions by default in compact size", () => {
    render(<ProcessFlow steps={steps} size="compact" />);
    expect(container.querySelector("[data-slot='process-flow-description']")).toBeNull();
  });

  it("shows descriptions in compact size when showDescriptions is true", () => {
    render(<ProcessFlow steps={steps} size="compact" showDescriptions={true} />);
    const desc = container.querySelector("[data-slot='process-flow-description']");
    expect(desc).toBeTruthy();
    expect(desc?.getAttribute("data-description-visibility")).toBe("visible");
  });

  it("does not call onStepSelect for steps with selectable set to false", () => {
    const onStepSelect = vi.fn();
    const nonSelectableSteps: ProcessFlowStep[] = [
      { id: "a", label: "A", status: "completed" },
      { id: "b", label: "B", status: "active", selectable: false },
      { id: "c", label: "C", status: "pending" },
    ];
    render(<ProcessFlow steps={nonSelectableSteps} onStepSelect={onStepSelect} />);
    getButtonByText("B").click();
    expect(onStepSelect).not.toHaveBeenCalled();
  });

  it("uses the step ariaLabel when provided", () => {
    const labeledSteps: ProcessFlowStep[] = [
      { id: "a", label: "Step A", status: "completed", ariaLabel: "Review A details" },
      { id: "b", label: "Step B", status: "active" },
    ];
    render(<ProcessFlow steps={labeledSteps} onStepSelect={vi.fn()} />);
    expect(container.querySelector("[aria-label='Review A details']")).toBeTruthy();
  });

  it("falls back to Step N in accessible label for non-string ReactNode labels", () => {
    const nodeSteps: ProcessFlowStep[] = [
      { id: "a", label: <span>Icon</span>, status: "completed" },
      { id: "b", label: "B", status: "active" },
    ];
    render(<ProcessFlow steps={nodeSteps} onStepSelect={vi.fn()} />);
    expect(container.querySelector("[aria-label='Step 1, Completed']")).toBeTruthy();
  });

  it("uses a custom nav aria-label when provided", () => {
    render(<ProcessFlow steps={steps} aria-label="Upload workflow" />);
    expect(container.querySelector("nav[aria-label='Upload workflow']")).toBeTruthy();
  });

  it("skips connections that reference unknown step IDs", () => {
    const knownSteps: ProcessFlowStep[] = [
      { id: "a", label: "A", position: { row: 0, column: 0 } },
      { id: "b", label: "B", position: { row: 0, column: 1 } },
    ];
    const badConnections: ProcessFlowConnection[] = [
      { from: "a", to: "unknown" },
      { from: "unknown", to: "b" },
      { from: "a", to: "b" },
    ];
    render(<ProcessFlow steps={knownSteps} connections={badConnections} />);
    expect(container.querySelectorAll("path[data-status]")).toHaveLength(1);
  });

  it("generates a straight line SVG path for same-row branching steps", () => {
    const sameRowSteps: ProcessFlowStep[] = [
      { id: "a", label: "A", status: "completed", position: { row: 0, column: 0 } },
      { id: "b", label: "B", status: "active", position: { row: 0, column: 1 } },
    ];
    render(<ProcessFlow steps={sameRowSteps} connections={[{ from: "a", to: "b" }]} />);
    expect(container.querySelector("path[data-status]")?.getAttribute("d")).toMatch(/^M .+ L .+$/);
  });

  describe("connection status derivation", () => {
    function renderBranchingPairs(pairs: Array<[ProcessFlowStepStatus, ProcessFlowStepStatus]>) {
      const derivedSteps = pairs.flatMap(([from, to], index) => [
        {
          id: `from-${index}`,
          label: `From ${index}`,
          status: from,
          position: { row: index, column: 0 },
        },
        {
          id: `to-${index}`,
          label: `To ${index}`,
          status: to,
          position: { row: index, column: 1 },
        },
      ]);
      const derivedConnections = pairs.map((_, index) => ({
        from: `from-${index}`,
        to: `to-${index}`,
      }));
      render(<ProcessFlow steps={derivedSteps} connections={derivedConnections} />);
      return container.querySelectorAll("path[data-status]");
    }

    it("derives error when the from step has error status", () => {
      const paths = renderBranchingPairs([["error", "pending"]]);
      expect(paths[0].getAttribute("data-status")).toBe("error");
    });

    it("derives error when the to step has error status", () => {
      const paths = renderBranchingPairs([["completed", "error"]]);
      expect(paths[0].getAttribute("data-status")).toBe("error");
    });

    it("derives disabled when either step is disabled and neither is error", () => {
      const paths = renderBranchingPairs([["completed", "disabled"]]);
      expect(paths[0].getAttribute("data-status")).toBe("disabled");
    });

    it("derives completed when both steps are completed", () => {
      const paths = renderBranchingPairs([["completed", "completed"]]);
      expect(paths[0].getAttribute("data-status")).toBe("completed");
    });

    it("derives completed when from is completed and to is active", () => {
      const paths = renderBranchingPairs([["completed", "active"]]);
      expect(paths[0].getAttribute("data-status")).toBe("completed");
    });

    it("derives active when from is active and to is pending", () => {
      const paths = renderBranchingPairs([["active", "pending"]]);
      expect(paths[0].getAttribute("data-status")).toBe("active");
    });

    it("derives pending when both steps are pending", () => {
      const paths = renderBranchingPairs([["pending", "pending"]]);
      expect(paths[0].getAttribute("data-status")).toBe("pending");
    });
  });
});
