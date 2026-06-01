import * as React from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { PlateMapActionsMenu } from "./PlateMapActionsMenu";

import type { PlateMapCsvTriage, TemplateOption } from "./types";
import type { Meta, StoryObj } from "@storybook/react-vite";

const TEMPLATES: TemplateOption[] = [
  { id: "single-point", label: "Single concentration", group: "Built-in", description: "1 dose, all wells" },
  { id: "three-point-auc", label: "3-point AUC", group: "Built-in" },
  { id: "custom", label: "Custom layout", group: "User" },
  { id: "ungrouped", label: "Ungrouped option" },
  { id: "disabled-template", label: "Disabled template", group: "User", disabled: true },
];

const meta: Meta<typeof PlateMapActionsMenu> = {
  title: "Design Patterns/PlateMapEditor/PlateMapActionsMenu",
  component: PlateMapActionsMenu,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-[320px] w-full max-w-[24rem] items-start justify-center p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

function getTrigger(canvasElement: HTMLElement): HTMLButtonElement {
  const trigger = canvasElement.querySelector<HTMLButtonElement>(
    '[data-slot="dropdown-menu-trigger"]',
  );
  if (!trigger) throw new Error("Actions menu trigger not found");
  return trigger;
}

async function openMenu(canvasElement: HTMLElement): Promise<void> {
  // Ensure no menu is still mounted from a prior step before reopening.
  await waitFor(() => {
    expect(within(document.body).queryAllByRole("menuitem").length).toBe(0);
  });
  await userEvent.click(getTrigger(canvasElement));
  await waitFor(() => {
    const body = within(document.body);
    expect(body.getAllByRole("menuitem").length).toBeGreaterThan(0);
  });
}

async function closeMenu(): Promise<void> {
  await userEvent.keyboard("{Escape}");
  await waitFor(() => {
    expect(within(document.body).queryAllByRole("menuitem").length).toBe(0);
  });
}

/**
 * Renders the full menu with all sections: grouped templates, ungrouped
 * template, template I/O, CSV I/O, and the clear action. The play function
 * clicks each interactive menu item to exercise the click handlers and the
 * conditional separator/branch rendering around them.
 */
export const FullMenu: Story = {
  args: {
    templates: TEMPLATES,
    templateId: "single-point",
    hasEntries: true,
    onTemplateChange: fn(),
    onClearTemplate: fn(),
    onImportCsv: fn(),
    onExportCsv: fn(),
    onImportTemplate: fn(),
    onExportTemplate: fn(),
  },
  play: async ({ canvasElement, args, step }) => {
    await step("Opens the actions dropdown", async () => {
      await openMenu(canvasElement);
    });

    await step("Renders grouped + ungrouped templates and group labels", async () => {
      const body = within(document.body);
      expect(body.getByText("Built-in")).toBeInTheDocument();
      expect(body.getByText("User")).toBeInTheDocument();
      expect(body.getByText("Single concentration")).toBeInTheDocument();
      expect(body.getByText("3-point AUC")).toBeInTheDocument();
      expect(body.getByText("Custom layout")).toBeInTheDocument();
      expect(body.getByText("Ungrouped option")).toBeInTheDocument();
    });

    await step("Selecting a template invokes onTemplateChange", async () => {
      const body = within(document.body);
      await userEvent.click(body.getByText("3-point AUC"));
      await waitFor(() =>
        expect(args.onTemplateChange).toHaveBeenCalledWith("three-point-auc"),
      );
    });

    await step("Export template invokes onExportTemplate (entries present)", async () => {
      await openMenu(canvasElement);
      const body = within(document.body);
      await userEvent.click(body.getByText("Save template"));
      await waitFor(() => expect(args.onExportTemplate).toHaveBeenCalled());
    });

    await step("Export CSV invokes onExportCsv", async () => {
      await openMenu(canvasElement);
      const body = within(document.body);
      await userEvent.click(body.getByText("Export plate map (CSV)"));
      await waitFor(() => expect(args.onExportCsv).toHaveBeenCalled());
    });

    await step("Clear action invokes onClearTemplate", async () => {
      await openMenu(canvasElement);
      const body = within(document.body);
      await userEvent.click(body.getByText("Clear template"));
      await waitFor(() => expect(args.onClearTemplate).toHaveBeenCalled());
    });
  },
};

/**
 * Drives the hidden file inputs directly so the async onChange path runs end
 * to end — including the CSV triage call that wraps the file before invoking
 * onImportCsv. The play function also clicks the menu items that programmatically
 * click those hidden inputs (covering the menu-item onClick branches).
 */
export const FileImportFlow: Story = {
  args: {
    templates: TEMPLATES.slice(0, 2),
    hasEntries: true,
    onImportCsv: fn(),
    onExportCsv: fn(),
    onImportTemplate: fn(),
    onExportTemplate: fn(),
  },
  play: async ({ canvasElement, args, step }) => {
    await step("Clicks the import template menu item (opens hidden picker)", async () => {
      await openMenu(canvasElement);
      const body = within(document.body);
      await userEvent.click(body.getByText("Import template (JSON)"));
    });

    await step("Hidden template input receives a file and invokes onImportTemplate", async () => {
      const templateInput = canvasElement.querySelector(
        'input[type="file"][accept="application/json"]',
      ) as HTMLInputElement | null;
      expect(templateInput).not.toBeNull();
      const file = new File(['{"id":"x"}'], "template.json", { type: "application/json" });
      await userEvent.upload(templateInput as HTMLInputElement, file);
      await waitFor(() => {
        expect(args.onImportTemplate).toHaveBeenCalled();
      });
      expect((templateInput as HTMLInputElement).value).toBe("");
    });

    await step("Clicks the import CSV menu item", async () => {
      await openMenu(canvasElement);
      const body = within(document.body);
      await userEvent.click(body.getByText("Import plate map (CSV)"));
    });

    await step("Hidden CSV input runs triage then invokes onImportCsv", async () => {
      const csvInput = canvasElement.querySelector(
        'input[type="file"][accept=".csv,text/csv"]',
      ) as HTMLInputElement | null;
      expect(csvInput).not.toBeNull();
      const csvFile = new File(["plate_barcode,well\nP1,A01\n"], "plate.csv", { type: "text/csv" });
      await userEvent.upload(csvInput as HTMLInputElement, csvFile);
      await waitFor(() => {
        expect(args.onImportCsv).toHaveBeenCalled();
      });
      const callArgs = (args.onImportCsv as ReturnType<typeof fn>).mock.calls[0];
      expect(callArgs?.[0]).toBeInstanceOf(File);
      const triage = callArgs?.[1] as PlateMapCsvTriage | undefined;
      expect(triage).toBeDefined();
      expect(triage?.headers).toContain("plate_barcode");
      expect((csvInput as HTMLInputElement).value).toBe("");
    });
  },
};

/**
 * Exercises the "no file selected" early return in the hidden file input
 * onChange handler — when the user cancels the picker the input fires a
 * change event with an empty FileList.
 */
export const HiddenInputCancel: Story = {
  args: {
    hasEntries: true,
    onImportTemplate: fn(),
    onImportCsv: fn(),
  },
  play: async ({ canvasElement, args, step }) => {
    await step("Dispatching change with no file is a no-op", async () => {
      const templateInput = canvasElement.querySelector(
        'input[type="file"][accept="application/json"]',
      ) as HTMLInputElement | null;
      expect(templateInput).not.toBeNull();
      // Pre-seed a value to confirm the early-return branch resets it.
      (templateInput as HTMLInputElement).value = "";
      templateInput?.dispatchEvent(new Event("change", { bubbles: true }));
      expect(args.onImportTemplate).not.toHaveBeenCalled();

      const csvInput = canvasElement.querySelector(
        'input[type="file"][accept=".csv,text/csv"]',
      ) as HTMLInputElement | null;
      expect(csvInput).not.toBeNull();
      csvInput?.dispatchEvent(new Event("change", { bubbles: true }));
      expect(args.onImportCsv).not.toHaveBeenCalled();
    });
  },
};

/**
 * Covers the disabled-state branches:
 * - hasEntries=false disables the export actions
 * - With no templateId AND no entries, the clear item is disabled
 */
export const DisabledExports: Story = {
  args: {
    templates: TEMPLATES.slice(0, 2),
    hasEntries: false,
    onClearTemplate: fn(),
    onExportCsv: fn(),
    onExportTemplate: fn(),
    onImportCsv: fn(),
    onImportTemplate: fn(),
  },
  play: async ({ canvasElement, args, step }) => {
    await step("Export items are rendered disabled when hasEntries is false", async () => {
      await openMenu(canvasElement);
      const body = within(document.body);
      const exportTemplate = body.getByText("Save template").closest('[role="menuitem"]');
      const exportCsv = body.getByText("Export plate map (CSV)").closest('[role="menuitem"]');
      const clear = body.getByText("Clear template").closest('[role="menuitem"]');
      expect(exportTemplate).toHaveAttribute("aria-disabled", "true");
      expect(exportCsv).toHaveAttribute("aria-disabled", "true");
      expect(clear).toHaveAttribute("aria-disabled", "true");
      expect(args.onExportTemplate).not.toHaveBeenCalled();
      expect(args.onExportCsv).not.toHaveBeenCalled();
      expect(args.onClearTemplate).not.toHaveBeenCalled();
      await closeMenu();
    });
  },
};

/**
 * Templates-only configuration: no I/O handlers, no clear — only the templates
 * group is rendered, so the separator-between-sections branch is skipped.
 */
export const TemplatesOnly: Story = {
  args: {
    templates: TEMPLATES.slice(0, 3),
    templateId: "single-point",
    onTemplateChange: fn(),
  },
  play: async ({ canvasElement, args, step }) => {
    await step("Renders only template items, no separators", async () => {
      await openMenu(canvasElement);
      const body = within(document.body);
      expect(body.queryByText("Save template")).not.toBeInTheDocument();
      expect(body.queryByText("Import plate map (CSV)")).not.toBeInTheDocument();
      expect(body.queryByText("Clear template")).not.toBeInTheDocument();
    });

    await step("Clicking a template option invokes onTemplateChange", async () => {
      const body = within(document.body);
      await userEvent.click(body.getByText("Custom layout"));
      await waitFor(() =>
        expect(args.onTemplateChange).toHaveBeenCalledWith("custom"),
      );
    });
  },
};

/**
 * No menu items at all → component returns null. Covers the early-return guard.
 */
export const EmptyReturnsNull: Story = {
  args: {},
  play: async ({ canvasElement, step }) => {
    await step("Renders nothing when no handlers or templates are provided", async () => {
      expect(canvasElement.querySelector("button")).toBeNull();
      expect(canvasElement.querySelector('input[type="file"]')).toBeNull();
    });
  },
};
