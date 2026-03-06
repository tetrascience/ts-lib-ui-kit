import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/react-vite";
import { commands, page } from "@vitest/browser/context";
import { afterEach, beforeAll, beforeEach, expect, inject } from "vitest";

import * as previewAnnotations from "./preview";

const annotations = setProjectAnnotations([a11yAddonAnnotations, previewAnnotations]);

type ZephyrMapping = Record<string, string[]>;

// Run Storybook's beforeAll hook
beforeAll(annotations.beforeAll);

// Fail tests on ALL console warnings and errors
const originalWarn = console.warn;
const originalError = console.error;

let warnings: string[] = [];
let errors: string[] = [];

// Pattern to extract Zephyr IDs from test names: [SW-T123] or [SW-T100,SW-T101]
const ZEPHYR_ID_PATTERN = /\[([A-Z]+-T\d+(?:,[A-Z]+-T\d+)*)\]/;
const SCREENSHOT_DIR = "test-results/screenshots";

function extractLegacyZephyrIds(testName: string): string[] {
  const match = testName.match(ZEPHYR_ID_PATTERN);
  return match ? match[1].split(",").map((id) => id.trim()) : [];
}

function normalizeStoryFilePath(filePath: string): string {
  const normalizedPath = filePath.replaceAll("\\", "/");
  const srcPathIndex = normalizedPath.lastIndexOf("/src/");

  if (srcPathIndex >= 0) {
    return normalizedPath.slice(srcPathIndex + 1);
  }

  return normalizedPath.replace(/^\.\//, "");
}

function toStoryKey(filePath: string, testName: string): string {
  return `${normalizeStoryFilePath(filePath)}::${testName}`;
}

function getZephyrMapping(): ZephyrMapping {
  return (inject("storybookZephyrMapping" as never) as ZephyrMapping | undefined) ?? {};
}

function getZephyrIdsForTask(task: { name: string; file?: { filepath?: string } }): string[] {
  const legacyIds = extractLegacyZephyrIds(task.name);
  const filepath = task.file?.filepath;
  if (!filepath) return legacyIds;

  const storyKey = toStoryKey(filepath, task.name);
  const mappedIds = getZephyrMapping()[storyKey] || [];

  return [...new Set([...mappedIds, ...legacyIds])];
}

beforeEach(() => {
  warnings = [];
  errors = [];

  console.warn = (...args: unknown[]) => {
    const message = args.map((arg) => String(arg)).join(" ");
    warnings.push(message);
    originalWarn.apply(console, args);
  };

  console.error = (...args: unknown[]) => {
    // Ignore bare null errors from Monaco Editor (known issue in CI).
    // Monaco Editor occasionally logs console.error(null) during initialization
    // in headless browsers, and the originating stack is not reliably preserved.
    if (args.length === 1 && args[0] === null) {
      // Still log it to console, just don't fail the test.
      originalError.apply(console, args);
      return;
    }
    const message = args.map((arg) => String(arg)).join(" ");
    errors.push(message);
    originalError.apply(console, args);
  };
});

afterEach(async ({ task }) => {
  // Restore console methods BEFORE checking for warnings/errors
  // This way screenshot errors won't cause test failures
  console.warn = originalWarn;
  console.error = originalError;

  // Capture screenshot with Zephyr ID in filename
  let zephyrIds: string[] = [];

  try {
    zephyrIds = getZephyrIdsForTask(task);
  } catch {
    zephyrIds = extractLegacyZephyrIds(task.name);
  }

  if (zephyrIds.length > 0) {
    // Take screenshot for each Zephyr ID
    for (const zephyrId of zephyrIds) {
      try {
        const screenshot = await page.screenshot({ save: false });
        await commands.writeFile(`${SCREENSHOT_DIR}/${zephyrId}.png`, screenshot, "base64");
      } catch {
        // Don't fail the test if screenshot fails - silently continue
        // Screenshots may fail in some environments
      }
    }
  }

  if (warnings.length > 0) {
    const warningList = warnings.map((w) => "  - " + w).join("\n");
    expect.fail("Test produced console warnings:\n" + warningList);
  }

  if (errors.length > 0) {
    const errorList = errors.map((e) => "  - " + e).join("\n");
    expect.fail("Test produced console errors:\n" + errorList);
  }
});
