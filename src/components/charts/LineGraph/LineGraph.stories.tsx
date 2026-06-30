import { expect, waitFor, within } from "storybook/test";


import { LineGraph } from "./LineGraph";

import type { LineDataSeries } from "./LineGraph";
import type { Meta, StoryObj } from "@storybook/react-vite";

const generateBasicDemoData = (): LineDataSeries[] => {
  const x = [200, 300, 400, 500, 600, 700, 800, 900, 1000];

  return [
    {
      name: "Data A",
      x,
      y: [75, 140, 105, 120, 145, 115, 110, 80, 90],
    },
    {
      name: "Data B",
      x,
      y: [125, 160, 115, 145, 190, 180, 120, 105, 110],
    },
    {
      name: "Data C",
      x,
      y: [185, 195, 145, 215, 205, 200, 160, 145, 135],
    },
    {
      name: "Data D",
      x,
      y: [225, 215, 210, 245, 230, 230, 200, 185, 190],
    },
    {
      name: "Data E",
      x,
      y: [245, 260, 235, 265, 250, 250, 220, 220, 225],
    },
    {
      name: "Data F",
      x,
      y: [275, 295, 270, 285, 300, 300, 250, 255, 260],
    },
  ];
};

const generateDataStartingFromZero = (): LineDataSeries[] => {
  const x = [0, 125, 250, 375, 500, 625, 750, 875, 1000];

  const rand = (min: number, max: number) => Math.round(Math.random() * (max - min) + min);

  return [
    {
      name: "Data A",
      symbol: "circle",
      x,
      y: [
        0,
        rand(40, 80),
        rand(90, 120),
        rand(110, 140),
        rand(130, 160),
        rand(110, 140),
        rand(100, 130),
        rand(70, 100),
        rand(80, 110),
      ],
    },
    {
      name: "Data B",
      symbol: "square",
      x,
      y: [
        rand(20, 60),
        rand(80, 120),
        rand(110, 140),
        rand(130, 170),
        rand(170, 200),
        rand(160, 190),
        rand(110, 140),
        rand(90, 120),
        rand(100, 130),
      ],
    },
    {
      name: "Data C",
      symbol: "diamond",
      x,
      y: [
        0,
        rand(70, 110),
        rand(120, 160),
        rand(180, 230),
        rand(170, 220),
        rand(170, 220),
        rand(130, 180),
        rand(120, 170),
        rand(110, 160),
      ],
    },
    {
      name: "Data D",
      symbol: "triangle-up",
      x,
      y: [
        rand(30, 80),
        rand(100, 150),
        rand(150, 200),
        rand(220, 270),
        rand(200, 250),
        rand(200, 250),
        rand(170, 220),
        rand(150, 200),
        rand(160, 210),
      ],
    },
    {
      name: "Data E",
      symbol: "triangle-down",
      x,
      y: [
        0,
        rand(120, 160),
        rand(170, 210),
        rand(240, 280),
        rand(220, 260),
        rand(220, 260),
        rand(190, 230),
        rand(190, 230),
        rand(200, 240),
      ],
    },
    {
      name: "Data F",
      symbol: "pentagon",
      x,
      y: [
        rand(50, 100),
        rand(140, 180),
        rand(190, 230),
        rand(260, 300),
        rand(270, 310),
        rand(270, 310),
        rand(220, 260),
        rand(230, 270),
        rand(240, 280),
      ],
    },
  ];
};

const generateWideRangeData = (): LineDataSeries[] => {
  const x = [50, 200, 350, 500, 650, 800, 950, 1100, 1250];

  return [
    {
      name: "Data A",
      symbol: "circle",
      x,
      y: [20, 35, 30, 45, 25, 40, 30, 20, 25],
    },
    {
      name: "Data B",
      symbol: "square",
      x,
      y: [120, 140, 130, 145, 160, 150, 135, 125, 155],
    },
    {
      name: "Data C",
      symbol: "diamond",
      x,
      y: [320, 360, 340, 380, 350, 370, 330, 345, 355],
    },
  ];
};

const generateNarrowRangeData = (): LineDataSeries[] => {
  const x = [400, 425, 450, 475, 500, 525, 550, 575, 600];

  return [
    {
      name: "Data A",
      symbol: "circle",
      x,
      y: [160, 158, 165, 162, 170, 168, 172, 165, 175],
    },
    {
      name: "Data B",
      symbol: "square",
      x,
      y: [180, 182, 178, 185, 183, 188, 186, 184, 190],
    },
    {
      name: "Data C",
      symbol: "diamond",
      x,
      y: [200, 198, 204, 202, 208, 205, 210, 207, 212],
    },
  ];
};

