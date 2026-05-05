import * as React from "react";

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
};

export const WithActiveFilters: Story = {
  render: () => {
    const [value, setValue] = React.useState<FilterBarValue>({
      search: "protein",
      filters: { status: "completed", team: "biology" },
    });
    return <FilterBar filters={FILTERS} value={value} onChange={setValue} placeholder="Search experiments..." />;
  },
};

export const SearchOnly: Story = {
  render: () => {
    const [value, setValue] = React.useState<FilterBarValue>(emptyValue);
    return <FilterBar value={value} onChange={setValue} placeholder="Search datasets..." />;
  },
};
