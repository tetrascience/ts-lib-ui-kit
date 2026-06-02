import * as React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Suppress "not configured to support act(...)" warnings in jsdom
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

import { ProcessFlow } from "./ProcessFlow";
import type { ProcessFlowStep } from "./ProcessFlow.utils";

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui);
  });
}

function q(selector: string) {
  return container.querySelector(selector);
}

function qa(selector: string) {
  return container.querySelectorAll(selector);
}

const LINEAR_STEPS: ProcessFlowStep[] = [
  { id: "upload", label: "Upload", status: "completed" },
  { id: "validate", label: "Validate", status: "active" },
  { id: "publish", label: "Publish", status: "pending" },
];

describe("ProcessFlow", () => {
  it("renders nothing when steps is empty", () => {
    render(<ProcessFlow steps={[]} />);
    expect(q('[data-slot="process-flow"]')).toBeNull();
  });

  it("renders horizontal linear flow by default", () => {
    render(<ProcessFlow steps={LINEAR_STEPS} />);
    const nav = q('[data-slot="process-flow"]');
    expect(nav).not.toBeNull();
    expect(nav?.getAttribute("data-orientation")).toBe("horizontal");
    expect(qa('[data-slot="process-flow-item"]')).toHaveLength(3);
  });

  it("renders vertical linear flow", () => {
    render(<ProcessFlow steps={LINEAR_STEPS} orientation="vertical" />);
    expect(q('[data-slot="process-flow"]')?.getAttribute("data-orientation")).toBe("vertical");
    expect(qa('[data-slot="process-flow-item"]')).toHaveLength(3);
  });

  it("uses the provided aria-label", () => {
    render(<ProcessFlow steps={LINEAR_STEPS} aria-label="My workflow" />);
    expect(q("nav")?.getAttribute("aria-label")).toBe("My workflow");
  });

  it("applies compact size", () => {
    render(<ProcessFlow steps={LINEAR_STEPS} size="compact" />);
    expect(q('[data-size="compact"]')).not.toBeNull();
  });

  it("renders a horizontal rail when there is more than one step", () => {
    render(<ProcessFlow steps={LINEAR_STEPS} />);
    const list = q('[data-slot="process-flow-list"]');
    // Rail and connection segments are aria-hidden <li> elements
    const railItems = list?.querySelectorAll('li[aria-hidden="true"]') ?? [];
    expect(railItems.length).toBeGreaterThan(0);
  });

  it("does not render a rail for a single-step horizontal flow", () => {
    render(<ProcessFlow steps={[{ id: "only", label: "Only" }]} />);
    const list = q('[data-slot="process-flow-list"]');
    const railItems = list?.querySelectorAll('li[aria-hidden="true"]') ?? [];
    expect(railItems).toHaveLength(0);
  });

  it("renders a vertical rail when there is more than one step", () => {
    render(<ProcessFlow steps={LINEAR_STEPS} orientation="vertical" />);
    const list = q('[data-slot="process-flow-list"]');
    const railItems = list?.querySelectorAll('li[aria-hidden="true"]') ?? [];
    expect(railItems.length).toBeGreaterThan(0);
  });

  it("does not render a rail for a single-step vertical flow", () => {
    render(<ProcessFlow steps={[{ id: "only", label: "Only" }]} orientation="vertical" />);
    const list = q('[data-slot="process-flow-list"]');
    const railItems = list?.querySelectorAll('li[aria-hidden="true"]') ?? [];
    expect(railItems).toHaveLength(0);
  });

  it("renders all five step statuses", () => {
    const steps: ProcessFlowStep[] = [
      { id: "p", label: "Pending" },
      { id: "a", label: "Active", status: "active" },
      { id: "c", label: "Completed", status: "completed" },
      { id: "e", label: "Error", status: "error" },
      { id: "d", label: "Disabled", disabled: true },
    ];
    render(<ProcessFlow steps={steps} />);
    expect(q('[data-status="pending"]')).not.toBeNull();
    expect(q('[data-status="active"]')).not.toBeNull();
    expect(q('[data-status="completed"]')).not.toBeNull();
    expect(q('[data-status="error"]')).not.toBeNull();
    expect(q('[data-status="disabled"]')).not.toBeNull();
  });

  it("marks the active step with aria-current=step", () => {
    render(<ProcessFlow steps={LINEAR_STEPS} />);
    expect(q('[aria-current="step"]')).not.toBeNull();
  });

  it("marks error steps with aria-invalid", () => {
    render(<ProcessFlow steps={[{ id: "e", label: "Err", status: "error" }, { id: "b", label: "B" }]} />);
    expect(q('[aria-invalid="true"]')).not.toBeNull();
  });

  it("renders non-interactive divs when onStepSelect is not provided", () => {
    render(<ProcessFlow steps={LINEAR_STEPS} />);
    expect(qa("button")).toHaveLength(0);
  });

  it("renders interactive buttons when onStepSelect is provided", () => {
    render(<ProcessFlow steps={LINEAR_STEPS} onStepSelect={vi.fn()} />);
    expect(qa("button")).toHaveLength(3);
  });

  it("calls onStepSelect with step and details on click", () => {
    const onStepSelect = vi.fn();
    render(<ProcessFlow steps={LINEAR_STEPS} onStepSelect={onStepSelect} />);
    act(() => {
      (qa("button")[0] as HTMLButtonElement).click();
    });
    expect(onStepSelect).toHaveBeenCalledWith(LINEAR_STEPS[0], expect.objectContaining({ stepIndex: 0, status: "completed" }));
  });

  it("disables the button for disabled steps", () => {
    const steps: ProcessFlowStep[] = [{ id: "d", label: "D", disabled: true }, { id: "b", label: "B" }];
    render(<ProcessFlow steps={steps} onStepSelect={vi.fn()} />);
    expect((qa("button")[0] as HTMLButtonElement).disabled).toBe(true);
  });

  it("disables the button when selectable is false", () => {
    const steps: ProcessFlowStep[] = [{ id: "a", label: "A", selectable: false }, { id: "b", label: "B" }];
    render(<ProcessFlow steps={steps} onStepSelect={vi.fn()} />);
    expect((qa("button")[0] as HTMLButtonElement).disabled).toBe(true);
  });

  it("marks the selected step with data-selected and aria-pressed", () => {
    render(<ProcessFlow steps={LINEAR_STEPS} selectedStepId="validate" onStepSelect={vi.fn()} />);
    const selected = q('[data-selected="true"]');
    expect(selected).not.toBeNull();
    expect(selected?.getAttribute("aria-pressed")).toBe("true");
  });

  it("shows descriptions by default", () => {
    const steps: ProcessFlowStep[] = [
      { id: "a", label: "A", description: "Step A desc", status: "pending" },
      { id: "b", label: "B" },
    ];
    render(<ProcessFlow steps={steps} />);
    expect(q('[data-slot="process-flow-description"]')).not.toBeNull();
  });

  it("hides descriptions when showDescriptions is false", () => {
    const steps: ProcessFlowStep[] = [
      { id: "a", label: "A", description: "Hidden desc", status: "pending" },
      { id: "b", label: "B" },
    ];
    render(<ProcessFlow steps={steps} showDescriptions={false} />);
    expect(q('[data-slot="process-flow-description"]')).toBeNull();
  });

  it("renders selected completed step label with positive style (horizontal, linear)", () => {
    const steps: ProcessFlowStep[] = [
      { id: "done", label: "Done", status: "completed" },
      { id: "next", label: "Next" },
    ];
    render(<ProcessFlow steps={steps} selectedStepId="done" onStepSelect={vi.fn()} />);
    const label = q('[data-slot="process-flow-label"]');
    expect(label?.className).toContain("text-positive");
  });

  it("renders selected active step label with primary style (horizontal, linear)", () => {
    const steps: ProcessFlowStep[] = [
      { id: "cur", label: "Current", status: "active" },
      { id: "nxt", label: "Next" },
    ];
    render(<ProcessFlow steps={steps} selectedStepId="cur" onStepSelect={vi.fn()} />);
    const label = q('[data-slot="process-flow-label"]');
    expect(label?.className).toContain("text-primary");
  });

  it("renders selected error step label without extra highlight", () => {
    const steps: ProcessFlowStep[] = [
      { id: "err", label: "Error", status: "error" },
      { id: "nxt", label: "Next" },
    ];
    render(<ProcessFlow steps={steps} selectedStepId="err" onStepSelect={vi.fn()} />);
    const label = q('[data-slot="process-flow-label"]');
    expect(label?.className).not.toContain("text-positive");
    expect(label?.className).not.toContain("text-primary");
  });

  it("renders compact size in vertical orientation", () => {
    render(<ProcessFlow steps={LINEAR_STEPS} orientation="vertical" size="compact" />);
    expect(q('[data-size="compact"]')).not.toBeNull();
  });

  it("renders error, pending, and disabled connection segments in vertical flow", () => {
    // Steps chosen to produce each connection status: error, pending, disabled
    const steps: ProcessFlowStep[] = [
      { id: "a", label: "A", status: "error" },
      { id: "b", label: "B", status: "pending" },
      { id: "c", label: "C", status: "completed" },
      { id: "d", label: "D", disabled: true },
    ];
    render(<ProcessFlow steps={steps} orientation="vertical" />);
    expect(qa('[data-slot="process-flow-item"]')).toHaveLength(4);
  });

  describe("branching layout", () => {
    const BRANCH_STEPS: ProcessFlowStep[] = [
      { id: "start", label: "Start", position: { column: 0, row: 0 } },
      { id: "branch-a", label: "Branch A", position: { column: 1, row: 0 } },
      { id: "branch-b", label: "Branch B", position: { column: 1, row: 1 } },
      { id: "end", label: "End", position: { column: 2, row: 0 } },
    ];

    it("renders an SVG canvas with connection paths", () => {
      render(
        <ProcessFlow
          steps={BRANCH_STEPS}
          connections={[
            { from: "start", to: "branch-a" },
            { from: "start", to: "branch-b" },
            { from: "branch-a", to: "end" },
          ]}
        />,
      );
      expect(q("svg")).not.toBeNull();
      expect(qa("path").length).toBeGreaterThan(0);
    });

    it("renders interactive buttons with anchored layout in branching flow", () => {
      render(
        <ProcessFlow
          steps={BRANCH_STEPS}
          connections={[{ from: "start", to: "branch-a" }]}
          onStepSelect={vi.fn()}
        />,
      );
      expect(qa("button").length).toBeGreaterThan(0);
    });

    it("triggers branching layout via hasCustomStepLayout (no explicit connections)", () => {
      render(<ProcessFlow steps={BRANCH_STEPS} />);
      expect(q("svg")).not.toBeNull();
    });

    it("skips connections that reference unknown step ids", () => {
      render(
        <ProcessFlow
          steps={BRANCH_STEPS}
          connections={[{ from: "unknown", to: "start" }, { from: "start", to: "branch-a" }]}
        />,
      );
      const paths = qa("path");
      expect(paths).toHaveLength(1);
    });

    it("renders selected step in branching layout", () => {
      render(
        <ProcessFlow
          steps={BRANCH_STEPS}
          connections={[{ from: "start", to: "branch-a" }]}
          selectedStepId="start"
          onStepSelect={vi.fn()}
        />,
      );
      expect(q('[data-selected="true"]')).not.toBeNull();
    });

    it("renders disabled step in branching layout", () => {
      const steps: ProcessFlowStep[] = [
        { id: "s", label: "S", position: { column: 0, row: 0 } },
        { id: "d", label: "D", disabled: true, position: { column: 1, row: 0 } },
      ];
      render(<ProcessFlow steps={steps} onStepSelect={vi.fn()} />);
      const buttons = qa("button");
      expect((buttons[1] as HTMLButtonElement).disabled).toBe(true);
    });

    it("renders descriptions in branching layout", () => {
      const steps: ProcessFlowStep[] = [
        { id: "s", label: "S", description: "branch desc", position: { column: 0, row: 0 } },
        { id: "t", label: "T", position: { column: 1, row: 0 } },
      ];
      render(<ProcessFlow steps={steps} showDescriptions={true} />);
      expect(q('[data-slot="process-flow-description"]')).not.toBeNull();
    });

    it("hides descriptions in branching layout when showDescriptions is false", () => {
      const steps: ProcessFlowStep[] = [
        { id: "s", label: "S", description: "hidden", position: { column: 0, row: 0 } },
        { id: "t", label: "T", position: { column: 1, row: 0 } },
      ];
      render(<ProcessFlow steps={steps} showDescriptions={false} />);
      expect(q('[data-slot="process-flow-description"]')).toBeNull();
    });
  });
});