const generateDemoData = (): LineDataSeries[] => {
  const x = [200, 300, 400, 500, 600, 700, 800, 900, 1000];

  return [
    {
      name: "Data A",
      symbol: "circle",
      x,
      y: [75, 140, 105, 120, 145, 115, 110, 80, 90],
    },
    {
      name: "Data B",
      symbol: "square",
      x,
      y: [125, 160, 115, 145, 190, 180, 120, 105, 110],
    },
    {
      name: "Data C",
      symbol: "diamond",
      x,
      y: [185, 195, 145, 215, 205, 200, 160, 145, 135],
    },
    {
      name: "Data D",
      symbol: "triangle-up",
      x,
      y: [225, 215, 210, 245, 230, 230, 200, 185, 190],
    },
    {
      name: "Data E",
      symbol: "triangle-down",
      x,
      y: [245, 260, 235, 265, 250, 250, 220, 220, 225],
    },
    {
      name: "Data F",
      symbol: "pentagon",
      x,
      y: [275, 295, 270, 285, 300, 300, 250, 255, 260],
    },
  ];
};

const generateDemoDataWithErrorBars = (): LineDataSeries[] => {
  const baseSeries = generateDemoData();

  return baseSeries.map((series) => ({
    ...series,
    error_y: {
      type: "data",
      array: series.y.map(() => 10),
      visible: true,
    },
  }));
};

const generateWeekdayData = (): LineDataSeries[] => {
  // x positions are integer indices; xTickText supplies the day labels
  const x = [0, 1, 2, 3, 4, 5, 6];

  return [
    {
      name: "Instrument A",
      symbol: "circle",
      x,
      y: [12, 18, 15, 22, 19, 8, 5],
    },
    {
      name: "Instrument B",
      symbol: "square",
      x,
      y: [20, 24, 21, 28, 26, 14, 10],
    },
  ];
};

const meta: Meta<typeof LineGraph> = {
  title: "Charts/Line Graph",
  component: LineGraph,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LineGraph>;

export const Basic: Story = {
  name: "Basic",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T998" },
  },
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateBasicDemoData(),
    title: "Basic Line Graph",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Basic Line Graph")).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });

    await step("6 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(6);
    });

    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data F")).toBeInTheDocument();
    });
  },
};

export const CategoricalXLabels: Story = {
  name: "Categorical X Labels",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T5460" },
    docs: {
      description: {
        story:
          "Use `xTickText` to display categorical x-axis labels (e.g. days of the week). The numeric `x` values still drive line positioning, but the rendered tick labels match `xTickText` in order.",
      },
    },
  },
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateWeekdayData(),
    xTickText: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    variant: "lines+markers",
    title: "Runs per Weekday",
    xTitle: "Day",
    yTitle: "Runs",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Runs per Weekday")).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });

    await step("X-axis ticks show categorical labels, not integers", async () => {
      const tickLabels = [
        ...canvasElement.querySelectorAll(".xtick text"),
      ].map((node) => node.textContent);
      expect(tickLabels).toEqual([
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun",
      ]);
    });

    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Instrument A")).toBeInTheDocument();
      expect(canvas.getByText("Instrument B")).toBeInTheDocument();
    });
  },
};

export const WithMarkers: Story = {
  name: "With Markers",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T999" },
  },
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateDataStartingFromZero(),
    variant: "lines+markers",
    title: "Line Graph with Markers",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Line Graph with Markers")).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });

    await step("6 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(6);
    });

    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data F")).toBeInTheDocument();
    });
  },
};

export const WithErrorBars: Story = {
  name: "With Error Bars",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T1000" },
  },
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateDemoDataWithErrorBars(),
    variant: "lines+markers+error_bars",
    title: "Line Graph with Error Bars",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Line Graph with Error Bars")).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });

    await step("6 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(6);
    });

    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data F")).toBeInTheDocument();
    });
  },
};

export const WideRange: Story = {
  name: "Wide Range",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T1001" },
  },
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateWideRangeData(),
    variant: "lines+markers",
    title: "Wide Range Data Graph",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Wide Range Data Graph")).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });

    await step("3 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(3);
    });

    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data B")).toBeInTheDocument();
      expect(canvas.getByText("Data C")).toBeInTheDocument();
    });
  },
};

export const NarrowRange: Story = {
  name: "Narrow Range",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T1002" },
  },
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateNarrowRangeData(),
    variant: "lines+markers",
    title: "Narrow Range Data Graph",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Narrow Range Data Graph")).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });

    await step("3 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(3);
    });

    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data B")).toBeInTheDocument();
      expect(canvas.getByText("Data C")).toBeInTheDocument();
    });
  },
};

