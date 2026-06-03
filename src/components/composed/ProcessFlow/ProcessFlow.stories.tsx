import { RotateCcwIcon } from "lucide-react";
import { useEffect, useMemo, useState, type ComponentProps } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import {
  PROCESS_FLOW_STEP_STATUSES,
  ProcessFlow,
  type ProcessFlowStep,
  type ProcessFlowStepStatus,
} from "./ProcessFlow";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const uploadSteps: ProcessFlowStep[] = [
  {
    id: "select-files",
    label: "Select files",
    description: "Choose source data",
    status: "completed",
    ariaLabel: "View file selection step",
  },
  {
    id: "validate-inputs",
    label: "Validate inputs",
    description: "Check schema and lineage",
    status: "active",
    ariaLabel: "View validation step",
  },
  {
    id: "run-job",
    label: "Run job",
    description: "Process records",
    status: "pending",
    ariaLabel: "View processing step",
  },
  {
    id: "publish-results",
    label: "Publish results",
    description: "Send downstream",
    status: "disabled",
    ariaLabel: "View publishing step",
  },
];

const reviewSteps: ProcessFlowStep[] = [
  {
    id: "draft",
    label: "Draft",
    description: "Prepare request",
    status: "completed",
  },
  {
    id: "review",
    label: "Review",
    description: "Confirm changes",
    status: "error",
  },
  {
    id: "approval",
    label: "Approval",
    description: "Await owner signoff",
    status: "disabled",
  },
];


const longWorkflowSteps: ProcessFlowStep[] = [
  {
    id: "upload",
    label: "Upload",
    description: "Receive raw files",
    status: "completed",
  },
  {
    id: "scan",
    label: "Scan",
    description: "Inspect manifests",
    status: "completed",
  },
  {
    id: "map",
    label: "Map fields",
    description: "Map columns to schema",
    status: "completed",
  },
  {
    id: "normalize",
    label: "Normalize",
    description: "Standardize values",
    status: "active",
  },
  {
    id: "validate",
    label: "Validate",
    description: "Check rules",
    status: "pending",
  },
  {
    id: "review",
    label: "Review",
    description: "Inspect output",
    status: "pending",
  },
  {
    id: "approve",
    label: "Approve",
    description: "Confirm release",
    status: "pending",
  },
  {
    id: "publish",
    label: "Publish",
    description: "Send downstream",
    status: "disabled",
  },
];

const statusOptionLabels: Record<ProcessFlowStepStatus, string> = {
  pending: "Pending",
  active: "Active",
  completed: "Completed",
  error: "Error",
  disabled: "Disabled",
};

function getStepLabelText(step: ProcessFlowStep) {
  return typeof step.label === "string" ? step.label : step.id;
}

function getStepsFromStatusByStepId(steps: ProcessFlowStep[], statusByStepId: Record<string, ProcessFlowStepStatus>) {
  return steps.map((step) => ({
    ...step,
    status: statusByStepId[step.id] ?? step.status,
  }));
}

function expectHorizontalMarkersAligned(canvasElement: HTMLElement) {
  const items = [...canvasElement.querySelectorAll("[data-slot='process-flow-item']")] as HTMLElement[];
  const markers = [...canvasElement.querySelectorAll("[data-slot='process-flow-marker']")] as HTMLElement[];

  expect(markers).toHaveLength(items.length);

  markers.forEach((marker, index) => {
    const itemRect = items[index].getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();
    const itemCenter = itemRect.left + itemRect.width / 2;
    const markerCenter = markerRect.left + markerRect.width / 2;

    expect(Math.abs(markerCenter - itemCenter)).toBeLessThanOrEqual(1);
  });
}

