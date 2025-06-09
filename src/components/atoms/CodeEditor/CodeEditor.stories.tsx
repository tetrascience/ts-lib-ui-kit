import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { CodeEditor } from "./CodeEditor";

const meta: Meta<typeof CodeEditor> = {
  title: "Atoms/CodeEditor",
  component: CodeEditor,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    language: {
      control: { type: "select" },
      options: ["python", "javascript", "json", "markdown"],
    },
    theme: {
      control: { type: "select" },
      options: ["dark", "light"],
    },
    height: {
      control: { type: "number" },
    },
    width: {
      control: { type: "text" },
    },
    label: {
      control: { type: "text" },
    },
    onChange: { action: "changed" },
    onCopy: { action: "copied" },
    onLaunch: { action: "launched" },
  },
};

export default meta;

type Story = StoryObj<typeof CodeEditor>;

const defaultHandlers = {
  onCopy: (code: string) => {
    navigator.clipboard.writeText(code);
    console.log("Code copied to clipboard");
  },
  onLaunch: (code: string) => {
    console.log("Launching code:", code);
  },
};

export const Default: Story = {
  args: {
    value: "print('Hello, world!')",
    language: "python",
    theme: "dark",
    height: 400,
    width: "400px",
    label: "Description",
    ...defaultHandlers,
  },
};

export const LightMode: Story = {
  args: {
    value: "console.log('Hello, world!')",
    language: "javascript",
    height: 400,
    width: "400px",
    label: "Description",
    theme: "light",
    ...defaultHandlers,
  },
};

export const ReactJavascriptExample: Story = {
  args: {
    value: `import React, { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);
  
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

export default Counter;`,
    language: "javascript",
    height: 400,
    width: "600px",
    label: "React Counter Component",
    theme: "dark",
    ...defaultHandlers,
  },
};

const InteractiveComponent = (
  args: React.ComponentProps<typeof CodeEditor>
) => {
  const [value, setValue] = React.useState(args.value);
  return (
    <CodeEditor
      {...args}
      value={value}
      onChange={(v) => setValue(v ?? "")}
      onCopy={args.onCopy || defaultHandlers.onCopy}
      onLaunch={args.onLaunch || defaultHandlers.onLaunch}
    />
  );
};

export const Interactive: Story = {
  render: (args) => <InteractiveComponent {...args} />,
  args: {
    value: "print('Hello, world!')",
    language: "python",
    height: 400,
    width: "400px",
    label: "Description",
  },
};