export const CustomAxes: Story = {
  name: "Custom Axes",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T1003" },
  },
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateBasicDemoData(),
    xTitle: "Time (s)",
    yTitle: "Temperature (°C)",
    title: "Temperature Over Time",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Temperature Over Time")).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });

    await step("6 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(6);
    });

    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("Time (s)")).toBeInTheDocument();
      expect(canvas.getByText("Temperature (°C)")).toBeInTheDocument();
    });

    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data F")).toBeInTheDocument();
    });
  },
};

export const CustomRange: Story = {
  name: "Custom Range",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T1004" },
  },
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateBasicDemoData(),
    xRange: [300, 800],
    yRange: [100, 300],
    title: "Custom Range Graph",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Custom Range Graph")).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });

    await step("6 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(6);
    });

    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data F")).toBeInTheDocument();
    });
  },
};

export const AutoRangeLineGraph: Story = {
  name: "Auto Range Line Graph",
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateDemoData(),
    variant: "lines+markers",
    title: "Line Graph",
    xTitle: "Columns",
    yTitle: "Rows",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Line Graph")).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });

    await step("6 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(6);
    });

    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("Columns")).toBeInTheDocument();
      expect(canvas.getByText("Rows")).toBeInTheDocument();
    });

    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data F")).toBeInTheDocument();
    });
  },
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T1005" },
    docs: {
      description: {
        story:
          "This story demonstrates how the LineGraph automatically calculates appropriate ranges when none are provided.",
      },
    },
  },
};

export const WideRangeAutoScaled: Story = {
  name: "Wide Range Auto Scaled",
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateWideRangeData(),
    variant: "lines+markers",
    title: "Line Graph",
    xTitle: "Columns",
    yTitle: "Rows",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Line Graph")).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });

    await step("3 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(3);
    });

    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("Columns")).toBeInTheDocument();
      expect(canvas.getByText("Rows")).toBeInTheDocument();
    });

    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data C")).toBeInTheDocument();
    });
  },
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T1006" },
    docs: {
      description: {
        story: "A graph with a wider data range, demonstrating how the LineGraph adapts its scales automatically.",
      },
    },
  },
};

export const NarrowRangeAutoScaled: Story = {
  name: "Narrow Range Auto Scaled",
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateNarrowRangeData(),
    variant: "lines+markers",
    title: "Line Graph",
    xTitle: "Columns",
    yTitle: "Rows",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Line Graph")).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });

    await step("3 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(3);
    });

    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("Columns")).toBeInTheDocument();
      expect(canvas.getByText("Rows")).toBeInTheDocument();
    });

    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data C")).toBeInTheDocument();
    });
  },
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T1007" },
    docs: {
      description: {
        story: "A graph with a narrower data range, showing how the LineGraph adapts to focused data.",
      },
    },
  },
};

export const OnlyXRangeProvided: Story = {
  name: "Only X Range Provided",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T1008" },
    docs: {
      description: {
        story:
          "In this example, only the X-axis range is provided, while the Y-axis uses autorange.",
      },
    },
  },
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateDemoData(),
    variant: "lines+markers",
    xRange: [150, 1050],
    title: "Line Graph",
    xTitle: "Columns",
    yTitle: "Rows",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Line Graph")).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });

    await step("6 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(6);
    });

    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("Columns")).toBeInTheDocument();
      expect(canvas.getByText("Rows")).toBeInTheDocument();
    });

    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data F")).toBeInTheDocument();
    });
  },
};

export const OnlyYRangeProvided: Story = {
  name: "Only Y Range Provided",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T1009" },
    docs: {
      description: {
        story:
          "In this example, only the Y-axis range is provided, while the X-axis uses autorange.",
      },
    },
  },
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateDemoData(),
    variant: "lines+markers",
    yRange: [50, 350],
    title: "Line Graph",
    xTitle: "Columns",
    yTitle: "Rows",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Line Graph")).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });

    await step("6 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(6);
    });

    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("Columns")).toBeInTheDocument();
      expect(canvas.getByText("Rows")).toBeInTheDocument();
    });

    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data F")).toBeInTheDocument();
    });
  },
};

export const LineGraphStartingFromZero: Story = {
  name: "Line Graph Starting From Zero",
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateDataStartingFromZero(),
    variant: "lines+markers",
    title: "Line Graph",
    xTitle: "Columns",
    yTitle: "Rows",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Chart title is displayed", async () => {
      expect(canvas.getByText("Line Graph")).toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });

    await step("6 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(6);
    });

    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("Columns")).toBeInTheDocument();
      expect(canvas.getByText("Rows")).toBeInTheDocument();
    });

    await step("Legend shows series names", async () => {
      expect(canvas.getByText("Data A")).toBeInTheDocument();
      expect(canvas.getByText("Data F")).toBeInTheDocument();
    });
  },
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T1010" },
    docs: {
      description: {
        story: "This graph demonstrates data that starts from 0 on both axes, with evenly distributed data points.",
      },
    },
  },
};

