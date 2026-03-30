import { Project } from 'ts-morph';
import { describe, it, expect } from 'vitest';

import {
  parseStoryFile,
  parsePlayFunctionSteps,
  detectStoryPattern,
  extractNameFromStory,
  extractZephyrIdsFromParameters,
  findStoryNameAssignment,
} from '../sync-storybook-zephyr';

// Helper to get a variable declaration from code
function getDeclaration(code: string, name: string) {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('temp.tsx', code);
  return sourceFile.getVariableDeclaration(name);
}

describe('sync-storybook-zephyr', () => {
  describe('detectStoryPattern', () => {
    it('should detect CSF3 object pattern with Story type', () => {
      const decl = getDeclaration(
        `import { Story } from "@storybook/react";
         export const Primary: Story = { args: { label: "Click me" } };`,
        'Primary',
      );
      expect(detectStoryPattern(decl!)).toBe('csf3-object');
    });

    it('should detect CSF3 object pattern with StoryObj type', () => {
      const decl = getDeclaration(
        `import { StoryObj } from "@storybook/react";
         export const Primary: StoryObj<typeof Button> = { args: {} };`,
        'Primary',
      );
      expect(detectStoryPattern(decl!)).toBe('csf3-object');
    });

    it('should detect CSF2 Template.bind pattern', () => {
      const decl = getDeclaration(
        `const Template = (args) => <Button {...args} />;
         export const Primary = Template.bind({});`,
        'Primary',
      );
      expect(detectStoryPattern(decl!)).toBe('csf2-template-bind');
    });

    it('should detect React.FC pattern', () => {
      const decl = getDeclaration(
        `import React from "react";
         export const Primary: React.FC = () => <Button />;`,
        'Primary',
      );
      expect(detectStoryPattern(decl!)).toBe('react-fc');
    });

    it('should detect arrow function pattern', () => {
      const decl = getDeclaration(`export const Primary = () => <Button label="Click" />;`, 'Primary');
      expect(detectStoryPattern(decl!)).toBe('arrow-function');
    });

    it('should return unknown for unsupported patterns', () => {
      const decl = getDeclaration(`export const someValue = "not a story";`, 'someValue');
      expect(detectStoryPattern(decl!)).toBe('unknown');
    });
  });

  describe('extractNameFromStory', () => {
    it('should extract name from story object', () => {
      const decl = getDeclaration(`export const Primary: Story = { name: "Primary Button", args: {} };`, 'Primary');
      expect(extractNameFromStory(decl!)).toBe('Primary Button');
    });

    it('should return undefined when no name property', () => {
      const decl = getDeclaration(`export const Primary: Story = { args: {} };`, 'Primary');
      expect(extractNameFromStory(decl!)).toBeUndefined();
    });

    it('should return undefined for non-object initializers', () => {
      const decl = getDeclaration(`export const Primary = Template.bind({});`, 'Primary');
      expect(extractNameFromStory(decl!)).toBeUndefined();
    });
  });

  describe('findStoryNameAssignment', () => {
    it('should find storyName assignment', () => {
      const code = `export const Primary = Template.bind({});
Primary.storyName = "Custom Name";`;
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile('temp.tsx', code);
      const decl = sourceFile.getVariableDeclaration('Primary');
      expect(findStoryNameAssignment(decl!)).toBe('Custom Name');
    });

    it('should return undefined when no storyName assignment', () => {
      const code = `export const Primary = Template.bind({});
Primary.args = { label: "Click" };`;
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile('temp.tsx', code);
      const decl = sourceFile.getVariableDeclaration('Primary');
      expect(findStoryNameAssignment(decl!)).toBeUndefined();
    });
  });

  describe('parseStoryFile', () => {
    it('should parse a CSF3 story file', () => {
      const content = `import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { label: "Primary" },
};

export const Secondary: Story = {
  args: { label: "Secondary" },
};`;

      const stories = parseStoryFile('src/components/atoms/Button.stories.tsx', content);
      expect(stories).toHaveLength(2);
      expect(stories[0].exportName).toBe('Primary');
      expect(stories[0].pattern).toBe('csf3-object');
      expect(stories[0].componentName).toBe('Button');
      expect(stories[1].exportName).toBe('Secondary');
    });

    it('should detect existing Zephyr IDs in story names', () => {
      const content = `import type { Meta, StoryObj } from "@storybook/react";

export default { title: "UI/Input" };
type Story = StoryObj;

export const Default: Story = {
  name: "[SW-T123] Default Input",
  args: {},
};`;

      const stories = parseStoryFile('src/components/atoms/Input.stories.tsx', content);
      expect(stories).toHaveLength(1);
      expect(stories[0].hasZephyrId).toBe(true);
      expect(stories[0].existingId).toBe('SW-T123');
      expect(stories[0].storyName).toBe('Default Input');
    });

    it('should detect stories with empty testCaseId in parameters', () => {
      const content = `import type { Meta, StoryObj } from "@storybook/react";

export default { title: "UI/Input" };
type Story = StoryObj;

export const Default: Story = {
  args: {},
  parameters: {
    zephyr: { testCaseId: "" },
  },
};`;

      const stories = parseStoryFile('src/components/atoms/Input.stories.tsx', content);
      expect(stories).toHaveLength(1);
      expect(stories[0].hasZephyrId).toBe(false);
      expect(stories[0].hasEmptyZephyrProperty).toBe(true);
    });

    it('should detect stories with valid testCaseId in parameters', () => {
      const content = `import type { Meta, StoryObj } from "@storybook/react";

export default { title: "UI/Button" };
type Story = StoryObj;

export const Primary: Story = {
  args: {},
  parameters: {
    zephyr: { testCaseId: "SW-T456" },
  },
};`;

      const stories = parseStoryFile('src/components/atoms/Button.stories.tsx', content);
      expect(stories).toHaveLength(1);
      expect(stories[0].hasZephyrId).toBe(true);
      expect(stories[0].existingId).toBe('SW-T456');
      expect(stories[0].hasEmptyZephyrProperty).toBe(false);
    });
  });

  describe('parsePlayFunctionSteps', () => {
    it('should extract step names from a play function with multiple steps', () => {
      const decl = getDeclaration(
        `export const MyStory: Story = {
          args: {},
          play: async ({ canvasElement, step }) => {
            await step("Chart title is displayed", async () => {
              expect(true).toBe(true);
            });
            await step("Chart container renders", async () => {
              expect(true).toBe(true);
            });
            await step("Trace is rendered", async () => {
              expect(true).toBe(true);
            });
          },
        };`,
        'MyStory',
      );
      const steps = parsePlayFunctionSteps(decl!);
      expect(steps).toHaveLength(3);
      expect(steps[0].description).toBe('Chart title is displayed');
      expect(steps[1].description).toBe('Chart container renders');
      expect(steps[2].description).toBe('Trace is rendered');
      expect(steps[0].testData).toBe('');
      expect(steps[0].expectedResult).toBe('Step executed successfully');
    });

    it('should return empty array for a story without play function', () => {
      const decl = getDeclaration(
        `export const MyStory: Story = {
          args: { label: "Click me" },
        };`,
        'MyStory',
      );
      const steps = parsePlayFunctionSteps(decl!);
      expect(steps).toHaveLength(0);
    });

    it('should return empty array for a play function without step() calls', () => {
      const decl = getDeclaration(
        `export const MyStory: Story = {
          args: {},
          play: async ({ canvasElement }) => {
            const canvas = within(canvasElement);
            expect(canvas.getByText("Hello")).toBeInTheDocument();
          },
        };`,
        'MyStory',
      );
      const steps = parsePlayFunctionSteps(decl!);
      expect(steps).toHaveLength(0);
    });

    it('should return empty array for non-object initializers', () => {
      const decl = getDeclaration(`export const MyStory = Template.bind({});`, 'MyStory');
      const steps = parsePlayFunctionSteps(decl!);
      expect(steps).toHaveLength(0);
    });

    it('should handle step names with single quotes', () => {
      const decl = getDeclaration(
        `export const MyStory: Story = {
          play: async ({ step }) => {
            await step('Single quoted step', async () => {});
          },
        };`,
        'MyStory',
      );
      const steps = parsePlayFunctionSteps(decl!);
      expect(steps).toHaveLength(1);
      expect(steps[0].description).toBe('Single quoted step');
    });
  });

  describe('parseStoryFile - steps integration', () => {
    it('should populate steps on StoryCase for stories with play+step()', () => {
      const content = `import type { Meta, StoryObj } from "@storybook/react";

export default { title: "Charts/MyChart" };
type Story = StoryObj;

export const Default: Story = {
  args: {},
  play: async ({ canvasElement, step }) => {
    await step("Title renders", async () => {
      expect(true).toBe(true);
    });
    await step("Data loads", async () => {
      expect(true).toBe(true);
    });
  },
};`;

      const stories = parseStoryFile('src/components/charts/MyChart.stories.tsx', content);
      expect(stories).toHaveLength(1);
      expect(stories[0].steps).toHaveLength(2);
      expect(stories[0].steps[0].description).toBe('Title renders');
      expect(stories[0].steps[1].description).toBe('Data loads');
    });

    it('should leave steps empty for stories without play functions', () => {
      const content = `import type { Meta, StoryObj } from "@storybook/react";

export default { title: "UI/Button" };
type Story = StoryObj;

export const Primary: Story = {
  args: { label: "Click" },
};`;

      const stories = parseStoryFile('src/components/ui/Button.stories.tsx', content);
      expect(stories).toHaveLength(1);
      expect(stories[0].steps).toHaveLength(0);
    });
  });

  describe('extractZephyrIdsFromParameters', () => {
    it('should return hasZephyrProperty=true with empty ids for empty testCaseId', () => {
      const decl = getDeclaration(
        `export const Default: Story = {
          args: {},
          parameters: {
            zephyr: { testCaseId: "" },
          },
        };`,
        'Default',
      );
      const result = extractZephyrIdsFromParameters(decl!);
      expect(result.hasZephyrProperty).toBe(true);
      expect(result.ids).toEqual([]);
    });

    it('should return hasZephyrProperty=true with ids for valid testCaseId', () => {
      const decl = getDeclaration(
        `export const Default: Story = {
          args: {},
          parameters: {
            zephyr: { testCaseId: "SW-T789" },
          },
        };`,
        'Default',
      );
      const result = extractZephyrIdsFromParameters(decl!);
      expect(result.hasZephyrProperty).toBe(true);
      expect(result.ids).toEqual(['SW-T789']);
    });

    it('should return hasZephyrProperty=false when no zephyr property exists', () => {
      const decl = getDeclaration(
        `export const Default: Story = {
          args: {},
          parameters: {
            docs: { story: "A story" },
          },
        };`,
        'Default',
      );
      const result = extractZephyrIdsFromParameters(decl!);
      expect(result.hasZephyrProperty).toBe(false);
      expect(result.ids).toEqual([]);
    });

    it('should return hasZephyrProperty=false when no parameters exist', () => {
      const decl = getDeclaration(
        `export const Default: Story = {
          args: {},
        };`,
        'Default',
      );
      const result = extractZephyrIdsFromParameters(decl!);
      expect(result.hasZephyrProperty).toBe(false);
      expect(result.ids).toEqual([]);
    });
  });
});
