import fs from "fs";
import os from "os";
import path from "path";

import { afterEach, describe, expect, it } from "vitest";

import { generateZephyrMapping, toStoryKey } from "../storybook-zephyr-mapping";

const tempDirs: string[] = [];

function createTempProject(storyRelativePath: string, content: string) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "storybook-zephyr-mapping-"));
  tempDirs.push(cwd);

  const storyPath = path.join(cwd, storyRelativePath);
  fs.mkdirSync(path.dirname(storyPath), { recursive: true });
  fs.writeFileSync(storyPath, content, "utf-8");

  return { cwd, storyPath };
}

afterEach(() => {
  while (tempDirs.length > 0) {
    fs.rmSync(tempDirs.pop()!, { recursive: true, force: true });
  }
});

describe("storybook-zephyr-mapping", () => {
  it("maps CSF3 stories by filepath and display name", () => {
    const { cwd, storyPath } = createTempProject(
      "src/components/atoms/Button/Button.stories.tsx",
      `import type { StoryObj } from "@storybook/react";
type Story = StoryObj;

export const ClickInteraction: Story = {
  name: "Click Interaction",
  parameters: { zephyr: { testCaseId: "SW-T743" } },
};`,
    );

    const mapping = generateZephyrMapping({ cwd });

    expect(mapping[toStoryKey(storyPath, "Click Interaction", cwd)]).toEqual(["SW-T743"]);
  });

  it("maps CSF2 stories and splits comma-separated Zephyr IDs", () => {
    const { cwd, storyPath } = createTempProject(
      "src/components/molecules/Menu/Menu.stories.tsx",
      `const Template = () => null;
export const Shared = Template.bind({});
Shared.storyName = "Shared test";
Shared.parameters = { zephyr: { testCaseId: "SW-T100, SW-T101" } };`,
    );

    const mapping = generateZephyrMapping({ cwd });

    expect(mapping[toStoryKey(storyPath, "Shared test", cwd)]).toEqual(["SW-T100", "SW-T101"]);
  });
});