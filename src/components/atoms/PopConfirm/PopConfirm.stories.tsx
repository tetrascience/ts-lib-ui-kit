import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";
import { Button } from "@atoms/Button";
import { Icon, IconName } from "@atoms/Icon";
import PopConfirm from "./PopConfirm";

const meta: Meta<typeof PopConfirm> = {
  title: "Atoms/PopConfirm",
  component: PopConfirm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PopConfirm>;

export const Default: Story = {
  name: "[SW-T830] Default",
  args: {
    title: "Are you sure?",
    description: "This action cannot be undone.",
    okText: "Yes",
    cancelText: "No",
    onConfirm: action("confirmed"),
    onCancel: action("canceled"),
    children: <Button>Delete</Button>,
    placement: "top",
  },
};

export const WithIcon: Story = {
  name: "[SW-T831] With Icon",
  args: {
    title: "Delete this item?",
    description: "This will permanently remove the item from your list.",
    okText: "Delete",
    cancelText: "Cancel",
    onConfirm: action("confirmed"),
    onCancel: action("canceled"),
    children: (
      <Button variant="tertiary" size="small" leftIcon={<Icon name={IconName.TRASH} width="16px" height="16px" />}>
        Delete
      </Button>
    ),
    placement: "left",
  },
};

export const ConfirmDelete: Story = {
  name: "[SW-T832] Confirm Delete",
  args: {
    title: "Are you sure to delete this input?",
    description: "Doing so will remove the connected edges as well.",
    okText: "Delete",
    cancelText: "Keep",
    onConfirm: action("confirmed"),
    onCancel: action("canceled"),
    placement: "left",
    children: (
      <Button variant="tertiary" size="small" leftIcon={<Icon name={IconName.TRASH} />} aria-label="Remove item">
        {""}
      </Button>
    ),
  },
};

export const CustomButtons: Story = {
  name: "[SW-T833] Custom Buttons",
  args: {
    title: "Are you sure?",
    description: "This will permanently delete this record.",
    okText: "Yes, delete it",
    cancelText: "No, keep it",
    onConfirm: action("confirmed"),
    onCancel: action("canceled"),
    children: <Button>Delete Record</Button>,
    placement: "bottom",
    okButtonProps: {
      style: { backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" },
    },
    cancelButtonProps: {
      style: { fontWeight: 400 },
    },
  },
};

export const BottomRight: Story = {
  name: "[SW-T834] Bottom Right",
  args: {
    title: "Are you sure?",
    description: "This action cannot be undone.",
    okText: "Yes",
    cancelText: "No",
    onConfirm: action("confirmed"),
    onCancel: action("canceled"),
    children: <Button>Delete</Button>,
    placement: "bottomRight",
  },
};
