import type { Meta, StoryObj } from "@storybook/react";
import { TableCell } from "./TableCell";

const meta: Meta<typeof TableCell> = {
  title: "Atoms/TableCell",
  component: TableCell,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    align: {
      control: { type: "select" },
      options: ["left", "center", "right"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TableCell>;

export const Default: Story = {
  name: "[SW-T843] Default",
  render: (args) => (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <tbody>
        <tr>
          <TableCell {...args}>Label</TableCell>
        </tr>
      </tbody>
    </table>
  ),
  args: {
    children: "Label",
  },
};

export const Alignments: Story = {
  name: "[SW-T844] Alignments",
  render: () => (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <tbody>
        <tr>
          <TableCell align="left">Left Aligned</TableCell>
          <TableCell align="center">Center Aligned</TableCell>
          <TableCell align="right">Right Aligned</TableCell>
        </tr>
      </tbody>
    </table>
  ),
};

export const WithDifferentWidths: Story = {
  name: "[SW-T845] With Different Widths",
  render: () => (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <tbody>
        <tr>
          <TableCell width="100px">Fixed 100px</TableCell>
          <TableCell width="200px">Fixed 200px</TableCell>
          <TableCell>Auto Width</TableCell>
        </tr>
      </tbody>
    </table>
  ),
};

export const MultipleRows: Story = {
  name: "[SW-T846] Multiple Rows",
  render: () => (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <tbody>
        <tr>
          <TableCell>Row 1, Cell 1</TableCell>
          <TableCell>Row 1, Cell 2</TableCell>
          <TableCell>Row 1, Cell 3</TableCell>
        </tr>
        <tr>
          <TableCell>Row 2, Cell 1</TableCell>
          <TableCell>Row 2, Cell 2</TableCell>
          <TableCell>Row 2, Cell 3</TableCell>
        </tr>
        <tr>
          <TableCell>Row 3, Cell 1</TableCell>
          <TableCell>Row 3, Cell 2</TableCell>
          <TableCell>Row 3, Cell 3</TableCell>
        </tr>
      </tbody>
    </table>
  ),
};
