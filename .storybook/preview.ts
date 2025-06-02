import type { Preview } from "@storybook/react";
import "../src/styles/global.less";
import "./font.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
