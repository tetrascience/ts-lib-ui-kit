import { Meta, StoryObj } from "@storybook/react";
import { Icon, IconName } from "@atoms/Icon";
import { Input } from "@atoms/Input";

const meta: Meta<typeof Input> = {
  title: "Atoms/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["xsmall", "small"],
    },
    error: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  name: "[SW-T799] Default",
  args: {
    placeholder: "Placeholder",
  },
};

export const Small: Story = {
  name: "[SW-T800] Small",
  args: {
    placeholder: "Placeholder",
    size: "small",
  },
};

export const XSmall: Story = {
  name: "[SW-T801] X Small",
  args: {
    placeholder: "Placeholder",
    size: "xsmall",
  },
};

export const WithLeftIcon: Story = {
  name: "[SW-T802] With Left Icon",
  args: {
    placeholder: "Placeholder",
    iconLeft: <Icon name={IconName.SEARCH} />,
  },
};

export const WithRightIcon: Story = {
  name: "[SW-T803] With Right Icon",
  args: {
    placeholder: "Placeholder",
    iconRight: <Icon name={IconName.CHEVRON_DOWN} />,
  },
};

export const WithBothIcons: Story = {
  name: "[SW-T804] With Both Icons",
  args: {
    placeholder: "Placeholder",
    iconLeft: <Icon name={IconName.SEARCH} />,
    iconRight: <Icon name={IconName.CHEVRON_DOWN} />,
  },
};

export const Error: Story = {
  name: "[SW-T805] Error",
  args: {
    placeholder: "Placeholder",
    error: true,
  },
};

export const Disabled: Story = {
  name: "[SW-T806] Disabled",
  args: {
    placeholder: "Placeholder",
    disabled: true,
  },
};

export const AllVariations: Story = {
  name: "[SW-T807] All Variations",
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        maxWidth: "300px",
      }}
    >
      <Input placeholder="Default" />
      <Input placeholder="Small" size="small" />
      <Input placeholder="XSmall" size="xsmall" />
      <Input placeholder="With left icon" iconLeft={<Icon name={IconName.SEARCH} />} />
      <Input placeholder="With right icon" iconRight={<Icon name={IconName.CHEVRON_DOWN} />} />
      <Input
        placeholder="With both icons"
        iconLeft={<Icon name={IconName.SEARCH} />}
        iconRight={<Icon name={IconName.CHEVRON_DOWN} />}
      />
      <Input placeholder="Error state" error />
      <Input placeholder="Disabled state" disabled />
    </div>
  ),
};
