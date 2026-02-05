import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { TableHeaderCell } from "./TableHeaderCell";

const meta: Meta<typeof TableHeaderCell> = {
  title: "Atoms/TableHeaderCell",
  component: TableHeaderCell,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    sortDirection: {
      control: { type: "select" },
      options: [null, "asc", "desc"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TableHeaderCell>;

export const Default: Story = {
  render: (args) => (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          <TableHeaderCell {...args}>Header</TableHeaderCell>
        </tr>
      </thead>
    </table>
  ),
  args: {
    children: "Header",
  },
};

function SortableDemo() {
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  const handleSort = () => {
    if (sortDirection === null) {
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      setSortDirection("desc");
    } else {
      setSortDirection(null);
    }
  };

  return (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          <TableHeaderCell sortable sortDirection={sortDirection} onSort={handleSort}>
            Sortable Header (Click me!)
          </TableHeaderCell>
        </tr>
      </thead>
    </table>
  );
}

export const Sortable: Story = {
  render: () => <SortableDemo />,
};

function WithDropdownDemo() {
  const [value, setValue] = useState("");

  return (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          <TableHeaderCell
            filterable
            filterOptions={[
              { value: "option1", label: "Option 1" },
              { value: "option2", label: "Option 2" },
              { value: "option3", label: "Option 3" },
            ]}
            filterValue={value}
            onFilterChange={setValue}
            width="200px"
          />
        </tr>
      </thead>
    </table>
  );
}

export const WithDropdown: Story = {
  render: () => <WithDropdownDemo />,
};

function MultipleHeadersDemo() {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortKey(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  return (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          <TableHeaderCell width="80px" />
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell
            sortable
            sortDirection={sortKey === "date" ? sortDirection : null}
            onSort={() => handleSort("date")}
          >
            Date
          </TableHeaderCell>
          <TableHeaderCell
            sortable
            sortDirection={sortKey === "count" ? sortDirection : null}
            onSort={() => handleSort("count")}
          >
            Count
          </TableHeaderCell>
          <TableHeaderCell>Description</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </tr>
      </thead>
    </table>
  );
}

export const MultipleHeaders: Story = {
  render: () => <MultipleHeadersDemo />,
};

function MixedHeadersWithDropdownsDemo() {
  const [filter1, setFilter1] = useState("");
  const [filter2, setFilter2] = useState("");

  return (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          <TableHeaderCell width="80px" />
          <TableHeaderCell
            filterable
            filterOptions={[
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
            filterValue={filter1}
            onFilterChange={setFilter1}
          />
          <TableHeaderCell
            filterable
            filterOptions={[
              { value: "all", label: "All Types" },
              { value: "type1", label: "Type 1" },
              { value: "type2", label: "Type 2" },
            ]}
            filterValue={filter2}
            onFilterChange={setFilter2}
          />
          <TableHeaderCell>Label</TableHeaderCell>
          <TableHeaderCell>Label</TableHeaderCell>
          <TableHeaderCell>Label</TableHeaderCell>
        </tr>
      </thead>
    </table>
  );
}

export const MixedHeadersWithDropdowns: Story = {
  render: () => <MixedHeadersWithDropdownsDemo />,
};
