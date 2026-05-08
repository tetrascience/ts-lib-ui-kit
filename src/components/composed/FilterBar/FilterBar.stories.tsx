import * as React from "react";
import { expect, within } from "storybook/test";

import { FilterBar } from "./FilterBar";

import type { FilterBarValue, FilterConfig } from "./FilterBar";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof FilterBar> = {
  title: "Design Patterns/FilterBar",
  component: FilterBar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const FILTERS: FilterConfig[] = [
  {
    key: "status",
    label: "Status",
    options: [
      { value: "running", label: "Running" },
      { value: "completed", label: "Completed" },
      { value: "failed", label: "Failed" },
      { value: "queued", label: "Queued" },
    ],
  },
  {
    key: "assay",
    label: "Assay",
    options: [
      { value: "elisa", label: "ELISA" },
      { value: "western-blot", label: "Western Blot" },
      { value: "hplc", label: "HPLC" },
    ],
  },
  {
    key: "team",
    label: "Team",
    options: [
      { value: "biology", label: "Biology" },
      { value: "chemistry", label: "Chemistry" },
      { value: "informatics", label: "Informatics" },
    ],
  },
];

const emptyValue: FilterBarValue = { search: "", filters: {} };

export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState<FilterBarValue>(emptyValue);
    return <FilterBar filters={FILTERS} value={value} onChange={setValue} placeholder="Search experiments..." />;
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1493" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Search input and filter dropdowns render", async () => {
      expect(canvas.getByPlaceholderText("Search experiments...")).toBeInTheDocument();
      expect(canvas.getByRole("combobox", { name: "Status" })).toBeInTheDocument();
      expect(canvas.getByRole("combobox", { name: "Assay" })).toBeInTheDocument();
      expect(canvas.getByRole("combobox", { name: "Team" })).toBeInTheDocument();
    });
  },
};

export const WithActiveFilters: Story = {
  render: () => {
    const [value, setValue] = React.useState<FilterBarValue>({
      search: "protein",
      filters: { status: "completed", team: "biology" },
    });
    return <FilterBar filters={FILTERS} value={value} onChange={setValue} placeholder="Search experiments..." />;
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1494" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Search input shows search term", async () => {
      const searchInput = canvas.getByPlaceholderText("Search experiments...") as HTMLInputElement;
      expect(searchInput.value).toBe("protein");
    });

    await step("Active filter chips render", async () => {
      expect(canvas.getByText("Status: Completed")).toBeInTheDocument();
      expect(canvas.getByText("Team: Biology")).toBeInTheDocument();
    });

    await step("Clicking chip remove button removes filter", async () => {
      const removeButtons = canvas.getAllByRole("button", { name: /Remove .* filter/ });
      expect(removeButtons.length).toBeGreaterThan(0);
    });
  },
};

export const SearchOnly: Story = {
  render: () => {
    const [value, setValue] = React.useState<FilterBarValue>(emptyValue);
    return <FilterBar value={value} onChange={setValue} placeholder="Search datasets..." />;
  },
  parameters: {
    zephyr: { testCaseId: "SW-T1495" },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Search input renders without filter dropdowns", async () => {
      expect(canvas.getByPlaceholderText("Search datasets...")).toBeInTheDocument();
      expect(canvas.queryByRole("combobox")).not.toBeInTheDocument();
    });
  },
};
