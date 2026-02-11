import type { Preview } from "@storybook/react-vite";
import "../src/colors.css";
import "./font.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    // Use fullscreen layout for video recording - removes padding
    layout: "fullscreen",
  },
};

export default preview;
