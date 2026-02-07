import { beforeAll, beforeEach, afterEach, expect } from "vitest";
import { setProjectAnnotations } from "@storybook/react";
import * as previewAnnotations from "./preview";

const annotations = setProjectAnnotations([previewAnnotations]);

// Run Storybook's beforeAll hook
beforeAll(annotations.beforeAll);

// Fail tests on ALL console warnings and errors
const originalWarn = console.warn;
const originalError = console.error;

let warnings: string[] = [];
let errors: string[] = [];

beforeEach(() => {
  warnings = [];
  errors = [];

  console.warn = (...args: unknown[]) => {
    const message = args.map((arg) => String(arg)).join(" ");
    warnings.push(message);
    originalWarn.apply(console, args);
  };

  console.error = (...args: unknown[]) => {
    const message = args.map((arg) => String(arg)).join(" ");
    errors.push(message);
    originalError.apply(console, args);
  };
});

afterEach(() => {
  console.warn = originalWarn;
  console.error = originalError;

  if (warnings.length > 0) {
    expect.fail(
      `Test produced console warnings:\n${warnings.map((w) => `  - ${w}`).join("\n")}`
    );
  }

  if (errors.length > 0) {
    expect.fail(
      `Test produced console errors:\n${errors.map((e) => `  - ${e}`).join("\n")}`
    );
  }
});

