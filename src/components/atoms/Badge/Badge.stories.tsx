import { Icon, IconName } from "@atoms/Icon";
import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Atoms/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    children: { control: "text" },
    size: {
      control: { type: "select" },
      options: ["small", "medium"],
    },
    variant: {
      control: { type: "select" },
      options: ["default", "primary"],
    },
    disabled: { control: "boolean" },
    iconLeft: { control: "boolean" },
    iconRight: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  name: "[SW-T717] Default",
  args: {
    children: "Badge",
    variant: "default",
    size: "medium",
  },
};

export const Primary: Story = {
  name: "[SW-T718] Primary",
  args: {
    children: "Badge",
    variant: "primary",
    size: "medium",
  },
};

export const Small: Story = {
  name: "[SW-T719] Small",
  args: {
    children: "Badge",
    variant: "default",
    size: "small",
  },
};

export const SmallPrimary: Story = {
  name: "[SW-T720] Small Primary",
  args: {
    children: "Badge",
    variant: "primary",
    size: "small",
  },
};

export const Disabled: Story = {
  name: "[SW-T721] Disabled",
  args: {
    children: "Badge",
    variant: "default",
    size: "medium",
    disabled: true,
  },
};

export const DisabledPrimary: Story = {
  name: "[SW-T722] Disabled Primary",
  args: {
    children: "Badge",
    variant: "primary",
    size: "medium",
    disabled: true,
  },
};

export const WithLeftIcon: Story = {
  name: "[SW-T723] With Left Icon",
  args: {
    children: "Search",
    variant: "default",
    size: "medium",
    iconLeft: <Icon name={IconName.SEARCH} />,
  },
};

export const WithRightIcon: Story = {
  name: "[SW-T724] With Right Icon",
  args: {
    children: "Next",
    variant: "primary",
    size: "medium",
    iconRight: <Icon name={IconName.CLOSE} />,
  },
};

export const WithBothIcons: Story = {
  name: "[SW-T725] With Both Icons",
  args: {
    children: "Navigate",
    variant: "default",
    size: "medium",
    iconLeft: <Icon name={IconName.SEARCH} />,
    iconRight: <Icon name={IconName.CLOSE} />,
  },
};

export const AllVariants: Story = {
  name: "[SW-T726] All Variants",
  render: () => (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
      <Badge variant="default" size="medium">
        Badge
      </Badge>
      <Badge variant="primary" size="medium">
        Badge
      </Badge>
      <Badge variant="default" size="small">
        Badge
      </Badge>
      <Badge variant="primary" size="small">
        Badge
      </Badge>
      <Badge variant="default" size="medium" disabled>
        Badge
      </Badge>
      <Badge variant="primary" size="medium" disabled>
        Badge
      </Badge>
      <Badge variant="default" size="medium" iconLeft={<Icon name={IconName.SEARCH} />}>
        With Icon
      </Badge>
      <Badge variant="primary" size="medium" iconRight={<Icon name={IconName.CLOSE} />}>
        With Icon
      </Badge>
    </div>
  ),
};
