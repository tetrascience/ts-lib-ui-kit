import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { PlateMapPlateSelector } from "./PlateMapPlateSelector";

import type { PlateMapPlateOption } from "./types";
import type { Meta, StoryObj } from "@storybook/react-vite";

const BASE_PLATES: PlateMapPlateOption[] = [
  { id: "PLATE-001", barcode: "PLATE-001", label: "Plate One", count: 12 },
  { id: "PLATE-002", barcode: "PLATE-002", label: "Plate Two", count: 24 },
  { id: "PLATE-003", barcode: "PLATE-003", count: 6 },
];

function StatefulSelector({
  initialPlates,
  variant,
  enableAdd = true,
  enableRemove = true,
  enableChange = true,
}: {
  initialPlates: PlateMapPlateOption[];
  variant: "dropdown" | "tabs";
  enableAdd?: boolean;
  enableRemove?: boolean;
  enableChange?: boolean;
}) {
  const [plates, setPlates] = React.useState<PlateMapPlateOption[]>(initialPlates);
  const [activeId, setActiveId] = React.useState<string | undefined>(initialPlates[0]?.id);

  const handleAdd = () => {
    const nextIndex = plates.length + 1;
    const id = `PLATE-NEW-${nextIndex}`;
    const next: PlateMapPlateOption = { id, barcode: id, label: id, count: 0 };
    setPlates((prev) => [...prev, next]);
    setActiveId(id);
  };

  const handleRemove = (plateId: string) => {
    setPlates((prev) => prev.filter((plate) => plate.id !== plateId));
    setActiveId((current) => (current === plateId ? undefined : current));
  };

  return (
    <div className="p-4">
      <PlateMapPlateSelector
        plates={plates}
        activePlateId={activeId}
        variant={variant}
        onPlateChange={enableChange ? setActiveId : undefined}
        onAddPlate={enableAdd ? handleAdd : undefined}
        onRemovePlate={enableRemove ? handleRemove : undefined}
      />
    </div>
  );
}

const meta: Meta<typeof PlateMapPlateSelector> = {
  title: "Patterns/PlateMapEditor/PlateMapPlateSelector",
  component: PlateMapPlateSelector,
  parameters: { layout: "padded" },
};

export default meta;

type Story = StoryObj<typeof PlateMapPlateSelector>;

export const DropdownDefault: Story = {
  name: "Dropdown: select a plate",
  render: () => <StatefulSelector initialPlates={BASE_PLATES} variant="dropdown" />,
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await step("Renders dropdown trigger with the first plate label", async () => {
      const trigger = canvas.getByRole("button", { name: "Plate" });
      expect(trigger).toBeInTheDocument();
    });

    await step("Open the dropdown menu", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Plate" }));
      await waitFor(() => expect(body.getByRole("menu")).toBeInTheDocument());
    });

    await step("Each plate item is shown with its well count", async () => {
      expect(body.getByText("12 wells")).toBeInTheDocument();
      expect(body.getByText("24 wells")).toBeInTheDocument();
      expect(body.getByText("6 wells")).toBeInTheDocument();
    });

    await step("Select the second plate from the menu", async () => {
      const items = body.getAllByRole("menuitem");
      await userEvent.click(items[1]);
      await waitFor(() => expect(body.queryByRole("menu")).toBeNull());
    });

    await step("Reopen the dropdown and trigger the Add Plate footer item", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Plate" }));
      const addItem = await body.findByRole("menuitem", { name: /Add Plate/i });
      await userEvent.click(addItem);
      await waitFor(() => expect(body.queryByRole("menu")).toBeNull());
    });

    await step("Reopen the dropdown and confirm the newly added plate appears", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Plate" }));
      await waitFor(() => expect(body.getByRole("menu")).toBeInTheDocument());
      await waitFor(() => {
        const matches = body.queryAllByText("PLATE-NEW-4");
        expect(matches.length).toBeGreaterThan(0);
      });
    });
  },
};

export const DropdownEmpty: Story = {
  name: "Dropdown: empty state add",
  render: () => <StatefulSelector initialPlates={[]} variant="dropdown" />,
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Empty state shows the Add Plate button", async () => {
      expect(canvas.getByRole("button", { name: "Add Plate" })).toBeInTheDocument();
    });

    await step("Clicking Add Plate adds a plate and switches to dropdown trigger", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Add Plate" }));
      await waitFor(() => expect(canvas.getByRole("button", { name: "Plate" })).toBeInTheDocument());
    });
  },
};

