import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { LineGraph } from "../LineGraph";
import { AppLayout } from "./AppLayout";

const meta = {
  title: "Organisms/AppLayout",
  component: AppLayout,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    userProfile: {
      name: "John Doe",
      avatar: "https://via.placeholder.com/40x40",
    },
    hostname: "demo.tetrascience.com",
    organization: {
      name: "TetraScience",
      subtext: "Demo Organization",
    },
  },
} satisfies Meta<typeof AppLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <LineGraph
        dataSeries={[
          {
            name: "Data A",
            color: "#FF6B35",
            x: [200, 300, 400, 500, 600, 700, 800, 900, 1000],
            y: [75, 140, 105, 120, 145, 115, 110, 80, 90],
          },
          {
            name: "Data B",
            color: "#FF471A",
            x: [200, 300, 400, 500, 600, 700, 800, 900, 1000],
            y: [125, 160, 115, 145, 190, 180, 120, 105, 110],
          },
          {
            name: "Data C",
            color: "#008000",
            x: [200, 300, 400, 500, 600, 700, 800, 900, 1000],
            y: [185, 195, 145, 215, 205, 200, 160, 145, 135],
          },
          {
            name: "Data D",
            color: "#0000FF",
            x: [200, 300, 400, 500, 600, 700, 800, 900, 1000],
            y: [225, 215, 210, 245, 230, 230, 200, 185, 190],
          },
          {
            name: "Data E",
            color: "#FFD700",
            x: [200, 300, 400, 500, 600, 700, 800, 900, 1000],
            y: [245, 260, 235, 265, 250, 250, 220, 220, 225],
          },
          {
            name: "Data F",
            color: "#800080",
            x: [200, 300, 400, 500, 600, 700, 800, 900, 1000],
            y: [275, 295, 270, 285, 300, 300, 250, 255, 260],
          },
        ]}
      />
    ),
  },
};
