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
  args: {
    placeholder: "Placeholder",
  },
};

export const Small: Story = {
  args: {
    placeholder: "Placeholder",
    size: "small",
  },
};

export const XSmall: Story = {
  args: {
    placeholder: "Placeholder",
    size: "xsmall",
  },
};

export const WithLeftIcon: Story = {
  args: {
    placeholder: "Placeholder",
    iconLeft: <Icon name={IconName.SEARCH} />,
  },
};

export const WithRightIcon: Story = {
  args: {
    placeholder: "Placeholder",
    iconRight: <Icon name={IconName.CHEVRON_DOWN} />,
  },
};

export const WithBothIcons: Story = {
  args: {
    placeholder: "Placeholder",
    iconLeft: <Icon name={IconName.SEARCH} />,
    iconRight: <Icon name={IconName.CHEVRON_DOWN} />,
  },
};

export const Error: Story = {
  args: {
    placeholder: "Placeholder",
    error: true,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Placeholder",
    disabled: true,
  },
};

export const AllVariations: Story = {
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
      <Input
        placeholder="With left icon"
        iconLeft={<Icon name={IconName.SEARCH} />}
      />
      <Input
        placeholder="With right icon"
        iconRight={<Icon name={IconName.CHEVRON_DOWN} />}
      />
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
