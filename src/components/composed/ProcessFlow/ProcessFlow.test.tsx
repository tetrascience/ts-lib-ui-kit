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
});
