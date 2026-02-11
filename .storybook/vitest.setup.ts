import { beforeAll, beforeEach, afterEach, expect } from "vitest";
import { setProjectAnnotations } from "@storybook/react";
import { page } from "@vitest/browser/context";
import * as previewAnnotations from "./preview";

const annotations = setProjectAnnotations([previewAnnotations]);

// Run Storybook's beforeAll hook
beforeAll(annotations.beforeAll);

// Fail tests on ALL console warnings and errors
const originalWarn = console.warn;
const originalError = console.error;

let warnings: string[] = [];
let errors: string[] = [];

// Pattern to extract Zephyr IDs from test names: [SW-T123] or [SW-T100,SW-T101]
const ZEPHYR_ID_PATTERN = /\[([A-Z]+-T\d+(?:,[A-Z]+-T\d+)*)\]/;

beforeEach(() => {
  warnings = [];
  errors = [];

  console.warn = (...args: unknown[]) => {
    const message = args.map((arg) => String(arg)).join(" ");
    warnings.push(message);
    originalWarn.apply(console, args);
  };

  console.error = (...args: unknown[]) => {
    // Ignore null errors from Monaco Editor (known issue in CI)
    // Monaco Editor occasionally logs null during initialization in headless browsers
    // See: https://github.com/microsoft/monaco-editor/issues/2810
    if (args.length === 1 && args[0] === null) {
      // Check if this error is coming from Monaco by inspecting the stack trace
      const stack = new Error().stack || "";
      const isFromMonaco = stack.includes("monaco") || stack.includes("MonacoEditor");

      if (isFromMonaco) {
        // Still log it to console, just don't fail the test
        originalError.apply(console, args);
        return;
      }
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
  const testName = task.name;
  const match = testName.match(ZEPHYR_ID_PATTERN);

  if (match) {
    // Extract all Zephyr IDs (handles comma-separated IDs like [SW-T100,SW-T101])
    const zephyrIds = match[1].split(",").map((id) => id.trim());

    // Take screenshot for each Zephyr ID
    for (const zephyrId of zephyrIds) {
      try {
        // page.screenshot() path is relative to the test file location
        // Stories are at src/components/*/*/*.stories.tsx (4 levels deep from root)
        await page.screenshot({
          path: `../../../../test-results/screenshots/${zephyrId}.png`,
        });
      } catch (_error) {
        // Don't fail the test if screenshot fails - silently continue
        // Screenshots may fail in some environments
      }
    }
  }

  if (warnings.length > 0) {
    expect.fail(`Test produced console warnings:\n${warnings.map((w) => `  - ${w}`).join("\n")}`);
  }

  if (errors.length > 0) {
    expect.fail(`Test produced console errors:\n${errors.map((e) => `  - ${e}`).join("\n")}`);
  }
});
