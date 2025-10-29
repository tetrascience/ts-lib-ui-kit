import { Meta, StoryObj } from "@storybook/react";
import { ThemeProvider } from "../../../theme";

import Card from "./Card";

const meta: Meta<typeof Card> = {
  title: "Atoms/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["small", "medium", "large"],
    },
    variant: {
      control: "select",
      options: ["default", "outlined", "elevated"],
    },
    fullWidth: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: "Card content",
    title: "Card Title",
    size: "medium",
    variant: "default",
  },
};

export const Outlined: Story = {
  args: {
    children: "Card content with outlined variant",
    title: "Outlined Card",
    size: "medium",
    variant: "outlined",
  },
};

export const Elevated: Story = {
  args: {
    children: "Card content with elevated variant",
    title: "Elevated Card",
    size: "medium",
    variant: "elevated",
  },
};

export const Small: Story = {
  args: {
    children: "Small card content",
    title: "Small Card",
    size: "small",
    variant: "default",
  },
};

export const Large: Story = {
  args: {
    children: "Large card content",
    title: "Large Card",
    size: "large",
    variant: "default",
  },
};

export const NoTitle: Story = {
  args: {
    children: "Card with no title",
    size: "medium",
    variant: "default",
  },
};

export const FullWidth: Story = {
  args: {
    children: "This card will take full width of its container",
    title: "Full Width Card",
    size: "medium",
    variant: "default",
    fullWidth: true,
  },
  parameters: {
    layout: "padded",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "400px",
      }}
    >
      <Card title="Default Card" variant="default">
        Default variant content
      </Card>
      <Card title="Outlined Card" variant="outlined">
        Outlined variant content
      </Card>
      <Card title="Elevated Card" variant="elevated">
        Elevated variant content
      </Card>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "400px",
      }}
    >
      <Card title="Small Card" size="small">
        Small size content
      </Card>
      <Card title="Medium Card" size="medium">
        Medium size content
      </Card>
      <Card title="Large Card" size="large">
        Large size content
      </Card>
    </div>
  ),
};

// Theme examples
export const WithCustomBorder: Story = {
  args: {
    children: "Card with custom border color",
    title: "Custom Border Card",
    variant: "outlined",
  },
  decorators: [
    (Story) => (
      <ThemeProvider
        theme={{
          colors: {
            cardBorder: "#DC2626",
          },
        }}
      >
        <Story />
      </ThemeProvider>
    ),
  ],
};

export const WithCustomBackground: Story = {
  args: {
    children: "Card with custom background",
    title: "Custom Background Card",
  },
  decorators: [
    (Story) => (
      <ThemeProvider
        theme={{
          colors: {
            cardBackground: "#FEF3C7",
            cardBorder: "#F59E0B",
          },
        }}
      >
        <Story />
      </ThemeProvider>
    ),
  ],
};

export const WithSharpCorners: Story = {
  args: {
    children: "Card with sharp corners",
    title: "Sharp Corners Card",
  },
  decorators: [
    (Story) => (
      <ThemeProvider
        theme={{
          radius: {
            large: "4px",
          },
        }}
      >
        <Story />
      </ThemeProvider>
    ),
  ],
};

export const WithFullTheme: Story = {
  args: {
    children: "Fully themed card with purple background and rounded corners",
    title: "Themed Card",
  },
  decorators: [
    (Story) => (
      <ThemeProvider
        theme={{
          colors: {
            cardBackground: "#F3E8FF",
            cardBorder: "#9333EA",
          },
          radius: {
            large: "24px",
          },
        }}
      >
        <Story />
      </ThemeProvider>
    ),
  ],
};
