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
  name: "[SW-T727] Primary",
  args: {
    children: "Primary Button",
    variant: "primary",
  },
};

export const Secondary: Story = {
  name: "[SW-T728] Secondary",
  args: {
    children: "Secondary Button",
    variant: "secondary",
  },
};

export const Tertiary: Story = {
  name: "[SW-T729] Tertiary",
  args: {
    children: "Tertiary Button",
    variant: "tertiary",
  },
};

// Size examples
export const Small: Story = {
  name: "[SW-T730] Small",
  args: {
    children: "Small Button",
    size: "small",
  },
};

export const Medium: Story = {
  name: "[SW-T731] Medium",
  args: {
    children: "Medium Button",
    size: "medium",
  },
};

// State examples
export const Disabled: Story = {
  name: "[SW-T732] Disabled",
  args: {
    children: "Disabled Button",
    disabled: true,
  },
};

export const Loading: Story = {
  name: "[SW-T733] Loading",
  args: {
    children: "Loading Button",
    loading: true,
  },
};

// With icons
export const WithLeftIcon: Story = {
  name: "[SW-T734] With Left Icon",
  args: {
    children: "Search",
    leftIcon: <Icon name={IconName.SEARCH} />,
  },
};

export const WithRightIcon: Story = {
  name: "[SW-T735] With Right Icon",
  args: {
    children: "Next",
    rightIcon: <Icon name={IconName.CHEVRON_DOWN} />,
  },
};

export const WithBothIcons: Story = {
  name: "[SW-T736] With Both Icons",
  args: {
    children: "Search and Continue",
    leftIcon: <Icon name={IconName.SEARCH} />,
    rightIcon: <Icon name={IconName.CHEVRON_DOWN} />,
  },
};

// Icon only button
export const IconOnly: Story = {
  name: "[SW-T737] Icon Only",
  args: {
    leftIcon: <Icon name={IconName.SEARCH} />,
    "aria-label": "Search",
  },
};

export const FullWidth: Story = {
  name: "[SW-T738] Full Width",
  args: {
    children: "Full Width Button",
    fullWidth: true,
  },
};

// Theme examples
export const WithRedTheme: Story = {
  name: "[SW-T739] With Red Theme",
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
  name: "[SW-T740] With Purple Theme",
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
  name: "[SW-T741] With Custom Radius",
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
  name: "[SW-T742] With Full Custom Theme",
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