function EditableUploadWorkflow({
  steps: initialSteps = uploadSteps,
  selectedStepId: selectedStepIdProp,
  onStepSelect,
  ...props
}: ComponentProps<typeof ProcessFlow>) {
  const initialSelectedStepId = selectedStepIdProp ?? initialSteps[1]?.id ?? initialSteps[0]?.id;
  const initialStatusByStepId = useMemo(
    () => Object.fromEntries(initialSteps.map((step) => [step.id, step.status ?? "pending"])),
    [initialSteps],
  );
  const [statusByStepId, setStatusByStepId] = useState(initialStatusByStepId);
  const [selectedStepId, setSelectedStepId] = useState(initialSelectedStepId);
  const steps = useMemo(() => getStepsFromStatusByStepId(initialSteps, statusByStepId), [initialSteps, statusByStepId]);

  useEffect(() => {
    setStatusByStepId(initialStatusByStepId);
  }, [initialStatusByStepId]);

  useEffect(() => {
    setSelectedStepId(initialSelectedStepId);
  }, [initialSelectedStepId]);

  return (
    <div className="flex w-full flex-col gap-4">
      <ProcessFlow
        {...props}
        steps={steps}
        selectedStepId={selectedStepId}
        onStepSelect={(step, details) => {
          setSelectedStepId(step.id);
          onStepSelect?.(step, details);
        }}
      />

      <Separator />

      <div className="flex flex-col gap-3" aria-label="Process flow example controls">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-sm font-medium">Viewing</span>
            <ToggleGroup
              type="single"
              value={selectedStepId}
              onValueChange={(value) => {
                if (value) {
                  setSelectedStepId(value);
                }
              }}
              variant="outline"
              size="sm"
              className="flex-wrap"
              aria-label="Selected process step"
            >
              {initialSteps.map((step) => {
                const label = getStepLabelText(step);

                return (
                  <ToggleGroupItem key={step.id} value={step.id} aria-label={`View ${label}`}>
                    {label}
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setStatusByStepId(initialStatusByStepId);
              setSelectedStepId(initialSelectedStepId);
            }}
          >
            <RotateCcwIcon data-icon="inline-start" />
            Reset
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {initialSteps.map((step) => {
            const label = getStepLabelText(step);

            return (
              <div key={step.id} className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[minmax(9rem,1fr)_auto]">
                <span className="min-w-0 truncate text-sm font-medium">{label}</span>
                <ToggleGroup
                  type="single"
                  value={statusByStepId[step.id]}
                  onValueChange={(value) => {
                    if (value) {
                      setStatusByStepId((current) => ({
                        ...current,
                        [step.id]: value as ProcessFlowStepStatus,
                      }));
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-wrap justify-start sm:justify-end"
                  aria-label={`Set status for ${label}`}
                >
                  {PROCESS_FLOW_STEP_STATUSES.map((status) => (
                    <ToggleGroupItem
                      key={status}
                      value={status}
                      aria-label={`Set ${label} to ${statusOptionLabels[status]}`}
                    >
                      {statusOptionLabels[status]}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DynamicProcessFlow() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [selectedStepId, setSelectedStepId] = useState(uploadSteps[1].id);
  const [hasError, setHasError] = useState(false);
  const steps = useMemo(
    () =>
      uploadSteps.map((step, index) => {
        if (hasError && step.id === "validate-inputs") {
          return { ...step, status: "error" as const };
        }

        if (hasError && index > activeIndex) {
          return { ...step, status: "disabled" as const };
        }

        if (index < activeIndex) {
          return { ...step, status: "completed" as const };
        }

        if (index === activeIndex) {
          return { ...step, status: "active" as const };
        }

        return { ...step, status: "pending" as const };
      }),
    [activeIndex, hasError],
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <ProcessFlow steps={steps} selectedStepId={selectedStepId} onStepSelect={(step) => setSelectedStepId(step.id)} />
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            setHasError(false);
            setActiveIndex((index) => Math.min(index + 1, uploadSteps.length - 1));
          }}
        >
          Advance
        </Button>
        <Button variant="outline" onClick={() => setHasError(true)}>
          Flag validation
        </Button>
      </div>
    </div>
  );
}

const meta: Meta<typeof ProcessFlow> = {
  title: "Design Patterns/ProcessFlow",
  component: ProcessFlow,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Use ProcessFlow for visualizing parent-owned multi-step workflow state. Import it from the UI kit, pass a configurable steps array, and set each step status independently with `pending`, `active`, `completed`, `error`, or `disabled`. Keep workflow side effects in the parent; ProcessFlow renders the state and emits user selection through `onStepSelect`.",
      },
    },
  },
  argTypes: {
    connections: {
      control: false,
    },
    onStepSelect: {
      control: false,
    },
    steps: {
      control: false,
    },
  },
  tags: ["autodocs"],
  decorators: [(Story) => <Story />],
};

export default meta;

type Story = StoryObj<typeof ProcessFlow>;

export const UploadWorkflow: Story = {
  args: {
    steps: uploadSteps,
    selectedStepId: "validate-inputs",
    onStepSelect: fn(),
  },
  parameters: {
    zephyr: {
      testCaseId: "",
    },
  },
  render: (args) => <EditableUploadWorkflow {...args} />,
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Steps render with visual states", async () => {
      expect(canvas.getAllByText("Select files")[0]).toBeInTheDocument();
      expect(canvas.getAllByText("Validate inputs")[0]).toBeInTheDocument();
      expect(canvas.getAllByText("Run job")[0]).toBeInTheDocument();
      expect(canvas.getAllByText("Publish results")[0]).toBeInTheDocument();
      expect(canvas.getByRole("button", { name: "View publishing step" })).toBeDisabled();
    });

    await step("Selectable steps call onStepSelect", async () => {
      const fileSelectionStep = canvas.getByRole("button", { name: "View file selection step" });

      await userEvent.click(fileSelectionStep);
      expect(args.onStepSelect).toHaveBeenCalled();
      fileSelectionStep.blur();
    });

    await step("Story controls can change step status and selected step", async () => {
      await userEvent.click(canvas.getByRole("radio", { name: "Set Run job to Error" }));
      expect(
        canvas.getByRole("button", { name: "View processing step" }).closest("[data-status='error']"),
      ).toBeInTheDocument();

      await userEvent.click(canvas.getByRole("radio", { name: "View Run job" }));
      expect(
        canvas.getByRole("button", { name: "View processing step" }).closest("[data-selected='true']"),
      ).toBeInTheDocument();

      await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
      expect(
        canvas.getByRole("button", { name: "View processing step" }).closest("[data-status='pending']"),
      ).toBeInTheDocument();
    });
  },
};

export const ReviewNeedsAttention: Story = {
  args: {
    steps: reviewSteps,
  },
  parameters: {
    zephyr: {
      testCaseId: "",
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Error and disabled states render", async () => {
      expect(canvas.getByText("Review")).toBeInTheDocument();
      expect(canvas.getByText("Approval").closest("[data-status='disabled']")).toBeInTheDocument();
      expect(canvas.getByText("Review").closest("[data-status='error']")).toBeInTheDocument();
    });
  },
};

export const DynamicState: Story = {
  parameters: {
    zephyr: {
      testCaseId: "",
    },
  },
  render: () => <DynamicProcessFlow />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Parent state advances the active step", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Advance" }));
      expect(canvas.getByText("Run job").closest("[aria-current='step']")).toBeInTheDocument();
    });

    await step("Parent state can mark a step as error", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Flag validation" }));
      expect(canvas.getByText("Validate inputs").closest("[data-status='error']")).toBeInTheDocument();
    });
  },
};

