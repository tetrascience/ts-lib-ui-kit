import { describe, expect, it } from "vitest";

import { auditAllStories, findViolations } from "../audit-story-sources";

/**
 * Docs "Show code" must always show component code (SW: storybook code audit).
 *
 * Storybook prints the raw story-object source — play functions, zephyr ids
 * and all — for any story it can't derive a snippet for, and stops at opaque
 * file-local wrapper components even when it can. This audit statically
 * classifies what every story's code panel will show and fails on:
 *
 * - "story-object-dump": the story source (play/zephyr noise) would print.
 *   Fix: make the render an inline zero-arity arrow (the global
 *   docs.source.transform in .storybook/preview.ts extracts its body), an
 *   args-based render, or set an explicit docs.source override.
 * - "helper-call": the snippet is just `renderFoo(...)`. Fix: set
 *   `docs: { source: { type: "dynamic" } }` so the rendered tree serializes.
 * - "local-wrapper": the snippet only shows `<SomeLocalDemo />` a consumer
 *   can't import. Fix: inline the demo into the render, convert the wrapper
 *   to a plain render helper + dynamic source, or hand-write
 *   `docs.source.code` usage (see DataAppShell / PlateMapEditor stories).
 */
describe("storybook docs source audit", () => {
  it("every story's docs code panel shows component code", () => {
    const results = auditAllStories();

    // Sanity: the audit actually saw the story corpus.
    expect(results.length).toBeGreaterThan(500);

    const violations = findViolations(results);
    const report = violations
      .map((v) => `${v.file} › ${v.exportName}: [${v.verdict}] ${v.detail}`)
      .join("\n");
    expect(violations, `\n${report}\n`).toEqual([]);
  });
});
