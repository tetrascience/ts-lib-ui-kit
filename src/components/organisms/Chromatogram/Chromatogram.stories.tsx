import { Meta, StoryObj } from "@storybook/react";
import { Chromatogram } from "./Chromatogram";

const meta: Meta<typeof Chromatogram> = {
  title: "Organisms/Chromatogram",
  component: Chromatogram,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Chromatogram>;

const dnaSequenceData = [
  { position: 269, peakA: 10, peakT: 10, peakG: 10, peakC: 10 },
  { position: 270, peakA: 10, peakT: 10, peakG: 10, peakC: 50 },
  { position: 271, peakA: 10, peakT: 10, peakG: 10, peakC: 10 },
  { position: 272, peakA: 15, peakT: 70, peakG: 10, peakC: 10 },
  { position: 273, peakA: 10, peakT: 10, peakG: 10, peakC: 10 },
  { position: 274, peakA: 10, peakT: 45, peakG: 15, peakC: 10 },
  { position: 275, peakA: 10, peakT: 10, peakG: 10, peakC: 10 },
  { position: 276, peakA: 10, peakT: 10, peakG: 10, peakC: 40 },
  { position: 277, peakA: 10, peakT: 10, peakG: 10, peakC: 10 },
  { position: 278, peakA: 10, peakT: 10, peakG: 10, peakC: 60 },
  { position: 279, peakA: 10, peakT: 10, peakG: 10, peakC: 10 },
  { position: 280, peakA: 10, peakT: 10, peakG: 10, peakC: 35 },
  { position: 281, peakA: 10, peakT: 10, peakG: 10, peakC: 10 },
  { position: 282, peakA: 10, peakT: 10, peakG: 10, peakC: 40 },
  { position: 283, peakA: 10, peakT: 10, peakG: 10, peakC: 10 },
  { position: 284, peakA: 10, peakT: 10, peakG: 50, peakC: 10 },
  { position: 285, peakA: 10, peakT: 10, peakG: 10, peakC: 10 },
  { position: 286, peakA: 10, peakT: 10, peakG: 45, peakC: 10 },
  { position: 287, peakA: 10, peakT: 10, peakG: 10, peakC: 10 },
  { position: 288, peakA: 10, peakT: 10, peakG: 40, peakC: 10 },
  { position: 289, peakA: 10, peakT: 10, peakG: 10, peakC: 10 },
  { position: 290, peakA: 10, peakT: 30, peakG: 10, peakC: 10 },
  { position: 291, peakA: 10, peakT: 10, peakG: 10, peakC: 10 },
  { position: 292, peakA: 10, peakT: 40, peakG: 10, peakC: 10 },
  { position: 293, peakA: 10, peakT: 10, peakG: 10, peakC: 10 },
  { position: 294, peakA: 10, peakT: 10, peakG: 60, peakC: 10 },
  { position: 295, peakA: 10, peakT: 10, peakG: 10, peakC: 10 },
  { position: 296, peakA: 10, peakT: 10, peakG: 10, peakC: 50 },
  { position: 297, peakA: 10, peakT: 10, peakG: 10, peakC: 10 },
  { position: 298, peakA: 60, peakT: 10, peakG: 10, peakC: 10 },
  { position: 299, peakA: 10, peakT: 10, peakG: 10, peakC: 10 },
  { position: 300, peakA: 10, peakT: 10, peakG: 10, peakC: 75 },
  { position: 301, peakA: 10, peakT: 10, peakG: 10, peakC: 10 },
  { position: 302, peakA: 10, peakT: 10, peakG: 10, peakC: 65 },
  { position: 303, peakA: 10, peakT: 10, peakG: 10, peakC: 10 },
  { position: 304, peakA: 70, peakT: 10, peakG: 10, peakC: 10 },
  { position: 305, peakA: 10, peakT: 10, peakG: 10, peakC: 10 },
];

const dnaWithExplicitBases = [
  { position: 269, base: "C", peakA: 10, peakT: 10, peakG: 10, peakC: 10 },
  { position: 270, base: "C", peakA: 60, peakT: 10, peakG: 10, peakC: 10 },
  { position: 271, base: "T", peakA: 10, peakT: 10, peakG: 50, peakC: 10 },
  { position: 272, peakA: 15, peakT: 70, peakG: 10, peakC: 10 },
];

export const MockupMatch: Story = {
  args: {
    data: dnaSequenceData,
    width: 650,
    height: 250,
  },
};

export const WithExplicitBases: Story = {
  args: {
    data: dnaWithExplicitBases,
    width: 350,
    height: 250,
  },
};

export const CustomColors: Story = {
  args: {
    data: dnaSequenceData,
    width: 900,
    height: 450,
    colorA: "#8B5CF6",
    colorT: "#EF4444",
    colorG: "#F97316",
    colorC: "#3B82F6",
  },
};