export const VerticalWorkflow: Story = {
  args: {
    steps: uploadSteps,
    selectedStepId: "validate-inputs",
    orientation: "vertical",
  },
  parameters: {
    zephyr: {
      testCaseId: "",
    },
  },
  render: (args) => <EditableUploadWorkflow {...args} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Vertical flow renders without boxed steps", async () => {
      expect(canvas.getAllByText("Select files")[0]).toBeInTheDocument();
      expect(canvas.getAllByText("Validate inputs")[0]).toBeInTheDocument();
      expect(canvasElement.querySelector("[data-orientation='vertical']")).toBeInTheDocument();
    });
  },
};

export const EightStepWorkflow: Story = {
  parameters: {
    layout: "fullscreen",
    zephyr: {
      testCaseId: "",
    },
  },
  args: {
    steps: longWorkflowSteps,
    selectedStepId: "normalize",
  },
  render: (args) => (
    <div className="flex min-h-64 items-center justify-center p-4">
      <div className="w-[1024px] max-w-full">
        <ProcessFlow {...args} />
      </div>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Eight step workflow renders all steps", async () => {
      expect(canvas.getByText("Upload")).toBeInTheDocument();
      expect(canvas.getByText("Scan")).toBeInTheDocument();
      expect(canvas.getByText("Map fields")).toBeInTheDocument();
      expect(canvas.getByText("Normalize")).toBeInTheDocument();
      expect(canvas.getByText("Validate")).toBeInTheDocument();
      expect(canvas.getByText("Review")).toBeInTheDocument();
      expect(canvas.getByText("Approve")).toBeInTheDocument();
      expect(canvas.getByText("Publish")).toBeInTheDocument();
    });
  },
};

