import * as React from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { TemplateIOPanel } from "./TemplateIOPanel";

import type { TemplateOption } from "./types";
import type { Meta, StoryObj } from "@storybook/react-vite";

const DEMO_TEMPLATES: TemplateOption[] = [
  { id: "single-point", label: "Single concentration", group: "Built-in", description: "1 dose, all wells" },
  { id: "three-point", label: "3-point AUC", group: "Built-in" },
  { id: "custom", label: "Custom layout", group: "User" },
  { id: "ungrouped", label: "Ungrouped option" },
];

const meta: Meta<typeof TemplateIOPanel> = {
  title: "Design Patterns/PlateMapEditor/TemplateIOPanel",
  component: TemplateIOPanel,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof TemplateIOPanel>;

/**
 * Full TemplateIOPanel with templates, all handlers, and existing entries.
 * Exercises: template selection, clear template, import/export CSV+JSON, file upload.
 */
export const FullPanel: Story = {
  parameters: {
    zephyr: { testCaseId: "SW-T5293" },
  },
  args: {
    templates: DEMO_TEMPLATES,
    templateId: "",
    hasEntries: true,
    onTemplateChange: fn(),
    onClearTemplate: fn(),
    onImportCsv: fn(),
    onExportCsv: fn(),
    onImportTemplate: fn(),
    onExportTemplate: fn(),
  },
  render: (args) => (
    <div className="max-w-sm">
      <TemplateIOPanel {...args} />
    </div>
  ),
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await step("Renders the panel title", async () => {
      expect(canvas.getByText(/Template & import \/ export/)).toBeInTheDocument();
    });

    await step("Opens template select and picks a template", async () => {
      await userEvent.click(canvas.getByRole("combobox"));
      const option = await body.findByRole("option", { name: /3-point AUC/ });
      await userEvent.click(option);
      await waitFor(() =>
        expect(args.onTemplateChange).toHaveBeenCalledWith("three-point"),
      );
    });

    await step("Click 'Clear template'", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /Clear template/ }));
      expect(args.onClearTemplate).toHaveBeenCalled();
    });

    await step("Click 'Export template (JSON)' fires handler", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /Export template/ }));
      expect(args.onExportTemplate).toHaveBeenCalled();
    });

    await step("Click 'Export plate map (CSV)' fires handler", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /Export plate map/ }));
      expect(args.onExportCsv).toHaveBeenCalled();
    });

    await step("Upload a template JSON file triggers onImportTemplate", async () => {
      const fileInputs = canvasElement.querySelectorAll<HTMLInputElement>('input[type="file"]');
      const jsonInput = [...fileInputs].find((el) => el.getAttribute("accept") === "application/json");
      expect(jsonInput).toBeDefined();
      const file = new File(['{"foo":"bar"}'], "template.json", { type: "application/json" });
      await userEvent.upload(jsonInput as HTMLInputElement, file);
      await waitFor(() => expect(args.onImportTemplate).toHaveBeenCalled());
    });

    await step("Upload a CSV file triggers onImportCsv with triage", async () => {
      const fileInputs = canvasElement.querySelectorAll<HTMLInputElement>('input[type="file"]');
      const csvInput = [...fileInputs].find((el) => el.getAttribute("accept")?.includes("csv"));
      expect(csvInput).toBeDefined();
      const csv = "plate_barcode,well\nP001,A01\nP001,A02\n";
      const file = new File([csv], "plate.csv", { type: "text/csv" });
      await userEvent.upload(csvInput as HTMLInputElement, file);
      await waitFor(() => expect(args.onImportCsv).toHaveBeenCalled());
    });
  },
};

/**
 * Disabled-export state: no entries, so export buttons stay disabled,
 * and clear-template is disabled without a templateId.
 */
export const NoEntries: Story = {
  parameters: {
    zephyr: { testCaseId: "SW-T5294" },
  },
  args: {
    templates: DEMO_TEMPLATES,
    hasEntries: false,
    onTemplateChange: fn(),
    onClearTemplate: fn(),
    onImportCsv: fn(),
    onExportCsv: fn(),
    onImportTemplate: fn(),
    onExportTemplate: fn(),
    className: "max-w-sm",
  },
  render: (args) => <TemplateIOPanel {...args} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Export CSV is disabled when there are no entries", async () => {
      const exportCsv = canvas.getByRole("button", { name: /Export plate map/ }) as HTMLButtonElement;
      expect(exportCsv.disabled).toBe(true);
    });

    await step("Export template is disabled when there are no entries", async () => {
      const exportTmpl = canvas.getByRole("button", { name: /Export template/ }) as HTMLButtonElement;
      expect(exportTmpl.disabled).toBe(true);
    });

    await step("Clear template is disabled when no template selected and no entries", async () => {
      const clearBtn = canvas.getByRole("button", { name: /Clear template/ }) as HTMLButtonElement;
      expect(clearBtn.disabled).toBe(true);
    });
  },
};

