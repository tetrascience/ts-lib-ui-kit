import { Icon, IconName } from "@atoms/Icon";
import type { Meta, StoryObj } from "@storybook/react";
import { ThemeProvider } from "../../../theme";

import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "tertiary"],
    },
    size: {
      control: { type: "select" },
      options: ["small", "medium"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Basic examples
export const Primary: Story = {
  args: {
    children: "Primary Button",
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary Button",
    variant: "secondary",
  },
};

export const Tertiary: Story = {
  args: {
    children: "Tertiary Button",
    variant: "tertiary",
  },
};

// Size examples
export const Small: Story = {
  args: {
    children: "Small Button",
    size: "small",
  },
};

export const Medium: Story = {
  args: {
    children: "Medium Button",
    size: "medium",
  },
};

// State examples
export const Disabled: Story = {
  args: {
    children: "Disabled Button",
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    children: "Loading Button",
    loading: true,
  },
};

// With icons
export const WithLeftIcon: Story = {
  args: {
    children: "Search",
    leftIcon: <Icon name={IconName.SEARCH} />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: "Next",
    rightIcon: <Icon name={IconName.CHEVRON_DOWN} />,
  },
};

export const WithBothIcons: Story = {
  args: {
    children: "Search and Continue",
    leftIcon: <Icon name={IconName.SEARCH} />,
    rightIcon: <Icon name={IconName.CHEVRON_DOWN} />,
  },
};

// Icon only button
export const IconOnly: Story = {
  args: {
    leftIcon: <Icon name={IconName.SEARCH} />,
    "aria-label": "Search",
  },
};

export const FullWidth: Story = {
  args: {
    children: "Full Width Button",
    fullWidth: true,
  },
};

// Theme examples
export const WithRedTheme: Story = {
  args: {
    children: "Red Theme Button",
    variant: "primary",
  },
  decorators: [
    (Story) => (
      <ThemeProvider
        theme={{
          colors: {
            primary: "#DC2626",
            primaryHover: "#B91C1C",
            primaryActive: "#991B1B",
          },
        }}
      >
        <Story />
      </ThemeProvider>
    ),
  ],
};

export const WithPurpleTheme: Story = {
  args: {
    children: "Purple Theme Button",
    variant: "primary",
  },
  decorators: [
    (Story) => (
      <ThemeProvider
        theme={{
          colors: {
            primary: "#9333EA",
            primaryHover: "#7E22CE",
            primaryActive: "#6B21A8",
          },
        }}
      >
        <Story />
      </ThemeProvider>
    ),
  ],
};

export const WithCustomRadius: Story = {
  args: {
    children: "Sharp Corners Button",
    variant: "primary",
  },
  decorators: [
    (Story) => (
      <ThemeProvider
        theme={{
          radius: {
            medium: "4px",
          },
        }}
      >
        <Story />
      </ThemeProvider>
    ),
  ],
};

export const WithFullCustomTheme: Story = {
  args: {
    children: "Fully Custom Button",
    variant: "primary",
  },
  decorators: [
    (Story) => (
      <ThemeProvider
        theme={{
          colors: {
            primary: "#F59E0B",
            primaryHover: "#D97706",
            primaryActive: "#B45309",
          },
          radius: {
            medium: "20px",
          },
        }}
      >
        <Story />
      </ThemeProvider>
    ),
  ],
};
