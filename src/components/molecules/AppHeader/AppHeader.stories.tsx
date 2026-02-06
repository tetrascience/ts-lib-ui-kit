import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import AppHeader from "./AppHeader";

const meta: Meta<typeof AppHeader> = {
  title: "Molecules/AppHeader",
  component: AppHeader,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AppHeader>;

// Default example
export const Default: Story = {
  name: "[SW-T871] Default",
  args: {
    hostname: "localhost:3000",
    userProfile: {
      name: "Chris Calo",
    },
  },
};

// With avatar
export const WithAvatar: Story = {
  name: "[SW-T872] With Avatar",
  args: {
    hostname: "localhost:3000",
    userProfile: {
      name: "Chris Calo",
      avatar: "https://i.pravatar.cc/300",
    },
  },
};

// Interactive example with action logging
const InteractiveDemo = () => {
  const [clickedAction, setClickedAction] = React.useState<string | null>(null);

  const handleHomeClick = () => {
    setClickedAction("Home icon clicked");
    setTimeout(() => setClickedAction(null), 2000);
  };

  const handleSettingsClick = () => {
    setClickedAction("Settings icon clicked");
    setTimeout(() => setClickedAction(null), 2000);
  };

  const handleProfileClick = () => {
    setClickedAction("User profile clicked");
    setTimeout(() => setClickedAction(null), 2000);
  };

  return (
    <div style={{ width: "100vw" }}>
      <AppHeader
        hostname="app.example.com"
        userProfile={{
          name: "Chris Calo",
          avatar: "https://i.pravatar.cc/300",
        }}
        onHomeClick={handleHomeClick}
        onSettingsClick={handleSettingsClick}
        onUserProfileClick={handleProfileClick}
      />

      {clickedAction && (
        <div
          style={{
            padding: "12px 16px",
            marginTop: "16px",
            backgroundColor: "#f0f9ff",
            border: "1px solid #deebff",
            borderRadius: "4px",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
          }}
        >
          {clickedAction}
        </div>
      )}

      <div
        style={{
          padding: "16px",
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          marginTop: "32px",
          color: "#6a737d",
        }}
      >
        <p>Click on any of the buttons above to see the interactions.</p>
      </div>
    </div>
  );
};

export const Interactive: Story = {
  name: "[SW-T873] Interactive",
  render: () => <InteractiveDemo />,
};