/**
 * Panel rendered with only CSV handlers (no templates, no JSON handlers).
 * Confirms the template + JSON sections do not render.
 */
export const CsvOnly: Story = {
  parameters: {
    zephyr: { testCaseId: "SW-T5295" },
  },
  args: {
    hasEntries: true,
    onImportCsv: fn(),
    onExportCsv: fn(),
  },
  render: (args) => (
    <div className="max-w-sm">
      <TemplateIOPanel {...args} />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Template select is not rendered", async () => {
      expect(canvas.queryByLabelText("Template")).toBeNull();
    });

    await step("JSON template buttons are not rendered", async () => {
      expect(canvas.queryByRole("button", { name: /Export template/ })).toBeNull();
      expect(canvas.queryByRole("button", { name: /Import template/ })).toBeNull();
    });

    await step("CSV buttons are present", async () => {
      expect(canvas.getByRole("button", { name: /Import plate map/ })).toBeInTheDocument();
      expect(canvas.getByRole("button", { name: /Export plate map/ })).toBeInTheDocument();
    });
  },
};

/**
 * Panel rendered with only JSON template handlers and no CSV handlers.
 */
export const TemplateOnly: Story = {
  parameters: {
    zephyr: { testCaseId: "SW-T5296" },
  },
  args: {
    hasEntries: true,
    onImportTemplate: fn(),
    onExportTemplate: fn(),
  },
  render: (args) => (
    <div className="max-w-sm">
      <TemplateIOPanel {...args} />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("CSV buttons are not rendered", async () => {
      expect(canvas.queryByRole("button", { name: /Import plate map/ })).toBeNull();
      expect(canvas.queryByRole("button", { name: /Export plate map/ })).toBeNull();
    });

    await step("Template JSON buttons are present", async () => {
      expect(canvas.getByRole("button", { name: /Import template/ })).toBeInTheDocument();
      expect(canvas.getByRole("button", { name: /Export template/ })).toBeInTheDocument();
    });
  },
};

/**
 * Panel with templates but no clear-template handler — verifies that the
 * Clear template button is omitted while the select is still present.
 */
export const TemplatesWithoutClear: Story = {
  parameters: {
    zephyr: { testCaseId: "SW-T5297" },
  },
  args: {
    templates: DEMO_TEMPLATES,
    templateId: "custom",
    onTemplateChange: fn(),
  },
  render: (args) => (
    <div className="max-w-sm">
      <TemplateIOPanel {...args} />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Select renders with the supplied templateId", async () => {
      expect(canvas.getByLabelText("Template")).toBeInTheDocument();
    });

    await step("Clear template button is not rendered", async () => {
      expect(canvas.queryByRole("button", { name: /Clear template/ })).toBeNull();
    });
  },
};

/**
 * Empty panel — no templates, no handlers. Verifies the component still
 * renders the title and nothing else, with no errors.
 */
export const EmptyPanel: Story = {
  parameters: {
    zephyr: { testCaseId: "SW-T5298" },
  },
  args: {},
  render: (args) => (
    <div className="max-w-sm">
      <TemplateIOPanel {...args} />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Title still renders", async () => {
      expect(canvas.getByText(/Template & import \/ export/)).toBeInTheDocument();
    });

    await step("No buttons present", async () => {
      expect(canvas.queryAllByRole("button").length).toBe(0);
    });
  },
};

/**
 * Cancel-out file pick: open and dispatch change with no file. The handler
 * must NOT be invoked.
 */
export const FilePickCancelled: Story = {
  parameters: {
    zephyr: { testCaseId: "SW-T5299" },
  },
  args: {
    hasEntries: true,
    onImportTemplate: fn(),
  },
  render: (args) => (
    <div className="max-w-sm">
      <TemplateIOPanel {...args} />
    </div>
  ),
  play: async ({ args, canvasElement, step }) => {
    await step("Dispatch a no-file change event on the hidden input", async () => {
      const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
      expect(input).not.toBeNull();
      // Simulate cancel: change event with no files
      input!.dispatchEvent(new Event("change", { bubbles: true }));
      // Wait a tick to be safe
      await waitFor(() => expect(args.onImportTemplate).not.toHaveBeenCalled());
    });
  },
};