export const NoTitle: Story = {
  name: "No Title",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T5463" },
  },
  args: {
    width: 1000,
    height: 600,
    dataSeries: generateBasicDemoData(),
    xTitle: "Columns",
    yTitle: "Rows",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("No title block is rendered", async () => {
      expect(canvasElement.querySelector(".gtitle")).not.toBeInTheDocument();
      expect(canvas.queryByText("Line Graph")).not.toBeInTheDocument();
    });

    await step("Chart container renders", async () => {
      expect(canvasElement.querySelector(".js-plotly-plot")).toBeInTheDocument();
    });

    await step("6 traces are rendered", async () => {
      expect(canvasElement.querySelectorAll(".scatterlayer .trace").length).toBe(6);
    });

    await step("Axis titles are displayed", async () => {
      expect(canvas.getByText("Columns")).toBeInTheDocument();
      expect(canvas.getByText("Rows")).toBeInTheDocument();
    });
  },
};

export const ContainerFilled: Story = {
  name: "Container Filled (responsive)",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T5476" },
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Omit `width`/`height` and the chart fills its container, tracking size via a `ResizeObserver`. Wrapped here in an `h-80 w-full` box.",
      },
    },
  },
  args: {
    dataSeries: generateBasicDemoData(),
    title: "Fills its container",
    variant: "lines+markers",
  },
  decorators: [
    (Story) => (
      <div data-testid="fill-wrapper" className="h-80 w-full">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement, step }) => {
    await step("Chart canvas fills the container width", async () => {
      const wrapper = canvasElement.querySelector(
        '[data-testid="fill-wrapper"]',
      ) as HTMLElement;
      await waitFor(() => {
        const plot = canvasElement.querySelector(".js-plotly-plot") as HTMLElement;
        expect(plot).toBeInTheDocument();
        expect(plot.clientWidth).toBeGreaterThanOrEqual(wrapper.clientWidth - 2);
      });
    });

    await step("Chart resizes in place when the container resizes", async () => {
      const wrapper = canvasElement.querySelector(
        '[data-testid="fill-wrapper"]',
      ) as HTMLElement;
      // Shrink the container; the ResizeObserver should drive a Plotly relayout
      // (not a full re-plot) so the canvas tracks the new width.
      wrapper.style.width = "440px";
      await waitFor(() => {
        const plot = canvasElement.querySelector(".js-plotly-plot") as HTMLElement;
        expect(plot.clientWidth).toBeGreaterThanOrEqual(420);
        expect(plot.clientWidth).toBeLessThanOrEqual(460);
      });
    });
  },
};

const lineRegressionData: LineDataSeries[] = [
  { name: "Run 1", x: [0, 1, 2, 3, 4, 5], y: [10, 18, 14, 22, 19, 25] },
  { name: "Run 2", x: [0, 1, 2, 3, 4, 5], y: [8, 12, 17, 15, 21, 23] },
  { name: "Run 3", x: [0, 1, 2, 3, 4, 5], y: [13, 15, 12, 19, 17, 22] },
];

export const SmallSizeLegendRegression: Story = {
  name: "Small Size — Legend vs Ticks",
  parameters: {
    // Auto-generated by sync-storybook-zephyr - do not add manually
    zephyr: { testCaseId: "SW-T5477" },
    docs: {
      description: {
        story:
          "At a small size with a bottom legend and `xTickText`, the legend sits below the x-axis tick labels rather than overlapping them.",
      },
    },
  },
  args: {
    dataSeries: lineRegressionData,
    xTickText: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    xTitle: "Month",
    yTitle: "Value",
    width: 310,
    height: 200,
    variant: "lines+markers",
  },
  play: async ({ canvasElement, step }) => {
    await step("Legend sits below the x-axis tick labels (no overlap)", async () => {
      await waitFor(() => {
        const ticks = [
          ...canvasElement.querySelectorAll<SVGTextElement>(".xtick text"),
        ];
        const legendItems = [
          ...canvasElement.querySelectorAll<SVGTextElement>(".legend .legendtext"),
        ];
        expect(ticks.length).toBeGreaterThan(0);
        expect(legendItems.length).toBeGreaterThan(0);
        const tickBottom = Math.max(
          ...ticks.map((node) => node.getBoundingClientRect().bottom),
        );
        const legendTop = Math.min(
          ...legendItems.map((node) => node.getBoundingClientRect().top),
        );
        expect(legendTop).toBeGreaterThanOrEqual(tickBottom - 2);
      });
    });
  },
};