export const DropdownEmptyDisabled: Story = {
  name: "Dropdown: empty without onAddPlate is disabled",
  render: () => (
    <div className="p-4">
      <PlateMapPlateSelector plates={[]} variant="dropdown" />
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Add Plate button renders but is disabled", async () => {
      const button = canvas.getByRole("button", { name: "Add Plate" }) as HTMLButtonElement;
      expect(button.disabled).toBe(true);
    });
  },
};

export const TabsAddAndRemove: Story = {
  name: "Tabs: add + remove + select",
  render: () => <StatefulSelector initialPlates={BASE_PLATES} variant="tabs" />,
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Renders one tab per plate with counts in badges", async () => {
      expect(canvas.getByLabelText("Plate One")).toBeInTheDocument();
      expect(canvas.getByLabelText("Plate Two")).toBeInTheDocument();
      expect(canvas.getByLabelText("PLATE-003")).toBeInTheDocument();
    });

    await step("Click the second plate to activate it", async () => {
      const secondTab = canvas.getByLabelText("Plate Two");
      await userEvent.click(secondTab);
      await waitFor(() => expect(secondTab.getAttribute("data-state")).toBe("on"));
    });

    await step("Click the + button to add a new plate", async () => {
      await userEvent.click(canvas.getByLabelText("Add Plate"));
      await waitFor(() => expect(canvas.getByLabelText("PLATE-NEW-4")).toBeInTheDocument());
    });

    await step("Remove the newly added plate via its X button", async () => {
      const removeBtn = canvas.getByLabelText("Remove plate PLATE-NEW-4");
      await userEvent.click(removeBtn);
      await waitFor(() => expect(canvas.queryByLabelText("PLATE-NEW-4")).toBeNull());
    });

    await step("Remove another plate to confirm remove flow with labelled plate", async () => {
      const removeBtn = canvas.getByLabelText("Remove plate Plate Two");
      await userEvent.click(removeBtn);
      await waitFor(() => expect(canvas.queryByLabelText("Plate Two")).toBeNull());
    });
  },
};

export const TabsSinglePlateNoRemove: Story = {
  name: "Tabs: single plate hides remove",
  render: () => (
    <StatefulSelector
      initialPlates={[{ id: "ONLY", barcode: "ONLY", label: "Only Plate", count: 4 }]}
      variant="tabs"
    />
  ),
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Single tab present without a remove button", async () => {
      expect(canvas.getByLabelText("Only Plate")).toBeInTheDocument();
      expect(canvas.queryByLabelText("Remove plate Only Plate")).toBeNull();
    });
  },
};

export const TabsReadOnly: Story = {
  name: "Tabs: read-only (no change/add/remove)",
  render: () => (
    <div className="p-4">
      <PlateMapPlateSelector plates={BASE_PLATES} activePlateId="PLATE-002" variant="tabs" />
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Tabs render but are disabled because no onPlateChange is supplied", async () => {
      const tab = canvas.getByLabelText("Plate Two") as HTMLButtonElement;
      expect(tab.disabled).toBe(true);
    });

    await step("No Add Plate or Remove plate affordances are rendered", async () => {
      expect(canvas.queryByLabelText("Add Plate")).toBeNull();
      expect(canvas.queryByLabelText(/Remove plate/)).toBeNull();
    });
  },
};

export const DropdownNoAddNoChange: Story = {
  name: "Dropdown: read-only menu without add affordance",
  render: () => (
    <div className="p-4">
      <PlateMapPlateSelector plates={BASE_PLATES} activePlateId="PLATE-001" variant="dropdown" />
    </div>
  ),
  parameters: {
    zephyr: { testCaseId: "" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await step("Open the dropdown menu", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Plate" }));
      await waitFor(() => expect(body.getByRole("menu")).toBeInTheDocument());
    });

    await step("Add Plate footer item is absent", async () => {
      expect(body.queryByRole("menuitem", { name: /Add Plate/i })).toBeNull();
    });

    await step("Menu items are all disabled because onPlateChange is not provided", async () => {
      const items = body.getAllByRole("menuitem");
      for (const item of items) {
        expect(item.getAttribute("data-disabled")).not.toBeNull();
      }
    });
  },
};