export const ResponsiveLongWorkflow: Story = {
  parameters: {
    layout: "fullscreen",
    zephyr: {
      testCaseId: "",
    },
  },
  render: () => (
    <div className="flex min-h-64 items-center justify-center p-4">
      <div className="w-[1024px] max-w-full">
        <ProcessFlow steps={longWorkflowSteps} selectedStepId="normalize" />
      </div>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Eight steps start compression inside a 1024px container", async () => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

      const viewport = canvasElement.querySelector("[data-slot='process-flow-viewport']") as HTMLElement;
      const list = canvasElement.querySelector("[data-slot='process-flow-list']") as HTMLElement;
      const label = canvas.getByText("Map fields");
      const description = canvas.getByText("Map columns to schema");

      expect(list.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
      expect(getComputedStyle(label).display).not.toBe("none");
      expect(Number.parseFloat(getComputedStyle(label).fontSize)).toBeGreaterThanOrEqual(13);
      expect(getComputedStyle(description).display).not.toBe("none");
      expectHorizontalMarkersAligned(canvasElement);
    });
  },
};

export const SqueezedLongWorkflow: Story = {
  parameters: {
    layout: "fullscreen",
    zephyr: {
      testCaseId: "",
    },
  },
  render: () => (
    <div className="flex min-h-64 items-center justify-center p-4">
      <div className="w-[560px] max-w-full">
        <ProcessFlow steps={longWorkflowSteps} selectedStepId="normalize" />
      </div>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Eight steps continue squeezing before micro mode", async () => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

      const viewport = canvasElement.querySelector("[data-slot='process-flow-viewport']") as HTMLElement;
      const list = canvasElement.querySelector("[data-slot='process-flow-list']") as HTMLElement;
      const label = canvas.getByText("Map fields");
      const text = label.closest("[data-slot='process-flow-text']") as HTMLElement;

      expect(list.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
      expect(getComputedStyle(text).display).not.toBe("none");
      expect(Number.parseFloat(getComputedStyle(label).fontSize)).toBeLessThanOrEqual(12);
      expectHorizontalMarkersAligned(canvasElement);
    });
  },
};

export const MiniLongWorkflow: Story = {
  parameters: {
    layout: "fullscreen",
    zephyr: {
      testCaseId: "",
    },
  },
  render: () => (
    <div className="flex min-h-64 items-center justify-center p-4">
      <div className="w-[480px] max-w-full">
        <ProcessFlow steps={longWorkflowSteps} selectedStepId="normalize" />
      </div>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Eight steps collapse to a mini rail in very narrow containers", async () => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

      const viewport = canvasElement.querySelector("[data-slot='process-flow-viewport']") as HTMLElement;
      const list = canvasElement.querySelector("[data-slot='process-flow-list']") as HTMLElement;
      const label = canvas.getByText("Map fields");
      const text = label.closest("[data-slot='process-flow-text']") as HTMLElement;
      const description = text.querySelector("[data-slot='process-flow-description']") as HTMLElement;

      expect(list.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
      expect(getComputedStyle(text).display).not.toBe("none");
      expect(getComputedStyle(description).display).toBe("none");
      expectHorizontalMarkersAligned(canvasElement);
    });
  },
};


export const SingleStep: Story = {
  args: {
    steps: [{ id: "only", label: "Process", description: "Only step", status: "active" }],
    selectedStepId: "only",
  },
  parameters: {
    zephyr: {
      testCaseId: "",
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Single step renders without a connection rail", async () => {
      expect(canvas.getByText("Process")).toBeInTheDocument();
      expect(canvasElement.querySelector("[aria-current='step']")).toBeInTheDocument();
      expect(canvasElement.querySelector("[data-slot='process-flow-list'] > li[aria-hidden='true']")).toBeNull();
    });
  },
};

export const SingleStepVertical: Story = {
  args: {
    steps: [{ id: "only", label: "Process", description: "Only step", status: "active" }],
    orientation: "vertical",
  },
  parameters: {
    zephyr: {
      testCaseId: "",
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Single vertical step renders without a connection rail", async () => {
      expect(canvas.getByText("Process")).toBeInTheDocument();
      expect(canvasElement.querySelector("[data-orientation='vertical']")).toBeInTheDocument();
      expect(canvasElement.querySelector("[data-slot='process-flow-list'] > li[aria-hidden='true']")).toBeNull();
    });
  },
};

export const CompactVertical: Story = {
  args: {
    steps: uploadSteps,
    selectedStepId: "validate-inputs",
    orientation: "vertical",
    size: "compact",
    onStepSelect: fn(),
  },
  parameters: {
    zephyr: {
      testCaseId: "",
    },
  },
  play: async ({ canvasElement, step }) => {
    await step("Compact vertical renders with correct marker-size CSS variable", async () => {
      expect(canvasElement.querySelector("[data-orientation='vertical']")).toBeInTheDocument();
      const viewport = canvasElement.querySelector("[data-slot='process-flow-viewport']") as HTMLElement;
      expect(viewport.style.getPropertyValue("--process-flow-marker-size-base")).toBe("1.75rem");
    });
  },
};

export const DescriptionsAlwaysVisible: Story = {
  args: {
    steps: uploadSteps,
    selectedStepId: "validate-inputs",
    showDescriptions: true,
  },
  parameters: {
    zephyr: {
      testCaseId: "",
    },
  },
  play: async ({ canvasElement, step }) => {
    await step("All descriptions are shown when showDescriptions is true", async () => {
      const descs = canvasElement.querySelectorAll("[data-slot='process-flow-description']");
      expect(descs.length).toBeGreaterThan(0);
      expect(descs[0].getAttribute("data-description-visibility")).toBe("visible");
    });
  },
};

export const VerticalWithErrorAndPendingConnections: Story = {
  args: {
    // error→pending="error", pending→pending="pending", pending→active="active"
    steps: [
      { id: "a", label: "Upload", status: "error" },
      { id: "b", label: "Validate", status: "pending" },
      { id: "c", label: "Normalize", status: "pending" },
      { id: "d", label: "Publish", status: "active" },
    ],
    orientation: "vertical",
  },
  parameters: {
    zephyr: {
      testCaseId: "",
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Vertical flow renders error, pending, and active connection styles", async () => {
      expect(canvas.getByText("Upload").closest("[data-status='error']")).toBeInTheDocument();
      expect(canvasElement.querySelector("[data-orientation='vertical']")).toBeInTheDocument();
      const connections = canvasElement.querySelectorAll(
        "[data-slot='process-flow-list'] > li[aria-hidden='true']",
      );
      expect(connections.length).toBeGreaterThan(0);
    });
  },
};

export const NonSelectableStep: Story = {
  args: {
    steps: [
      { id: "a", label: "Step A", status: "completed" },
      { id: "b", label: "Step B", status: "active", selectable: false },
      { id: "c", label: "Step C", status: "pending" },
    ],
    onStepSelect: fn(),
  },
  parameters: {
    zephyr: {
      testCaseId: "",
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Step with selectable=false is rendered disabled despite active status", async () => {
      expect(canvas.getByRole("button", { name: "Step B, Active" })).toBeDisabled();
    });
  },
};
